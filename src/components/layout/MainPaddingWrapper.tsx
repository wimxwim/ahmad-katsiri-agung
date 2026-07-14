"use client";

import { usePathname } from "next/navigation";

const DASHBOARD_PREFIXES = ["/siswa", "/guru", "/owner", "/admin-sekolah", "/orang-tua"];

export function MainPaddingWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <main
      id="main"
      className={
        isDashboard
          ? "flex-1 overflow-x-hidden"
          : "flex-1 pt-24 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 overflow-x-hidden"
      }
    >
      {children}
    </main>
  );
}