import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Tentang AKAL Center dan pendiri.",
  alternates: { canonical: "https://akalcenter.my.id/tentang" },
};

export default function TentangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
