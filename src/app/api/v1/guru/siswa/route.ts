import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { siswaKursus, kursus, users, riskSnapshot } from "@/lib/db/schema";
import { and, eq, inArray, isNull, desc } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimit(`guru-siswa:${session.userId}`, 20, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const filterKursusId = request.nextUrl.searchParams.get("kursusId");
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50", 10), 200);
    const offset = Math.max(parseInt(request.nextUrl.searchParams.get("offset") || "0", 10), 0);

    const allKursus = await db
      .select({ id: kursus.id, judul: kursus.judul })
      .from(kursus)
      .where(eq(kursus.guruId, session.userId!));

    const kursusIds = allKursus.map((k) => k.id);

    if (!kursusIds.length) {
      return NextResponse.json({ data: [], kursusOptions: [] }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
    }

    let query = db
      .select({
        siswaId: siswaKursus.siswaId,
        nama: users.nama,
        kursusId: siswaKursus.kursusId,
        judulKursus: kursus.judul,
        status: siswaKursus.status,
        tanggalDaftar: siswaKursus.tanggalDaftar,
      })
      .from(siswaKursus)
      .where(inArray(siswaKursus.kursusId, kursusIds))
      .leftJoin(users, and(eq(siswaKursus.siswaId, users.id), isNull(users.deletedAt)))
      .leftJoin(kursus, eq(siswaKursus.kursusId, kursus.id));

    const enrolledSiswa = await query.limit(limit).offset(offset);

    const allSiswaIds = [...new Set(enrolledSiswa.map((s) => s.siswaId))];
    const latestRisk = allSiswaIds.length > 0
      ? await db
          .selectDistinctOn([riskSnapshot.siswaId], {
            siswaId: riskSnapshot.siswaId,
            riskScore: riskSnapshot.riskScore,
            status: riskSnapshot.status,
          })
          .from(riskSnapshot)
          .where(
            and(
              inArray(riskSnapshot.siswaId, allSiswaIds),
              inArray(riskSnapshot.kursusId, kursusIds),
            ),
          )
          .orderBy(riskSnapshot.siswaId, desc(riskSnapshot.snapshotDate))
      : [];

    const riskMap = new Map(latestRisk.map((r) => [r.siswaId, { riskScore: r.riskScore, status: r.status }]));

    const filtered = filterKursusId
      ? enrolledSiswa.filter((item) => item.kursusId === filterKursusId)
      : enrolledSiswa;

    const siswaMap = new Map<string, { siswaId: string; nama: string; kursus: string[]; status: string; tanggalDaftar: Date | null; riskScore: number | null; riskStatus: string | null }>();
    for (const item of filtered) {
      const jk = item.judulKursus ?? "-";
      const existing = siswaMap.get(item.siswaId);
      if (existing) {
        if (!existing.kursus.includes(jk)) {
          existing.kursus.push(jk);
        }
      } else {
        siswaMap.set(item.siswaId, {
          siswaId: item.siswaId,
          nama: item.nama ?? "-",
          kursus: [jk],
          status: item.status,
          tanggalDaftar: item.tanggalDaftar,
          riskScore: riskMap.get(item.siswaId)?.riskScore ?? null,
          riskStatus: riskMap.get(item.siswaId)?.status ?? null,
        });
      }
    }

    return NextResponse.json({
      data: Array.from(siswaMap.values()),
      total: siswaMap.size,
      kursusOptions: allKursus,
    }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru siswa error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
