"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
import { useSession } from "@/components/providers/SessionProvider";
import { handleLogout } from "@/lib/logout";
import { EASE_CURVE } from "@/lib/constants";

const SHEET_ITEMS: { href: string; label: string; icon: LucideIcon; desc: string }[] = [
  { href: "/fitur", label: "Fitur", icon: Sparkles, desc: "Lihat semua fitur platform" },
  { href: "/tentang", label: "Tentang", icon: Info, desc: "Tentang AKAL Center" },
  { href: "/kursus", label: "Kursus", icon: BookOpen, desc: "Jelajahi katalog kursus" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const session = useSession();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    if (sheetOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sheetOpen, closeSheet]);

  if (pathname.startsWith("/masuk")) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navTabs = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/fitur", label: "Fitur", icon: Sparkles },
    { href: "/kursus", label: "Kursus", icon: BookOpen },
    ...(session ? [{ href: session.role === "guru" ? "/guru" : session.role === "owner" ? "/owner" : session.role === "admin_sekolah" ? "/admin-sekolah" : session.role === "orang_tua" ? "/orang-tua" : "/siswa", label: "Dashboard", icon: GraduationCap, sessionOnly: true }] : []),
  ];

  return (
    <>
      <AnimatePresence>
        {sheetOpen && (
            <motion.div
              key="sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={closeSheet}
            >
              <motion.div
                key="sheet-panel"
                ref={sheetRef}
                initial={{ transform: "translateY(100%)" }}
                animate={{ transform: "translateY(0%)" }}
                exit={{ transform: "translateY(100%)" }}
                transition={{ duration: 0.25, ease: EASE_CURVE }}
                className="absolute bottom-0 inset-x-0 bg-white rounded-t-[32px] shadow-glass-xl pb-[calc(1rem+env(safe-area-inset-bottom))] max-h-[80vh] overflow-y-auto will-change-transform"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              <div className="flex items-center justify-between px-6 pb-2">
                <h3 className="font-heading font-bold text-lg text-primary">Menu Lainnya</h3>
                <button
                  onClick={closeSheet}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Tutup menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  {SHEET_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSheet}
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

                  {!session ? (
                    <Link
                      href="/masuk"
                      onClick={closeSheet}
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
                      onClick={() => { closeSheet(); handleLogout().then((r) => (window.location.href = r)); }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-2xl border-t border-border-precision shadow-[0_-4px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-16" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {navTabs.map((tab) => {
            const active = tab.href !== null && isActive(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 min-h-[44px] transition-colors duration-200 ${
                  active ? "text-primary" : "text-on-surface-variant/60 hover:text-on-surface-variant"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                )}
                <Icon className="w-5 h-5" aria-hidden="true" fill={active ? "currentColor" : "none"} />
                <span className={`text-[10px] font-semibold leading-none ${active ? "opacity-100" : "opacity-70"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setSheetOpen(true)}
            className="relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 min-h-[44px] text-on-surface-variant/60 hover:text-on-surface-variant transition-colors duration-200"
            aria-label="Menu lainnya"
          >
            <Grid3x3 className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-semibold leading-none opacity-70">Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
}
