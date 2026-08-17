import "server-only";
import type { JWTPayload } from "jose";
import type { NextRequest } from "next/server";

export type SesiRole = "murid" | "guru" | "owner" | "admin_sekolah" | "orang_tua";

export interface SesiPayload extends JWTPayload {
  userId: string;
  role: SesiRole;
  nama: string;
  email?: string;
  kelas?: string;
  noAbsen?: string;
  nis?: string;
  sekolah?: string;
}

export const SESSION_COOKIE_NAME = "__Host-akal_sesi";
export const REFRESH_COOKIE_NAME = "akal_refresh";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60;

export function roleToSessionRole(role: string): SesiRole {
  const r = role.trim().toUpperCase();
  if (r === "GURU" || r === "ASISTEN_GURU") return "guru";
  if (r === "OWNER") return "owner";
  if (r === "ADMIN_SEKOLAH") return "admin_sekolah";
  if (r === "ORANG_TUA") return "orang_tua";
  return "murid";
}

export async function getRequestSession(request: NextRequest): Promise<SesiPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { verifySession } = await import("./auth");
    const result = await verifySession(token);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export const ROLE_HOME_PATHS: Record<SesiRole, string> = {
  owner: "/owner",
  admin_sekolah: "/admin-sekolah",
  guru: "/guru",
  murid: "/siswa",
  orang_tua: "/orang-tua",
};

export const ROLE_LABEL: Record<SesiRole, string> = {
  owner: "Owner",
  admin_sekolah: "Admin Sekolah",
  guru: "Guru",
  murid: "Siswa",
  orang_tua: "Orang Tua",
};

export const INTENT_PORTAL: Record<"guru" | "siswa", SesiRole[]> = {
  guru: ["guru"],
  siswa: ["murid", "orang_tua"],
};
