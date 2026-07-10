import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { materiPublished, materiRead, siswaKursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);

    const { id } = await params;
    const rl = await checkRateLimit(`siswa-materi:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [row] = await db
      .select()
      .from(materiPublished)
      .where(eq(materiPublished.id, id))
      .limit(1);
    if (!row) return apiError("Materi tidak ditemukan", 404);

    const [enrolled] = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, session.userId!),
          eq(siswaKursus.kursusId, row.kursusId),
          eq(siswaKursus.status, "AKTIF"),
        ),
      )
      .limit(1);
    if (!enrolled) return apiError("Anda belum terdaftar di kursus ini", 403);

    const [existing] = await db
      .select()
      .from(materiRead)
      .where(
        and(
          eq(materiRead.siswaId, session.userId!),
          eq(materiRead.materiPublishedId, id),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(materiRead)
        .set({ readAt: new Date() })
        .where(eq(materiRead.id, existing.id));
    } else {
      await db.insert(materiRead).values({
        siswaId: session.userId!,
        materiPublishedId: id,
      });
    }

    return NextResponse.json({ data: row });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Materi detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);

    const { id } = await params;

    const [row] = await db
      .select()
      .from(materiPublished)
      .where(eq(materiPublished.id, id))
      .limit(1);
    if (!row) return apiError("Materi tidak ditemukan", 404);

    const [enrolled] = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, session.userId!),
          eq(siswaKursus.kursusId, row.kursusId),
          eq(siswaKursus.status, "AKTIF"),
        ),
      )
      .limit(1);
    if (!enrolled) return apiError("Anda belum terdaftar di kursus ini", 403);

    const body = await request.json().catch(() => ({}));
    const progressPersen = Math.max(0, Math.min(100, Number(body?.progress ?? 100)));
    const selesai = Boolean(body?.selesai ?? progressPersen >= 100);

    const rl = await checkRateLimit(`siswa-materi-progress:${session.userId}`, 60, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [existing] = await db
      .select()
      .from(materiRead)
      .where(
        and(
          eq(materiRead.siswaId, session.userId!),
          eq(materiRead.materiPublishedId, id),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(materiRead)
        .set({ progressPersen, selesai, readAt: new Date() })
        .where(eq(materiRead.id, existing.id));
    } else {
      await db.insert(materiRead).values({
        siswaId: session.userId!,
        materiPublishedId: id,
        progressPersen,
        selesai,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Materi progress error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
