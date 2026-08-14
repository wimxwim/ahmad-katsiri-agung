-- 0058: add columns that exist in schema.ts but missing in live DB (no prior migration)
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS charged_amount INTEGER;
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS tingkat INTEGER;
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS fase VARCHAR(1);
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS token_input INTEGER;
ALTER TABLE ai_generation ADD COLUMN IF NOT EXISTS token_output INTEGER;
-- file_materi kelas_id from 0052 but ensure exists
ALTER TABLE file_materi ADD COLUMN IF NOT EXISTS kelas_id UUID REFERENCES kelas(id);
CREATE INDEX IF NOT EXISTS ai_generation_charged_amount_idx ON ai_generation(charged_amount);
CREATE INDEX IF NOT EXISTS ai_generation_tingkat_idx ON ai_generation(tingkat);
