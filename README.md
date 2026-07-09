# AKAL Center — Deep Learning Akidah Akhlak

Platform e-learning PAI SMP/MTs berbasis **Model Pembelajaran Aqidah Akhlaq**.
Live di **[akalcenter.my.id](https://akalcenter.my.id)**

---

## Visi & Misi

**AKAL Center** adalah ikhtiar sederhana yang sedang kami bangun pelan-pelan — belum peluncuran, masih terus disempurnakan. Intinya, platform ini ingin meringankan beban tiga pihak sekaligus.

**Untuk murid:** setiap jawaban kuis dicatat bukan cuma benar-salah, tapi juga berapa detik dia berpikir — dari situ sistem bisa membedakan antara anak yang sudah paham (jawab cepat dan benar), anak yang bingung (jawab lama tapi salah), atau anak yang asal klik (jawab cepat asal-asalan). Setiap topik seperti "Wudhu", "Tayamum", "Jujur" dihitung persentase penguasaannya — bukan sekadar nilai rata-rata, tapi "Wudhu sudah 91%, Tayamum baru 42%" — sehingga siswa tidak disuruh mengulang semua, cukup fokus 15 menit di topik yang belum dikuasai.

**Untuk guru:** platform ini membantu menjawab pertanyaan sehari-hari: "Topik mana yang paling banyak murid belum paham?", "Siapa yang mulai tertinggal sebelum nilainya benar-benar jatuh?", "Remedial seperti apa yang pas buat si A?" — semua muncul otomatis di dashboard, guru tinggal klik "kirim" dan murid dapat jalur belajar personal.

**Untuk kepala sekolah:** tersedia ringkasan simpel — bukan grafik rumit — cukup lampu hijau-kuning-merah yang menunjukkan kondisi tiap kelas, guru mana yang butuh pendampingan (bukan guru mana yang "malas", tapi guru mana yang butuh bantuan), dan tren keseluruhan: "Tahun ini pemahaman akhlak naik, tapi hafalan dalil perlu diperkuat."

Soal biaya, kami hitung dengan hati-hati: **Rp20 ribu/bulan per guru**, **Rp125 ribu untuk tim 5 guru**, **Rp200 ribu untuk paket lengkap dengan dashboard kepala sekolah** — dan ke depan akan dibantu AI Qwen 3.7 yang meringankan guru bikin soal atau analisis kelas, tapi tetap guru yang memegang kendali penuh. Ini bukan alat untuk menggantikan guru, justru untuk memuliakan peran guru — karena kami percaya, secanggih apapun sistem, keputusan akhir tetap di tangan pendidik.

---

## Tentang Project

AKAL Center adalah platform pembelajaran Pendidikan Agama Islam yang dibangun untuk **Ahmad Katsiri Agung, S.Pd.** — seorang pendidik PAI yang ingin membawa metode pembelajaran akidah akhlak ke ranah digital.

### Fase Saat Ini: Single-Guru (v1.0 — LIVE)

- **14 bab materi** PAI/Akidah Akhlak Kelas 7-9, Kurikulum Merdeka
- **8 bank soal** dengan sistem kuis interaktif
- **6 game edukasi** terintegrasi
- **CMS Keystatic** — guru bisa edit konten sendiri via browser (OAuth GitHub)
- **Google Sheets** — rekap nilai, daftar siswa, doa wall
- **Telegram notification** — real-time alert untuk setiap kuis selesai
- **Cloudflare Worker CDN** — caching edge + security headers
- **Auth gate** — semua konten di-lock, wajib login via `/login`

### Fase Target: Multi-Guru + Mesin Analitik (v2.0 — Rencana)

- Multi-tenancy — puluhan/ribuan guru dengan kursus sendiri
- Google Drive per guru — file materi tetap di akun pribadi guru
- Mesin analitik prediktif — IRT, BKT, Risk Score, Elo Rating, Spaced Repetition
- Remedial otomatis — resep belajar personal berbasis data
- Teacher Readiness Index — ukur kesiapan mengajar guru
- Sertifikat PDF + QR anti-palsu
- AI Tutor + AI Grading Essay (Qwen 3.7 via NaraRouter)
- Dashboard Orang Tua — view-only progress anak
- QRIS payment integration

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| CSS | Tailwind CSS v4 (custom oklch theme) |
| Animasi | motion/react |
| CMS | Keystatic (git-based) |
| Hosting | Vercel Hobby |
| CDN | Cloudflare Worker |
| Analytics | Google Analytics, Vercel Analytics, Speed Insights |
| Auth | jose (JWT HS256) |
| Data | Google Sheets API (sementara) |
| Notifikasi | Telegram Bot API |

---

## Memulai Development

### Prasyarat

- Node.js 20+
- npm
- Git
- Akun GitHub (untuk CMS Keystatic)

### Setup

```bash
# Clone repo
git clone https://github.com/wimxwim/ahmad-katsiri-agung.git
cd ahmad-katsiri-agung

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Isi .env.local dengan kredensial yang diperlukan

# Jalankan development server
npm run dev
# Buka http://localhost:3000
```

### Build

```bash
npm run build      # Build production
npm run start      # Jalankan hasil build
npm run lint       # Cek kode
```

---

## Struktur Project

```
akal-center/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── materi/             # Halaman materi + detail bab
│   │   ├── evaluasi/           # Portal kuis
│   │   ├── game/               # Game edukasi
│   │   ├── video/              # Video gallery
│   │   ├── hafalan/            # Hafalan dalil
│   │   ├── pendidik/           # Portal pendidik
│   │   ├── login/              # Halaman login
│   │   ├── proxy.ts            # Auth gate (semua halaman di-lock)
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── beranda/            # Hero, FeatureGrid, RuangDoa, dll
│   │   ├── layout/             # Navbar, Footer, BottomTabBar, FloatingWA
│   │   ├── materi/             # MateriDetailClient
│   │   ├── evaluasi/           # QuizEngine, QuizLogin
│   │   └── providers/          # Providers wrapper
│   ├── data/
│   │   ├── materi.ts           # 14 bab materi PAI
│   │   ├── soal.ts             # 8 bank soal
│   │   ├── hafalan.ts          # 9 dalil
│   │   └── dalil.ts            # Analisis QS Al-Isra:34
│   ├── lib/
│   │   ├── utils.ts            # cn() utility
│   │   ├── auth.ts             # JWT sign/verify
│   │   ├── google-sheets.ts    # Google Sheets API
│   │   ├── telegram.ts         # Telegram Bot
│   │   ├── rate-limit.ts       # Rate limiter
│   │   ├── sanitize.ts         # XSS sanitizer
│   │   └── validation.ts       # Zod schemas
│   └── globals.css             # Tailwind + custom theme
├── content/                    # Keystatic CMS content
├── workers/akal-centre/        # Cloudflare Worker
├── prd/                        # Dokumen perencanaan produk
├── vercel.json                 # CRITICAL — jangan dihapus
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── AGENTS.md                   # Instruksi untuk AI agent
```

---

## Design System

| Token | Value |
|-------|-------|
| Primary | `#005231` (hijau gelap premium) |
| Gold | `#5a4200` / `#775900` |
| Surface | `#f2fcf7` (putih kehijauan) |
| Glass | `rgba(255,255,255,0.6)` + `backdrop-blur-2xl` |
| Font Heading | Bricolage Grotesque (Google Fonts) |
| Font Body | Inter (Google Fonts) |
| Font Arabic | Amiri (Google Fonts) |

---

## PRD (Product Requirements Document)

Untuk pemahaman mendalam tentang arsitektur dan rencana pengembangan, baca:

1. [Ringkasan Eksekutif](prd/01-ringkasan-eksekutif.md)
2. [Audit Kondisi Saat Ini](prd/02-audit-kondisi-saat-ini.md)
3. [Arsitektur Target](prd/03-arsitektur-target.md)
4. [Matriks Fitur Per Role](prd/04-matriks-fitur-per-role.md)
5. [Spesifikasi Mesin Analitik](prd/05-spesifikasi-mesin-analitik.md)
6. [Model Data](prd/06-model-data.md)
7. [Rencana Migrasi](prd/07-rencana-migrasi.md)
8. [Riset 2026 & Rekomendasi](prd/08-riset-2026-rekomendasi.md)

---

## Deployment

```bash
# 1. Build (PASTIKAN zero errors)
npx next build

# 2. Commit & push
git add -A
git commit -m "pesan"
git push origin main

# 3. Deploy Vercel
npx vercel --prod --yes

# 4. Deploy Cloudflare Worker
cd workers/akal-centre
npx wrangler deploy
```

---

## Kontak Klien

- **Nama:** Ahmad Katsiri Agung, S.Pd.
- **WA:** 0851-5879-5502
- **Peran:** Pendidik PAI, Pemilik Platform

---

*Dibangun dengan ❤️ oleh Agensi untuk AKAL Center*
