CREATE TYPE "public"."lokasi_storage" AS ENUM('GDRIVE', 'VPS_LOKAL');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('OWNER', 'ADMIN_SEKOLAH', 'GURU', 'ASISTEN_GURU', 'SISWA', 'ORANG_TUA');--> statement-breakpoint
CREATE TYPE "public"."tipe_soal" AS ENUM('PG', 'ISIAN', 'ESSAY');--> statement-breakpoint
CREATE TABLE "feature_flag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "file_materi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid,
	"nama_file" varchar(255) NOT NULL,
	"tipe_mime" varchar(255) NOT NULL,
	"ukuran_bytes" bigint NOT NULL,
	"lokasi" "lokasi_storage" NOT NULL,
	"drive_file_id" varchar(255),
	"link_akses" text NOT NULL,
	"guru_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jawaban_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"soal_id" uuid NOT NULL,
	"jawaban_siswa" text NOT NULL,
	"is_benar" boolean NOT NULL,
	"waktu_jawab_detik" integer NOT NULL,
	"quiz_session_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kursus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guru_id" uuid NOT NULL,
	"sekolah_id" uuid,
	"judul" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"keystatic_slug" varchar(255),
	"deskripsi" text,
	"harga" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kursus_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quiz_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kursus_id" uuid NOT NULL,
	"judul" varchar(255) NOT NULL,
	"durasi_menit" integer DEFAULT 30 NOT NULL,
	"soal_ids" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remedial_recommendation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"prioritas_score" real NOT NULL,
	"status" varchar(20) DEFAULT 'tersedia' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "remedial_unique" UNIQUE("siswa_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "risk_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"risk_score" real NOT NULL,
	"status" varchar(20) NOT NULL,
	"komponen" jsonb NOT NULL,
	"snapshot_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sekolah" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(255) NOT NULL,
	"subdomain" varchar(255) NOT NULL,
	"paket" varchar(20) DEFAULT 'FREE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sekolah_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "sertifikat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"nomor_sertifikat" varchar(255) NOT NULL,
	"qr_secret_hash" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sertifikat_nomor_sertifikat_unique" UNIQUE("nomor_sertifikat")
);
--> statement-breakpoint
CREATE TABLE "siswa_kursus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'AKTIF' NOT NULL,
	"tanggal_daftar" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "siswa_kursus_unique" UNIQUE("siswa_id","kursus_id")
);
--> statement-breakpoint
CREATE TABLE "skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kursus_id" uuid NOT NULL,
	"nama" varchar(255) NOT NULL,
	"prasyarat_skill_id" uuid,
	"bloom_level" integer DEFAULT 1 NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_mastery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"p_l" real DEFAULT 0.1 NOT NULL,
	"memory_strength" real DEFAULT 1 NOT NULL,
	"last_practiced_at" timestamp with time zone,
	"next_review_at" timestamp with time zone,
	"repetition_num" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_mastery_unique" UNIQUE("siswa_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "soal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid NOT NULL,
	"teks" text NOT NULL,
	"tipe" "tipe_soal" NOT NULL,
	"pilihan_ganda" jsonb,
	"kunci" text NOT NULL,
	"bloom_level" integer DEFAULT 1 NOT NULL,
	"irt_a" real DEFAULT 1 NOT NULL,
	"irt_b" real DEFAULT 0 NOT NULL,
	"irt_c" real DEFAULT 0.25 NOT NULL,
	"elo_rating" real DEFAULT 1000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_ability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"theta" real DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_ability_siswa_id_unique" UNIQUE("siswa_id")
);
--> statement-breakpoint
CREATE TABLE "transaksi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"jumlah" integer NOT NULL,
	"metode_pembayaran" varchar(50),
	"payment_gateway_ref" varchar(255),
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transaksi_payment_gateway_ref_unique" UNIQUE("payment_gateway_ref")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role" NOT NULL,
	"nama" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"tanggal_lahir" timestamp with time zone,
	"sekolah_id" uuid,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "file_materi" ADD CONSTRAINT "file_materi_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_materi" ADD CONSTRAINT "file_materi_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_soal_id_soal_id_fk" FOREIGN KEY ("soal_id") REFERENCES "public"."soal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_quiz_session_id_quiz_session_id_fk" FOREIGN KEY ("quiz_session_id") REFERENCES "public"."quiz_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kursus" ADD CONSTRAINT "kursus_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kursus" ADD CONSTRAINT "kursus_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedial_recommendation" ADD CONSTRAINT "remedial_recommendation_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedial_recommendation" ADD CONSTRAINT "remedial_recommendation_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_snapshot" ADD CONSTRAINT "risk_snapshot_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_snapshot" ADD CONSTRAINT "risk_snapshot_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siswa_kursus" ADD CONSTRAINT "siswa_kursus_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siswa_kursus" ADD CONSTRAINT "siswa_kursus_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_prasyarat_skill_id_skill_id_fk" FOREIGN KEY ("prasyarat_skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mastery" ADD CONSTRAINT "skill_mastery_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mastery" ADD CONSTRAINT "skill_mastery_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soal" ADD CONSTRAINT "soal_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_ability" ADD CONSTRAINT "student_ability_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_ability" ADD CONSTRAINT "student_ability_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jawaban_log_siswa_created_idx" ON "jawaban_log" USING btree ("siswa_id","created_at");--> statement-breakpoint
CREATE INDEX "jawaban_log_soal_id_idx" ON "jawaban_log" USING btree ("soal_id");--> statement-breakpoint
CREATE INDEX "kursus_guru_id_idx" ON "kursus" USING btree ("guru_id");--> statement-breakpoint
CREATE INDEX "risk_snapshot_siswa_date_idx" ON "risk_snapshot" USING btree ("siswa_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "risk_snapshot_kursus_status_idx" ON "risk_snapshot" USING btree ("kursus_id","status");--> statement-breakpoint
CREATE INDEX "sertifikat_siswa_idx" ON "sertifikat" USING btree ("siswa_id");--> statement-breakpoint
CREATE INDEX "skill_kursus_id_urutan_idx" ON "skill" USING btree ("kursus_id","urutan");--> statement-breakpoint
CREATE INDEX "skill_mastery_siswa_idx" ON "skill_mastery" USING btree ("siswa_id");--> statement-breakpoint
CREATE INDEX "skill_mastery_next_review_idx" ON "skill_mastery" USING btree ("next_review_at");--> statement-breakpoint
CREATE INDEX "soal_skill_id_idx" ON "soal" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "users_sekolah_id_idx" ON "users" USING btree ("sekolah_id");