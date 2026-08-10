import { KursusListClient } from "./KursusListClient";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://akalcenter.my.id";

export default async function KatalogKursusPage() {
  let kursusList = [];
  let error: string | null = null;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/kursus`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Failed");
    const { data } = await res.json();
    kursusList = data || [];
  } catch (err) {
    error = "Gagal memuat data";
  }

  return <KursusListClient initialKursus={kursusList} initialError={error} />;
}
