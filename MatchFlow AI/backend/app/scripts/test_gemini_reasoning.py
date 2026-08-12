import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
load_dotenv()

from app.db.session import get_db
from app.db.models import Startup, Investor
from app.schemas.schemas import StartupProfileSchema, InvestorProfileSchema
from app.services.ai_service import evaluate_match_reasoning

async def run_validation():
    if not os.getenv("GEMINI_API_KEY"):
        print("LLM reasoning layer unavailable. Please configure GEMINI_API_KEY.")
        return

    db = next(get_db())
    startup = db.query(Startup).filter(Startup.company_name == "LogiSense AI").first()
    investor = db.query(Investor).filter(Investor.investor_name == "ABC Ventures").first()
    
    sp = StartupProfileSchema.model_validate(startup.profile)
    ip = InvestorProfileSchema.model_validate(investor.profile)
    
    print(f"Testing LogiSense AI against ABC Ventures...")
    try:
        result = evaluate_match_reasoning(sp, ip)
        if result:
            print(f"Investor | Structured | Semantic | LLM | Final")
            # We don't have the hybrid score calculation here, just print reasoning score
            print(f"ABC Ventures | N/A | N/A | {result.reasoning_score} | N/A")
            print(f"Strengths: {result.strengths}")
            print(f"Risks: {result.risks}")
        else:
            print("evaluate_match_reasoning returned None")
    except Exception as e:
        print(f"Error during validation: {e}")

if __name__ == "__main__":
    asyncio.run(run_validation())
