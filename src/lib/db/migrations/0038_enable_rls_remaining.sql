-- Migration 0038: Enable RLS on remaining 8 tables
-- Supabase 2026 best practice: RLS on every table in exposed schema (public)
-- Pattern: app.current_user_id() + app.current_role() from migration 0014/0020
-- Idempotent — safe to run multiple times

-- ============================================
-- 1. ai_requests — user-scoped AI cost tracking
-- ============================================
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_requests_user_policy ON ai_requests;
CREATE POLICY ai_requests_user_policy ON ai_requests
  FOR SELECT
  TO public
  USING (
    user_id = app.current_user_id()
    OR app.current_role() IN ('guru', 'admin_sekolah', 'owner')
  );

DROP POLICY IF EXISTS ai_requests_insert_policy ON ai_requests;
CREATE POLICY ai_requests_insert_policy ON ai_requests
  FOR INSERT
  TO public
  WITH CHECK (
    user_id = app.current_user_id()
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );

-- ============================================
-- 2. invite_tokens — guru-scoped invite tokens
-- ============================================
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invite_tokens_guru_policy ON invite_tokens;
CREATE POLICY invite_tokens_guru_policy ON invite_tokens
  FOR ALL
  TO public
  USING (guru_id = app.current_user_id())
  WITH CHECK (guru_id = app.current_user_id());

DROP POLICY IF EXISTS invite_tokens_admin_policy ON invite_tokens;
CREATE POLICY invite_tokens_admin_policy ON invite_tokens
  FOR SELECT
  TO public
  USING (app.current_role() IN ('admin_sekolah', 'owner'));

-- ============================================
-- 3. jenjang — taxonomy, read-all, write-owner
-- ============================================
ALTER TABLE jenjang ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jenjang_read_policy ON jenjang;
CREATE POLICY jenjang_read_policy ON jenjang
  FOR SELECT
  TO public
  USING (app.current_user_id() IS NOT NULL);

DROP POLICY IF EXISTS jenjang_write_policy ON jenjang;
CREATE POLICY jenjang_write_policy ON jenjang
  FOR INSERT
  TO public
  WITH CHECK (app.current_role() = 'owner');

DROP POLICY IF EXISTS jenjang_update_policy ON jenjang;
CREATE POLICY jenjang_update_policy ON jenjang
  FOR UPDATE
  TO public
  USING (app.current_role() = 'owner')
  WITH CHECK (app.current_role() = 'owner');

DROP POLICY IF EXISTS jenjang_delete_policy ON jenjang;
CREATE POLICY jenjang_delete_policy ON jenjang
  FOR DELETE
  TO public
  USING (app.current_role() = 'owner');

-- ============================================
-- 4. mata_pelajaran — taxonomy, read-all, write-owner
-- ============================================
ALTER TABLE mata_pelajaran ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mapel_read_policy ON mata_pelajaran;
CREATE POLICY mapel_read_policy ON mata_pelajaran
  FOR SELECT
  TO public
  USING (app.current_user_id() IS NOT NULL);

DROP POLICY IF EXISTS mapel_write_policy ON mata_pelajaran;
CREATE POLICY mapel_write_policy ON mata_pelajaran
  FOR INSERT
  TO public
  WITH CHECK (app.current_role() = 'owner');

DROP POLICY IF EXISTS mapel_update_policy ON mata_pelajaran;
CREATE POLICY mapel_update_policy ON mata_pelajaran
  FOR UPDATE
  TO public
  USING (app.current_role() = 'owner')
  WITH CHECK (app.current_role() = 'owner');

DROP POLICY IF EXISTS mapel_delete_policy ON mata_pelajaran;
CREATE POLICY mapel_delete_policy ON mata_pelajaran
  FOR DELETE
  TO public
  USING (app.current_role() = 'owner');

-- ============================================
-- 5. onboarding_progress — user-scoped
-- ============================================
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS onboarding_user_policy ON onboarding_progress;
CREATE POLICY onboarding_user_policy ON onboarding_progress
  FOR ALL
  TO public
  USING (user_id = app.current_user_id())
  WITH CHECK (user_id = app.current_user_id());

DROP POLICY IF EXISTS onboarding_admin_policy ON onboarding_progress;
CREATE POLICY onboarding_admin_policy ON onboarding_progress
  FOR SELECT
  TO public
  USING (app.current_role() IN ('admin_sekolah', 'owner'));

-- ============================================
-- 6. owner_metrics_daily — owner-only
-- ============================================
ALTER TABLE owner_metrics_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS owner_metrics_policy ON owner_metrics_daily;
CREATE POLICY owner_metrics_policy ON owner_metrics_daily
  FOR ALL
  TO public
  USING (app.current_role() = 'owner')
  WITH CHECK (app.current_role() = 'owner');

-- ============================================
-- 7. quota_usages — user-scoped
-- ============================================
ALTER TABLE quota_usages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quota_usages_user_policy ON quota_usages;
CREATE POLICY quota_usages_user_policy ON quota_usages
  FOR SELECT
  TO public
  USING (
    user_id = app.current_user_id()
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );

DROP POLICY IF EXISTS quota_usages_insert_policy ON quota_usages;
CREATE POLICY quota_usages_insert_policy ON quota_usages
  FOR INSERT
  TO public
  WITH CHECK (
    user_id = app.current_user_id()
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );

DROP POLICY IF EXISTS quota_usages_update_policy ON quota_usages;
CREATE POLICY quota_usages_update_policy ON quota_usages
  FOR UPDATE
  TO public
  USING (
    user_id = app.current_user_id()
    OR app.current_role() IN ('admin_sekolah', 'owner')
  )
  WITH CHECK (
    user_id = app.current_user_id()
    OR app.current_role() IN ('admin_sekolah', 'owner')
  );

-- ============================================
-- 8. quotas — config table, read-all, write-owner
-- ============================================
ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quotas_read_policy ON quotas;
CREATE POLICY quotas_read_policy ON quotas
  FOR SELECT
  TO public
  USING (app.current_user_id() IS NOT NULL);

DROP POLICY IF EXISTS quotas_write_policy ON quotas;
CREATE POLICY quotas_write_policy ON quotas
  FOR INSERT
  TO public
  WITH CHECK (app.current_role() = 'owner');

DROP POLICY IF EXISTS quotas_update_policy ON quotas;
CREATE POLICY quotas_update_policy ON quotas
  FOR UPDATE
  TO public
  USING (app.current_role() = 'owner')
  WITH CHECK (app.current_role() = 'owner');

DROP POLICY IF EXISTS quotas_delete_policy ON quotas;
CREATE POLICY quotas_delete_policy ON quotas
  FOR DELETE
  TO public
  USING (app.current_role() = 'owner');

-- ============================================
-- Migration complete — 8 tables now RLS-protected
-- ============================================