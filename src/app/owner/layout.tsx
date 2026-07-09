import { requireDashboardSession } from "@/lib/require-dashboard-session";
import type { Metadata } from "next";
import { OwnerLayoutClient } from "./OwnerLayoutClient";

export const metadata: Metadata = {
  title: "Owner Console — AKAL Center",
  robots: { index: false, follow: false },
};

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardSession(["owner"], "guru", "/owner");
  return <OwnerLayoutClient>{children}</OwnerLayoutClient>;
}
