"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ClipboardList, Gamepad2, Info } from "lucide-react";

const TABS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/materi", label: "Materi", icon: BookOpen },
  { href: "/evaluasi", label: "Kuis", icon: ClipboardList },
  { href: "/game", label: "Game", icon: Gamepad2 },
  { href: "/tentang", label: "Tentang", icon: Info },
];

export function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-border-precision shadow-[0_-4px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-colors duration-200 ${
                active
                  ? "text-primary"
                  : "text-on-surface-variant/60 hover:text-on-surface-variant"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${active ? "" : ""}`}
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
      </div>
    </nav>
  );
}
