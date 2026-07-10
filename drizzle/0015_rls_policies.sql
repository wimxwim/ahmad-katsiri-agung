-- Migration: RLS Policies + FK Indexes + Tenant Context
-- AKAL Center — Fase 2 Database Security
-- 
-- CATATAN: RLS hanya aktif jika connecting role bukan bypass (service_role/postgres).
-- Saat ini app connect sebagai postgres → RLS di-skip.
-- Policy ini siap diaktifkan ketika app beralih ke role non-bypass.
-- Sementara, gunakan aplikasi-level auth (route-guard-v2.ts) + queries dengan filter eksplisit.

-- ============================================================
-- 1. ENABLE RLS DI SEMUA TABEL
-- ============================================================

ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kursus ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS skill ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS siswa_kursus ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS materi_published ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quiz_published ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quiz_attempt ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS materi_read ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS soal_published ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jawaban_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS siswa_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sertifikat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_store ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. RLS POLICIES — MENGGUNAKAN app.current_user_id
-- ============================================================

-- users: lihat profil sendiri
DROP POLICY IF EXISTS "users_self_select" ON users;
CREATE POLICY "users_self_select" ON users
  FOR SELECT
  USING (id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- users: update profil sendiri
DROP POLICY IF EXISTS "users_self_update" ON users;
CREATE POLICY "users_self_update" ON users
  FOR UPDATE
  USING (id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- kursus: guru lihat kursus sendiri, publik lihat yang is_public
DROP POLICY IF EXISTS "kursus_teacher_or_public" ON kursus;
CREATE POLICY "kursus_teacher_or_public" ON kursus
  FOR SELECT
  USING (
    guru_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    OR is_public = true
  );

-- kursus: guru insert/edit/delete kursus sendiri
DROP POLICY IF EXISTS "kursus_teacher_modify" ON kursus;
CREATE POLICY "kursus_teacher_modify" ON kursus
  FOR INSERT
  WITH CHECK (guru_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

DROP POLICY IF EXISTS "kursus_teacher_update" ON kursus;
CREATE POLICY "kursus_teacher_update" ON kursus
  FOR UPDATE
  USING (guru_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

DROP POLICY IF EXISTS "kursus_teacher_delete" ON kursus;
CREATE POLICY "kursus_teacher_delete" ON kursus
  FOR DELETE
  USING (guru_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- siswa_kursus: siswa lihat enrollment sendiri
DROP POLICY IF EXISTS "siswa_kursus_self" ON siswa_kursus;
CREATE POLICY "siswa_kursus_self" ON siswa_kursus
  FOR SELECT
  USING (siswa_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- siswa_kursus: guru lihat siswa di kursusnya
DROP POLICY IF EXISTS "siswa_kursus_teacher" ON siswa_kursus;
CREATE POLICY "siswa_kursus_teacher" ON siswa_kursus
  FOR SELECT
  USING (
    kursus_id IN (
      SELECT id FROM kursus
      WHERE guru_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    )
  );

-- ai_generation: guru lihat draft sendiri
DROP POLICY IF EXISTS "ai_gen_teacher" ON ai_generation;
CREATE POLICY "ai_gen_teacher" ON ai_generation
  FOR ALL
  USING (guru_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- materi_published: guru lihat materi di kursusnya
DROP POLICY IF EXISTS "materi_pub_teacher" ON materi_published;
CREATE POLICY "materi_pub_teacher" ON materi_published
  FOR SELECT
  USING (
    kursus_id IN (
      SELECT id FROM kursus
      WHERE guru_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    )
    OR is_public = true
  );

-- quiz_attempt: siswa lihat attempt sendiri
DROP POLICY IF EXISTS "quiz_attempt_self" ON quiz_attempt;
CREATE POLICY "quiz_attempt_self" ON quiz_attempt
  FOR SELECT
  USING (siswa_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- ============================================================
-- 3. FK INDEXES UNTUK PERFORMA RLS + QUERY
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_kursus_guru_id ON kursus(guru_id);
CREATE INDEX IF NOT EXISTS idx_kursus_is_public ON kursus(is_public);
CREATE INDEX IF NOT EXISTS idx_siswa_kursus_siswa_id ON siswa_kursus(siswa_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_guru_id ON ai_generation(guru_id);
CREATE INDEX IF NOT EXISTS idx_materi_published_kursus_id ON materi_published(kursus_id);
CREATE INDEX IF NOT EXISTS idx_quiz_published_kursus_id ON quiz_published(kursus_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_siswa_id ON quiz_attempt(siswa_id);
CREATE INDEX IF NOT EXISTS idx_materi_read_siswa_id ON materi_read(siswa_id);
CREATE INDEX IF NOT EXISTS idx_soal_kursus_id ON soal(kursus_id);
CREATE INDEX IF NOT EXISTS idx_jawaban_log_soal_id ON jawaban_log(soal_id);
CREATE INDEX IF NOT EXISTS idx_kelas_guru_id ON kelas(guru_id);
CREATE INDEX IF NOT EXISTS idx_siswa_kelas_siswa_id ON siswa_kelas(siswa_id);
CREATE INDEX IF NOT EXISTS idx_pengumuman_sekolah_id ON pengumuman(sekolah_id);
CREATE INDEX IF NOT EXISTS idx_event_store_user_id ON event_store(user_id);
