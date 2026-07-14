"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useCmsData } from "@/components/providers/CmsProvider";
import { useSession, useSessionLoading } from "@/components/providers/SessionProvider";
import { handleLogout } from "@/lib/logout";
import { cn } from "@/lib/utils";

const NAV_ITEMS_FALLBACK = [
  { href: "/", label: "Beranda" },
  { href: "/kursus", label: "Kursus" },
  { href: "/fitur", label: "Fitur" },
  { href: "/harga", label: "Harga" },
  { href: "/tentang", label: "Tentang" },
  { href: "/quran", label: "Quran" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const { navigation } = useCmsData();
  const session = useSession();
  const isLoading = useSessionLoading();

  const isAuthPage = pathname.startsWith("/masuk") || pathname.startsWith("/daftar");
  const isDashboard =
    pathname.startsWith("/guru") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin-sekolah") ||
    pathname.startsWith("/profil");

  const hasOwnHeader = pathname.startsWith("/siswa") || pathname.startsWith("/orang-tua");
  if (hasOwnHeader) return null;

  if (isAuthPage) return null;

  const navItems = navigation?.navbarItems ?? NAV_ITEMS_FALLBACK;

  const dashboardHref =
    session?.role === "guru"
      ? "/guru/beranda"
      : session?.role === "owner"
      ? "/owner"
      : session?.role === "admin_sekolah"
      ? "/admin-sekolah"
      : session?.role === "orang_tua"
      ? "/orang-tua"
      : "/siswa/beranda";

  if (isDashboard) {
    return (
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
        <nav className="w-full max-w-5xl bg-glass backdrop-blur-2xl border border-border-precision rounded-full flex items-center justify-between px-6 h-14 shadow-glass">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-bold text-primary text-lg tracking-tight shrink-0"
          >
            <Image src="/logo.webp" alt="AKAL Center" width={28} height={28} className="object-contain" />
            <span className="truncate">AKAL Center</span>
          </Link>
          <div className="flex items-center gap-3">
            {session && (
              <span className="text-sm text-on-surface-variant font-medium max-w-[160px] truncate">
                {session.nama?.split(" ")[0]}
              </span>
            )}
            {session && <LogoutButton role={session.role} />}
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
      <nav className="w-full max-w-5xl bg-glass backdrop-blur-2xl border border-border-precision rounded-full flex items-center px-6 h-14 shadow-glass">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading font-bold text-primary text-lg tracking-tight shrink-0"
        >
          <Image src="/logo.webp" alt="AKAL Center" width={28} height={28} className="object-contain" />
          <span className="hidden sm:inline">AKAL Center</span>
        </Link>

        {/* Desktop nav links */}
        <div className="flex-1 flex justify-center">
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200",
                  isActive(pathname, item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-primary/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {session && (
            <>
              <span className="hidden xl:flex px-3 py-2 text-sm text-on-surface-variant/70 font-medium max-w-[120px] truncate">
                Halo, {session.nama?.split(" ")[0]}
              </span>
              <Link
                href={dashboardHref}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
              >
                Dashboard
              </Link>
            </>
          )}
          {!session && !isLoading && (
            <div className="flex items-center gap-2">
              <Link
                href="/masuk"
                className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-border-precision text-on-surface-variant hover:text-on-surface hover:border-primary/30 transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-primary text-white hover:brightness-110 transition-all"
              >
                Daftar
              </Link>
            </div>
          )}
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
      aria-label="Keluar"
    >
      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Keluar</span>
    </button>
  );
}