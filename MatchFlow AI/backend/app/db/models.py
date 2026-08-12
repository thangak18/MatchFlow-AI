import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text, func, Boolean
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    role = Column(String(50), nullable=False)
    username = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Event(Base):
    __tablename__ = 'events'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Startup(Base):
    __tablename__ = 'startups'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'))
    company_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    profile = relationship("StartupProfile", back_populates="startup", uselist=False)

class StartupProfile(Base):
    __tablename__ = 'startup_profiles'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    startup_id = Column(UUID(as_uuid=True), ForeignKey('startups.id', ondelete='CASCADE'), unique=True)
    description = Column(Text)
    industry = Column(String(100))
    stage = Column(String(50))
    funding_requirement = Column(Numeric)
    business_model = Column(String(100))
    target_market = Column(String(255))
    geography = Column(String(255))
    technology = Column(Text)
    traction = Column(Text)
    revenue_status = Column(String(100))
    embedding = Column(Vector(768))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    startup = relationship("Startup", back_populates="profile")

class Investor(Base):
    __tablename__ = 'investors'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'))
    investor_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    profile = relationship("InvestorProfile", back_populates="investor", uselist=False)

class InvestorProfile(Base):
    __tablename__ = 'investor_profiles'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    investor_id = Column(UUID(as_uuid=True), ForeignKey('investors.id', ondelete='CASCADE'), unique=True)
    investment_thesis = Column(Text)
    preferred_industries = Column(ARRAY(String))
    preferred_stages = Column(ARRAY(String))
    min_ticket_size = Column(Numeric)
    max_ticket_size = Column(Numeric)
    preferred_geographies = Column(ARRAY(String))
    business_model_preferences = Column(ARRAY(String))
    technology_interests = Column(ARRAY(String))
    embedding = Column(Vector(768))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    investor = relationship("Investor", back_populates="profile")

class Match(Base):
    __tablename__ = 'matches'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    startup_id = Column(UUID(as_uuid=True), ForeignKey('startups.id', ondelete='CASCADE'))
    investor_id = Column(UUID(as_uuid=True), ForeignKey('investors.id', ondelete='CASCADE'))
    structured_score = Column(Numeric)
    semantic_score = Column(Numeric)
    llm_score = Column(Numeric)
    final_score = Column(Numeric)
    strengths = Column(ARRAY(String))
    risks = Column(ARRAY(String))
    explanation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AvailabilitySlot(Base):
    __tablename__ = 'availability_slots'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Meeting(Base):
    __tablename__ = 'meetings'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    match_id = Column(UUID(as_uuid=True), ForeignKey('matches.id', ondelete='CASCADE'))
    slot_id = Column(UUID(as_uuid=True), ForeignKey('availability_slots.id', ondelete='CASCADE'))
    
    # Outcome Tracking
    status = Column(String(50), default="scheduled")
    outcome = Column(String(50))
    notes = Column(Text)
    next_step = Column(String(255))
    follow_up_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StartupAvailability(Base):
    __tablename__ = 'startup_availability'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    startup_id = Column(UUID(as_uuid=True), ForeignKey('startups.id', ondelete='CASCADE'))
    time_slot_id = Column(UUID(as_uuid=True), ForeignKey('availability_slots.id', ondelete='CASCADE'))
    is_available = Column(Boolean, default=True) # SQLite/Postgres boolean can be tricky, let's use boolean
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InvestorAvailability(Base):
    __tablename__ = 'investor_availability'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), default=uuid.uuid4)
    investor_id = Column(UUID(as_uuid=True), ForeignKey('investors.id', ondelete='CASCADE'))
    time_slot_id = Column(UUID(as_uuid=True), ForeignKey('availability_slots.id', ondelete='CASCADE'))
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
