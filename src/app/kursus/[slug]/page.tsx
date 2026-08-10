import { KursusDetailClient } from "./KursusDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://akalcenter.my.id";

interface KursusData {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  isPublic: boolean;
  harga: number;
  createdAt: string;
}

export default async function KursusDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let kursus: KursusData | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/kursus?slug=${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Failed");
    const { data } = await res.json();
    kursus = data?.[0] || null;
  } catch (err) {
    error = "Gagal memuat data";
  }

  return <KursusDetailClient slug={slug} initialKursus={kursus} initialError={error} />;
}
