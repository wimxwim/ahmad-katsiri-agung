import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { fileMateri } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
  const session = await requireSession(request);

  const ip = ipFromRequest(request);
  const rl = await checkRateLimit(`storage:${ip}`, 60, 60_000);
  if (!rl.allowed) return apiRateLimit(rl.retryAfter);

  const { fileId } = await params;

  const [row] = await db
    .select()
    .from(fileMateri)
    .where(and(eq(fileMateri.id, fileId), eq(fileMateri.guruId, session.userId!)))
    .limit(1);

  if (!row) return apiError("File tidak ditemukan", 404);

  const adapter = await getStorageAdapter(session.userId!);
  const link = adapter.getLink(row.imagekitFileId || row.driveFileId || row.id);

  return NextResponse.redirect(link, 302);
  } catch (e) {
    console.error("Storage GET error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}