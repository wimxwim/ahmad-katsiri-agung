-- 0059_stabil_restore.sql
-- F1 STABIL RESTORE — idempoten, semua IF NOT EXISTS
-- Tujuan: mengembalikan objek yang mungkin belum ter-apply di prod tanpa hapus migrasi.
-- Aman di-rerun berkali-kali (Supabase SQL Editor). Jangan hapus file migrasi 0000-0058.
-- Archive baseline: archive/2026-08-baseline/ (0000-0056)
-- Journal: meta/_journal.json idx 0-58 tetap, idx 59 ditambahkan untuk file ini.

-- =============================================================================
-- 1) tutor_chat — dari 0055_add_tutor_chat.sql (0055:8)
--    AI Tutor chat sessions — job/poll pattern, user_id FK users(id) CASCADE
-- =============================================================================
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

-- RLS — idempoten (ENABLE tidak error jika sudah enabled; policy di-drop dulu)
ALTER TABLE tutor_chat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tutor_chat_user_policy ON tutor_chat;
CREATE POLICY tutor_chat_user_policy ON tutor_chat
  FOR ALL TO public
  USING (user_id = app.current_user_id())
  WITH CHECK (user_id = app.current_user_id());

DROP POLICY IF EXISTS tutor_chat_admin_policy ON tutor_chat;
CREATE POLICY tutor_chat_admin_policy ON tutor_chat
  FOR SELECT TO public
  USING (app.current_role() IN ('admin_sekolah', 'owner'));

-- =============================================================================
-- 2) Index kritis 0033 — dari 0033_critical_missing_indexes.sql
--    Skip idx_materi_read_siswa_materi karena sudah UNIQUE di schema
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_siswa_kursus_siswa_status ON siswa_kursus(siswa_id, status);
CREATE INDEX IF NOT EXISTS idx_siswa_kursus_siswa_id ON siswa_kursus(siswa_id);
CREATE INDEX IF NOT EXISTS idx_remedial_recommendation_siswa ON remedial_recommendation(siswa_id);

-- =============================================================================
-- 3) Partial unique fix — dari 0034_fix_unique_constraints.sql
--    kelas(nama,guru_id) WHERE deleted_at IS NULL — cegah duplikat nama kelas
--    Jika full unique sudah ada, DO block akan catch duplicate_object dan no-op.
-- =============================================================================
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS kelas_nama_guru_unique_partial
    ON kelas(nama, guru_id) WHERE deleted_at IS NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS quiz_attempt_siswa_quiz_done_unique
    ON quiz_attempt(siswa_id, quiz_published_id, status) WHERE status = 'SELESAI';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 4) Analytics indexes — untuk dashboard guru & cron refresh
--    Semua IF NOT EXISTS, aman re-run
-- =============================================================================
CREATE INDEX IF NOT EXISTS quiz_attempt_waktu_selesai_idx ON quiz_attempt(waktu_selesai);
CREATE INDEX IF NOT EXISTS quiz_attempt_waktu_mulai_idx ON quiz_attempt(waktu_mulai);
CREATE INDEX IF NOT EXISTS jawaban_log_created_at_idx ON jawaban_log(created_at);
CREATE INDEX IF NOT EXISTS student_ability_kursus_idx ON student_ability(kursus_id);
CREATE INDEX IF NOT EXISTS siswa_kursus_kursus_status_idx ON siswa_kursus(kursus_id, status);

-- =============================================================================
-- 5) ai_daily_costs — dari 0016_ai_daily_costs_view.sql
--    Jika VIEW masih dipakai dashboard; IF NOT EXISTS jadi no-op bila sudah ada.
--    Cron refresh: GET /api/v1/cron/refresh-ai-costs atau pg_cron (lihat 0016).
-- =============================================================================
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
  ON ai_daily_costs(user_id, day, model, request_type);

-- =============================================================================
-- 6) Safety net — kolom yang mungkin belum ada di prod (dari 0058)
--    ADD COLUMN IF NOT EXISTS — no-op jika sudah ada
-- =============================================================================
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS charged_amount INTEGER;
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS tingkat INTEGER;
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS fase VARCHAR(1);
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS token_input INTEGER;
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS token_output INTEGER;
ALTER TABLE file_materi ADD COLUMN IF NOT EXISTS kelas_id UUID REFERENCES kelas(id);
CREATE INDEX IF NOT EXISTS ai_generation_charged_amount_idx ON ai_generation(charged_amount);
CREATE INDEX IF NOT EXISTS ai_generation_tingkat_idx ON ai_generation(tingkat);

-- =============================================================================
-- 7) F3 P1 -- token_transactions idempotency (settle atomik)
--    UNIQUE (user_id, type, reference_id) WHERE reference_id IS NOT NULL
--    Menjamin ON CONFLICT DO NOTHING pada settleGenerationCost & refund/deduct
-- =============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS token_transactions_reference_unique
  ON token_transactions(user_id, type, reference_id) WHERE reference_id IS NOT NULL;
