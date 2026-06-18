import type { BabMateri } from "../data/materi";
import type { BabSoal, SoalItem } from "../data/soal";

/**
 * CMS Reader — reads content from Keystatic JSON files in `content/` directory.
 *
 * Safe to use alongside existing hardcoded data.
 * Returns null if CMS data is not available (falls back to hardcoded).
 *
 * Flow:
 *   content/materi/{slug}/index.json  →  BabMateri
 *   content/soal/{slug}/index.json    →  BabSoal
 *   content/game/{slug}/index.json    →  Game entry
 *   content/hadits/{slug}/index.json  →  Hadits entry
 *   content/navigation/index.json     →  Navigation singleton
 *   content/site-config/index.json    →  SiteConfig singleton
 *   content/about/index.json          →  About singleton
 */

// ── Types ──

export interface CmsNavigation {
  navbarItems: { href: string; label: string }[];
  bottomTabs: { href: string; label: string; icon: string }[];
  footerLinks: { href: string; label: string }[];
  waNumber: string;
  igHandle: string;
  tiktokHandle: string;
  youtubeChannel: string;
}

export interface CmsSiteConfig {
  siteTitle: string;
  tagline: string;
  description: string;
  keywords: string;
  googleAnalyticsId: string;
}

export interface CmsAbout {
  filosofi: string;
  pendiriNama: string;
  pendiriFoto: string;
  visi: string;
  misi: string[];
  verifikator: { nama: string; peran: string }[];
}

export interface CmsGame {
  judul: string;
  desc: string;
  url: string;
  badge: "EKSTERNAL" | "INTERNAL";
  image: string;
}

export interface CmsHadits {
  teks: string;
  sumber: string;
}

export interface CmsPerangkatItem {
  kelas: string;
  label: string;
  file: string;
  tersedia: boolean;
}

export interface CmsPendidikPage {
  featureCards: { badge: string; title: string; desc: string }[];
  stats: { value: string; label: string }[];
}

// ── Raw JSON types from Keystatic ──

interface RawMateri {
  title: string;
  kelas: string;
  bab: number;
  babLabel: string;
  ringkasan: string;
  subTopik: number;
  waktuBaca: string;
  icon: string;
  videoUrl: string;
  soalUrl: string;
  gameUrl: string;
  pendahuluan: string;
  konten: { judul: string; isi: string }[];
  dalil: { surah: string; arab: string; arti: string };
  dimensi: { nomor: number; judul: string; deskripsi: string }[];
  poinPenting: string[];
  prevSlug: string;
  prevTitle: string;
  nextSlug: string;
  nextTitle: string;
}

interface RawSoal {
  title: string;
  kelas: string;
  bab: number;
  soal: {
    nomor: number;
    pertanyaan: string;
    opsiA: string;
    opsiB: string;
    opsiC: string;
    opsiD: string;
    opsiE: string;
    jawaban: string;
  }[];
}

// ── Materi ──

export async function getMateriFromCms(): Promise<Record<string, BabMateri> | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const base = path.join(process.cwd(), "content/materi");

    if (!fs.existsSync(base)) return null;

    const slugs = fs.readdirSync(base).filter((f) =>
      fs.statSync(path.join(base, f)).isDirectory()
    );
    const result: Record<string, BabMateri> = {};

    for (const slug of slugs) {
      const jsonPath = path.join(base, slug, "index.json");
      if (!fs.existsSync(jsonPath)) continue;

      const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as RawMateri;
      const kelas = parseInt(raw.kelas) as 7 | 8 | 9;

      result[slug] = {
        slug,
        title: raw.title,
        kelas,
        bab: raw.bab,
        babLabel: raw.babLabel,
        ringkasan: raw.ringkasan,
        subTopik: raw.subTopik,
        waktuBaca: raw.waktuBaca,
        icon: raw.icon,
        videoUrl: raw.videoUrl || undefined,
        soalUrl: raw.soalUrl || undefined,
        gameUrl: raw.gameUrl || undefined,
        pendahuluan: raw.pendahuluan,
        konten: raw.konten,
        dalil: raw.dalil.surah ? raw.dalil : undefined,
        dimensi: raw.dimensi.length > 0 ? raw.dimensi : undefined,
        poinPenting: raw.poinPenting,
        prevSlug: raw.prevSlug || undefined,
        prevTitle: raw.prevTitle || undefined,
        nextSlug: raw.nextSlug || undefined,
        nextTitle: raw.nextTitle || undefined,
      };
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

// ── Soal ──

export async function getSoalFromCms(): Promise<Record<string, BabSoal> | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const base = path.join(process.cwd(), "content/soal");

    if (!fs.existsSync(base)) return null;

    const slugs = fs.readdirSync(base).filter((f) =>
      fs.statSync(path.join(base, f)).isDirectory()
    );
    const result: Record<string, BabSoal> = {};

    for (const slug of slugs) {
      const jsonPath = path.join(base, slug, "index.json");
      if (!fs.existsSync(jsonPath)) continue;

      const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as RawSoal;

      const soalList: SoalItem[] = raw.soal.map((s) => {
        const opsi: Record<string, string> = {
          A: s.opsiA,
          B: s.opsiB,
          C: s.opsiC,
          D: s.opsiD,
        };
        if (s.opsiE) opsi.E = s.opsiE;

        return {
          nomor: s.nomor,
          pertanyaan: s.pertanyaan,
          opsi,
          jawaban: s.jawaban,
        };
      });

      result[slug] = {
        slug,
        title: raw.title,
        kelas: parseInt(raw.kelas),
        bab: raw.bab,
        soal: soalList,
      };
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

// ── Soal Meta ──

export async function getSoalMetaFromCms(): Promise<{ slug: string; title: string; kelas: number; jumlahSoal: number }[] | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const base = path.join(process.cwd(), "content/soal");

    if (!fs.existsSync(base)) return null;

    const slugs = fs.readdirSync(base).filter((f) =>
      fs.statSync(path.join(base, f)).isDirectory()
    );
    const result: { slug: string; title: string; kelas: number; jumlahSoal: number }[] = [];

    for (const slug of slugs) {
      const jsonPath = path.join(base, slug, "index.json");
      if (!fs.existsSync(jsonPath)) continue;

      const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      result.push({
        slug,
        title: raw.title,
        kelas: parseInt(raw.kelas),
        jumlahSoal: raw.soal?.length ?? 0,
      });
    }

    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
}

// ── About ──

export async function getAboutFromCms(): Promise<CmsAbout | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const jsonPath = path.join(process.cwd(), "content/about/index.json");

    if (!fs.existsSync(jsonPath)) return null;

    return JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as CmsAbout;
  } catch {
    return null;
  }
}

// ── Pendidik Page ──

export async function getPendidikPageFromCms(): Promise<{
  featureCards: { badge: string; title: string; desc: string }[];
  stats: { value: string; label: string }[];
} | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const jsonPath = path.join(process.cwd(), "content/pendidik-page/index.json");

    if (!fs.existsSync(jsonPath)) return null;

    return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch {
    return null;
  }
}

// ── Perangkat Ajar ──

export async function getPerangkatAjarFromCms(): Promise<{
  items: { kelas: string; label: string; file: string; tersedia: boolean }[];
} | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const jsonPath = path.join(process.cwd(), "content/perangkat-ajar/index.json");

    if (!fs.existsSync(jsonPath)) return null;

    return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch {
    return null;
  }
}

// ── Navigation ──

export async function getNavigationFromCms(): Promise<CmsNavigation | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const jsonPath = path.join(process.cwd(), "content/navigation/index.json");

    if (!fs.existsSync(jsonPath)) return null;

    return JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as CmsNavigation;
  } catch {
    return null;
  }
}

// ── Site Config ──

export async function getSiteConfigFromCms(): Promise<CmsSiteConfig | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const jsonPath = path.join(process.cwd(), "content/site-config/index.json");

    if (!fs.existsSync(jsonPath)) return null;

    return JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as CmsSiteConfig;
  } catch {
    return null;
  }
}

// ── Game ──

export async function getGamesFromCms(): Promise<CmsGame[] | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const base = path.join(process.cwd(), "content/game");

    if (!fs.existsSync(base)) return null;

    const slugs = fs.readdirSync(base).filter((f) =>
      fs.statSync(path.join(base, f)).isDirectory()
    );
    const result: CmsGame[] = [];

    for (const slug of slugs) {
      const jsonPath = path.join(base, slug, "index.json");
      if (!fs.existsSync(jsonPath)) continue;

      const game = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as CmsGame;
      result.push(game);
    }

    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
}

// ── Hadits ──

export async function getHaditsFromCms(): Promise<CmsHadits[] | null> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const base = path.join(process.cwd(), "content/hadits");

    if (!fs.existsSync(base)) return null;

    const slugs = fs.readdirSync(base).filter((f) =>
      fs.statSync(path.join(base, f)).isDirectory()
    );
    const result: CmsHadits[] = [];

    for (const slug of slugs) {
      const jsonPath = path.join(base, slug, "index.json");
      if (!fs.existsSync(jsonPath)) continue;

      const hadits = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as CmsHadits;
      result.push(hadits);
    }

    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
}
