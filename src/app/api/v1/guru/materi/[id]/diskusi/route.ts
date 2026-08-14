import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiValidationError } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { db } from "@/lib/db";
import { materiDiskusi, materiPublished } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const MAX_JAWABAN = 2000;

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

async function findOwnedMateri(materiId: string, guruId: string) {
  const [row] = await db
    .select({ id: materiPublished.id })
    .from(materiPublished)
    .where(and(eq(materiPublished.id, materiId), eq(materiPublished.guruId, guruId)))
    .limit(1);
  return row ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireGuru(request);

    const { id } = await params;

    const rl = await checkRateLimit(`guru-diskusi-list:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const materi = await findOwnedMateri(id, session.userId!);
    if (!materi) return apiError("Materi tidak ditemukan atau bukan milik Anda", 404);

    const items = await db
      .select()
      .from(materiDiskusi)
      .where(eq(materiDiskusi.materiId, id))
      .orderBy(asc(materiDiskusi.createdAt));

    return NextResponse.json({ data: items });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru diskusi list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const { id } = await params;

    const rl = await checkRateLimit(`guru-diskusi-reply:${session.userId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const materi = await findOwnedMateri(id, session.userId!);
    if (!materi) return apiError("Materi tidak ditemukan atau bukan milik Anda", 404);

    const body = await request.json().catch(() => null);
    const diskusiId = typeof body?.diskusiId === "string" ? body.diskusiId.trim() : "";
    const jawaban = typeof body?.jawaban === "string" ? body.jawaban.trim() : "";

    if (!diskusiId || !jawaban) {
      return apiValidationError([
        { field: "jawaban", message: "diskusiId dan jawaban wajib diisi" },
      ]);
    }
    if (jawaban.length > MAX_JAWABAN) {
      return apiValidationError([
        { field: "jawaban", message: `Jawaban maksimal ${MAX_JAWABAN} karakter` },
      ]);
    }

    const [item] = await db
      .select({ id: materiDiskusi.id })
      .from(materiDiskusi)
      .where(and(eq(materiDiskusi.id, diskusiId), eq(materiDiskusi.materiId, id)))
      .limit(1);
    if (!item) return apiError("Pertanyaan tidak ditemukan", 404);

    const sanitizedJawaban = escapeHtml(jawaban.trim().slice(0, 2000));

    await db
      .update(materiDiskusi)
      .set({ jawaban: sanitizedJawaban })
      .where(eq(materiDiskusi.id, diskusiId));

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru diskusi reply error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
