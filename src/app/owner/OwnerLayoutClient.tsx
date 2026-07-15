"use client";

import {
  LayoutDashboard,
  School,
  Users,
  Sparkles,
  Crown,
  BarChart3,
} from "lucide-react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import type { SidebarItem } from "@/components/dashboard/DashboardLayoutClient";
import type { BottomNavTab } from "@/components/layout/BottomNavBar";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/owner", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/owner/sekolah", label: "Sekolah", icon: School, soon: true },
  { href: "/owner/pengguna", label: "Pengguna", icon: Users, soon: true },
  { href: "/owner/analytics", label: "Analytics", icon: BarChart3, soon: true },
  { href: "/owner/ai-cost", label: "AI Cost", icon: Sparkles, soon: true },
];

const BOTTOM_TABS: BottomNavTab[] = [
  { href: "/owner", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/owner/sekolah", label: "Sekolah", icon: School },
  { href: "/owner/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/owner/pengguna", label: "Menu", icon: Users },
];

export function OwnerLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutClient
      sidebarItems={SIDEBAR_ITEMS}
      subtitle="Owner Console"
      defaultNama="Owner"
      homeHref="/owner"
      profileHref="/owner/profil"
      brandIcon={Crown}
      avatarIcon={Crown}
      bottomTabs={BOTTOM_TABS}
    >
      {children}
    </DashboardLayoutClient>
  );
}