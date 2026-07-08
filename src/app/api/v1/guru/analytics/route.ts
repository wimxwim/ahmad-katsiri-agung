import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import { kursus, siswaKursus, quizSession, eventStore } from "@/lib/db/schema";
import { and, eq, gte, sql, like } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = _ar && _ar.success ? _ar.data : null;
  if (!session || (session.role !== "guru" && session.role !== "owner")) {
    return NextResponse.json({ data: null, error: "Hanya guru yang dapat melihat analytics" }, { status: 403 });
  }

  const guruId = session.userId!;

  const [kursusList, siswaList, draftsList, kuisList] = await Promise.all([
    db
      .select({ id: kursus.id })
      .from(kursus)
      .where(eq(kursus.guruId, guruId)),
    db
      .selectDistinct({ siswaId: siswaKursus.siswaId })
      .from(siswaKursus)
      .innerJoin(kursus, eq(siswaKursus.kursusId, kursus.id))
      .where(eq(kursus.guruId, guruId)),
    db
      .select({ id: eventStore.id })
      .from(eventStore)
      .where(
        and(
          eq(eventStore.streamId, `upload:${guruId}`),
          like(eventStore.eventType, "doc.%"),
        ),
      ),
    db
      .select({ id: quizSession.id })
      .from(quizSession)
      .innerJoin(kursus, eq(quizSession.kursusId, kursus.id))
      .where(and(eq(kursus.guruId, guruId), eq(quizSession.isActive, true))),
  ]);

  const trend: { minggu: string; total: number }[] = [];
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - 7 * (i + 1));
    const end = new Date(now);
    end.setDate(now.getDate() - 7 * i);

    const weekEvents = await db
      .select({ id: eventStore.id })
      .from(eventStore)
      .where(
        and(
          eq(eventStore.streamId, `upload:${guruId}`),
          gte(eventStore.createdAt, start),
          sql`${eventStore.createdAt} < ${end}`,
        ),
      );

    const label = `Minggu ${4 - i}`;
    trend.push({ minggu: label, total: weekEvents.length });
  }

  return NextResponse.json({
    data: {
      totalKursus: kursusList.length,
      totalSiswa: siswaList.length,
      totalDraft: draftsList.length,
      totalKuisAktif: kuisList.length,
      trend,
    },
  });
}
