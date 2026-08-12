import numpy as np
from app.schemas.schemas import StartupProfileSchema, InvestorProfileSchema
from app.services.ai_service import generate_embedding, evaluate_match_reasoning

STRUCTURED_WEIGHTS = {
    'industry': 0.25,
    'stage': 0.20,
    'ticket_size': 0.20,
    'geography': 0.10,
    'business_model': 0.10,
    'technology': 0.15
}

def calculate_structured_score(startup: StartupProfileSchema, investor: InvestorProfileSchema) -> float:
    """Layer 1: Deterministic Structured Score (0 to 100)"""
    score = 0.0
    
    # Industry
    if startup.industry and investor.preferred_industries and startup.industry in investor.preferred_industries:
        score += STRUCTURED_WEIGHTS['industry']
        
    # Stage
    if startup.stage and investor.preferred_stages and startup.stage in investor.preferred_stages:
        score += STRUCTURED_WEIGHTS['stage']
        
    # Ticket Size
    if startup.funding_requirement and investor.min_ticket_size and investor.max_ticket_size:
        if investor.min_ticket_size <= startup.funding_requirement <= investor.max_ticket_size:
            score += STRUCTURED_WEIGHTS['ticket_size']
            
    # Geography
    if startup.geography and investor.preferred_geographies and startup.geography in investor.preferred_geographies:
        score += STRUCTURED_WEIGHTS['geography']
        
    # Business Model
    if startup.business_model and investor.business_model_preferences and startup.business_model in investor.business_model_preferences:
        score += STRUCTURED_WEIGHTS['business_model']
        
    # Technology
    if startup.technology and investor.technology_interests and startup.technology in investor.technology_interests:
        score += STRUCTURED_WEIGHTS['technology']
        
    return score * 100.0

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    a, b = np.array(v1), np.array(v2)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 0.0
    return float(np.dot(a, b) / norm)

def calculate_semantic_score(
    startup_desc: str | None,
    investor_thesis: str | None,
    startup_embedding: list[float] | None = None,
    investor_embedding: list[float] | None = None,
) -> float | None:
    """Layer 2: Semantic Score (0 to 100)"""
    if not startup_desc or not investor_thesis:
        return None
        
    v1 = startup_embedding if startup_embedding is not None else generate_embedding(startup_desc)
    v2 = investor_embedding if investor_embedding is not None else generate_embedding(investor_thesis)
    
    # If fallback vectors were returned due to failure
    if not any(v1) or not any(v2):
        return None
        
    sim = cosine_similarity(v1, v2)
    # Cosine sim is -1 to 1. Convert to 0-100%
    normalized = (sim + 1.0) / 2.0
    return max(0.0, min(normalized * 100.0, 100.0))

def calculate_hybrid_match(
    startup: StartupProfileSchema,
    investor: InvestorProfileSchema,
    startup_embedding: list[float] | None = None,
    investor_embedding: list[float] | None = None,
    use_llm_reasoning: bool = True,
):
    """
    Combines Layers 1, 2, and 3.
    Formula: (Structured * 0.5) + (Semantic * 0.3) + (LLM * 0.2)
    """
    # 1. Structured
    structured_score = calculate_structured_score(startup, investor)
    
    # 2. Semantic
    semantic_score = calculate_semantic_score(
        startup.description,
        investor.investment_thesis,
        startup_embedding,
        investor_embedding,
    )
    
    # 3. LLM Reasoning
    llm_output = None
    try:
        llm_output = evaluate_match_reasoning(startup, investor) if use_llm_reasoning else None
        if llm_output:
            raw_score = llm_output.reasoning_score
            llm_score = raw_score
        else:
            llm_score = None
            raw_score = None
    except Exception:
        llm_score = None
        raw_score = None
        
    # Degraded Mode Handling
    available_score = 0.0
    available_weight = 0.0
    
    # Structured is always available
    available_score += structured_score * 0.5
    available_weight += 0.5
    
    if semantic_score is not None:
        available_score += semantic_score * 0.3
        available_weight += 0.3
        
    if llm_score is not None:
        available_score += llm_score * 0.2
        available_weight += 0.2
        
    # Renormalize based on available weights
    final_score = available_score / available_weight if available_weight > 0 else 0.0
    final_score = max(0.0, min(final_score, 100.0))

    unavailable = []
    if semantic_score is None:
        unavailable.append("Semantic unavailable")
    if llm_score is None:
        unavailable.append("LLM unavailable" if use_llm_reasoning else "LLM not evaluated outside Top 3")
    explanation = (
        "Hybrid score uses structured 50%, semantic 30%, and LLM 20%."
        if not unavailable
        else f"Degraded score renormalized from available components; {', '.join(unavailable)}."
    )

    return {
        "structured_score": round(structured_score, 2),
        "semantic_score": round(semantic_score, 2) if semantic_score is not None else None,
        "llm_raw_score": round(raw_score, 2) if raw_score is not None else None,
        "llm_score": round(llm_score, 2) if llm_score is not None else None,
        "final_score": round(final_score, 2),
        "strengths": llm_output.strengths if llm_output else ["Deterministic match"],
        "risks": llm_output.risks if llm_output else [
            "AI reasoning unavailable; needs human review" if use_llm_reasoning
            else "LLM reasoning is reserved for the Top 3 candidates"
        ],
        "explanation": explanation,
    }
