import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analisis Dalil",
  description:
    "Analisis dalil QS Al-Isra:34 tentang larangan berbuat kerusakan.",
  alternates: { canonical: "https://akalcenter.my.id/dalil/al-isra-34" },
};

export default function AnalisisDalilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
