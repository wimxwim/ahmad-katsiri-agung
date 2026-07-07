import "dotenv/config";
import { readRows } from "../../src/lib/google-sheets";
import { db } from "../../src/lib/db";
import { users } from "../../src/lib/db/schema";
import { eq } from "drizzle-orm";

const DRY_RUN = process.argv.includes("--dry-run");

function sanitizeNama(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".")
    .trim();
}

async function migrateSiswa() {
  console.log("\n\x1b[1;36m📋 Migrasi Siswa — Google Sheets → PostgreSQL\x1b[0m");
  if (DRY_RUN) console.log("   \x1b[33m⚡ --dry-run: tidak menulis ke database\x1b[0m\n");
  else console.log("");

  let rows: string[][];
  try {
    rows = await readRows("DaftarSiswa!A:D");
  } catch (err) {
    console.error("   \x1b[31m❌ Gagal membaca sheet 'DaftarSiswa!A:D'\x1b[0m");
    throw err;
  }

  if (rows.length < 2) {
    console.log("   ⚠️  Sheet kosong atau hanya berisi header\n");
    return { total: 0, inserted: 0, skipped: 0 };
  }

  const dataRows = rows.slice(1);
  let total = 0;
  let inserted = 0;
  let skipped = 0;

  for (const row of dataRows) {
    total++;
    const nomor = row[0]?.trim() ?? "";
    const nama = row[1]?.trim();
    const kelas = row[2]?.trim() ?? "";

    if (!nama) {
      console.log(`   ${DRY_RUN ? "🔍" : "⏭️"}  #${nomor}: nama kosong — dilewati`);
      skipped++;
      continue;
    }

    const email = `${sanitizeNama(nama)}@akalcenter.my.id`;

    if (DRY_RUN) {
      console.log(`   🔍 #${nomor}: "${nama}" → ${email} (${kelas})`);
      inserted++;
      continue;
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`   ⏭️  #${nomor}: "${nama}" → ${email} sudah ada`);
      skipped++;
      continue;
    }

    await db.insert(users).values({
      role: "SISWA",
      nama,
      email,
      passwordHash: null,
    });

    console.log(`   ✅ #${nomor}: "${nama}" → ${email}`);
    inserted++;
  }

  return { total, inserted, skipped };
}

migrateSiswa()
  .then(({ total, inserted, skipped }) => {
    console.log(`\n\x1b[1;32m✅ Migrasi Siswa selesai\x1b[0m`);
    console.log(`   Total: ${total} | ✅ Inserted: ${inserted} | ⏭️  Skipped: ${skipped}\n`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(`\n\x1b[1;31m❌ Migrasi Siswa gagal:\x1b[0m`, e);
    process.exit(1);
  });
