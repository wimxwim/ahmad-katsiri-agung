# AKAL CENTER — Ringkasan Eksekutif

**Versi:** 1.0  
**Tanggal:** 6 Juli 2026  
**Status Project:** LIVE (akalcenter.my.id) + Fase Perencanaan Evolusi  
**Pemilik:** Ahmad Katsiri Agung, S.Pd.

---

## 1. APAKAH AKAL CENTER?

AKAL Center adalah **platform e-learning PAI berbasis Deep Learning** untuk tingkat SMP/MTs yang saat ini sudah LIVE di `akalcenter.my.id` sebagai situs single-guru untuk Ahmad Katsiri Agung, S.Pd. Platform ini sedang direncanakan untuk berevolusi menjadi **platform multi-guru berskala nasional** dengan mesin analitik prediktif — sistem yang tahu kapan seorang siswa akan gagal SEBELUM nilai ujian jelek keluar.

### Saat Ini (Versi 1.0 — Single-Guru, LIVE)
- **14 bab materi** PAI/Akidah Akhlak Kelas 7-9, Kurikulum Merdeka
- **Google Sheets + Telegram** untuk evaluasi & notifikasi
- **Keystatic CMS** — Bang Agung bisa edit konten sendiri via browser
- **8 bank soal** dengan quiz engine (mode Siswa Resmi + Latihan)
- **Game edukasi** terintegrasi, video YouTube, doa wall
- **Login gate** — semua konten wajib autentikasi
- **Cloudflare Worker CDN** — caching edge + security header
- **Security:** JWT, Rate Limiting, CSP/HSTS, Zod validation, sanitasi XSS

### Target (Versi 2.0 — Multi-Guru + Mesin Analitik)
- **Multi-tenancy:** Puluhan/ribuan guru kelola kursus sendiri
- **Google Drive per guru:** File materi di Drive pribadi guru, bukan storage platform
- **Mesin Analitik Prediktif:** IRT, BKT, Risk Score, Elo Rating, Spaced Repetition
- **Remedial Otomatis:** Resep belajar personal berbasis akar masalah
- **Teacher Readiness Index:** Ukur kesiapan mengajar guru secara objektif
- **Sertifikat + QR Anti-Palsu:** Verifikasi kriptografis sertifikat
- **AI Tutor & AI Grading Essay**
- **Orang Tua Dashboard:** View-only progress anak
- **VPS Self-Hosted:** Biznet Gio NEO Lite (2 vCPU, 4GB RAM, 60GB SSD) — Rp139.000/bulan

---

## 2. PENCAPAIAN (27 Sesi, 9 Juni – 28 Juni 2026)

| Kategori | Detail |
|----------|--------|
| **Platform** | Next.js 16 + Tailwind v4 + TypeScript, 18 halaman statis |
| **Konten** | 14 bab materi, 8 bank soal (25 soal/bab), 9 dalil hafalan |
| **CMS** | Keystatic — 4 collections (Materi 14/14, Soal 8/8, Game 12/12, Hadits 6/6) |
| **Evaluasi** | Quiz engine (login → intro → playing → result), auto-submit API |
| **Data Flow** | Google Sheets (RekapNilai, DoaUcapan, DaftarSiswa) + Telegram dual-chat |
| **Domain** | akalcenter.my.id (Rumahweb Rp35.000, NS Cloudflare) |
| **CDN** | Cloudflare Worker reverse proxy ke Vercel (block .vercel.app, 403) |
| **Security** | JWT (jose), In-memory Rate Limiter, CSP nonce strict-dynamic, HSTS, Zod, XSS sanitizer |
| **Auth Gate** | proxy.ts — semua halaman di-lock, redirect ke /login |
| **Navigasi Mobile** | Bottom tab 5 items + bottom sheet, floating pill style |
| **Performa** | Logo 2.3MB → 6KB WebP, 10 MB bloat removal, content-visibility: auto |
| **Tooling** | npm scripts, vercel.json, wrangler deploy, GitHub Actions |

---

## 3. YANG BELUM SELESAI (Quick Wins)

| Item | Prioritas | Estimasi | Ketergantungan |
|------|-----------|----------|---------------|
| PROTA Kelas 8 PDF | Rendah | — | Nunggu Bang Agung |
| Soal Tabayyun PDF | Rendah | — | Nunggu Bang Agung |
| 2 video YouTube (Nabi & Rasul, Adab Islam) | Rendah | — | Nunggu link |
| `/peserta-didik` halaman | Rendah | 30-60 menit | Tanpa ketergantungan |
| CMS Navbar overflow (>8 item) | 🟡 Sedang | 30 menit | Tanpa ketergantungan |
| Akun GitHub Bang Agung | 🟡 Sedang | — | Nunggu klien |

---

## 4. KEPUTUSAN ARSITEKTUR STRATEGIS

### ADR-001: Kenapa VPS Self-Hosted (Biznet Gio NEO Lite)?
- **Kontrol penuh** atas data — kepatuhan UU PDP lebih mudah
- **Biaya flat** Rp139.000/bulan — predictable, tidak peduli berapa banyak user
- **Database self-hosted** — tidak ada batasan koneksi seperti Neon free tier
- **Konsekuensi:** DevOps load bertambah, scaling vertikal terbatas 4GB RAM

### ADR-002: Keystatic tidak dihapus
- **Konten statis** (materi, bab, PDF) tetap di Keystatic — murah, git-based, tanpa database
- **Data dinamis** (user, nilai, progress) pindah ke Neon Postgres
- **Tidak ada migrasi besar-besaran** — database baru ditambahkan di samping, bukan menggantikan

### ADR-003: Google Drive per guru (bukan storage terpusat)
- **Unlimited storage** per guru — gratis, di akun Google mereka
- **Kepemilikan data** — kalau guru berhenti pakai AKAL Center, file tetap di Drive mereka
- **Hemat 60GB SSD VPS** — video & file besar tidak perlu disimpan di server

### ADR-004: Event Sourcing untuk EventStore
- Setiap aksi signifikan ditulis sebagai event (bukan update langsung)
- Hash-chain (`previous_hash`) — anti-tampering, verifikasi kriptografis
- Replay untuk membangun ulang state
- Konsekuensi: kompleksitas bertambah, storage bertambah

---

## 5. MODEL BISNIS (Usulan)

| Paket | Harga | Target | Fitur Kunci |
|-------|-------|--------|------------|
| **GRATIS** | Rp 0 | Validasi pasar | 1 kursus, 50 siswa, quiz dasar, gradebook |
| **GURU PRO** | Rp 99.000/bulan | Guru individual | Unlimited kursus, 500 siswa, Google Drive, Risk Score, BKT, AI Grading, Sertifikat QR |
| **SEKOLAH** | Rp 2.500.000/tahun | Institusi | Multi-guru, White-label domain, TRI, Admin Dashboard, Dedicated Support |

---

## 6. TIMELINE USULAN

```
BULAN 1-2: Fondasi VPS + Database + Multi-guru
  └─ VPS Biznet provisioning + Docker + Prisma setup
  └─ Neon Postgres schema + migrasi dari Google Sheets
  └─ Multi-tenancy dasar (sekolah_id, Row-Level Security)

BULAN 3-4: Google Drive + Auth + Quiz Engine v2
  └─ OAuth2 Google Drive per guru
  └─ Auth siswa (register, login, JWT)
  └─ Quiz engine dengan jawaban_log

BULAN 5-7: Mesin Analitik (The Brain)
  └─ BKT, IRT, Risk Score, Elo Rating
  └─ Spaced Repetition + Remedial Otomatis
  └─ Teacher Readiness Index

BULAN 8-10: Sertifikat + AI + Monetisasi
  └─ Sertifikat PDF + QR Anti-Palsu
  └─ AI Tutor + AI Grading Essay
  └─ QRIS Payment Integration

BULAN 11-12: Optimasi + Hardening
  └─ jemalloc, PgBouncer, Load Testing
  └─ OWASP Audit, Penetration Test
  └─ Beta test + Launch
```

---

## 7. STATUS TERBARU

**Website LIVE di** `https://akalcenter.my.id`  
**27 sesi pengerjaan selesai** (9 Juni – 28 Juni 2026)  
**PRD ini** adalah blueprint untuk fase berikutnya: dari single-guru ke multi-tenant analytics platform.

**PRD Selanjutnya:**
1. ✅ Ringkasan Eksekutif (dokumen ini)
2. [02-audit-kondisi-saat-ini.md](02-audit-kondisi-saat-ini.md) — Deep dive repo existing
3. [03-arsitektur-target.md](03-arsitektur-target.md) — Arsitektur VPS + Multi-tenant
4. [04-matriks-fitur-per-role.md](04-matriks-fitur-per-role.md) — Fitur Guru, Siswa, Admin, Orang Tua
5. [05-spesifikasi-mesin-analitik.md](05-spesifikasi-mesin-analitik.md) — IRT, BKT, Risk Score, TRI
6. [06-model-data.md](06-model-data.md) — Skema database Prisma + Neon Postgres
7. [07-rencana-migrasi.md](07-rencana-migrasi.md) — Langkah konkret migrasi

---

*Dokumen ini adalah living document — update setiap ada perubahan signifikan.*
