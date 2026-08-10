-- 0054_add_guru_invite_codes
-- Invite-code guru registration (PRD-UNIFIED-LAUNCH-v2 FASE 2)
-- Hand-written migration - do NOT regenerate via drizzle-kit (journal desynced)

CREATE TABLE IF NOT EXISTS guru_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(16) NOT NULL UNIQUE,
  issuing_guru_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_uses INTEGER NOT NULL DEFAULT 3,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  trial_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guru_invite_codes_issuing_guru_idx ON guru_invite_codes(issuing_guru_id);
CREATE UNIQUE INDEX IF NOT EXISTS guru_invite_codes_code_idx ON guru_invite_codes(code);

-- RLS (follow 0038 convention: every table gets RLS + policies)
ALTER TABLE guru_invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY guru_invite_codes_admin_all ON guru_invite_codes
  FOR ALL
  USING (app.current_role() IN ('owner', 'admin_sekolah'));

CREATE POLICY guru_invite_codes_guru_select ON guru_invite_codes
  FOR SELECT
  USING (app.current_role() = 'guru' AND issuing_guru_id = app.current_user_id());
