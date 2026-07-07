CREATE TYPE "ai_generation_status" AS ENUM ('queued', 'extracting', 'extracted', 'generating', 'ready', 'approved', 'rejected', 'failed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_generation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "file_materi_id" uuid REFERENCES "file_materi"("id"),
  "guru_id" uuid NOT NULL REFERENCES "users"("id"),
  "kursus_id" uuid REFERENCES "kursus"("id"),
  "source_file_name" varchar(255) NOT NULL,
  "status" "ai_generation_status" DEFAULT 'queued' NOT NULL,
  "materi_judul" text,
  "materi_konten" text,
  "quiz_judul" text,
  "quiz_soal" jsonb,
  "soal_items" jsonb,
  "token_input" integer,
  "token_output" integer,
  "model_name" varchar(100),
  "error_message" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_generation_guru_idx" ON "ai_generation" ("guru_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_generation_status_idx" ON "ai_generation" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_generation_file_idx" ON "ai_generation" ("file_materi_id");
