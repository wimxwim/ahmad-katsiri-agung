import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, checkRateLimitPerUser, checkConcurrentLimit, releaseConcurrent, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { runGeneration } from "@/lib/ai-generator";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { readFile } from "fs/promises";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { checkQuota, QuotaExceededError } from "@/lib/quota-guard";
import { validateCsrf } from "@/lib/csrf-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .limit(1);
    if (!row) return apiError("Draft tidak ditemukan", 404);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`ai-regen:${ip}`, 2, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const userRl = await checkRateLimitPerUser(`regen:${session.userId}`, 5, 60_000);
    if (!userRl.allowed) {
      return apiError(`Terlalu banyak regenerate. Coba lagi dalam ${userRl.retryAfter} detik.`, 429);
    }

    if (!row.fileMateriId) {
      return apiError("Draft ini tidak punya file sumber", 400);
    }

    const [file] = await db
      .select()
      .from(fileMateri)
      .where(eq(fileMateri.id, row.fileMateriId))
      .limit(1);
    if (!file) return apiError("File sumber tidak ditemukan", 404);

    let bytes: Buffer;
    if (file.imagekitFileId && file.lokasi === "IMAGEKIT") {
      const adapter = await getStorageAdapter(session.userId);
      const res = await fetch(adapter.getLink(file.imagekitFileId));
      if (!res.ok) return apiError("Gagal download file dari ImageKit", 502);
      bytes = Buffer.from(await res.arrayBuffer());
    } else if (file.linkAkses.startsWith("/tmp/")) {
      bytes = await readFile(file.linkAkses);
    } else {
      return apiError("Lokasi file tidak didukung untuk regenerate", 400);
    }

    await db
      .update(aiGeneration)
      .set({ status: "queued", errorMessage: null, updatedAt: new Date() })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)));
    await appendEvent(`gen:${session.userId}`, "gen.regenerate_queued", { generationId: id });

    const ext = (file.tipeMime.includes("pdf") ? "pdf" : file.tipeMime.includes("word") ? "docx" : "doc");

    const concRl = await checkConcurrentLimit(`gen:${session.userId}`, 2);
    if (!concRl.allowed) {
      return apiError("Sudah ada 2 job AI aktif. Tunggu selesai sebelum regenerate.", 429);
    }

    try {
      await checkQuota(session.userId, session.role, "ai_generation");
    } catch (e) {
      if (e instanceof QuotaExceededError) {
        return NextResponse.json(
          { success: false, error: e.message, quota: { limit: e.limitValue, used: e.currentUsage } },
          { status: 429 },
        );
      }
      throw e;
    }

    runGeneration(id, bytes, ext)
      .catch((e) => {
        console.error("Regenerate async error:", e);
      })
      .finally(() => {
        releaseConcurrent(`gen:${session.userId}`);
      });

    return NextResponse.json({ success: true, status: "queued" });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    if (e instanceof QuotaExceededError) {
      return NextResponse.json(
        { success: false, error: e.message, quota: { limit: e.limitValue, used: e.currentUsage } },
        { status: 429 },
      );
    }
    console.error("Regenerate error:", e);
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan server";
    return apiError(msg, 500);
  }
}
