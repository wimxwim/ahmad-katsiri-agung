"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { handleLogout } from "@/lib/logout";
import { useSession } from "@/components/providers/SessionProvider";
import { BottomNavBar, type BottomNavTab } from "@/components/layout/BottomNavBar";
import { InstallPWAButton } from "@/components/layout/InstallPWAButton";

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
  soon?: boolean;
  badge?: React.ReactNode;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  sidebarSections?: SidebarSection[];
  subtitle: string;
  defaultNama: string;
  homeHref: string;
  profileHref: string;
  brandIcon?: LucideIcon;
  avatarIcon?: LucideIcon;
  status?: string | null;
  bottomTabs?: BottomNavTab[];
  onLainnyaClick?: () => void;
}

export function DashboardLayoutClient({
  children,
  sidebarItems,
  sidebarSections,
  subtitle,
  defaultNama,
  homeHref,
  profileHref,
  brandIcon: BrandIcon = GraduationCap,
  avatarIcon: AvatarIcon,
  status,
  bottomTabs,
  onLainnyaClick,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const session = useSession();
  const nama = session?.nama || defaultNama;

  const allItems = useMemo(() => {
    if (sidebarSections) return sidebarSections.flatMap((s) => s.items);
    return sidebarItems;
  }, [sidebarItems, sidebarSections]);

  const pageTitle = useMemo(() => {
    const active = allItems.find(
      (item) =>
        pathname === item.href ||
        (item.href !== homeHref && pathname.startsWith(item.href)),
    );
    if (active) return active.label;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 2) {
      const parentPath = "/" + segments.slice(0, 2).join("/");
      const parent = allItems.find(
        (item) =>
          parentPath === item.href ||
          (item.href !== homeHref && parentPath.startsWith(item.href)),
      );
      if (parent) return parent.label;
    }
    return "Menu";
  }, [pathname, allItems, homeHref]);

  const avatarInitial = nama?.charAt(0)?.toUpperCase() || "S";

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 4);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  return (
    <div className="min-h-dvh bg-surface flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border-precision flex flex-col transition-transform duration-300",
          "rounded-r-[32px] lg:rounded-r-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border-precision">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BrandIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold text-sm text-on-surface truncate">AKAL Center</p>
            <p className="text-xs text-on-surface-variant/70">{subtitle}</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto min-w-11 min-h-11 w-11 h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarSections ? (
            sidebarSections.map((section, idx) => (
              <div key={section.label} className={cn(idx > 0 && "border-t border-border-precision/60 pt-3 mt-3")}>
                <p className="text-[10px] font-bold tracking-badge text-on-surface-variant/60 px-3 mt-4 mb-1 first:mt-0">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== homeHref && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors relative min-h-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden",
                          item.soon && "opacity-60",
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
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge}
                        {item.soon && (
                          <span className="text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full shrink-0">
                            SEGERA
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            sidebarItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== homeHref && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors relative min-h-11 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden",
                    item.soon && "opacity-60",
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
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge}
                  {item.soon && (
                    <span className="text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full shrink-0">
                      SEGERA
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </nav>

        <div className="px-3 py-4 border-t border-border-precision space-y-2">
          <InstallPWAButton className="w-full justify-center" />
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
          role="button"
          tabIndex={0}
          aria-label="Tutup menu"
          className="fixed inset-0 z-40 bg-on-surface/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSidebarOpen(false);
            }
          }}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 guru-header-gpu">
          <div
            className="lg:hidden bg-primary text-white text-center leading-tight"
            style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.25rem)", paddingBottom: "0.25rem" }}
          >
            <span className="text-xs font-medium tracking-wide inline-flex items-center gap-1.5">
              AKAL Center
              {status && (
                <span className="opacity-70">· {status}</span>
              )}
            </span>
          </div>

          <div
            className={cn(
              "flex items-center justify-between px-3 py-2 bg-glass backdrop-blur-2xl border-b transition-shadow duration-300",
              isScrolled
                ? "border-border-precision shadow-glass-xl"
                : "border-border-precision shadow-glass",
            )}
          >
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden flex items-center justify-center w-11 h-11 min-w-11 min-h-11 -ml-1 text-on-surface-variant hover:text-on-surface cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden rounded-lg transition-colors duration-200"
              aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>

            <div className="flex-1 min-w-0 text-center px-2">
              <span className="text-sm font-medium text-on-surface truncate block">
                {pageTitle}
              </span>
            </div>

            <Link
              href={profileHref}
              className="flex items-center justify-center w-11 h-11 min-w-11 min-h-11 lg:w-auto lg:h-auto shrink-0 hover:text-primary transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden rounded-lg"
              aria-label="Profil"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {AvatarIcon ? (
                  <AvatarIcon className="w-4 h-4 text-primary" />
                ) : (
                  <span className="text-[11px] font-bold text-primary font-heading">
                    {avatarInitial}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className={cn(
            "flex-1 p-3 sm:p-5 lg:p-8",
            bottomTabs && "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]",
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_CURVE }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {bottomTabs && bottomTabs.length > 0 && (
        <BottomNavBar tabs={bottomTabs} homeHref={homeHref} onLainnyaClick={onLainnyaClick} />
      )}
      {/* F4-1: FAB Buat Kursus center-docked - fixed right bottom above BottomNav, hidden lg */}
      <Link
        href="/guru/buat"
        aria-label="Buat Kursus"
        className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-40 w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glass-lg lg:hidden hover:brightness-110 active:scale-[0.98] transition-all"
      >
        <PlusCircle className="w-6 h-6" />
      </Link>
    </div>
  );
}
