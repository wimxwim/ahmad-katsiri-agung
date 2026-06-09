"use client";

import { useState, useEffect, useCallback } from "react";
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
  const overlayRef = useCallback((node: HTMLDivElement | null) => {
    if (node && isOpen) {
      const links = node.querySelectorAll<HTMLAnchorElement>("a");
      const first = links[0];
      const last = links[links.length - 1];

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };

      node.addEventListener("keydown", handleTab);
      first?.focus();

      return () => node.removeEventListener("keydown", handleTab);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
      <nav className="w-full max-w-5xl bg-glass backdrop-blur-2xl border border-border-precision rounded-full flex items-center justify-between px-6 h-14 shadow-glass">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading font-bold text-primary text-lg tracking-tight"
        >
          <img src="/logo.svg" alt="Logo PAI" className="w-7 h-7 object-contain" />
          <span className="truncate max-w-[100px] md:max-w-none">Aggung Learning</span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden relative w-11 h-11 flex flex-col items-center justify-center -mr-1"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
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
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-0 bg-white/90 backdrop-blur-3xl flex items-center justify-center z-40"
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi utama"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-label="Tutup menu"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
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
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`font-heading text-3xl tracking-tight transition-colors duration-200 ${
                      isActive(item.href)
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
