import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { runGenerationFromText } from "@/lib/ai-generator";
import { extractText } from "@/lib/text-extractor";
import { appendEvent } from "@/lib/event-store";
import { apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const BATCH_SIZE = 5;
const RETRYABLE_ERRORS = ["timeout", "Timeout", "502", "503", "504", "ETIMEDOUT", "ECONNRESET", "fetch failed"];

function isRetryable(errMsg: string): boolean {
  return RETRYABLE_ERRORS.some((pattern) => errMsg.includes(pattern));
}

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

  const claimed = await db.execute<{ id: string; file_materi_id: string; guru_id: string }>(sql`
    WITH claimed AS (
      SELECT id, file_materi_id, guru_id
      FROM ai_generation
      WHERE status = 'queued'
        AND materi_status = 'not_generated'
      ORDER BY created_at
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE ai_generation
    SET status = 'extracting', updated_at = NOW()
    FROM claimed
    WHERE ai_generation.id = claimed.id
    RETURNING ai_generation.id, ai_generation.file_materi_id, ai_generation.guru_id
  `);

  const jobs = claimed.rows ?? [];
  const total = jobs.length;

  const results: Array<{ id: string; status: string; error?: string }> = [];

  const fileIds = jobs.map((j) => j.file_materi_id).filter(Boolean) as string[];
  const fileMap = new Map<string, { extractionText: string | null; imagekitFileId: string | null; tipeMime: string | null; linkAkses: string | null }>();
  if (fileIds.length > 0) {
    const files = await db
      .select({
        id: fileMateri.id,
        extractionText: fileMateri.extractionText,
        imagekitFileId: fileMateri.imagekitFileId,
        tipeMime: fileMateri.tipeMime,
        linkAkses: fileMateri.linkAkses,
      })
      .from(fileMateri)
      .where(inArray(fileMateri.id, fileIds));
    for (const f of files) {
      fileMap.set(f.id, {
        extractionText: f.extractionText,
        imagekitFileId: f.imagekitFileId,
        tipeMime: f.tipeMime,
        linkAkses: f.linkAkses,
      });
    }
  }

  for (const job of jobs) {
    try {
      const fileInfo = fileMap.get(job.file_materi_id);
      let sourceText = fileInfo?.extractionText;

      if (!sourceText || sourceText.length < 50) {
        if (fileInfo?.linkAkses || fileInfo?.imagekitFileId) {
          try {
            const fileUrl = fileInfo.linkAkses || `https://ik.imagekit.io/v6wbihytb/${fileInfo.imagekitFileId}`;
            const fileRes = await fetch(fileUrl, { signal: AbortSignal.timeout(30_000) });
            if (!fileRes.ok) {
              throw new Error(`Gagal mengunduh file: ${fileRes.status}`);
            }
            const fileBytes = Buffer.from(await fileRes.arrayBuffer());
            const ext = fileInfo.tipeMime?.includes("pdf") ? "pdf" : "docx";
            sourceText = await extractText(fileBytes, ext);

            if (sourceText && sourceText.length >= 50) {
              await db
                .update(fileMateri)
                .set({ extractionText: sourceText, status: "extracted", updatedAt: new Date() })
                .where(eq(fileMateri.id, job.file_materi_id));
            }
          } catch (extractErr) {
            const errMsg = extractErr instanceof Error ? extractErr.message : String(extractErr);
            console.error(`[cron] extraction failed for ${job.id}:`, errMsg);
            await db
              .update(aiGeneration)
              .set({ status: "failed", errorMessage: `Ekstraksi gagal: ${errMsg.slice(0, 200)}`, updatedAt: new Date() })
              .where(eq(aiGeneration.id, job.id));
            results.push({ id: job.id, status: "failed", error: "Ekstraksi gagal" });
            continue;
          }
        }

        if (!sourceText || sourceText.length < 50) {
          await db
            .update(aiGeneration)
            .set({ status: "failed", errorMessage: "Teks terlalu pendek", updatedAt: new Date() })
            .where(eq(aiGeneration.id, job.id));
          results.push({ id: job.id, status: "failed", error: "Teks terlalu pendek" });
          continue;
        }
      }

      await db
        .update(aiGeneration)
        .set({ status: "generating", updatedAt: new Date() })
        .where(eq(aiGeneration.id, job.id));

      await runGenerationFromText(job.id, sourceText, job.guru_id);

      await appendEvent(`gen:${job.guru_id}`, "gen.ready", {
        generationId: job.id,
        source: "cron",
      });

      results.push({ id: job.id, status: "ready" });
      console.log(`[cron] generated ${job.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[cron] failed ${job.id}:`, msg);

      const retryable = isRetryable(msg);

      if (retryable) {
        await db
          .update(aiGeneration)
          .set({
            status: "queued",
            errorMessage: `[CRON] ${msg.slice(0, 300)}`,
            updatedAt: new Date(),
          })
          .where(eq(aiGeneration.id, job.id));

        results.push({ id: job.id, status: "queued", error: "Retryable — akan dicoba lagi" });
      } else {
        await db
          .update(aiGeneration)
          .set({
            status: "failed",
            errorMessage: msg.slice(0, 500),
            updatedAt: new Date(),
          })
          .where(eq(aiGeneration.id, job.id));

        results.push({ id: job.id, status: "failed", error: msg.slice(0, 200) });
      }
    }
  }

  return NextResponse.json({
    success: true,
    total,
    processed: results.length,
    results,
  });
}