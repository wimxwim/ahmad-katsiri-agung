import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, ROLE_HOME_PATHS, type SesiRole } from "@/lib/session";
import type { Metadata } from "next";
import { OrangTuaLayoutClient } from "./OrangTuaLayoutClient";

export const metadata: Metadata = {
  title: "Ruang Orang Tua — AKAL Center",
  robots: { index: false, follow: false },
};

const ALLOWED: SesiRole[] = ["orang_tua"];

export default async function OrangTuaLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = _ar && _ar.success ? _ar.data : null;
  if (!session) redirect("/masuk?portal=siswa&redirect=/orang-tua");
  if (!ALLOWED.includes(session.role)) redirect(ROLE_HOME_PATHS[session.role] || "/");
  return <OrangTuaLayoutClient>{children}</OrangTuaLayoutClient>;
}
