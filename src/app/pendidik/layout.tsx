import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pendidik",
  description:
    "Portal pendidik — perangkat ajar dan rekap nilai.",
  alternates: { canonical: "https://akalcenter.my.id/pendidik" },
};

export default function PendidikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
