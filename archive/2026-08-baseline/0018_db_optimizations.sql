-- Migration 0018: Database optimizations
-- Full-Text Search, Trigram indexes, Composite indexes, VACUUM schedule

-- DB1: Full-Text Search (tsvector + GIN) for kursus
ALTER TABLE kursus ADD COLUMN IF NOT EXISTS fts tsvector;
CREATE INDEX IF NOT EXISTS kursus_fts_idx ON kursus USING gin(fts);

-- Trigger to auto-update fts column on kursus
CREATE OR REPLACE FUNCTION kursus_fts_update() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('indonesian', COALESCE(NEW.judul, '') || ' ' || COALESCE(NEW.deskripsi, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kursus_fts_trigger ON kursus;
CREATE TRIGGER kursus_fts_trigger
  BEFORE INSERT OR UPDATE OF judul, deskripsi ON kursus
  FOR EACH ROW EXECUTE FUNCTION kursus_fts_update();

-- DB2: Trigram index for autocomplete on users.nama
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_users_nama_trgm ON users USING gin (nama gin_trgm_ops);

-- DB6: Composite indexes for heavy JOINs
CREATE INDEX IF NOT EXISTS idx_siswa_kursus_kursus_status ON siswa_kursus(kursus_id, status);
CREATE INDEX IF NOT EXISTS idx_jawaban_log_soal_created ON jawaban_log(soal_id, created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_siswa_quiz ON quiz_attempt(siswa_id, quiz_published_id);

-- DB5: VACUUM + ANALYZE schedule via pg_cron
-- Run weekly VACUUM ANALYZE on main tables
SELECT cron.schedule(
  'weekly-vacuum',
  '0 4 * * 0',
  'VACUUM ANALYZE users; VACUUM ANALYZE kursus; VACUUM ANALYZE jawaban_log; VACUUM ANALYZE quiz_attempt;'
);

-- Refresh materialized view daily at 3 AM
SELECT cron.schedule(
  'refresh-ai-costs',
  '0 3 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY ai_daily_costs'
);