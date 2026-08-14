import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const DraftsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  // TODO: cursor pagination (base64 {createdAt, id}) — nextCursor planned, not yet implemented
  cursor: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`drafts-list:${session.userId}`, 60, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const parsed = DraftsQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Parameter tidak valid", 400);
    const { limit } = parsed.data;

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
      .limit(limit);

    // TODO: nextCursor = rows.length === limit ? base64(lastRow) : null — add composite cursor (createdAt, id) when frontend needs pagination

    return NextResponse.json({ data: rows, nextCursor: null }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Drafts list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
