import { requireDashboardSession } from "@/lib/require-dashboard-session";
import type { Metadata } from "next";
import { SiswaLayoutClient } from "./SiswaLayoutClient";

export const metadata: Metadata = {
  title: "Ruang Siswa — AKAL Center",
  robots: { index: false, follow: false },
};

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardSession(["murid", "orang_tua"], "siswa", "/siswa/beranda");
  return <SiswaLayoutClient>{children}</SiswaLayoutClient>;
}
