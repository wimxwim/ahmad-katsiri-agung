import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk Pendidik",
  description:
    "Login pendidik AKAL Center.",
  alternates: { canonical: "https://akalcenter.my.id/masuk-guru" },
  robots: { index: false, follow: false },
};

export default function MasukGuruLayout({ children }: { children: React.ReactNode }) {
  return children;
}
