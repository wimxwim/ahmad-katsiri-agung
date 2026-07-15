import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { eq, asc, and, inArray } from "drizzle-orm";
import { runGenerationFromText } from "@/lib/ai-generator";
import { apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return apiError("CRON_SECRET tidak dikonfigurasi di environment variable", 500);
  }
  const tokenParam = request.nextUrl.searchParams.get("token");
  const authHeader = request.headers.get("Authorization");
  const isAuthorized =
    (tokenParam && tokenParam === cronSecret) ||
    (authHeader && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return apiError("Unauthorized", 401);
  }

  const queued = await db
    .select({
      id: aiGeneration.id,
      fileMateriId: aiGeneration.fileMateriId,
      guruId: aiGeneration.guruId,
    })
    .from(aiGeneration)
    .where(
      and(
        eq(aiGeneration.status, "queued"),
        eq(aiGeneration.materiStatus, "not_generated"),
      ),
    )
    .orderBy(asc(aiGeneration.createdAt))
    .limit(50);

  const total = queued.length;

  const results: Array<{ id: string; status: string; error?: string }> = [];

  const fileIds = queued.map(g => g.fileMateriId).filter(Boolean) as string[];
  const fileMap = new Map<string, string>();
  if (fileIds.length > 0) {
    const files = await db
      .select({ id: fileMateri.id, extractionText: fileMateri.extractionText })
      .from(fileMateri)
      .where(inArray(fileMateri.id, fileIds));
    for (const f of files) {
      if (f.extractionText) fileMap.set(f.id, f.extractionText);
    }
  }

  for (const gen of queued) {
    try {
      const text = fileMap.get(gen.fileMateriId!);
      if (!text || text.length < 50) {
        await db
          .update(aiGeneration)
          .set({ status: "failed", errorMessage: "Teks terlalu pendek", updatedAt: new Date() })
          .where(eq(aiGeneration.id, gen.id));
        results.push({ id: gen.id, status: "failed", error: "Teks terlalu pendek" });
        continue;
      }

      await db
        .update(aiGeneration)
        .set({ status: "generating", updatedAt: new Date() })
        .where(eq(aiGeneration.id, gen.id));

      await runGenerationFromText(gen.id, text, gen.guruId);

      results.push({ id: gen.id, status: "ready" });
      console.log(`[cron] generated ${gen.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[cron] failed ${gen.id}:`, msg);
      await db
        .update(aiGeneration)
        .set({ status: "failed", errorMessage: msg.slice(0, 500), updatedAt: new Date() })
        .where(eq(aiGeneration.id, gen.id));
      results.push({ id: gen.id, status: "failed", error: "Internal generation error" });
    }
  }

  return NextResponse.json({
    success: true,
    total,
    processed: results.length,
    results,
  });
}