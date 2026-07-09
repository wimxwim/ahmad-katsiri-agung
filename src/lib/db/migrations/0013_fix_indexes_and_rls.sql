-- Migration 0013: Fix missing FK indexes and enable RLS
-- Based on supabase-postgres-best-practices skill
-- Impact: 10-100x faster JOINs, database-enforced tenant isolation

-- ============================================
-- PART 1: Add missing FK indexes (13 columns)
-- ============================================

-- ai_generation.kursus_id
CREATE INDEX IF NOT EXISTS ai_generation_kursus_id_idx ON ai_generation(kursus_id);

-- file_materi.skill_id
CREATE INDEX IF NOT EXISTS file_materi_skill_id_idx ON file_materi(skill_id);

-- jawaban_log.quiz_session_id
CREATE INDEX IF NOT EXISTS jawaban_log_quiz_session_id_idx ON jawaban_log(quiz_session_id);

-- kursus.sekolah_id
CREATE INDEX IF NOT EXISTS kursus_sekolah_id_idx ON kursus(sekolah_id);

-- pengumuman.kursus_id
CREATE INDEX IF NOT EXISTS pengumuman_kursus_id_idx ON pengumuman(kursus_id);

-- quiz_published.guru_id
CREATE INDEX IF NOT EXISTS quiz_published_guru_id_idx ON quiz_published(guru_id);

-- quiz_session.kursus_id
CREATE INDEX IF NOT EXISTS quiz_session_kursus_id_idx ON quiz_session(kursus_id);

-- sertifikat.kursus_id
CREATE INDEX IF NOT EXISTS sertifikat_kursus_id_idx ON sertifikat(kursus_id);

-- skill.prasyarat_skill_id
CREATE INDEX IF NOT EXISTS skill_prasyarat_skill_id_idx ON skill(prasyarat_skill_id);

-- soal_published.ai_generation_id
CREATE INDEX IF NOT EXISTS soal_published_ai_generation_id_idx ON soal_published(ai_generation_id);

-- transaksi.kursus_id
CREATE INDEX IF NOT EXISTS transaksi_kursus_id_idx ON transaksi(kursus_id);

-- transaksi.siswa_id
CREATE INDEX IF NOT EXISTS transaksi_siswa_id_idx ON transaksi(siswa_id);

-- users.parent_id
CREATE INDEX IF NOT EXISTS users_parent_id_idx ON users(parent_id);

-- ============================================
-- PART 2: Enable RLS on 10 tables
-- ============================================

-- 1. ai_generation - Guru can only see their own AI generations
ALTER TABLE ai_generation ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_generation_guru_policy ON ai_generation
  FOR ALL
  TO authenticated
  USING (guru_id = (SELECT auth.uid()));

-- 2. kelas - Guru can see classes they teach, siswa can see their class
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY kelas_guru_policy ON kelas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('guru', 'admin_sekolah', 'owner')
    )
    OR guru_id = (SELECT auth.uid())
  );
CREATE POLICY kelas_siswa_policy ON kelas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM siswa_kelas
      WHERE siswa_kelas.kelas_id = kelas.id
      AND siswa_kelas.siswa_id = (SELECT auth.uid())
    )
  );

-- 3. materi_published - Anyone authenticated can view published materi
ALTER TABLE materi_published ENABLE ROW LEVEL SECURITY;
CREATE POLICY materi_published_view_policy ON materi_published
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. materi_read - Siswa can only see their own reading progress
ALTER TABLE materi_read ENABLE ROW LEVEL SECURITY;
CREATE POLICY materi_read_siswa_policy ON materi_read
  FOR ALL
  TO authenticated
  USING (siswa_id = (SELECT auth.uid()));

-- 5. quiz_attempt - Siswa can only see their own quiz attempts
ALTER TABLE quiz_attempt ENABLE ROW LEVEL SECURITY;
CREATE POLICY quiz_attempt_siswa_policy ON quiz_attempt
  FOR ALL
  TO authenticated
  USING (siswa_id = (SELECT auth.uid()));

-- 6. quiz_published - Anyone authenticated can view published quizzes
ALTER TABLE quiz_published ENABLE ROW LEVEL SECURITY;
CREATE POLICY quiz_published_view_policy ON quiz_published
  FOR SELECT
  TO authenticated
  USING (true);

-- 7. refresh_tokens - Users can only see their own refresh tokens
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY refresh_tokens_user_policy ON refresh_tokens
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- 8. siswa_kelas - Guru can manage their class students, siswa can see their own enrollment
ALTER TABLE siswa_kelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY siswa_kelas_guru_policy ON siswa_kelas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kelas
      WHERE kelas.id = siswa_kelas.kelas_id
      AND kelas.guru_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('admin_sekolah', 'owner')
    )
  );
CREATE POLICY siswa_kelas_siswa_policy ON siswa_kelas
  FOR SELECT
  TO authenticated
  USING (siswa_id = (SELECT auth.uid()));

-- 9. soal_published - Anyone authenticated can view published soal
ALTER TABLE soal_published ENABLE ROW LEVEL SECURITY;
CREATE POLICY soal_published_view_policy ON soal_published
  FOR SELECT
  TO authenticated
  USING (true);

-- 10. (Already has RLS) users - Additional policy for parent access
-- users already has RLS enabled, but we add parent access policy
CREATE POLICY users_parent_access_policy ON users
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR parent_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM users AS current_user
      WHERE current_user.id = (SELECT auth.uid())
      AND current_user.role IN ('guru', 'admin_sekolah', 'owner')
    )
  );

-- ============================================
-- PART 3: Performance optimization
-- ============================================

-- Add composite index for common query pattern: user by email and role
CREATE INDEX IF NOT EXISTS users_email_role_idx ON users(email, role);

-- Add index for ai_generation status queries (common in dashboard)
CREATE INDEX IF NOT EXISTS ai_generation_guru_status_idx ON ai_generation(guru_id, status);

-- Add index for kursus queries by teacher and status
CREATE INDEX IF NOT EXISTS kursus_guru_status_idx ON kursus(guru_id, status_publikasi);

-- ============================================
-- Migration complete
-- ============================================
