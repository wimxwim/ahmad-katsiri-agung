"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useCmsData } from "@/components/providers/CmsProvider";
import { useSession, useSessionLoading } from "@/components/providers/SessionProvider";
import { handleLogout } from "@/lib/logout";

const NAV_ITEMS_FALLBACK = [
  { href: "/", label: "Beranda" },
  { href: "/kursus", label: "Kursus" },
  { href: "/fitur", label: "Fitur" },
  { href: "/harga", label: "Harga" },
  { href: "/tentang", label: "Tentang" },
];

export function Navbar() {
  const pathname = usePathname();
  const { navigation } = useCmsData();
  const session = useSession();
  const isLoading = useSessionLoading();

  if (
    pathname.startsWith("/masuk") ||
    pathname.startsWith("/guru") ||
    pathname.startsWith("/siswa") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin-sekolah") ||
    pathname.startsWith("/orang-tua")
  )
    return null;

  const navItems = navigation?.navbarItems ?? NAV_ITEMS_FALLBACK;

  const visibleItems = navItems.slice(0, 5);
  const [moreOpen, setMoreOpen] = useState(false);
  const hasMore = navItems.length > 5;

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
          <Image src="/logo.webp" alt="Logo PAI" width={28} height={28} className="object-contain" />
          <span className="truncate md:max-w-none">AKAL Center</span>
        </Link>

        <div className="flex items-center gap-2">
          <ul className="hidden md:flex items-center gap-1">
            {visibleItems.map((item) => (
              <li key={item.href}>
<Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`relative px-4 py-2.5 text-sm rounded-full transition-colors duration-200 min-h-[44px] flex items-center ${
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
            {hasMore && (
              <li className="relative">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="relative px-4 py-2 text-sm rounded-full transition-colors duration-200 text-on-surface-variant hover:text-primary hover:bg-primary/5 flex items-center gap-1 cursor-pointer"
                >
                  Lainnya...
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
                </button>
                {moreOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-2 shadow-glass-lg min-w-[180px] z-50">
                    {navItems.slice(5).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`block px-4 py-2.5 rounded-xl text-sm transition-colors duration-200 ${
                          isActive(item.href)
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            )}
            {session && (
              <>
                <li className="hidden xl:flex">
                  <span className="px-3 py-2 text-sm text-on-surface-variant/70 font-medium max-w-[120px] truncate">
                    Halo, {session.nama?.split(" ")[0]}
                  </span>
                </li>
                <li>
                  <Link
                    href={
                      session.role === "guru"
                        ? "/guru/beranda"
                        : session.role === "owner"
                        ? "/owner"
                        : session.role === "admin_sekolah"
                        ? "/admin-sekolah"
                        : session.role === "orang_tua"
                        ? "/orang-tua"
                        : "/siswa/beranda"
                    }
                    className={`relative px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                      isActive(
                        session.role === "guru"
                          ? "/guru/beranda"
                          : session.role === "owner"
                          ? "/owner"
                          : session.role === "admin_sekolah"
                          ? "/admin-sekolah"
                          : session.role === "orang_tua"
                          ? "/orang-tua"
                          : "/siswa/beranda",
                      )
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
              </>
            )}
            {!session && !isLoading && (
              <>
                <li>
                  <Link
                    href="/masuk"
                    className="relative px-5 py-2.5 text-sm rounded-full border border-border-precision text-on-surface-variant font-medium hover:text-primary hover:border-primary/30 transition-all duration-200 min-h-[44px] flex items-center"
                  >
                    Masuk
                  </Link>
                </li>
                <li>
                  <Link
                    href="/daftar"
                    className="relative px-5 py-2.5 text-sm rounded-full bg-primary text-on-primary font-semibold hover:brightness-110 transition-all duration-200 min-h-[44px] flex items-center"
                  >
                    Daftar Gratis
                  </Link>
                </li>
              </>
            )}
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
      onClick={() => handleLogout().then((r) => (window.location.href = r))}
      className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-red-500 transition-colors px-2 py-1 cursor-pointer"
      title={`${role === "guru" ? "Guru" : "Siswa"} — Keluar`}
    >
      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Keluar</span>
    </button>
  );
}
