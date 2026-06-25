import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Al-Qur'an",
  description: "Baca dan dengarkan Al-Qur'an online.",
  alternates: { canonical: "https://akalcenter.my.id/quran" },
};

export default function QuranLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
