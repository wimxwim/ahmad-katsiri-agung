import "dotenv/config";
import { db } from "../../src/lib/db";
import { users, kursus } from "../../src/lib/db/schema";
import { ALL_MATERI } from "../../src/data/materi";
import { eq } from "drizzle-orm";

const DRY_RUN = process.argv.includes("--dry-run");

async function findFirstGuru() {
  const result = await db
    .select({ id: users.id, nama: users.nama })
    .from(users)
    .where(eq(users.role, "GURU"))
    .limit(1);
  return result[0] ?? null;
}

async function migrateCmsToDb() {
  console.log("\n\x1b[1;36m📚 Migrasi CMS → DB (materi → kursus)\x1b[0m");
  if (DRY_RUN) console.log("   \x1b[33m⚡ --dry-run: tidak menulis ke database\x1b[0m\n");
  else console.log("");

  const guru = await findFirstGuru();
  if (!guru) {
    console.error("   \x1b[31m❌ Tidak ada user dengan role GURU di database.\x1b[0m");
    console.error("      Jalankan `npx tsx scripts/seed.ts` dulu untuk membuat user guru.\n");
    process.exit(1);
  }
  console.log(`   👤 Guru: ${guru.nama} (${guru.id})\n`);

  const entries = Object.values(ALL_MATERI);
  let total = entries.length;
  let inserted = 0;
  let skipped = 0;

  for (const m of entries) {
    if (DRY_RUN) {
      console.log(`   🔍 "${m.title}" (slug: ${m.slug})`);
      inserted++;
      continue;
    }

    const existing = await db
      .select({ id: kursus.id })
      .from(kursus)
      .where(eq(kursus.slug, m.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`   ⏭️  "${m.title}" → slug "${m.slug}" sudah ada`);
      skipped++;
      continue;
    }

    await db.insert(kursus).values({
      guruId: guru.id,
      judul: m.title,
      slug: m.slug,
      keystaticSlug: m.slug,
      deskripsi: m.ringkasan,
      isPublic: true,
    });

    console.log(`   ✅ "${m.title}" → slug "${m.slug}" (kelas ${m.kelas})`);
    inserted++;
  }

  return { total, inserted, skipped };
}

migrateCmsToDb()
  .then(({ total, inserted, skipped }) => {
    console.log(`\n\x1b[1;32m✅ Migrasi CMS → DB selesai\x1b[0m`);
    console.log(`   Total: ${total} | ✅ Inserted: ${inserted} | ⏭️  Skipped: ${skipped}\n`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(`\n\x1b[1;31m❌ Migrasi CMS → DB gagal:\x1b[0m`, e);
    process.exit(1);
  });
