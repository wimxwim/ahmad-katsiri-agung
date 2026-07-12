import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { requireRole } from "@/lib/route-guard-v2";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/auth-password";
import { db } from "@/lib/db";
import { users, siswaKelas, kelas } from "@/lib/db/schema";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { logAuthEvent } from "@/lib/auth-audit";

const RowSchema = z.object({
  nama: z.string().min(2).max(100),
  email: z.string().email().max(255),
  kelas: z.string().min(1).max(50).optional(),
  password: z.string().min(6).max(128).optional(),
});

const ImportSchema = z.object({
  rows: z.array(RowSchema).min(1).max(200),
  defaultKelasNama: z.string().max(50).optional(),
});

interface ImportResult {
  created: number;
  reEnrolled: number;
  skipped: { email: string; reason: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, ["guru", "owner"]);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`siswa-import:${ip}`, 3, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = ImportSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);
    }

    const defaultPassword =
      crypto.randomUUID().replace(/-/g, "").slice(0, 16) + "!Aa1";

    const emails = parsed.data.rows.map((r) => r.email.toLowerCase());
    const existing = await db
      .select({ id: users.id, email: users.email, role: users.role, nama: users.nama })
      .from(users)
      .where(and(inArray(users.email, emails), isNull(users.deletedAt)));
    const existingByEmail = new Map(existing.map((u) => [u.email.toLowerCase(), u]));

    const result: ImportResult = { created: 0, reEnrolled: 0, skipped: [] };

    for (const row of parsed.data.rows) {
      const email = row.email.toLowerCase();
      const existingUser = existingByEmail.get(email);

      let userId: string;
      if (existingUser) {
        if (existingUser.role !== "SISWA") {
          result.skipped.push({ email, reason: `email terdaftar sebagai ${existingUser.role}` });
          continue;
        }
        userId = existingUser.id;
      } else {
        const passwordHash = await hashPassword(row.password || defaultPassword);
        const [created] = await db
          .insert(users)
          .values({
            nama: row.nama,
            email,
            role: "SISWA",
            passwordHash,
            kelas: row.kelas || parsed.data.defaultKelasNama || null,
          })
          .returning({ id: users.id });
        userId = created.id;
        existingByEmail.set(email, {
          id: userId,
          email,
          role: "SISWA",
          nama: row.nama,
        });
        result.created += 1;
        await logAuthEvent("auth.register.success", {
          userId,
          email,
          method: "csv_import",
          ip,
          portal: "siswa",
        });
      }

      const targetKelasNama = row.kelas || parsed.data.defaultKelasNama;
      if (targetKelasNama) {
        const ownedKelas = await db
          .select()
          .from(kelas)
          .where(
            and(
              eq(kelas.guruId, session.userId!),
              eq(kelas.nama, targetKelasNama),
              isNull(kelas.deletedAt),
            ),
          )
          .limit(1);

        let kelasId: string;
        if (ownedKelas.length) {
          kelasId = ownedKelas[0].id;
        } else {
          const [auto] = await db
            .insert(kelas)
            .values({
              nama: targetKelasNama,
              tingkat: 7,
              guruId: session.userId!,
            })
            .returning({ id: kelas.id });
          kelasId = auto.id;
        }

        const existingRel = await db
          .select()
          .from(siswaKelas)
          .where(and(eq(siswaKelas.siswaId, userId), eq(siswaKelas.kelasId, kelasId)))
          .limit(1);

        if (!existingRel.length) {
          await db.insert(siswaKelas).values({ siswaId: userId, kelasId });
          result.reEnrolled += 1;
        }
      }
    }

    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("Siswa import error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
