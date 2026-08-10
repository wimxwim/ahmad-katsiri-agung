import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://akalcenter.my.id";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/kursus?slug=${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Failed");
    const { data } = await res.json();
    const course = data?.[0];
    if (!course) throw new Error("Not found");
    return {
      title: { absolute: `${course.judul} — AKAL Center` },
      description: course.deskripsi || `Kursus ${course.judul} di AKAL Center`,
      alternates: { canonical: `${BASE_URL}/kursus/${slug}` },
    };
  } catch {
    return {
      title: { absolute: "Kursus — AKAL Center" },
      description: "Lihat detail kursus di AKAL Center.",
      alternates: { canonical: `${BASE_URL}/kursus` },
    };
  }
}

export default function KursusDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
