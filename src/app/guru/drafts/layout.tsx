import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Draft AI — Ruang Guru",
  robots: { index: false, follow: false },
};

export default function DraftsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
