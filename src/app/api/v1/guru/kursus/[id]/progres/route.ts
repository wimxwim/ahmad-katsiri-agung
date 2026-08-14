import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users, kursus, siswaKursus, quizPublished, quizAttempt } from "@/lib/db/schema";
import { and, eq, inArray, sql, count } from "drizzle-orm";
import { requireRole, GuardError } from "@/lib/route-guard-v2";
import { KKM } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole(request, ["guru", "owner"]);

    const rl = await checkRateLimit(`guru-kursus-progres:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id: kursusId } = await params;

    const [kursusData] = await db
      .select()
      .from(kursus)
      .where(and(eq(kursus.id, kursusId), eq(kursus.guruId, session.userId!)));

    if (!kursusData) return apiError("Kursus tidak ditemukan", 404);

    const enrolled = await db
      .select({ siswaId: siswaKursus.siswaId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.kursusId, kursusId), eq(siswaKursus.status, "AKTIF")));

    const siswaIds = enrolled.map((e) => e.siswaId);

    const siswaList = siswaIds.length
      ? await db
          .select({ id: users.id, nama: users.nama, kelas: users.kelas, noAbsen: users.noAbsen })
          .from(users)
          .where(inArray(users.id, siswaIds))
      : [];

    const quizPubs = await db
      .select()
      .from(quizPublished)
      .where(eq(quizPublished.kursusId, kursusId));

    const quizPubIds = quizPubs.map((q) => q.id);

    // F2-2: GROUP BY di DB, hapus allAttempts.filter + sort per siswa O(N×M)
    type GroupedRow = {
      siswaId: string;
      totalAttempt: number;
      totalSelesai: number;
      rataNilai: number | null;
      latestAttempt: Date | null;
    };

    let groupedRows: GroupedRow[] = [];
    if (quizPubIds.length > 0) {
      const rows = await db
        .select({
          siswaId: quizAttempt.siswaId,
          totalAttempt: count(sql`1`).as("totalAttempt"),
          totalSelesai: sql<number>`count(case when ${quizAttempt.status} in ('SELESAI','BELAJAR') then 1 end)`.as("totalSelesai"),
          rataNilai: sql<number | null>`round(avg(case when ${quizAttempt.status} in ('SELESAI','BELAJAR') then ${quizAttempt.nilai} end))`.as("rataNilai"),
          latestAttempt: sql<Date | null>`max(${quizAttempt.waktuMulai})`.as("latestAttempt"),
        })
        .from(quizAttempt)
        .where(inArray(quizAttempt.quizPublishedId, quizPubIds))
        .groupBy(quizAttempt.siswaId);
      groupedRows = rows as unknown as GroupedRow[];
    }

    const groupedMap = new Map<string, GroupedRow>();
    for (const r of groupedRows) groupedMap.set(r.siswaId, r);

    const totalAttemptAll = groupedRows.reduce((s, r) => s + Number(r.totalAttempt), 0);

    const siswaProgres = siswaList.map((s) => {
      const g = groupedMap.get(s.id);
      const totalAttempt = g ? Number(g.totalAttempt) : 0;
      const totalSelesai = g ? Number(g.totalSelesai) : 0;
      const rataNilai = g && g.rataNilai != null ? Number(g.rataNilai) : null;

      return {
        siswaId: s.id,
        nama: s.nama,
        kelas: s.kelas,
        noAbsen: s.noAbsen,
        totalAttempt,
        totalSelesai,
        rataNilai,
        tuntas: rataNilai !== null ? rataNilai >= KKM : false,
        latestAttempt: g?.latestAttempt ?? null,
      };
    });

    siswaProgres.sort((a, b) => {
      if ((a.rataNilai ?? -1) !== (b.rataNilai ?? -1)) {
        return (a.rataNilai ?? -1) - (b.rataNilai ?? -1);
      }
      return a.nama.localeCompare(b.nama);
    });

    return NextResponse.json({
      data: {
        kursus: { id: kursusData.id, judul: kursusData.judul },
        totalSiswa: siswaList.length,
        totalQuiz: quizPubs.length,
        totalAttempt: totalAttemptAll,
        siswaProgres,
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kursus progres error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
