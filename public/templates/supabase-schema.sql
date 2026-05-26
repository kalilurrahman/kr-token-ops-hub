-- TokenOps: Database Schema for LLM Usage Logging
-- Run this migration against your Supabase/PostgreSQL instance.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM usage logs — one row per API call
CREATE TABLE llm_usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  feature_name TEXT NOT NULL,
  user_id TEXT,
  model_used TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_hit BOOLEAN DEFAULT FALSE,
  estimated_cost_usd DECIMAL(10,6) NOT NULL,
  latency_ms INTEGER,
  request_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team budgets — token budget enforcement
CREATE TABLE team_budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) UNIQUE,
  monthly_budget_usd DECIMAL(10,2) DEFAULT 500.00,
  current_spend_usd DECIMAL(10,2) DEFAULT 0.00,
  alert_threshold_percent INTEGER DEFAULT 80,
  last_alert_sent_at TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX idx_llm_usage_team_date ON llm_usage_logs(team_id, created_at);
CREATE INDEX idx_llm_usage_model ON llm_usage_logs(model_used, created_at);
CREATE INDEX idx_llm_usage_feature ON llm_usage_logs(feature_name, created_at);

-- Example: Insert demo teams
-- INSERT INTO teams (name) VALUES ('Marketing'), ('Product'), ('Data Science'), ('Support');
