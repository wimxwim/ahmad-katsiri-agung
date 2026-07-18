import { NextRequest } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiSuccess, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { sendDonationNotification } from "@/lib/telegram-notif";
import { recordDonation } from "@/lib/token-service";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "pdf"]);

const MAGIC_BYTES: { ext: string; bytes: number[] }[] = [
  { ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { ext: "webp", bytes: [0x52, 0x49, 0x46, 0x46] },
  { ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
];

const MAX_SIZE = 5 * 1024 * 1024;

function detectExtension(buf: Buffer): string | null {
  for (const m of MAGIC_BYTES) {
    if (m.bytes.every((b, i) => buf[i] === b)) return m.ext;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`donation-upload:${ip}`, 3, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const session = await requireGuru(request);

    const fd = await request.formData();
    const file = fd.get("file");

    let proofFileId: string | undefined;
    let proofLink: string | undefined;

    if (file instanceof File) {
      if (file.size > MAX_SIZE) {
        return apiError("VALIDATION_ERROR", "File terlalu besar (maks 5MB)", undefined, 413);
      }
      if (file.size === 0) {
        return apiError("VALIDATION_ERROR", "File kosong", undefined, 400);
      }

      const lowerName = file.name.toLowerCase();
      const extFromName = lowerName.split(".").pop() || "";
      if (!ALLOWED_EXT.has(extFromName)) {
        return apiError("VALIDATION_ERROR", `Tipe file .${extFromName} tidak diizinkan`, undefined, 415);
      }
      if (!file.type || !ALLOWED_MIME.has(file.type)) {
        return apiError("VALIDATION_ERROR", `MIME type ${file.type} tidak diizinkan`, undefined, 415);
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const detected = detectExtension(bytes);
      if (!detected) {
        return apiError("VALIDATION_ERROR", "File bukan gambar/PDF yang valid", undefined, 415);
      }

      const adapter = await getStorageAdapter(session.userId);
      const folder = `/akal/donasi/guru-${session.userId}`;

      const uploadResult = await adapter.upload(bytes, {
        nama: `donasi-${Date.now()}-${file.name}`,
        tipeMime: file.type || `application/${detected}`,
        folder,
      });

      proofFileId = uploadResult.fileId;
      proofLink = uploadResult.link;
    }

    await recordDonation(session.userId, { proofFileId, proofLink });

    const guru = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { nama: true, email: true, lastActiveAt: true },
    });

    await sendDonationNotification({
      userId: session.userId,
      nama: guru?.nama ?? "Guru",
      email: guru?.email ?? session.email ?? "",
      proofUrl: proofLink,
      loginTerakhir: guru?.lastActiveAt
        ? new Date(guru.lastActiveAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
        : undefined,
    }).catch((e) => console.error("Telegram donasi notif gagal:", e));

    return apiSuccess({
      message: "Terima kasih atas donasi Anda. Semoga menjadi amal jariyah.",
      proofUrl: proofLink ?? null,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Donation upload error:", e);
    return apiError("INTERNAL_ERROR", "Gagal memproses donasi", undefined, 500);
  }
}