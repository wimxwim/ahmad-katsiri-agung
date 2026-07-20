-- Add skill_id column to soal_published table
ALTER TABLE soal_published ADD COLUMN IF NOT EXISTS skill_id UUID REFERENCES skill(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS soal_published_skill_id_idx ON soal_published(skill_id);