CREATE TYPE "mode_evaluasi" AS ENUM ('BELAJAR', 'ULANGAN', 'CBT');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "materi_published" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "ai_generation_id" uuid NOT NULL UNIQUE REFERENCES "ai_generation"("id"),
  "guru_id" uuid NOT NULL REFERENCES "users"("id"),
  "kursus_id" uuid NOT NULL REFERENCES "kursus"("id"),
  "judul" text NOT NULL,
  "konten" text NOT NULL,
  "ringkasan" text,
  "urutan" integer DEFAULT 0 NOT NULL,
  "published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "materi_published_kursus_idx" ON "materi_published" ("kursus_id", "urutan");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "materi_published_guru_idx" ON "materi_published" ("guru_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_published" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "ai_generation_id" uuid NOT NULL UNIQUE REFERENCES "ai_generation"("id"),
  "guru_id" uuid NOT NULL REFERENCES "users"("id"),
  "kursus_id" uuid NOT NULL REFERENCES "kursus"("id"),
  "judul" text NOT NULL,
  "mode_evaluasi" "mode_evaluasi" DEFAULT 'BELAJAR' NOT NULL,
  "durasi_menit" integer DEFAULT 20 NOT NULL,
  "published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_published_kursus_idx" ON "quiz_published" ("kursus_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "soal_published" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "ai_generation_id" uuid NOT NULL REFERENCES "ai_generation"("id"),
  "quiz_published_id" uuid REFERENCES "quiz_published"("id") ON DELETE CASCADE,
  "urutan" integer DEFAULT 0 NOT NULL,
  "pertanyaan" text NOT NULL,
  "tipe" "tipe_soal" NOT NULL,
  "pilihan_ganda" jsonb,
  "kunci" text NOT NULL,
  "poin" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "soal_published_quiz_idx" ON "soal_published" ("quiz_published_id", "urutan");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_attempt" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "quiz_published_id" uuid NOT NULL REFERENCES "quiz_published"("id") ON DELETE CASCADE,
  "siswa_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" varchar(20) DEFAULT 'SELESAI' NOT NULL,
  "nilai" integer,
  "jumlah_benar" integer DEFAULT 0 NOT NULL,
  "jumlah_salah" integer DEFAULT 0 NOT NULL,
  "waktu_mulai" timestamp with time zone DEFAULT now() NOT NULL,
  "waktu_selesai" timestamp with time zone,
  "durasi_detik" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempt_siswa_idx" ON "quiz_attempt" ("siswa_id", "waktu_mulai");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempt_quiz_idx" ON "quiz_attempt" ("quiz_published_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "materi_read" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "siswa_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "materi_published_id" uuid NOT NULL REFERENCES "materi_published"("id") ON DELETE CASCADE,
  "read_at" timestamp with time zone DEFAULT now() NOT NULL,
  "selesai" boolean DEFAULT false NOT NULL,
  "progress_persen" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "materi_read_siswa_materi_unique" UNIQUE("siswa_id","materi_published_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "materi_read_siswa_idx" ON "materi_read" ("siswa_id", "read_at");
