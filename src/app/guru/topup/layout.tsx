import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topup — Ruang Guru",
  robots: { index: false, follow: false },
};

export default function TopupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
