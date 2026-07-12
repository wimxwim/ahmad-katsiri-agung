"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Drawer, Button } from "antd";
import {
  Home,
  BookOpen,
  Grid3x3,
  Info,
  LogOut,
  GraduationCap,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { useSession, useSessionLoading } from "@/components/providers/SessionProvider";
import { handleLogout } from "@/lib/logout";

const SHEET_ITEMS: { href: string; label: string; icon: LucideIcon; desc: string }[] = [
  { href: "/fitur", label: "Fitur", icon: Sparkles, desc: "Lihat semua fitur platform" },
  { href: "/tentang", label: "Tentang", icon: Info, desc: "Tentang AKAL Center" },
  { href: "/kursus", label: "Kursus", icon: BookOpen, desc: "Jelajahi katalog kursus" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const session = useSession();
  const isLoading = useSessionLoading();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (pathname.startsWith("/masuk")) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navTabs = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/fitur", label: "Fitur", icon: Sparkles },
    { href: "/kursus", label: "Kursus", icon: BookOpen },
    ...(session
      ? [
          {
            href:
              session.role === "guru"
                ? "/guru/beranda"
                : session.role === "owner"
                ? "/owner"
                : session.role === "admin_sekolah"
                ? "/admin-sekolah"
                : session.role === "orang_tua"
                ? "/orang-tua"
                : "/siswa/beranda",
            label: "Dashboard",
            icon: GraduationCap,
            sessionOnly: true,
          },
        ]
      : []),
  ];

  return (
    <>
      <Drawer
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        placement="bottom"
        height="auto"
        closable={false}
        styles={{
          body: { padding: 0 },
          wrapper: { maxWidth: 640, marginInline: "auto" },
        }}
        className="[&_.ant-drawer-content-wrapper]:!rounded-t-2xl [&_.ant-drawer-content-wrapper]:!max-w-[640px] [&_.ant-drawer-content-wrapper]:!mx-auto"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between px-6 pb-2">
          <h3 className="font-heading font-bold text-lg text-primary">Menu Lainnya</h3>
          <Button
            type="text"
            shape="circle"
            icon={<X className="w-4 h-4" />}
            onClick={() => setSheetOpen(false)}
            aria-label="Tutup menu"
            className="text-gray-400 hover:text-gray-600"
          />
        </div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[70dvh]">
          <div className="grid grid-cols-2 gap-3">
            {SHEET_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSheetOpen(false)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all duration-200 ${
                    active
                      ? "bg-primary/5 border-primary/20 text-primary"
                      : "bg-white border-border-precision text-on-surface hover:bg-primary/5 hover:border-primary/20"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${active ? "bg-primary/10" : "bg-primary/5"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm">{item.label}</span>
                    <p className="text-xs text-on-surface-variant/70 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              );
            })}

            {isLoading ? null : !session ? (
              <Link
                href="/masuk"
                onClick={() => setSheetOpen(false)}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-border-precision bg-white hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
              >
                <div className="p-2 rounded-xl bg-primary/5">
                  <LogOut className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-sm">Masuk</span>
                  <p className="text-xs text-on-surface-variant/70 leading-tight mt-0.5">Login siswa atau guru</p>
                </div>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSheetOpen(false);
                  handleLogout().then((r) => (window.location.href = r));
                }}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-border-precision bg-white hover:bg-red-50 hover:border-red-200 transition-all duration-200 text-left"
              >
                <div className="p-2 rounded-xl bg-red-50">
                  <LogOut className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <span className="font-semibold text-sm">Keluar</span>
                  <p className="text-xs text-on-surface-variant/70 leading-tight mt-0.5">
                    {session.nama} &mdash; {session.role === "guru" ? "Guru" : "Siswa"}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </Drawer>

      <nav
        className="md:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="pointer-events-auto flex items-center gap-0.5 bg-white/80 backdrop-blur-2xl border border-white/20 rounded-xl px-1.5 py-1.5 shadow-glass">
          {navTabs.map((tab) => {
            const active = tab.href !== null && isActive(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-11 px-2.5 rounded-tab transition-colors duration-200 cursor-pointer"
              >
                {active && (
                  <motion.span
                    layoutId="tab-indicator"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-primary rounded-tab"
                  />
                )}
                <span className="relative z-10">
                  <Icon
                    className="w-5 h-5"
                    aria-hidden="true"
                    strokeWidth={active ? 2.5 : 2}
                  />
                </span>
                <span
                  className={`relative z-10 text-[11px] font-semibold leading-none transition-colors duration-200 ${
                    active ? "text-on-primary" : "text-on-surface-variant"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setSheetOpen(true)}
            className="relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-11 px-2.5 rounded-tab text-on-surface-variant/70 hover:text-on-surface-variant transition-colors duration-200 cursor-pointer"
            aria-label="Menu lainnya"
          >
            <Grid3x3 className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            <span className="text-[11px] font-semibold leading-none">Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
}