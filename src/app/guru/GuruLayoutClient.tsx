"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "antd";
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
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import type { SidebarItem, SidebarSection } from "@/components/dashboard/DashboardLayoutClient";
import type { BottomNavTab } from "@/components/layout/BottomNavBar";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { ToastProvider } from "@/components/ui/Toast";
import { TokenBalanceBadge } from "@/components/guru/TokenBalanceBadge";
import { GuruDiskusiBadge } from "@/components/guru/GuruDiskusiBadge";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SkeletonDashboardGuru } from "@/components/ui/SkeletonBlocks";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/guru/beranda", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/guru/onboarding", label: "Mulai", icon: Sparkles },
  { href: "/guru/kursus", label: "Kursus", icon: BookOpen },
  { href: "/guru/kelas", label: "Kelas", icon: GraduationCap },
  { href: "/guru/upload", label: "Upload Dokumen", icon: Upload },
  { href: "/guru/drafts", label: "Draft AI", icon: Sparkles },
  { href: "/guru/siswa", label: "Siswa", icon: Users },
  {
    href: "/guru/diskusi",
    label: "Pertanyaan",
    icon: MessageSquare,
    badge: <GuruDiskusiBadge />,
  },
  { href: "/guru/nilai", label: "Nilai", icon: ClipboardCheck },
  { href: "/guru/sertifikat", label: "Sertifikat", icon: Award },
  { href: "/guru/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/guru/topup", label: "Top-Up Saldo", icon: Wallet },
  { href: "/guru/profil", label: "Profil", icon: User },
  { href: "/guru/buat", label: "Buat Kursus", icon: PlusCircle },
];

// F13-1 Grouped sidebar 4 section — Mengajar, Konten, Siswa, Akun
const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: "Mengajar",
    items: [
      { href: "/guru/beranda", label: "Ringkasan", icon: LayoutDashboard },
      { href: "/guru/onboarding", label: "Mulai", icon: Sparkles },
      { href: "/guru/kursus", label: "Kursus", icon: BookOpen },
      { href: "/guru/kelas", label: "Kelas", icon: GraduationCap },
      { href: "/guru/buat", label: "Buat Kursus", icon: PlusCircle },
    ],
  },
  {
    label: "Konten",
    items: [
      { href: "/guru/upload", label: "Upload Dokumen", icon: Upload },
      { href: "/guru/drafts", label: "Draft AI", icon: Sparkles },
    ],
  },
  {
    label: "Siswa",
    items: [
      { href: "/guru/siswa", label: "Siswa", icon: Users },
      { href: "/guru/nilai", label: "Nilai", icon: ClipboardCheck },
      {
        href: "/guru/diskusi",
        label: "Pertanyaan",
        icon: MessageSquare,
        badge: <GuruDiskusiBadge />,
      },
      { href: "/guru/sertifikat", label: "Sertifikat", icon: Award },
      { href: "/guru/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Akun",
    items: [
      { href: "/guru/topup", label: "Top-Up Saldo", icon: Wallet },
      { href: "/guru/profil", label: "Profil", icon: User },
    ],
  },
];

const BOTTOM_TABS: BottomNavTab[] = [
  { href: "/guru/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/guru/kursus", label: "Kursus", icon: BookOpen },
  { href: "/guru/buat", label: "Buat", icon: PlusCircle, primary: true },
  { href: "/guru/siswa", label: "Siswa", icon: Users },
  { href: "#lainnya", label: "Lainnya", icon: MoreHorizontal },
];

const LAINNYA_ITEMS: SidebarItem[] = [
  { href: "/guru/drafts", label: "Draft AI", icon: Sparkles },
  { href: "/guru/kelas", label: "Kelas", icon: GraduationCap },
  { href: "/guru/upload", label: "Upload Dokumen", icon: Upload },
  { href: "/guru/nilai", label: "Nilai", icon: ClipboardCheck },
  { href: "/guru/sertifikat", label: "Sertifikat", icon: Award },
  { href: "/guru/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/guru/topup", label: "Top-Up Saldo", icon: Wallet },
  { href: "/guru/profil", label: "Profil", icon: User },
  { href: "/guru/onboarding", label: "Mulai", icon: Sparkles },
  { href: "/guru/diskusi", label: "Pertanyaan", icon: MessageSquare, badge: <GuruDiskusiBadge /> },
];

export function GuruLayoutClient({ children }: { children: React.ReactNode }) {
  const [showLainnya, setShowLainnya] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* F11-2 OfflineBanner global — sudah F9, pastikan dirender di layout */}
      <OfflineBanner />
      <OnboardingTour />
      {/* F11-5 ErrorBoundary global + Suspense — bungkus children */}
      <ErrorBoundary>
        <Suspense fallback={<div aria-busy="true" role="status"><SkeletonDashboardGuru /></div>}>
          {/* F4-1: Navigation Rail 80px tablet - hidden md:flex lg:hidden, 5 BOTTOM_TABS + Lainnya */}
          {/* TODO Rail: if isTablet via useMediaQuery needed, replace CSS breakpoint with JS matchMedia for dynamic rail */}
          <nav
            aria-label="Navigasi tablet"
            className="hidden md:flex lg:hidden flex-col w-20 bg-white border-r border-border-precision items-center py-4 gap-2 fixed left-0 top-0 bottom-0 z-30 isolate"
          >
            {BOTTOM_TABS.filter((t) => t.href !== "#lainnya").map((tab) => {
              const active = pathname === tab.href || (tab.href !== "/guru/beranda" && pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-label={tab.label}
                  aria-current={active ? "page" : undefined}
                  className={
                    tab.primary
                      ? "w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glass hover:brightness-110 transition-all"
                      : active
                        ? "w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-colors"
                        : "w-12 h-12 rounded-2xl flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors"
                  }
                >
                  <tab.icon className="w-5 h-5" />
                </Link>
              );
            })}
            <button
              onClick={() => setShowLainnya(true)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors"
              aria-label="Lainnya"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <span className="text-[9px] font-bold tracking-wider text-on-surface-variant/60">Lainnya</span>
          </nav>
          <div className="md:pl-20 lg:pl-0">
            <DashboardLayoutClient
              sidebarItems={SIDEBAR_ITEMS}
              sidebarSections={SIDEBAR_SECTIONS}
              subtitle="Ruang Guru"
              defaultNama="Guru"
              homeHref="/guru/beranda"
              profileHref="/guru/profil"
              bottomTabs={BOTTOM_TABS}
              onLainnyaClick={() => setShowLainnya(true)}
            >
              <TokenBalanceBadge />
              <ToastProvider>{children}</ToastProvider>
            </DashboardLayoutClient>
          </div>
        </Suspense>
      </ErrorBoundary>

      <Drawer
        open={showLainnya}
        onClose={() => setShowLainnya(false)}
        placement="bottom"
        height="auto"
        closable={false}
        styles={{
          body: { padding: 0 },
          wrapper: { maxWidth: 640, marginInline: "auto" },
        }}
        className="[&_.ant-drawer-content]:!rounded-t-[32px] [&_.ant-drawer-content-wrapper]:!rounded-t-[32px] [&_.ant-drawer-content-wrapper]:!max-w-[640px] [&_.ant-drawer-content-wrapper]:!mx-auto"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between px-6 pb-3">
          <h3 className="font-heading font-bold text-lg text-primary">Menu Lainnya</h3>
          <button
            onClick={() => setShowLainnya(false)}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Tutup menu"
          >
            <MoreHorizontal className="w-4 h-4 rotate-45" />
          </button>
        </div>
        <div className="px-3 pb-6 overflow-y-auto max-h-[70dvh]">
          <div className="grid grid-cols-1 gap-1">
            {LAINNYA_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowLainnya(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors min-h-11"
              >
                <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge}
              </Link>
            ))}
          </div>
        </div>
      </Drawer>
    </>
  );
}
