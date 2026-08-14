-- Migration 0051: Fix jawaban_log.soal_id FK to reference soal_published
-- Root cause: FK referenced soal(id) which is empty (0 rows). soal_published has 240 rows.

ALTER TABLE jawaban_log DROP CONSTRAINT IF EXISTS jawaban_log_soal_id_soal_id_fk;
ALTER TABLE jawaban_log ADD CONSTRAINT jawaban_log_soal_id_soal_published_id_fk FOREIGN KEY (soal_id) REFERENCES soal_published(id) ON DELETE CASCADE;