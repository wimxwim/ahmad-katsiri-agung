import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireGuru(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`drafts-detail:${ip}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;
    const [row] = await db
      .select({ id: aiGeneration.id, guruId: aiGeneration.guruId, fileMateriId: aiGeneration.fileMateriId, status: aiGeneration.status, materiKonten: aiGeneration.materiKonten, quizSoal: aiGeneration.quizSoal, soalItems: aiGeneration.soalItems, sourceFileName: aiGeneration.sourceFileName, createdAt: aiGeneration.createdAt, updatedAt: aiGeneration.updatedAt, errorMessage: aiGeneration.errorMessage })
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .limit(1);

    if (!row) return apiError("Draft tidak ditemukan", 404);
    return NextResponse.json({ data: row });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Draft detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
