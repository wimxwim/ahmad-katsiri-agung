import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Fitur — AKAL Center",
  },
  alternates: {
    canonical: "https://akalcenter.my.id/fitur",
  },
  description: "AI Document Generator, upload materi, quiz otomatis, dan analitik pembelajaran — semua fitur AKAL Center untuk guru dan siswa.",
};

export default function FiturLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}