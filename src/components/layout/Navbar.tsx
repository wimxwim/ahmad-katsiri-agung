"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/pendidik", label: "Pendidik" },
  { href: "/materi", label: "Materi" },
  { href: "/game", label: "Game" },
  { href: "/tentang", label: "Tentang" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
      <nav className="w-full max-w-5xl bg-glass backdrop-blur-2xl border border-border-precision rounded-full flex items-center justify-between px-6 h-14 shadow-glass">
        <Link
          href="/"
          className="font-heading font-bold text-primary text-lg tracking-tight"
        >
          Aggung Learning
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] as const }}
            className="w-5 h-[2px] bg-on-surface rounded-full block absolute"
          />
          <motion.span
            animate={isOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="w-5 h-[2px] bg-on-surface rounded-full block absolute"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] as const }}
            className="w-5 h-[2px] bg-on-surface rounded-full block absolute"
          />
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-0 bg-white/90 backdrop-blur-3xl flex items-center justify-center z-40"
            onClick={() => setIsOpen(false)}
          >
            <ul className="flex flex-col items-center gap-8">
              {NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.4,
                    ease: [0.32, 0.72, 0, 1] as const,
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`font-heading text-3xl tracking-tight transition-colors duration-200 ${
                      pathname === item.href
                        ? "text-primary"
                        : "text-on-surface hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
