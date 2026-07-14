-- 0029: CHECK constraint + missing indexes
-- Prasyarat: tidak ada row dengan balance < 0 di token_balances

-- CHECK constraint: saldo tidak boleh negatif
ALTER TABLE token_balances ADD CONSTRAINT token_balances_balance_check CHECK (balance >= 0);

-- Indexes on file_materi (foreign key columns + status filter)
CREATE INDEX IF NOT EXISTS file_materi_guru_id_idx ON file_materi(guru_id);
CREATE INDEX IF NOT EXISTS file_materi_kursus_id_idx ON file_materi(kursus_id);
CREATE INDEX IF NOT EXISTS file_materi_status_idx ON file_materi(status);