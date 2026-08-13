import { KursusDetailClient } from "./KursusDetailClient";
import { db } from "@/lib/db";
import { kursus, statusPublikasiEnum } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const revalidate = 60;

export async function generateStaticParams() {
  const { db } = await import("@/lib/db");
  const { kursus } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const rows = await db
    .select({ slug: kursus.slug })
    .from(kursus)
    .where(eq(kursus.statusPublikasi, "PUBLIK"))
    .limit(100);
  return rows.map((r) => ({ slug: r.slug }));
}

const PUBLIK: (typeof statusPublikasiEnum)["enumValues"][number] = "PUBLIK";

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
  let kursusData: KursusData | null = null;
  let error: string | null = null;

  try {
    const [row] = await db
      .select({
        id: kursus.id,
        judul: kursus.judul,
        slug: kursus.slug,
        deskripsi: kursus.deskripsi,
        isPublic: kursus.isPublic,
        harga: kursus.harga,
        createdAt: kursus.createdAt,
      })
      .from(kursus)
      .where(and(eq(kursus.slug, slug), isNull(kursus.deletedAt), eq(kursus.statusPublikasi, PUBLIK)))
      .limit(1);
    if (row) {
      kursusData = {
        id: row.id,
        judul: row.judul,
        slug: row.slug,
        deskripsi: row.deskripsi,
        isPublic: row.isPublic,
        harga: row.harga ?? 0,
        createdAt: row.createdAt.toISOString(),
      };
    }
  } catch (err) {
    error = "Gagal memuat data";
  }

  return <KursusDetailClient slug={slug} initialKursus={kursusData} initialError={error} />;
}
