import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impor Soal",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://akalcenter.my.id/admin/bulk-soal" },
};

export default function BulkSoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
