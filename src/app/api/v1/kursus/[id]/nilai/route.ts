import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import {
  quizAttempt,
  quizPublished,
  quizViolation,
  users,
  kursus,
  jawabanLog,
  soalPublished,
  aiGeneration,
} from "@/lib/db/schema";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { requireRole, GuardError } from "@/lib/route-guard-v2";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole(req, ["guru", "owner", "murid"]);

    const rl = await checkRateLimit(`kursus-nilai:${session.userId}`, 20, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;
    const kursusData = await db.select({ guruId: kursus.guruId }).from(kursus).where(eq(kursus.id, id)).limit(1);
    if (!kursusData.length) {
      return apiError("Kursus tidak ditemukan", 404);
    }

    const isOwner = session.role === "owner";
    const isGuruOfCourse = session.role === "guru" && kursusData[0].guruId === session.userId;

    if (!isOwner && !isGuruOfCourse) {
      if (session.role === "murid") {
        const attempts = await db
          .select({
            id: quizAttempt.id,
            siswaId: quizAttempt.siswaId,
            nilai: quizAttempt.nilai,
            jumlahBenar: quizAttempt.jumlahBenar,
            jumlahSalah: quizAttempt.jumlahSalah,
            durasiDetik: quizAttempt.durasiDetik,
            waktuSelesai: quizAttempt.waktuSelesai,
            status: quizAttempt.status,
            quizJudul: quizPublished.judul,
            nama: users.nama,
          })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .leftJoin(users, and(eq(quizAttempt.siswaId, users.id), isNull(users.deletedAt)))
          .where(and(eq(quizPublished.kursusId, id), eq(quizAttempt.siswaId, session.userId)));
        return NextResponse.json({ data: attempts, total: attempts.length });
      }
      return apiError("Anda tidak memiliki akses ke kursus ini", 403);
    }

    const quizList = await db
      .select({ id: quizPublished.id })
      .from(quizPublished)
      .where(eq(quizPublished.kursusId, id));

    const quizIds = quizList.map((q) => q.id);

    if (quizIds.length === 0) {
      return NextResponse.json({ data: [], total: 0 });
    }

    const violations = await db
      .select({
        siswaId: quizViolation.siswaId,
        quizPublishedId: quizViolation.quizPublishedId,
      })
      .from(quizViolation)
      .where(inArray(quizViolation.quizPublishedId, quizIds));
    const violationMap = new Map<string, number>();
    for (const v of violations) {
      const key = `${v.siswaId}:${v.quizPublishedId}`;
      violationMap.set(key, (violationMap.get(key) || 0) + 1);
    }

    const attempts = await db
      .select({
        id: quizAttempt.id,
        siswaId: quizAttempt.siswaId,
        quizPublishedId: quizAttempt.quizPublishedId,
        nilai: quizAttempt.nilai,
        jumlahBenar: quizAttempt.jumlahBenar,
        jumlahSalah: quizAttempt.jumlahSalah,
        durasiDetik: quizAttempt.durasiDetik,
        waktuSelesai: quizAttempt.waktuSelesai,
        status: quizAttempt.status,
        quizJudul: quizPublished.judul,
        nama: users.nama,
      })
      .from(quizAttempt)
      .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
      .leftJoin(users, and(eq(quizAttempt.siswaId, users.id), isNull(users.deletedAt)))
      .where(inArray(quizAttempt.quizPublishedId, quizIds));

    const attemptsWithViolations = attempts.map((a) => ({
      ...a,
      pelanggaran: violationMap.get(`${a.siswaId}:${a.quizPublishedId}`) || 0,
    }));

    const latihanRows = await db
      .select({
        siswaId: jawabanLog.siswaId,
        nama: users.nama,
        soalDikerjakan: sql<number>`count(distinct ${jawabanLog.soalId})`.mapWith(Number),
        soalBenar: sql<number>`count(distinct case when ${jawabanLog.isBenar} then ${jawabanLog.soalId} end)`.mapWith(Number),
      })
      .from(jawabanLog)
      .innerJoin(soalPublished, eq(jawabanLog.soalId, soalPublished.id))
      .innerJoin(aiGeneration, eq(soalPublished.aiGenerationId, aiGeneration.id))
      .leftJoin(users, and(eq(jawabanLog.siswaId, users.id), isNull(users.deletedAt)))
      .where(and(eq(aiGeneration.kursusId, id), isNull(soalPublished.quizPublishedId)))
      .groupBy(jawabanLog.siswaId);

    return NextResponse.json({
      data: attemptsWithViolations,
      total: attemptsWithViolations.length,
      latihan: latihanRows,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Nilai error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}