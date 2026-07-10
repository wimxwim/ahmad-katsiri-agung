import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitur | AKAL Center",
  description: "AI Document Generator, upload materi, quiz otomatis, dan analitik pembelajaran — semua fitur AKAL Center untuk guru dan siswa.",
};

export default function FiturLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}