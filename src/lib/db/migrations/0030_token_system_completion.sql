BEGIN;

DO $$ BEGIN
  CREATE TYPE token_transaction_type AS ENUM ('TOPUP', 'GRANT', 'DEDUCT', 'REFUND', 'DONATION');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE token_transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type token_transaction_type NOT NULL,
  status token_transaction_status NOT NULL DEFAULT 'COMPLETED',
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL DEFAULT 0,
  balance_after INTEGER NOT NULL DEFAULT 0,
  payment_method VARCHAR(50),
  proof_file_id VARCHAR(255),
  proof_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS token_transactions_user_id_idx ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS token_transactions_type_idx ON token_transactions(type);
CREATE INDEX IF NOT EXISTS token_transactions_created_at_idx ON token_transactions(created_at);

ALTER TABLE token_balances ADD COLUMN IF NOT EXISTS is_unlocked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE token_balances ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMPTZ;

ALTER TABLE payments ALTER COLUMN amount TYPE INTEGER USING amount::INTEGER;

ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'token_balances' AND policyname = 'users_own_balance'
  ) THEN
    CREATE POLICY users_own_balance ON token_balances
      FOR ALL USING (user_id = (SELECT auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'token_transactions' AND policyname = 'users_own_transactions'
  ) THEN
    CREATE POLICY users_own_transactions ON token_transactions
      FOR SELECT USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

UPDATE token_balances
SET is_unlocked = true, unlocked_at = NOW()
WHERE user_id IN (
  SELECT DISTINCT user_id FROM payments WHERE status = 'completed'
);

COMMIT;