import { NextRequest, NextResponse } from "next/server";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`drafts-list:${session.userId}`, 60, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const rows = await db
      .select({
        id: aiGeneration.id,
        sourceFileName: aiGeneration.sourceFileName,
        status: aiGeneration.status,
        materiJudul: aiGeneration.materiJudul,
        materiStatus: aiGeneration.materiStatus,
        quizStatus: aiGeneration.quizStatus,
        soalStatus: aiGeneration.soalStatus,
        tokenInput: aiGeneration.tokenInput,
        tokenOutput: aiGeneration.tokenOutput,
        errorMessage: aiGeneration.errorMessage,
        createdAt: aiGeneration.createdAt,
        kategori: fileMateri.kategori,
      })
      .from(aiGeneration)
      .leftJoin(fileMateri, eq(aiGeneration.fileMateriId, fileMateri.id))
      .where(eq(aiGeneration.guruId, session.userId))
      .orderBy(desc(aiGeneration.createdAt))
      .limit(50);

    return NextResponse.json({ data: rows }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Drafts list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
