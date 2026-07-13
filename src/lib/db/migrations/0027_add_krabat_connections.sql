-- Migration 0027: Add krabat_connections table
-- Fase 4 — Materi Sharing (koneksi antar guru)

DO $$ BEGIN
  CREATE TYPE "krabat_status" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "krabat_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "guru_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "connected_guru_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" "krabat_status" NOT NULL DEFAULT 'PENDING',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "krabat_connections_pair_unique" UNIQUE("guru_id", "connected_guru_id")
);

CREATE INDEX IF NOT EXISTS "krabat_connections_guru_idx" ON "krabat_connections" ("guru_id", "status");
CREATE INDEX IF NOT EXISTS "krabat_connections_connected_idx" ON "krabat_connections" ("connected_guru_id", "status");

ALTER TABLE krabat_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY krabat_connections_owner_policy ON krabat_connections
  FOR ALL
  USING (
    guru_id = app.current_user_id()
    OR connected_guru_id = app.current_user_id()
  );

CREATE POLICY krabat_connections_view_policy ON krabat_connections
  FOR SELECT
  USING (
    guru_id = app.current_user_id()
    OR connected_guru_id = app.current_user_id()
  );