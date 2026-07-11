import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkQuota, QuotaExceededError } from "@/lib/quota-guard";
import {
  checkRateLimit,
  checkConcurrentLimit,
  releaseConcurrent,
  ipFromRequest,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_CONCURRENT_PER_GURU = 2;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireGuru(request);
    const { id } = await params;

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`gen-trigger:${ip}`, 10, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfter / 1000)) } });

    const [gen] = await db
      .select()
      .from(aiGeneration)
      .where(eq(aiGeneration.id, id))
      .limit(1);

    if (!gen) return apiError("Draft tidak ditemukan", 404);
    if (gen.guruId !== session.userId) return apiError("Akses ditolak", 403);
    if (gen.status === "ready") return NextResponse.json({ success: true, message: "Draft sudah siap", generationId: id });
    if (gen.status === "generating") return NextResponse.json({ success: true, message: "AI sedang generating", generationId: id });

    const [file] = await db
      .select()
      .from(fileMateri)
      .where(eq(fileMateri.id, gen.fileMateriId!))
      .limit(1);

    if (!file) return apiError("File sumber tidak ditemukan", 404);

    const concRl = await checkConcurrentLimit(`gen:${session.userId}`, MAX_CONCURRENT_PER_GURU);
    if (!concRl.allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak job aktif" }, { status: 429 });
    }

    try {
      await checkQuota(session.userId!, session.role, "ai_generation");
    } catch (e) {
      if (e instanceof QuotaExceededError) {
        return NextResponse.json({ success: false, error: e.message, quota: { limit: e.limitValue, used: e.currentUsage } }, { status: 429 });
      }
      throw e;
    }

    await db
      .update(aiGeneration)
      .set({ status: "generating", updatedAt: new Date() })
      .where(eq(aiGeneration.id, id));

    const msg = {
      generationId: id,
      fileId: gen.fileMateriId,
      fileName: gen.sourceFileName,
      ext: gen.sourceFileName?.split(".").pop() || "pdf",
      guruId: gen.guruId,
      kursusId: gen.kursusId,
      imagekitFileId: file.imagekitFileId,
      imagekitLink: file.linkAkses,
    };

    const workerUrl = "https://akal-center.wimxgooo.workers.dev/v1/ai/generate";
    fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    }).catch(() => {});

    await appendEvent(`gen:${session.userId}`, "gen.queued", { generationId: id });
    releaseConcurrent(`gen:${session.userId}`);

    return NextResponse.json({ success: true, message: "AI generation dimulai", generationId: id });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Generate trigger error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}