-- Audit 2026-07-15: Performance indexes v2
-- R-2: Index for siswaKursus.inviteTokenId
CREATE INDEX IF NOT EXISTS siswa_kursus_invite_token_idx ON siswa_kursus (invite_token_id);

-- R-3: Index for quizAttempt.nilai (leaderboard sorting)
CREATE INDEX IF NOT EXISTS quiz_attempt_nilai_idx ON quiz_attempt (nilai);