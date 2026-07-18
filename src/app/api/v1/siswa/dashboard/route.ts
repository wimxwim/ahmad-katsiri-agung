import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import {
  users,
  materiPublished,
  materiRead,
  siswaKursus,
  kursus,
  pengumuman,
} from "@/lib/db/schema";
import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { withRetry } from "@/lib/retry";
import { fetchQuizList } from "@/lib/quiz-helpers";

export const runtime = "nodejs";

interface StudentScope {
  enrolledIds: string[];
  kursusMap: Map<string, { id: string; judul: string; slug: string }>;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const rl = await checkRateLimit(`siswa-dashboard:${session.userId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const scope = await loadStudentScope(session.userId);

    const results = await Promise.allSettled([
      fetchProfil(session.userId),
      fetchFeed(scope, session.userId),
      fetchQuiz(scope, session.userId),
      fetchPengumuman(scope),
    ]);

    const profil    = results[0].status === "fulfilled" ? results[0].value : null;
    const feed      = results[1].status === "fulfilled" ? results[1].value : { data: [], continueLearning: null, totalKursus: 0, totalMateri: 0, totalSelesai: 0, terdaftar: false };
    const quiz      = results[2].status === "fulfilled" ? results[2].value : { data: [], totalAttempt: 0 };
    const pengumumanData = results[3].status === "fulfilled" ? results[3].value : { data: [] };

    const result = { profil, feed, quiz, pengumuman: pengumumanData };

    return NextResponse.json({ data: result }, {
      headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Dashboard siswa error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

async function loadStudentScope(userId: string): Promise<StudentScope> {
  return withRetry(async () => {
    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, userId), eq(siswaKursus.status, "AKTIF")));

    const enrolledIds = enrollments.map((e) => e.kursusId);

    const kursusMap = new Map<string, { id: string; judul: string; slug: string }>();
    if (enrolledIds.length > 0) {
      const kursusRows = await db
        .select({ id: kursus.id, judul: kursus.judul, slug: kursus.slug })
        .from(kursus)
        .where(inArray(kursus.id, enrolledIds));
      for (const k of kursusRows) {
        kursusMap.set(k.id, k);
      }
    }

    return { enrolledIds, kursusMap };
  });
}

async function fetchProfil(userId: string) {
  return withRetry(async () => {
    const result = await db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        role: users.role,
        kelas: users.kelas,
        noAbsen: users.noAbsen,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!result.length) return null;
    const u = result[0];
    return {
      id: u.id,
      nama: u.nama,
      email: u.email,
      role: u.role,
      kelas: u.kelas || undefined,
      noAbsen: u.noAbsen || undefined,
      createdAt: u.createdAt.toISOString(),
    };
  });
}

async function fetchFeed(scope: StudentScope, userId: string) {
  return withRetry(async () => {
    if (scope.enrolledIds.length === 0) {
      return {
        data: [],
        continueLearning: null,
        totalKursus: 0,
        totalMateri: 0,
        totalSelesai: 0,
        terdaftar: false,
      };
    }

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
      .where(inArray(materiPublished.kursusId, scope.enrolledIds))
      .orderBy(asc(materiPublished.kursusId), asc(materiPublished.urutan))
      .limit(50);

    const readMap = new Map<string, { readAt: Date; progress: number; selesai: boolean }>();
    if (materiList.length > 0) {
      const reads = await db
        .select({
          materiPublishedId: materiRead.materiPublishedId,
          readAt: materiRead.readAt,
          progressPersen: materiRead.progressPersen,
          selesai: materiRead.selesai,
        })
        .from(materiRead)
        .where(
          and(
            eq(materiRead.siswaId, userId),
            inArray(materiRead.materiPublishedId, materiList.map((m) => m.id)),
          ),
        );
      for (const r of reads) {
        readMap.set(r.materiPublishedId, { readAt: r.readAt, progress: r.progressPersen, selesai: r.selesai });
      }
    }

    const enriched = materiList.map((m) => {
      const read = readMap.get(m.id);
      const k = scope.kursusMap.get(m.kursusId);
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

    return {
      data: enriched,
      continueLearning,
      totalKursus: scope.kursusMap.size,
      totalMateri: enriched.length,
      totalSelesai,
      terdaftar: true,
    };
  });
}

async function fetchQuiz(scope: StudentScope, userId: string) {
  return withRetry(() => fetchQuizList(scope.enrolledIds, userId));
}

async function fetchPengumuman(scope: StudentScope) {
  return withRetry(async () => {
    if (scope.enrolledIds.length === 0) return { data: [] };

    const rows = await db
      .select({
        id: pengumuman.id,
        judul: pengumuman.judul,
        konten: pengumuman.konten,
        target: pengumuman.target,
        kursusId: pengumuman.kursusId,
        guruId: pengumuman.guruId,
        publishedAt: pengumuman.publishedAt,
        isPinned: pengumuman.isPinned,
        guruNama: users.nama,
      })
      .from(pengumuman)
      .leftJoin(users, eq(pengumuman.guruId, users.id))
      .where(or(eq(pengumuman.target, "SEMUA"), inArray(pengumuman.kursusId, scope.enrolledIds)))
      .orderBy(desc(pengumuman.isPinned), desc(pengumuman.publishedAt))
      .limit(20);

    return { data: rows };
  });
}