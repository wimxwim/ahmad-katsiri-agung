"use client";

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  GraduationCap,
  Sparkles,
  Megaphone,
} from "lucide-react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import type { SidebarItem } from "@/components/dashboard/DashboardLayoutClient";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/siswa/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/siswa/materi", label: "Materi", icon: BookOpen },
  { href: "/siswa/quiz", label: "Kuis", icon: Sparkles },
  { href: "/siswa/cbt", label: "CBT", icon: GraduationCap },
  { href: "/siswa/progres", label: "Progres", icon: BarChart3 },
  { href: "/siswa/pengumuman", label: "Pengumuman", icon: Megaphone },
];

export function SiswaLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutClient
      sidebarItems={SIDEBAR_ITEMS}
      subtitle="Ruang Siswa"
      defaultNama="Siswa"
      homeHref="/siswa/beranda"
    >
      {children}
    </DashboardLayoutClient>
  );
}
