import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { siswaKursus, kursus, users } from "@/lib/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimit(`guru-siswa:${session.userId}`, 20, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const filterKursusId = request.nextUrl.searchParams.get("kursusId");

    const allKursus = await db
      .select({ id: kursus.id, judul: kursus.judul })
      .from(kursus)
      .where(eq(kursus.guruId, session.userId!));

    const kursusIds = allKursus.map((k) => k.id);

    if (!kursusIds.length) {
      return NextResponse.json({ data: [], kursusOptions: [] });
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

    const enrolledSiswa = await query;

    const filtered = filterKursusId
      ? enrolledSiswa.filter((item) => item.kursusId === filterKursusId)
      : enrolledSiswa;

    const siswaMap = new Map<string, { siswaId: string; nama: string; kursus: string[]; status: string; tanggalDaftar: Date | null }>();
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
        });
      }
    }

    return NextResponse.json({
      data: Array.from(siswaMap.values()),
      total: siswaMap.size,
      kursusOptions: allKursus,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru siswa error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
