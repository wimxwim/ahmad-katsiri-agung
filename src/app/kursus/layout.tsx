import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Katalog Kursus — AKAL Center",
  },
  alternates: {
    canonical: "https://akalcenter.my.id/kursus",
  },
  description: "Jelajahi kursus PAI dan Akidah Akhlak dari guru-guru terpercaya di AKAL Center.",
};

export default function KursusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}