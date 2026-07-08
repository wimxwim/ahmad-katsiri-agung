import { requireDashboardSession } from "@/lib/require-dashboard-session";
import type { Metadata } from "next";
import { AdminSekolahLayoutClient } from "./AdminSekolahLayoutClient";

export const metadata: Metadata = {
  title: "Admin Sekolah — AKAL Center",
  robots: { index: false, follow: false },
};

export default async function AdminSekolahLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardSession(["admin_sekolah", "owner"], "guru", "/admin-sekolah");
  return <AdminSekolahLayoutClient>{children}</AdminSekolahLayoutClient>;
}
