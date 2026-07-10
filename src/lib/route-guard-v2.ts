import { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, type SesiRole } from "@/lib/session";
import type { SesiPayload } from "@/lib/session";
import { setRlsContext } from "@/lib/db/tenant-context";

export type { SesiPayload, SesiRole };

export class GuardError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function readSession(request: NextRequest): Promise<SesiPayload | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;
  const result = await verifySession(sessionCookie.value);
  return result.success ? result.data : null;
}

export async function requireSession(request: NextRequest): Promise<SesiPayload> {
  const session = await readSession(request);
  if (!session) throw new GuardError("Harap login terlebih dahulu", 401, "UNAUTHORIZED");
  await setRlsContext(session.userId, session.role, null);
  return session;
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: SesiRole[],
): Promise<SesiPayload> {
  const session = await requireSession(request);
  if (!allowedRoles.includes(session.role)) {
    throw new GuardError("Akses ditolak", 403, "FORBIDDEN");
  }
  return session;
}

export async function requireGuru(request: NextRequest): Promise<SesiPayload> {
  return requireRole(request, ["guru", "owner", "admin_sekolah"]);
}

export async function requireSiswa(request: NextRequest): Promise<SesiPayload> {
  return requireRole(request, ["murid", "orang_tua"]);
}

export async function requireOwner(request: NextRequest): Promise<SesiPayload> {
  return requireRole(request, ["owner"]);
}

export async function requirePortal(
  request: NextRequest,
  intent: "guru" | "siswa",
): Promise<SesiPayload> {
  const session = await requireSession(request);
  const guruRoles: SesiRole[] = ["guru", "owner", "admin_sekolah"];
  const siswaRoles: SesiRole[] = ["murid", "orang_tua"];

  if (intent === "guru" && !guruRoles.includes(session.role)) {
    throw new GuardError(
      "Akun ini adalah akun siswa, bukan guru. Gunakan portal siswa.",
      403,
      "INTENT_MISMATCH",
    );
  }
  if (intent === "siswa" && !siswaRoles.includes(session.role)) {
    throw new GuardError(
      "Akun ini adalah akun guru, bukan siswa. Gunakan portal guru.",
      403,
      "INTENT_MISMATCH",
    );
  }
  return session;
}
