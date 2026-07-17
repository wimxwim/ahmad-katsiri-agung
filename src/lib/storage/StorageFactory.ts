import type { IStorageAdapter } from "./IStorageAdapter";
import { ImageKitAdapter } from "./ImageKitAdapter";
import { LocalAdapter } from "./LocalAdapter";

export async function getStorageAdapter(_guruId?: string): Promise<IStorageAdapter> {
  const hasImageKit =
    Boolean(process.env.IMAGEKIT_PUBLIC_KEY) &&
    Boolean(process.env.IMAGEKIT_PRIVATE_KEY) &&
    Boolean(process.env.IMAGEKIT_URL_ENDPOINT);

  if (hasImageKit) {
    try {
      return new ImageKitAdapter();
    } catch (e) {
      console.error("[StorageFactory] ImageKit init failed, falling back to local:", e);
      return new LocalAdapter();
    }
  }
  return new LocalAdapter();
}
