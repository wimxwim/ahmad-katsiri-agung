/**
 * CMS Data Layer — unified data access.
 *
 * Tries CMS first, falls back to hardcoded.
 * Components import from here instead of directly from src/data/.
 *
 * Currently: all functions return hardcoded data (CMS behind toggle).
 * When CMS_ENABLED=true and JSON files exist → reads from CMS.
 */

import { CMS_ENABLED } from "./cms-config";
import {
  getMateriFromCms,
  getSoalFromCms,
  getNavigationFromCms,
  getGamesFromCms,
  getHaditsFromCms,
} from "./cms";
import { ALL_MATERI, type BabMateri } from "../data/materi";
import { ALL_SOAL, SOAL_META, type BabSoal } from "../data/soal";

// ── Materi ──

let cachedMateri: Record<string, BabMateri> | null = null;
let materiPromise: Promise<Record<string, BabMateri>> | null = null;

export async function getAllMateri(): Promise<Record<string, BabMateri>> {
  if (cachedMateri) return cachedMateri;
  if (materiPromise) return materiPromise;

  materiPromise = (async () => {
    if (CMS_ENABLED) {
      const cms = await getMateriFromCms();
      if (cms) {
        cachedMateri = cms;
        return cms;
      }
    }
    cachedMateri = ALL_MATERI;
    return ALL_MATERI;
  })();

  return materiPromise;
}

export async function getMateriBySlug(
  slug: string,
): Promise<BabMateri | undefined> {
  const all = await getAllMateri();
  return all[slug];
}

// ── Soal ──

let cachedSoal: Record<string, BabSoal> | null = null;
let soalPromise: Promise<Record<string, BabSoal>> | null = null;

export async function getAllSoal(): Promise<Record<string, BabSoal>> {
  if (cachedSoal) return cachedSoal;
  if (soalPromise) return soalPromise;

  soalPromise = (async () => {
    if (CMS_ENABLED) {
      const cms = await getSoalFromCms();
      if (cms) {
        cachedSoal = cms;
        return cms;
      }
    }
    cachedSoal = ALL_SOAL;
    return ALL_SOAL;
  })();

  return soalPromise;
}

export function getSoalMeta() {
  return SOAL_META;
}

// ── Navigation (untuk masa depan) ──

export async function getNavigation() {
  if (CMS_ENABLED) {
    const cms = await getNavigationFromCms();
    if (cms) return cms;
  }
  return null; // komponen tetap pakai hardcoded
}

// ── Game ──

export async function getGames() {
  if (CMS_ENABLED) {
    const cms = await getGamesFromCms();
    if (cms) return cms;
  }
  return null;
}

// ── Hadits ──

export async function getHadits() {
  if (CMS_ENABLED) {
    const cms = await getHaditsFromCms();
    if (cms) return cms;
  }
  return null;
}
