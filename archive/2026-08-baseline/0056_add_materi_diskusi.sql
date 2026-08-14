-- 0056_add_materi_diskusi
-- Diskusi siswa-guru per materi (schema.ts: materiDiskusi)
-- Hand-written migration - do NOT regenerate via drizzle-kit (journal desynced)

CREATE TYPE "diskusi_role" AS ENUM ('SISWA', 'GURU');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "materi_diskusi" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "materi_id" uuid NOT NULL REFERENCES "materi_published"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "user_name" varchar(255) NOT NULL,
  "role" "diskusi_role" DEFAULT 'SISWA' NOT NULL,
  "pertanyaan" text NOT NULL,
  "jawaban" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "materi_diskusi_materi_idx" ON "materi_diskusi" ("materi_id", "created_at");--> statement-breakpoint
ALTER TABLE "materi_diskusi" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS materi_diskusi_user_policy ON materi_diskusi;
CREATE POLICY materi_diskusi_user_policy ON materi_diskusi
  FOR ALL
  TO public
  USING (user_id = app.current_user_id())
  WITH CHECK (user_id = app.current_user_id());--> statement-breakpoint
DROP POLICY IF EXISTS materi_diskusi_guru_policy ON materi_diskusi;
CREATE POLICY materi_diskusi_guru_policy ON materi_diskusi
  FOR SELECT
  TO public
  USING (app.current_role() IN ('guru', 'admin_sekolah', 'owner'));
