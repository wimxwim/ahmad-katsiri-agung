import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { materiPublished, materiRead, siswaKursus, kursus } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success) return apiError("Sesi tidak valid", 401);
    const session = _ar.data;
    if (session.role !== "murid" && session.role !== "orang_tua") {
      return apiError("Hanya siswa yang dapat mengakses feed materi", 403);
    }

    const rl = await checkRateLimit(`siswa-feed:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const myEnrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.status, "AKTIF")));

    const enrolledIds = myEnrollments.map((e) => e.kursusId);

    if (enrolledIds.length === 0) {
      return NextResponse.json({
        data: [],
        continueLearning: null,
        totalKursus: 0,
        totalMateri: 0,
        totalSelesai: 0,
      });
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
      .orderBy(asc(materiPublished.kursusId), asc(materiPublished.urutan));

    const readMap = new Map<string, { readAt: Date; progress: number; selesai: boolean }>();
    if (materiList.length > 0) {
      const reads = await db
        .select()
        .from(materiRead)
        .where(
          and(
            eq(materiRead.siswaId, session.userId!),
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
    });
  } catch (e) {
    console.error("Feed siswa error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
