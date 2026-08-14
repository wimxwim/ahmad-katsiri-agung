import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://akalcenter.my.id";

const STATIC_PAGES = [
  { path: "", priority: 1, changeFreq: "weekly" as const },
  { path: "/kursus", priority: 0.9, changeFreq: "weekly" as const },
  { path: "/fitur", priority: 0.8, changeFreq: "monthly" as const },
  { path: "/panduan-ai", priority: 0.7, changeFreq: "monthly" as const },
  { path: "/quran", priority: 0.6, changeFreq: "monthly" as const },
  { path: "/harga", priority: 0.6, changeFreq: "monthly" as const },
  { path: "/tentang", priority: 0.6, changeFreq: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));

  try {
    const kursusRows = await db
      .select({ slug: kursus.slug, updatedAt: kursus.updatedAt })
      .from(kursus)
      .where(eq(kursus.statusPublikasi, "PUBLIK"))
      .limit(100);

    const dynamicEntries: MetadataRoute.Sitemap = kursusRows.map((r) => ({
      url: `${BASE_URL}/kursus/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticEntries, ...dynamicEntries];
  } catch {
    return staticEntries;
  }
}
