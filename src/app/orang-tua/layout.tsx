import { requireDashboardSession } from "@/lib/require-dashboard-session";
import type { Metadata } from "next";
import { OrangTuaLayoutClient } from "./OrangTuaLayoutClient";

export const metadata: Metadata = {
  title: "Ruang Orang Tua — AKAL Center",
  robots: { index: false, follow: false },
};

export default async function OrangTuaLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardSession(["orang_tua"], "siswa", "/orang-tua");
  return <OrangTuaLayoutClient>{children}</OrangTuaLayoutClient>;
}
