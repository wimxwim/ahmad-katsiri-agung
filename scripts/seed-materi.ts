import { Pool } from "pg";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://akal:akaldev@localhost:5433/akal_center";

const MATERI_DATA = [
  { slug: "beriman-kepada-malaikat", judul: "Beriman Kepada Malaikat", kelas: "7", bab: 1, label: "AKIDAH", ringkasan: "Memahami iman kepada malaikat Allah SWT dan tugas-tugasnya", subTopik: 4, waktuBaca: "15 menit" },
  { slug: "membiasakan-tabayyun-menjauhi-ghibah", judul: "Membiasakan Tabayyun & Menjauhi Ghibah", kelas: "7", bab: 2, label: "AKHLAK", ringkasan: "Menerapkan sikap tabayyun dan menjauhi perbuatan ghibah dalam kehidupan sehari-hari", subTopik: 3, waktuBaca: "12 menit" },
  { slug: "salat-mencegah-perbuatan-keji-dan-mungkar", judul: "Salat Mencegah Perbuatan Keji & Mungkar", kelas: "7", bab: 3, label: "AKHLAK", ringkasan: "Memahami fungsi salat sebagai benteng dari perbuatan keji dan mungkar", subTopik: 3, waktuBaca: "10 menit" },
  { slug: "melestarikan-alam-cerminan-orang-beriman", judul: "Melestarikan Alam Cerminan Orang Beriman", kelas: "7", bab: 4, label: "AKHLAK", ringkasan: "Menjaga kelestarian alam sebagai wujud keimanan kepada Allah SWT", subTopik: 3, waktuBaca: "12 menit" },
  { slug: "amanah-dan-jujur", judul: "Amanah dan Jujur", kelas: "7", bab: 5, label: "AKHLAK", ringkasan: "Menerapkan sifat amanah dan jujur dalam kehidupan", subTopik: 3, waktuBaca: "10 menit" },
  { slug: "beriman-kepada-kitab-allah", judul: "Beriman Kepada Kitab-Kitab Allah", kelas: "8", bab: 1, label: "AKIDAH", ringkasan: "Meyakini kitab-kitab Allah SWT sebagai pedoman hidup", subTopik: 4, waktuBaca: "15 menit" },
  { slug: "beriman-kepada-nabi-dan-rasul", judul: "Beriman Kepada Nabi dan Rasul", kelas: "8", bab: 2, label: "AKIDAH", ringkasan: "Mengenal 25 Nabi dan Rasul serta sifat-sifatnya", subTopik: 3, waktuBaca: "12 menit" },
  { slug: "membangun-toleransi", judul: "Membangun Toleransi", kelas: "8", bab: 3, label: "AKHLAK", ringkasan: "Membangun sikap toleransi dalam keberagaman", subTopik: 3, waktuBaca: "10 menit" },
  { slug: "moderasi-beragama", judul: "Moderasi Beragama", kelas: "8", bab: 4, label: "AKHLAK", ringkasan: "Memahami dan menerapkan moderasi beragama", subTopik: 3, waktuBaca: "12 menit" },
  { slug: "adab-dalam-islam", judul: "Adab Dalam Islam", kelas: "8", bab: 5, label: "AKHLAK", ringkasan: "Menerapkan adab Islami dalam kehidupan sehari-hari", subTopik: 4, waktuBaca: "15 menit" },
  { slug: "beriman-kepada-hari-akhir", judul: "Beriman Kepada Hari Akhir", kelas: "9", bab: 1, label: "AKIDAH", ringkasan: "Meyakini adanya hari kiamat dan kehidupan setelah mati", subTopik: 4, waktuBaca: "15 menit" },
  { slug: "beriman-kepada-qada-dan-qadar", judul: "Beriman Kepada Qada dan Qadar", kelas: "9", bab: 2, label: "AKIDAH", ringkasan: "Memahami takdir Allah SWT dalam kehidupan", subTopik: 3, waktuBaca: "12 menit" },
  { slug: "semangat-mencari-ilmu", judul: "Semangat Mencari Ilmu", kelas: "9", bab: 3, label: "AKHLAK", ringkasan: "Menumbuhkan semangat mencari ilmu sebagai kewajiban muslim", subTopik: 3, waktuBaca: "10 menit" },
  { slug: "manusia-khalifah-di-muka-bumi", judul: "Manusia Sebagai Khalifah di Muka Bumi", kelas: "9", bab: 4, label: "AKHLAK", ringkasan: "Memahami peran manusia sebagai khalifah di bumi", subTopik: 4, waktuBaca: "15 menit" },
];

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS kursus (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nama VARCHAR(255) NOT NULL,
      deskripsi TEXT,
      slug VARCHAR(100) UNIQUE,
      kelas VARCHAR(10),
      bab INTEGER,
      label VARCHAR(20),
      ringkasan TEXT,
      sub_topik INTEGER DEFAULT 0,
      waktu_baca VARCHAR(20),
      status VARCHAR(20) DEFAULT 'AKTIF',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const m of MATERI_DATA) {
    await pool.query(
      `INSERT INTO kursus (nama, deskripsi, slug, kelas, bab, label, ringkasan, sub_topik, waktu_baca)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (slug) DO UPDATE SET
         nama = EXCLUDED.nama, deskripsi = EXCLUDED.deskripsi, kelas = EXCLUDED.kelas,
         bab = EXCLUDED.bab, label = EXCLUDED.label, ringkasan = EXCLUDED.ringkasan,
         sub_topik = EXCLUDED.sub_topik, waktu_baca = EXCLUDED.waktu_baca, updated_at = NOW()`,
      [m.judul, m.ringkasan, m.slug, m.kelas, m.bab, m.label, m.ringkasan, m.subTopik, m.waktuBaca],
    );
  }

  console.log(`Seed materi: ${MATERI_DATA.length} bab berhasil`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
