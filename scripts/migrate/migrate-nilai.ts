import "dotenv/config";
import { readRows } from "../../src/lib/google-sheets";
import { db } from "../../src/lib/db";
import { users, kursus, skill, soal, jawabanLog } from "../../src/lib/db/schema";
import { eq, ilike } from "drizzle-orm";

const DRY_RUN = process.argv.includes("--dry-run");

interface NilaiRow {
  isoDate: string;
  nama: string;
  kelas: string;
  noAbsen: string;
  tipe: string;
  judulBab: string;
  skor: number;
  total: number;
  persentase: number;
  lulus: string;
}

function parseRow(row: string[]): NilaiRow | null {
  if (row.length < 10) return null;
  const nama = row[1]?.trim();
  const judulBab = row[5]?.trim();
  if (!nama || !judulBab) return null;

  return {
    isoDate: row[0]?.trim() ?? "",
    nama,
    kelas: row[2]?.trim() ?? "",
    noAbsen: row[3]?.trim() ?? "",
    tipe: row[4]?.trim() ?? "",
    judulBab,
    skor: parseInt(row[6] ?? "0", 10) || 0,
    total: parseInt(row[7] ?? "1", 10) || 1,
    persentase: parseFloat(row[8] ?? "0") || 0,
    lulus: row[9]?.trim() ?? "",
  };
}

async function findUserByNama(nama: string) {
  const result = await db
    .select({ id: users.id, nama: users.nama })
    .from(users)
    .where(ilike(users.nama, nama))
    .limit(1);
  return result[0] ?? null;
}

async function findKursusByJudul(judul: string) {
  const result = await db
    .select({ id: kursus.id, judul: kursus.judul })
    .from(kursus)
    .where(ilike(kursus.judul, `%${judul}%`))
    .limit(1);
  return result[0] ?? null;
}

async function findOrCreateSummarySoal(kursusId: string): Promise<string> {
  const existingSkill = await db
    .select({ id: skill.id })
    .from(skill)
    .where(eq(skill.kursusId, kursusId))
    .orderBy(skill.urutan)
    .limit(1);

  let skillId: string;

  if (existingSkill.length > 0) {
    skillId = existingSkill[0].id;
  } else {
    const [newSkill] = await db
      .insert(skill)
      .values({
        kursusId,
        nama: "Ringkasan Migrasi",
        urutan: 0,
      })
      .returning({ id: skill.id });
    skillId = newSkill.id;
  }

  const existingSoal = await db
    .select({ id: soal.id })
    .from(soal)
    .where(eq(soal.skillId, skillId))
    .limit(1);

  if (existingSoal.length > 0) {
    return existingSoal[0].id;
  }

  const [newSoal] = await db
    .insert(soal)
    .values({
      skillId,
      teks: "Soal ringkasan — data migrasi dari Google Sheets",
      tipe: "PG",
      pilihanGanda: { A: "A", B: "B", C: "C", D: "D" },
      kunci: "A",
      bloomLevel: 1,
    })
    .returning({ id: soal.id });

  return newSoal.id;
}

async function migrateNilai() {
  console.log("\n\x1b[1;36m📊 Migrasi Nilai — Google Sheets → PostgreSQL\x1b[0m");
  if (DRY_RUN) console.log("   \x1b[33m⚡ --dry-run: tidak menulis ke database\x1b[0m\n");
  else console.log("");

  let rows: string[][];
  try {
    rows = await readRows("RekapNilai!A:J");
  } catch (err) {
    console.error("   \x1b[31m❌ Gagal membaca sheet 'RekapNilai!A:J'\x1b[0m");
    throw err;
  }

  if (rows.length < 2) {
    console.log("   ⚠️  Sheet kosong atau hanya berisi header\n");
    return { total: 0, migrated: 0, skippedNoUser: 0, skippedNoKursus: 0 };
  }

  const dataRows = rows.slice(1);
  let total = 0;
  let migrated = 0;
  let skippedNoUser = 0;
  let skippedNoKursus = 0;

  for (const row of dataRows) {
    total++;
    const parsed = parseRow(row);
    if (!parsed) {
      console.log(`   ⏭️  Baris #${total}: data tidak lengkap`);
      skippedNoUser++;
      continue;
    }

    const userRecord = await findUserByNama(parsed.nama);
    if (!userRecord) {
      console.log(`   ⏭️  "${parsed.nama}" → user tidak ditemukan`);
      skippedNoUser++;
      continue;
    }

    const kursusRecord = await findKursusByJudul(parsed.judulBab);
    if (!kursusRecord) {
      console.log(`   ⏭️  "${parsed.nama}" → kursus "${parsed.judulBab}" tidak ditemukan`);
      skippedNoKursus++;
      continue;
    }

    if (DRY_RUN) {
      console.log(
        `   🔍 "${parsed.nama}" → "${parsed.judulBab}" | ${parsed.skor}/${parsed.total} (${parsed.persentase}%) ${parsed.lulus}`
      );
      migrated++;
      continue;
    }

    const soalId = await findOrCreateSummarySoal(kursusRecord.id);

    await db.insert(jawabanLog).values({
      siswaId: userRecord.id,
      soalId,
      jawabanSiswa: `[MIGRASI] ${parsed.tipe}: skor ${parsed.skor}/${parsed.total} (${parsed.persentase}%) — ${parsed.lulus}`,
      isBenar: parsed.lulus.toLowerCase() === "lulus",
      waktuJawabDetik: 0,
    });

    console.log(
      `   ✅ "${parsed.nama}" → "${parsed.judulBab}" | ${parsed.skor}/${parsed.total} (${parsed.persentase}%)`
    );
    migrated++;
  }

  return { total, migrated, skippedNoUser, skippedNoKursus };
}

migrateNilai()
  .then(({ total, migrated, skippedNoUser, skippedNoKursus }) => {
    console.log(`\n\x1b[1;32m✅ Migrasi Nilai selesai\x1b[0m`);
    console.log(
      `   Total: ${total} | ✅ Migrated: ${migrated} | ⏭️  No user: ${skippedNoUser} | ⏭️  No kursus: ${skippedNoKursus}\n`
    );
    process.exit(0);
  })
  .catch((e) => {
    console.error(`\n\x1b[1;31m❌ Migrasi Nilai gagal:\x1b[0m`, e);
    process.exit(1);
  });
