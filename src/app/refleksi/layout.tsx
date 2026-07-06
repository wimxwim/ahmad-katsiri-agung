import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refleksi Diri",
  description:
    "Refleksi diri pembelajaran Akidah Akhlak.",
  alternates: { canonical: "https://akalcenter.my.id/refleksi" },
};

export default function RefleksiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
