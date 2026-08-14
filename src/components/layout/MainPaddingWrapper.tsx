"use client";

import { usePathname } from "next/navigation";

const DASHBOARD_PREFIXES = ["/siswa", "/guru", "/owner", "/admin-sekolah", "/orang-tua"];

export function MainPaddingWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));

  if (isDashboard) {
    return <main id="main" tabIndex={-1} className="flex-1 overflow-x-hidden">{children}</main>;
  }

  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex-1 pt-24 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 overflow-x-hidden"
    >
      {children}
    </main>
  );
}
