-- Migration 0053: Add quiz violation event log for exam integrity
-- Logs client-side anti-cheat events (tab_hidden, fullscreen_exit, pagehide, etc.)
-- so reload cannot reset the evidence. Guru can see violation counts per attempt.

CREATE TABLE IF NOT EXISTS quiz_violation (
  id UUID PRIMARY KEY,
  siswa_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_published_id UUID NOT NULL REFERENCES quiz_published(id) ON DELETE CASCADE,
  jenis VARCHAR(50) NOT NULL,
  detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_violation_siswa_idx ON quiz_violation(siswa_id, quiz_published_id, created_at);
CREATE INDEX IF NOT EXISTS quiz_violation_quiz_idx ON quiz_violation(quiz_published_id);
