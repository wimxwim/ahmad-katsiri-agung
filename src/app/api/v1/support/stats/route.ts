import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [siswa, guru, materi] = await Promise.all([
      db.execute<{ count: number }>(sql`SELECT COUNT(*)::int as count FROM users WHERE role = 'SISWA' AND deleted_at IS NULL`),
      db.execute<{ count: number }>(sql`SELECT COUNT(*)::int as count FROM users WHERE role IN ('GURU', 'ASISTEN_GURU') AND deleted_at IS NULL`),
      db.execute<{ count: number }>(sql`SELECT COUNT(*)::int as count FROM ai_generation WHERE materi_status = 'approved'`),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        siswa: siswa.rows[0]?.count ?? 0,
        guru: guru.rows[0]?.count ?? 0,
        materi: materi.rows[0]?.count ?? 0,
      },
    });
  } catch (e) {
    console.error("Support stats error:", e);
    return NextResponse.json({ success: false, data: { siswa: 0, guru: 0, materi: 0 } });
  }
}