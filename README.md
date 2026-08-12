# MatchFlow AI 🤝

**MatchFlow AI** is a state-of-the-art, AI-powered matching and scheduling platform designed specifically for Startup-Investor networking events. It leverages Generative AI and advanced Operations Research (OR) to extract profiles, calculate explainable compatibility scores, and automatically generate conflict-free event schedules.

---

## 🌟 Key Features

1. **Intelligent Profile Extraction**: Upload a startup pitch deck (PDF), and our Gemini integration automatically extracts structured metrics (industry, stage, traction) and generates high-dimensional vector embeddings for semantic search.
2. **Hybrid Matching Engine**: 
   - **Structured Scoring**: Hard constraints (e.g., ticket size, industry match).
   - **Semantic Scoring**: `pgvector` similarity between startup pitches and investor theses.
   - **Explainable AI**: Gemini provides a verifiable breakdown of the match, highlighting "Strengths" and "Risks".
3. **Smart Availability & Scheduling**:
   - Startups and Investors can manage their availability slots.
   - **Google OR-Tools** solver crunches all availabilities and match scores to generate a mathematically optimal, conflict-free meeting schedule for the entire event.
4. **Role-Based Workspaces**:
   - **Startup Profile**: Manage pitch decks and company metrics.
   - **Investor Dashboard**: Review tailored matches and upcoming meetings.
   - **Organizer Dashboard**: Get a bird's-eye view of the event, run the OR-Tools solver, and track meeting outcomes.

---

## 🚀 Demo Access

The platform comes pre-seeded with demo accounts. 
**Password for all demo accounts:** `demo123`

| Role | Username | Description |
| :--- | :--- | :--- |
| **Organizer** | `organizer_demo` | Full access to run the scheduling algorithm and view analytics. |
| **Startup** | `startup_demo` | Access to the startup profile upload and schedule viewer. |
| **Investor** | `investor_demo` | Access to the investor matching dashboard. |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, Shadcn UI
- **Backend**: FastAPI, Python 3
- **Database**: PostgreSQL with `pgvector` extension (Supabase)
- **AI / ML**: Google Gemini 1.5 Flash (for extraction & reasoning)
- **Algorithms**: Google OR-Tools (CP-SAT Solver)

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL database (with `pgvector` enabled)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment variables (create a .env file)
# GEMINI_API_KEY="..."
# DATABASE_URL="..."

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at [http://localhost:3000](http://localhost:3000)*

---

## 📜 License
This project is for demonstration purposes.
