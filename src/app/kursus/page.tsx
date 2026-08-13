import { KursusListClient } from "./KursusListClient";
import { db } from "@/lib/db";
import { kursus, statusPublikasiEnum } from "@/lib/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";

export const revalidate = 60;

const PUBLIK: (typeof statusPublikasiEnum)["enumValues"][number] = "PUBLIK";

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  statusPublikasi: string;
  createdAt: string;
}

export default async function KatalogKursusPage() {
  let kursusList: KursusItem[] = [];
  let error: string | null = null;

  try {
    const rows = await db
      .select({
        id: kursus.id,
        judul: kursus.judul,
        slug: kursus.slug,
        deskripsi: kursus.deskripsi,
        statusPublikasi: kursus.statusPublikasi,
        createdAt: kursus.createdAt,
      })
      .from(kursus)
      .where(and(isNull(kursus.deletedAt), eq(kursus.statusPublikasi, PUBLIK)))
      .orderBy(sql`COALESCE(${kursus.publishedAt}, ${kursus.createdAt}) DESC`);
    kursusList = rows.map((row) => ({
      id: row.id,
      judul: row.judul,
      slug: row.slug,
      deskripsi: row.deskripsi,
      statusPublikasi: row.statusPublikasi,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (err) {
    error = "Gagal memuat data";
  }

  return <KursusListClient initialKursus={kursusList} initialError={error} />;
}
