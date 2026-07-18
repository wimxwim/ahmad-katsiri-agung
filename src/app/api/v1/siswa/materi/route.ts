import { NextRequest, NextResponse } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { materiPublished, siswaKursus, materiRead } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const rl = await checkRateLimit(`siswa-materi-list:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const filterKursusId = request.nextUrl.searchParams.get("kursusId");

    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.status, "AKTIF")));
    const enrolledIds = enrollments.map((e) => e.kursusId);
    if (enrolledIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const targetIds = filterKursusId && enrolledIds.includes(filterKursusId)
      ? [filterKursusId]
      : enrolledIds;

    const materiList = await db
      .select({
        id: materiPublished.id,
        judul: materiPublished.judul,
        ringkasan: materiPublished.ringkasan,
        urutan: materiPublished.urutan,
        kursusId: materiPublished.kursusId,
        guruId: materiPublished.guruId,
        publishedAt: materiPublished.publishedAt,
        aiGenerationId: materiPublished.aiGenerationId,
      })
      .from(materiPublished)
      .where(inArray(materiPublished.kursusId, targetIds))
      .orderBy(asc(materiPublished.urutan));

    const materiIds = materiList.map((m) => m.id);
    const reads = await db
      .select()
      .from(materiRead)
      .where(
        and(
          eq(materiRead.siswaId, session.userId!),
          inArray(materiRead.materiPublishedId, materiIds),
        ),
      );
    const readMap = new Map(reads.map((r) => [r.materiPublishedId, r]));

    const data = materiList.map((m) => ({
      ...m,
      sudahDibaca: readMap.has(m.id),
      selesai: readMap.get(m.id)?.selesai ?? false,
      progressPersen: readMap.get(m.id)?.progressPersen ?? 0,
    }));

    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa materi list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
