export interface StorageResult {
  fileId: string;
  link: string;
  fileName: string;
}

export interface UploadMetadata {
  nama: string;
  tipeMime: string;
  folder?: string;
}

export interface IStorageAdapter {
  upload(file: Buffer, metadata: UploadMetadata): Promise<StorageResult>;
  delete(fileId: string): Promise<void>;
  getLink(fileId: string): string;
}
