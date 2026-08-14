-- Migration 0020: Fix recursive RLS + create app helper functions + add WITH CHECK
-- Root cause: migration 0014 Part 1 (app schema + functions) was never applied to production.
-- Production policies use inline current_setting() instead of app.current_*() helpers.
-- This migration is IDEMPOTENT — safe to run multiple times.

-- ============================================
-- PART 1: Create app schema and helper functions
-- ============================================

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION app.current_role()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT NULLIF(current_setting('app.current_role', TRUE), '');
$$;

CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', TRUE), '')::uuid;
$$;

-- Revoke public execute on app functions
REVOKE ALL ON FUNCTION app.current_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION app.current_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION app.current_tenant_id() FROM PUBLIC;

-- ============================================
-- PART 2: Fix recursive RLS on kelas <-> siswa_kelas
-- Strategy: helper function for non-recursive lookup
-- ============================================

-- Drop existing recursive policies
DROP POLICY IF EXISTS kelas_siswa_view ON kelas;
DROP POLICY IF EXISTS siswa_kelas_guru_policy ON siswa_kelas;

-- Create helper: check if siswa is enrolled in a kelas (non-recursive)
CREATE OR REPLACE FUNCTION app.is_siswa_in_kelas(kelas_id uuid, siswa_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM siswa_kelas sk
    WHERE sk.kelas_id = kelas_id
    AND sk.siswa_id = siswa_id
  );
$$;

REVOKE ALL ON FUNCTION app.is_siswa_in_kelas(uuid, uuid) FROM PUBLIC;

-- Create helper: check if guru owns a kelas (non-recursive)
CREATE OR REPLACE FUNCTION app.is_guru_of_kelas(kelas_id uuid, guru_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM kelas k
    WHERE k.id = kelas_id
    AND k.guru_id = guru_id
  );
$$;

REVOKE ALL ON FUNCTION app.is_guru_of_kelas(uuid, uuid) FROM PUBLIC;

-- Recreate kelas student policy (non-recursive via helper)
CREATE POLICY kelas_siswa_view ON kelas
  FOR SELECT
  TO public
  USING (
    app.is_siswa_in_kelas(kelas.id, app.current_user_id())
  );

-- Recreate siswa_kelas guru policy (non-recursive via helper)
CREATE POLICY siswa_kelas_guru_policy ON siswa_kelas
  FOR ALL
  TO public
  USING (
    app.is_guru_of_kelas(siswa_kelas.kelas_id, app.current_user_id())
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );

-- ============================================
-- PART 3: Add WITH CHECK for mutation policies
-- ============================================

-- ai_generation: prevent teacher from changing guru_id
DROP POLICY IF EXISTS ai_gen_teacher ON ai_generation;
CREATE POLICY ai_gen_teacher ON ai_generation
  FOR ALL
  TO public
  USING (guru_id = app.current_user_id())
  WITH CHECK (guru_id = app.current_user_id());

-- kelas: prevent teacher from changing guru_id
DROP POLICY IF EXISTS kelas_guru_policy ON kelas;
CREATE POLICY kelas_guru_policy ON kelas
  FOR ALL
  TO public
  USING (guru_id = app.current_user_id())
  WITH CHECK (guru_id = app.current_user_id());

-- kursus: consolidate policies + add WITH CHECK
DROP POLICY IF EXISTS kursus_teacher_delete ON kursus;
DROP POLICY IF EXISTS kursus_teacher_modify ON kursus;
DROP POLICY IF EXISTS kursus_teacher_update ON kursus;
CREATE POLICY kursus_teacher_modify ON kursus
  FOR INSERT
  TO public
  WITH CHECK (guru_id = app.current_user_id());
CREATE POLICY kursus_teacher_update ON kursus
  FOR UPDATE
  TO public
  USING (guru_id = app.current_user_id())
  WITH CHECK (guru_id = app.current_user_id());
CREATE POLICY kursus_teacher_delete ON kursus
  FOR DELETE
  TO public
  USING (guru_id = app.current_user_id());

-- ============================================
-- PART 4: Drop duplicate/useless policies
-- ============================================

-- kursus_read and kursus_view are identical (both USING true)
DROP POLICY IF EXISTS kursus_read ON kursus;
DROP POLICY IF EXISTS kursus_view ON kursus;

-- quiz_session_read and quiz_session_view are identical
DROP POLICY IF EXISTS quiz_session_read ON quiz_session;
DROP POLICY IF EXISTS quiz_session_view ON quiz_session;

-- soal_read and soal_view are identical
DROP POLICY IF EXISTS soal_read ON soal;
DROP POLICY IF EXISTS soal_view ON soal;

-- skill_read and skill_view are identical
DROP POLICY IF EXISTS skill_read ON skill;
DROP POLICY IF EXISTS skill_view ON skill;

-- sekolah_read and sekolah_view are identical
DROP POLICY IF EXISTS sekolah_read ON sekolah;
DROP POLICY IF EXISTS sekolah_view ON sekolah;

-- pengumuman_read and pengumuman_view are identical
DROP POLICY IF EXISTS pengumuman_read ON pengumuman;
DROP POLICY IF EXISTS pengumuman_view ON pengumuman;

-- Replace with single policies
CREATE POLICY kursus_view ON kursus FOR SELECT TO public USING (true);
CREATE POLICY quiz_session_view ON quiz_session FOR SELECT TO public USING (true);
CREATE POLICY soal_view ON soal FOR SELECT TO public USING (true);
CREATE POLICY skill_view ON skill FOR SELECT TO public USING (true);
CREATE POLICY sekolah_view ON sekolah FOR SELECT TO public USING (true);
CREATE POLICY pengumuman_view ON pengumuman FOR SELECT TO public USING (true);

-- ============================================
-- PART 5: Add missing index for kelas (already done in 0019, idempotent here)
-- ============================================

-- Index for kelas guru queries
CREATE INDEX IF NOT EXISTS kelas_guru_deleted_idx ON kelas(guru_id, deleted_at, created_at DESC);

-- ============================================
-- Migration complete
-- ============================================