-- Migration: Owner Monitoring + User Activity Tracking
-- AKAL Center — M1/M2: owner_metrics_daily + last_active_at
-- Dibuat: 11 Juli 2026

-- ============================================================
-- 1. OWNER METRICS DAILY — Agregat harian untuk dashboard owner
-- ============================================================
CREATE TABLE IF NOT EXISTS owner_metrics_daily (
  metric_date DATE NOT NULL,
  total_guru INTEGER NOT NULL DEFAULT 0,
  total_guru_aktif_7hari INTEGER NOT NULL DEFAULT 0,
  total_siswa INTEGER NOT NULL DEFAULT 0,
  total_kursus INTEGER NOT NULL DEFAULT 0,
  total_kursus_published INTEGER NOT NULL DEFAULT 0,
  total_ai_requests INTEGER NOT NULL DEFAULT 0,
  total_ai_tokens BIGINT NOT NULL DEFAULT 0,
  ai_cost_idr_cents BIGINT NOT NULL DEFAULT 0,
  total_payments_pending INTEGER NOT NULL DEFAULT 0,
  total_payments_confirmed INTEGER NOT NULL DEFAULT 0,
  revenue_idr_cents BIGINT NOT NULL DEFAULT 0,
  new_signups_guru INTEGER NOT NULL DEFAULT 0,
  new_signups_siswa INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (metric_date)
);

-- ============================================================
-- 2. LAST ACTIVE AT — Tracking user activity
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);

-- ============================================================
-- 3. USER ACTIVITY INDEX — Untuk query retensi cepat
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_created_at_role ON users(created_at, role);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_confirmed_at ON payments(created_at) WHERE status = 'confirmed';
