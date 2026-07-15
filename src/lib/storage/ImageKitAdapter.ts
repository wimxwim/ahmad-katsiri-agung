import type { IStorageAdapter, StorageResult } from "./IStorageAdapter";
import { createHmac } from "crypto";

interface ImageKitAuth {
  token: string;
  expire: number;
  signature: string;
}

interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  filePath?: string;
}

export class ImageKitAdapter implements IStorageAdapter {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly urlEndpoint: string;

  constructor() {
    this.publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
    this.privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
    this.urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";

    if (!this.publicKey || !this.privateKey || !this.urlEndpoint) {
      throw new Error(
        "ImageKit belum dikonfigurasi. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT.",
      );
    }
  }

  private generateAuth(): ImageKitAuth {
    const expire = Math.floor(Date.now() / 1000) + 60 * 5;
    const token = crypto.randomUUID();
    const signature = createHmac("sha1", this.privateKey)
      .update(token + expire)
      .digest("hex");
    return { token, expire, signature };
  }

  async upload(
    file: Buffer,
    metadata: { nama: string; tipeMime: string; folder?: string },
  ): Promise<StorageResult> {
    const auth = this.generateAuth();
    const folder = metadata.folder || "/akal/dokumen";

    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(file)], { type: metadata.tipeMime }), metadata.nama);
    form.append("fileName", metadata.nama);
    form.append("folder", folder);
    form.append("useUniqueFileName", "true");
    form.append("publicKey", this.publicKey);
    form.append("token", auth.token);
    form.append("expire", String(auth.expire));
    form.append("signature", auth.signature);

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`ImageKit upload gagal (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as ImageKitUploadResponse;
    if (!json.fileId || !json.url) {
      throw new Error("ImageKit response tidak valid");
    }

    return {
      fileId: json.fileId,
      link: json.url,
      fileName: json.name || metadata.nama,
    };
  }

  async delete(fileId: string): Promise<void> {
    const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.privateKey}:`).toString("base64")}`,
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok && res.status !== 404) {
      const text = await res.text().catch(() => "");
      throw new Error(`ImageKit delete gagal (${res.status}): ${text.slice(0, 200)}`);
    }
  }

  getLink(fileId: string): string {
    if (!this.urlEndpoint) return "";
    return `${this.urlEndpoint.replace(/\/$/, "")}/?fileId=${fileId}`;
  }
}
