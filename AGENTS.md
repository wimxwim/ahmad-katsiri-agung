# AGENTS.md — Project: Ahmad Katsiri Aggung (Aggung Learning)

> **BACA FILE INI DULU** sebelum mengerjakan apapun di project ini.
> File ini adalah single-source-of-truth untuk AI yang bekerja di sesi ini.

---

## KEJELASAN — Identitas Project

| Aspek | Detail |
|-------|--------|
| **Nama Project** | AKAL Center — Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning |
| **Branding Web** | AKAL Center — Deep Learning Akidah Akhlak |
| **Tagline Web** | Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning |
| **Klien** | Ahmad Katsiri Aggung, S.Pd. — Pendidik PAI |
| **Tema** | Model Pembelajaran Berbasis **Deep Learning** pada Materi **Akidah Akhlak** tingkat SMP/MTs |
| **Kurikulum** | **Kurikulum Merdeka** (BUKAN "Kurikulum Terpadu 2026") |
| **Model DL** | 3 Pilar: Mindful Learning → Meaningful Learning → Joyful Learning |
| **Level** | SMP/MTs Kelas 7, 8, 9 |
| **Target** | Siswa + Guru PAI |
| **Domain** | Utama: `https://akalcenter.my.id` (Cloudflare) <br> Vercel: `https://ahmad-katsiri-agung.vercel.app` <br> CDN Worker: `https://akal-center.wimxgooo.workers.dev` |
| **Repo** | `https://github.com/wimxwim/ahmad-katsiri-agung` |
| **Kontak klien** | WA 0851-5879-5502, IG @ahmadkatsiria, TikTok @sir.ahmd, YouTube: Ahmad Katsiri Agung |

---

## PENJELASAN — Arsitektur & Struktur

### Stack Teknis

| Layer | Pilihan | Versi |
|-------|---------|-------|
| Framework | Next.js (App Router) | 16.2.7 |
| Bahasa | TypeScript | ^5 |
| CSS | Tailwind CSS v4 | ^4 |
| Animasi | motion (motion/react) | ^12.40.0 |
| Smooth Scroll | lenis | ^1.3.23 |
| Ikon | lucide-react | ^1.17.0 |
| Font | Bricolage Grotesque (heading), Inter (body), Amiri (Quran) | Google Fonts via next/font |
| Hosting | Vercel Hobby (gratis) | — |
| Package Manager | npm | — |
| Google Sheets API | googleapis | ^173.0.0 |
| Analitik | @vercel/analytics, @vercel/speed-insights, @next/third-parties/google | — |
| Lainnya | clsx, tailwind-merge (via shadcn pattern) | — |

### Design System

**Warna (oklch equivalen di globals.css via @theme):**
- Primary: `#005231` (hijau gelap premium)
- On Primary: `#ffffff`
- Primary Container: `#1b6b45`
- Tertiary: `#5a4200` / `#775900` / gold accent (`#eec055` di shimmer)
- Surface: `#f2fcf7` (putih kehijauan)
- On Surface: `#141d1b`
- Glass: `rgba(255,255,255,0.6)` dengan `backdrop-blur-2xl`
- Border Precision: `rgba(27,107,69,0.15)`

**Font:**
- Heading: `--font-bricolage-grotesque` (semua h1-h4)
- Body: `--font-inter` (paragraf, nav, tombol)
- Quran: `--font-amiri` (teks arab, dalil)
- Mono: `--font-jetbrains-mono`

**Radius:**
- sm: 0.25rem, md: 0.75rem, lg: 1rem, xl: 1.5rem
- Tapi komponen sering pakai custom: rounded-[32px], rounded-[40px], rounded-[48px], rounded-[56px], rounded-[80px]

**Key CSS Classes:**
- `.shimmer-text` — efek gradien emas berkilau untuk teks utama
- `.bg-glass` — glassmorphism dengan backdrop-blur-2xl
- `.pb-safe` — padding-bottom dengan `env(safe-area-inset-bottom)` untuk mobile notch
- Shadow glass: `shadow-glass`, `shadow-glass-lg`, `shadow-glass-xl`
- **Mobile perf:** `@media (max-width: 640px)` — backdrop-blur dikurangi (8px → 2px) untuk performa

**Animasi Pattern (WAJIB diikuti):**
- Hero/heading: fade-up `initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}`
- Stagger grid: `variants` + `staggerChildren: 0.08` per item
- Sidebar kiri: `x: -30`, sidebar kanan: `x: 30`
- Ease curve universal: `[0.16, 1, 0.3, 1]` — **WAJIB `as const`** untuk TypeScript strict
- Duration: 0.5–0.7 detik
- delay: stagger 0.08–0.15
- Semua scroll reveal pakai `whileInView` + `viewport={{ once: true }}` + `initial`/`animate`

### Struktur Halaman

```
/                              → Beranda (HeroSection + FeatureGrid + DualCTACards + RuangDoa + AyatBlock)
/materi                        → Daftar semua bab, filter by kelas
/materi/[slug]                 → Detail bab (konten, dalil, dimensi, poin penting, video, nav prev/next)
/pendidik                      → Portal Pendidik (bento grid 4 fitur + PerangkatSection + statistik + RekapSection + CTA)
/game                          → Game portal (3 card link game Canva eksternal)
/evaluasi                      → Portal kuis (filter by kelas + welcome guide + QuizEngine login/siswa/latihan)
/video                         → Video gallery filter by kelas + tag
/hafalan                       → Flashcard hafalan dalil + Daily Hadits
/dalil/al-isra-34              → Analisis dalil QS Al-Isra:34 (3 varian mobile)
/tentang                       → Filosofi, pendiri, visi misi
/peserta-didik                 → Placeholder "Segera Hadir"
/api/doa                       → REST API: POST submit doa + GET fetch list
/api/siswa/cek                 → REST API: POST verifikasi siswa (Nama + TTL)
/api/kuis/selesai              → REST API: POST simpan hasil kuis + notif Telegram
/api/kuis/rekap                → REST API: GET merge DaftarSiswa + RekapNilai
```

### Struktur Komponen

```
src/
├── app/
│   ├── layout.tsx             → Root layout (fonts, metadata, Providers, Navbar, Footer, FloatingWA)
│   ├── page.tsx               → Beranda (komposisi 4 section)
│   ├── globals.css            → Tailwind v4 + @theme + custom CSS (shimmer, float, reduced motion)
│   ├── favicon.ico            → Favicon fallback (32x32)
│   ├── icon.svg               → Ikon utama website vector (PAI.svg)
│   ├── icon.png               → Ikon website PNG (512x512)
│   ├── apple-icon.png         → Ikon Apple (180x180)
│   ├── opengraph-image.png    → Banner share sosial media (1200x630)
│   ├── game/page.tsx          → 3 card link game eksternal
│   ├── materi/
│   │   ├── page.tsx           → Listing bab, filter kelas, stagger grid cards
│   │   └── [slug]/page.tsx    → Server component, generateStaticParams, render MateriDetailClient
│   ├── pendidik/page.tsx      → Portal Pendidik (4 feature cards + PerangkatSection + statistik + RekapSection + CTA)
│   ├── peserta-didik/page.tsx → Placeholder
│   └── tentang/page.tsx       → Filosofi, pendiri, visi misi
├── components/
│   ├── beranda/
│   │   ├── HeroSection.tsx    → Hero (badge DL, headline, deskripsi, 4 CTA buttons, card preview)
│   │   ├── FeatureGrid.tsx    → 4 feature cards (Materi, Video, Game, Kuis) stagger grid
│   │   ├── DualCTACards.tsx   → 2 cards (Dashboard Pengajar + Hub Siswa)
│   │   ├── AyatBlock.tsx      → Hadits HR. Muslim (bg hitam + gold)
│   │   └── RuangDoa.tsx       → Prayer wall form + live feed (Google Sheets)
│   ├── layout/
│   │   ├── Navbar.tsx         → Fixed top, 6 nav items, active dot indicator
│   │   ├── BottomTabBar.tsx   → Mobile bottom nav (5 tabs, active line indicator, min touch 44px)
│   │   ├── Footer.tsx         → 3 kolom (brand, navigasi, kontak sosial media)
│   │   └── FloatingWA.tsx     → WA button fixed bottom-right
│   ├── materi/
│   │   └── MateriDetailClient.tsx → Full detail page (hero, sidebar, content, dalil, dimensi, video, nav pills)
│   ├── evaluasi/
│   │   ├── QuizEngine.tsx     → Quiz state machine (login→intro→playing→result) + auto-submit API
│   │   └── QuizLogin.tsx      → Mode selection (Siswa Resmi vs Latihan) + form verifikasi
│   └── providers/
│       └── Providers.tsx      → Lenis + MotionConfig
├── data/
│   ├── materi.ts              → 9 bab (484 baris) — interface + content
│   ├── soal.ts                → 8 bab × 25 soal PG — bank soal kuis
│   ├── hafalan.ts             → 9 dalil hafalan — flashcard content
│   └── dalil.ts               → Data analisis dalil QS Al-Isra:34
├── lib/
│   ├── utils.ts               → cn() utility
│   ├── google-sheets.ts       → JWT client (appendRow, readRows, findRow)
│   └── telegram.ts            → sendTelegram helper (Promise.all both chat ID)
└── app/api/
    ├── doa/route.ts           → POST submit doa + GET fetch list
    ├── siswa/cek/route.ts     → POST verifikasi nama + TTL
    └── kuis/
        ├── selesai/route.ts   → POST simpan hasil + notif Telegram
        └── rekap/route.ts     → GET merge DaftarSiswa + RekapNilai
```
 
### CDN — Cloudflare Workers Proxy

**Lokasi:** `workers/akal-centre/`

```
workers/
└── akal-centre/
    ├── index.ts        → Worker script (reverse proxy ke Vercel)
    └── wrangler.jsonc  → Config Worker (name: akal-centre)
```

**Arsitektur:**
```
User → https://akal-center.wimxgooo.workers.dev (Cloudflare Edge)
              ↓ proxy
       https://ahmad-katsiri-agung.vercel.app (Vercel origin)
```

**Caching strategy di Worker:**
| Tipe Path | Cache-Control | Alasan |
|-----------|--------------|--------|
| `/_next/static/*` | `max-age=31536000, immutable` | File hash, never change |
| `/pdf/*`, gambar, font | `max-age=604800` (1 minggu) | Static assets jarang berubah |
| Halaman HTML | `max-age=300` (5 menit) | Static page, cepat update |
| `/api/*` | No cache (passthrough) | Data real-time dari Sheets |

**Keuntungan:**
- URL branded: `akal-center.wimxgooo.workers.dev` (bukan Vercel default)
- CDN global Cloudflare edge
- Bisa tambah custom logic (redirect, rewrite, header mod)
- Worker free plan: 100k req/hari — cukup untuk project skala sekolah

### Data Materi (9 Bab)

File `src/data/materi.ts` — interface + semua konten inline (bukan dari API/DB).

| Slug | Kelas | Bab | Label | Video |
|------|-------|-----|-------|-------|
| `beriman-kepada-malaikat` | 7 | 1 | AKIDAH | ❌ |
| `membiasakan-tabayyun-menjauhi-ghibah` | 7 | 2 | AKHLAK | ❌ |
| `salat-mencegah-perbuatan-keji-dan-mungkar` | 7 | 3 | AKHLAK | ❌ |
| `amanah-dan-jujur` | 8 | 1 | AKHLAK | ✅ YouTube |
| `beriman-kepada-kitab-allah` | 8 | 2 | AKIDAH | ✅ YouTube |
| `beriman-kepada-nabi-dan-rasul` | 8 | 3 | AKIDAH | ❌ |
| `adab-dalam-islam` | 9 | 1 | AKHLAK | ❌ |
| `beriman-kepada-hari-akhir` | 9 | 2 | AKIDAH | ❌ |
| `beriman-kepada-qada-dan-qadar` | 9 | 3 | AKIDAH | ❌ |

**Interface `BabMateri` — Field lengkap:**
```typescript
export interface BabMateri {
  slug: string           // unique, jadi key di Record
  title: string          // judul bab
  kelas: 7 | 8 | 9       // untuk filter
  bab: number            // urutan dalam kelas
  babLabel: string       // "AKIDAH" | "AKHLAK"
  ringkasan: string      // 1 kalimat
  subTopik: number       // hitung manual
  waktuBaca: string      // "5 MIN BACA"
  icon: string           // emoji unicode
  videoUrl?: string      // YouTube embed URL (https://www.youtube.com/embed/VIDEO_ID)
  dalil?: { surah, arab, arti }
  dimensi?: [{ nomor, judul, deskripsi }]  // 4 dimensi (Olah Hati/Rasa/Pikir/Raga)
  poinPenting: string[]  // 4-6 poin
  pendahuluan: string    // 1-2 kalimat
  konten: [{ judul, isi }]  // array section
  prevSlug?, prevTitle?, nextSlug?, nextTitle?  // navigasi berurutan
}
```

**Data disimpan langsung di file** sebagai `Record<string, BabMateri>` — bukan dari API. Ini static site, Vercel Hobby gratis, tidak pakai database.

### PDF Modul Ajar

9 file PDF di `public/pdf/` — total 4.3 MB. Di-link dari halaman detail materi via tombol "Unduh PDF Ringkasan" di sidebar kanan.

Path: `/pdf/{slug}.pdf` — diakses langsung dari browser.

---

## DAMPAK — Keputusan & Konsekuensi

### ✅ Keputusan yang Sudah Diambil

| Keputusan | Alasan | Dampak |
|-----------|--------|--------|
| **Repo Public** | Vercel Hobby gagal build dari repo private (beda commit author) | Semua file bisa dilihat publik. Tidak ada secret/API key di repo. |
| **vercel.json** framework: nextjs | Vercel project dibuat sebelum push, framework terdeteksi null | Tanpa ini, deploy sukses tapi 404 semua halaman. |
| **Static Site (no DB)** | Data di inline TS file, bukan API/DB | Build lebih cepat, deploy gratis, konten update harus edit file |
| **videoUrl field** | Client punya channel YouTube, video embed langsung | Harus tambah field di interface + data + komponen. Template future-proof. |
| **Game external links** | Canva tidak bisa di-iframe (X-Frame-Options: SAMEORIGIN) | Game buka tab baru, bukan embed. |
| **AyatBlock bg hitam** | Nuansa hadits HR. Muslim lebih khidmat dengan black + gold | Perubahan CSS minor, efek visual signifikan. |
| **3 pilar Deep Learning** | Arahan klien: Mindful → Meaningful → Joyful | Messaging di hero, metadata, feature grid, tentang diubah dari PAI ke DL Akidah Akhlak |
| **No login page** | Instruksi klien | Semua konten publik, tidak ada autentikasi |
| **Kurikulum Merdeka** | Koreksi klien: istilah "Kurikulum Terpadu 2026" salah | Harus konsisten di semua halaman materi |
| **Penggantian Logo & Favicon** | Penggantian logo Vercel segitiga bawaan Next.js dengan logo PAI | Mengonversi PAI.svg ke favicon.ico, icon.png, icon.svg, apple-icon.png, dan opengraph-image.png, serta mengintegrasikan logo ke Navbar, Footer, dan kartu ilustrasi Hero. |

### ⚠️ Jebakan yang Pernah Terjadi (DOKUMENTASI PENTING)

1. **Vercel + Private Repo:** Hobby plan tidak support private repo jika commit author berbeda dari Vercel owner. Fix: `gh repo edit wimxwim/ahmad-katsiri-agung --visibility public`
2. **Vercel Framework Null:** Project dibuat sebelum push → framework auto-detection gagal. Fix: `vercel.json` dengan `{"framework": "nextjs"}`
3. **motion `as const`:** TypeScript strict mode, array ease `[0.16, 1, 0.3, 1]` harus dikasih `as const`. Lupa → TS error.
4. **Git config:** Git global user harus `wimxwim` — kalau beda, commit author mismatch dengan Vercel account.
5. **Canva iframe:** Canva site set `X-Frame-Options: SAMEORIGIN` — tidak bisa diembed. Harus link external.
6. **googleapis private_key `\n`:** JSON service account punya `\n` literal di private_key. Pas di `vercel env add`, harus di-pipe dari `node -e "..."` biar \n jadi actual newline. Copy manual dari JSON → Vercel UI gagal.
7. **CSS mobile perf backdrop-blur:** `backdrop-blur-2xl` di mobile low-end HP lemot. Fix: `@media (max-width: 640px)` override jadi `backdrop-blur-[2px]`.
8. **vercel env add duplicate:** Kalau env var sudah ada, `--force` flag harus dipakai untuk overwrite.

---

## EFFORT — Riwayat Pekerjaan

### Sesi 1 (9 Juni 2026) — Inisialisasi & Build Awal
**Effort: ~4-5 jam**
- Setup Next.js 16.2.7 + Tailwind v4 + TypeScript
- Design system: 28 warna, 4 font, 4 shadow, custom radius
- Layout: Navbar (fixed, hamburger mobile), Footer, FloatingWA
- Beranda: HeroSection, FeatureGrid (4 cards), DualCTACards, AyatBlock (bg hitam)
- 3 placeholder pages: /game, /peserta-didik, /tentang
- Portal Pendidik: bento grid (4 feature cards), counter, CTA

### Sesi 2 (9 Juni 2026) — Data Materi & Konten
**Effort: ~5-6 jam**
- Interface `BabMateri` dirancang (16 field, nested objects)
- 9 bab di-populate dari 9 PDF modul ajar
- Total: 484 baris data, 9217 baris di commit pertama (`git diff --stat`)
- Setiap bab: 5-8 sub-topik konten, dalil Quran (arab + arti), 4 dimensi, 4-6 poin penting
- Navigasi prev/next antar bab berurutan per kelas

### Sesi 3 (9 Juni 2026) — Detail Materi & PDF
**Effort: ~2-3 jam**
- Halaman `/materi/[slug]` — detail bab lengkap dengan hero, sidebar, konten, dalil, dimensi, poin penting, navigasi
- 9 PDF modul ajar dicopy ke `public/pdf/` (total 4.3 MB)
- Stitch HTML dari Downloads (untuk referensi, belum diintegrasi penuh)

### Sesi 4 (9 Juni 2026) — Deploy & Jebakan
**Effort: ~1 jam**
- Git push + Vercel deploy pertama → 404
- Debug: vercel.json → framework: nextjs → deploy sukses
- Repo private → publik (karena Vercel Hobby limitation)
- 18 halaman statis build sukses, semua 200 OK

### Sesi 5 (9 Juni 2026) — Reframe & Kontak
**Effort: ~1 jam**
- Theme reframe: "PAI" → "Deep Learning Akidah Akhlak" (6 file berubah)
- "Kurikulum Terpadu 2026" → "Kurikulum Merdeka"
- Footer + FloatingWA: kontak real (WA, IG, TikTok, YouTube)
- Playbook update: Vercel deploy pitfalls, Template 5, checklist deploy

### Sesi 6 (9 Juni 2026) — Game & Video
**Effort: ~1 jam**
- Game page: dari "Segera Hadir" → 3 card link Canva eksternal
- `videoUrl` field ditambah ke interface + data
- 2 video YouTube embedded: Amanah & Jujur (kelas 8), Beriman kepada Kitab Allah (kelas 8)
- AyatBlock: bg #05111d → black (#000000)

### Sesi 7 (9 Juni 2026) — Integrasi Logo PAI & Favicon
**Effort: ~45 menit**
- Konversi `PAI.svg` menjadi `favicon.ico` (32x32), `icon.png` (512x512), `icon.svg` (vector copy), dan `apple-icon.png` (180x180) di `src/app/`
- Konversi `PAI.svg` menjadi `opengraph-image.png` (1200x630) dengan latar belakang `#f2fcf7` untuk preview share WhatsApp/sosmed
- Menyalin `PAI.svg` ke `public/logo.svg`
- Update `metadataBase` di `src/app/layout.tsx` ke URL produksi
- Integrasi logo ke `Navbar.tsx`, `Footer.tsx`, dan `HeroSection.tsx` (kartu pratinjau utama)
- Menambahkan panduan pengubahan logo/favicon ke `RINGKASAN_KLIEN.md`
- Deploy ke Vercel production dan push ke GitHub



### Sesi 8 (10 Juni 2026) — Fitur Interaktif: Doa, Kuis, Sheets, Telegram
**Effort: ~3-4 jam**
- Ruang Doa & Ucapan di landing page + API `POST/GET /api/doa`
- Sistem login kuis (Siswa Resmi verifikasi Nama+TTL vs Latihan Umum)
- 3 API routes: `/api/siswa/cek`, `/api/kuis/selesai`, `/api/kuis/rekap`
- Google Sheets integration via Service Account (DaftarSiswa, DoaUcapan, RekapNilai)
- Telegram dual-chat notification (doa baru + hasil kuis)
- Rekap nilai table di `/pendidik`
- Navbar + BottomTab active indicator (dot/line)
- Welcome guide di `/evaluasi` (step 1-2-3)
- CTA "Masuk Kuis Siswa" di Hero landing page
- Filter button mobile: disamain dengan `/materi` (ukuran kecil, label ringkas)
- Telegram bot @AKAL_Centre_bot aktif

### Sesi 9 (10 Juni 2026) — Perangkat Ajar + Rebrand
**Effort: ~2 jam**
- Copy 8 PDF (PROTA, PROSEM, ATP kelas 7/8/9) ke `public/pdf/perangkat/`
- Ganti card "Perangkat" di `/pendidik` jadi download section per kelas (tab 7/8/9)
- PROTA Kelas 8 belum ada filenya — ditampilkan "Belum tersedia"
- Rebrand: "Aggung Learning" → "AKAL Center" di seluruh halaman (Navbar, Footer, Hero, Tentang, metadata, PWA manifest)
- Tagline baru: "Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning"
- Perbaiki schema JSON-LD description
- Tambah env `TELEGRAM_CHAT_ID_2` untuk notif dual chat

### Sesi 10 (10 Juni 2026) — Cloudflare Workers CDN
**Effort: ~30 menit**
- Buat Worker `akal-centre` di Cloudflare sebagai reverse proxy CDN untuk Vercel
- Worker script: proxy + cache static assets di edge (Next.js static, PDF, gambar)
- URL CDN gratis: `https://akal-center.wimxgooo.workers.dev`
- Update AGENTS.md dengan section CDN arsitektur
- Tambah script `deploy:cdn` dan `deploy:all` di package.json

## Belum Selesai / Bisa Dilanjutkan

| Item | Status | Effort Estimasi | Keterangan |
|------|--------|-----------------|------------|
| PROTA Kelas 8 | 🔲 Belum | — | Minta file PDF ke Bang Agung |
| `untuk-pendidik/` — Pusat Komando | 🔲 Belum | 1-2 jam | Stitch HTML sudah ada di Downloads |
| `analisis-dalil/` — QS Al-Isra:34 | 🔲 Belum | 1 jam | 3 varian mobile di stitch Downloads |
| `/peserta-didik` | 🔲 Placeholder | 30-60 menit | Tanya klien mau isi apa |
| PPT slide decks (9 file) | 🔲 Belum | 1 jam | Link di halaman materi |
| Custom domain (berbayar) | 🔲 Belum | 30 menit | Beli domain → arahkan ke Cloudflare |
| Video bab lain (7 bab belum) | ⏳ Seadanya | 10 menit/video | Tunggu link YouTube |
| Telegram ID Bang Agung | 🔲 Belum | 5 menit | Nunggu hasil @userinfobot |
| Buku PAI PDF Kls 7/8/9 | 🔲 Belum | 15 menit | Link di materi ajar |

### Stitch Materials (Referensi untuk Halaman Baru)

Lokasi: `/home/ngome/Downloads/stitch_aggung_learning_platform/`

| Folder | Isi | Untuk Halaman |
|--------|-----|--------------|
| `modul-ajar/` | 9 PDF (sudah diproses ke materi.ts) | ✅ Selesai |
| `ppt/` | 9 slide deck PDF | Belum diintegrasi |
| `untuk_pendidik_.../` | HTML resource grid "Pusat Komando" | `untuk-pendidik/` |
| `analisis_dalil_.../` | 3 varian mobile QS Al-Isra:34 | `analisis-dalil/` |

---

## Cara Menambahkan Video Baru

1. Buka `src/data/materi.ts`
2. Cari entry bab (misal `"adab-dalam-islam"`)
3. Tambah baris: `videoUrl: "https://www.youtube.com/embed/VIDEO_ID",` (setelah `icon`)
4. Format embed URL: `https://www.youtube.com/embed/` + VIDEO_ID (dari link youtube `watch?v=` atau `youtu.be/`)
5. Build: `npx next build` → commit + push → `npx vercel --prod --yes`

## Cara Deploy

### Deploy Full (Build + CDN + Vercel)
```bash
npm run deploy:all
```

### Deploy Terpisah
```bash
# Build dulu
npx next build

# Deploy CDN Worker ke Cloudflare
npm run deploy:cdn

# Deploy ke Vercel
git add -A
git commit -m "deskripsi perubahan"
git push origin main
npx vercel --prod --yes
```

**PENTING:** Cek git config dulu: `git config --global user.name` harus `wimxwim`.
**PENTING:** Jangan lupa `vercel.json` — file ini critical untuk framework detection.
**PENTING:** Build dulu di lokal (`npx next build`) sebelum push — cek zero errors.

## Environment & Config Files

- `vercel.json` — `{"framework": "nextjs"}` (WAJIB, jangan hapus)
- `package.json` — Next.js 16.2.7 pinned
- `next.config.ts` — (tidak ada file terpisah? Cek di root)
- `.gitignore` — standar Next.js
- `tsconfig.json` — strict mode

---

## Warna & Font Reference Cepat

```css
/* Primary brand */
--color-primary: #005231;        /* Hijau gelap */
--color-tertiary: #5a4200;       /* Gold/coklat */
--color-tertiary-container: #775900;

/* Shimmer gold gradient */
.shimmer-text {
  background: linear-gradient(90deg, #eec055, #ffdf9b, #eec055, #ffdf9b);
}

/* Glass card formula */
bg-glass = backdrop-blur-2xl + border border-border-precision + shadow-glass + rounded-[32px]
```

---

## Fitur Tambahan (Sesi 8 — 10 Juni 2026)

### Ruang Doa & Ucapan
- **Komponen:** `src/components/beranda/RuangDoa.tsx`
- **Lokasi:** Landing page (`/`) antara DualCTACards dan AyatBlock
- **API:** `POST /api/doa` (kirim) + `GET /api/doa` (ambil daftar)
- **Storage:** Google Sheets — tab `DoaUcapan` (kolom: ID, Nama, Isi, Waktu)
- **Notifikasi:** Setiap doa baru → notif Telegram ke Pak Aggung

### Kuis — Mode Siswa Resmi + Latihan Umum
- **Komponen Login:** `src/components/evaluasi/QuizLogin.tsx`
- **Alur:** Login → Intro → Soal → Hasil → Notif Telegram
- **Mode Siswa Resmi:** Verifikasi Nama + Tanggal Lahir ke Sheet `DaftarSiswa`
- **Mode Umum/Latihan:** Nama panggilan opsional, tanpa verifikasi
- **API:**
  - `POST /api/siswa/cek` — verifikasi siswa
  - `POST /api/kuis/selesai` — simpan hasil + notif Telegram
- **Storage:** Google Sheets — tab `RekapNilai` (kolom: ID, Nama, Kelas, Status, Bab, Skor, Total, Tanggal)
- **Notifikasi:** Format pesan panjang detail jawaban salah

### Rekap Nilai di Portal Pendidik
- **Lokasi:** `/pendidik` — section "Rekap Nilai Siswa"
- **API:** `GET /api/kuis/rekap`
- **Fitur:** Tabel siswa (sudah/belum), skor, filter per kelas

### Library & Infra
- **`src/lib/google-sheets.ts`** — Shared client untuk baca/tulis Google Sheets via Service Account
- **`src/lib/telegram.ts`** — Shared helper kirim notifikasi ke Telegram Bot
- **Env vars:** `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

### Setup Google Sheets
1. Buat project di `console.cloud.google.com` → Enable Google Sheets API
2. Buat Service Account → download JSON → simpan `client_email` + `private_key` di Vercel Env
3. Share spreadsheet dengan email Service Account
4. Buat 3 sheet tabs: `DaftarSiswa` | `DoaUcapan` | `RekapNilai`
5. `DaftarSiswa` kolom: No, NamaLengkap, Kelas, TanggalLahir

### Setup Telegram Bot
1. `@BotFather` → `/newbot` → dapatkan token → simpan di Vercel Env
2. `@userinfobot` → dapatkan chat_id
3. Notif dikirim: saat doa baru + saat kuis selesai

## Catatan Khusus

- **Rebrand:** "Aggung Learning" sudah diganti → "AKAL Center" di semua halaman publik.
- **Tagline:** "Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning" — dipakai di Hero, Footer, metadata, dan schema.
- **Dual Telegram:** Notif dikirim ke `TELEGRAM_CHAT_ID` (primary) + `TELEGRAM_CHAT_ID_2` (secondary) secara paralel.
- **Tidak ada halaman login** — instruksi klien.
- **Semua halaman statis** — tidak ada server component yang fetch data runtime.
- **Mode production: static generation** — `generateStaticParams` untuk dynamic routes.
- **Favicon:** Sudah diganti menggunakan PAI.svg (dikonversi ke .ico, .png, dan .svg di folder src/app serta public/logo.svg untuk branding visual).
- **Font:** Bricolage Grotesque untuk heading, Inter body, Amiri Quran — sudah di next/font dengan display:swap.
- **MotionConfig** reducedMotion:"user" — menghormati preferensi aksesibilitas.
- **WA number:** 6285158795502 (+6285) — di FloatingWA.tsx dan Footer.
- **Sosial media:** IG @ahmadkatsiria, TikTok @sir.ahmd, YouTube "Ahmad Katsiri Agung".
- **All layouts:** Mobile-first responsive responsive (`px-3 sm:px-5 lg:px-8`, `text-xs md:text-sm` pattern di SEMUA halaman — 15+ file).

---

## Trigger Prompt untuk AI Berikutnya

```
Lanjutkan project AKAL Center. Baca file AGENTS.md di root folder
project ini untuk detail lengkap. Cek STATUS dan apa yang perlu dikerjakan
selanjutnya. Update file ini jika ada perubahan.
```
