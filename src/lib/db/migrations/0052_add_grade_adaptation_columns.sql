-- Migration 0052: Add grade-level adaptation columns
-- ai_generation: tingkat (integer) + fase (varchar 1)
-- file_materi: kelas_id (FK to kelas)

ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS tingkat INTEGER;
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS fase VARCHAR(1);

ALTER TABLE file_materi ADD COLUMN IF NOT EXISTS kelas_id UUID REFERENCES kelas(id);

CREATE INDEX IF NOT EXISTS ai_generation_tingkat_idx ON ai_generation(tingkat);
CREATE INDEX IF NOT EXISTS file_materi_kelas_id_idx ON file_materi(kelas_id);