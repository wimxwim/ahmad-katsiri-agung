import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiSuccess } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * Mint ImageKit client-side upload credentials for an authenticated guru.
 * Digunakan untuk direct-upload file besar (> 4MB) dari browser ke
 * upload.imagekit.io, menghindari limit body request Vercel (4.5MB).
 *
 * Signature = HMAC-SHA1(token + expire) dengan IMAGEKIT_PRIVATE_KEY,
 * sama persis dengan ImageKitAdapter.generateAuth().
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimit(`storage-auth:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";

    if (!publicKey || !privateKey || !urlEndpoint) {
      return apiError("ImageKit belum dikonfigurasi", 500);
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 600; // 10 menit, harus < 1 jam
    const signature = createHmac("sha1", privateKey)
      .update(`${token}${expire}`)
      .digest("hex");

    return apiSuccess({
      publicKey,
      token,
      expire,
      signature,
      folder: `/akal/dokumen/guru-${session.userId}`,
      urlEndpoint,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Storage auth error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
