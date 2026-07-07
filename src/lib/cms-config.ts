/**
 * CMS Configuration — toggle between hardcoded data and CMS-managed content.
 *
 * ⚠️ CMS_LEGACY_READONLY ⚠️
 * Keystatic CMS sudah DIBEKUKAN untuk fitur baru per TODO V2 Multi-Guru.
 *
 * Status:
 *   - READ-ONLY: `content/*` masih bisa dibaca untuk kompatibilitas ke belakang
 *   - NO WRITE:  Tidak boleh ada fitur baru yang menulis/membuat entry di `content/*`
 *   - NEW FEATURES: Pakai Drizzle/Supabase. File upload baru pakai ImageKit.
 *
 * Untuk enable bacaan legacy: set NEXT_PUBLIC_USE_CMS=true
 * Untuk hardcoded fallback: set NEXT_PUBLIC_USE_CMS=false (DEFAULT, aman)
 *
 * Strategy:
 *   1. CMS_ENABLED=true dan JSON files exist → baca dari content/{collection}/*.json
 *   2. CMS_ENABLED=false (default) → baca dari src/data/*.ts (hardcoded)
 *   3. Fallback: jika CMS data tidak tersedia, otomatis pakai hardcoded
 *
 * @see /prd/TODO-V2-MULTI-GURU.md Gelombang 3
 */

export const CMS_ENABLED =
  process.env.NEXT_PUBLIC_USE_CMS === "true";

/**
 * Penanda internal: semua fungsi CMS read adalah legacy read-only.
 * Jangan tulis ke content/* dari fitur baru. Gunakan DB.
 */
export const CMS_LEGACY_READONLY = true as const;

export function useCms(): boolean {
  return CMS_ENABLED;
}
