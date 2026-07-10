import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { jawabanLog, users, kursus, quizSession } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
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
        const logs = await db
          .select({
            id: jawabanLog.id,
            siswaId: jawabanLog.siswaId,
            soalId: jawabanLog.soalId,
            isBenar: jawabanLog.isBenar,
            createdAt: jawabanLog.createdAt,
            nama: users.nama,
          })
          .from(jawabanLog)
          .innerJoin(quizSession, eq(jawabanLog.quizSessionId, quizSession.id))
          .leftJoin(users, and(eq(jawabanLog.siswaId, users.id), isNull(users.deletedAt)))
          .where(eq(quizSession.kursusId, id));
        const filtered = logs.filter((l) => l.siswaId === session.userId);
        return NextResponse.json({ data: filtered, total: filtered.length });
      }
      return apiError("Anda tidak memiliki akses ke kursus ini", 403);
    }

    const logs = await db
      .select({
        id: jawabanLog.id,
        siswaId: jawabanLog.siswaId,
        soalId: jawabanLog.soalId,
        isBenar: jawabanLog.isBenar,
        createdAt: jawabanLog.createdAt,
        nama: users.nama,
      })
      .from(jawabanLog)
      .innerJoin(quizSession, eq(jawabanLog.quizSessionId, quizSession.id))
      .leftJoin(users, and(eq(jawabanLog.siswaId, users.id), isNull(users.deletedAt)))
      .where(eq(quizSession.kursusId, id));

    return NextResponse.json({ data: logs, total: logs.length });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Nilai error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
