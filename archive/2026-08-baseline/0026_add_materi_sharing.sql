-- Migration 0026: Add materi_sharing table
-- Fase 4 — Materi Sharing (PRIVAT/PUBLIK/KRABAT/ARSIP)

DO $$ BEGIN
  CREATE TYPE "visibility" AS ENUM ('PRIVAT', 'PUBLIK', 'KRABAT', 'ARSIP');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "approval_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "materi_sharing" (
  "materi_published_id" uuid PRIMARY KEY REFERENCES "materi_published"("id") ON DELETE CASCADE,
  "visibility" "visibility" NOT NULL DEFAULT 'PRIVAT',
  "approval_status" "approval_status" NOT NULL DEFAULT 'PENDING',
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE materi_sharing ENABLE ROW LEVEL SECURITY;

CREATE POLICY materi_sharing_owner_policy ON materi_sharing
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM materi_published mp
      WHERE mp.id = materi_sharing.materi_published_id
      AND mp.guru_id = app.current_user_id()
    )
  );

CREATE POLICY materi_sharing_view_policy ON materi_sharing
  FOR SELECT
  USING (
    visibility = 'PUBLIK' AND approval_status = 'APPROVED'
    OR
    EXISTS (
      SELECT 1 FROM materi_published mp
      WHERE mp.id = materi_sharing.materi_published_id
      AND mp.guru_id = app.current_user_id()
    )
    OR
    (
      visibility = 'KRABAT'
      AND EXISTS (
        SELECT 1 FROM krabat_connections kc
        WHERE kc.connected_guru_id = (
          SELECT mp2.guru_id FROM materi_published mp2 WHERE mp2.id = materi_sharing.materi_published_id
        )
        AND kc.guru_id = app.current_user_id()
        AND kc.status = 'ACTIVE'
      )
    )
  );