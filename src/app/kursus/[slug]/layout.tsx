import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Kursus | AKAL Center",
  description: "Lihat detail kursus, materi, dan informasi guru di AKAL Center.",
};

export default function KursusDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}