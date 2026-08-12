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
    allow_origins=["*"], # In production, restrict this to the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import endpoints


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to MatchFlow AI API"}

app.include_router(endpoints.router, prefix="/api")
