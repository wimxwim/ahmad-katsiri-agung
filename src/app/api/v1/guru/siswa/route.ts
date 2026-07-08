import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import { siswaKursus, kursus, users } from "@/lib/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return apiError("Silakan login terlebih dahulu", 401);
    }
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success || (_ar.data.role !== "guru" && _ar.data.role !== "owner")) {
      return apiError("Hanya guru yang dapat mengakses daftar siswa", 403);
    }
    const session = _ar.data;

    const rl = await checkRateLimit(`guru-siswa:${session.userId}`, 20, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const allKursus = await db
      .select({ id: kursus.id })
      .from(kursus)
      .where(eq(kursus.guruId, session.userId!));

    const kursusIds = allKursus.map((k) => k.id);

    if (!kursusIds.length) {
      return NextResponse.json({ data: [] });
    }

    const enrolledSiswa = await db
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

    const filtered = enrolledSiswa;

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
    });
  } catch (e) {
    console.error("Guru siswa error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
