# MatchFlow AI - Product Specification (MVP)

## 1. Target Users
1. **Startup:** Founders seeking investment.
2. **Investor:** VCs, Angels, or Funds looking for startups.
3. **Event Organizer:** Administrators running the Business Matching event.

## 2. Primary Demo Journey
1. A Startup uploads a pitch deck (PDF).
2. The system extracts and displays a structured Startup Profile.
3. The Startup reviews and corrects the extracted information.
4. The system compares the Startup against a predefined Investor dataset.
5. The system returns ranked Investor recommendations.
6. Each recommendation includes:
   - Final Match Score
   - Compatibility breakdown
   - Positive matching factors
   - Mismatch/risk factors
   - Human-readable explanation
7. The Organizer selects participants and generates an optimized Business Matching schedule.
8. The system displays basic event analytics.

## 3. Data Models

### 3.1 Startup Profile
The application should support:
- Company name
- Short description
- Industry
- Stage
- Funding requirement
- Business model
- Target market
- Geography
- Technology
- Traction
- Revenue status

*Data Origin:* Uploaded pitch deck -> AI extraction -> Manual correction.

### 3.2 Investor Profile
Investor data should contain:
- Investor name
- Investment thesis
- Preferred industries
- Preferred stages
- Minimum ticket size
- Maximum ticket size
- Preferred geographies
- Business-model preferences
- Technology interests
- Revenue expectations (where available)

## 4. Matching Logic

### 4.1 Hybrid Evaluation
For each Startup–Investor pair, the application must evaluate at least:
- Industry compatibility
- Stage compatibility
- Ticket-size compatibility
- Geography compatibility
- Business-model compatibility
- Thesis relevance
- Semantic relevance

### 4.2 Explainable AI Output
The system must not return a black-box score. Users must understand why a match was recommended. 

**Example Explainability:**
> **ABC Ventures — 94%**
> 
> **Strengths:**
> - Strong logistics industry fit.
> - Startup stage matches Seed–Series A mandate.
> - $500K raise fits $300K–$2M ticket.
> - Southeast Asia matches geographic mandate.
> 
> **Risk:**
> - Investor tends to prefer companies with recurring revenue.

## 5. Smart Scheduling (Event Organizer)

**Inputs:**
- Event time slots
- Startup availability
- Investor availability

**Constraints (Google OR-Tools):**
- Prevent schedule conflicts.
- No participant can attend two meetings simultaneously.
- Availability must be respected.
- One meeting occupies one slot.
- Configured maximum meetings per participant must be respected.
- Where multiple valid schedules exist, higher-value matches receive preference (Objective Function).

## 6. Analytics Dashboard

Provide an event dashboard containing at minimum:
- Number of Startups
- Number of Investors
- Generated matches
- Scheduled meetings
- Average Match Score
- Meetings by time slot
- Match distribution

## 7. MVP Screens
1. **Landing / Authentication**
2. **Startup Pitch Deck Upload**
3. **AI Extracted Startup Profile**
4. **Investor Matching Results**
5. **Match Detail / Why This Match**
6. **Organizer Scheduling**
7. **Event Dashboard**

## 8. Out of Scope for MVP
- Full CRM
- Automatic email follow-up
- Google Calendar integration
- Investor web crawling
- Automatic company web crawling
- Payments & Billing
- Multi-organization tenancy
- Advanced due diligence
- Term-sheet generation
- Real-time chat
- Native mobile app
- Collaborative filtering
- Training custom ML models

## 9. Success Criteria
The demo is successful when a user can complete the entire journey in under 5 minutes:
1. Upload a sample pitch deck.
2. Obtain a structured profile.
3. Review/edit the profile.
4. Receive multiple ranked Investor matches.
5. Inspect why a match received its score.
6. Generate a conflict-free meeting schedule.
7. View event-level analytics.
