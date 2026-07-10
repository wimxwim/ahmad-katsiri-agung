-- Migration: Business Systems — Kuota, AI Tracking, Taksonomi, Payment, Onboarding
-- AKAL Center — Fase BISNIS persiapan onboarding 80 guru
-- Dibuat: 10 Juli 2026

-- ============================================================
-- 1. SISTEM KUOTA (B1)
-- ============================================================

CREATE TABLE IF NOT EXISTS quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(32) NOT NULL,
  resource_type VARCHAR(64) NOT NULL,
  limit_value INTEGER NOT NULL,
  window_seconds INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quota_usages (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quota_id UUID NOT NULL REFERENCES quotas(id) ON DELETE CASCADE,
  current_usage INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quota_id, window_start)
);

-- Default kuota guru gratis
INSERT INTO quotas (role, resource_type, limit_value, window_seconds, description) VALUES
  ('guru', 'courses', 5, 0, 'Maksimum kursus aktif'),
  ('guru', 'ai_generation', 30, 2592000, 'AI generation per bulan'),
  ('guru', 'students', 100, 0, 'Maksimum siswa terdaftar'),
  ('guru', 'storage_mb', 500, 0, 'Penyimpanan file (MB)');

-- Default kuota siswa gratis
INSERT INTO quotas (role, resource_type, limit_value, window_seconds, description) VALUES
  ('murid', 'enrolled_courses', 10, 0, 'Maksimum kursus yang diikuti'),
  ('murid', 'ai_requests', 5, 2592000, 'AI request per bulan');

-- ============================================================
-- 2. AI COST TRACKING (B2)
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model VARCHAR(64) NOT NULL,
  provider VARCHAR(32) NOT NULL DEFAULT 'nararouter',
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_idr_cents BIGINT NOT NULL DEFAULT 0,
  request_type VARCHAR(32) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'completed',
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_requests_user_date ON ai_requests(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_requests_date ON ai_requests(created_at);

-- ============================================================
-- 3. TAKSONOMI MATA PELAJARAN & JENJANG (B4)
-- ============================================================

CREATE TABLE IF NOT EXISTS mata_pelajaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  kategori VARCHAR(50) NOT NULL DEFAULT 'wajib',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jenjang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  urutan INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pre-populate data Kurikulum Merdeka
INSERT INTO mata_pelajaran (nama, slug, kategori) VALUES
  ('PAI dan Budi Pekerti', 'pai', 'wajib'),
  ('Matematika', 'matematika', 'wajib'),
  ('Bahasa Indonesia', 'bahasa-indonesia', 'wajib'),
  ('IPA', 'ipa', 'wajib'),
  ('IPS', 'ips', 'wajib'),
  ('Bahasa Inggris', 'bahasa-inggris', 'wajib'),
  ('PPKn', 'ppkn', 'wajib'),
  ('PJOK', 'pjok', 'wajib'),
  ('Seni Budaya', 'seni-budaya', 'wajib'),
  ('Prakarya', 'prakarya', 'wajib'),
  ('Informatika', 'informatika', 'wajib'),
  ('Sejarah', 'sejarah', 'wajib'),
  ('Geografi', 'geografi', 'peminatan'),
  ('Ekonomi', 'ekonomi', 'peminatan'),
  ('Sosiologi', 'sosiologi', 'peminatan'),
  ('Fisika', 'fisika', 'peminatan'),
  ('Kimia', 'kimia', 'peminatan'),
  ('Biologi', 'biologi', 'peminatan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO jenjang (nama, slug, urutan) VALUES
  ('SD/MI', 'sd-mi', 1),
  ('SMP/MTs', 'smp-mts', 2),
  ('SMA/MA', 'sma-ma', 3),
  ('SMK', 'smk', 4)
ON CONFLICT (slug) DO NOTHING;

-- Tambah kolom ke tabel kursus
ALTER TABLE kursus ADD COLUMN IF NOT EXISTS mata_pelajaran_id UUID REFERENCES mata_pelajaran(id);
ALTER TABLE kursus ADD COLUMN IF NOT EXISTS jenjang_id UUID REFERENCES jenjang(id);

-- ============================================================
-- 4. QRIS PAYMENT (B5)
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_type VARCHAR(30) NOT NULL DEFAULT 'qris_static',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  proof_image_url TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status, created_at);

-- ============================================================
-- 5. ONBOARDING TRACKING (B6)
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  tour_completed BOOLEAN NOT NULL DEFAULT false,
  first_course_created BOOLEAN NOT NULL DEFAULT false,
  first_material_uploaded BOOLEAN NOT NULL DEFAULT false,
  first_ai_generated BOOLEAN NOT NULL DEFAULT false,
  first_course_published BOOLEAN NOT NULL DEFAULT false,
  current_step VARCHAR(32) NOT NULL DEFAULT 'registration',
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
