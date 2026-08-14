import { requireDashboardSession } from "@/lib/require-dashboard-session";
import type { Metadata } from "next";
import { GuruLayoutClient } from "./GuruLayoutClient";

export const metadata: Metadata = {
  title: "Ruang Guru — AKAL Center",
  robots: { index: false, follow: false },
};

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardSession(["guru", "owner", "admin_sekolah"], "guru", "/guru/beranda");
  // F11-5 ErrorBoundary global + Suspense wrapper ada di GuruLayoutClient (client component)
  // F11-2 OfflineBanner dirender di GuruLayoutClient
  return <GuruLayoutClient>{children}</GuruLayoutClient>;
}
