"use client";

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Sparkles,
  Megaphone,
} from "lucide-react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import type { SidebarItem } from "@/components/dashboard/DashboardLayoutClient";
import { ToastProvider } from "@/components/ui/Toast";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/siswa/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/siswa/materi", label: "Materi", icon: BookOpen },
  { href: "/siswa/quiz", label: "Kuis", icon: Sparkles },
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
      <ToastProvider>{children}</ToastProvider>
    </DashboardLayoutClient>
  );
}
