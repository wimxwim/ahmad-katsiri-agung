-- Migration 0028: invite_tokens + siswaKursus.inviteTokenId
-- Tujuan: tracking undangan guru → siswa

CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kursus_id UUID NOT NULL REFERENCES kursus(id) ON DELETE CASCADE,
  guru_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jti VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS invite_tokens_kursus_idx ON invite_tokens(kursus_id);
CREATE INDEX IF NOT EXISTS invite_tokens_guru_idx ON invite_tokens(guru_id);

ALTER TABLE siswa_kursus ADD COLUMN IF NOT EXISTS invite_token_id UUID;