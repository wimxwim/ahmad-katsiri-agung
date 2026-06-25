import type { MetadataRoute } from "next";

const BASE_URL = "https://akalcenter.my.id";

const MATERI_SLUGS = [
  "beriman-kepada-malaikat",
  "membiasakan-tabayyun-menjauhi-ghibah",
  "salat-mencegah-perbuatan-keji-dan-mungkar",
  "melestarikan-alam-cerminan-orang-beriman",
  "amanah-dan-jujur",
  "beriman-kepada-kitab-allah",
  "beriman-kepada-nabi-dan-rasul",
  "membangun-toleransi",
  "moderasi-beragama",
  "adab-dalam-islam",
  "beriman-kepada-hari-akhir",
  "beriman-kepada-qada-dan-qadar",
  "semangat-mencari-ilmu",
  "manusia-khalifah-di-muka-bumi",
] as const;

const STATIC_PAGES = [
  { path: "", priority: 1, changeFreq: "weekly" as const },
  { path: "/materi", priority: 0.9, changeFreq: "weekly" as const },
  { path: "/evaluasi", priority: 0.8, changeFreq: "monthly" as const },
  { path: "/video", priority: 0.8, changeFreq: "monthly" as const },
  { path: "/game", priority: 0.7, changeFreq: "monthly" as const },
  { path: "/pendidik", priority: 0.7, changeFreq: "monthly" as const },
  { path: "/tentang", priority: 0.6, changeFreq: "monthly" as const },
  { path: "/peserta-didik", priority: 0.5, changeFreq: "monthly" as const },
  { path: "/hafalan", priority: 0.7, changeFreq: "monthly" as const },
  { path: "/refleksi", priority: 0.6, changeFreq: "monthly" as const },
  { path: "/diskusi", priority: 0.6, changeFreq: "monthly" as const },
  { path: "/quran", priority: 0.6, changeFreq: "monthly" as const },
  { path: "/dalil/al-isra-34", priority: 0.6, changeFreq: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));

  const materiEntries = MATERI_SLUGS.map((slug) => ({
    url: `${BASE_URL}/materi/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticEntries, ...materiEntries];
}
