import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { runGeneration } from "@/lib/ai-generator";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { readFile } from "fs/promises";
import { appendEvent } from "@/lib/event-store";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    const session = _ar && _ar.success ? _ar.data : null;
    if (!session || (session.role !== "guru" && session.role !== "owner")) {
      return apiError("Hanya guru yang dapat regenerate draft", 403);
    }

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
      .limit(1);
    if (!row) return apiError("Draft tidak ditemukan", 404);

    const ip = ipFromRequest(_request);
    const rl = await checkRateLimit(`ai-regen:${ip}`, 2, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

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
      const adapter = await getStorageAdapter(session.userId!);
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
      .where(eq(aiGeneration.id, id));
    await appendEvent(`gen:${session.userId}`, "gen.regenerate_queued", { generationId: id });

    const ext = (file.tipeMime.includes("pdf") ? "pdf" : file.tipeMime.includes("word") ? "docx" : "doc");
    runGeneration(id, bytes, ext).catch((e) => {
      console.error("Regenerate async error:", e);
    });

    return NextResponse.json({ success: true, status: "queued" });
  } catch (e) {
    console.error("Regenerate error:", e);
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan server";
    return apiError(msg, 500);
  }
}
