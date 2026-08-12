import pytest
from app.schemas.schemas import StartupProfileSchema, InvestorProfileSchema
from app.services.matching_service import calculate_structured_score, calculate_semantic_score, calculate_hybrid_match
from unittest.mock import patch
import numpy as np

@pytest.fixture
def dummy_startup_profile():
    return StartupProfileSchema(
        id="123e4567-e89b-12d3-a456-426614174000",
        description="A great AI startup",
        industry="SaaS",
        stage="Seed",
        funding_requirement=1000000.0,
        business_model="B2B",
        geography="North America",
        technology="AI"
    )

@pytest.fixture
def dummy_investor_profile():
    return InvestorProfileSchema(
        id="123e4567-e89b-12d3-a456-426614174001",
        investment_thesis="We invest in early stage B2B SaaS.",
        preferred_industries=["SaaS", "Fintech"],
        preferred_stages=["Pre-Seed", "Seed"],
        min_ticket_size=500000.0,
        max_ticket_size=2000000.0,
        business_model_preferences=["B2B"],
        preferred_geographies=["North America", "Global"],
        technology_interests=["AI", "Web3"]
    )

def test_structured_score_perfect_match(dummy_startup_profile, dummy_investor_profile):
    score = calculate_structured_score(dummy_startup_profile, dummy_investor_profile)
    assert score == 100.0
    assert 0 <= score <= 100

def test_structured_score_total_mismatch(dummy_startup_profile, dummy_investor_profile):
    dummy_startup_profile.industry = "Agtech"
    dummy_startup_profile.stage = "Series C"
    dummy_startup_profile.funding_requirement = 10000000.0
    dummy_startup_profile.business_model = "B2C"
    dummy_startup_profile.geography = "Europe"
    dummy_startup_profile.technology = "Hardware"
    
    score = calculate_structured_score(dummy_startup_profile, dummy_investor_profile)
    assert score == 0.0
    assert 0 <= score <= 100

def test_semantic_score_zero_vector_returns_none():
    with patch('app.services.matching_service.generate_embedding') as mock_embed:
        mock_embed.return_value = [0.0] * 768
        score = calculate_semantic_score("startup", "investor")
        assert score is None

def test_semantic_score_identical_vectors():
    with patch('app.services.matching_service.generate_embedding') as mock_embed:
        mock_embed.return_value = [0.5] * 768
        score = calculate_semantic_score("startup", "investor")
        assert score == 100.0

def test_hybrid_score_degraded_mode(dummy_startup_profile, dummy_investor_profile):
    # Simulate API failure for LLM and Semantic
    with patch('app.services.matching_service.calculate_semantic_score', return_value=None), \
         patch('app.services.matching_service.evaluate_match_reasoning', side_effect=Exception("API Error")):
        
        result = calculate_hybrid_match(dummy_startup_profile, dummy_investor_profile)
        # Only structured is available (weight 0.5), it renormalizes!
        # Structured = 100, Final = 100
        assert result['structured_score'] == 100.0
        assert result['semantic_score'] is None
        assert result['llm_score'] is None
        assert result['final_score'] == 100.0
        assert "LLM unavailable" in result['explanation']

def test_hybrid_score_normal_mode(dummy_startup_profile, dummy_investor_profile):
    class MockLLM:
        reasoning_score = 90.0
        strengths = ["Strong"]
        risks = ["None"]
        explanation = "Great"
        
    with patch('app.services.matching_service.calculate_semantic_score', return_value=80.0), \
         patch('app.services.matching_service.evaluate_match_reasoning', return_value=MockLLM()):
        
        result = calculate_hybrid_match(dummy_startup_profile, dummy_investor_profile)
        # Structured=100, Semantic=80, LLM=90
        # Final = (100*0.5) + (80*0.3) + (90*0.2) = 50 + 24 + 18 = 92
        assert result['structured_score'] == 100.0
        assert result['semantic_score'] == 80.0
        assert result['llm_score'] == 90.0
        assert result['final_score'] == 92.0
        assert 0 <= result['final_score'] <= 100

def test_hybrid_score_skips_llm_outside_top_three(dummy_startup_profile, dummy_investor_profile):
    with patch('app.services.matching_service.calculate_semantic_score', return_value=80.0), \
         patch('app.services.matching_service.evaluate_match_reasoning') as reasoning:
        result = calculate_hybrid_match(
            dummy_startup_profile,
            dummy_investor_profile,
            use_llm_reasoning=False,
        )
        reasoning.assert_not_called()
        assert result['llm_score'] is None
        assert result['final_score'] == 92.5
        assert "outside Top 3" in result['explanation']
