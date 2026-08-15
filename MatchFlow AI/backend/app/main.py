from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MatchFlow AI API",
    description="Backend API for Startup-Investor matching and scheduling.",
    version="1.0.0",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex="https://.*", # Allow Cloud Run URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import endpoints
from app.api import auth


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to MatchFlow AI API"}

app.include_router(auth.router)
app.include_router(endpoints.router, prefix="/api")
