import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analisis Dalil" };

export default function AnalisisDalilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
