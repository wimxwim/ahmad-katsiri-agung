import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingClient } from "./_components/LandingClient";

export const metadata: Metadata = {
  title: {
    absolute: "AKAL Center — Platform Guru-Siswa dengan AI",
  },
  alternates: {
    canonical: "https://akalcenter.my.id",
  },
  description:
    "Platform guru-siswa yang mengubah dokumen jadi pembelajaran siap pakai. Upload PDF/DOCX, AI buatkan draft materi, quiz, dan soal. Multi-guru, satu dashboard.",
  openGraph: {
    title: "AKAL Center — Platform Guru-Siswa dengan AI",
    description:
      "Upload dokumen, AI buatkan draft materi, quiz, dan soal. Multi-guru, satu dashboard.",
    url: "https://akalcenter.my.id",
    siteName: "AKAL Center",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <Suspense>
      <LandingClient />
    </Suspense>
  );
}