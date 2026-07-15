-- 0035_add_idempotency_and_lease.sql
-- Fase 5-6: Token idempotency + AI generation lease tracking

-- Token transactions: reference_id untuk idempotency (cegah double deduct)
ALTER TABLE token_transactions
  ADD COLUMN IF NOT EXISTS reference_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS token_transactions_reference_idx
  ON token_transactions (user_id, type, reference_id)
  WHERE reference_id IS NOT NULL;

-- AI generation: attempt_count + lease_until untuk durable queue
ALTER TABLE ai_generation
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE ai_generation
  ADD COLUMN IF NOT EXISTS lease_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS ai_generation_lease_idx
  ON ai_generation (status, lease_until)
  WHERE status = 'generating';