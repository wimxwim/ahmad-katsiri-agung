-- 0033_critical_missing_indexes.sql
-- Fix: composite indexes untuk query dashboard siswa yang paling sering dipanggil
-- Audit 15 Jul 2026 — 3 index kritis MISSING dari schema

-- 1. siswa_kursus(siswa_id, status) — query utama di dashboard
--    Setiap buka dashboard: WHERE siswa_id = ? AND status = 'AKTIF'
--    Tanpa ini → sequential scan
CREATE INDEX IF NOT EXISTS idx_siswa_kursus_siswa_status ON siswa_kursus (siswa_id, status);

-- 2. materi_read(siswa_id, materi_published_id) — query "has student read this?"
--    Setiap load materi list: WHERE siswa_id = ? AND materi_published_id IN (...)
--    Index terpisah (siswa_id, read_at) dan (materi_published_id) tidak cover query ini
CREATE INDEX IF NOT EXISTS idx_materi_read_siswa_materi ON materi_read (siswa_id, materi_published_id);

-- 3. siswa_kursus(siswa_id) — standalone FK index
--    Hanya ada di drizzle/ folder (mungkin belum applied)
--    Setiap JOIN dari users ke siswa_kursus butuh ini
CREATE INDEX IF NOT EXISTS idx_siswa_kursus_siswa_id ON siswa_kursus (siswa_id);

-- 4. remedial_recommendation(siswa_id) — FK index, TIDAK ADA di mana pun
CREATE INDEX IF NOT EXISTS idx_remedial_recommendation_siswa ON remedial_recommendation (siswa_id);