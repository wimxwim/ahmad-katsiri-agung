/**
 * CMS Configuration — toggle between hardcoded data and CMS-managed content.
 *
 * Safety: CMS is DISABLED by default. Existing components keep using hardcoded data.
 * To enable: set NEXT_PUBLIC_USE_CMS=true
 *
 * Strategy:
 *   1. Set NEXT_PUBLIC_USE_CMS=true → app reads from content/{collection}/*.json
 *   2. NEXT_PUBLIC_USE_CMS=false (default) → app reads from src/data/*.ts (unchanged)
 *   3. Fallback: if CMS data unavailable, silently falls back to hardcoded
 */

export const CMS_ENABLED =
  process.env.NEXT_PUBLIC_USE_CMS === "true";

export function useCms(): boolean {
  return CMS_ENABLED;
}
