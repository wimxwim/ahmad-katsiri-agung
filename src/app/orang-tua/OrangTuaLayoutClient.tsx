"use client";

import {
  LayoutDashboard,
  Users,
  BarChart3,
  Heart,
  Megaphone,
} from "lucide-react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import type { SidebarItem } from "@/components/dashboard/DashboardLayoutClient";
import type { BottomNavTab } from "@/components/layout/BottomNavBar";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/orang-tua", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/orang-tua/anak", label: "Anak", icon: Users },
  { href: "/orang-tua/progres", label: "Progres", icon: BarChart3 },
  { href: "/orang-tua/pengumuman", label: "Pengumuman", icon: Megaphone, soon: true },
];

const BOTTOM_TABS: BottomNavTab[] = [
  { href: "/orang-tua", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/orang-tua/anak", label: "Anak", icon: Users },
  { href: "/orang-tua/progres", label: "Progres", icon: BarChart3 },
  { href: "/orang-tua/pengumuman", label: "Menu", icon: Megaphone },
];

export function OrangTuaLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutClient
      sidebarItems={SIDEBAR_ITEMS}
      subtitle="Ruang Orang Tua"
      defaultNama="Orang Tua"
      homeHref="/orang-tua"
      profileHref="/orang-tua/profil"
      brandIcon={Heart}
      avatarIcon={Heart}
      bottomTabs={BOTTOM_TABS}
    >
      {children}
    </DashboardLayoutClient>
  );
}