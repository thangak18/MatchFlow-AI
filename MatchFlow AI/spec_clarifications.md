# MatchFlow AI - MVP Clarifications & Constraints

To ensure a deterministic, hackathon-ready implementation and prevent over-engineering, the following clarifications resolve potential ambiguities in the `spec.md`:

## 1. User Roles and Permissions
**Ambiguity:** Should we build a full multi-tenant auth system?
**MVP Resolution:** Use Supabase Auth for simple email/password or magic links, but for demo purposes, rely on a "Switch Role" or "Demo Login" feature on the landing page that automatically logs the user in as a test Startup, Investor, or Organizer. No complex RBAC or organization scoping.

## 2. Pitch Deck Upload Behavior
**Ambiguity:** File types, size limits, and parsing complexity.
**MVP Resolution:** Accept **PDF only**. Limit to 10MB. To ensure prompt limits are respected and demo speed is high, parse only the first 10 pages of the PDF.

## 3. Extracted Profile Confirmation
**Ambiguity:** How are edits tracked?
**MVP Resolution:** Display a simple form pre-filled with the AI-extracted JSON. The Startup user edits the form fields and clicks "Confirm & Save". No version history or diff tracking is required.

## 4. Matching Score Semantics & Normalization
**Ambiguity:** How are the three scores combined?
**MVP Resolution:** Use a strict 0-100 scale. 
`Final Score = (Structured Score * 0.5) + (Semantic Score * 0.3) + (LLM Score * 0.2)`
- **Structured:** Rule-based points (e.g., industry match = 20 pts, stage = 20 pts, etc.) scaled to 100.
- **Semantic:** Cosine similarity from `pgvector` mapped to a 0-100 scale (e.g., `(cosine_sim + 1) / 2 * 100`).
- **LLM:** LLM explicitly outputs a `reasoning_score` between 0-100 in its JSON response.

## 5. Semantic Similarity Behavior
**Ambiguity:** What exactly is being embedded?
**MVP Resolution:** Concatenate key text fields into a single block per entity.
- Startup: `Industry: {industry}. Description: {description}. Target Market: {market}.`
- Investor: `Thesis: {thesis}. Preferred Industries: {industries}.`
Embed these single strings using Gemini's embedding model and store in `pgvector`.

## 6. LLM Reasoning Boundaries
**Ambiguity:** Does the LLM recalculate rule-based metrics?
**MVP Resolution:** No. The LLM is provided the Startup Profile and Investor Profile as structured JSON context, and prompted *only* to evaluate qualitative fit. It must output a strict JSON schema: `{"strengths": [], "risks": [], "reasoning_score": 85}`. 

## 7. Scheduling Constraints
**Ambiguity:** Handling dynamic time zones, variable meeting lengths, and buffers.
**MVP Resolution:** Time slots are fixed globally for the event (e.g., 5 slots: 09:00, 09:30, 10:00, 10:30, 11:00). All meetings are exactly 30 minutes. No buffer times or timezone conversions. Max meetings per participant is capped at the number of available slots.

## 8. Seeded Demo Dataset Behavior
**Ambiguity:** Empty states during the demo.
**MVP Resolution:** The database will have a `seed.sql` file providing 10 dummy Startups and 5 dummy Investors with pre-computed embeddings. The Organizer dashboard will have a "Reset Demo" button to instantly restore this state and wipe generated matches/schedules.

## 9. Organizer Workflow
**Ambiguity:** How does matching run for hundreds of participants?
**MVP Resolution:** For the MVP, provide a "Run Global Matching" button on the Organizer dashboard that executes the matching pipeline for all active Startups against all active Investors synchronously (or in a simple background thread), followed by a "Generate Schedule" button that runs OR-Tools.

## 10. Dashboard Metrics
**Ambiguity:** Real-time analytics complexity.
**MVP Resolution:** Dashboard metrics are calculated via standard SQL aggregation queries on page load. No WebSockets or real-time event streaming is required.

## 11. Error States
**Ambiguity:** Handling AI timeouts or OR-Tools unsolvable states.
**MVP Resolution:** 
- If Gemini times out, show a simple toast: *"AI Extraction failed. Please fill manually."* 
- If OR-Tools cannot find a perfect schedule, it must return the "best possible partial schedule" (maximize objective function) rather than throwing a fatal error.
