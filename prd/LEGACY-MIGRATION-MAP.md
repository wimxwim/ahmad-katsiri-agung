# Peta Migrasi Legacy: Google Sheets → Supabase

Dokumen ini memetakan setiap fitur legacy yang masih memakai Google Sheets ke tabel Supabase pengganti, beserta status migrasi dan langkah cutover.

---

## 1. Verifikasi Siswa (`/api/siswa/cek`)

**Sheet:** `DaftarSiswa!A:D`
**Kolom Sheet:** `[id, nama, kelas, tanggalLahir]`
**Frontend:** `src/components/evaluasi/QuizLogin.tsx`

**Tabel Supabase pengganti:** `users` + `siswa_kelas`
**Field mapping:**

| Sheet field     | Supabase field         | Tabel         |
|-----------------|------------------------|---------------|
| nama            | nama                   | users         |
| kelas           | nama_kelas             | siswa_kelas → kelas (via relasi) |
| tanggalLahir    | tanggal_lahir          | users         |

**Status migrasi:** Flow baru sudah ada di `/api/v1/auth/register` (role SISWA) + `/api/v1/siswa/*`. Tapi `QuizLogin.tsx` masih pakai flow lama karena quiz engine lama (`/api/kuis/selesai`) belum sepenuhnya digantikan.

**Cutover:**
1. Pastikan quiz engine DB-driven (`/api/v1/siswa/quiz/*`) stabil
2. Update `QuizEngine.tsx` atau ganti ke halaman quiz baru
3. Hapus `QuizLogin.tsx` + endpoint `/api/siswa/cek`

---

## 2. Rekap Nilai (`/api/kuis/selesai` + `/api/kuis/rekap`)

**Sheet:** `RekapNilai!A:J`
**Kolom Sheet:** `[tanggal, nama, kelas, noAbsen, tipe, bab, skor, total, persentase, lulus]`
**Frontend write:** `src/components/evaluasi/QuizEngine.tsx`
**Frontend read:** `src/app/pendidik/page.tsx`

**Tabel Supabase pengganti:** `quiz_attempt` + `quiz_published` + `soal_published`
**Field mapping:**

| Sheet field  | Supabase field       | Tabel           |
|--------------|----------------------|-----------------|
| tanggal      | selesai              | quiz_attempt    |
| nama         | (relasi ke users)    | quiz_attempt.siswaId |
| kelas        | (relasi ke kelas)    | siswa_kelas     |
| noAbsen      | (field user/siswa)   | users           |
| tipe         | modeEvaluasi         | quiz_published  |
| bab          | judul                | quiz_published  |
| skor         | nilai                | quiz_attempt    |
| total        | totalSoal            | quiz_attempt    |
| persentase   | (computed)           | —               |
| lulus        | (computed >= 70%)    | —               |

**Status migrasi:** Flow baru sudah ada di `/api/v1/siswa/quiz/[id]/submit` + `/api/v1/siswa/progres`. Tapi `QuizEngine.tsx` (legacy) masih pakai flow lama, dan `pendidik/page.tsx` masih baca dari `/api/kuis/rekap`.

**Cutover:**
1. Pastikan semua quiz berjalan via engine baru
2. Update `pendidik/page.tsx` untuk baca dari `/api/v1/guru/analytics` atau endpoint baru
3. Hapus `QuizEngine.tsx` legacy + `/api/kuis/selesai` + `/api/kuis/rekap`

---

## 3. Refleksi Diri (`/api/refleksi`)

**Sheet:** `RefleksiDiri!A:F`
**Kolom Sheet:** `[id, nama, pelajaran, akhlakBaik, perluDiperbaiki, waktu]`
**Frontend:** Halaman refleksi (jika masih ada di navigasi)

**Tabel Supabase pengganti:** Belum ada tabel dedicated. Opsi:
- Buat tabel `refleksi_diri` di Supabase
- Atau masukkan sebagai bagian dari `event_store` dengan type `refleksi.submitted`

**Field mapping:**

| Sheet field      | Supabase field   | Tabel        |
|------------------|------------------|--------------|
| id               | id (uuid)        | refleksi_diri |
| nama             | (relasi users)   | refleksi_diri.siswaId |
| pelajaran        | pelajaran        | refleksi_diri |
| akhlakBaik       | akhlakBaik       | refleksi_diri |
| perluDiperbaiki  | perluDiperbaiki  | refleksi_diri |
| waktu            | createdAt        | refleksi_diri |

**Status migrasi:** Belum ada tabel pengganti. Fitur ini bukan prioritas P0/P1.

**Cutover:**
1. Buat tabel `refleksi_diri` di migration baru (saat fitur refleksi diaktifkan di platform baru)
2. Buat endpoint `/api/v1/siswa/refleksi`
3. Update frontend
4. Hapus `/api/refleksi`

---

## 4. Diskusi (`/api/diskusi` + `/api/diskusi/[slug]`)

**Sheet:** `Diskusi!A:G` + `DiskusiBalasan!A:F`
**Kolom Sheet Diskusi:** `[id, nama, kategori, judul, isi, waktu, slug]`
**Kolom Sheet Balasan:** `[id, slug, nama, isi, tipe, waktu]`
**Frontend:** Halaman diskusi (jika masih ada)

**Tabel Supabase pengganti:** Belum ada tabel dedicated. Opsi:
- Buat tabel `diskusi` + `diskusi_balasan`
- Atau pakai sistem pengumuman/forum yang lebih terstruktur

**Status migrasi:** Belum ada tabel pengganti. Fitur ini bukan prioritas P0/P1.

**Cutover:**
1. Buat tabel `diskusi` + `diskusi_balasan` di migration baru
2. Buat endpoint `/api/v1/diskusi` + `/api/v1/diskusi/[slug]`
3. Update frontend
4. Hapus endpoint legacy

---

## 5. Doa & Ucapan (`/api/doa`)

**Sheet:** `DoaUcapan!A:D`
**Kolom Sheet:** `[id, nama, isi, waktu]`
**Frontend:** Halaman doa (jika masih ada)

**Tabel Supabase pengganti:** Belum ada. Bisa jadi bagian dari fitur komunitas/forum.

**Status migrasi:** Belum ada tabel pengganti. Fitur ini bukan prioritas.

**Cutover:**
1. Tentukan apakah fitur doa/ucapan masih relevan di platform baru
2. Jika ya, buat tabel dedicated
3. Jika tidak, biarkan endpoint legacy hidup sampai halaman terkait dihapus

---

## 6. CMS Content (`src/lib/cms.ts` + `src/lib/cms-data.ts`)

**Status:** Sudah ditandai `CMS_LEGACY_READONLY`. Tidak menulis ke `content/*`.
**Frontend yang masih pakai:**
- `src/app/materi/[slug]/page.tsx` (baca materi legacy)
- `src/components/layout/Footer.tsx` (tipe navigasi)
- `src/app/layout.tsx` (tipe navigasi)

**Status migrasi:** Sudah benar sebagai read-only. Konten baru DB-driven via `/api/v1/siswa/materi/*`.

**Cutover:**
1. Setelah semua materi lama dipindah ke DB (atau di-archive), hapus `cms.ts` + `cms-data.ts`
2. Update `materi/[slug]/page.tsx` untuk redirect ke halaman materi baru atau tampilkan "konten tidak tersedia"

---

## Ringkasan Prioritas Cutover

| Fitur | Prioritas | Blok cutover |
|-------|-----------|--------------|
| Verifikasi siswa + rekap nilai | **P1** | Quiz engine baru harus stabil |
| Refleksi diri | P2 | Butuh tabel baru |
| Diskusi | P2 | Butuh tabel baru |
| Doa & ucapan | P3 | Tentukan relevansi dulu |
| CMS content | P1 | Sudah read-only, aman ditinggal |

---

## Aturan Selama Masa Transisi

1. **Jangan hapus endpoint legacy** sebelum flow pengganti diverifikasi stabil
2. **Jangan tambah fitur baru** yang menulis ke Google Sheets
3. **Parallel write** boleh diaktifkan per fitur saat flow baru siap (tulis ke Sheets + DB bersamaan)
4. **Read dari Sheets** boleh selama frontend legacy masih memakainya
5. **Setiap cutover** harus diverifikasi: data di DB cocok dengan data di Sheets untuk periode overlap

---

*Dokumen ini dibuat sebagai bagian dari TODO V2 Multi-Guru Gelombang 9.*
*Terakhir diupdate: 7 Juli 2026*
