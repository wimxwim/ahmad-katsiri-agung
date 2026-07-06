import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peserta Didik",
  description:
    "Portal peserta didik AKAL Center.",
  alternates: { canonical: "https://akalcenter.my.id/peserta-didik" },
};

export default function PesertaDidikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
