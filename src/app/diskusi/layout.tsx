import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diskusi",
};

export default function DiskusiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
