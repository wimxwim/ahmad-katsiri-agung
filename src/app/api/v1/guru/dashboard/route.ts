import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import {
  kursus,
  siswaKursus,
  aiGeneration,
  quizPublished,
  quizAttempt,
  materiPublished,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = _ar && _ar.success ? _ar.data : null;
  if (!session || (session.role !== "guru" && session.role !== "owner")) {
    return NextResponse.json({ data: null, error: "Hanya guru" }, { status: 403 });
  }

  const guruId = session.userId!;

  const [kursusRows, draftRows, enrolledRows, quizPubRows, quizAttemptRows, materiPubRows] =
    await Promise.all([
      db
        .select({ id: kursus.id, judul: kursus.judul, slug: kursus.slug, deskripsi: kursus.deskripsi, statusPublikasi: kursus.statusPublikasi })
        .from(kursus)
        .where(eq(kursus.guruId, guruId)),

      db
        .select({ id: aiGeneration.id })
        .from(aiGeneration)
        .where(and(eq(aiGeneration.guruId, guruId), eq(aiGeneration.status, "ready"))),

      db
        .selectDistinct({ siswaId: siswaKursus.siswaId })
        .from(siswaKursus)
        .innerJoin(kursus, eq(siswaKursus.kursusId, kursus.id))
        .where(eq(kursus.guruId, guruId)),

      db
        .select({ id: quizPublished.id, kursusId: quizPublished.kursusId })
        .from(quizPublished)
        .innerJoin(kursus, eq(quizPublished.kursusId, kursus.id))
        .where(eq(kursus.guruId, guruId)),

      db
        .selectDistinct({ siswaId: quizAttempt.siswaId })
        .from(quizAttempt)
        .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
        .innerJoin(kursus, eq(quizPublished.kursusId, kursus.id))
        .where(eq(kursus.guruId, guruId)),

      db
        .select({ id: materiPublished.id })
        .from(materiPublished)
        .innerJoin(kursus, eq(materiPublished.kursusId, kursus.id))
        .where(eq(kursus.guruId, guruId)),
    ]);

  const totalSiswa = enrolledRows.length;
  const siswaYangPunyaAttempt = quizAttemptRows.length;

  return NextResponse.json({
    data: {
      totalKursus: kursusRows.length,
      totalSiswa,
      draftMenunggu: draftRows.length,
      totalKuisDikerjakan: 0,
      siswaBelumMengerjakan: totalSiswa - siswaYangPunyaAttempt,
      totalMateriPublished: materiPubRows.length,
      totalQuizPublished: quizPubRows.length,
      kursusList: kursusRows,
    },
  });
}
