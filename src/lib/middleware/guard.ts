import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import type { SesiPayload } from "@/lib/session";

export async function getSession(): Promise<SesiPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const result = await verifySession(token);
  return result.success ? result.data : null;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requireAuth(): Promise<SesiPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) throw new AuthError("Harap login terlebih dahulu", 401);
  const result = await verifySession(token);
  if (!result.success) {
    if (result.code === "expired") {
      throw new AuthError("Sesi sudah kedaluwarsa, silakan login ulang", 401);
    }
    throw new AuthError("Harap login terlebih dahulu", 401);
  }
  return result.data;
}

export async function requireRole(
  roles: string[],
): Promise<SesiPayload> {
  const session = await requireAuth();
  if (!roles.includes(session.role)) {
    throw new AuthError("Akses ditolak", 403);
  }
  return session;
}
