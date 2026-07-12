"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Menu, Button } from "antd";
import type { MenuProps } from "antd";
import { useCmsData } from "@/components/providers/CmsProvider";
import { useSession, useSessionLoading } from "@/components/providers/SessionProvider";
import { handleLogout } from "@/lib/logout";

const NAV_ITEMS_FALLBACK = [
  { href: "/", label: "Beranda" },
  { href: "/kursus", label: "Kursus" },
  { href: "/fitur", label: "Fitur" },
  { href: "/harga", label: "Harga" },
  { href: "/tentang", label: "Tentang" },
  { href: "/quran", label: "Quran" },
];

export function Navbar() {
  const pathname = usePathname();
  const { navigation } = useCmsData();
  const session = useSession();
  const isLoading = useSessionLoading();

  const isAuthPage = pathname.startsWith("/masuk") || pathname.startsWith("/daftar");
  const isDashboard =
    pathname.startsWith("/guru") ||
    pathname.startsWith("/siswa") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin-sekolah") ||
    pathname.startsWith("/orang-tua") ||
    pathname.startsWith("/profil");

  if (isAuthPage) return null;

  const navItems = navigation?.navbarItems ?? NAV_ITEMS_FALLBACK;

  const menuItems: MenuProps["items"] = navItems.map((item) => ({
    key: item.href,
    label: <Link href={item.href}>{item.label}</Link>,
  }));

  const selectedKeys = [pathname === "/" ? "/" : navItems.find((item) => item.href !== "/" && pathname.startsWith(item.href))?.href ?? ""].filter(Boolean);

  const sessionMenuItems: MenuProps["items"] = session
    ? [
        {
          key: "dashboard",
          label: (
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
            >
              Dashboard
            </Link>
          ),
        },
      ]
    : [];

  if (isDashboard) {
    return (
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
        <nav className="w-full max-w-5xl bg-glass backdrop-blur-2xl border border-border-precision rounded-full flex items-center justify-between px-6 h-14 shadow-glass">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-bold text-primary text-lg tracking-tight shrink-0"
          >
            <Image src="/logo.webp" alt="Logo PAI" width={28} height={28} className="object-contain" />
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
          <Image src="/logo.webp" alt="Logo PAI" width={28} height={28} className="object-contain" />
          <span className="hidden sm:inline">AKAL Center</span>
        </Link>

        <div className="flex-1 flex justify-center">
          <div className="hidden md:block">
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys}
              items={menuItems}
              style={{ border: "none", background: "transparent", minWidth: 0 }}
              className="[&_.ant-menu-item]:!px-3 [&_.ant-menu-item]:!rounded-full [&_.ant-menu-item-selected]:!bg-primary/10 [&_.ant-menu-item-selected]:!text-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {session && (
            <>
              <span className="hidden xl:flex px-3 py-2 text-sm text-on-surface-variant/70 font-medium max-w-[120px] truncate">
                Halo, {session.nama?.split(" ")[0]}
              </span>
              <Menu
                mode="horizontal"
                selectedKeys={selectedKeys}
                items={sessionMenuItems}
                style={{ border: "none", background: "transparent", minWidth: 0 }}
                className="[&_.ant-menu-item]:!px-3 [&_.ant-menu-item]:!rounded-full [&_.ant-menu-item-selected]:!bg-primary/10 [&_.ant-menu-item-selected]:!text-primary"
              />
            </>
          )}
          {!session && !isLoading && (
            <div className="flex items-center gap-2">
              <Link href="/masuk">
                <Button size="small" className="rounded-full text-xs sm:text-sm">Masuk</Button>
              </Link>
              <Link href="/daftar">
                <Button type="primary" size="small" className="rounded-full text-xs sm:text-sm">Daftar</Button>
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
