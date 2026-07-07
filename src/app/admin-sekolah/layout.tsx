import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, ROLE_HOME_PATHS, type SesiRole } from "@/lib/session";
import type { Metadata } from "next";
import { AdminSekolahLayoutClient } from "./AdminSekolahLayoutClient";

export const metadata: Metadata = {
  title: "Admin Sekolah — AKAL Center",
  robots: { index: false, follow: false },
};

const ALLOWED: SesiRole[] = ["admin_sekolah", "owner"];

export default async function AdminSekolahLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const session = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  if (!session) redirect("/masuk?portal=guru&redirect=/admin-sekolah");
  if (!ALLOWED.includes(session.role)) redirect(ROLE_HOME_PATHS[session.role] || "/");
  return <AdminSekolahLayoutClient>{children}</AdminSekolahLayoutClient>;
}
