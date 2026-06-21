import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hafalan Dalil" };

export default function HafalanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
