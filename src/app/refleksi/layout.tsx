import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refleksi Diri" };

export default function RefleksiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
