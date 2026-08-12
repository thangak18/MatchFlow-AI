# MatchFlow AI

MatchFlow AI is a hackathon demo for explainable Startup-Investor matching and global event-slot scheduling.

## Implemented Demo Flow

1. Upload a valid PDF pitch deck, up to 10 MB.
2. Gemini extracts a schema-validated Startup profile.
3. Review and confirm the profile.
4. Rank Investors using structured compatibility and persisted pgvector embeddings.
5. Run Gemini qualitative reasoning only for the Top 3 preliminary candidates.
6. Display component scores, strengths, risks, and degraded-mode labels when an AI component is unavailable.
7. Use OR-Tools to choose conflict-free meetings across the seeded global 30-minute event slots while maximizing total Match Score.
8. Display database-backed Startup, Investor, Match, Meeting, and average Match Score metrics.

When all components are available:

```text
Final Score = Structured × 0.50 + Semantic × 0.30 + LLM × 0.20
```

If semantic or LLM evaluation is unavailable, the score is renormalized over available components and the UI labels the missing component. Investors outside the preliminary Top 3 intentionally have no LLM score.

## Demo Setup

Requirements: Docker, Node.js, and a valid Gemini API credential in `backend/.env`.
The server defaults generation requests to `gemini-3.5-flash-lite`; override with `GEMINI_GENERATION_MODEL` if required.

```bash
docker start matchflow-db
make demo-bootstrap
```

`make demo-bootstrap` is idempotent for the configured demo database: it recreates the schema, applies migration and seed data, generates every Startup and Investor embedding, verifies pgvector and 768-dimensional vectors, and fails clearly when credentials or embeddings are unavailable.

Start the backend:

```bash
cd backend
set -a && source .env && set +a
venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
cd backend && venv/bin/python -m pytest -q
cd frontend && npm run lint && npx tsc --noEmit && npm run build
```

## Current Scope

- Seeded deterministic demo dataset: 20 Startups, 10 Investors, 5 global event slots.
- PDF-only ingestion.
- Synchronous Gemini extraction, embedding, and Top-3 reasoning.
- Global event-slot optimization. Participant-specific availability is not modeled.
- Database-backed analytics loaded on page request; no real-time streaming.
- Demo identity flow only; production authentication and authorization are not implemented.

## Future Roadmap

Not implemented in the current demo:

- Participant-specific availability and calendar integrations.
- Meeting notes, automated follow-up, email workflows, and deal-pipeline tracking.
- Website, form, CSV, and spreadsheet ingestion.
- Real-time event monitoring or WebSocket analytics.
- Production authentication, multi-tenancy, and role-based access controls.
- Learning from meeting outcomes or custom model training.
