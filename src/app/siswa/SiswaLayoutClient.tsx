"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Sparkles,
  FileText,
  Megaphone,
  Library,
  Search,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import type { SidebarItem } from "@/components/dashboard/DashboardLayoutClient";
import type { BottomNavTab } from "@/components/layout/BottomNavBar";
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
  { href: "/siswa/soal", label: "Soal", icon: FileText },
  { href: "/siswa/ai-tutor", label: "AI Tutor", icon: MessageSquare },
  { href: "/siswa/diskusi", label: "Diskusi", icon: MessageSquare },
  { href: "/siswa/progres", label: "Progres", icon: BarChart3 },
  { href: "/siswa/pengumuman", label: "Pengumuman", icon: Megaphone },
];

const BOTTOM_TABS: BottomNavTab[] = [
  { href: "/siswa/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/siswa/materi", label: "Materi", icon: BookOpen },
  { href: "/siswa/quiz", label: "Kuis", icon: Sparkles },
  { href: "/siswa/soal", label: "Soal", icon: FileText },
  { href: "/siswa/progres", label: "Progres", icon: BarChart3 },
];

function KatalogKursusBar() {
  return (
    <Link
      href="/kursus"
      className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary/90 text-white px-4 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.99] transition-all duration-200 mb-4"
    >
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <Search className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm">Jelajahi Kursus</p>
        <p className="text-xs text-white/70">Temukan kursus baru untuk diikuti</p>
      </div>
      <ArrowRight className="w-5 h-5 shrink-0" />
    </Link>
  );
}

export function SiswaLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExamRoute = pathname.startsWith("/siswa/cbt");

  const { show, close } = useOnboardingSiswa();

  useTabFocus(() => {
    invalidateCache("beranda:dashboard");
    invalidateCache("materi:");
    invalidateCache("quiz:");
    window.dispatchEvent(new CustomEvent("akal:cache-invalidated"));
  });

  if (isExamRoute) {
    return (
      <div className="min-h-dvh bg-surface">
        <main className="min-h-dvh px-3 sm:px-5 lg:px-8 py-4">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    );
  }

  return (
    <DashboardLayoutClient
      sidebarItems={SIDEBAR_ITEMS}
      subtitle="Ruang Siswa"
      defaultNama="Siswa"
      homeHref="/siswa/beranda"
      profileHref="/siswa/beranda"
      bottomTabs={BOTTOM_TABS}
    >
      <KatalogKursusBar />
      <ToastProvider>{children}</ToastProvider>
      <div className="hidden sm:block">
        <FloatingActionMenu />
      </div>
      {show && <OnboardingSiswa onClose={close} />}
    </DashboardLayoutClient>
  );
}