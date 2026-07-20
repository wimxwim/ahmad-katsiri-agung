-- Migration 0050: Add updated_at to jawaban_log
-- Root cause: Drizzle schema defines updatedAt but column missing from DB

ALTER TABLE jawaban_log ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();