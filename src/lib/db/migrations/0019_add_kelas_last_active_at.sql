-- Migration 0019: Add last_active_at to kelas table
-- Column exists in Drizzle schema but was never added to a migration file.
-- This caused production drift: kelas queries fail with "column does not exist".

ALTER TABLE kelas ADD COLUMN IF NOT EXISTS last_active_at timestamptz;