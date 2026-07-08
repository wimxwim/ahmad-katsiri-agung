import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, ROLE_HOME_PATHS, type SesiRole } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { GuruLayoutClient } from "./GuruLayoutClient";

export const metadata: Metadata = {
  title: "Ruang Guru — AKAL Center",
  robots: { index: false, follow: false },
};

const ALLOWED: SesiRole[] = ["guru", "owner", "admin_sekolah"];

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = _ar && _ar.success ? _ar.data : null;
  if (!session) redirect("/masuk?portal=guru&redirect=/guru/beranda");
  if (!ALLOWED.includes(session.role)) redirect(ROLE_HOME_PATHS[session.role] || "/");
  return <GuruLayoutClient>{children}</GuruLayoutClient>;
}
