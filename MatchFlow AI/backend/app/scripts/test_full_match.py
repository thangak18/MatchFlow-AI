import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
load_dotenv()

from app.db.session import get_db
from app.db.models import Startup, Investor
from app.schemas.schemas import StartupProfileSchema, InvestorProfileSchema
from app.services.matching_service import calculate_hybrid_match

def test():
    db = next(get_db())
    startup = db.query(Startup).filter(Startup.company_name == "LogiSense AI").first()
    investor = db.query(Investor).filter(Investor.investor_name == "ABC Ventures").first()
    
    sp = StartupProfileSchema.model_validate(startup.profile)
    ip = InvestorProfileSchema.model_validate(investor.profile)
    
    print("Testing LogiSense AI against ABC Ventures (FULL HYBRID MATCH)...")
    try:
        result = calculate_hybrid_match(sp, ip)
        print(f"Investor | Structured | Semantic | LLM | Final")
        print(f"ABC Ventures | {result['structured_score']} | {result['semantic_score']} | {result['llm_score']} | {result['final_score']}")
        print(f"Strengths: {result['strengths']}")
        print(f"Risks: {result['risks']}")
    except Exception as e:
        print(f"Error during validation: {e}")

if __name__ == "__main__":
    test()
