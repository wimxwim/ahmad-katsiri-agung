import "server-only";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import type { SesiPayload } from "@/lib/session";

/**
 * DAL — Data Access Layer untuk session.
 * Wrapper ringan di atas auth.ts + session.ts.
 * Dipakai oleh route handler yang belum direfactor ke route-guard-v2.ts.
 */
export async function getSession(): Promise<SesiPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;
  const result = await verifySession(sessionCookie.value);
  return result.success ? result.data : null;
}
