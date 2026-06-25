import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hafalan Dalil",
  description:
    "Hafalan dalil dan hadits untuk siswa SMP.",
  alternates: { canonical: "https://akalcenter.my.id/hafalan" },
};

export default function HafalanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
