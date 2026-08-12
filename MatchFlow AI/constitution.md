# MatchFlow AI - Project Constitution

This document defines the non-negotiable principles for the MatchFlow AI project.

## PRODUCT PRINCIPLES

### I. MVP-FIRST DEVELOPMENT
The first goal is a complete hackathon demo, not a production SaaS platform.
Every feature must directly contribute to this flow:

Pitch Deck
→ Startup Profile
→ Investor Matches
→ Match Explanation
→ Meeting Schedule
→ Analytics

Features outside this flow require explicit justification.

### II. AI MUST BE FUNCTIONAL
AI cannot exist only as a chatbot or text generator.

Gemini should primarily be used for:
* extracting structured Startup profiles,
* extracting structured Investor preferences,
* analyzing qualitative compatibility,
* generating explainable matching reasoning.

Business-critical calculations should not rely exclusively on LLM output.

### III. HYBRID MATCHING
Final matching must combine:
1. deterministic structured compatibility,
2. semantic similarity,
3. LLM reasoning.

The system must retain component scores separately.
A final match score must be explainable and auditable.

### IV. STRUCTURED AI OUTPUT
Any Gemini response used by application logic must use a defined schema and validation.
Never directly trust arbitrary generated text as structured application state.

### V. EXPLAINABILITY
Every recommended Startup–Investor match must explain:
* strengths,
* mismatches,
* risks,
* important criteria,
* why the final score is high or low.

### VI. DETERMINISTIC BUSINESS RULES
Stage compatibility, ticket-size compatibility, availability conflicts and other deterministic constraints must be implemented using normal application logic rather than delegated entirely to an LLM.

### VII. OPTIMIZATION OVER GENERATION
Meeting scheduling must be modeled as a constraint optimization problem.

Hard constraints include:
* no participant can attend two meetings simultaneously,
* availability must be respected,
* one meeting occupies one slot,
* configured maximum meetings must be respected.

The scheduling objective should maximize aggregate matching value.

### VIII. SIMPLE ARCHITECTURE
Use a modular monolith.

Do not introduce:
* microservices,
* Kafka,
* Kubernetes,
* event sourcing,
* unnecessary queues,
* premature distributed systems.

Prefer understandable modules with clear interfaces.

### IX. TECHNOLOGY CONSISTENCY
Preferred stack:

*   **Frontend:** Next.js + TypeScript + Tailwind + shadcn/ui
*   **Backend:** FastAPI + Python + Pydantic + SQLAlchemy
*   **Data:** Supabase PostgreSQL + pgvector
*   **Authentication:** Supabase Auth
*   **Storage:** Supabase Storage
*   **AI:** Google Gemini
*   **Optimization:** Google OR-Tools
*   **Charts:** Recharts

Do not replace core technologies without explicit justification.

### X. SECURITY
* No credentials in source code.
* Use environment variables.
* Validate uploaded files.
* Validate API input.
* Authorize protected operations.
* Do not expose internal prompts, API credentials or raw confidential documents unnecessarily.

### XI. DATA QUALITY
AI-extracted profiles must be reviewable and editable before matching.

Preserve provenance where possible so users can identify whether information came from:
* uploaded pitch deck,
* manually entered form,
* generated inference.

### XII. TESTABILITY
Critical domain logic must be independently testable.

Minimum required automated testing:
* structured score calculation,
* ticket compatibility,
* stage compatibility,
* final score calculation,
* schedule conflict prevention,
* API schema validation.

LLM calls should be abstracted so tests can mock them.

### XIII. DEMO RELIABILITY
The hackathon demo must work with a deterministic seeded dataset even if external enrichment services are unavailable.

Provide:
* seed Startup data,
* seed Investor data,
* predictable demo scenarios.

### XIV. USER EXPERIENCE
The product must clearly communicate:
* what AI extracted,
* why a match was recommended,
* what the user can edit,
* what scheduling decisions were made.

Avoid exposing unnecessary technical complexity.

### XV. OBSERVABILITY
Log important processing stages and failures without logging secrets or unnecessary sensitive document content.

### XVI. DEFINITION OF DONE
A feature is complete only when:
* implementation works,
* acceptance criteria pass,
* critical tests pass,
* UI provides loading/error/empty states where applicable,
* no obvious console/runtime errors remain,
* documentation reflects important changes.

### XVII. SCOPE CONTROL
Before adding a dependency, service or abstraction, ask:
"Does the MVP require this?"

If not, do not introduce it.

Future functionality such as CRM integrations, automated due diligence, email automation, calendar integration, collaborative filtering, billing and advanced deal intelligence must remain outside MVP scope unless explicitly specified later.
