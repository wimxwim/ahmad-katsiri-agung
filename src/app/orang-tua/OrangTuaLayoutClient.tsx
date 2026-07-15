"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  Heart,
  BarChart3,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { handleLogout } from "@/lib/logout";

const SIDEBAR_ITEMS = [
  { href: "/orang-tua", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/orang-tua/anak", label: "Anak", icon: BookOpen, soon: true },
  { href: "/orang-tua/progres", label: "Progres", icon: BarChart3, soon: true },
];

export function OrangTuaLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [_nama, setNama] = useState("Orang Tua");

  const pageTitle = useMemo(() => {
    const active = SIDEBAR_ITEMS.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/orang-tua" && pathname.startsWith(item.href)),
    );
    if (active) return active.label;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 2) {
      const parentPath = "/" + segments.slice(0, 2).join("/");
      const parent = SIDEBAR_ITEMS.find(
        (item) =>
          parentPath === item.href ||
          (item.href !== "/orang-tua" && parentPath.startsWith(item.href)),
      );
      if (parent) return parent.label;
    }
    return "Menu";
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/v1/account/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!mounted) return;
        if (j?.data?.nama) setNama(j.data.nama);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-surface flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border-precision flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border-precision">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold text-sm text-on-surface truncate">AKAL Center</p>
            <p className="text-xs text-on-surface-variant/70">Ruang Orang Tua</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1 text-on-surface-variant hover:text-on-surface"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/orang-tua" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface hover:text-on-surface",
                  item.soon && "opacity-60",
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
                {item.soon && (
                  <span className="text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">
                    SEGERA
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border-precision space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-surface transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Situs
          </Link>
          <button
            onClick={() => {
              handleLogout().then((redirect) => router.push(redirect));
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20">
          <div
            className="lg:hidden bg-primary text-white text-center leading-tight"
            style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.25rem)", paddingBottom: "0.25rem" }}
          >
            <span className="text-[10px] font-medium tracking-wide">AKAL Center</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-xl border-b border-border-precision">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden flex items-center justify-center w-11 h-11 -ml-1 text-on-surface-variant hover:text-on-surface cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden rounded-lg transition-colors duration-200"
              aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="flex-1 min-w-0 text-center px-2">
              <span className="text-sm font-medium text-on-surface truncate block">
                {pageTitle}
              </span>
            </div>

            <Link
              href="/orang-tua/profil"
              className="flex items-center justify-center w-11 h-11 lg:w-auto lg:h-auto shrink-0 hover:text-primary transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden rounded-lg"
              aria-label="Profil"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-primary" />
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_CURVE }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
