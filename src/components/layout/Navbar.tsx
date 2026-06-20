"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCmsData } from "../providers/CmsProvider";
import { useSession } from "../providers/SessionProvider";

const NAV_ITEMS_FALLBACK = [
  { href: "/", label: "Beranda" },
  { href: "/pendidik", label: "Pendidik" },
  { href: "/materi", label: "Materi" },
  { href: "/evaluasi", label: "Evaluasi" },
  { href: "/game", label: "Game" },
  { href: "/refleksi", label: "Refleksi" },
  { href: "/diskusi", label: "Diskusi" },
  { href: "/tentang", label: "Tentang" },
];

const TEACHER_LABELS = new Set(["Pendidik"]);

export function Navbar() {
  const pathname = usePathname();
  const { navigation } = useCmsData();
  const session = useSession();

  if (pathname.startsWith("/masuk")) return null;

  const navItems = (navigation?.navbarItems ?? NAV_ITEMS_FALLBACK)
    .filter((item) => {
      if (session?.role === "guru") return true;
      return !TEACHER_LABELS.has(item.label);
    });

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
          <span className="truncate md:max-w-none">AKAL Center</span>
        </Link>

        <div className="flex items-center gap-2">
          <ul className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`relative px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
          {session && (
            <LogoutButton role={session.role} />
          )}
        </div>
      </nav>
    </header>
  );
}

function LogoutButton({ role }: { role: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/masuk")) return null;
  return (
    <button
      onClick={async () => {
        const fd = new FormData();
        fd.set("_mode", "logout");
        const res = await fetch("/api/masuk", { method: "POST", body: fd });
        const data = await res.json();
        if (data.redirect) window.location.href = data.redirect;
      }}
      className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-red-500 transition-colors px-2 py-1 cursor-pointer"
      title={`${role === "guru" ? "Guru" : "Murid"} — Keluar`}
    >
      <span>✕</span>
      <span className="hidden sm:inline">Keluar</span>
    </button>
  );
}
