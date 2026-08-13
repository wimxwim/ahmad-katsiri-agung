CREATE TYPE "public"."ai_generation_status" AS ENUM('queued', 'extracting', 'extracted', 'generating', 'ready', 'approved', 'rejected', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ai_output_status" AS ENUM('not_generated', 'draft', 'approved', 'rejected', 'edited');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."diskusi_role" AS ENUM('SISWA', 'GURU');--> statement-breakpoint
CREATE TYPE "public"."krabat_status" AS ENUM('PENDING', 'ACTIVE', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."lokasi_storage" AS ENUM('GDRIVE', 'VPS_LOKAL', 'IMAGEKIT');--> statement-breakpoint
CREATE TYPE "public"."mode_evaluasi" AS ENUM('BELAJAR', 'ULANGAN', 'CBT');--> statement-breakpoint
CREATE TYPE "public"."prompt_version_enum" AS ENUM('V1', 'V2', 'V3');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('OWNER', 'ADMIN_SEKOLAH', 'GURU', 'ASISTEN_GURU', 'SISWA', 'ORANG_TUA');--> statement-breakpoint
CREATE TYPE "public"."status_publikasi" AS ENUM('DRAFT', 'PUBLIK', 'PRIVAT', 'KRABAT', 'ARSIP');--> statement-breakpoint
CREATE TYPE "public"."tipe_soal" AS ENUM('PG', 'ISIAN', 'ESSAY');--> statement-breakpoint
CREATE TYPE "public"."token_transaction_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."token_transaction_type" AS ENUM('TOPUP', 'GRANT', 'DEDUCT', 'REFUND', 'DONATION');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('PRIVAT', 'PUBLIK', 'KRABAT', 'ARSIP');--> statement-breakpoint
CREATE TABLE "ai_generation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_materi_id" uuid,
	"guru_id" uuid NOT NULL,
	"kursus_id" uuid,
	"source_file_name" varchar(255) NOT NULL,
	"status" "ai_generation_status" DEFAULT 'queued' NOT NULL,
	"materi_status" "ai_output_status" DEFAULT 'not_generated' NOT NULL,
	"quiz_status" "ai_output_status" DEFAULT 'not_generated' NOT NULL,
	"soal_status" "ai_output_status" DEFAULT 'not_generated' NOT NULL,
	"materi_judul" text,
	"materi_konten" text,
	"materi_edited_konten" text,
	"materi_approved_at" timestamp with time zone,
	"quiz_judul" text,
	"quiz_soal" jsonb,
	"quiz_edited_soal" jsonb,
	"quiz_approved_at" timestamp with time zone,
	"soal_items" jsonb,
	"soal_edited_items" jsonb,
	"soal_approved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"published_materi_id" uuid,
	"published_quiz_id" uuid,
	"published_soal_id" uuid,
	"token_input" integer,
	"token_output" integer,
	"model_name" varchar(100),
	"error_message" text,
	"tingkat" integer,
	"fase" varchar(1),
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"lease_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"model" varchar(64) NOT NULL,
	"provider" varchar(32) DEFAULT 'nararouter' NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"cost_idr_cents" bigint DEFAULT 0 NOT NULL,
	"request_type" varchar(32) NOT NULL,
	"status" varchar(16) DEFAULT 'completed' NOT NULL,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stream_id" varchar(255) NOT NULL,
	"version" integer NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"previous_hash" varchar(64) NOT NULL,
	"signature" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"kursus_id" uuid,
	"nama_file" varchar(255) NOT NULL,
	"tipe_mime" varchar(255) NOT NULL,
	"ukuran_bytes" bigint NOT NULL,
	"lokasi" "lokasi_storage" NOT NULL,
	"drive_file_id" varchar(255),
	"imagekit_file_id" varchar(255),
	"link_akses" text NOT NULL,
	"status" varchar(20) DEFAULT 'uploaded' NOT NULL,
	"extraction_text" text,
	"kategori" varchar(20) DEFAULT 'materi' NOT NULL,
	"kelas_id" uuid,
	"guru_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_generation_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"status" varchar(20) DEFAULT 'started' NOT NULL,
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
CREATE TABLE "google_drive_auth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guru_id" uuid NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"google_email" varchar(255),
	"drive_folder_id" varchar(255),
	"status" varchar(20) DEFAULT 'AKTIF' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "google_drive_auth_guru_id_unique" UNIQUE("guru_id")
);
--> statement-breakpoint
CREATE TABLE "guru_invite_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(16) NOT NULL,
	"issuing_guru_id" uuid NOT NULL,
	"max_uses" integer DEFAULT 3 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"trial_days" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guru_invite_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "invite_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kursus_id" uuid NOT NULL,
	"guru_id" uuid NOT NULL,
	"jti" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jawaban_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"soal_id" uuid NOT NULL,
	"sekolah_id" uuid,
	"jawaban_siswa" text NOT NULL,
	"is_benar" boolean NOT NULL,
	"waktu_jawab_detik" integer NOT NULL,
	"quiz_session_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jenjang" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jenjang_nama_unique" UNIQUE("nama"),
	CONSTRAINT "jenjang_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "kelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(50) NOT NULL,
	"tingkat" integer NOT NULL,
	"sekolah_id" uuid,
	"kursus_id" uuid,
	"guru_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"last_active_at" timestamp with time zone,
	"kode_invite" varchar(8),
	"invite_expires_at" timestamp with time zone,
	CONSTRAINT "kelas_nama_guru_unique" UNIQUE("nama","guru_id")
);
--> statement-breakpoint
CREATE TABLE "krabat_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guru_id" uuid NOT NULL,
	"connected_guru_id" uuid NOT NULL,
	"status" "krabat_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "krabat_connections_pair_unique" UNIQUE("guru_id","connected_guru_id")
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
	"status_publikasi" "status_publikasi" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"kode_invite" varchar(8),
	"invite_expires_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "kursus_slug_sekolah_unique" UNIQUE("slug","sekolah_id")
);
--> statement-breakpoint
CREATE TABLE "mata_pelajaran" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"kategori" varchar(50) DEFAULT 'wajib' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mata_pelajaran_nama_unique" UNIQUE("nama"),
	CONSTRAINT "mata_pelajaran_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "materi_diskusi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"materi_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"role" "diskusi_role" DEFAULT 'SISWA' NOT NULL,
	"pertanyaan" text NOT NULL,
	"jawaban" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materi_published" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_generation_id" uuid NOT NULL,
	"guru_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"judul" text NOT NULL,
	"konten" text NOT NULL,
	"ringkasan" text,
	"urutan" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "materi_published_ai_generation_id_unique" UNIQUE("ai_generation_id")
);
--> statement-breakpoint
CREATE TABLE "materi_read" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"materi_published_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL,
	"selesai" boolean DEFAULT false NOT NULL,
	"progress_persen" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "materi_read_siswa_materi_unique" UNIQUE("siswa_id","materi_published_id")
);
--> statement-breakpoint
CREATE TABLE "materi_sharing" (
	"materi_published_id" uuid PRIMARY KEY NOT NULL,
	"visibility" "visibility" DEFAULT 'PRIVAT' NOT NULL,
	"approval_status" "approval_status" DEFAULT 'PENDING' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_progress" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"profile_completed" boolean DEFAULT false NOT NULL,
	"tour_completed" boolean DEFAULT false NOT NULL,
	"first_course_created" boolean DEFAULT false NOT NULL,
	"first_material_uploaded" boolean DEFAULT false NOT NULL,
	"first_ai_generated" boolean DEFAULT false NOT NULL,
	"first_course_published" boolean DEFAULT false NOT NULL,
	"current_step" varchar(32) DEFAULT 'registration' NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"payment_type" varchar(30) DEFAULT 'qris_static' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"proof_image_url" text,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengumuman" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"judul" varchar(255) NOT NULL,
	"konten" text NOT NULL,
	"target" varchar(20) DEFAULT 'SEMUA' NOT NULL,
	"guru_id" uuid NOT NULL,
	"sekolah_id" uuid,
	"kursus_id" uuid,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" "prompt_version_enum" NOT NULL,
	"tipe" varchar(20) NOT NULL,
	"system_prompt" text NOT NULL,
	"user_prompt_template" text NOT NULL,
	"model_name" varchar(100) DEFAULT 'narrarouter' NOT NULL,
	"temperature" real DEFAULT 0.3 NOT NULL,
	"max_tokens" integer DEFAULT 4096 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"changelog" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_published_id" uuid NOT NULL,
	"siswa_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'SELESAI' NOT NULL,
	"nilai" integer,
	"jumlah_benar" integer DEFAULT 0 NOT NULL,
	"jumlah_salah" integer DEFAULT 0 NOT NULL,
	"waktu_mulai" timestamp with time zone DEFAULT now() NOT NULL,
	"waktu_selesai" timestamp with time zone,
	"durasi_detik" integer DEFAULT 0 NOT NULL,
	"jawaban" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "quiz_published" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_generation_id" uuid NOT NULL,
	"guru_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"judul" text NOT NULL,
	"mode_evaluasi" "mode_evaluasi" DEFAULT 'BELAJAR' NOT NULL,
	"durasi_menit" integer DEFAULT 20 NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_published_ai_generation_id_unique" UNIQUE("ai_generation_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kursus_id" uuid NOT NULL,
	"sekolah_id" uuid,
	"judul" varchar(255) NOT NULL,
	"durasi_menit" integer DEFAULT 30 NOT NULL,
	"soal_ids" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_violation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"quiz_published_id" uuid NOT NULL,
	"jenis" varchar(50) NOT NULL,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quota_usages" (
	"user_id" uuid NOT NULL,
	"quota_id" uuid NOT NULL,
	"current_usage" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quota_usages_user_id_quota_id_window_start_unique" UNIQUE("user_id","quota_id","window_start")
);
--> statement-breakpoint
CREATE TABLE "quotas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" varchar(32) NOT NULL,
	"resource_type" varchar(64) NOT NULL,
	"limit_value" integer NOT NULL,
	"window_seconds" integer DEFAULT 0 NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"family" varchar(64) NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "remedial_recommendation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"sekolah_id" uuid,
	"prioritas_score" real NOT NULL,
	"status" varchar(20) DEFAULT 'tersedia' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "remedial_unique" UNIQUE("siswa_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "risk_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"sekolah_id" uuid,
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
	"sekolah_id" uuid,
	"nomor_sertifikat" varchar(255) NOT NULL,
	"qr_secret_hash" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sertifikat_nomor_sertifikat_unique" UNIQUE("nomor_sertifikat")
);
--> statement-breakpoint
CREATE TABLE "siswa_kelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kelas_id" uuid NOT NULL,
	"tanggal_masuk" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "siswa_kelas_unique" UNIQUE("siswa_id","kelas_id")
);
--> statement-breakpoint
CREATE TABLE "siswa_kursus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'AKTIF' NOT NULL,
	"invite_token_id" uuid,
	"tanggal_daftar" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "siswa_kursus_unique" UNIQUE("siswa_id","kursus_id")
);
--> statement-breakpoint
CREATE TABLE "skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kursus_id" uuid NOT NULL,
	"sekolah_id" uuid,
	"nama" varchar(255) NOT NULL,
	"prasyarat_skill_id" uuid,
	"bloom_level" integer DEFAULT 1 NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_mastery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"sekolah_id" uuid,
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
	"sekolah_id" uuid,
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
CREATE TABLE "soal_published" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_generation_id" uuid NOT NULL,
	"quiz_published_id" uuid,
	"urutan" integer DEFAULT 0 NOT NULL,
	"pertanyaan" text NOT NULL,
	"tipe" "tipe_soal" NOT NULL,
	"pilihan_ganda" jsonb,
	"kunci" text NOT NULL,
	"poin" integer DEFAULT 1 NOT NULL,
	"skill_id" uuid
);
--> statement-breakpoint
CREATE TABLE "student_ability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kursus_id" uuid NOT NULL,
	"theta" real DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_ability_unique" UNIQUE("siswa_id","kursus_id")
);
--> statement-breakpoint
CREATE TABLE "teacher_readiness_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guru_id" uuid NOT NULL,
	"tri_score" real NOT NULL,
	"komponen" jsonb NOT NULL,
	"snapshot_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token_balances" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"total_topup" integer DEFAULT 0 NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"last_topup_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp with time zone,
	"tier" varchar(20) DEFAULT 'free' NOT NULL,
	"reset_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "token_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "token_transaction_type" NOT NULL,
	"status" "token_transaction_status" DEFAULT 'COMPLETED' NOT NULL,
	"amount" integer NOT NULL,
	"balance_before" integer DEFAULT 0 NOT NULL,
	"balance_after" integer DEFAULT 0 NOT NULL,
	"payment_method" varchar(50),
	"proof_file_id" varchar(255),
	"proof_link" text,
	"notes" text,
	"reference_id" varchar(255),
	"chain_hash" varchar(64),
	"prev_hash" varchar(64),
	"nonce" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "tutor_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'murid' NOT NULL,
	"prompt" text NOT NULL,
	"response" text,
	"status" varchar(20) DEFAULT 'processing' NOT NULL,
	"model_name" varchar(100),
	"token_input" integer DEFAULT 0 NOT NULL,
	"token_output" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role" NOT NULL,
	"nama" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"google_id" varchar(255),
	"tanggal_lahir" timestamp with time zone,
	"kelas" varchar(10),
	"no_absen" varchar(5),
	"nis" varchar(30),
	"sekolah_id" uuid,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"last_active_at" timestamp with time zone,
	"suspended_at" timestamp with time zone,
	"upload_count" integer DEFAULT 0 NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "ai_generation" ADD CONSTRAINT "ai_generation_file_materi_id_file_materi_id_fk" FOREIGN KEY ("file_materi_id") REFERENCES "public"."file_materi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD CONSTRAINT "ai_generation_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD CONSTRAINT "ai_generation_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD CONSTRAINT "ai_generation_published_materi_id_materi_published_id_fk" FOREIGN KEY ("published_materi_id") REFERENCES "public"."materi_published"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD CONSTRAINT "ai_generation_published_quiz_id_quiz_published_id_fk" FOREIGN KEY ("published_quiz_id") REFERENCES "public"."quiz_published"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generation" ADD CONSTRAINT "ai_generation_published_soal_id_soal_published_id_fk" FOREIGN KEY ("published_soal_id") REFERENCES "public"."soal_published"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_materi" ADD CONSTRAINT "file_materi_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_materi" ADD CONSTRAINT "file_materi_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_materi" ADD CONSTRAINT "file_materi_kelas_id_kelas_id_fk" FOREIGN KEY ("kelas_id") REFERENCES "public"."kelas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_materi" ADD CONSTRAINT "file_materi_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_attempts" ADD CONSTRAINT "generation_attempts_ai_generation_id_ai_generation_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_attempts" ADD CONSTRAINT "generation_attempts_prompt_version_id_prompt_version_id_fk" FOREIGN KEY ("prompt_version_id") REFERENCES "public"."prompt_version"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_drive_auth" ADD CONSTRAINT "google_drive_auth_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guru_invite_codes" ADD CONSTRAINT "guru_invite_codes_issuing_guru_id_users_id_fk" FOREIGN KEY ("issuing_guru_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_tokens" ADD CONSTRAINT "invite_tokens_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_tokens" ADD CONSTRAINT "invite_tokens_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_soal_id_soal_published_id_fk" FOREIGN KEY ("soal_id") REFERENCES "public"."soal_published"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_quiz_session_id_quiz_session_id_fk" FOREIGN KEY ("quiz_session_id") REFERENCES "public"."quiz_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "krabat_connections" ADD CONSTRAINT "krabat_connections_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "krabat_connections" ADD CONSTRAINT "krabat_connections_connected_guru_id_users_id_fk" FOREIGN KEY ("connected_guru_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kursus" ADD CONSTRAINT "kursus_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kursus" ADD CONSTRAINT "kursus_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materi_diskusi" ADD CONSTRAINT "materi_diskusi_materi_id_materi_published_id_fk" FOREIGN KEY ("materi_id") REFERENCES "public"."materi_published"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materi_diskusi" ADD CONSTRAINT "materi_diskusi_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materi_published" ADD CONSTRAINT "materi_published_ai_generation_id_ai_generation_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materi_published" ADD CONSTRAINT "materi_published_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materi_published" ADD CONSTRAINT "materi_published_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materi_read" ADD CONSTRAINT "materi_read_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materi_read" ADD CONSTRAINT "materi_read_materi_published_id_materi_published_id_fk" FOREIGN KEY ("materi_published_id") REFERENCES "public"."materi_published"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materi_sharing" ADD CONSTRAINT "materi_sharing_materi_published_id_materi_published_id_fk" FOREIGN KEY ("materi_published_id") REFERENCES "public"."materi_published"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengumuman" ADD CONSTRAINT "pengumuman_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengumuman" ADD CONSTRAINT "pengumuman_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengumuman" ADD CONSTRAINT "pengumuman_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_quiz_published_id_quiz_published_id_fk" FOREIGN KEY ("quiz_published_id") REFERENCES "public"."quiz_published"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_published" ADD CONSTRAINT "quiz_published_ai_generation_id_ai_generation_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_published" ADD CONSTRAINT "quiz_published_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_published" ADD CONSTRAINT "quiz_published_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_violation" ADD CONSTRAINT "quiz_violation_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_violation" ADD CONSTRAINT "quiz_violation_quiz_published_id_quiz_published_id_fk" FOREIGN KEY ("quiz_published_id") REFERENCES "public"."quiz_published"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_usages" ADD CONSTRAINT "quota_usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_usages" ADD CONSTRAINT "quota_usages_quota_id_quotas_id_fk" FOREIGN KEY ("quota_id") REFERENCES "public"."quotas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedial_recommendation" ADD CONSTRAINT "remedial_recommendation_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedial_recommendation" ADD CONSTRAINT "remedial_recommendation_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedial_recommendation" ADD CONSTRAINT "remedial_recommendation_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_snapshot" ADD CONSTRAINT "risk_snapshot_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_snapshot" ADD CONSTRAINT "risk_snapshot_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_snapshot" ADD CONSTRAINT "risk_snapshot_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siswa_kelas" ADD CONSTRAINT "siswa_kelas_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siswa_kelas" ADD CONSTRAINT "siswa_kelas_kelas_id_kelas_id_fk" FOREIGN KEY ("kelas_id") REFERENCES "public"."kelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siswa_kursus" ADD CONSTRAINT "siswa_kursus_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siswa_kursus" ADD CONSTRAINT "siswa_kursus_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_prasyarat_skill_id_skill_id_fk" FOREIGN KEY ("prasyarat_skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mastery" ADD CONSTRAINT "skill_mastery_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mastery" ADD CONSTRAINT "skill_mastery_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mastery" ADD CONSTRAINT "skill_mastery_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soal" ADD CONSTRAINT "soal_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soal" ADD CONSTRAINT "soal_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soal_published" ADD CONSTRAINT "soal_published_ai_generation_id_ai_generation_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soal_published" ADD CONSTRAINT "soal_published_quiz_published_id_quiz_published_id_fk" FOREIGN KEY ("quiz_published_id") REFERENCES "public"."quiz_published"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soal_published" ADD CONSTRAINT "soal_published_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_ability" ADD CONSTRAINT "student_ability_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_ability" ADD CONSTRAINT "student_ability_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_readiness_snapshot" ADD CONSTRAINT "teacher_readiness_snapshot_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_chat" ADD CONSTRAINT "tutor_chat_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_generation_guru_idx" ON "ai_generation" USING btree ("guru_id");--> statement-breakpoint
CREATE INDEX "ai_generation_status_idx" ON "ai_generation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_generation_file_idx" ON "ai_generation" USING btree ("file_materi_id");--> statement-breakpoint
CREATE INDEX "ai_generation_kursus_id_idx" ON "ai_generation" USING btree ("kursus_id");--> statement-breakpoint
CREATE INDEX "ai_generation_guru_created_idx" ON "ai_generation" USING btree ("guru_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_generation_status_created_idx" ON "ai_generation" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_requests_user_date" ON "ai_requests" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_requests_date" ON "ai_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "event_store_stream_idx" ON "event_store" USING btree ("stream_id","version");--> statement-breakpoint
CREATE INDEX "event_store_event_type_idx" ON "event_store" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "file_materi_skill_id_idx" ON "file_materi" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "file_materi_guru_id_idx" ON "file_materi" USING btree ("guru_id");--> statement-breakpoint
CREATE INDEX "file_materi_kursus_id_idx" ON "file_materi" USING btree ("kursus_id");--> statement-breakpoint
CREATE INDEX "file_materi_status_idx" ON "file_materi" USING btree ("status");--> statement-breakpoint
CREATE INDEX "file_materi_kategori_idx" ON "file_materi" USING btree ("kategori");--> statement-breakpoint
CREATE INDEX "gen_attempt_ai_gen_idx" ON "generation_attempts" USING btree ("ai_generation_id","attempt_number");--> statement-breakpoint
CREATE INDEX "gen_attempt_status_idx" ON "generation_attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invite_tokens_kursus_idx" ON "invite_tokens" USING btree ("kursus_id");--> statement-breakpoint
CREATE INDEX "invite_tokens_guru_idx" ON "invite_tokens" USING btree ("guru_id");--> statement-breakpoint
CREATE INDEX "jawaban_log_siswa_created_idx" ON "jawaban_log" USING btree ("siswa_id","created_at");--> statement-breakpoint
CREATE INDEX "jawaban_log_soal_id_idx" ON "jawaban_log" USING btree ("soal_id");--> statement-breakpoint
CREATE INDEX "jawaban_log_sekolah_id_idx" ON "jawaban_log" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "jawaban_log_sekolah_siswa_idx" ON "jawaban_log" USING btree ("sekolah_id","siswa_id","created_at");--> statement-breakpoint
CREATE INDEX "kelas_guru_id_idx" ON "kelas" USING btree ("guru_id");--> statement-breakpoint
CREATE INDEX "kelas_sekolah_id_idx" ON "kelas" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "krabat_connections_guru_idx" ON "krabat_connections" USING btree ("guru_id","status");--> statement-breakpoint
CREATE INDEX "krabat_connections_connected_idx" ON "krabat_connections" USING btree ("connected_guru_id","status");--> statement-breakpoint
CREATE INDEX "kursus_guru_id_idx" ON "kursus" USING btree ("guru_id");--> statement-breakpoint
CREATE INDEX "kursus_status_publikasi_idx" ON "kursus" USING btree ("status_publikasi");--> statement-breakpoint
CREATE INDEX "materi_diskusi_materi_idx" ON "materi_diskusi" USING btree ("materi_id","created_at");--> statement-breakpoint
CREATE INDEX "materi_published_kursus_idx" ON "materi_published" USING btree ("kursus_id","urutan");--> statement-breakpoint
CREATE INDEX "materi_published_guru_idx" ON "materi_published" USING btree ("guru_id");--> statement-breakpoint
CREATE INDEX "materi_read_siswa_idx" ON "materi_read" USING btree ("siswa_id","read_at");--> statement-breakpoint
CREATE INDEX "materi_read_materi_published_idx" ON "materi_read" USING btree ("materi_published_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_user_status" ON "payments" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "pengumuman_target_idx" ON "pengumuman" USING btree ("target","published_at");--> statement-breakpoint
CREATE INDEX "pengumuman_guru_idx" ON "pengumuman" USING btree ("guru_id");--> statement-breakpoint
CREATE INDEX "pengumuman_sekolah_idx" ON "pengumuman" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "prompt_version_active_idx" ON "prompt_version" USING btree ("tipe","is_active");--> statement-breakpoint
CREATE INDEX "quiz_attempt_siswa_idx" ON "quiz_attempt" USING btree ("siswa_id","waktu_mulai");--> statement-breakpoint
CREATE INDEX "quiz_attempt_quiz_idx" ON "quiz_attempt" USING btree ("quiz_published_id");--> statement-breakpoint
CREATE INDEX "quiz_attempt_status_idx" ON "quiz_attempt" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quiz_attempt_nilai_idx" ON "quiz_attempt" USING btree ("nilai");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_attempt_siswa_quiz_done_unique" ON "quiz_attempt" USING btree ("siswa_id","quiz_published_id","status");--> statement-breakpoint
CREATE INDEX "quiz_published_kursus_idx" ON "quiz_published" USING btree ("kursus_id");--> statement-breakpoint
CREATE INDEX "quiz_published_guru_id_idx" ON "quiz_published" USING btree ("guru_id");--> statement-breakpoint
CREATE INDEX "quiz_session_kursus_id_idx" ON "quiz_session" USING btree ("kursus_id");--> statement-breakpoint
CREATE INDEX "quiz_session_sekolah_id_idx" ON "quiz_session" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "quiz_session_is_active_idx" ON "quiz_session" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "quiz_session_sekolah_active_idx" ON "quiz_session" USING btree ("sekolah_id","is_active");--> statement-breakpoint
CREATE INDEX "quiz_violation_siswa_idx" ON "quiz_violation" USING btree ("siswa_id","quiz_published_id","created_at");--> statement-breakpoint
CREATE INDEX "quiz_violation_quiz_idx" ON "quiz_violation" USING btree ("quiz_published_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_family_idx" ON "refresh_tokens" USING btree ("user_id","family");--> statement-breakpoint
CREATE INDEX "remedial_recommendation_sekolah_id_idx" ON "remedial_recommendation" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "risk_snapshot_siswa_date_idx" ON "risk_snapshot" USING btree ("siswa_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "risk_snapshot_kursus_status_idx" ON "risk_snapshot" USING btree ("kursus_id","status");--> statement-breakpoint
CREATE INDEX "risk_snapshot_sekolah_id_idx" ON "risk_snapshot" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "sertifikat_siswa_idx" ON "sertifikat" USING btree ("siswa_id");--> statement-breakpoint
CREATE INDEX "sertifikat_sekolah_id_idx" ON "sertifikat" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "siswa_kursus_kursus_id_idx" ON "siswa_kursus" USING btree ("kursus_id");--> statement-breakpoint
CREATE INDEX "siswa_kursus_status_idx" ON "siswa_kursus" USING btree ("status");--> statement-breakpoint
CREATE INDEX "siswa_kursus_invite_token_idx" ON "siswa_kursus" USING btree ("invite_token_id");--> statement-breakpoint
CREATE INDEX "skill_kursus_id_urutan_idx" ON "skill" USING btree ("kursus_id","urutan");--> statement-breakpoint
CREATE INDEX "skill_sekolah_id_idx" ON "skill" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "skill_sekolah_kursus_idx" ON "skill" USING btree ("sekolah_id","kursus_id");--> statement-breakpoint
CREATE INDEX "skill_mastery_siswa_idx" ON "skill_mastery" USING btree ("siswa_id");--> statement-breakpoint
CREATE INDEX "skill_mastery_next_review_idx" ON "skill_mastery" USING btree ("next_review_at");--> statement-breakpoint
CREATE INDEX "skill_mastery_sekolah_id_idx" ON "skill_mastery" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "soal_skill_id_idx" ON "soal" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "soal_sekolah_id_idx" ON "soal" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "soal_sekolah_skill_idx" ON "soal" USING btree ("sekolah_id","skill_id");--> statement-breakpoint
CREATE INDEX "soal_published_quiz_idx" ON "soal_published" USING btree ("quiz_published_id","urutan");--> statement-breakpoint
CREATE INDEX "soal_published_ai_generation_id_idx" ON "soal_published" USING btree ("ai_generation_id");--> statement-breakpoint
CREATE INDEX "soal_published_skill_id_idx" ON "soal_published" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "tri_guru_date_idx" ON "teacher_readiness_snapshot" USING btree ("guru_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "token_transactions_user_id_idx" ON "token_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "token_transactions_type_idx" ON "token_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "token_transactions_created_at_idx" ON "token_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "token_transactions_reference_idx" ON "token_transactions" USING btree ("user_id","type","reference_id");--> statement-breakpoint
CREATE INDEX "transaksi_status_idx" ON "transaksi" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transaksi_siswa_idx" ON "transaksi" USING btree ("siswa_id");--> statement-breakpoint
CREATE INDEX "transaksi_kursus_id_idx" ON "transaksi" USING btree ("kursus_id");--> statement-breakpoint
CREATE INDEX "users_sekolah_id_idx" ON "users" USING btree ("sekolah_id");--> statement-breakpoint
CREATE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");