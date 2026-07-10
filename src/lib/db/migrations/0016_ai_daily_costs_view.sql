-- Migration: ai_daily_costs materialized view
-- AKAL Center — Fase 4 AV4 (11 Juli 2026)
-- Aggregates daily AI costs per user for dashboard display

CREATE MATERIALIZED VIEW IF NOT EXISTS ai_daily_costs AS
SELECT
  user_id,
  date_trunc('day', created_at)::date AS day,
  model,
  request_type,
  count(*) AS request_count,
  sum(prompt_tokens) AS total_prompt_tokens,
  sum(completion_tokens) AS total_completion_tokens,
  sum(total_tokens) AS total_tokens,
  sum(cost_idr_cents) AS total_cost_idr_cents
FROM ai_requests
GROUP BY user_id, date_trunc('day', created_at)::date, model, request_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_daily_costs_unique
  ON ai_daily_costs (user_id, day, model, request_type);

-- Schedule daily refresh via Vercel Cron (pg_cron not available on Supabase free)
-- Cron endpoint: GET /api/v1/cron/refresh-ai-costs
-- Vercel cron config (vercel.json): {"crons":[{"path":"/api/v1/cron/refresh-ai-costs","schedule":"0 3 * * *"}]}
