import { requireDashboardSession } from "@/lib/require-dashboard-session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitoring Dashboard — AKAL Center",
  robots: { index: false, follow: false },
};

export default async function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardSession(["owner", "guru"], "guru", "/admin/monitoring");
  return <>{children}</>;
}
