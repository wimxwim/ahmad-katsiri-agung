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
import { validateCsrf } from "@/lib/csrf-server";

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
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;
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

    const result: ImportResult = { created: 0, reEnrolled: 0, skipped: [] };

    const newUsers: { nama: string; email: string; passwordHash: string; kelas: string | null }[] = [];
    const userRowMap = new Map<string, typeof existing[number]>();
    for (const u of existing) userRowMap.set(u.email.toLowerCase(), u);

    for (const row of parsed.data.rows) {
      const email = row.email.toLowerCase();
      const existingUser = userRowMap.get(email);
      if (existingUser) {
        if (existingUser.role !== "SISWA") {
          result.skipped.push({ email, reason: `email terdaftar sebagai ${existingUser.role}` });
        }
        continue;
      }
      newUsers.push({
        nama: row.nama,
        email,
        passwordHash: row.password || defaultPassword,
        kelas: row.kelas || parsed.data.defaultKelasNama || null,
      });
    }

    if (newUsers.length > 0) {
      const passwordHashes = await Promise.all(newUsers.map((u) => hashPassword(u.passwordHash)));
      const created = await db
        .insert(users)
        .values(newUsers.map((u, i) => ({
          nama: u.nama,
          email: u.email,
          role: "SISWA" as const,
          passwordHash: passwordHashes[i],
          kelas: u.kelas,
        })))
        .returning({ id: users.id, email: users.email, nama: users.nama });
      for (const c of created) {
        userRowMap.set(c.email.toLowerCase(), { id: c.id, email: c.email, role: "SISWA", nama: c.nama });
        result.created += 1;
        await logAuthEvent("auth.register.success", {
          userId: c.id,
          email: c.email,
          method: "csv_import",
          ip,
          portal: "siswa",
        });
      }
    }

    const kelasNames = new Set<string>();
    for (const row of parsed.data.rows) {
      const email = row.email.toLowerCase();
      const existingUser = userRowMap.get(email);
      if (!existingUser || existingUser.role !== "SISWA") continue;
      const targetKelasNama = row.kelas || parsed.data.defaultKelasNama;
      if (targetKelasNama) kelasNames.add(targetKelasNama);
    }

    if (kelasNames.size > 0) {
      const existingKelas = await db
        .select({ id: kelas.id, nama: kelas.nama })
        .from(kelas)
        .where(and(
          eq(kelas.guruId, session.userId!),
          inArray(kelas.nama, [...kelasNames]),
          isNull(kelas.deletedAt),
        ));
      const kelasByName = new Map(existingKelas.map((k) => [k.nama, k.id]));

      const newKelasNames = [...kelasNames].filter((n) => !kelasByName.has(n));
      if (newKelasNames.length > 0) {
        const createdKelas = await db
          .insert(kelas)
          .values(newKelasNames.map((nama) => ({ nama, tingkat: 7, guruId: session.userId! })))
          .returning({ id: kelas.id, nama: kelas.nama });
        for (const k of createdKelas) kelasByName.set(k.nama, k.id);
      }

      const relToInsert: { siswaId: string; kelasId: string }[] = [];
      const seenRels = new Set<string>();

      const existingRels = await db
        .select({ siswaId: siswaKelas.siswaId, kelasId: siswaKelas.kelasId })
        .from(siswaKelas)
        .where(and(
          inArray(siswaKelas.kelasId, [...kelasByName.values()]),
        ));
      const relSet = new Set(existingRels.map((r) => `${r.siswaId}:${r.kelasId}`));

      for (const row of parsed.data.rows) {
        const email = row.email.toLowerCase();
        const existingUser = userRowMap.get(email);
        if (!existingUser || existingUser.role !== "SISWA") continue;
        const targetKelasNama = row.kelas || parsed.data.defaultKelasNama;
        if (!targetKelasNama) continue;
        const kelasId = kelasByName.get(targetKelasNama);
        if (!kelasId) continue;
        const key = `${existingUser.id}:${kelasId}`;
        if (relSet.has(key) || seenRels.has(key)) continue;
        relToInsert.push({ siswaId: existingUser.id, kelasId });
        seenRels.add(key);
        result.reEnrolled += 1;
      }

      if (relToInsert.length > 0) {
        await db.insert(siswaKelas).values(relToInsert);
      }
    }

    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("Siswa import error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
