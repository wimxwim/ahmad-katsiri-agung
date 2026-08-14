import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda — Ruang Guru",
  robots: { index: false, follow: false },
};

export default function BerandaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
