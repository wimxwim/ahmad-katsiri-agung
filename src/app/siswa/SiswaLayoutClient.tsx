"use client";

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Sparkles,
  Megaphone,
  Library,
} from "lucide-react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import type { SidebarItem } from "@/components/dashboard/DashboardLayoutClient";
import { ToastProvider } from "@/components/ui/Toast";
import { FloatingActionMenu } from "@/components/layout/FloatingActionMenu";
import { OnboardingSiswa, useOnboardingSiswa } from "@/components/siswa/OnboardingSiswa";
import { useTabFocus } from "@/hooks/useTabFocus";
import { invalidateCache } from "@/lib/data-cache";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/siswa/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/siswa/materi", label: "Materi", icon: BookOpen },
  { href: "/siswa/kursus", label: "Kursus Saya", icon: Library },
  { href: "/siswa/quiz", label: "Kuis", icon: Sparkles },
  { href: "/siswa/progres", label: "Progres", icon: BarChart3 },
  { href: "/siswa/pengumuman", label: "Pengumuman", icon: Megaphone },
];

export function SiswaLayoutClient({ children }: { children: React.ReactNode }) {
  const { show, close } = useOnboardingSiswa();

  useTabFocus(() => {
    invalidateCache("beranda:");
    invalidateCache("materi:");
    invalidateCache("quiz:");
  });

  return (
    <DashboardLayoutClient
      sidebarItems={SIDEBAR_ITEMS}
      subtitle="Ruang Siswa"
      defaultNama="Siswa"
      homeHref="/siswa/beranda"
    >
      <ToastProvider>{children}</ToastProvider>
      <FloatingActionMenu />
      {show && <OnboardingSiswa onClose={close} />}
    </DashboardLayoutClient>
  );
}
