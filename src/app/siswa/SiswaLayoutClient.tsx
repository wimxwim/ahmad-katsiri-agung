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
  GraduationCap,
  Sparkles,
  BarChart3,
  Megaphone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { handleLogout } from "@/lib/logout";

const SIDEBAR_ITEMS = [
  { href: "/siswa/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/siswa/materi", label: "Materi", icon: BookOpen },
  { href: "/siswa/quiz", label: "Kuis", icon: Sparkles },
  { href: "/siswa/cbt", label: "CBT", icon: GraduationCap },
  { href: "/siswa/progres", label: "Progres", icon: BarChart3 },
  { href: "/siswa/pengumuman", label: "Pengumuman", icon: Megaphone },
];

export function SiswaLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nama, setNama] = useState("Siswa");

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
    <div className="min-h-screen bg-surface flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border-precision flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border-precision">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold text-sm text-on-surface truncate">AKAL Center</p>
            <p className="text-xs text-on-surface-variant/60">Ruang Siswa</p>
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
            const active = pathname === item.href || (item.href !== "/siswa/beranda" && pathname.startsWith(item.href));
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
                )}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border-precision space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-surface transition-colors"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
            Kembali ke Situs
          </Link>
          <button
            onClick={() => {
              handleLogout().then((redirect) => router.push(redirect));
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
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
        <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-border-precision flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-on-surface"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Link href="/profil" className="flex items-center gap-2 hover:text-primary transition-colors" aria-label="Profil">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary font-heading">
                  {nama.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:inline">{nama}</span>
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
