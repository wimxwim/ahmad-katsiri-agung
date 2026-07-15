"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Menu,
  X,
  GraduationCap,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { handleLogout } from "@/lib/logout";
import { useSession } from "@/components/providers/SessionProvider";

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  subtitle: string;
  defaultNama: string;
  homeHref: string;
}

export function DashboardLayoutClient({
  children,
  sidebarItems,
  subtitle,
  defaultNama,
  homeHref,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = useSession();
  const nama = session?.nama || defaultNama;

  return (
    <div className="min-h-dvh bg-surface flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-border-precision flex flex-col transition-transform duration-300",
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
            <p className="text-xs text-on-surface-variant/70">{subtitle}</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1 text-on-surface-variant hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== homeHref && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors relative min-h-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden",
                  active && !item.primary
                    ? "bg-primary/10 text-primary"
                    : item.primary
                    ? "bg-primary text-on-primary hover:brightness-110"
                    : "text-on-surface-variant hover:bg-surface hover:text-on-surface",
                )}
              >
                {active && !item.primary && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary" />
                )}
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border-precision space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-on-surface-variant hover:bg-surface transition-colors min-h-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
          >
            <ChevronLeft className="w-4 h-4" />
            Ke Halaman Utama
          </Link>
          <button
            onClick={() => {
              handleLogout().then((redirect) => router.push(redirect));
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left cursor-pointer min-h-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="fixed top-0 left-0 z-50 lg:hidden flex items-center justify-center w-11 h-11 pt-[env(safe-area-inset-top,0px)] pl-3 text-on-surface-variant hover:text-on-surface cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden transition-colors duration-200"
        aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
      >
        {sidebarOpen ? (
          <X className="w-5 h-5" strokeWidth={1.5} />
        ) : (
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        )}
      </button>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-border-precision flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3"
          style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.5rem)" }}
        >
          <Link
            href={homeHref}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-1.5 min-w-0 ml-11 sm:ml-0 hover:text-primary transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden rounded-lg"
            aria-label="Beranda"
          >
            <span className="font-heading font-bold text-sm text-on-surface truncate">AKAL Center</span>
          </Link>

          <Link
            href="/profil"
            className="flex items-center gap-2 shrink-0 hover:text-primary transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden rounded-lg"
            aria-label="Profil"
          >
            <span className="hidden sm:inline text-sm text-on-surface truncate max-w-[120px]">{nama}</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary font-heading">
                {nama?.charAt(0)?.toUpperCase() || "S"}
              </span>
            </div>
          </Link>
        </header>

        <main className="flex-1 p-3 sm:p-5 lg:p-8">
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