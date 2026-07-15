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
}

export function BottomNavBar({ tabs, homeHref }: BottomNavBarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === homeHref) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="pointer-events-auto flex items-center bg-white/70 backdrop-blur-xl border-t border-border-precision w-full px-1 py-1">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-12 rounded-tab transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden",
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
                    "w-5 h-5 transition-all duration-200",
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
                  "relative z-10 text-[10px] font-semibold leading-none transition-colors duration-200",
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