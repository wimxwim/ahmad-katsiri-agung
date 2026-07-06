import type { JWTPayload } from "jose";

export type SesiRole = "murid" | "guru";

export interface SesiPayload extends JWTPayload {
  role: SesiRole;
  nama: string;
  kelas?: string;
  noAbsen?: string;
  nis?: string;
  sekolah?: string;
}

export const SESSION_COOKIE_NAME = "akal_sesi";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60;
