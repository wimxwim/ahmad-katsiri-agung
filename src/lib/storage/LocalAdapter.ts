import type { IStorageAdapter, StorageResult } from "./IStorageAdapter";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export class LocalAdapter implements IStorageAdapter {
  private extMap = new Map<string, string>();

  constructor() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async upload(file: Buffer, metadata: { nama: string; tipeMime: string }): Promise<StorageResult> {
    const fileId = crypto.randomUUID();
    const ext = path.extname(metadata.nama) || "";
    const safeName = `${fileId}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);
    fs.writeFileSync(filePath, file);
    this.extMap.set(fileId, ext);
    return { fileId, link: `/uploads/${safeName}`, fileName: metadata.nama };
  }

  async delete(fileId: string): Promise<void> {
    const ext = this.extMap.get(fileId) || "";
    const filePath = path.join(UPLOAD_DIR, `${fileId}${ext}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    this.extMap.delete(fileId);
  }

  getLink(fileId: string): string {
    const ext = this.extMap.get(fileId) || "";
    return `/uploads/${fileId}${ext}`;
  }
}
