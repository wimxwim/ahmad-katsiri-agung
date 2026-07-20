-- Add missing invite fields to kursus table
ALTER TABLE kursus ADD COLUMN IF NOT EXISTS kode_invite VARCHAR(8);
ALTER TABLE kursus ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMPTZ;
