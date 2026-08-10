-- 0055_add_tutor_chat
-- AI Tutor chat sessions (AI_INTEGRATION.md) - job/poll pattern
-- Postgres role bypasses RLS; policies mirror ai_requests (0038) for anon/authenticated Supabase access
CREATE TABLE IF NOT EXISTS tutor_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'murid',
  prompt TEXT NOT NULL,
  response TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  model_name VARCHAR(100),
  token_input INTEGER DEFAULT 0,
  token_output INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tutor_chat_user_idx ON tutor_chat(user_id, created_at DESC);

ALTER TABLE tutor_chat ENABLE ROW LEVEL SECURITY;

-- User-scoped access: owner of the chat row (mirror ai_requests_user_policy)
DROP POLICY IF EXISTS tutor_chat_user_policy ON tutor_chat;
CREATE POLICY tutor_chat_user_policy ON tutor_chat
  FOR ALL
  TO public
  USING (user_id = app.current_user_id())
  WITH CHECK (user_id = app.current_user_id());

-- Admin read access (mirror ai_requests_admin policy pattern)
DROP POLICY IF EXISTS tutor_chat_admin_policy ON tutor_chat;
CREATE POLICY tutor_chat_admin_policy ON tutor_chat
  FOR SELECT
  TO public
  USING (app.current_role() IN ('admin_sekolah', 'owner'));
