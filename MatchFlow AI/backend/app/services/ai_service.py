import os

from google import genai
from google.genai import types
from pydantic import ValidationError

from app.schemas.schemas import StartupProfileSchema, InvestorProfileSchema, MatchReasoningOutput

GENERATION_MODEL = os.getenv("GEMINI_GENERATION_MODEL", "gemini-3.5-flash-lite")


def get_client():
    # Use environment variables for authentication
    return genai.Client()

def extract_startup_profile(pdf_file_path: str) -> StartupProfileSchema | None:
    """
    Passes a raw PDF directly to Gemini 1.5 for native extraction.
    Ensures structured JSON output using Pydantic schemas.
    """
    try:
        client = get_client()
        # Upload the file using the genai File API
        uploaded_file = client.files.upload(file=pdf_file_path)
        
        prompt = "Analyze this startup pitch deck. Extract the company profile into the requested JSON schema. If information is missing, leave it null."
        
        # We explicitly request JSON output validated against our Pydantic schema
        print("GEMINI_CALL type=profile_extraction")
        response = client.models.generate_content(
            model=GENERATION_MODEL,
            contents=[uploaded_file, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=StartupProfileSchema,
            ),
        )
        
        # Cleanup the file from Google's servers
        client.files.delete(name=uploaded_file.name)
        
        if not response.text:
            print("AI Extraction Warning: Empty response received.")
            return None
            
        # Validate that the returned JSON matches our schema strictly
        return StartupProfileSchema.model_validate_json(response.text)
        
    except ValidationError as e:
        print(f"AI Extraction Schema Error: Gemini returned invalid JSON structure. {e}")
        return None
    except Exception as e:
        print(f"AI Extraction General Error: {e}")
        return None

def generate_embedding(text: str) -> list[float]:
    """Generates a semantic embedding vector for a given text."""
    try:
        client = get_client()
        print("GEMINI_CALL type=embedding")
        response = client.models.embed_content(
            model='gemini-embedding-2',
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Embedding Error: {e}")
        # Return empty vector on failure to avoid crashing
        return [0.0] * 768

def evaluate_match_reasoning(startup: StartupProfileSchema, investor: InvestorProfileSchema) -> MatchReasoningOutput | None:
    """Uses Gemini to evaluate qualitative fit and extract reasoning."""
    try:
        client = get_client()
        prompt = f"""
        Evaluate the compatibility between this startup and investor.
        Startup: {startup.model_dump_json()}
        Investor: {investor.model_dump_json()}
        
        Provide your reasoning in the requested JSON format.
        IMPORTANT: The reasoning_score MUST be a float between 0 and 100 (where 100 is a perfect match).
        """
        print("GEMINI_CALL type=match_reasoning")
        response = client.models.generate_content(
            model=GENERATION_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MatchReasoningOutput,
            ),
        )
        if not response.text:
            return None
        return MatchReasoningOutput.model_validate_json(response.text)
    except Exception as e:
        print(f"Match Reasoning Error: {e}")
        return None
