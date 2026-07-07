ALTER TYPE "lokasi_storage" ADD VALUE IF NOT EXISTS 'IMAGEKIT';--> statement-breakpoint
ALTER TABLE "file_materi" ADD COLUMN IF NOT EXISTS "imagekit_file_id" varchar(255);--> statement-breakpoint
ALTER TABLE "file_materi" ADD COLUMN IF NOT EXISTS "kursus_id" uuid REFERENCES "kursus"("id");--> statement-breakpoint
ALTER TABLE "file_materi" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'uploaded' NOT NULL;--> statement-breakpoint
ALTER TABLE "file_materi" ADD COLUMN IF NOT EXISTS "extraction_text" text;--> statement-breakpoint
ALTER TABLE "file_materi" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_materi_kursus_id_idx" ON "file_materi" ("kursus_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_materi_guru_id_idx" ON "file_materi" ("guru_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_materi_status_idx" ON "file_materi" ("status");
