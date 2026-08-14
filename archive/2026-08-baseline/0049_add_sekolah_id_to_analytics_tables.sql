-- Migration 0049: Add sekolah_id to analytics tables
-- Root cause: Drizzle schema defines sekolahId but migration never applied

ALTER TABLE quiz_session ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES sekolah(id);
ALTER TABLE jawaban_log ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES sekolah(id);
ALTER TABLE student_ability ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES sekolah(id);
ALTER TABLE risk_snapshot ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES sekolah(id);
ALTER TABLE skill_mastery ADD COLUMN IF NOT EXISTS sekolah_id UUID REFERENCES sekolah(id);