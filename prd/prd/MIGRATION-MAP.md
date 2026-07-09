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

# Route Migration Map — AKAL Center V2 Multi-Guru

Dokumen ini adalah sumber kebenahan internal untuk mapping route lama ke route baru.
Dibuat sebagai bagian dari Gelombang 13: Route Migration Legacy ke Route Baru.

## Keputusan Umum

- Route baru menjadi sumber kebenahan.
- Route lama tetap hidup sebagai bridge redirect.
- Redirect menggunakan status 308 (permanent redirect) untuk route yang targetnya sudah final.
- Redirect menggunakan status 307 (temporary redirect) hanya untuk route auth yang masih butuh login.
- Tidak ada route legacy yang lagi ditampilkan sebagai halaman aktif.

## Public Routes Baru

| Route | Fungsi | SEO |
|-------|--------|-----|
| `/` | Landing page platform baru | index |
| `/fitur` | Deep dive fitur guru/siswa/sekolah | index |
| `/harga` | Pricing manual + CTA WhatsApp | index |
| `/tentang` | Visi platform multi-guru | index |
| `/masuk` | Entry login tunggal | noindex |
| `/daftar` | Entry register tunggal | noindex |

## Dashboard Routes Baru

| Route | Role | Fungsi |
|-------|------|--------|
| `/guru` | guru, owner, admin_sekolah | Home guru (redirect ke `/guru/beranda`) |
| `/guru/beranda` | guru, owner, admin_sekolah | Ringkasan workspace |
| `/guru/kursus` | guru, owner, admin_sekolah | Kelola kursus |
| `/guru/siswa` | guru, owner, admin_sekolah | Kelola siswa |
| `/guru/uploads` | guru, owner, admin_sekolah | Upload dokumen |
| `/guru/drafts` | guru, owner, admin_sekolah | Review draft AI |
| `/guru/analytics` | guru, owner, admin_sekolah | Analitik sederhana |
| `/siswa` | murid, orang_tua | Home siswa (redirect ke `/siswa/beranda`) |
| `/siswa/beranda` | murid, orang_tua | Lanjutkan belajar |
| `/siswa/materi` | murid, orang_tua | Daftar materi |
| `/siswa/quiz` | murid, orang_tua | Daftar kuis |
| `/siswa/cbt` | murid, orang_tua | Ujian CBT |
| `/siswa/progres` | murid, orang_tua | Riwayat progres |
| `/owner` | owner | Admin owner |
| `/admin-sekolah` | owner, admin_sekolah | Admin sekolah |
| `/orang-tua` | orang_tua | Portal orang tua |

## Legacy Route Mapping

### `/dashboard-guru` dan sub-path

- Target: `/guru`
- Status: bridge sementara
- Behavior: jika user sudah login dengan role guru/owner/admin_sekolah, redirect 308 ke `/guru/{rest}`.
- Behavior: jika user belum login atau role tidak cocok, redirect 307 ke `/masuk`.

### `/dashboard-siswa` dan sub-path

- Target: `/siswa`
- Status: bridge sementara
- Behavior: jika user sudah login dengan role murid/orang_tua, redirect 308 ke `/siswa/{rest}`.
- Behavior: jika user belum login atau role tidak cocok, redirect 307 ke `/masuk`.

### `/pendidik` dan sub-path

- Target: `/guru`
- Status: redirect permanen
- Alasan: `/pendidik` adalah portal publik lama untuk guru. Di versi baru, ruang guru berada di `/guru`. Pengunjung yang belum login akan diarahkan middleware ke `/masuk?portal=guru`.

### `/peserta-didik` dan sub-path

- Target: `/siswa`
- Status: redirect permanen
- Alasan: `/peserta-didik` adalah portal publik lama untuk siswa. Di versi baru, ruang siswa berada di `/siswa`. Pengunjung yang belum login akan diarahkan middleware ke `/masuk?portal=siswa`.

### `/login`, `/masuk-guru`, `/register`, `/register-guru`

- Target: `/masuk` atau `/daftar`
- Status: redirect sementara 307
- `/login` dan `/masuk-guru` -> `/masuk` (tambah query `portal=guru` jika `/masuk-guru`)
- `/register` dan `/register-guru` -> `/daftar` (tambah query `portal=guru` jika `/register-guru`)

## Link Update Tracking

File yang dirubah karena mengandung link ke route lama:

| File | Perubahan |
|------|-----------|
| `content/navigation/index.json` | `Pendidik` -> `Fitur`, href `/pendidik` -> `/fitur` |
| `src/components/beranda/DualCTACards.tsx` | CTA Dashboard Pendidik href `/pendidik` -> `/guru` |
| `src/app/admin/bulk-soal/page.tsx` | Link kembali `/pendidik` -> `/guru`, label `Portal Pendidik` -> `Ruang Guru` |
| `src/app/sitemap.ts` | Hapus `/pendidik`, `/peserta-didik`; tambah `/fitur`, `/harga` |

## Implementasi Middleware

Redirect diatur di `middleware.ts`:

- `LEGACY_DASHBOARD_TO_HOME`: untuk `/dashboard-guru` dan `/dashboard-siswa` dengan cek role.
- `LEGACY_PUBLIC_TO_HOME`: untuk `/pendidik` dan `/peserta-didik` tanpa cek role (308 langsung).

## Cleanup Masa Depan

Setelah platform baru sepenuhnya stabil dan tidak ada traffic signifikan ke route lama, bridge berikut bisa dihapus:

- `LEGACY_DASHBOARD_TO_HOME` di `middleware.ts`
- `LEGACY_PUBLIC_TO_HOME` di `middleware.ts`
- block redirect `/login`, `/masuk-guru`, `/register`, `/register-guru`

Sebelum menghapus, pastikan:

1. Tidak ada backlink eksternal aktif ke route lama.
2. Search console tidak menunjukkan error crawl.
3. Semua internal link sudah bersih dari route lama.
