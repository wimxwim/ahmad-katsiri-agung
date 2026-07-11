ALTER TABLE kelas ADD COLUMN IF NOT EXISTS kode_invite VARCHAR(6);
CREATE UNIQUE INDEX IF NOT EXISTS kelas_kode_invite_idx ON kelas (kode_invite) WHERE kode_invite IS NOT NULL;