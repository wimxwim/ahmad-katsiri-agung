CREATE TABLE IF NOT EXISTS "kelas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nama" varchar(50) NOT NULL,
  "tingkat" integer NOT NULL,
  "sekolah_id" uuid REFERENCES "sekolah"("id"),
  "guru_id" uuid REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kelas_guru_id_idx" ON "kelas" ("guru_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kelas_sekolah_id_idx" ON "kelas" ("sekolah_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "siswa_kelas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "siswa_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "kelas_id" uuid NOT NULL REFERENCES "kelas"("id") ON DELETE CASCADE,
  "tanggal_masuk" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "siswa_kelas_unique" UNIQUE("siswa_id","kelas_id")
);
