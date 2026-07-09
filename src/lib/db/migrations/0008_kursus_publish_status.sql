CREATE TYPE "status_publikasi" AS ENUM ('DRAFT', 'PUBLIK', 'ARSIP');--> statement-breakpoint
ALTER TABLE "kursus" ADD COLUMN IF NOT EXISTS "status_publikasi" "status_publikasi" DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "kursus" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kursus_status_publikasi_idx" ON "kursus" ("status_publikasi");
