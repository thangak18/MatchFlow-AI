# MatchFlow AI Demo Script

## Before Presenting

Run `docker start matchflow-db && make demo-bootstrap`, then start the backend and frontend using the README commands. Confirm the bootstrap reports 20 Startup embeddings and 10 Investor embeddings.

## Live Demo

1. **Landing:** “MatchFlow AI turns a PDF pitch deck into explainable Investor recommendations and an optimized event schedule.”
2. **Upload:** Upload `backend/real_fixture.pdf`. “Gemini extracts a schema-validated Startup profile from this PDF.”
3. **Profile:** Review LogiSense AI and confirm it. “The founder can correct extracted fields before matching.”
4. **Matches:** “Every Investor receives structured and persisted-embedding semantic evaluation. Gemini qualitative reasoning is limited to the Top 3 preliminary candidates to reduce latency and quota use.”
5. **Match Detail:** Open ABC Ventures. “When all three components are present, the final score uses 50% structured, 30% semantic, and 20% LLM reasoning. Missing components are labeled and never fabricated.”
6. **Schedule:** Generate the schedule. “OR-Tools selects conflict-free meetings across five global 30-minute event slots and maximizes aggregate Match Score. This demo does not model participant-specific availability.”
7. **Dashboard:** “These counts and average Match Score are read from PostgreSQL after matching and scheduling.”

## Future Roadmap - Do Not Present as Implemented

- Participant calendars or individual availability.
- Meeting transcription, notes, follow-up automation, or email.
- Real-time monitoring and streaming analytics.
- Website, CSV, spreadsheet, or form ingestion.
- Production authentication or multi-tenant authorization.
- A system that learns from outcomes.
