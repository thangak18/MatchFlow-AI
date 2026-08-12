-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL, -- 'startup', 'investor', 'organizer'
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE startup_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID UNIQUE REFERENCES startups(id) ON DELETE CASCADE,
  description TEXT,
  industry VARCHAR(100),
  stage VARCHAR(50),
  funding_requirement NUMERIC,
  business_model VARCHAR(100),
  target_market VARCHAR(255),
  geography VARCHAR(255),
  technology TEXT,
  traction TEXT,
  revenue_status VARCHAR(100),
  embedding vector(768), -- Gemini embedding dimension size
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  investor_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID UNIQUE REFERENCES investors(id) ON DELETE CASCADE,
  investment_thesis TEXT,
  preferred_industries TEXT[],
  preferred_stages TEXT[],
  min_ticket_size NUMERIC,
  max_ticket_size NUMERIC,
  preferred_geographies TEXT[],
  business_model_preferences TEXT[],
  technology_interests TEXT[],
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  structured_score NUMERIC,
  semantic_score NUMERIC,
  llm_score NUMERIC,
  final_score NUMERIC,
  strengths TEXT[],
  risks TEXT[],
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(startup_id, investor_id)
);

CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES availability_slots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id)
);
