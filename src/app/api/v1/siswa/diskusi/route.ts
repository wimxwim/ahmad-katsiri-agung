import { NextRequest, NextResponse } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiValidationError } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { db } from "@/lib/db";
import { kursus, materiDiskusi, materiPublished, siswaKursus } from "@/lib/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

const MAX_PERTANYAAN = 2000;

interface MateriCheck {
  materi: { id: string; kursusId: string } | null;
  reason: string;
  status: number;
}

async function findMateriForSiswa(
  materiId: string,
  siswaId: string,
): Promise<MateriCheck> {
  const [row] = await db
    .select({ id: materiPublished.id, kursusId: materiPublished.kursusId })
    .from(materiPublished)
    .where(eq(materiPublished.id, materiId))
    .limit(1);
  if (!row) return { materi: null, reason: "Materi tidak ditemukan", status: 404 };

  const [enrolled] = await db
    .select({ id: siswaKursus.id })
    .from(siswaKursus)
    .where(
      and(
        eq(siswaKursus.siswaId, siswaId),
        eq(siswaKursus.kursusId, row.kursusId),
        eq(siswaKursus.status, "AKTIF"),
      ),
    )
    .limit(1);
  if (!enrolled) {
    return { materi: null, reason: "Anda belum terdaftar di kursus ini", status: 403 };
  }

  return { materi: row, reason: "", status: 200 };
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const rl = await checkRateLimit(`siswa-diskusi-global:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const siswaId = session.userId;

    const materis = await db
      .select({
        materiId: materiPublished.id,
        judul: materiPublished.judul,
        kursusJudul: kursus.judul,
      })
      .from(siswaKursus)
      .innerJoin(kursus, eq(siswaKursus.kursusId, kursus.id))
      .innerJoin(materiPublished, eq(materiPublished.kursusId, kursus.id))
      .where(and(eq(siswaKursus.siswaId, siswaId), eq(siswaKursus.status, "AKTIF")))
      .orderBy(asc(kursus.judul), asc(materiPublished.urutan));

    const items = await db
      .select({
        id: materiDiskusi.id,
        materiId: materiDiskusi.materiId,
        materiJudul: materiPublished.judul,
        kursusJudul: kursus.judul,
        userName: materiDiskusi.userName,
        role: materiDiskusi.role,
        pertanyaan: materiDiskusi.pertanyaan,
        jawaban: materiDiskusi.jawaban,
        createdAt: materiDiskusi.createdAt,
      })
      .from(materiDiskusi)
      .innerJoin(materiPublished, eq(materiDiskusi.materiId, materiPublished.id))
      .innerJoin(kursus, eq(materiPublished.kursusId, kursus.id))
      .innerJoin(
        siswaKursus,
        and(eq(siswaKursus.kursusId, kursus.id), eq(siswaKursus.siswaId, siswaId)),
      )
      .where(eq(siswaKursus.status, "AKTIF"))
      .orderBy(desc(materiDiskusi.createdAt))
      .limit(50);

    return NextResponse.json({ data: items, materis });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa diskusi global list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const rl = await checkRateLimit(`siswa-diskusi-create:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json().catch(() => null);

    const materiId = typeof body?.materiId === "string" ? body.materiId.trim() : "";
    if (!materiId) {
      return apiValidationError([{ field: "materiId", message: "Materi wajib dipilih" }]);
    }

    const pertanyaan =
      typeof body?.pertanyaan === "string" ? body.pertanyaan.trim() : "";
    if (!pertanyaan) {
      return apiValidationError([{ field: "pertanyaan", message: "Pertanyaan wajib diisi" }]);
    }
    if (pertanyaan.length > MAX_PERTANYAAN) {
      return apiValidationError([
        { field: "pertanyaan", message: `Pertanyaan maksimal ${MAX_PERTANYAAN} karakter` },
      ]);
    }

    const check = await findMateriForSiswa(materiId, session.userId);
    if (!check.materi) return apiError(check.reason, check.status);

    await db.insert(materiDiskusi).values({
      materiId,
      userId: session.userId,
      userName: session.nama || "Siswa",
      role: "SISWA",
      pertanyaan,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa diskusi global create error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
