import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Harga — AKAL Center",
  },
  alternates: {
    canonical: "https://akalcenter.my.id/harga",
  },
  description: "Guru gratis selamanya. Sekolah dan yayasan bisa berlangganan. Lihat paket harga AKAL Center.",
};

export default function HargaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}