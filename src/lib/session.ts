import type { JWTPayload } from "jose";
import type { NextRequest } from "next/server";

export type SesiRole = "murid" | "guru" | "owner" | "admin_sekolah" | "orang_tua";

export interface SesiPayload extends JWTPayload {
  userId?: string;
  role: SesiRole;
  nama: string;
  email?: string;
  kelas?: string;
  noAbsen?: string;
  nis?: string;
  sekolah?: string;
}

export const SESSION_COOKIE_NAME = "akal_sesi";
export const REFRESH_COOKIE_NAME = "akal_refresh";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60;

export function roleToSessionRole(role: string): SesiRole {
  if (role === "GURU" || role === "ASISTEN_GURU") return "guru";
  if (role === "OWNER") return "owner";
  if (role === "ADMIN_SEKOLAH") return "admin_sekolah";
  if (role === "ORANG_TUA") return "orang_tua";
  return "murid";
}

export async function getRequestSession(
  request: NextRequest,
): Promise<SesiPayload | null> {
  // Prefer forwarded identity from middleware
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");
  const userNama = request.headers.get("x-user-nama");
  const userEmail = request.headers.get("x-user-email");
  if (userId && userRole) {
    return {
      userId,
      role: userRole as SesiRole,
      nama: userNama || "",
      email: userEmail || undefined,
    } as SesiPayload;
  }
  // Fallback: verify cookie
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const { verifySession } = await import("./auth");
  return verifySession(token);
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
  guru: ["guru", "owner", "admin_sekolah"],
  siswa: ["murid", "orang_tua"],
};
