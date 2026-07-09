import { requireDashboardSession } from "@/lib/require-dashboard-session";
import type { Metadata } from "next";
import { GuruLayoutClient } from "./GuruLayoutClient";

export const metadata: Metadata = {
  title: "Ruang Guru — AKAL Center",
  robots: { index: false, follow: false },
};

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardSession(["guru", "owner", "admin_sekolah"], "guru", "/guru/beranda");
  return <GuruLayoutClient>{children}</GuruLayoutClient>;
}
