import { Pool } from "pg";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://akal:akaldev@localhost:5433/akal_center";

const SOAL_DATA = [
  { judul: "Iman Kepada Malaikat", slug: "beriman-kepada-malaikat", kelas: "7", totalSoal: 10 },
  { judul: "Tabayyun & Ghibah", slug: "membiasakan-tabayyun-menjauhi-ghibah", kelas: "7", totalSoal: 10 },
  { judul: "Salat & Akhlak", slug: "salat-mencegah-perbuatan-keji-dan-mungkar", kelas: "7", totalSoal: 8 },
  { judul: "Melestarikan Alam", slug: "melestarikan-alam-cerminan-orang-beriman", kelas: "7", totalSoal: 8 },
  { judul: "Amanah dan Jujur", slug: "amanah-dan-jujur", kelas: "7", totalSoal: 8 },
  { judul: "Iman Kepada Kitab Allah", slug: "beriman-kepada-kitab-allah", kelas: "8", totalSoal: 10 },
  { judul: "Nabi dan Rasul", slug: "beriman-kepada-nabi-dan-rasul", kelas: "8", totalSoal: 10 },
  { judul: "Toleransi", slug: "membangun-toleransi", kelas: "8", totalSoal: 8 },
  { judul: "Moderasi Beragama", slug: "moderasi-beragama", kelas: "8", totalSoal: 8 },
  { judul: "Adab Dalam Islam", slug: "adab-dalam-islam", kelas: "8", totalSoal: 8 },
  { judul: "Qada & Qadar", slug: "beriman-kepada-qada-dan-qadar", kelas: "9", totalSoal: 8 },
  { judul: "Semangat Mencari Ilmu", slug: "semangat-mencari-ilmu", kelas: "9", totalSoal: 10 },
];

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS soal_bank (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      judul VARCHAR(255) NOT NULL,
      slug VARCHAR(100),
      kelas VARCHAR(10),
      total_soal INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const s of SOAL_DATA) {
    await pool.query(
      `INSERT INTO soal_bank (judul, slug, kelas, total_soal)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [s.judul, s.slug, s.kelas, s.totalSoal],
    );
  }

  console.log(`Seed soal: ${SOAL_DATA.length} bank soal berhasil`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
