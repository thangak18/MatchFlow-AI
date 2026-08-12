import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
load_dotenv()

from app.db.session import get_db
from app.db.models import Startup, Investor, InvestorProfile
from app.schemas.schemas import StartupProfileSchema, InvestorProfileSchema
from app.services.matching_service import calculate_hybrid_match

def test():
    db = next(get_db())
    startup = db.query(Startup).filter(Startup.company_name == "LogiSense AI").first()
    investor = db.query(Investor).filter(Investor.investor_name == "ABC Ventures").first()
    
    sp = StartupProfileSchema.model_validate(startup.profile)
    ip = InvestorProfileSchema.model_validate(investor.profile)
    
    print("Testing LLM normalization for LogiSense AI vs ABC Ventures...")
    result = calculate_hybrid_match(sp, ip)
    
    print(f"LLM Raw Score: {result.get('llm_raw_score')}")
    print(f"LLM Normalized Score: {result['llm_score']}")
    print(f"Structured: {result['structured_score']}")
    print(f"Semantic: {result['semantic_score']}")
    print(f"Final: {result['final_score']}")
    print(f"Hybrid Arithmetic: ({result['structured_score']} * 0.5) + ({result['semantic_score']} * 0.3) + ({result['llm_score']} * 0.2) = {result['final_score']}")
    
    print("\nExecuting actual pgvector query...")
    # Get LogiSense embedding
    startup_embedding = startup.profile.embedding
    
    # Query pgvector directly
    # Using L2 distance or Cosine distance (<=>)
    top_investors = db.query(Investor.investor_name, InvestorProfile.embedding.cosine_distance(startup_embedding).label('distance')) \
        .join(InvestorProfile, Investor.id == InvestorProfile.investor_id) \
        .filter(InvestorProfile.embedding.is_not(None)) \
        .order_by('distance') \
        .limit(5) \
        .all()
        
    print("Actual PostgreSQL pgvector query executed: YES")
    print("Top 5 pgvector results:")
    for inv_name, distance in top_investors:
        # Cosine distance to similarity percentage
        sim_pct = (1.0 - distance + 1) / 2 * 100
        print(f"{inv_name}: {sim_pct:.2f} (distance: {distance:.4f})")

if __name__ == "__main__":
    test()
