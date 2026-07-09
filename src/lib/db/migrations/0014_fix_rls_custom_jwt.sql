-- Migration 0014: Fix RLS for custom JWT auth
-- AKAL Center uses custom JWT (not Supabase Auth), so auth.uid() is NULL.
-- This migration replaces auth.uid() with current_setting('app.*') pattern.
-- Application layer must call: SET LOCAL app.user_id = '...', app.tenant_id = '...', app.role = '...'
-- before each database session/transaction.

-- ============================================
-- PART 1: Create helper functions
-- ============================================

-- Create app schema for helper functions (not the public schema)
CREATE SCHEMA IF NOT EXISTS app;

-- Helper to get current user ID from session setting
CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', TRUE), '')::uuid;
$$;

-- Helper to get current tenant ID from session setting
CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.tenant_id', TRUE), '')::uuid;
$$;

-- Helper to get current user role from session setting
CREATE OR REPLACE FUNCTION app.current_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.role', TRUE), '');
$$;

-- ============================================
-- PART 2: Drop existing RLS policies (from 0013)
-- ============================================

DROP POLICY IF EXISTS ai_generation_guru_policy ON ai_generation;
DROP POLICY IF EXISTS kelas_guru_policy ON kelas;
DROP POLICY IF EXISTS kelas_siswa_policy ON kelas;
DROP POLICY IF EXISTS materi_published_view_policy ON materi_published;
DROP POLICY IF EXISTS materi_read_siswa_policy ON materi_read;
DROP POLICY IF EXISTS quiz_attempt_siswa_policy ON quiz_attempt;
DROP POLICY IF EXISTS quiz_published_view_policy ON quiz_published;
DROP POLICY IF EXISTS refresh_tokens_user_policy ON refresh_tokens;
DROP POLICY IF EXISTS siswa_kelas_guru_policy ON siswa_kelas;
DROP POLICY IF EXISTS siswa_kelas_siswa_policy ON siswa_kelas;
DROP POLICY IF EXISTS soal_published_view_policy ON soal_published;
DROP POLICY IF EXISTS users_parent_access_policy ON users;

-- ============================================
-- PART 3: Create new RLS policies using app.* helpers
-- ============================================

-- 1. ai_generation — Guru hanya bisa lihat/mengelola AI generation sendiri
ALTER TABLE ai_generation ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_generation_guru_policy ON ai_generation
  FOR ALL
  TO public
  USING (guru_id = app.current_user_id());

-- 2. kelas — Guru bisa lihat kelas yang dia ajar, siswa bisa lihat kelasnya
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY kelas_guru_policy ON kelas
  FOR SELECT
  TO public
  USING (
    app.current_role() IN ('guru', 'admin_sekolah', 'owner')
    AND guru_id = app.current_user_id()
  );
CREATE POLICY kelas_siswa_policy ON kelas
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM siswa_kelas
      WHERE siswa_kelas.kelas_id = kelas.id
      AND siswa_kelas.siswa_id = app.current_user_id()
    )
  );

-- 3. materi_published — Semua authenticated user bisa lihat published materi
ALTER TABLE materi_published ENABLE ROW LEVEL SECURITY;
CREATE POLICY materi_published_view_policy ON materi_published
  FOR SELECT
  TO public
  USING (app.current_user_id() IS NOT NULL);

-- 4. materi_read — Siswa hanya bisa lihat progress membaca sendiri
ALTER TABLE materi_read ENABLE ROW LEVEL SECURITY;
CREATE POLICY materi_read_siswa_policy ON materi_read
  FOR ALL
  TO public
  USING (siswa_id = app.current_user_id());

-- 5. quiz_attempt — Siswa hanya bisa lihat quiz attempt sendiri
ALTER TABLE quiz_attempt ENABLE ROW LEVEL SECURITY;
CREATE POLICY quiz_attempt_siswa_policy ON quiz_attempt
  FOR ALL
  TO public
  USING (siswa_id = app.current_user_id());

-- 6. quiz_published — Semua authenticated user bisa lihat published quiz
ALTER TABLE quiz_published ENABLE ROW LEVEL SECURITY;
CREATE POLICY quiz_published_view_policy ON quiz_published
  FOR SELECT
  TO public
  USING (app.current_user_id() IS NOT NULL);

-- 7. refresh_tokens — User hanya bisa lihat token mereka sendiri
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY refresh_tokens_user_policy ON refresh_tokens
  FOR ALL
  TO public
  USING (user_id = app.current_user_id());

-- 8. siswa_kelas — Guru bisa manage siswa di kelasnya, siswa lihat enrollment sendiri
ALTER TABLE siswa_kelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY siswa_kelas_guru_policy ON siswa_kelas
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM kelas
      WHERE kelas.id = siswa_kelas.kelas_id
      AND kelas.guru_id = app.current_user_id()
    )
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );
CREATE POLICY siswa_kelas_siswa_policy ON siswa_kelas
  FOR SELECT
  TO public
  USING (siswa_id = app.current_user_id());

-- 9. soal_published — Semua authenticated user bisa lihat published soal
ALTER TABLE soal_published ENABLE ROW LEVEL SECURITY;
CREATE POLICY soal_published_view_policy ON soal_published
  FOR SELECT
  TO public
  USING (app.current_user_id() IS NOT NULL);

-- 10. users — User lihat dirinya sendiri + parent akses anak + guru lihat semua
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_access_policy ON users
  FOR SELECT
  TO public
  USING (
    id = app.current_user_id()
    OR parent_id = app.current_user_id()
    OR app.current_role() IN ('guru', 'admin_sekolah', 'owner')
  );

-- ============================================
-- PART 4: Tenant-scoped RLS for main tables
-- ============================================

-- kursus — Guru hanya bisa lihat kursus sendiri + published kursus untuk siswa
ALTER TABLE kursus ENABLE ROW LEVEL SECURITY;
CREATE POLICY kursus_guru_policy ON kursus
  FOR ALL
  TO public
  USING (
    guru_id = app.current_user_id()
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );
CREATE POLICY kursus_siswa_policy ON kursus
  FOR SELECT
  TO public
  USING (
    is_public = true
    AND status_publikasi = 'PUBLIK'
  );

-- soal — Guru lihat soal di skill mereka
ALTER TABLE soal ENABLE ROW LEVEL SECURITY;
CREATE POLICY soal_guru_policy ON soal
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM skill
      JOIN kursus ON kursus.id = skill.kursus_id
      WHERE skill.id = soal.skill_id
      AND kursus.guru_id = app.current_user_id()
    )
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );

-- jawaban_log — Siswa lihat jawaban sendiri, guru lihat jawaban siswa di kursus mereka
ALTER TABLE jawaban_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY jawaban_log_siswa_policy ON jawaban_log
  FOR ALL
  TO public
  USING (
    siswa_id = app.current_user_id()
    OR app.current_role() IN ('guru', 'admin_sekolah', 'owner')
  );

-- sertifikat — Siswa lihat sertifikat sendiri
ALTER TABLE sertifikat ENABLE ROW LEVEL SECURITY;
CREATE POLICY sertifikat_siswa_policy ON sertifikat
  FOR SELECT
  TO public
  USING (
    siswa_id = app.current_user_id()
    OR app.current_role() IN ('guru', 'admin_sekolah', 'owner')
  );

-- transaksi — Siswa lihat transaksi sendiri, admin lihat semua
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
CREATE POLICY transaksi_siswa_policy ON transaksi
  FOR ALL
  TO public
  USING (
    siswa_id = app.current_user_id()
    OR app.current_role() IN ('guru', 'admin_sekolah', 'owner')
  );

-- pengumuman — Guru lihat pengumuman sendiri, siswa lihat pengumuman yang ditarget ke mereka
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
CREATE POLICY pengumuman_guru_policy ON pengumuman
  FOR ALL
  TO public
  USING (
    guru_id = app.current_user_id()
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );
CREATE POLICY pengumuman_siswa_policy ON pengumuman
  FOR SELECT
  TO public
  USING (
    (target = 'SEMUA' OR target = app.current_role())
    AND app.current_user_id() IS NOT NULL
  );

-- file_materi — Guru lihat file mereka sendiri
ALTER TABLE file_materi ENABLE ROW LEVEL SECURITY;
CREATE POLICY file_materi_guru_policy ON file_materi
  FOR ALL
  TO public
  USING (
    guru_id = app.current_user_id()
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );

-- studentAbility — Siswa lihat ability sendiri
ALTER TABLE studentAbility ENABLE ROW LEVEL SECURITY;
CREATE POLICY studentAbility_siswa_policy ON studentAbility
  FOR SELECT
  TO public
  USING (
    siswa_id = app.current_user_id()
    OR app.current_role() IN ('guru', 'admin_sekolah', 'owner')
  );

-- skillMastery — Siswa lihat mastery sendiri
ALTER TABLE skillMastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY skillMastery_siswa_policy ON skillMastery
  FOR SELECT
  TO public
  USING (
    siswa_id = app.current_user_id()
    OR app.current_role() IN ('guru', 'admin_sekolah', 'owner')
  );

-- riskSnapshot — Siswa lihat risk sendiri
ALTER TABLE riskSnapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY riskSnapshot_siswa_policy ON riskSnapshot
  FOR SELECT
  TO public
  USING (
    siswa_id = app.current_user_id()
    OR app.current_role() IN ('guru', 'admin_sekolah', 'owner')
  );

-- remedialRecommendation — Siswa lihat rekomendasi sendiri
ALTER TABLE remedialRecommendation ENABLE ROW LEVEL SECURITY;
CREATE POLICY remedialRecommendation_siswa_policy ON remedialRecommendation
  FOR SELECT
  TO public
  USING (
    siswa_id = app.current_user_id()
    OR app.current_role() IN ('guru', 'admin_sekolah', 'owner')
  );

-- quiz_session — Guru lihat quiz session mereka
ALTER TABLE quiz_session ENABLE ROW LEVEL SECURITY;
CREATE POLICY quiz_session_guru_policy ON quiz_session
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM kursus
      WHERE kursus.id = quiz_session.kursus_id
      AND kursus.guru_id = app.current_user_id()
    )
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );

-- google_drive_auth — Guru lihat auth mereka sendiri
ALTER TABLE googleDriveAuth ENABLE ROW LEVEL SECURITY;
CREATE POLICY google_drive_auth_guru_policy ON googleDriveAuth
  FOR ALL
  TO public
  USING (
    guru_id = app.current_user_id()
    OR app.current_role() IN ('owner')
  );

-- teacher_readiness_snapshot — Guru lihat snapshot sendiri
ALTER TABLE teacherReadinessSnapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY teacher_readiness_snapshot_guru_policy ON teacherReadinessSnapshot
  FOR SELECT
  TO public
  USING (
    guru_id = app.current_user_id()
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );

-- ============================================
-- PART 5: Additional composite indexes
-- ============================================

-- Composite index untuk pattern query umum: tenant scope + timestamp
CREATE INDEX IF NOT EXISTS kursus_tenant_created_idx ON kursus(sekolah_id, created_at);
CREATE INDEX IF NOT EXISTS users_tenant_role_idx ON users(sekolah_id, role);
CREATE INDEX IF NOT EXISTS pengumuman_tenant_created_idx ON pengumuman(sekolah_id, created_at);

-- Composite index untuk jawaban_log: student + course (via skill/kursus chain)
-- jawaban_log → soal → skill → kursus
CREATE INDEX IF NOT EXISTS jawaban_log_siswa_benar_idx ON jawaban_log(siswa_id, is_benar);

-- Index untuk quiz attempt performance analytics
CREATE INDEX IF NOT EXISTS quiz_attempt_nilai_idx ON quiz_attempt(siswa_id, nilai, waktu_selesai);

-- Index untuk file_materi guru + status queries
CREATE INDEX IF NOT EXISTS file_materi_guru_status_idx ON file_materi(guru_id, status);

-- ============================================
-- PART 6: Application-layer note
-- ============================================
-- After applying this migration, the application layer must set session variables
-- before any database query:
--
--   await db.execute(sql`
--     SET LOCAL app.user_id = ${userId};
--     SET LOCAL app.tenant_id = ${sekolahId};
--     SET LOCAL app.role = ${role};
--   `);
--
-- This is typically done in middleware.ts or a db wrapper.
-- Tables with RLS enabled but no matching setting will return 0 rows.

-- ============================================
-- Migration complete
-- ============================================
