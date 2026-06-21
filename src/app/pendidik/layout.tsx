import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pendidik" };

export default function PendidikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
