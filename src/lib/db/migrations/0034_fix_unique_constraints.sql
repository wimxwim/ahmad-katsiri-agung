-- 0034_fix_unique_constraints_and_indexes.sql
-- Fix: 10 audit temuan verified 15 Jul 2026

-- 3. Race condition duplicate CBT attempt
-- Partial unique index: hanya 1 attempt SELESAI per siswa per quiz
CREATE UNIQUE INDEX IF NOT EXISTS quiz_attempt_siswa_quiz_done_unique
  ON quiz_attempt (siswa_id, quiz_published_id, status)
  WHERE status = 'SELESAI';

-- 9. Duplicate nama kelas dalam 1 guru
CREATE UNIQUE INDEX IF NOT EXISTS kelas_nama_guru_unique
  ON kelas (nama, guru_id)
  WHERE deleted_at IS NULL;