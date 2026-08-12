import os
import sys
import asyncio
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

load_dotenv()

from sqlalchemy.orm import Session
from app.db.session import engine
from app.db.models import StartupProfile, InvestorProfile
from app.services.ai_service import generate_embedding

async def main():
    if not os.getenv("GEMINI_API_KEY"):
        print("No GEMINI_API_KEY found. Aborting embedding generation gracefully.")
        return

    with Session(engine) as db:
        print("Fetching startup profiles without embeddings...")
        startup_profiles = db.query(StartupProfile).filter(StartupProfile.embedding.is_(None)).all()
        for profile in startup_profiles:
            if not profile.description:
                continue
            
            print(f"Generating embedding for Startup Profile {profile.startup.company_name}...")
            vector = generate_embedding(profile.description)
            if any(vector):
                # Ensure the vector is exactly 768 dimensions
                if len(vector) == 768:
                    profile.embedding = vector
                else:
                    print(f"Error: Generated vector for {profile.startup.company_name} has invalid length {len(vector)}")
            else:
                print(f"Failed to generate embedding for {profile.startup.company_name}")
                
        print("Fetching investor profiles without embeddings...")
        investor_profiles = db.query(InvestorProfile).filter(InvestorProfile.embedding.is_(None)).all()
        for profile in investor_profiles:
            if not profile.investment_thesis:
                continue
                
            print(f"Generating embedding for Investor Profile {profile.investor.investor_name}...")
            vector = generate_embedding(profile.investment_thesis)
            if any(vector):
                if len(vector) == 768:
                    profile.embedding = vector
                else:
                    print(f"Error: Generated vector for {profile.investor.investor_name} has invalid length {len(vector)}")
            else:
                print(f"Failed to generate embedding for {profile.investor.investor_name}")
        
        db.commit()
        print("Database updated with embeddings successfully!")

if __name__ == "__main__":
    asyncio.run(main())
