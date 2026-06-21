import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tentang" };

export default function TentangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
