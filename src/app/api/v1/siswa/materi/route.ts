import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { materiPublished, siswaKursus, materiRead } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const session = await verifySession(sessionCookie.value);
    if (!session) return apiError("Sesi tidak valid", 401);
    if (session.role !== "murid" && session.role !== "orang_tua") {
      return apiError("Hanya siswa yang dapat melihat materi", 403);
    }

    const rl = await checkRateLimit(`siswa-materi-list:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId, judul: siswaKursus.status })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.status, "AKTIF")));
    const enrolledIds = enrollments.map((e) => e.kursusId);
    if (enrolledIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const materiList = await db
      .select()
      .from(materiPublished)
      .where(inArray(materiPublished.kursusId, enrolledIds))
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
    console.error("Siswa materi list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
