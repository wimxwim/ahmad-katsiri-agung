import type { MetadataRoute } from "next";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-08-10");

  return STATIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));
}
