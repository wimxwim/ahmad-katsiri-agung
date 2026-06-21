import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kuis" };

export default function EvaluasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
