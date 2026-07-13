import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { runGenerationFromText } from "@/lib/ai-generator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET tidak dikonfigurasi" }, { status: 500 });
  }
  const auth = request.headers.get("Authorization");
  const expected = `Bearer ${cronSecret}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [pending] = await db
    .select({ id: aiGeneration.id, count: aiGeneration.id })
    .from(aiGeneration)
    .where(
      and(
        eq(aiGeneration.status, "queued"),
        eq(aiGeneration.materiStatus, "not_generated"),
      ),
    );

  const total = pending ? 1 : 0;

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

  const results: Array<{ id: string; status: string; error?: string }> = [];

  for (const gen of queued) {
    try {
      const [file] = await db
        .select({ extractionText: fileMateri.extractionText })
        .from(fileMateri)
        .where(eq(fileMateri.id, gen.fileMateriId!))
        .limit(1);

      const text = file?.extractionText;
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