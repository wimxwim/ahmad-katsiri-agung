import type { IStorageAdapter } from "./IStorageAdapter";
import { ImageKitAdapter } from "./ImageKitAdapter";
import { LocalAdapter } from "./LocalAdapter";

/**
 * Storage factory — pilih adapter sesuai env.
 *
 * Default ke ImageKit untuk semua upload baru. LocalAdapter hanya fallback
 * kalau env ImageKit tidak diset (mis. test lokal tanpa API key).
 *
 * @see /prd/TODO-V2-MULTI-GURU.md Gelombang 6
 */

let cached: IStorageAdapter | null = null;

export async function getStorageAdapter(_guruId?: string): Promise<IStorageAdapter> {
  if (cached) return cached;

  const hasImageKit =
    Boolean(process.env.IMAGEKIT_PUBLIC_KEY) &&
    Boolean(process.env.IMAGEKIT_PRIVATE_KEY) &&
    Boolean(process.env.IMAGEKIT_URL_ENDPOINT);

  if (hasImageKit) {
    try {
      cached = new ImageKitAdapter();
    } catch (e) {
      console.error("[StorageFactory] ImageKit init failed, falling back to local:", e);
      cached = new LocalAdapter();
    }
  } else {
    cached = new LocalAdapter();
  }
  return cached;
}

export function resetStorageAdapterCache(): void {
  cached = null;
}
