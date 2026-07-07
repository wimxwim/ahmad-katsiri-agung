"use client";

/**
 * Logout client helper — pakai endpoint final /api/v1/auth/logout.
 *
 * - Idempotent (bisa dipanggil berulang)
 * - Wajib pakai credentials: "include" agar cookie HttpOnly ikut terkirim
 * - Tetap throw jika network error agar caller bisa memutuskan UX
 */
export async function handleLogout(): Promise<string> {
  const res = await fetch("/api/v1/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({ redirect: "/" }));
  return data.redirect || "/";
}
