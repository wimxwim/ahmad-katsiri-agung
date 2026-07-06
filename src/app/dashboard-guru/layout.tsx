"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  PlusCircle,
  ChevronLeft,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";

const SIDEBAR_ITEMS = [
  { href: "/dashboard-guru", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard-guru/kursus", label: "Kursus Saya", icon: BookOpen },
  { href: "/dashboard-guru/nilai", label: "Nilai", icon: BarChart3 },
  { href: "/dashboard-guru/siswa", label: "Siswa", icon: Users },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <p className="font-heading font-bold text-sm text-on-surface truncate">
              AKAL Center
            </p>
            <p className="text-xs text-on-surface-variant/60">Dashboard Guru</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1 text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard-guru" && pathname.startsWith(item.href));
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
            href="/dashboard-guru/buat"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            Buat Kursus Baru
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-surface transition-colors"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
            Kembali ke Situs
          </Link>
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
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary font-heading">AK</span>
            </div>
            <span className="hidden sm:inline">Ahmad Katsiri Agung</span>
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
