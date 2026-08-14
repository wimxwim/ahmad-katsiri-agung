"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomNavTab {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

interface BottomNavBarProps {
  tabs: BottomNavTab[];
  homeHref: string;
  onLainnyaClick?: () => void;
}

export function BottomNavBar({ tabs, homeHref, onLainnyaClick }: BottomNavBarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "#lainnya") return false;
    if (href === homeHref) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      aria-label="Navigasi bawah"
      className="lg:hidden fixed left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[480px] z-40 flex justify-center pointer-events-none isolate will-change-transform rounded-[28px] sm:rounded-[32px] border border-white/40 shadow-[0_8px_32px_rgba(0,82,49,0.12)]"
      style={{ transform: "translateZ(0)", willChange: "transform", bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className="pointer-events-auto flex items-center bg-white/78 backdrop-blur-[20px] border border-white/40 w-full rounded-[28px] sm:rounded-[32px] overflow-hidden px-1 py-1 gap-1 sm:gap-2 shadow-glass"
        style={{ backdropFilter: "blur(20px)" }}
      >
        {tabs.slice(0, 5).map((tab) => {
          const active = isActive(tab.href);
          if (tab.href === "#lainnya") {
            return (
              <button
                key={tab.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigator.vibrate?.(10);
                  onLainnyaClick?.();
                }}
                className="relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 min-h-11 min-w-11 rounded-tab transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden text-on-surface-variant hover:text-primary"
                aria-label="Menu lainnya"
              >
                <span className="relative z-10">
                  <tab.icon
                    className={cn("w-[18px] sm:w-5 h-[18px] sm:h-5 min-w-[18px] sm:min-w-5 min-h-[18px] sm:min-h-5 transition-all duration-200 text-on-surface-variant")}
                    strokeWidth={2}
                  />
                </span>
                <span className="relative z-10 text-[10px] sm:text-xs font-semibold leading-none transition-colors duration-200 text-on-surface-variant">
                  {tab.label}
                </span>
              </button>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              onClick={() => navigator.vibrate?.(10)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 min-h-11 min-w-11 rounded-tab transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden",
                tab.primary && !active && "text-primary",
              )}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className={cn(
                    "absolute inset-1 rounded-tab",
                    tab.primary ? "bg-primary" : "bg-primary/10",
                  )}
                />
              )}
              <span className="relative z-10">
                <tab.icon
                  className={cn(
                    "w-[18px] sm:w-5 h-[18px] sm:h-5 min-w-[18px] sm:min-w-5 min-h-[18px] sm:min-h-5 transition-all duration-200",
                    active
                      ? tab.primary
                        ? "text-on-primary"
                        : "text-primary"
                      : "text-on-surface-variant",
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
              </span>
              <span
                className={cn(
                  "relative z-10 text-[10px] sm:text-xs font-semibold leading-none transition-colors duration-200",
                  active
                    ? tab.primary
                      ? "text-on-primary"
                      : "text-primary"
                    : "text-on-surface-variant",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
