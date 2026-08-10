import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import {
  quizAttempt,
  quizPublished,
  siswaKursus,
  kursus,
  jawabanLog,
  materiRead,
  skillMastery,
  skill,
} from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";

export const runtime = "nodejs";

const JAKARTA_OFFSET_MS = 7 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;

// Asia/Jakarta (UTC+7) day bucket key: YYYY-MM-DD
function dayKey(ts: Date): string {
  return new Date(ts.getTime() + JAKARTA_OFFSET_MS).toISOString().slice(0, 10);
}

function prevDayKey(key: string): string {
  return dayKey(new Date(new Date(`${key}T00:00:00.000Z`).getTime() - DAY_MS));
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const rl = await checkRateLimit(`siswa-progres:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "20", 10), 100);
    const offset = Math.max(parseInt(request.nextUrl.searchParams.get("offset") || "0", 10), 0);

    const attempts = await db
      .select({
        id: quizAttempt.id,
        quizPublishedId: quizAttempt.quizPublishedId,
        nilai: quizAttempt.nilai,
        jumlahBenar: quizAttempt.jumlahBenar,
        jumlahSalah: quizAttempt.jumlahSalah,
        durasiDetik: quizAttempt.durasiDetik,
        waktuMulai: quizAttempt.waktuMulai,
        waktuSelesai: quizAttempt.waktuSelesai,
        status: quizAttempt.status,
      })
      .from(quizAttempt)
      .where(eq(quizAttempt.siswaId, session.userId!))
      .orderBy(desc(quizAttempt.waktuMulai))
      .limit(limit)
      .offset(offset);

    const quizIds = [...new Set(attempts.map((a) => a.quizPublishedId))];
    const quizList = quizIds.length
      ? await db
          .select({
            id: quizPublished.id,
            kursusId: quizPublished.kursusId,
            judul: quizPublished.judul,
            modeEvaluasi: quizPublished.modeEvaluasi,
          })
          .from(quizPublished)
          .where(inArray(quizPublished.id, quizIds))
      : [];

    const kursusIds = [...new Set(quizList.map((q) => q.kursusId))];
    const kursusList = kursusIds.length
      ? await db
          .select({ id: kursus.id, judul: kursus.judul })
          .from(kursus)
          .where(inArray(kursus.id, kursusIds))
      : [];
    const kursusMap = new Map(kursusList.map((k) => [k.id, k.judul]));

    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.status, "AKTIF")));

    const [attemptTimes, jawabanTimes, materiTimes, masteryRows] = await Promise.all([
      db
        .select({ waktuSelesai: quizAttempt.waktuSelesai })
        .from(quizAttempt)
        .where(eq(quizAttempt.siswaId, session.userId!)),
      db
        .select({ createdAt: jawabanLog.createdAt })
        .from(jawabanLog)
        .where(eq(jawabanLog.siswaId, session.userId!)),
      db
        .select({ readAt: materiRead.readAt })
        .from(materiRead)
        .where(eq(materiRead.siswaId, session.userId!)),
      db
        .select({
          skillId: skillMastery.skillId,
          nama: skill.nama,
          pL: skillMastery.pL,
          repetitionNum: skillMastery.repetitionNum,
          nextReviewAt: skillMastery.nextReviewAt,
          urutan: skill.urutan,
        })
        .from(skillMastery)
        .innerJoin(skill, eq(skillMastery.skillId, skill.id))
        .where(eq(skillMastery.siswaId, session.userId!))
        .orderBy(skill.urutan),
    ]);

    // konsistensi: union all activity timestamps, bucket by Asia/Jakarta day
    const activityTs: Date[] = [];
    for (const a of attemptTimes) if (a.waktuSelesai) activityTs.push(a.waktuSelesai);
    for (const j of jawabanTimes) activityTs.push(j.createdAt);
    for (const m of materiTimes) activityTs.push(m.readAt);

    const dayCounts = new Map<string, number>();
    for (const ts of activityTs) {
      const k = dayKey(ts);
      dayCounts.set(k, (dayCounts.get(k) ?? 0) + 1);
    }
    const activeDays = new Set(dayCounts.keys());

    const now = new Date();
    const todayKey = dayKey(now);
    const yesterdayKey = dayKey(new Date(now.getTime() - DAY_MS));

    const mingguAktif: number[] = [];
    for (let i = 6; i >= 0; i--) {
      mingguAktif.push(dayCounts.get(dayKey(new Date(now.getTime() - i * DAY_MS))) ?? 0);
    }
    const hariAktif7 = mingguAktif.filter((c) => c > 0).length;
    const totalHariAktif = activeDays.size;

    let streakHari = 0;
    if (activeDays.has(todayKey) || activeDays.has(yesterdayKey)) {
      let cursor = activeDays.has(todayKey) ? todayKey : yesterdayKey;
      while (activeDays.has(cursor)) {
        streakHari += 1;
        cursor = prevDayKey(cursor);
      }
    }

    const masteryCps = masteryRows.map((m) => {
      const status: "Dikuasai" | "Dalam Proses" | "Perlu Remedial" =
        m.pL >= 0.7 ? "Dikuasai" : m.pL >= 0.5 ? "Dalam Proses" : "Perlu Remedial";
      return {
        skillId: m.skillId,
        nama: m.nama,
        pL: m.pL,
        repetitionNum: m.repetitionNum,
        nextReviewAt: m.nextReviewAt ? m.nextReviewAt.toISOString() : null,
        status,
        selesai: m.pL >= 0.7,
      };
    });

    const completedAttempts = attempts.filter((a) => a.status === "SELESAI" || a.status === "BELAJAR");
    const totalRata = completedAttempts.length > 0
      ? Math.round(
          completedAttempts.reduce((sum, a) => sum + (a.nilai ?? 0), 0) / completedAttempts.length,
        )
      : 0;
    const totalSelesai = attempts.filter((a) => a.status === "SELESAI" || a.status === "BELAJAR").length;

    return NextResponse.json({
      data: {
        attempts: attempts.map((a) => {
          const quiz = quizList.find((q) => q.id === a.quizPublishedId);
          const tampilkanNilai = quiz?.modeEvaluasi !== "CBT";
          return {
            ...a,
            nilai: tampilkanNilai ? a.nilai : null,
            jumlahBenar: tampilkanNilai ? a.jumlahBenar : null,
            jumlahSalah: tampilkanNilai ? a.jumlahSalah : null,
            tampilkanNilai,
            modeEvaluasi: quiz?.modeEvaluasi || "BELAJAR",
            quizJudul: quiz?.judul || "Kuis",
            kursusId: quiz?.kursusId ?? null,
            kursusJudul: quiz?.kursusId ? (kursusMap.get(quiz.kursusId) ?? null) : null,
          };
        }),
        totalKursus: enrollments.length,
        totalAttempt: attempts.length,
        totalSelesai,
        rataNilai: totalRata,
        konsistensi: {
          streakHari,
          hariAktif7,
          mingguAktif,
          totalHariAktif,
        },
        masteryCps,
      },
      limit,
      offset,
    }, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa progres error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
