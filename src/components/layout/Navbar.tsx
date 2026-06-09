"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/pendidik", label: "Pendidik" },
  { href: "/materi", label: "Materi" },
  { href: "/evaluasi", label: "Evaluasi" },
  { href: "/game", label: "Game" },
  { href: "/tentang", label: "Tentang" },
];

export function Navbar() {
  const pathname = usePathname();

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
      </nav>
    </header>
  );
}
