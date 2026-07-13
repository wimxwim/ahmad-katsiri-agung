import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  quizAttempt,
  jawabanLog,
  refreshTokens,
  transaksi,
  users,
} from "@/lib/db/schema";
import { eq, and, gte, sql, desc, count } from "drizzle-orm";
import { requireOwner, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireOwner(request);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      suspiciousQuizzes,
      multipleSessions,
      failedTransactions,
      recentErrors,
      userStats,
    ] = await Promise.all([
      db
        .select({
          id: quizAttempt.id,
          siswaId: quizAttempt.siswaId,
          quizPublishedId: quizAttempt.quizPublishedId,
          nilai: quizAttempt.nilai,
          durasiDetik: quizAttempt.durasiDetik,
          waktuMulai: quizAttempt.waktuMulai,
          status: quizAttempt.status,
          namaSiswa: users.nama,
          email: users.email,
        })
        .from(quizAttempt)
        .innerJoin(users, eq(quizAttempt.siswaId, users.id))
        .where(
          and(
            gte(quizAttempt.waktuMulai, oneDayAgo),
            sql`${quizAttempt.durasiDetik} < 60`
          )
        )
        .orderBy(desc(quizAttempt.waktuMulai))
        .limit(20),

      db
        .select({
          userId: refreshTokens.userId,
          sessionCount: count(refreshTokens.id),
          nama: users.nama,
          email: users.email,
          role: users.role,
        })
        .from(refreshTokens)
        .innerJoin(users, eq(refreshTokens.userId, users.id))
        .where(sql`${refreshTokens.revokedAt} IS NULL`)
        .groupBy(refreshTokens.userId, users.nama, users.email, users.role)
        .having(sql`count(*) > 3`)
        .orderBy(desc(count(refreshTokens.id)))
        .limit(10),

      db
        .select({
          id: transaksi.id,
          siswaId: transaksi.siswaId,
          kursusId: transaksi.kursusId,
          jumlah: transaksi.jumlah,
          status: transaksi.status,
          createdAt: transaksi.createdAt,
          namaSiswa: users.nama,
          email: users.email,
        })
        .from(transaksi)
        .innerJoin(users, eq(transaksi.siswaId, users.id))
        .where(
          and(
            gte(transaksi.createdAt, oneDayAgo),
            sql`${transaksi.status} IN ('FAILED', 'EXPIRED')`
          )
        )
        .orderBy(desc(transaksi.createdAt))
        .limit(20),

      db
        .select({
          userId: jawabanLog.siswaId,
          soalId: jawabanLog.soalId,
          jawabanSiswa: jawabanLog.jawabanSiswa,
          isBenar: jawabanLog.isBenar,
          waktuJawabDetik: jawabanLog.waktuJawabDetik,
          createdAt: jawabanLog.createdAt,
          nama: users.nama,
          email: users.email,
        })
        .from(jawabanLog)
        .innerJoin(users, eq(jawabanLog.siswaId, users.id))
        .where(
          and(
            gte(jawabanLog.createdAt, oneDayAgo),
            sql`${jawabanLog.waktuJawabDetik} < 3`
          )
        )
        .orderBy(desc(jawabanLog.createdAt))
        .limit(30),

      db
        .select({
          role: users.role,
          totalUsers: count(users.id),
        })
        .from(users)
        .groupBy(users.role),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        suspiciousQuizzes,
        multipleSessions,
        failedTransactions,
        recentErrors,
        userStats,
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof GuardError) return apiError(error.message, error.status);
    console.error("Monitoring API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data monitoring",
      },
      { status: 500 }
    );
  }
}
