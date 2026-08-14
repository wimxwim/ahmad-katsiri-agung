import { NextRequest, NextResponse } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { materiPublished, siswaKursus, materiRead, aiGeneration, siswaKelas, kelas } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const rl = await checkRateLimit(`siswa-materi-list:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const filterKursusId = request.nextUrl.searchParams.get("kursusId");

    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.status, "AKTIF")));
    const enrolledIds = enrollments.map((e) => e.kursusId);
    if (enrolledIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const targetIds = filterKursusId && enrolledIds.includes(filterKursusId)
      ? [filterKursusId]
      : enrolledIds;

    const siswaKelasRows = await db
      .select({ kelasId: siswaKelas.kelasId })
      .from(siswaKelas)
      .where(eq(siswaKelas.siswaId, session.userId!));
    const tingkatSiswa = new Set<number>();
    if (siswaKelasRows.length > 0) {
      const kelasRows = await db
        .select({ tingkat: kelas.tingkat })
        .from(kelas)
        .where(inArray(kelas.id, siswaKelasRows.map((sk) => sk.kelasId)));
      for (const kr of kelasRows) tingkatSiswa.add(kr.tingkat);
    }

    const materiList = await db
      .select({
        id: materiPublished.id,
        judul: materiPublished.judul,
        ringkasan: materiPublished.ringkasan,
        urutan: materiPublished.urutan,
        kursusId: materiPublished.kursusId,
        guruId: materiPublished.guruId,
        publishedAt: materiPublished.publishedAt,
        aiGenerationId: materiPublished.aiGenerationId,
        tingkat: aiGeneration.tingkat,
      })
      .from(materiPublished)
      .leftJoin(aiGeneration, eq(materiPublished.aiGenerationId, aiGeneration.id))
      .where(inArray(materiPublished.kursusId, targetIds))
      .orderBy(asc(materiPublished.urutan));

    const visibleMateriList = materiList.filter(
      (m) => tingkatSiswa.size === 0 || m.tingkat == null || tingkatSiswa.has(m.tingkat),
    );

    const materiIds = visibleMateriList.map((m) => m.id);
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

    const data = visibleMateriList.map((m) => {
      let ringkasanParsed: string | null = m.ringkasan as unknown as string | null;
      if (typeof ringkasanParsed === "string" && ringkasanParsed.trim().startsWith("{")) {
        try {
          const p = JSON.parse(ringkasanParsed) as Record<string, unknown>;
          if (p && typeof p === "object" && !Array.isArray(p)) {
            const cand = (p.ringkasan ?? p.text ?? p.summary) as unknown;
            if (typeof cand === "string" && (cand as string).trim()) ringkasanParsed = cand as string;
          } else if (typeof p === "string" && (p as string).trim()) {
            ringkasanParsed = p as string;
          }
        } catch {}
      }
      return {
        ...m,
        ringkasan: ringkasanParsed,
        sudahDibaca: readMap.has(m.id),
        selesai: readMap.get(m.id)?.selesai ?? false,
        progressPersen: readMap.get(m.id)?.progressPersen ?? 0,
      };
    });

    const response = NextResponse.json({ data });
    response.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
    return response;
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa materi list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
