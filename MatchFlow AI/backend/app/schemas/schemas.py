from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class StartupProfileSchema(BaseModel):
    company_name: str | None = None
    description: str | None = None
    industry: str | None = None
    stage: str | None = None
    funding_requirement: float | None = None
    business_model: str | None = None
    target_market: str | None = None
    geography: str | None = None
    technology: str | None = None
    traction: str | None = None
    revenue_status: str | None = None
    model_config = ConfigDict(from_attributes=True)

class StartupSchema(BaseModel):
    id: UUID
    user_id: UUID
    company_name: str
    profile: StartupProfileSchema | None = None
    model_config = ConfigDict(from_attributes=True)

class InvestorProfileSchema(BaseModel):
    investment_thesis: str | None = None
    preferred_industries: list[str] | None = []
    preferred_stages: list[str] | None = []
    min_ticket_size: float | None = None
    max_ticket_size: float | None = None
    preferred_geographies: list[str] | None = []
    business_model_preferences: list[str] | None = []
    technology_interests: list[str] | None = []
    model_config = ConfigDict(from_attributes=True)

class InvestorSchema(BaseModel):
    id: UUID
    user_id: UUID
    investor_name: str
    profile: InvestorProfileSchema | None = None
    model_config = ConfigDict(from_attributes=True)

class MatchReasoningOutput(BaseModel):
    strengths: list[str]
    risks: list[str]
    reasoning_score: float = Field(ge=0, le=100)

class MatchResult(BaseModel):
    id: UUID
    startup_id: UUID
    investor_id: UUID
    investor_name: str
    structured_score: float = Field(default=0, ge=0, le=100)
    semantic_score: float | None = Field(default=None, ge=0, le=100)
    llm_score: float | None = Field(default=None, ge=0, le=100)
    final_score: float = Field(ge=0, le=100)
    strengths: list[str]
    risks: list[str]
    explanation: str = ""
    model_config = ConfigDict(from_attributes=True)

class MeetingOutcomeUpdate(BaseModel):
    outcome: str
    notes: str | None = None
    next_step: str | None = None
    follow_up_date: str | None = None

class MeetingSchema(BaseModel):
    id: UUID
    match_id: UUID
    slot_id: UUID
    status: str
    outcome: str | None = None
    notes: str | None = None
    next_step: str | None = None
    follow_up_date: str | None = None
    completed_at: str | None = None
    model_config = ConfigDict(from_attributes=True)

class SlotAvailability(BaseModel):
    time_slot_id: UUID
    available: bool

class ParticipantAvailabilityUpdate(BaseModel):
    slots: list[SlotAvailability]
