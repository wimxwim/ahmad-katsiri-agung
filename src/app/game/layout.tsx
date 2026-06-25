import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game",
  description:
    "Game edukasi interaktif Akidah Akhlak untuk siswa SMP.",
  alternates: { canonical: "https://akalcenter.my.id/game" },
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
