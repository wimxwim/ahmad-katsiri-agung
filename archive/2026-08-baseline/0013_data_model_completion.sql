-- Migration 0013: Data Model Completion (Gelombang 14)
-- Menambahkan:
-- 1. Tabel prompt_version untuk versioning prompt AI generator
-- 2. Tabel generation_attempts untuk retry history
-- 3. Index tambahan untuk query dashboard guru

-- 1. Enum prompt_version_enum
CREATE TYPE "public"."prompt_version_enum" AS ENUM('V1', 'V2', 'V3');
--> statement-breakpoint

-- 2. Tabel prompt_version
CREATE TABLE IF NOT EXISTS "prompt_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" "prompt_version_enum" NOT NULL,
	"tipe" varchar(20) NOT NULL,
	"system_prompt" text NOT NULL,
	"user_prompt_template" text NOT NULL,
	"model_name" varchar(100) NOT NULL DEFAULT 'narrarouter',
	"temperature" real NOT NULL DEFAULT 0.3,
	"max_tokens" integer NOT NULL DEFAULT 4096,
	"is_active" boolean NOT NULL DEFAULT true,
	"changelog" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prompt_version_active_idx" ON "prompt_version" USING btree ("tipe","is_active");
--> statement-breakpoint

-- 3. Tabel generation_attempts
CREATE TABLE IF NOT EXISTS "generation_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_generation_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"status" varchar(20) NOT NULL DEFAULT 'started',
	"output_type" varchar(20) NOT NULL,
	"token_input" integer,
	"token_output" integer,
	"model_name" varchar(100),
	"error_message" text,
	"duration_ms" integer,
	"prompt_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_attempts" ADD CONSTRAINT "generation_attempts_ai_generation_id_ai_generation_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generation"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "generation_attempts" ADD CONSTRAINT "generation_attempts_prompt_version_id_prompt_version_id_fk" FOREIGN KEY ("prompt_version_id") REFERENCES "public"."prompt_version"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gen_attempt_ai_gen_idx" ON "generation_attempts" USING btree ("ai_generation_id","attempt_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gen_attempt_status_idx" ON "generation_attempts" USING btree ("status");
--> statement-breakpoint

-- 4. Index tambahan untuk query dashboard
CREATE INDEX IF NOT EXISTS "siswa_kursus_kursus_id_idx" ON "siswa_kursus" USING btree ("kursus_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "siswa_kursus_status_idx" ON "siswa_kursus" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaksi_status_idx" ON "transaksi" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaksi_siswa_idx" ON "transaksi" USING btree ("siswa_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_materi_skill_id_idx" ON "file_materi" USING btree ("skill_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_generation_kursus_id_idx" ON "ai_generation" USING btree ("kursus_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempt_status_idx" ON "quiz_attempt" USING btree ("status");