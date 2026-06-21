import type { Metadata } from "next";

export const metadata: Metadata = { title: "Peserta Didik" };

export default function PesertaDidikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
