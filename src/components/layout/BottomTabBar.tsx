"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  ClipboardList,
  Gamepad2,
  Info,
  Brain,
  MessageSquare,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useCmsData } from "../providers/CmsProvider";
import { useSession } from "../providers/SessionProvider";

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  BookOpen,
  ClipboardList,
  Gamepad2,
  Info,
  Brain,
  MessageSquare,
};

const TABS_FALLBACK = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/materi", label: "Materi", icon: BookOpen },
  { href: "/evaluasi", label: "Kuis", icon: ClipboardList },
  { href: "/refleksi", label: "Refleksi", icon: Brain },
  { href: "/diskusi", label: "Diskusi", icon: MessageSquare },
  { href: "/game", label: "Game", icon: Gamepad2 },
  { href: "/tentang", label: "Tentang", icon: Info },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { navigation } = useCmsData();
  const session = useSession();

  if (pathname.startsWith("/masuk")) return null;

  const cmsTabs = navigation?.bottomTabs;
  const tabs = cmsTabs
    ? cmsTabs.map((t) => ({
        href: t.href,
        label: t.label,
        icon: ICON_MAP[t.icon] ?? Home,
      }))
    : TABS_FALLBACK;

  const displayedTabs = [...tabs];
  if (!session) {
    displayedTabs.push({ href: "/masuk", label: "Masuk", icon: LogOut });
  }
  if (session?.role === "guru") {
    displayedTabs.push({ href: "/pendidik", label: "Pendidik", icon: ClipboardList });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const fd = new FormData();
    fd.set("_mode", "logout");
    const res = await fetch("/api/masuk", { method: "POST", body: fd });
    const data = await res.json();
    if (data.redirect) window.location.href = data.redirect;
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-border-precision shadow-[0_-4px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {displayedTabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 min-h-[44px] h-full transition-colors duration-200 ${
                active
                  ? "text-primary"
                  : "text-on-surface-variant/60 hover:text-on-surface-variant"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
              )}
              <Icon
                className="w-5 h-5"
                aria-hidden="true"
                fill={active ? "currentColor" : "none"}
              />
              <span className={`text-[10px] font-semibold leading-none ${
                active ? "opacity-100" : "opacity-70"
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
        {session && (
          <button
            onClick={handleLogout}
            className="relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 min-h-[44px] h-full text-on-surface-variant/60 hover:text-red-500 transition-colors duration-200"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-semibold leading-none opacity-70">
              Keluar
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
