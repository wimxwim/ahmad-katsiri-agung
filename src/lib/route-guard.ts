import "server-only";
import type { NextRequest } from "next/server";
import { getRequestSession, INTENT_PORTAL } from "./session";
import type { SesiPayload, SesiRole } from "./session";

export class GuardError extends Error {
  status: number;
  code: string;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function requireSession(
  request: NextRequest,
): Promise<SesiPayload> {
  const session = await getRequestSession(request);
  if (!session?.userId) throw new GuardError("UNAUTHORIZED", "Silakan login terlebih dahulu", 401);
  return session;
}

export async function requireRole(
  request: NextRequest,
  roles: SesiRole[],
): Promise<SesiPayload> {
  const session = await requireSession(request);
  if (!roles.includes(session.role)) {
    throw new GuardError(
      "FORBIDDEN",
      `Akses ditolak. Halaman ini untuk: ${roles.join(", ")}.`,
      403,
    );
  }
  return session;
}

export function requireGuru(request: NextRequest): Promise<SesiPayload> {
  return requireRole(request, ["guru", "owner", "admin_sekolah"]);
}

export function requireSiswa(request: NextRequest): Promise<SesiPayload> {
  return requireRole(request, ["murid", "orang_tua"]);
}

export async function requirePortal(
  request: NextRequest,
  portal: "guru" | "siswa",
): Promise<SesiPayload> {
  const session = await requireSession(request);
  const allowed = INTENT_PORTAL[portal];
  if (!allowed.includes(session.role)) {
    const correctPortal = INTENT_PORTAL.guru.includes(session.role) ? "guru" : "siswa";
    throw new GuardError(
      "INTENT_MISMATCH",
      `Akun ${session.role} tidak bisa masuk dari portal ${portal}. Gunakan portal ${correctPortal}.`,
      403,
    );
  }
  return session;
}
