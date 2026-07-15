"use client";

import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  FileText,
  Building2,
} from "lucide-react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import type { SidebarItem } from "@/components/dashboard/DashboardLayoutClient";
import type { BottomNavTab } from "@/components/layout/BottomNavBar";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/admin-sekolah", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin-sekolah/guru", label: "Guru", icon: Users, soon: true },
  { href: "/admin-sekolah/kursus", label: "Kursus", icon: BookOpen, soon: true },
  { href: "/admin-sekolah/laporan", label: "Laporan", icon: FileText, soon: true },
  { href: "/admin-sekolah/sekolah", label: "Sekolah", icon: School, soon: true },
];

const BOTTOM_TABS: BottomNavTab[] = [
  { href: "/admin-sekolah", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin-sekolah/guru", label: "Guru", icon: Users },
  { href: "/admin-sekolah/laporan", label: "Laporan", icon: FileText },
  { href: "/admin-sekolah/sekolah", label: "Menu", icon: School },
];

export function AdminSekolahLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutClient
      sidebarItems={SIDEBAR_ITEMS}
      subtitle="Admin Sekolah"
      defaultNama="Admin"
      homeHref="/admin-sekolah"
      profileHref="/admin-sekolah/profil"
      brandIcon={Building2}
      avatarIcon={Building2}
      bottomTabs={BOTTOM_TABS}
    >
      {children}
    </DashboardLayoutClient>
  );
}