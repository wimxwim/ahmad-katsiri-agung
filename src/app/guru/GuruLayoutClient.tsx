"use client";

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  PlusCircle,
  GraduationCap,
  Sparkles,
  Upload,
  ClipboardCheck,
  Award,
  Wallet,
  User,
} from "lucide-react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import type { SidebarItem } from "@/components/dashboard/DashboardLayoutClient";
import type { BottomNavTab } from "@/components/layout/BottomNavBar";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { ToastProvider } from "@/components/ui/Toast";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/guru/beranda", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/guru/onboarding", label: "Mulai", icon: Sparkles },
  { href: "/guru/kursus", label: "Kursus", icon: BookOpen },
  { href: "/guru/kelas", label: "Kelas", icon: GraduationCap },
  { href: "/guru/upload", label: "Upload Dokumen", icon: Upload },
  { href: "/guru/drafts", label: "Draft AI", icon: Sparkles },
  { href: "/guru/siswa", label: "Siswa", icon: Users },
  { href: "/guru/nilai", label: "Nilai", icon: ClipboardCheck },
  { href: "/guru/sertifikat", label: "Sertifikat", icon: Award },
  { href: "/guru/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/guru/topup", label: "Top-Up Saldo", icon: Wallet },
  { href: "/guru/profil", label: "Profil", icon: User },
  { href: "/guru/buat", label: "Buat Kursus", icon: PlusCircle },
];

const BOTTOM_TABS: BottomNavTab[] = [
  { href: "/guru/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/guru/kursus", label: "Kursus", icon: BookOpen },
  { href: "/guru/buat", label: "Buat", icon: PlusCircle, primary: true },
  { href: "/guru/drafts", label: "Draft AI", icon: Sparkles },
  { href: "/guru/siswa", label: "Siswa", icon: Users },
];

export function GuruLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OnboardingTour />
      <DashboardLayoutClient
        sidebarItems={SIDEBAR_ITEMS}
        subtitle="Ruang Guru"
        defaultNama="Guru"
        homeHref="/guru/beranda"
        profileHref="/guru/profil"
        bottomTabs={BOTTOM_TABS}
      >
        <ToastProvider>{children}</ToastProvider>
      </DashboardLayoutClient>
    </>
  );
}