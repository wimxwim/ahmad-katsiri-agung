import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Kursus | AKAL Center",
  description: "Jelajahi kursus PAI dan Akidah Akhlak dari guru-guru terpercaya di AKAL Center.",
};

export default function KursusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}