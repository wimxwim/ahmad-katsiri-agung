CREATE TABLE IF NOT EXISTS "pengumuman" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "judul" varchar(255) NOT NULL,
  "konten" text NOT NULL,
  "target" varchar(20) DEFAULT 'SEMUA' NOT NULL,
  "guru_id" uuid NOT NULL REFERENCES "users"("id"),
  "sekolah_id" uuid REFERENCES "sekolah"("id"),
  "kursus_id" uuid REFERENCES "kursus"("id"),
  "published_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone,
  "is_pinned" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pengumuman_target_idx" ON "pengumuman" ("target", "published_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pengumuman_guru_idx" ON "pengumuman" ("guru_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pengumuman_sekolah_idx" ON "pengumuman" ("sekolah_id");
