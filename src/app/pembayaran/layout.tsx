import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Pembayaran — AKAL Center",
  },
  alternates: {
    canonical: "https://akalcenter.my.id/pembayaran",
  },
  description: "Lakukan pembayaran untuk akses fitur premium AKAL Center via QRIS atau transfer bank.",
};

export default function PembayaranLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}