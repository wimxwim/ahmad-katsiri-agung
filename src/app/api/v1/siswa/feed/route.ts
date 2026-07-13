import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { materiPublished, materiRead, siswaKursus, kursus } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const rl = await checkRateLimit(`siswa-feed:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "20", 10), 100);
    const offset = Math.max(parseInt(request.nextUrl.searchParams.get("offset") || "0", 10), 0);

    const myEnrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId), eq(siswaKursus.status, "AKTIF")));

    const enrolledIds = myEnrollments.map((e) => e.kursusId);

    if (enrolledIds.length === 0) {
      return NextResponse.json({
        data: [],
        continueLearning: null,
        totalKursus: 0,
        totalMateri: 0,
        totalSelesai: 0,
        terdaftar: false,
}, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } });
    }

    const kursusList = await db
      .select({ id: kursus.id, judul: kursus.judul, slug: kursus.slug })
      .from(kursus)
      .where(inArray(kursus.id, enrolledIds));

    const materiList = await db
      .select({
        id: materiPublished.id,
        judul: materiPublished.judul,
        ringkasan: materiPublished.ringkasan,
        kursusId: materiPublished.kursusId,
        urutan: materiPublished.urutan,
        publishedAt: materiPublished.publishedAt,
      })
      .from(materiPublished)
      .where(inArray(materiPublished.kursusId, enrolledIds))
      .orderBy(asc(materiPublished.kursusId), asc(materiPublished.urutan))
      .limit(limit)
      .offset(offset);

    const readMap = new Map<string, { readAt: Date; progress: number; selesai: boolean }>();
    if (materiList.length > 0) {
      const reads = await db
        .select({
          materiPublishedId: materiRead.materiPublishedId,
          readAt: materiRead.readAt,
          progressPersen: materiRead.progressPersen,
          selesai: materiRead.selesai,
        })
        .from(materiRead)
        .where(
          and(
            eq(materiRead.siswaId, session.userId),
            inArray(
              materiRead.materiPublishedId,
              materiList.map((m) => m.id),
            ),
          ),
        );
      for (const r of reads) {
        readMap.set(r.materiPublishedId, {
          readAt: r.readAt,
          progress: r.progressPersen,
          selesai: r.selesai,
        });
      }
    }

    const enriched = materiList.map((m) => {
      const read = readMap.get(m.id);
      const k = kursusList.find((x) => x.id === m.kursusId);
      return {
        ...m,
        kursusJudul: k?.judul || null,
        progress: read?.progress ?? 0,
        selesai: read?.selesai ?? false,
        lastReadAt: read?.readAt?.toISOString() ?? null,
      };
    });

    enriched.sort((a, b) => {
      if (a.selesai !== b.selesai) return a.selesai ? 1 : -1;
      const aRecent = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
      const bRecent = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
      if (aRecent !== bRecent) return bRecent - aRecent;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    const totalSelesai = enriched.filter((e) => e.selesai).length;
    const continueLearning = enriched.find((e) => !e.selesai) || null;

    return NextResponse.json({
      data: enriched,
      continueLearning,
      totalKursus: kursusList.length,
      totalMateri: enriched.length,
      totalSelesai,
      terdaftar: true,
      limit,
      offset,
    }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Feed siswa error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
