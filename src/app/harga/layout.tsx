import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harga | AKAL Center",
  description: "Guru gratis selamanya. Sekolah dan yayasan bisa berlangganan. Lihat paket harga AKAL Center.",
};

export default function HargaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}