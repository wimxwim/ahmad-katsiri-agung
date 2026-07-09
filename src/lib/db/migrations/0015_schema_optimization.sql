-- Migration 0015: Schema Optimization (Gelombang 24)
-- Priority P0: Direct tenant filtering for deep tables
-- Priority P1: Missing timestamps, indexes, unique constraints

-- ============================================
-- P0: skill — add sekolah_id for direct tenant filter (2 hop → 1 hop)
-- ============================================
ALTER TABLE "skill"
  ADD COLUMN IF NOT EXISTS "sekolah_id" uuid REFERENCES "sekolah"("id"),
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS "skill_sekolah_id_idx" ON "skill"("sekolah_id");

-- ============================================
-- P0: soal — add sekolah_id for direct tenant filter (3-4 hop → 1 hop)
-- ============================================
ALTER TABLE "soal"
  ADD COLUMN IF NOT EXISTS "sekolah_id" uuid REFERENCES "sekolah"("id");

CREATE INDEX IF NOT EXISTS "soal_sekolah_id_idx" ON "soal"("sekolah_id");

-- ============================================
-- P0: kursus — unique slug per-sekolah (bukan global)
-- ============================================
ALTER TABLE "kursus" DROP CONSTRAINT IF EXISTS "kursus_slug_unique";
ALTER TABLE "kursus"
  ADD CONSTRAINT "kursus_slug_sekolah_unique" UNIQUE("slug", "sekolah_id");

-- ============================================
-- P0: quizSession — add critical missing index + sekolah_id
-- ============================================
ALTER TABLE "quiz_session"
  ADD COLUMN IF NOT EXISTS "sekolah_id" uuid REFERENCES "sekolah"("id");

CREATE INDEX IF NOT EXISTS "quiz_session_kursus_id_idx" ON "quiz_session"("kursus_id");
CREATE INDEX IF NOT EXISTS "quiz_session_sekolah_id_idx" ON "quiz_session"("sekolah_id");
CREATE INDEX IF NOT EXISTS "quiz_session_is_active_idx" ON "quiz_session"("is_active");

-- ============================================
-- P1: jawabanLog — add sekolah_id for direct tenant filter
-- ============================================
ALTER TABLE "jawaban_log"
  ADD COLUMN IF NOT EXISTS "sekolah_id" uuid REFERENCES "sekolah"("id"),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS "jawaban_log_sekolah_id_idx" ON "jawaban_log"("sekolah_id");

-- ============================================
-- P1: skillMastery — add sekolah_id for direct tenant filter
-- ============================================
ALTER TABLE "skill_mastery"
  ADD COLUMN IF NOT EXISTS "sekolah_id" uuid REFERENCES "sekolah"("id");

CREATE INDEX IF NOT EXISTS "skill_mastery_sekolah_id_idx" ON "skill_mastery"("sekolah_id");

-- ============================================
-- P1: riskSnapshot — add sekolah_id for direct tenant filter
-- ============================================
ALTER TABLE "risk_snapshot"
  ADD COLUMN IF NOT EXISTS "sekolah_id" uuid REFERENCES "sekolah"("id");

CREATE INDEX IF NOT EXISTS "risk_snapshot_sekolah_id_idx" ON "risk_snapshot"("sekolah_id");

-- ============================================
-- P1: remedialRecommendation — add sekolah_id
-- ============================================
ALTER TABLE "remedial_recommendation"
  ADD COLUMN IF NOT EXISTS "sekolah_id" uuid REFERENCES "sekolah"("id"),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS "remedial_recommendation_sekolah_id_idx" ON "remedial_recommendation"("sekolah_id");

-- ============================================
-- P1: sertifikat — add sekolah_id + updated_at
-- ============================================
ALTER TABLE "sertifikat"
  ADD COLUMN IF NOT EXISTS "sekolah_id" uuid REFERENCES "sekolah"("id"),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS "sertifikat_sekolah_id_idx" ON "sertifikat"("sekolah_id");

-- ============================================
-- P1: Composite indexes for common multi-tenant query patterns
-- ============================================

-- skill: frequent pattern "all skills for kursus belonging to my school"
CREATE INDEX IF NOT EXISTS "skill_sekolah_kursus_idx" ON "skill"("sekolah_id", "kursus_id");

-- soal: frequent pattern "all soal for skill in my school"
CREATE INDEX IF NOT EXISTS "soal_sekolah_skill_idx" ON "soal"("sekolah_id", "skill_id");

-- jawabanLog: frequent pattern "student answers in my school, ordered by time"
CREATE INDEX IF NOT EXISTS "jawaban_log_sekolah_siswa_idx" ON "jawaban_log"("sekolah_id", "siswa_id", "created_at");

-- quizSession: frequent pattern "active quizzes in my school"
CREATE INDEX IF NOT EXISTS "quiz_session_sekolah_active_idx" ON "quiz_session"("sekolah_id", "is_active");

-- ============================================
-- RLS: Update policies for new sekolah_id columns
-- ============================================

-- Policy for soal table
DROP POLICY IF EXISTS "soal_select_policy" ON "soal";
CREATE POLICY "soal_select_policy" ON "soal" FOR SELECT USING (
  sekolah_id = app.current_tenant_id()
  OR app.current_role() IN ('owner', 'admin_sekolah')
);

-- Policy for jawaban_log table
DROP POLICY IF EXISTS "jawaban_log_select_policy" ON "jawaban_log";
CREATE POLICY "jawaban_log_select_policy" ON "jawaban_log" FOR SELECT USING (
  sekolah_id = app.current_tenant_id()
  OR siswa_id = app.current_user_id()
  OR app.current_role() IN ('owner', 'admin_sekolah')
);

-- Policy for sertifikat table  
DROP POLICY IF EXISTS "sertifikat_select_policy" ON "sertifikat";
CREATE POLICY "sertifikat_select_policy" ON "sertifikat" FOR SELECT USING (
  sekolah_id = app.current_tenant_id()
  OR siswa_id = app.current_user_id()
  OR app.current_role() IN ('owner', 'admin_sekolah')
);

-- Policy for skill_mastery table
DROP POLICY IF EXISTS "skill_mastery_select_policy" ON "skill_mastery";
CREATE POLICY "skill_mastery_select_policy" ON "skill_mastery" FOR SELECT USING (
  sekolah_id = app.current_tenant_id()
  OR siswa_id = app.current_user_id()
  OR app.current_role() IN ('owner', 'admin_sekolah')
);
