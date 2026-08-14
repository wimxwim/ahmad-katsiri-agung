import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { siswaKursus, kursus, users, riskSnapshot } from "@/lib/db/schema";
import { and, eq, inArray, isNull, desc, countDistinct, sql } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { cacheGet, cacheSet } from "@/lib/cache-layer";

export const runtime = "nodejs";

const SiswaQuerySchema = z.object({
  kursusId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`siswa-list:${session.userId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const parsed = SiswaQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Parameter tidak valid", 400);
    }
    const { kursusId, limit, offset } = parsed.data;

    // F2-5: unified Redis cache per kursusId TTL 30s
    const cacheKey = `siswa:guru:${session.userId}:kursus:${kursusId ?? "all"}:limit:${limit}:offset:${offset}`;
    const cached = await cacheGet<{ data: unknown[]; total: number; kursusOptions: unknown[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
    }

    const allKursus = await db
      .select({ id: kursus.id, judul: kursus.judul })
      .from(kursus)
      .where(eq(kursus.guruId, session.userId!));

    const kursusIds = allKursus.map((k) => k.id);

    if (!kursusIds.length) {
      return NextResponse.json({ data: [], kursusOptions: [], total: 0 }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
    }

    // F2-3: chunk IN (500 uuid) per 100 untuk kursusIds
    const kursusIdChunks = kursusIds.length > 100 ? chunk(kursusIds, 100) : [kursusIds];

    // Build base where - kursusId filter pushed to SQL (not JS)
    // When chunking, we need to OR across chunks; use sql helper for chunked inArray
    const buildChunkedWhere = () => {
      if (kursusIds.length <= 100) {
        return kursusId
          ? and(inArray(siswaKursus.kursusId, kursusIds), eq(siswaKursus.status, "AKTIF"), eq(siswaKursus.kursusId, kursusId))
          : and(inArray(siswaKursus.kursusId, kursusIds), eq(siswaKursus.status, "AKTIF"));
      }
      // chunked: (kursusId IN chunk1 OR kursusId IN chunk2 ...) AND status=AKTIF AND (kursusId=filter if any)
      const chunkConditions = kursusIdChunks.map((c) => inArray(siswaKursus.kursusId, c));
      const chunkOr = chunkConditions.length === 1 ? chunkConditions[0] : sql`(${sql.join(chunkConditions, sql` OR `)})`;
      return kursusId
        ? and(chunkOr, eq(siswaKursus.status, "AKTIF"), eq(siswaKursus.kursusId, kursusId))
        : and(chunkOr, eq(siswaKursus.status, "AKTIF"));
    };

    const baseWhere = buildChunkedWhere();

    // Total distinct siswa count before dedup (separate query)
    // For chunked case, countDistinct still works via OR; no need to split
    const totalRow = await db
      .select({ count: countDistinct(siswaKursus.siswaId) })
      .from(siswaKursus)
      .where(baseWhere);
    const totalDistinct = Number(totalRow[0]?.count ?? 0);

    // Pagination after dedup: use subquery with distinct siswaId
    // Step 1: get paginated distinct siswaIds
    const distinctSiswaIds = await db
      .selectDistinct({ siswaId: siswaKursus.siswaId })
      .from(siswaKursus)
      .where(baseWhere)
      .limit(limit)
      .offset(offset);

    const paginatedIds = distinctSiswaIds.map((r) => r.siswaId);

    if (paginatedIds.length === 0) {
      const emptyResult = {
        data: [],
        total: totalDistinct,
        kursusOptions: allKursus,
      };
      await cacheSet(cacheKey, emptyResult, 30);
      return NextResponse.json(emptyResult, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
    }

    // Step 2: fetch full rows for paginated siswaIds (dedup-aware) - chunk paginatedIds if >100
    const paginatedChunks = paginatedIds.length > 100 ? chunk(paginatedIds, 100) : [paginatedIds];
    const kursusWhereForEnrolled = kursusIds.length > 100
      ? sql`(${sql.join(kursusIdChunks.map((c) => inArray(siswaKursus.kursusId, c)), sql` OR `)})`
      : inArray(siswaKursus.kursusId, kursusIds);

    let enrolledSiswa: { siswaId: string; nama: string | null; kursusId: string; judulKursus: string | null; status: string; tanggalDaftar: Date | null }[] = [];
    for (const pChunk of paginatedChunks) {
      const rows = await db
        .select({
          siswaId: siswaKursus.siswaId,
          nama: users.nama,
          kursusId: siswaKursus.kursusId,
          judulKursus: kursus.judul,
          status: siswaKursus.status,
          tanggalDaftar: siswaKursus.tanggalDaftar,
        })
        .from(siswaKursus)
        .where(and(inArray(siswaKursus.siswaId, pChunk), kursusWhereForEnrolled as unknown as ReturnType<typeof eq>, eq(siswaKursus.status, "AKTIF"), kursusId ? eq(siswaKursus.kursusId, kursusId) : undefined))
        .leftJoin(users, and(eq(siswaKursus.siswaId, users.id), isNull(users.deletedAt)))
        .leftJoin(kursus, eq(siswaKursus.kursusId, kursus.id));
      enrolledSiswa.push(...(rows as typeof enrolledSiswa));
    }

    const allSiswaIds = [...new Set(enrolledSiswa.map((s) => s.siswaId))];
    // riskSnapshot also chunk kursusIds if >100
    let latestRisk: { siswaId: string; riskScore: number | null; status: string | null }[] = [];
    if (allSiswaIds.length > 0) {
      const siswaIdChunks = allSiswaIds.length > 100 ? chunk(allSiswaIds, 100) : [allSiswaIds];
      for (const sChunk of siswaIdChunks) {
        for (const kChunk of kursusIdChunks) {
          const rows = await db
            .selectDistinctOn([riskSnapshot.siswaId], {
              siswaId: riskSnapshot.siswaId,
              riskScore: riskSnapshot.riskScore,
              status: riskSnapshot.status,
            })
            .from(riskSnapshot)
            .where(
              and(
                inArray(riskSnapshot.siswaId, sChunk),
                inArray(riskSnapshot.kursusId, kChunk),
              ),
            )
            .orderBy(riskSnapshot.siswaId, desc(riskSnapshot.snapshotDate));
          latestRisk.push(...(rows as typeof latestRisk));
        }
      }
      // deduplicate by siswaId keeping latest (already ordered desc, first wins)
      const seen = new Set<string>();
      const deduped: typeof latestRisk = [];
      for (const r of latestRisk) {
        if (!seen.has(r.siswaId)) {
          seen.add(r.siswaId);
          deduped.push(r);
        }
      }
      latestRisk = deduped;
    }

    const riskMap = new Map(latestRisk.map((r) => [r.siswaId, { riskScore: r.riskScore, status: r.status }]));

    const siswaMap = new Map<string, { siswaId: string; nama: string; kursus: string[]; status: string; tanggalDaftar: Date | null; riskScore: number | null; riskStatus: string | null }>();
    for (const item of enrolledSiswa) {
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

    const result = {
      data: Array.from(siswaMap.values()),
      total: totalDistinct,
      kursusOptions: allKursus,
    };
    await cacheSet(cacheKey, result, 30);
    return NextResponse.json(result, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru siswa error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
