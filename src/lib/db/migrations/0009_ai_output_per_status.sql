CREATE TYPE "ai_output_status" AS ENUM ('not_generated', 'draft', 'approved', 'rejected', 'edited');--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "materi_status" "ai_output_status" DEFAULT 'not_generated' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "quiz_status" "ai_output_status" DEFAULT 'not_generated' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "soal_status" "ai_output_status" DEFAULT 'not_generated' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "materi_edited_konten" text;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "materi_approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "quiz_edited_soal" jsonb;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "quiz_approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "soal_edited_items" jsonb;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "soal_approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "published_materi_id" uuid;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "published_quiz_id" uuid;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD COLUMN IF NOT EXISTS "published_soal_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_generation_materi_status_idx" ON "ai_generation" ("materi_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_generation_quiz_status_idx" ON "ai_generation" ("quiz_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_generation_soal_status_idx" ON "ai_generation" ("soal_status");
