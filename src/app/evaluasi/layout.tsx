import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kuis",
  description:
    "Kuis interaktif Akidah Akhlak untuk siswa SMP Kelas 7-9.",
  alternates: { canonical: "https://akalcenter.my.id/evaluasi" },
};

export default function EvaluasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
