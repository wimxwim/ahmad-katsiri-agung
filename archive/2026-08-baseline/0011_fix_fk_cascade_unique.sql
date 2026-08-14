-- Migration 0011: Fix FK cascade + student_ability unique constraint
-- Perbaiki schema-migration drift: semua FK di 0000 pakai ON DELETE NO ACTION,
-- tapi schema.ts sudah define { onDelete: "cascade" }.
-- Juga fix student_ability: UNIQUE(siswa_id) → UNIQUE(siswa_id, kursus_id)

-- Drop FK constraints yang salah (no action → cascade)
ALTER TABLE "file_materi" DROP CONSTRAINT IF EXISTS "file_materi_skill_id_skill_id_fk";
ALTER TABLE "file_materi" DROP CONSTRAINT IF EXISTS "file_materi_guru_id_users_id_fk";
ALTER TABLE "jawaban_log" DROP CONSTRAINT IF EXISTS "jawaban_log_siswa_id_users_id_fk";
ALTER TABLE "jawaban_log" DROP CONSTRAINT IF EXISTS "jawaban_log_soal_id_soal_id_fk";
ALTER TABLE "jawaban_log" DROP CONSTRAINT IF EXISTS "jawaban_log_quiz_session_id_quiz_session_id_fk";
ALTER TABLE "kursus" DROP CONSTRAINT IF EXISTS "kursus_guru_id_users_id_fk";
ALTER TABLE "kursus" DROP CONSTRAINT IF EXISTS "kursus_sekolah_id_sekolah_id_fk";
ALTER TABLE "quiz_session" DROP CONSTRAINT IF EXISTS "quiz_session_kursus_id_kursus_id_fk";
ALTER TABLE "remedial_recommendation" DROP CONSTRAINT IF EXISTS "remedial_recommendation_siswa_id_users_id_fk";
ALTER TABLE "remedial_recommendation" DROP CONSTRAINT IF EXISTS "remedial_recommendation_skill_id_skill_id_fk";
ALTER TABLE "risk_snapshot" DROP CONSTRAINT IF EXISTS "risk_snapshot_siswa_id_users_id_fk";
ALTER TABLE "risk_snapshot" DROP CONSTRAINT IF EXISTS "risk_snapshot_kursus_id_kursus_id_fk";
ALTER TABLE "sertifikat" DROP CONSTRAINT IF EXISTS "sertifikat_siswa_id_users_id_fk";
ALTER TABLE "sertifikat" DROP CONSTRAINT IF EXISTS "sertifikat_kursus_id_kursus_id_fk";
ALTER TABLE "siswa_kursus" DROP CONSTRAINT IF EXISTS "siswa_kursus_siswa_id_users_id_fk";
ALTER TABLE "siswa_kursus" DROP CONSTRAINT IF EXISTS "siswa_kursus_kursus_id_kursus_id_fk";
ALTER TABLE "skill" DROP CONSTRAINT IF EXISTS "skill_kursus_id_kursus_id_fk";
ALTER TABLE "skill" DROP CONSTRAINT IF EXISTS "skill_prasyarat_skill_id_skill_id_fk";
ALTER TABLE "skill_mastery" DROP CONSTRAINT IF EXISTS "skill_mastery_siswa_id_users_id_fk";
ALTER TABLE "skill_mastery" DROP CONSTRAINT IF EXISTS "skill_mastery_skill_id_skill_id_fk";
ALTER TABLE "soal" DROP CONSTRAINT IF EXISTS "soal_skill_id_skill_id_fk";
ALTER TABLE "student_ability" DROP CONSTRAINT IF EXISTS "student_ability_siswa_id_users_id_fk";
ALTER TABLE "student_ability" DROP CONSTRAINT IF EXISTS "student_ability_kursus_id_kursus_id_fk";
ALTER TABLE "transaksi" DROP CONSTRAINT IF EXISTS "transaksi_siswa_id_users_id_fk";
ALTER TABLE "transaksi" DROP CONSTRAINT IF EXISTS "transaksi_kursus_id_kursus_id_fk";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_sekolah_id_sekolah_id_fk";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_parent_id_users_id_fk";

-- Recreate dengan ON DELETE CASCADE (sesuai schema.ts)
ALTER TABLE "file_materi" ADD CONSTRAINT "file_materi_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "file_materi" ADD CONSTRAINT "file_materi_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_soal_id_soal_id_fk" FOREIGN KEY ("soal_id") REFERENCES "public"."soal"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "jawaban_log" ADD CONSTRAINT "jawaban_log_quiz_session_id_quiz_session_id_fk" FOREIGN KEY ("quiz_session_id") REFERENCES "public"."quiz_session"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "kursus" ADD CONSTRAINT "kursus_guru_id_users_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "kursus" ADD CONSTRAINT "kursus_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "remedial_recommendation" ADD CONSTRAINT "remedial_recommendation_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "remedial_recommendation" ADD CONSTRAINT "remedial_recommendation_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "risk_snapshot" ADD CONSTRAINT "risk_snapshot_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "risk_snapshot" ADD CONSTRAINT "risk_snapshot_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "siswa_kursus" ADD CONSTRAINT "siswa_kursus_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "siswa_kursus" ADD CONSTRAINT "siswa_kursus_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "skill" ADD CONSTRAINT "skill_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "skill" ADD CONSTRAINT "skill_prasyarat_skill_id_skill_id_fk" FOREIGN KEY ("prasyarat_skill_id") REFERENCES "public"."skill"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "skill_mastery" ADD CONSTRAINT "skill_mastery_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "skill_mastery" ADD CONSTRAINT "skill_mastery_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "soal" ADD CONSTRAINT "soal_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "student_ability" ADD CONSTRAINT "student_ability_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "student_ability" ADD CONSTRAINT "student_ability_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_siswa_id_users_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_kursus_id_kursus_id_fk" FOREIGN KEY ("kursus_id") REFERENCES "public"."kursus"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "users" ADD CONSTRAINT "users_sekolah_id_sekolah_id_fk" FOREIGN KEY ("sekolah_id") REFERENCES "public"."sekolah"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "users" ADD CONSTRAINT "users_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

-- Fix student_ability unique constraint: drop single-column, create composite
ALTER TABLE "student_ability" DROP CONSTRAINT IF EXISTS "student_ability_siswa_id_unique";
ALTER TABLE "student_ability" ADD CONSTRAINT "student_ability_unique" UNIQUE("siswa_id", "kursus_id");
