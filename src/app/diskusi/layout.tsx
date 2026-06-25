import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diskusi",
  description:
    "Forum diskusi Akidah Akhlak untuk siswa dan guru.",
  alternates: { canonical: "https://akalcenter.my.id/diskusi" },
};

export default function DiskusiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
