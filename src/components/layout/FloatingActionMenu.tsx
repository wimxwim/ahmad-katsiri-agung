"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import {
  Plus,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Library,
  BarChart3,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { handleLogout } from "@/lib/logout";

interface FabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const FAB_ITEMS: FabItem[] = [
  { href: "/siswa/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/siswa/materi", label: "Materi", icon: BookOpen },
  { href: "/siswa/kursus", label: "Kursus", icon: Library },
  { href: "/siswa/quiz", label: "Kuis", icon: Sparkles },
  { href: "/siswa/progres", label: "Progres", icon: BarChart3 },
  { href: "#logout", label: "Keluar", icon: LogOut },
];

export function FloatingActionMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={ref} className="fixed left-4 bottom-24 z-50 flex flex-col items-start gap-2">
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.92 }}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden ${
          open
            ? "bg-on-surface text-white border-on-surface rotate-45 shadow-on-surface/25"
            : "bg-primary text-white border-primary shadow-primary/25 hover:shadow-primary/40 hover:brightness-110"
        }`}
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3, ease: EASE_CURVE }}
            className="flex flex-col gap-2"
          >
            {FAB_ITEMS.map((item, i) => {
              const active = item.href === "#logout" ? false : (pathname === item.href || (item.href !== "/siswa/beranda" && pathname.startsWith(item.href)));
              const Icon = item.icon;
              const isLogout = item.href === "#logout";

              const sharedClassName = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-xl border transition-all duration-200 cursor-pointer min-w-[140px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden ${
                active
                  ? "bg-primary text-white border-primary shadow-primary/25"
                  : "bg-white/90 text-on-surface border-border-precision hover:bg-white hover:border-primary/30 hover:shadow-xl"
              }`;

              return (
                <motion.div
                  key={item.href}
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: i * 0.04, ease: EASE_CURVE }}
                >
                  {isLogout ? (
                    <button
                      onClick={async () => {
                        setOpen(false);
                        const redirect = await handleLogout();
                        router.push(redirect);
                      }}
                      className={sharedClassName}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={sharedClassName}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
