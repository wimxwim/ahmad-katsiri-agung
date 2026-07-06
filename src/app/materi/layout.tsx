import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materi",
  description:
    "Daftar materi Akidah Akhlak untuk SMP Kelas 7-9 berdasarkan Kurikulum Merdeka.",
  alternates: { canonical: "https://akalcenter.my.id/materi" },
};

export default function MateriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
