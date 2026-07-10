import crypto from "crypto";

function getSecret(): string {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET environment variable is required for QR hash generation");
  }
  return secret;
}

export function generateQRHash(nomorSertifikat: string, siswaId: string): string {
  return crypto
    .createHash("sha256")
    .update(nomorSertifikat + siswaId + getSecret())
    .digest("hex");
}
