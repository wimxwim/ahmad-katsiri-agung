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
| **Domain** | Utama: `https://akalcenter.my.id` (Cloudflare, proxied) <br> Vercel: `https://ahmad-katsiri-agung.vercel.app` (DI-BLOCK, 403 Forbidden) <br> CDN Worker: `https://akal-center.wimxgooo.workers.dev` |
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
| Smooth Scroll | ~~lenis~~ (REMOVED — native scroll instead) | — |
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
│       └── Providers.tsx      → MotionConfig (Lenis REMOVED — native scroll)
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
User → https://akalcenter.my.id (Cloudflare Edge)
              ↓ proxy (Worker route: akalcenter.my.id/*)
       akal-center.wimxgooo.workers.dev (Worker)
              ↓ fetch + X-From-Worker header
       https://ahmad-katsiri-agung.vercel.app (Vercel origin)
              ↓ vercel.json bypass rule
       200 OK (karena ada X-From-Worker header)
```

**Vercel URL Block:**
- Browser langsung akses `ahmad-katsiri-agung.vercel.app` → tidak punya header → rule deny → **403 Forbidden**
- Worker proxy Vercel → kirim `X-From-Worker: akal-center` → rule continue → 200 OK
- Rule di `vercel.json` (bukan Vercel Firewall WAF — Hobby plan tidak support)
- Worker route di Cloudflare: zone route (bukan custom_domain — custom_domain butuh Pro plan)

**Caching strategy di Worker:**
| Tipe Path | Cache-Control | Alasan |
|-----------|--------------|--------|
| `/_next/static/*` | `max-age=31536000, immutable` | File hash, never change |
| `/pdf/*`, gambar, font | `max-age=604800` (1 minggu) | Static assets jarang berubah |
| Halaman HTML | `max-age=300` (5 menit) | Static page, cepat update |
| `/api/*` | No cache (passthrough) | Data real-time dari Sheets |

**Keuntungan:**
- URL branded: `akalcenter.my.id` (bukan Vercel default)
- CDN global Cloudflare edge + caching + security headers
- Bisa tambah custom logic (redirect, rewrite, header mod)
- Worker free plan: 100k req/hari — cukup untuk project skala sekolah
- Vercel URL ter-block (403), user hanya bisa akses via domain utama

### Data Materi (14 Bab)

File `src/data/materi.ts` — interface + semua konten inline (bukan dari API/DB).

| Slug | Kelas | Bab | Label | Video |
|------|-------|-----|-------|-------|
| `beriman-kepada-malaikat` | 7 | 1 | AKIDAH | ❌ |
| `membiasakan-tabayyun-menjauhi-ghibah` | 7 | 2 | AKHLAK | ❌ |
| `salat-mencegah-perbuatan-keji-dan-mungkar` | 7 | 3 | AKHLAK | ❌ |
| `melestarikan-alam-cerminan-orang-beriman` | 7 | 4 | AKHLAK | ❌ |
| `amanah-dan-jujur` | 8 | 1 | AKHLAK | ✅ YouTube |
| `beriman-kepada-kitab-allah` | 8 | 2 | AKIDAH | ✅ YouTube |
| `beriman-kepada-nabi-dan-rasul` | 8 | 3 | AKIDAH | ❌ |
| `membangun-toleransi` | 8 | 4 | AKHLAK | ❌ |
| `moderasi-beragama` | 8 | 5 | AKHLAK | ❌ |
| `adab-dalam-islam` | 9 | 1 | AKHLAK | ❌ |
| `beriman-kepada-hari-akhir` | 9 | 2 | AKIDAH | ❌ |
| `beriman-kepada-qada-dan-qadar` | 9 | 3 | AKIDAH | ❌ |
| `semangat-mencari-ilmu` | 9 | 4 | AKHLAK | ❌ |
| `manusia-khalifah-di-muka-bumi` | 9 | 5 | AKIDAH | ❌ |

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

### PDF Modul Ajar & Perangkat

**Modul Ajar:** 9 file PDF di `public/pdf/` (4.3 MB). Di-link dari halaman detail materi via tombol "Unduh PDF Ringkasan" di sidebar kanan. Path: `/pdf/{slug}.pdf`

**Perangkat Ajar:** PROTA, PROSEM, ATP di `public/pdf/perangkat/` — link download di `/pendidik` per kelas (tab 7/8/9).

**PPT Slide Deck:** 5 file PPT di `public/ppt/` — link di halaman `/materi` via tombol "Unduh PPT".

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
| **Cloudflare Worker CDN** | Reverse proxy di depan Vercel untuk branded domain + cache + security headers | Perlu update header X-From-Worker biar Vercel bisa bedain mana request dari Worker vs langsung |
| **Domain akalcenter.my.id via Rumahweb** | Klien minta domain branded, bukan Workers.dev subdomain | Rp35.000, NS arah ke Cloudflare, biaya tahunan |
| **vercel.json deny .vercel.app** | Block akses langsung ke Vercel URL | Worker pakai header bypass supaya tidak ikut ke-block |
| **Vercel Hobby tidak bisa firewall rule** | Hobby plan tidak support Vercel Firewall WAF custom rules | Solusi: pakai `vercel.json` route with `mitigate: { action: "deny" }` |
| **Cloudflare zone route vs custom_domain** | custom_domain butuh Pro plan ($20/bulan) | Pakai zone route (gratis) — `akalcenter.my.id/*` |
| **Lenis dihapus** | Dual RAF loop (Lenis + motion) bikin jank di desktop | Native scroll aja, lebih smooth tanpa dual scheduler conflict |
| **Optimistic append di RuangDoa** | Pengguna baru submit → langsung muncul tanpa nunggu GET ulang | UX lebih responsif, network request minimal |
| **content-visibility: auto** | Optimasi render di section bawah fold | Chrome skip layout section yang belum di-scroll |
| **Avatars WebP 48px** | Avatar PNG 500KB+ diperkecil ke WebP 48px ~600B | 3 avatar total <2KB (dari ~1.5MB) — signifikan buat mobile |

### ⚠️ Jebakan yang Pernah Terjadi (DOKUMENTASI PENTING)

1. **Vercel + Private Repo:** Hobby plan tidak support private repo jika commit author berbeda dari Vercel owner. Fix: `gh repo edit wimxwim/ahmad-katsiri-agung --visibility public`
2. **Vercel Framework Null:** Project dibuat sebelum push → framework auto-detection gagal. Fix: `vercel.json` dengan `{"framework": "nextjs"}`
3. **motion `as const`:** TypeScript strict mode, array ease `[0.16, 1, 0.3, 1]` harus dikasih `as const`. Lupa → TS error.
4. **Git config:** Git global user harus `wimxwim` — kalau beda, commit author mismatch dengan Vercel account.
5. **Canva iframe:** Canva site set `X-Frame-Options: SAMEORIGIN` — tidak bisa diembed. Harus link external.
6. **googleapis private_key `\n`:** JSON service account punya `\n` literal di private_key. Pas di `vercel env add`, harus di-pipe dari `node -e "..."` biar \n jadi actual newline. Copy manual dari JSON → Vercel UI gagal.
7. **CSS mobile perf backdrop-blur:** `backdrop-blur-2xl` di mobile low-end HP lemot. Fix: `@media (max-width: 640px)` override jadi `backdrop-blur-[2px]`.
8. **vercel env add duplicate:** Kalau env var sudah ada, `--force` flag harus dipakai untuk overwrite.
9. **Lenis + motion conflict:** Dual RAF loop bikin jank. Fix: hapus Lenis, pake native scroll.
10. **Avatar PNG 500KB:** Tiga avatar >1.5MB total. Fix: convert ke WebP 48px → total <2KB.
11. **hover:gap-3 reflow:** Gap change trigger layout recalc. Fix: ganti jadi translate-x animasi.
12. **transition-all performance:** Setiap hover trigger ulang 7+ properti (layout, paint, composite). Fix: ganti transition jadi properti spesifik (transform, opacity, shadow).
13. **animate-ping jank:** Ping infinite animation pake CPU. Fix: dihapus total.
14. **reduced motion not respected:** Shimmer animasi tetep jalan walau user set prefers-reduced-motion. Fix: tambah `@media (prefers-reduced-motion: reduce)`.
15. **blur radius besar:** `blur-[120px]` bikin paint cost tinggi. Fix: turunin ke 60px.
16. **vercel.json continue bypass:** Rule pertama `continue: true` tidak skip route selanjutnya — deny tetap ke-eksekusi karena Host masih match. Fix: jangan pakai `continue`, langsung pakai `missing` array dalam satu route rule.
17. **Domain akalcenter.my.id dari Rumahweb:** NS harus manual diganti di panel Rumahweb. Butuh ~5 menit propagasi. Jangan lupa ganti nameserver default ke Cloudflare.
18. **Cloudflare API Token SSL:** Token harus punya permission `SSL and Certificates:Edit`. Token tanpa SSL edit permission tidak bisa enable HSTS/Always Use HTTPS via API.
19. **Wrangler route vs custom_domain:** Worker route di Cloudflare (akalcenter.my.id/*) butuh zone-based routing, bukan custom_domain. custom_domain butuh Workers Paid plan. Jebakan: route baru muncul kalau zone udah aktif.
20. **Foto lama muncul di HP setelah diganti:** Foto di halaman `/tentang` tampil baru di desktop tapi lama di HP. Penyebab: Cloudflare Worker cache max-age 1 minggu untuk gambar. Fix: tambah `?v=2` di URL gambar (cache-busting query param). Atau purge Cloudflare cache via dashboard.

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

### Sesi 11 (11 Juni 2026) — Performa, Domain, Keamanan & Block
**Effort: ~4 jam**

**Detail tanya-jawab, masalah & penyelesaian (28 issue):**

| # | Masalah | Penyebab | Solusi | Tanya-Jawab |
|---|---------|----------|--------|------------|
| 1 | Scroll jank di desktop | Dual RAF loop: Lenis + motion berebut scheduler | Hapus Lenis dari Providers.tsx, pake native scroll | User nanya "kok scrollnya berat?" → Cek, ternyata Lenis & motion jalan berdua |
| 2 | 3 avatar loading lambat | File PNG 500KB+ masing-masing (total ~1.5MB) | Convert ke WebP 48px ~600B (total <2KB) | User: "gambar lambat" → Hitung size, ganti format, turun drastis |
| 3 | Hover card di FeatureGrid reflow | `hover:gap-3` trigger layout recalc (ubah gap = recalc semua) | Ganti `gap-3` jadi `translate-x` (composite only) | Debug: lihat di DevTools Performance → layout shift detected |
| 4 | CPU tinggi dari HeroSection | `animate-ping` infinite animation | Hapus `animate-ping`, ganti static glow | User: "HP jadi panas" → Cari animasi looping, hapus |
| 5 | Shimmer gold teks tetap jalan di reduced motion | Tidak ada `prefers-reduced-motion` query | Tambah `@media (prefers-reduced-motion: reduce)` di globals.css | User: "aksesibilitas" → Cek, tambah media query |
| 6 | Blur gradient background lemot | `blur-[120px]` — paint cost sangat tinggi | Turunkan jadi `blur-[60px]` | Profiling: blur >60px diminishing returns |
| 7 | Hover 7+ properti trigger ulang | `transition-all` — setiap hover recalc layout+paint+composite | Ganti `transition-transform`, `transition-opacity`, `transition-shadow` | Best practice: spesifik > all |
| 8 | Section bawah fold ikut render padahal belum dilihat | Chrome render semua section sekali | Tambah `content-visibility: auto` di wrapper section | User: "loading lambat" → Cek, skip render section bawah |
| 9 | Doa baru submit lambat muncul | Setiap submit → POST → GET ulang → render | Optimistic append: langsung push ke array lokal, nunggu confirm dari API | User: "doa kenapa delay?" → tambah logic optimistic |
| 10 | "AKAL Centre" vs "AKAL Center" | Ejaan British vs American English | Rebrand semua halaman: Navbar, Footer, Hero, metadata, schema, PWA → "Center" | User WA klien → jawab "AKAL Center" (English US) |
| 11 | Belum punya domain branded | Cuma pake Vercel + Workers.dev subdomain | Beli `akalcenter.my.id` via Rumahweb Rp35.000 | User: "minta domain .my.id" → cek ketersediaan → beli |
| 12 | Nameserver masih default Rumahweb | Setelah beli domain, NS指向 ke ns1.rumahweb.com | Ganti manual di panel Rumahweb → amalia.ns.cloudflare.com / norm.ns.cloudflare.com | User: "domain kok belum aktif?" → Butuh 5 menit propagasi |
| 13 | DNS CNAME pilih proxied atau DNS only | Proxy (orange cloud) = Cloudflare edge aktif, DNS only = bypass | ✅ CNAME @ dan www pakai proxied (orange cloud) | User: "mau pake Cloudflare" → orange cloud = kena WAF |
| 14 | www redirect loop | CNAME www → @ dengan proxied → infinite loop | Cloudflare Page Rule: forward www.akalcenter.my.id → https://akalcenter.my.id (301) | Tes: curl www → loop → bikin page rule fix |
| 15 | SSL masih Flexible (tidak aman) | Cloudflare default SSL/TLS = Flexible | Ganti ke Full (Strict) — Vercel punya sertifikat valid | User: "SSL harus kuat" → Strict = end-to-end encrypted |
| 16 | HSTS enable gagal via API Token | Token Cloudflare tidak punya permission SSL:Edit | Generate token baru dengan scope SSL and Certificates:Edit | Error 403 dari API → cek permission token |
| 17 | WAF Geo rule bentrok dengan rule lain | WAF rules evaluasi berurutan, bisa saling override | Hapus semua rules, bikin ulang: CN/RU/KP/IR → Managed Challenge | Rule pertama match → stop, sisanya gak ke-eksekusi |
| 18 | Rate Limiting /api/ susah di-set | Format path /api/ tidak cocok dengan regex worker | Path: `/api/*` → 5 requests per 10 detik → Block 10 detik | User: "api di-brute force" → rate limit prevent |
| 19 | Bot Fight Mode ON — cuma via dashboard | Cloudflare API token gak bisa set Bot Fight Mode | Manual enable di dashboard Cloudflare → Security → Bots | User: "anti hacker" → Bot Fight = detectable bot block |
| 20 | Auto Minify + Brotli — enable manual | Juga cuma via dashboard | Enable Speed → Optimization → Auto Minify (HTML/CSS/JS) + Brotli + 0-RTT | Optimasi loading tanpa kode |
| 21 | Worker route pake zone route, bukan custom_domain | custom_domain butuh Workers Paid ($20/bln), Hobby gak bisa | Pakai zone route di wrangler.jsonc: `akalcenter.my.id/*` dan `www.akalcenter.my.id/*` | Wrangler deploy sukses tapi route kosong → zone belum aktif |
| 22 | Vercel URL (.vercel.app) bisa diakses publik | Pengguna bisa langsung buka vercel.app | vercel.json: route deny dengan `missing` header check | User: "block vercel.app kayak gotongroyong" |
| 23 | Rule `continue: true` tetap kena deny | Vercel proses route berurutan; rule deny tetap match meskipun rule sebelumnya continue | Ganti: satu rule dengan `has: host .vercel.app` + `missing: x-from-worker` → deny | Tes: Worker dapet 403 → debugging → `continue` gak skip deny |
| 24 | Worker belum kirim header bypass ke Vercel | Worker proxy perlu identitas biar gak ke-block | Tambah `headers.set('X-From-Worker', 'akal-center')` di index.ts Worker | Sesuai arsitektur gotongroyong |
| 25 | metadataBase masih指向 .vercel.app | OG image, canonical URL, JSON-LD pake domain lama | Update metadataBase di layout.tsx → `https://akalcenter.my.id` | User: "share WhatsApp gambarnya broken" → fix |
| 26 | JSON-LD schema domain masih lama | Schema markup untuk SEO pake .vercel.app | Update `url` di JSON-LD ke domain baru | Google index pake domain salah |
| 27 | GitHub push ditolak — secret detected | Cloudflare API Token kebaca di AGENTS.md | Hapus token value dari file, ganti "lihat dashboard" | Push error: "Push cannot contain secrets" |
| 28 | Banyak Vercel deployment bertumpuk | Setiap `git push` + `vercel --prod` = 1 deployment baru | Normal behavior — hanya deployment terakhir yang aktif di production domain | User: "kok nambah vercel?" → Penjelasan |

**Ringkasan capaian:**
- **Perf fix (9):** Lenis→hapus, avatar→WebP, hover gap→translateX, ping→hapus, shimmer media query, blur 120→60, transition-all, content-visibility, optimistic append
- **Rebrand (1):** "AKAL Centre" → "AKAL Center"
- **Domain & DNS (3):** Beli, NS Cloudflare, CNAME proxied + www redirect
- **Cloudflare Security (6):** SSL Full Strict, HSTS, WAF Geo, Rate Limiting, Bot Fight, Minify/Brotli
- **Worker (3):** Zone route, caching, security headers
- **Vercel Block (2):** vercel.json `missing` deny + Worker header bypass
- **Metadata (2):** metadataBase + JSON-LD → akalcenter.my.id
- **Git (1):** Secret dihapus dari AGENTS.md
- **Deploy (2):** Worker + Vercel production
- **Alat (2):** package.json deploy scripts, tsconfig exclude workers

### Sesi 12 (11 Juni 2026) — 5 Bab Baru, Game, Verifikator, Foto, LCP
**Effort: ~2 jam**

| # | Perubahan | Detail |
|---|-----------|--------|
| 1 | **5 bab baru** | `melestarikan-alam` (7/4), `membangun-toleransi` (8/4), `moderasi-beragama` (8/5), `semangat-mencari-ilmu` (9/4), `manusia-khalifah-di-muka-bumi` (9/5) — total 14 bab |
| 2 | **Navigasi prev/next** | Semua bab baru punya prevSlug/nextSlug berurutan per kelas |
| 3 | **Game page update** | Tambah 3 game baru (Adab Islam, Melestarikan Alam, Toleransi), hapus 2 game lama (Ramadhan, Halal Haram) |
| 4 | **Tim Verifikator** | Tambah section 3 verifikator di `/tentang` (Sabilil, Ekawati, Hamam) |
| 5 | **Perbaiki nama verifikator** | Nama + gelar disesuaikan: Sabilil → M.Ed., Ph.D; Ekawati → Dr., M.A.; Hamam → Dr., M.A.; peran → Verifikator Ahli 1/2/3 |
| 6 | **Ganti foto Bang Agung** | Resize 400×400, 39KB (dari 87KB) — foto personal di halaman `/tentang` |
| 7 | **LCP optimasi** | Hero image konversi PNG→WebP (19KB), preload font heading, fetchPriority high, CSS fade-up tanpa nunggu JS |
| 8 | **PDF/PPT baru** | 5 modul ajar PDF + 5 PPT slide deck + PROTA Kelas 9, link download di `/materi` |

**Dampak:**
- Total bab: 9 → **14** (Kelas 7: 4, Kelas 8: 5, Kelas 9: 5)
- Halaman `/materi` otomatis nampilin semua bab baru
- Filter kelas di `/materi` dan `/evaluasi` sudah mencakup kelas 7/8/9
- LCP hero image turun drastis (PNG 58KB → WebP 19KB)
- Foto Bang Agung tampil di halaman tentang (resize, optimal buat mobile)

### Sesi 13 (11 Juni 2026) — Cache-Busting Foto & Dokumentasi
**Effort: ~15 menit**

**Masalah:** Foto Bang Agung di halaman `/tentang` tampil benar di desktop tapi masih foto lama di HP karena cache Cloudflare (max-age 1 minggu).

**Solusi:**
1. Cache-busting: tambah `?v=2` ke URL gambar di `tentang/page.tsx:60`
2. Deploy Vercel + push GitHub
3. Verifikasi: `cf-cache-status: MISS` untuk URL `?v=2`, content-length 39237 (foto baru)

**Dampak:**
- Browser HP akan minta URL baru (`?v=2`) → Cloudflare cache miss → fetch fresh dari origin
- Cache lama (tanpa `?v=2`) akan expire dalam 1 minggu max-age

### Sesi 14 (12 Juni 2026) — Fix Gambar Game (WebP + 3 Cover Baru)
**Effort: ~30 menit**

**Masalah:** 3 game baru (Adab, Alam, Toleransi) tidak punya gambar, 3 game lama (Jujur, Kitab Allah, PAI) broken setelah migrasi `.png`→`.webp`.

**Akar masalah:**
- Commit `b9143a4` menambah 3 game baru di `page.tsx` tapi **tanpa file gambar** — Vercel nge-render broken image
- Commit `738f94d` ganti semua referensi gambar dari `.png` ke `.webp` — 3 game lama cuma punya `.png`, jadinya ikut broken

**Solusi langkah demi langkah:**

**Langkah 1 — Siapkan 3 gambar cover baru dari Agy (PNG):**
- Agy (desainer) buat 3 file PNG: `game-adab-dalam-islam.png`, `game-melestarikan-alam.png`, `game-membangun-toleransi.png`
- Taruh di `public/images/games/`

**Langkah 2 — Kompres PNG ke WebP (ImageMagick `convert`):**
```bash
# Untuk 3 game baru
for f in game-adab-dalam-islam game-melestarikan-alam game-membangun-toleransi; do
  convert "public/images/games/$f.png" -quality 80 "public/images/games/$f.webp"
done

# Untuk 3 game lama yang cuma punya .png
for f in game-jujur-dan-amanah game-kitab-allah-swt game-pai-interaktif; do
  convert "public/images/games/$f.png" -quality 80 "public/images/games/$f.webp"
done
```
Hasil kompresi: ~3.4MB → ~140KB (**96% lebih ringan**).

**Langkah 3 — Update kode (`.png` → `.webp`):**
- File: `src/app/game/page.tsx:91`
- Ubah: `` src={`/images/games/${game.title.toLowerCase().replace(/\s+/g, '-')}.png`} ``
- Jadi: `` src={`/images/games/${game.title.toLowerCase().replace(/\s+/g, '-')}.webp`} ``

**Langkah 4 — Git commit + push:**
```bash
git add public/images/games/game-{adab-dalam-islam,melestarikan-alam,membangun-toleransi}.{png,webp} src/app/game/page.tsx
git commit -m "fix(game): add cover images for 3 new games (Adab, Alam, Toleransi)"
git push origin main

# Commit kedua — tambah .webp untuk 3 game lama
git add public/images/games/game-{jujur-dan-amanah,kitab-allah-swt,pai-interaktif}.webp
git commit -m "fix(game): add missing .webp for 3 legacy games (Jujur, Kitab Allah, PAI)"
git push origin main
```

**Langkah 5 — Deploy ke Vercel:**
```bash
npx vercel --prod --yes
```

**Alat yang dipakai:**
| Alat | Fungsi |
|------|--------|
| `convert` (ImageMagick) | Konversi PNG → WebP, kompresi lossy quality 80% |
| `git add` / `git commit` / `git push` | Version control ke GitHub |
| `npx vercel --prod --yes` | Deploy langsung ke Vercel production |

**Jebakan yang teridentifikasi:**
- Migrasi ekstensi file (`.png`→`.webp`) harus **serentak untuk semua game**. Kalau setengah-setengah, game lama broken.
- ImageMagick `convert` sudah terinstall di sistem. Kalau belum ada: `sudo apt install imagemagick`
- WebP tidak didukung di browser sangat lawas (IE11). Tapi project ini target SMP/MTs — semua pake HP modern, aman.

**Dampak:**
- Semua 6 game di halaman `/game` sekarang punya gambar cover (WebP, loading cepat)
- Total file gambar game: 6 PNG (master) + 6 WebP (production)
- Panduan penambahan game baru di-update — WAJIB sertakan `.webp`

### Sesi 15 (12 Juni 2026) — Security Audit & Fix (CRITICAL/HIGH)
**Effort: ~2 jam**

**Latar Belakang:**
Audit keamanan menyeluruh menggunakan skill dari `~/security-research/Claude-BugHunter/skills/`:
- `security-review`, `hunt-xss`, `hunt-api-misconfig`, `hunt-idor`, `hunt-cloud-misconfig`, `offensive-osint`

**Temuan kritis yang diperbaiki:**

| # | Level | Temuan | Fix |
|---|-------|--------|-----|
| 1 | 🔴 CRITICAL | Mass Assignment: siapa pun bisa submit nilai resmi tanpa verifikasi via `/api/kuis/selesai` | JWT token flow: `/api/siswa/cek` → sign JWT (30 menit) → `/api/kuis/selesai` verify JWT |
| 2 | 🔴 CRITICAL | IDOR: `/api/kuis/rekap` expose semua data siswa tanpa auth | API key protection (`x-api-key` header) + password gate di frontend |
| 3 | 🟠 HIGH | Stored XSS: `/api/doa` simpan HTML mentah tanpa sanitasi | `sanitizeText()` — strip HTML tags + limit length di server |
| 4 | 🟠 HIGH | No rate limiting di aplikasi | In-memory rate limiter per-IP (Map + cleanup interval) |
| 5 | 🟠 HIGH | X-Frame-Options conflict: Worker `SAMEORIGIN` override `DENY` | Worker diset ke `DENY` konsisten |
| 6 | 🟡 MEDIUM | No CSP di `next.config.ts` (hanya di Worker) | CSP header ditambahkan di `next.config.ts` sebagai fallback |
| 7 | 🟡 MEDIUM | No HSTS | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| 8 | 🟡 MEDIUM | No Zod validation di API | Zod schemas untuk semua 4 endpoint (`DoaSchema`, `SiswaCekSchema`, `KuisSelesaiSchema`) |
| 9 | 🟡 MEDIUM | Lenis dead dependency | `npm uninstall lenis` |

**Library baru:**
| Library | Fungsi | Alasan modern 2026 |
|---------|--------|-------------------|
| `jose` | JWT sign/verify | Edge-compatible, successor `jsonwebtoken`, zero-dep |
| `zod` (v4, sudah ter-install via Next.js) | Schema validation | TypeScript-first, auto-infer types |

**File baru:**
| File | Fungsi |
|------|--------|
| `src/lib/auth.ts` | `signQuizToken()` / `verifyQuizToken()` — JWT HS256, 30 menit expiry |
| `src/lib/rate-limit.ts` | `checkRateLimit()` — in-memory Map dengan cleanup tiap 60 detik |
| `src/lib/sanitize.ts` | `stripHtml()` / `sanitizeText()` — hapus semua tag HTML |
| `src/lib/validation.ts` | Zod schemas untuk semua endpoint |

**File diubah:**
| File | Perubahan |
|------|-----------|
| `src/app/api/doa/route.ts` | Zod + sanitize + rate limiter |
| `src/app/api/siswa/cek/route.ts` | Zod + rate limiter + return JWT token |
| `src/app/api/kuis/selesai/route.ts` | Zod + JWT verify + rate limiter |
| `src/app/api/kuis/rekap/route.ts` | Rate limiter + API key auth |
| `src/components/evaluasi/QuizLogin.tsx` | Pass `token` dari API ke parent |
| `src/components/evaluasi/QuizEngine.tsx` | Simpan + kirim `token` ke submit API |
| `src/app/pendidik/page.tsx` | Password gate sebelum akses rekap |
| `next.config.ts` | +CSP +HSTS (fallback defense-in-depth) |
| `workers/akal-center/index.ts` | `SAMEORIGIN` → `DENY` |
| `package.json` | Hapus `lenis` |
| `.env.example` | +`JWT_SECRET` +`ADMIN_API_KEY` |

**Env var baru untuk Vercel:**
```
JWT_SECRET=       # String random min 32 karakter — untuk sign JWT
ADMIN_API_KEY=    # String bebas — untuk akses rekap nilai di /pendidik
```

**Arsitektur JWT Flow (2026 modern — stateless, no DB):**
```
Siswa login → /api/siswa/cek → sign JWT {nama, kelas, exp:30m} → client simpan di memory
        ↓
Submit kuis → /api/kuis/selesai → verify JWT → jika valid & match → simpan ke Sheets
        ↓
Tanpa token valid → 401 Unauthorized
```

### Sesi 16 (12 Juni 2026) — Cleanup XSS Test Data & Merge .md Files
**Effort: ~30 menit**

| # | Perubahan | Detail |
|---|-----------|--------|
| 1 | **Hapus 8 XSS test entries dari Google Sheets** | Semua payload tes keamanan (script, img onerror, sql injection, dll) dihapus dari tab DoaUcapan via Google Sheets API. Menyisakan 22 doa asli. |
| 2 | **Gabung RINGKASAN_KLIEN.md + CLAUDE.md ke AGENTS.md** | Semua konten digabung verbatim (tanpa potong/edit) ke AGENTS.md dengan section header. `baru.md` (27.641 baris tree node_modules) dan file riset di-skip sesuai persetujuan. |
| 3 | **Set ADMIN_API_KEY + JWT_SECRET baru** | Karena env var rahasia terenkripsi di Vercel dan tidak bisa dibaca balik, `ADMIN_API_KEY` dan `JWT_SECRET` di-reset ke nilai yang diketahui untuk development lokal. |

### Sesi 17 (12 Juni 2026) — Re-Audit Fix: 4 HIGH + 7 MEDIUM + 8 LOW
**Effort: ~1 jam**

| # | Perubahan | Detail |
|---|-----------|--------|
| 1 | **H-1: Hapus .env.local** | VERCEL_OIDC_TOKEN bocor — file dihapus dari disk |
| 2 | **H-3+H-4: Worker transparent proxy** | Hapus `addSecurityHeaders()` — biarin Vercel/Next.js handle security headers. Keep caching logic only. |
| 3 | **H-2: Rate limiter di Worker** | Tambah in-memory rate limiter di Cloudflare Worker (persistent per-colo, beda sama Vercel yang ephemeral). API: 10 POST/30s, 30 GET/60s per IP. |
| 4 | **M-3: Stop leak Zod error** | `doa/route.ts` + `siswa/cek/route.ts` — ganti jadi generic "Data tidak valid" |
| 5 | **M-5: Dedup quiz submission** | `kuis/selesai/route.ts` — cek namaSiswa+judulBab sebelum append, skip kalau duplikat |
| 6 | **M-7: Rate limit GET /api/doa** | Tambah `checkRateLimit()` di endpoint GET (30 req/60s) |
| 7 | **M-4: Upgrade sanitizer** | `sanitize.ts` — handle `javascript:` URL, event handler (`onerror=`), HTML entities (`&#...;`) |
| 8 | **M-1: Hapus sessionStorage** | `pendidik/page.tsx` — API key cuma di React state, gak persist ke storage |
| 9 | **M-2: Origin binding JWT** | `kuis/selesai/route.ts` — cek Origin/Referer header cocok dengan domain yang diizinkan |
| 10 | **L1-L8: LOW fixes** | maxLength validation, CSP report-uri, cf-connecting-ip, crypto shuffle, error log, private key check |

## Belum Selesai / Bisa Dilanjutkan

| Item | Status | Effort Estimasi | Keterangan |
|------|--------|-----------------|------------|
| PROTA Kelas 8 | 🔲 Belum | — | Minta file PDF ke Bang Agung |
| `untuk-pendidik/` — Pusat Komando | 🔲 Belum | 1-2 jam | Stitch HTML sudah ada di Downloads |
| `analisis-dalil/` — QS Al-Isra:34 | 🔲 Belum | 1 jam | 3 varian mobile di stitch Downloads |
| `/peserta-didik` | 🔲 Placeholder | 30-60 menit | Tanya klien mau isi apa |
| PPT slide decks (9 file) | ✅ Sebagian | 1 jam | 5 PPT sudah di `public/ppt/` & link di `/materi`, 4 sisanya belum |
| Video bab lain (7 bab belum) | ⏳ Seadanya | 10 menit/video | Tunggu link YouTube |
| Telegram ID Bang Agung | ✅ Tersimpan | — | `TELEGRAM_CHAT_ID_2` di Vercel env — notif dual chat |
| Buku PAI PDF Kls 7/8/9 | 🔲 Belum | 15 menit | Link di materi ajar |

### Stitch Materials (Referensi untuk Halaman Baru)

Lokasi: `/home/ngome/Downloads/stitch_aggung_learning_platform/`

| Folder | Isi | Untuk Halaman |
|--------|-----|--------------|
| `modul-ajar/` | 14 PDF (sudah diproses ke materi.ts) | ✅ Selesai |
| `ppt/` | 9 slide deck PDF | ⏳ Sebagian (5/9 diintegrasi) |
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

- `vercel.json` — `{"framework": "nextjs"}` + routes block .vercel.app (WAJIB, jangan hapus)
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
- **Vercel URL block:** Worker bypass via `X-From-Worker: akal-center` header. Rule `missing` — deny hanya kalau header tidak ada. Jangan pakai `continue: true` (masih kena rule deny).
- **Akun Cloudflare:** Wimxgooo@gmail.com, Zone ID: bc8a1f05acc22a9bd2b95ef2edfb9b0f, Token: (lihat dashboard Cloudflare → My Profile → API Tokens)
- **Vercel project:** wimxgooo-3751s-projects / ahmad-katsiri-agung (Hobby)
- **Google Sheets:** Service Account di Vercel Env — `npx vercel env add ... --force` untuk overwrite

---

## Remediation Plan — Re-Audit Vulnerability (12 Juni 2026)

> Re-audit setelah Sesi 15 menemukan **4 HIGH + 7 MEDIUM + 8 LOW** issues tersisa.
> Prioritas: **H-1 → H-3+H-4 → H-2 → M-5 → M-3 → M-1 → lainnya**

### 🔴 PHASE 1 — HIGH (Immediate)

| ID | Item | Files | Detail | Dependency |
|----|------|-------|--------|------------|
| H-1 | 🔥 Hapus `.env.local` dari disk | `.env.local` | VERCEL_OIDC_TOKEN valid ada dalam plaintext. Bisa authenticate sebagai project owner. | None |
| H-3 | 🔥 Hapus CSP dari Worker | `workers/akal-center/index.ts:59-63` | Worker set CSP 6 directive (lemah) yang overwrite Next.js CSP 13 directive. Hapus `addSecurityHeaders()` CSP. Biarin Next.js handle. | None |
| H-4 | 🔥 Hapus security headers dari Worker | `workers/akal-center/index.ts:59-63` | `addSecurityHeaders()` pake `.set()` yang timpa origin headers. Document: Worker harus transparent proxy. Gabung dengan H-3. | H-3 |
| H-2 | 🔥 Pindah rate limiter ke Cloudflare Worker | `src/lib/rate-limit.ts` + `workers/akal-center/index.ts` | In-memory Map per-instance Vercel — gampang bypass. Pindah ke Cloudflare Worker yang punya persistent state per colo. | H-3 |

### 🟠 PHASE 2 — MEDIUM

| ID | Item | Files | Detail | Dependency |
|----|------|-------|--------|------------|
| M-5 | Tambah dedup quiz submission | `src/app/api/kuis/selesai/route.ts:73-76` | Sebelum append, cek apakah record `namaSiswa`+`judulBab` sudah ada. Skip kalau duplikat. | None |
| M-3 | Stop leak Zod error message | `src/app/api/doa/route.ts:42`, `siswa/cek/route.ts:23` | Ganti `parsed.error.issues[0]?.message` jadi generic `"Data tidak valid"` | None |
| M-1 | ADMIN_API_KEY jangan di sessionStorage | `src/app/pendidik/page.tsx:346` | Minta key setiap kali buka halaman, atau pake closure variable, jangan persistent storage | M-4 |
| M-7 | Rate limit GET /api/doa | `src/app/api/doa/route.ts:10-26` | Tambah `checkRateLimit()` di endpoint GET | H-2 |
| M-6 | Atomic counter rate limiter | `src/lib/rate-limit.ts:35` | `entry.count++` non-atomic. Fix: pake proper locking atau pindah ke Worker (H-2) | H-2 |
| M-4 | Upgrade XSS sanitizer ke library proper | `src/lib/sanitize.ts:1-3` | Regex `/<[^>]*>/g` gak handle `javascript:` URL. Ganti pake `DOMPurify` (server-side) | None |
| M-2 | Binding ketat JWT ke sesi | `QuizEngine.tsx:33-38` | Implementasi session-bound token — cek referer/Origin header di server | None |

### 🔵 PHASE 3 — LOW (Nice to Have)

| ID | Item | Files | Detail |
|----|------|-------|--------|
| L-5 | MaxLength di JawabanSalahSchema | `lib/validation.ts:16-21` | Tambah `.max(500)` di field `pertanyaan`, `jawabanSiswa`, `kunciJawaban` |
| L-6 | CSP report-uri/report-to | `next.config.ts` + Worker | Tambah `report-uri /api/csp-report;` ke CSP policy |
| L-2 | IP extraction prefer cf-connecting-ip | `lib/rate-limit.ts:44-46` | Cek `cf-connecting-ip` dulu sebelum `x-forwarded-for` |
| L-3 | Mask Telegram bot token di URL | `lib/telegram.ts:9` | Pastikan URL gak kelog. Atau pake header-based auth |
| L-4 | Error handling — jangan silent | `lib/telegram.ts:21`, `QuizEngine.tsx:88` | Notif gagal → log + retry. Submit gagal → notif user |
| L-1 | Crypto.randomUUID() untuk shuffle | `QuizEngine.tsx:22-29` | Ganti `Math.random()` → `crypto.getRandomValues()` |
| L-8 | Early check GOOGLE_SHEETS_PRIVATE_KEY | `lib/google-sheets.ts:8` | `if (!key) throw Error(...)` sebelum bikin JWT client |
| L-7 | Restrict POST ke static paths | `workers/akal-center/index.ts:1` | Hanya allow GET untuk asset paths |

---

## Trigger Prompt untuk AI Berikutnya

```
Lanjutkan project AKAL Center. Baca file AGENTS.md di root folder
project ini untuk detail lengkap. Cek STATUS dan apa yang perlu dikerjakan
selanjutnya. Update file ini jika ada perubahan.
```

---

# ===== BERIKUTNYA: GABUNGAN FILE .md LAIN =====

> Semua file .md dari project ini telah digabung ke sini (AGENTS.md) agar
> tidak tercecer. Tidak ada satu kata pun yang dihapus atau diringkas —
> konten di bawah ini persis sama dengan file aslinya.
> File asli: `RINGKASAN_KLIEN.md`, `CLAUDE.md`

---

# RINGKASAN_KLIEN.md (full, verbatim)

# Ringkasan Klien — Ahmad Katsiri Aggung

> File ini dibaca AI untuk memahami konteks project sebelum eksekusi.
> Update bagian STATUS PROJECT setiap ada progress.
> Untuk detail teknis SUPER LENGKAP, baca AGENTS.md di folder yang sama.

---

## Data Klien

| Info | Detail |
|------|--------|
| **Nama klien** | Ahmad Katsiri Aggung |
| **Profesi** | Pendidik PAI — Pembuat konten edukasi |
| **Jenis project** | Platform Pembelajaran PAI / Akidah Akhlak SMP/MTs |
| **Nomor WhatsApp** | +6285158795502 |
| **Instagram** | @ahmadkatsiria |
| **TikTok** | @sir.ahmd |
| **YouTube** | Ahmad Katsiri Agung |
| **Warna / tema** | Hijau premium (#005231) + Gold/Emas — Aero-Emerald Future |
| **Halaman** | Beranda, Materi (14 bab), Detail Materi, Portal Pendidik, Game, Tentang, Peserta Didik |
| **Tanggal mulai** | 9 Juni 2026 |

> ⚠️ **Catatan khusus dari klien:**
> 1. Tidak perlu halaman login
> 2. Tema: "Model Pembelajaran Berbasis Deep Learning pada Materi Akidah Akhlak tingkat SMP/MTS"
> 3. Kurikulum: Kurikulum Merdeka (BUKAN "Kurikulum Terpadu 2026")
> 4. Deep Learning 3 pilar: Mindful → Meaningful → Joyful Learning

---

## Status Project

- [x] Detail bisnis diterima dari klien
- [ ] Harga deal & kontrak ditandatangani
- [ ] Mockup desain dibuat
- [ ] Mockup disetujui klien
- [x] Coding selesai (v2 — 24 halaman statis, 14 bab materi)
- [ ] Review bersama klien
- [x] Deploy ke domain production → ✅ Live di akalcenter.my.id

---

## Catatan & Log Update

| Tanggal | Update |
|---------|--------|
| 2026-06-09 | Sesi 1-6: Full build platform. Lihat AGENTS.md untuk kronologi detail. |
| 2026-06-09 | Sesi 7: Mengganti logo Vercel (segitiga putih) dengan logo PAI (SVG, PNG, ICO, Open Graph preview) serta mengintegrasikan logo ke Navbar, Footer, dan Hero. |
| 2026-06-09 | Sesi 8: Tambah tombol & file PPT slide deck (9 file), Naskah Soal (8 file), Vercel Analytics, tombol Kirim Saran via WA di detail materi, dan game Jujur dan Amanah. Update RINGKASAN_KLIEN.md dengan panduan penambahan game, materi, dan video. |
| 2026-06-11 | Sesi 9: Rebrand "Aggung Learning" → "AKAL Center", perangkat ajar PROTA/PROSEM/ATP download + tab kelas 7/8/9, dual Telegram notif |
| 2026-06-11 | Sesi 10: Cloudflare Workers CDN reverse proxy + cache static assets |
| 2026-06-11 | Sesi 11: Performa (9 fix), domain akalcenter.my.id, Cloudflare security (6), Vercel 403 block, metadata fix |
| 2026-06-11 | Sesi 12: 5 bab baru (total 14 bab), game link update, tim verifikator, foto Bang Agung (resize 400×400), LCP optimasi WebP |
| 2026-06-11 | Sesi 13: Cache-busting foto Bang Agung (?v=2) — fix foto lama muncul di HP |
| 2026-06-11 | Sesi 14: Update playbook agensi — 39 error terklasifikasi + arsitektur Vercel/Cloudflare/Domain |
| 2026-06-12 | Sesi 15: Security Audit & Fix — JWT auth, rate limiting, sanitasi XSS, CSP/HSTS, Zod validation, lenis removal |
| 2026-06-12 | Sesi 16: Cleanup XSS test data from Google Sheets + merge .md files ke AGENTS.md + reset ADMIN_API_KEY/JWT_SECRET |
| 2026-06-12 | Sesi 17: Re-Audit Fix — 4 HIGH + 7 MEDIUM + 8 LOW (Worker transparent proxy, rate limiter di CDN, Zod leak, sanitizer upgrade, origin binding, crypto shuffle) |

---

## Env Var Terbaru

| Env Var | Nilai (per 12 Juni 2026) | Catatan |
|---------|--------------------------|---------|
| `ADMIN_API_KEY` | `akal-admin-2026` | Untuk akses rekap nilai di `/pendidik` |
| `JWT_SECRET` | `akal-jwt-secret-2026-32chars!` | Untuk sign/verify token kuis siswa |
| Lainnya | (sama seperti sebelumnya) | GOOGLE_SHEETS_*, TELEGRAM_* tidak berubah |

---

## Panduan Pengubahan Logo & Favicon (Masa Depan)

Jika Anda ingin memperbarui logo/favicon website di kemudian hari, siapkan file logo baru format SVG (misal namanya `LOGO_BARU.svg` di folder Downloads), lalu jalankan perintah-perintah berikut di terminal proyek:

### 1. Salin dan Konversi Logo Baru
```bash
# Salin file SVG baru ke folder aset
cp "/home/ngome/Downloads/LOGO_BARU.svg" src/app/icon.svg
cp "/home/ngome/Downloads/LOGO_BARU.svg" public/logo.svg

# Buat favicon.ico (32x32px) untuk browser lama
convert -background none "/home/ngome/Downloads/LOGO_BARU.svg" -resize 32x32 src/app/favicon.ico

# Buat ikon PNG utama (512x512px) untuk web & Android
convert -background none "/home/ngome/Downloads/LOGO_BARU.svg" -resize 512x512 src/app/icon.png

# Buat ikon Apple Touch (180x180px) untuk iOS/Safari
convert -background none "/home/ngome/Downloads/LOGO_BARU.svg" -resize 180x180 src/app/apple-icon.png

# Buat banner pratinjau WhatsApp (1200x630px dengan background soft-green #f2fcf7)
convert -size 1200x630 xc:"#f2fcf7" /tmp/bg.png
convert -background none -resize 400x400 "/home/ngome/Downloads/LOGO_BARU.svg" /tmp/logo_resized.png
composite -gravity center /tmp/logo_resized.png /tmp/bg.png src/app/opengraph-image.png
rm /tmp/bg.png /tmp/logo_resized.png
```

### 2. Deploy Perubahan ke Internet
Setelah file ikon dibuat, jalankan perintah ini untuk menyimpan ke repositori Git dan meluncurkannya ke Vercel production:
```bash
# 1. Tes build lokal untuk memastikan tidak ada error
npm run build

# 2. Simpan perubahan ke Git
git add -A
git commit -m "feat: perbarui logo dan favicon website"
git push origin main

# 3. Deploy langsung ke Vercel production
npx vercel --prod --yes
```

---

## Panduan Menambahkan Game Baru

> Klien (Ahmad Katsiri Agung, S.Pd.) dapat mengirimkan link game Canva kapan saja.
> Ikuti langkah ini untuk menambahkannya ke website.

### 1. Tambah ke Halaman Game
Buka file `src/app/game/page.tsx`, cari array `GAMES`, lalu tambah objek baru:
```typescript
{
  title: "Nama Game",
  desc: "Deskripsi singkat game.",
  url: "https://namagame.my.canva.site/",
  badge: "EKSTERNAL",
},
```
- Simpan di urutan yang diinginkan (paling baru biasanya ditaruh paling atas)
- URL adalah link Canva yang dikirim klien

### 2. Siapkan Gambar Cover (WAJIB — format WebP)
Setiap game WAJIB punya gambar cover ukuran 16:9 (1600×900 px) di folder `public/images/games/`:
- Nama file: `game-{slug}.webp` (huruf kecil, spasi jadi `-`)
- Contoh: `game-adab-dalam-islam.webp`, `game-melestarikan-alam.webp`
- Source file PNG ditaruh di tempat yang sama (sebagai master)

Cara konversi PNG → WebP (pake ImageMagick):
```bash
convert "public/images/games/game-nama-game.png" -quality 80 "public/images/games/game-nama-game.webp"
```
> ⚠️ **PENTING:** Pastikan SEMUA game punya file `.webp`. Kalau ada game yang cuma punya `.png`, gambar di website akan broken (karena kode di `page.tsx` sudah pakai `.webp`).

### 3. (Opsional) Tautkan ke Materi Terkait
Kalau game berhubungan dengan salah satu dari 14 bab materi:
1. Buka `src/data/materi.ts`
2. Cari entry bab yang sesuai (misal `"amanah-dan-jujur"`)
3. Tambah field `gameUrl: "https://namagame.my.canva.site/",`
   (letakkan setelah `soalUrl` atau `videoUrl`)
4. Otomatis card "Game Terkait" akan muncul di sidebar halaman detail materi

### 4. Deploy
```bash
npm run build
git add -A
git commit -m "feat: tambah game [nama game]"
git push origin main
npx vercel --prod --yes
```

---

## Panduan Menambahkan Materi / Bab Baru

> Saat ini ada 14 bab (Kelas 7: 4 bab, Kelas 8: 5 bab, Kelas 9: 5 bab).
> Jika klien ingin menambah bab baru, ikuti langkah ini.

### 1. Siapkan File PDF
Letakkan di `public/pdf/` dengan format nama:
- `public/pdf/{slug-bab}.pdf` — Modul Ajar
- `public/pdf/{slug-bab}-ppt.pdf` — Slide PPT (opsional)
- `public/pdf/{slug-bab}-soal.pdf` — Naskah Soal (opsional)

Contoh: `public/pdf/adab-dalam-islam.pdf`, `adab-dalam-islam-ppt.pdf`, dll.

### 2. Buka `src/data/materi.ts`
a. Tidak perlu ubah interface (sudah siap)
b. Tambah entry baru di `ALL_MATERI`. Format:
```typescript
"slug-bab": {
  slug: "slug-bab",
  title: "Judul Bab",
  kelas: 7, // atau 8, 9
  bab: 4,   // urutan dalam kelas
  babLabel: "AKIDAH", // atau "AKHLAK"
  ringkasan: "Satu kalimat ringkasan.",
  subTopik: 5,  // jumlah sub-topik
  waktuBaca: "5 MIN BACA",
  icon: "\uD83D\uDCD6", // emoji unicode
  videoUrl: "https://www.youtube.com/embed/VIDEO_ID", // opsional
  soalUrl: "/pdf/slug-bab-soal.pdf", // opsional
  gameUrl: "https://...", // opsional
  pendahuluan: "Kalimat pembuka bab.",
  konten: [
    { judul: "Sub Topik 1", isi: "Isi paragraf..." },
    { judul: "Sub Topik 2", isi: "Isi paragraf..." },
  ],
  dalil: { // opsional
    surah: "QS. Nama [ayat]: nomor",
    arab: "teks arab...",
    arti: "Terjemahan...",
  },
  dimensi: [ // opsional — 3-4 dimensi
    { nomor: 1, judul: "Judul Dimensi", deskripsi: "Deskripsi..." },
  ],
  poinPenting: [
    "Poin penting 1",
    "Poin penting 2",
  ],
  // navigasi berurutan dalam satu kelas
  prevSlug: "slug-bab-sebelumnya",
  prevTitle: "Judul Bab Sebelumnya",
  nextSlug: "slug-bab-setelahnya",
  nextTitle: "Judul Bab Setelahnya",
}
```

### 3. Halaman Baru Otomatis Tergenerate
- Next.js akan membuat halaman `/materi/{slug-bab}` secara otomatis saat build
- Tidak perlu buat file halaman baru

### 4. (Opsional) Update Navbar Jika Perlu
Jika ada kelas baru (misal Kelas 10), buka `src/components/layout/Navbar.tsx` dan tambah filter kelas baru.

### 5. Deploy
```bash
npm run build
git add -A
git commit -m "feat: tambah bab [judul bab]"
git push origin main
npx vercel --prod --yes
```

---

## Panduan Menambahkan Video YouTube

1. Buka `src/data/materi.ts`
2. Cari entry bab (misal `"adab-dalam-islam"`)
3. Tambah/sunting field: `videoUrl: "https://www.youtube.com/embed/VIDEO_ID"`
   - VIDEO_ID: dari link YouTube (`watch?v=` atau `youtu.be/`)
   - Contoh: `https://www.youtube.com/embed/QHZGZ5m7kV0`
4. Letakkan setelah field `icon`
5. Deploy seperti biasa

---

## Perintah Deploy Cepat

```bash
npm run build                    # 1. Tes build
git add -A                       # 2. Stage semua perubahan
git commit -m "pesan perubahan"  # 3. Commit
git push origin main             # 4. Push ke GitHub
npx vercel --prod --yes          # 5. Deploy ke Vercel
```

> ⚠️ Pastikan `git config --global user.name` adalah `wimxwim`
> ⚠️ Jangan hapus file `vercel.json`

---

## Catatan & Log Update (Riwayat Pengerjaan)

```
Lanjutkan project Aggung Learning. Baca file AGENTS.md dan RINGKASAN_KLIEN.md
di folder ini. Semua detail ada di AGENTS.md.
```

---

# CLAUDE.md (full, verbatim)

# Context untuk Claude Code — Project: Ahmad Katsiri Aggung

Sebelum melakukan apapun, baca dan patuhi seluruh instruksi di:
- ~/agensi/playbook/docs/PROFIL_AGENSI.md
- ~/agensi/playbook/docs/00_SOP_EKSEKUSI_AI.md

Setelah itu, baca file RINGKASAN_KLIEN.md di folder ini untuk
detail lengkap klien yang sedang dikerjakan.
