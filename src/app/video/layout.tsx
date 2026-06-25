import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video",
  description:
    "Video pembelajaran Akidah Akhlak untuk siswa SMP.",
  alternates: { canonical: "https://akalcenter.my.id/video" },
};

export default function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
