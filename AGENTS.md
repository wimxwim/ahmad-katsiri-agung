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
21. **CSP blocking analytics beacon:** `connect-src` gak include `vitals.vercel-insights.com` → Speed Insights silent fail. Fix: selalu audit CSP barengan setiap tambah third-party (analytics, chat, monitoring).
22. **Worker cache blocking security header update:** `Cache-Control: max-age=300` untuk HTML — setelah deploy perubahan CSP, butuh 5 menit propagasi. User bingung. Fix: pake `max-age=0, must-revalidate` untuk HTML di Worker.
23. **API error catch return 200:** Silent `{ rekap: [] }` bikin frontend kira data kosong. User frustrasi. Fix: selalu return status code explicit + error message.
24. **Input type="password" tanpa instruksi:** Target user non-IT bingung, kira isi nama siswa. Fix: pake `type="text"` + contoh value di bawah input.

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

### Sesi 18 (13 Juni 2026) — Session Fixes & Rekap Bug

**Effort: ~3 jam**

| # | Perubahan | Kategori | Detail |
|---|-----------|----------|--------|
| 1 | **DoaUcapan cleanup** | Maintenance | 17 test entries removed via temp API route, tersisa 10 doa asli. Tambah `overwriteRows()` di `google-sheets.ts` (clear sebelum update). Temp route dihapus setelah selesai. |
| 2 | **Game Terkait sidebar dinamis** | Fix | Sebelumnya hardcoded "Jujur dan Amanah". Sekarang pakai `materi.title` + deskripsi auto-generated. File: `MateriDetailClient.tsx`. |
| 3 | **5 game cover images missing** | Bug | Tabayyun, Salat, Moderasi, Semangat Ilmu, Khalifah — tidak punya gambar cover. Dibuat gradient WebP (hijau + teks) via ImageMagick. |
| 4 | **Game image "Beriman kepada Kitab Allah"** | Bug | Gambar Islam salah (masjid, bukan konten bab). Ganti ke gradient hijau + teks. |
| 5 | **Semua 14 game cover images regenerated** | Design | Format seragam: gradient hijau + teks (title + kelas + bab). 6 file baru + 8 regenerated. |
| 6 | **GRADIENT_SLUGS expanded** | Fix | `materi/page.tsx` → semua 14 slugs, `evaluasi/page.tsx` → semua 8 slugs. Semua card pake gradient teks, bukan PNG. |
| 7 | **Video Kelas 7 Melestarikan Alam** | Fix | videoUrl diganti dari `YToBg3hUZhI` (Kelas 8, salah embed) ke `ZT-dbhqxtCo` (Kelas 7 Bab 6 Alam Semesta). |
| 8 | **Rekap Nilai "0 dari 0" bug** | 🔴 CRITICAL | 2 root cause: (a) API return `{"error":"Unauthorized"}` dengan **status 200** (bukan 401) — frontend kira data valid kosong; (b) Catch block server silent return `{ rekap: [] }`. Fix: tambah pengecekan `data.error` di response body + server catch return 500. |
| 9 | **Rekap UI clarity** | UX | Input diganti dari `type="password"` (titik-titik) ke `type="text"` + contoh kunci `akal-admin-2026` di bawah form. |
| 10 | **Speed Insights data nol** | 🔴 CRITICAL | 3 root cause: (a) CSP `connect-src` gak include `vitals.vercel-insights.com` — beacon diblokir; (b) Worker set `max-age=300` di HTML — setelah deploy CSP fix, Vercel edge cache masih ngasih response lama; (c) Speed Insights belum di-enable di dashboard Vercel. Fix: CSP + Worker `max-age=0, must-revalidate` + enable dashboard. |

**File baru:**
| File | Fungsi |
|------|--------|
| `public/images/games/game-*.webp` (6 baru) | Gradient cover: Tabayyun, Salat, Moderasi, Semangat Ilmu, Khalifah |
| `src/lib/google-sheets.ts` | Ditambah fungsi `overwriteRows()` — clear + update |

**File diubah:**
| File | Perubahan |
|------|-----------|
| `src/components/materi/MateriDetailClient.tsx` | Game Terkait card dinamis |
| `src/app/materi/page.tsx` | GRADIENT_SLUGS: 14 slugs |
| `src/app/evaluasi/page.tsx` | GRADIENT_SLUGS: 8 slugs |
| `src/app/game/page.tsx` | `image` field di semua 12 GAMES entries |
| `src/data/materi.ts` | videoUrl Melestarikan Alam update |
| `src/app/api/kuis/rekap/route.ts` | Catch block return 500 + log |
| `src/app/pendidik/page.tsx` | fetchRekap check `data.error`, UX clearer |

**Jebakan:**
- API rekap return `{"error":"Unauthorized"}` dengan HTTP 200, bukan 401 — tidak clear apakah ini bug Next.js 16 atau Vercel edge behavior. Frontend harus double-check response body untuk `error` field.
- Input `type="password"` membingungkan user (dikira field nama siswa). Ganti ke `type="text"` + placeholder jelas.
- CSP `connect-src` harus include semua domain third-party (analytics, monitoring) — kalau kurang, beacon silent fail.
- Worker `Cache-Control: max-age=300` untuk HTML — setelah deploy perubahan security header, butuh ~5 menit propagasi. Fix: `max-age=0, must-revalidate`.

### Sesi 21 (19 Juni 2026) — Fix CMS Collections "0 entries"

**Effort: ~1 jam**

**Masalah:** Dashboard Keystatic CMS menampilkan "0 entries" untuk semua collection (Materi, Soal, Game, Hadits) meskipun file JSON sudah ada di `content/`.

**Root Cause:** Collection paths di `keystatic.config.ts` menggunakan pattern tanpa trailing slash (`content/materi/*`), yang mengharapkan file flat `content/materi/{slug}.json`. Tapi struktur file aktual adalah subdirectory: `content/materi/{slug}/index.json`.

**Akar masalah detail — Perbedaan path pattern Keystatic:**
| Path pattern | Struktur file yang diharapkan | Contoh |
|---|---|---|
| `content/materi/*` (tanpa `/`) | `content/materi/{slug}.json` | File flat, tanpa subfolder |
| `content/materi/*/` (dengan `/`) | `content/materi/{slug}/index.json` | Setiap entry di subfolder sendiri |

Karena kita buat file `index.json` di dalam subfolder (dari script seed content), Keystatic tidak bisa menemukan entry — direktori tidak match dengan pattern.

**Fix path — 4 collection paths di `keystatic.config.ts`:**
| File | Before | After |
|------|--------|-------|
| `keystatic.config.ts:17` | `path: "content/materi/*"` | `path: "content/materi/*/"` |
| `keystatic.config.ts:86` | `path: "content/soal/*"` | `path: "content/soal/*/"` |
| `keystatic.config.ts:129` | `path: "content/game/*"` | `path: "content/game/*/"` |
| `keystatic.config.ts:150` | `path: "content/hadits/*"` | `path: "content/hadits/*/"` |

**Additional issues found & fixed:**

| # | Issue | Akar | Fix |
|---|-------|------|-----|
| 1 | **Hadits slugField collision** | `slugField: "sumber"` — 3 dari 6 hadits bersumber "HR. Muslim" → slug duplikat | Ganti ke `slugField: "slug"` dengan field slug unik (`hadits-01` s/d `hadits-06`). Tambah `slug` field di schema (`fields.slug`) dan di semua 6 file JSON |
| 2 | **Game Qada & Qadar `&` di judul** | `judul: "Game Beriman kepada Qada & Qadar"` — karakter `&` slugify jadi `--` (double dash) → `game-beriman-kepada-qada--qadar` ≠ dir name `game-beriman-kepada-qada-qadar` | Ganti `&` → `dan` di judul, image path, dan rename image file |
| 3 | **Image file dengan `&` di nama** | `public/images/games/game-beriman-kepada-qada-&-qadar.webp` — karakter `&` di URL file bisa diinterpretasi sebagai query separator | Rename ke `game-beriman-kepada-qada-dan-qadar.webp` + update referensi di JSON |

**File diubah:**
| File | Perubahan |
|------|-----------|
| `keystatic.config.ts` | 4 collection paths + hadits schema (slugField + new slug field) |
| `content/hadits/hadits-01/index.json` | + `"slug": "hadits-01"` |
| `content/hadits/hadits-02/index.json` | + `"slug": "hadits-02"` |
| `content/hadits/hadits-03/index.json` | + `"slug": "hadits-03"` |
| `content/hadits/hadits-04/index.json` | + `"slug": "hadits-04"` |
| `content/hadits/hadits-05/index.json` | + `"slug": "hadits-05"` |
| `content/hadits/hadits-06/index.json` | + `"slug": "hadits-06"` |
| `content/game/game-beriman-kepada-qada-qadar/index.json` | `&` → `dan` di judul & image |
| `public/images/games/game-beriman-kepada-qada-&-qadar.webp` | Renamed → `...qada-dan-qadar.webp` |

**Verifikasi — Semua 4 collections tampil penuh di CMS:**
| Collection | Expected | Result |
|---|---|---|
| Bab Materi | 14 | ✅ **14/14** |
| Bank Soal | 8 | ✅ **8/8** |
| Game Edukasi | 12 | ✅ **12/12** |
| Koleksi Hadits | 6 | ✅ **6/6** |

**Testing CMS akun Bang Agung (katsiriagung99):**
- Saat ini CMS masih login sebagai `wimxwim` karena session GitHub tersimpan di browser
- Untuk login sebagai Bang Agung: buka `github.com/logout` → login sebagai `katsiriagung99` → buka `akalcenter.my.id/keystatic`
- Atau pakai browser profile/incognito terpisah
- Tidak ada tombol logout explicit di Keystatic UI — auth dikelola via cookie GitHub OAuth

### 🔴 After-Action Review — Jangan Diulang di Project Lain

**1. Error catch block jangan silent**
```typescript
// ❌ JANGAN: Error jadi 200 OK — user lihat "data kosong" padahal ada error
} catch {
    return NextResponse.json({ rekap: [] });
}

// ✅ HARUS: return status code explicit + pesan error
} catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Pesan jelas" }, { status: 500 });
}
```

**2. Frontend jangan cuma percaya HTTP status code**
API bisa return 200 tapi body `{"error":"..."}` — frontend harus cek body juga, jangan cuma `r.status === 401`.

**3. Third-party analytics/monitoring → audit CSP + cache barengan**
Setiap nambah script eksternal (analytics, chatbot, monitoring):
- Cek `connect-src` CSP dulu: domain beacon harus di-allowlist
- Cek cache layer: Worker/Vercel Edge jangan blocking update header dengan `max-age` panjang
- **Jangan ngebug CSP dulu baru nyadar cache blocking — audit barengan.**

**4. Test API via browser, bukan cuma curl**
Curl test lulus, tapi pas user buka di browser error. Selalu test dari Incognito/HP beneran.

**5. Production checklist Vercel jangan skip**
Vercel kasih checklist (Connect Git, Custom Domain, Preview, Enable Analytics, Enable Speed Insights).
Yang ke-4 dan ke-5 gak otomatis — harus di-klik manual di dashboard.

---

## Belum Selesai / Bisa Dilanjutkan

> ⚠️ **Tabel ini sudah diverifikasi ulang per 27 Juni 2026** — langsung cek file system, bukan cuma dari ingatan AI.

### 🔴 Masih Nunggu Kiriman Bang Agung

| Item | Status | Detail |
|------|--------|--------|
| PROTA Kelas 8 (`prota-8.pdf`) | 🔲 Belum | File tidak ada di `public/pdf/perangkat/` — minta ke Bang Agung |
| Soal Tabayyun (`soalUrl` + PDF) | 🔲 Belum | Satu-satunya bab tanpa field `soalUrl` — nunggu file dari Bang Agung |
| Video `beriman-kepada-nabi-dan-rasul` (8/3) | 🔲 Belum | Belum ada `videoUrl` di `materi.ts` — tunggu link YouTube |
| Video `adab-dalam-islam` (9/1) | 🔲 Belum | Belum ada `videoUrl` di `materi.ts` — tunggu link YouTube |
| Buku PAI PDF Kls 7/8/9 | 🔲 Belum | Tidak ada field `bukuUrl` di interface `BabMateri` — nunggu link dari Bang Agung |
| Google Classroom link | 🔲 Belum | Feasible, tunggu URL Classroom dari Bang Agung |

### 🟡 Bisa Dikerjakan (Tidak Tergantung Klien)

| Item | Status | Estimasi | Detail |
|------|--------|----------|--------|
| `/peserta-didik` | 🔲 Placeholder | 30-60 menit | Masih "Segera Hadir" — tanya klien mau isi apa |
| `untuk-pendidik/` — Pusat Komando | 🔲 Belum | 1-2 jam | Stitch HTML siap di Downloads |
| CMS Navbar overflow filter | 🔴 Bug | 30 menit | CMS override bisa return 8+ item → desktop overload. Perlu update `keystatic.config.ts` |

### ✅ Sudah Selesai (Sebelumnya tercatat "Belum", sudah diverifikasi)

| Item | Sebelum | Sekarang | Bukti |
|------|---------|----------|-------|
| Analisis Dalil QS Al-Isra:34 | 🔲 Belum | ✅ **Selesai** | Halaman penuh di `/dalil/al-isra-34/` — audio player, word-by-word, tafsir, jurnal refleksi |
| Halaman Video Gallery | — | ✅ **Selesai** | Route `/video` — filter kelas + embed YouTube per bab |
| PPT Slide Deck | ⏳ 5/9 | ✅ **14/14** | Semua slide deck dalam format PDF di `public/pdf/*-ppt.pdf` (14 file), folder `public/ppt/` sudah dihapus |
| Login page + Navbar link | ✅ Selesai | ✅ **Selesai** | `/masuk` + `/masuk-guru`, JWT session, Navbar & BottomTab link |
| Quiz timer | ✅ Selesai | ✅ **Selesai** | Countdown 72 detik/soal, auto-submit |
| Cleanup orphaned files | ✅ Selesai | ✅ **Selesai** | File PPT, PNG, duplikat dihapus |
| Game timer label | ✅ Selesai | ✅ **Selesai** | Badge "⏱ ±10 menit" di setiap card |

### Stitch Materials (Referensi Halaman yang Belum Dibuat)

Lokasi: `/home/ngome/Downloads/stitch_aggung_learning_platform/`

| Folder | Isi | Status |
|--------|-----|--------|
| `modul-ajar/` | 14 PDF | ✅ Sudah diproses ke `materi.ts` |
| `ppt/` | 9 slide deck PDF | ✅ Digantikan 14 file `-ppt.pdf` di `public/pdf/` |
| `untuk_pendidik_.../` | HTML resource grid "Pusat Komando" | 🔲 Belum — untuk halaman `untuk-pendidik/` |
| `analisis_dalil_.../` | 3 varian mobile QS Al-Isra:34 | ✅ Halaman `/dalil/al-isra-34/` sudah jadi, tidak perlu stitch |

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
- [x] Coding selesai (14 bab materi, 8 bank soal, kuis, doa, game, video, CMS)
- [x] Deploy ke domain production → ✅ Live di akalcenter.my.id
- [x] Keystatic CMS terintegrasi — Bang Agung bisa edit konten via browser
- [x] Data flow otomatis: website → Google Sheets + Telegram (hasil kuis, doa)
- [ ] Review bersama klien
- [ ] Bang Agung perlu akun GitHub → invite sebagai collaborator → CMS multi-user

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
| 2026-06-13 | Sesi 18: DoaUcapan cleanup, Game Terkait dinamis, 6 game cover WebP baru, GRADIENT_SLUGS semua bab, video Melestarikan Alam fix, Rekap "0 dari 0" bug fix (data.error check + catch block 500), UX rekap clearer (text input + contoh key), Speed Insights fix (CSP + Worker cache + enable dashboard), After-Action Review documented |
| 2026-06-18 | Sesi 19: CMS Keystatic integration — 9 collections/singletons (materi, soal, game, hadits, navigation, siteConfig, about, pendidikPage, perangkatAjar), CSS fallback tiap halaman, middleware CSP nonce+strict-dynamic, security audit (10 fix: H-1/H-2/H-3/M-2/M-3/M-4/M-6/M-7/L-1/L-2), GitHub App OAuth setup (App ID 4080075, Client ID Iv23liAhXMj8s8L7I0Y1), GitHub App installed on repo wimxwim/ahmad-katsiri-agung, Vercel env vars set for production CMS, deploy ke akalcenter.my.id with github storage mode, fix evaluasi soal data from CMS, fix .env.example comment syntax |
| 2026-06-18 | Sesi 20: Fix CSP nonce propagation + connect-src for Keystatic dashboard. **Keystatic CMS fully live!** — 2 bugs fixed: (1) `nonce={nonce}` missing on `<html>` element → scripts had no CSP nonce, blocked browser; (2) `api.github.com` missing from CSP `connect-src` → Keystatic GraphQL calls silently blocked. Worker redirect URL fix for OAuth callback. Full flow verified: cookies cleared → "Log in with GitHub" → OAuth → dashboard at `/keystatic/branch/main`. |
| 2026-06-19 | Sesi 21: **Fix CMS Collections "0 entries"** — Root cause: `keystatic.config.ts` collection paths missing trailing slash (`content/materi/*` → `content/materi/*/`). Juga fix: hadits slugField collision (3× "HR. Muslim", ganti pakai slug field), game Qada & Qadar `&` di judul/image path, image file rename. Semua 4 collections verified: Materi 14/14, Soal 8/8, Game 12/12, Hadits 6/6. CMS siap dipakai Bang Agung via GitHub login katsiriagung99. |
| 2026-06-20 | **Sesi 22: Audit & Redesign data flow** — Fix 3 kritikal: (1) Google Sheets `RekapNilai` **di-renable** dengan 10 kolom baru (sebelumnya DISABLED total — hasil kuis gak tercatat); (2) Telegram markdown escaping + truncation (sebelumnya jawaban dengan `_` bikin notif gagal silent); (3) `rekap/route.ts` di-sederhanakan — gak perlu join DaftarSiswa lagi tinggal baca RekapNilai langsung. Frontend tabel rekap di `/pendidik` diperbarui sesuai struktur baru. Update AGENTS.md dengan section Data Flow & Monitoring — struktur sheets, panduan audit, ceklis monitoring. |

---

## Env Var Terbaru

| Env Var | Nilai (per 20 Juni 2026) | Catatan |
|---------|--------------------------|---------|
| `ADMIN_API_KEY` | `akal-admin-2026` | Untuk akses rekap nilai di `/pendidik` |
| `JWT_SECRET` | `akal-jwt-secret-2026-32chars!` | Untuk sign/verify token kuis siswa |
| `KEYSTATIC_GITHUB_CLIENT_ID` | `Iv23liAhXMj8s8L7I0Y1` | GitHub App OAuth client ID untuk CMS |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | (tersimpan aman di Vercel) | Client secret GitHub App akal-center-cms |
| `KEYSTATIC_SECRET` | (tersimpan aman di Vercel) | Encryption key untuk Keystatic CMS |
| `NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND` | `github` | Mode production: github (bukan local) |
| `NEXT_PUBLIC_USE_CMS` | `true` | Mengaktifkan override data dari CMS |
| Lainnya | (sama seperti sebelumnya) | GOOGLE_SHEETS_*, TELEGRAM_* tidak berubah |

---

## Keystatic CMS Integration (18 Juni 2026)

### Arsitektur

```
User → Browser → CSP middleware → Next.js App Router
                                        │
                          ┌─────────────┴──────────────┐
                          │ /keystatic/*                │ /api/keystatic/*         
                          │ (Dashboard UI)              │ (OAuth API)       
                          └─────────────┬──────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                                       │
            GitHub OAuth                             GitHub API
            login/authorize                           GraphQL + REST
                    │                                       │
              github.com                           api.github.com
```

### Alur OAuth (Step by Step)

```
Sesi 20 — CSP nonce propagation + connect-src for Keystatic dashboard
```

**Step-by-step OAuth flow:**
1. User buka `akalcenter.my.id/keystatic`
2. `src/app/keystatic/layout.tsx` guard: cek env vars → lolos → render `<KeystaticApp />`
3. `makePage(config)` → client component hydrate
4. `getSyncAuth()` baca cookie `keystatic-gh-access-token` → null (belum login)
5. `getAuth()` → POST `/api/keystatic/github/refresh-token` → gagal (no token)
6. Keystatic redirect `window.location.href = "/api/keystatic/github/login"`
7. API handler `githubLogin()` → `redirect 307 ke GitHub OAuth authorize URL`
8. Worker intercepts 307 → ganti `Location` header (Vercel origin → akalcenter.my.id)
9. Browser ke `github.com/login/oauth/authorize?redirect_uri=...`
10. GitHub → user authorize app → redirect ke callback URL
11. `githubOauthCallback()` → exchange code for token → Set-Cookie → redirect ke `/keystatic`
12. Load ulang → `getSyncAuth()` baca cookie → token ada → GitHub GraphQL query
13. Query sukses → `RedirectToBranch` → push ke `/keystatic/branch/main`
14. Dashboard render penuh (collections + singletons)

### Dua Bug yang Ditemukan & Diperbaiki

| # | Bug | Gejala | Akar | Fix |
|---|-----|--------|------|-----|
| 1 | **CSP nonce kosong** | Semua script di HTML `nonce=""` → diblokir browser. Landing page statis masih jalan karena gak butuh JS heavy, tapi Keystatic gak pernah hydrate. | `nonce={nonce}` cuma di `<script>` tag inline, bukan di `<html>` element. Next.js baca nonce dari `<html nonce={...}>` untuk auto-gen script tags. | `src/app/layout.tsx:211` — tambah `nonce={nonce}` ke `<html>` |
| 2 | **GitHub API diblokir CSP** | Keystatic dashboard gak nampilin data — shell kosong. Script berjalan tapi fetch ke GitHub GraphQL (`api.github.com/graphql`) silent fail karena `connect-src` CSP. | CSP `connect-src` cuma allow Vercel/Google/YouTube — `api.github.com` dan `*.githubusercontent.com` gak ada. | `src/middleware.ts:24` — tambah `https://api.github.com https://*.githubusercontent.com` |

### Nonce Propagation Mechanism

```
middleware.ts:
  nonce = crypto.randomUUID()         // ← generate random UUID tiap request
  requestHeaders.set("x-nonce", nonce) // ← kirim ke server components
  response CSP header: 'nonce-{nonce}'  // ← kirim ke browser

layout.tsx:
  const headersList = await headers()
  const nonce = headersList.get("x-nonce") ?? ""

  <html nonce={nonce}>                 // ← Next.js baca dari sini
    <script nonce={nonce}>             // ← inline script manual
      __NEXT_SCRIPT_NONCE='{nonce}'    // ← client runtime baca
```

**Kenapa `<html nonce={nonce}>` penting?**
- Next.js 16 App Router membaca nonce dari prop `<html>`
- Tanpa ini, semua framework-generated `<script src="...">` punya `nonce=""` (empty)
- Dengan `strict-dynamic`, script NONCE-hash adalah satu-satunya yang dipercaya
- Setelah script trusted jalan, semua script yang dinamis diload olehnya inherit trust

**CSP Directives (current `src/middleware.ts`):**
```
default-src 'self'
script-src 'nonce-{uuid}' 'strict-dynamic' 'self' https://www.youtube.com ...
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: blob: https:
font-src 'self' https://fonts.gstatic.com data:
frame-src 'self' https://www.youtube.com ...
media-src 'self' https://*.youtube.com ...
connect-src 'self' https://*.vercel.app ... https://api.github.com https://*.githubusercontent.com
object-src 'none'
base-uri 'self'
form-action 'self'
report-uri /api/csp-report
```

### File- file Kunci

| File | Fungsi |
|------|--------|
| `keystatic.config.ts` | 9 collections/singletons — definisi schema CMS |
| `content/` | Data CMS (disimpan di git, bukan DB) |
| `src/app/keystatic/layout.tsx` | Guard — blok akses kalau env var gak lengkap |
| `src/app/keystatic/keystatic.ts` | `"use client"` — entry point `makePage(config)` |
| `src/app/keystatic/[[...params]]/page.tsx` | RSC — return `null` (layout render KeystaticApp) |
| `src/app/api/keystatic/[...params]/route.ts` | API handler — OAuth + token management |
| `src/middleware.ts` | CSP + nonce generator — exclude `/api` routes |
| `src/app/layout.tsx` | Root layout — baca nonce dari middleware |
| `next.config.ts` | Redirect `/session` → `/api/keystatic/session` |
| `src/app/session/route.ts` | GET/POST redirect ke `/api/keystatic/session` |
| `workers/akal-center/index.ts` | Worker — redirect URL fix (Vercel → domain) |

### Env Vars Tambahan (Sesi 19-20)

| Env Var | Nilai | Catatan |
|---------|-------|---------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | `Iv23liAhXMj8s8L7I0Y1` | Client ID GitHub App |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | (rahasia) | Client Secret GitHub App |
| `KEYSTATIC_SECRET` | (rahasia) | Encryption key untuk session |
| `NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND` | `github` | github (prod) / local (dev) |
| `NEXT_PUBLIC_USE_CMS` | `true` | Nyala/tutup CMS override |

### Testing Flow

```bash
# 1. Hapus semua cookies di browser
browser-act --session sesi cookies clear --url "https://akalcenter.my.id" --force

# 2. Navigasi ke /keystatic
browser-act --session sesi navigate "https://akalcenter.my.id/keystatic"

# 3. Verifikasi tombol "Log in with GitHub" muncul
browser-act --session sesi state    # cari <a role=button>Log in with GitHub</a>

# 4. Klik login → otomatis redirect ke GitHub OAuth
#    (browser harus punya session GitHub yg sudah authorize app)

# 5. Setelah callback → dashboard di /keystatic/branch/main
browser-act --session sesi state    # cek daftar collections + singletons
```

### Known Issues / Next Steps

- `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` belum di-set (opsional — cuma perlu kalau install ulang GitHub App)
- Bang Agung perlu akun GitHub → invite sebagai collaborator → CMS multi-user
- Worker cache `max-age=0, must-revalidate` untuk HTML — OAuth callback harus selalu fresh
- Branch prefix `cms/` — Keystatic commit otomatis, PR perlu di-merge manual

---

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

## CMS Multi-User — Persiapan Akses Bang Agung

Saat ini CMS cuma bisa diakses akun `wimxwim` karena:
1. GitHub App `akal-center-cms` dibuat di akun personal `wimxwim`
2. Repo `wimxwim/ahmad-katsiri-agung` cuma accessible sama `wimxwim`
3. OAuth login cuma grant access ke user yang punya akses nulis ke repo

### Yang Perlu Dilakukan Nanti (setelah Bang Agung punya akun GitHub)

| Step | Detail | Eksekutor |
|------|--------|-----------|
| 1 | Bang Agung buat akun GitHub (github.com/signup) — gratis | Bang Agung |
| 2 | `wimxwim` invite Bang Agung sebagai collaborator di repo ini (`https://github.com/wimxwim/ahmad-katsiri-agung/settings/access`) | wimxwim |
| 3 | Bang Agung buka email GitHub → Accept invitation | Bang Agung |
| 4 | Bang Agung buka `https://akalcenter.my.id/keystatic` → Login with GitHub → Authorize app | Bang Agung |
| 5 | Selesai — Bang Agung bisa edit konten CMS langsung dari browser | — |

### Cara Invite Collaborator (Step 2 detail)
1. Buka `https://github.com/wimxwim/ahmad-katsiri-agung/settings/access`
2. Klik "Add people" → masukkan username GitHub Bang Agung
3. Pilih role "Write" (bisa edit content via CMS, tidak bisa merge ke main)
4. Klik "Add [username] to this repository"
5. Bang Agung akan dapat email invite → tinggal accept

### ⚠️ Catatan Penting
- **Role cukup "Write"** — Bang Agung cuma perlu push ke branch CMS (bukan main)
- Keystatic CMS commit otomatis ke branch `keystatic-changes/{timestamp}` — Bang Agung tidak perlu urusan Git
- CMS hanya nulis ke `content/` folder — tidak bisa edit file kode
- Akun Bang Agung bisa di-revoke kapan saja dari GitHub settings
- **Biaya:** gratis (GitHub free plan support unlimited collaborators)

---

---

## Data Flow & Monitoring (Sesi 22 — 20 Juni 2026)

### Arsitektur Data Flow (Sekarang)

```
User → Website (akalcenter.my.id)
  │
  ├─ Submit Doa → /api/doa
  │   ├─ ✅ Google Sheets (DoaUcapan!A:D)
  │   └─ ✅ Telegram (notifikasi doa baru)
  │
  ├─ Login Siswa → /api/siswa/cek
  │   ├─ ✅ Baca DaftarSiswa dari Sheets (verifikasi Nama + TTL)
  │   └─ ✅ Generate JWT token (30 menit)
  │
  └─ Selesai Kuis → /api/kuis/selesai
      ├─ ✅ Google Sheets (RekapNilai!A:J) — 10 kolom
      ├─ ✅ Telegram (laporan lengkap + detail salah)
      └─ ✅ JWT verify / Session verify
```

### Google Sheets — Struktur Baru (per 20 Juni 2026)

**Sheet: `RekapNilai` (A-J, 10 kolom)**
| Kolom | Field | Contoh | Catatan |
|-------|-------|--------|---------|
| A | Tanggal (ISO) | `2026-06-20T14:30:00.000Z` | auto dari server |
| B | Nama Siswa | `Ahmad Fauzi` | dari form/quiz |
| C | Kelas | `7` | dari form/quiz |
| D | No. Absen | `12` atau `-` | dari form/quiz |
| E | Status | `Siswa Resmi` / `Latihan` | dari pilihan mode |
| F | Judul Bab | `Amanah dan Jujur` | dari soal |
| G | Skor | `8` | jumlah benar |
| H | Total Soal | `10` | jumlah soal |
| I | Persentase | `80` | angka saja (0-100) |
| J | Lulus? | `✅ Lulus` / `❌ Tidak` | >= 70 = lulus |

**Dulu:** tiap baris diisi manual Bang Agung, cuma catat yang "resmi" dan dedup.
**Sekarang:** tiap kuis selesai → otomatis nambah baris baru (resmi & latihan), tanpa dedup.

**Sheet: `DoaUcapan` (A-D) — tidak berubah**
| A ID | B Nama | C Isi Doa | D Waktu |
Masih diisi otomatis dari website via `/api/doa`.

**Sheet: `DaftarSiswa` (A-D) — tidak berubah**
| A No | B Nama Lengkap | C Kelas | D Tanggal Lahir |
Diisi manual Bang Agung (daftar siswa). Dipakai untuk verifikasi Nama+TTL di `/api/siswa/cek`.

### Telegram — Notifikasi (per 20 Juni 2026)

| Event | Dikirim ke | Format | Isi |
|-------|-----------|--------|-----|
| Doa baru masuk | 2 chat ID | Markdown | Emoji + nama + isi doa |
| Kuis selesai | 2 chat ID | Markdown | Nama, kelas, bab, skor, persentase, detail salah |

**Fix Markdown (20 Juni):**
- Sebelumnya: teks bebas dari user langsung dimasukkan ke pesan Telegram → kalau ada `_` atau `*` di jawaban siswa, markdown jadi rusak → API Telegram return 400 → `.catch()` silent — **notif gak sampai**
- Sekarang: `escapeMarkdown()` di `lib/telegram.ts` — semua `_ * ` [ ( ` di-escape pake backslash
- Pesan juga di-truncate ke 4000 karakter (batas Telegram 4096)

### Google Analytics — Status (per 20 Juni 2026)

**Config:**
- Library: `@next/third-parties/google` (`GoogleAnalytics` component)
- GA4 ID: `G-FKHV466K10` (fallback) — bisa di-override via Keystatic CMS (`siteConfig.googleAnalyticsId`)
- CSP: `https://*.google-analytics.com` ada di `script-src` dan `connect-src`

**Kenapa GA mungkin kosong:**
1. **GA4 property belum diverifikasi** — perlu dicek di console.google.com apakah properti GA4 aktif
2. **Traffic masih rendah** — situs sekolah, pengunjung harian mungkin <10
3. **Ad blocker** — banyak siswa/guru pakai browser dengan ad blocker
4. **CSP blocking** — meski sudah include `*.google-analytics.com`, pastikan tidak ada CSP violation (cek browser console)
5. **CMS override salah** — kalau `siteConfig.googleAnalyticsId` diisi string kosong di Keystatic, fallback tidak terpakai

**Verifikasi GA jalan:**
1. Buka akalcenter.my.id di browser → buka DevTools → Network → filter "google-analytics"
2. Cari request ke `google-analytics.com/g/collect` — kalau ada, GA jalan
3. Buka Google Analytics dashboard → Real-time → lihat apakah ada active user

### Panduan Audit Berkala

**Ceklis tiap minggu/bulan:**
1. ✅ **RekapNilai** — buka Google Sheets → tab RekapNilai → ada baris baru? Kalau kosong, berarti siswa belum ada yang selesai kuis.
2. ✅ **Telegram** — cek chat @AKAL_Centre_bot — apakah notifikasi masuk tiap ada doa/kuis?
3. ✅ **DoaUcapan** — buka tab DoaUcapan → ada baris baru doa dari pengunjung? Kalau kosong sejak lama, cek `/api/doa`.
4. ✅ **Google Analytics** — cek real-time report. Kalau 0 user selama berhari-hari, ada yang salah.
5. ✅ **DaftarSiswa** — pastikan data siswa masih up to date (terutama kalo ada siswa baru).
6. ✅ **Build & Deploy** — `npx next build` zero errors? Kalau error, cek di terminal.

**File yang perlu dicek kalau ada masalah:**
| Gejala | File yang dicek |
|--------|-----------------|
| RekapNilai kosong | `api/kuis/selesai/route.ts` (cari `appendRow("RekapNilai!A:J")`) |
| Telegram gak bunyi | `lib/telegram.ts` (cari `sendTelegram`), `api/kuis/selesai/route.ts` |
| Doa gak masuk | `api/doa/route.ts` (cari `await appendRow(SHEET_RANGE)`) |
| Siswa gak bisa login | `api/siswa/cek/route.ts` (cari `readRows(SHEET_RANGE)`) |
| GA gak muncul | `layout.tsx` line 317 (`GoogleAnalytics`), `middleware.ts` CSP |
| Quiz layout bergerak | `components/evaluasi/QuizEngine.tsx` (`AnimatePresence`, `min-h`) |

### Env Var — Update Lengkap

| Env Var | Status | Fungsi |
|---------|--------|--------|
| `GOOGLE_SHEET_ID` | ✅ | ID spreadsheet Google Sheets |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | ✅ | Service Account email |
| `GOOGLE_SHEETS_PRIVATE_KEY` | ✅ | Private key (dengan `\n` literal) |
| `TELEGRAM_BOT_TOKEN` | ✅ | Token bot @AKAL_Centre_bot |
| `TELEGRAM_CHAT_ID` | ✅ | Chat ID primary (Bang Agung) |
| `TELEGRAM_CHAT_ID_2` | ✅ | Chat ID secondary |
| `JWT_SECRET` | ✅ | Untuk sign/verify token kuis |
| `ADMIN_API_KEY` | ✅ | Untuk akses rekap di `/pendidik` |
| `KEYSTATIC_GITHUB_CLIENT_ID` | ✅ | GitHub App OAuth |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | ✅ | (rahasia) |
| `KEYSTATIC_SECRET` | ✅ | Encryption key CMS |
| `NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND` | ✅ | `github` |
| `NEXT_PUBLIC_USE_CMS` | ✅ | `true` |

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

## Sesi 24 (25 Juni 2026) — Debug Audit & Optimasi Besar-besaran

**Effort: ~2 jam**

| # | Perubahan | Kategori | Detail |
|---|-----------|----------|--------|
| 1 | **Hapus varcel.svg 2.3 MB** | 🔴 CRITICAL | File typo "vercel.svg" tidak dipakai — 2.3 MB inline base64 PNG. Hapus dari public/. |
| 2 | **Optimasi logo.svg 2.3 MB → logo.webp 6 KB** | 🔴 CRITICAL | Logo PAI di Navbar/Footer: SVG base64 1248×1248 (2.3 MB) → WebP 256×256 (6 KB). **99.7% lebih kecil.** Update Navbar.tsx + Footer.tsx. |
| 3 | **Optimasi icon.svg 2.3 MB → 149 B** | 🔴 CRITICAL | Favicon SVG: ganti base64 PNG → wrapper SVG yang ref . **99.99% lebih kecil.** |
| 4 | **Resize icon.png 1.2 MB → 210 KB** | 🟡 MEDIUM | PWA icon 1248×1248 → 512×512. |
| 5 | **Resize apple-icon.png 169 KB → 36 KB** | 🟡 MEDIUM | Apple touch icon 1248×1248 → 180×180. |
| 6 | **Hapus 4 starter Next.js SVGs** | 🟡 MEDIUM | , , ,  — tidak dipakai. |
| 7 | **Hapus avatar PNGs (3 file, ~1.5 MB)** | 🟢 LOW |  — sudah ada WebP. |
| 8 | **Hapus hero-illustration.png (57 KB)** | 🟢 LOW | Gambar hero — sudah ada WebP. |
| 9 | **Hapus evaluasi PNGs (9 file, ~2.1 MB)** | 🟢 LOW | Semua slug di GRADIENT_SLUGS — code path PNG tidak pernah dijalankan. |
| 10 | **Hapus 2 extra game images** | 🟢 LOW | ,  — tidak ada di GAMES_FALLBACK. |
| 11 | **Purge Cloudflare cache** | ✅ | Setelah semua perubahan — user harus Ctrl+F5 hard refresh. |

**Total bandwidth saved: ~10 MB** (dari ~14 MB ke ~4 MB).

### After-Action Review

**1. Typo file bisa bikin bloat besar:**
 (typo "vercel.svg") 2.3 MB tidak terdeteksi selama 2 minggu. Lesson: periodic audit  untuk file orphaned.

**2. SVG dengan base64 PNG jebakan:**
ImageMagick Version: ImageMagick 6.9.12-98 Q16 x86_64 18038 https://legacy.imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC Modules OpenMP(4.5) 
Delegates (built-in): bzlib djvu fftw fontconfig freetype heic jbig jng jp2 jpeg lcms lqr ltdl lzma openexr pangocairo png raw tiff webp wmf x xml zlib
Usage: convert-im6.q16 [options ...] file [ [options ...] file ...] [options ...] file

Image Settings:
  -adjoin              join images into a single multi-image file
  -affine matrix       affine transform matrix
  -alpha option        activate, deactivate, reset, or set the alpha channel
  -antialias           remove pixel-aliasing
  -authenticate password
                       decipher image with this password
  -attenuate value     lessen (or intensify) when adding noise to an image
  -background color    background color
  -bias value          add bias when convolving an image
  -black-point-compensation
                       use black point compensation
  -blue-primary point  chromaticity blue primary point
  -bordercolor color   border color
  -caption string      assign a caption to an image
  -channel type        apply option to select image channels
  -clip-mask filename  associate a clip mask with the image
  -colors value        preferred number of colors in the image
  -colorspace type     alternate image colorspace
  -comment string      annotate image with comment
  -compose operator    set image composite operator
  -compress type       type of pixel compression when writing the image
  -define format:option
                       define one or more image format options
  -delay value         display the next image after pausing
  -density geometry    horizontal and vertical density of the image
  -depth value         image depth
  -direction type      render text right-to-left or left-to-right
  -display server      get image or font from this X server
  -dispose method      layer disposal method
  -dither method       apply error diffusion to image
  -encoding type       text encoding type
  -endian type         endianness (MSB or LSB) of the image
  -family name         render text with this font family
  -fill color          color to use when filling a graphic primitive
  -filter type         use this filter when resizing an image
  -font name           render text with this font
  -format "string"     output formatted image characteristics
  -fuzz distance       colors within this distance are considered equal
  -gravity type        horizontal and vertical text placement
  -green-primary point chromaticity green primary point
  -intensity method    method to generate intensity value from pixel
  -intent type         type of rendering intent when managing the image color
  -interlace type      type of image interlacing scheme
  -interline-spacing value
                       set the space between two text lines
  -interpolate method  pixel color interpolation method
  -interword-spacing value
                       set the space between two words
  -kerning value       set the space between two letters
  -label string        assign a label to an image
  -limit type value    pixel cache resource limit
  -loop iterations     add Netscape loop extension to your GIF animation
  -mask filename       associate a mask with the image
  -matte               store matte channel if the image has one
  -mattecolor color    frame color
  -moments             report image moments
  -monitor             monitor progress
  -orient type         image orientation
  -page geometry       size and location of an image canvas (setting)
  -ping                efficiently determine image attributes
  -pointsize value     font point size
  -precision value     maximum number of significant digits to print
  -preview type        image preview type
  -quality value       JPEG/MIFF/PNG compression level
  -quiet               suppress all warning messages
  -red-primary point   chromaticity red primary point
  -regard-warnings     pay attention to warning messages
  -remap filename      transform image colors to match this set of colors
  -repage geometry     size and location of an image canvas
  -respect-parentheses settings remain in effect until parenthesis boundary
  -sampling-factor geometry
                       horizontal and vertical sampling factor
  -scene value         image scene number
  -seed value          seed a new sequence of pseudo-random numbers
  -size geometry       width and height of image
  -stretch type        render text with this font stretch
  -stroke color        graphic primitive stroke color
  -strokewidth value   graphic primitive stroke width
  -style type          render text with this font style
  -support factor      resize support: > 1.0 is blurry, < 1.0 is sharp
  -synchronize         synchronize image to storage device
  -taint               declare the image as modified
  -texture filename    name of texture to tile onto the image background
  -tile-offset geometry
                       tile offset
  -treedepth value     color tree depth
  -transparent-color color
                       transparent color
  -undercolor color    annotation bounding box color
  -units type          the units of image resolution
  -verbose             print detailed information about the image
  -view                FlashPix viewing transforms
  -virtual-pixel method
                       virtual pixel access method
  -weight type         render text with this font weight
  -white-point point   chromaticity white point

Image Operators:
  -adaptive-blur geometry
                       adaptively blur pixels; decrease effect near edges
  -adaptive-resize geometry
                       adaptively resize image using 'mesh' interpolation
  -adaptive-sharpen geometry
                       adaptively sharpen pixels; increase effect near edges
  -alpha option        on, activate, off, deactivate, set, opaque, copy
                       transparent, extract, background, or shape
  -annotate geometry text
                       annotate the image with text
  -auto-gamma          automagically adjust gamma level of image
  -auto-level          automagically adjust color levels of image
  -auto-orient         automagically orient (rotate) image
  -bench iterations    measure performance
  -black-threshold value
                       force all pixels below the threshold into black
  -blue-shift factor   simulate a scene at nighttime in the moonlight
  -blur geometry       reduce image noise and reduce detail levels
  -border geometry     surround image with a border of color
  -bordercolor color   border color
  -brightness-contrast geometry
                       improve brightness / contrast of the image
  -canny geometry      detect edges in the image
  -cdl filename        color correct with a color decision list
  -charcoal radius     simulate a charcoal drawing
  -chop geometry       remove pixels from the image interior
  -clamp               keep pixel values in range (0-QuantumRange)
  -clip                clip along the first path from the 8BIM profile
  -clip-path id        clip along a named path from the 8BIM profile
  -colorize value      colorize the image with the fill color
  -color-matrix matrix apply color correction to the image
  -connected-components connectivity
                       connected-components uniquely labeled
  -contrast            enhance or reduce the image contrast
  -contrast-stretch geometry
                       improve contrast by `stretching' the intensity range
  -convolve coefficients
                       apply a convolution kernel to the image
  -cycle amount        cycle the image colormap
  -decipher filename   convert cipher pixels to plain pixels
  -deskew threshold    straighten an image
  -despeckle           reduce the speckles within an image
  -distort method args
                       distort images according to given method ad args
  -draw string         annotate the image with a graphic primitive
  -edge radius         apply a filter to detect edges in the image
  -encipher filename   convert plain pixels to cipher pixels
  -emboss radius       emboss an image
  -enhance             apply a digital filter to enhance a noisy image
  -equalize            perform histogram equalization to an image
  -evaluate operator value
                       evaluate an arithmetic, relational, or logical expression
  -extent geometry     set the image size
  -extract geometry    extract area from image
  -features distance   analyze image features (e.g. contrast, correlation)
  -fft                 implements the discrete Fourier transform (DFT)
  -flip                flip image vertically
  -floodfill geometry color
                       floodfill the image with color
  -flop                flop image horizontally
  -frame geometry      surround image with an ornamental border
  -function name parameters
                       apply function over image values
  -gamma value         level of gamma correction
  -gaussian-blur geometry
                       reduce image noise and reduce detail levels
  -geometry geometry   preferred size or location of the image
  -grayscale method    convert image to grayscale
  -hough-lines geometry
                       identify lines in the image
  -identify            identify the format and characteristics of the image
  -ift                 implements the inverse discrete Fourier transform (DFT)
  -implode amount      implode image pixels about the center
  -interpolative-resize geometry
                       resize image using 'point sampled' interpolation
  -kuwahara geometry   edge preserving noise reduction filter
  -lat geometry        local adaptive thresholding
  -level value         adjust the level of image contrast
  -level-colors color,color
                       level image with the given colors
  -linear-stretch geometry
                       improve contrast by `stretching with saturation'
  -liquid-rescale geometry
                       rescale image with seam-carving
  -local-contrast geometry
                       enhance local contrast
  -magnify             double the size of the image with pixel art scaling
  -mean-shift geometry delineate arbitrarily shaped clusters in the image
  -median geometry     apply a median filter to the image
  -mode geometry       make each pixel the 'predominant color' of the
                       neighborhood
  -modulate value      vary the brightness, saturation, and hue
  -monochrome          transform image to black and white
  -morphology method kernel
                       apply a morphology method to the image
  -motion-blur geometry
                       simulate motion blur
  -negate              replace every pixel with its complementary color 
  -noise geometry      add or reduce noise in an image
  -normalize           transform image to span the full range of colors
  -opaque color        change this color to the fill color
  -ordered-dither NxN
                       add a noise pattern to the image with specific
                       amplitudes
  -paint radius        simulate an oil painting
  -perceptible epsilon
                       pixel value less than |epsilon| become epsilon or
                       -epsilon
  -polaroid angle      simulate a Polaroid picture
  -posterize levels    reduce the image to a limited number of color levels
  -profile filename    add, delete, or apply an image profile
  -quantize colorspace reduce colors in this colorspace
  -radial-blur angle   radial blur the image (deprecated use -rotational-blur
  -raise value         lighten/darken image edges to create a 3-D effect
  -random-threshold low,high
                       random threshold the image
  -region geometry     apply options to a portion of the image
  -render              render vector graphics
  -resample geometry   change the resolution of an image
  -resize geometry     resize the image
  -roll geometry       roll an image vertically or horizontally
  -rotate degrees      apply Paeth rotation to the image
  -rotational-blur angle
                       rotational blur the image
  -sample geometry     scale image with pixel sampling
  -scale geometry      scale the image
  -segment values      segment an image
  -selective-blur geometry
                       selectively blur pixels within a contrast threshold
  -sepia-tone threshold
                       simulate a sepia-toned photo
  -set property value  set an image property
  -shade degrees       shade the image using a distant light source
  -shadow geometry     simulate an image shadow
  -sharpen geometry    sharpen the image
  -shave geometry      shave pixels from the image edges
  -shear geometry      slide one edge of the image along the X or Y axis
  -sigmoidal-contrast geometry
                       increase the contrast without saturating highlights or
                       shadows
  -sketch geometry     simulate a pencil sketch
  -solarize threshold  negate all pixels above the threshold level
  -sparse-color method args
                       fill in a image based on a few color points
  -splice geometry     splice the background color into the image
  -spread radius       displace image pixels by a random amount
  -statistic type geometry
                       replace each pixel with corresponding statistic from the
                       neighborhood
  -strip               strip image of all profiles and comments
  -swirl degrees       swirl image pixels about the center
  -threshold value     threshold the image
  -thumbnail geometry  create a thumbnail of the image
  -tile filename       tile image when filling a graphic primitive
  -tint value          tint the image with the fill color
  -transform           affine transform image
  -transparent color   make this color transparent within the image
  -transpose           flip image vertically and rotate 90 degrees
  -transverse          flop image horizontally and rotate 270 degrees
  -trim                trim image edges
  -type type           image type
  -unique-colors       discard all but one of any pixel color
  -unsharp geometry    sharpen the image
  -vignette geometry   soften the edges of the image in vignette style
  -wave geometry       alter an image along a sine wave
  -wavelet-denoise threshold
                       removes noise from the image using a wavelet transform
  -white-threshold value
                       force all pixels above the threshold into white

Image Sequence Operators:
  -append              append an image sequence
  -clut                apply a color lookup table to the image
  -coalesce            merge a sequence of images
  -combine             combine a sequence of images
  -compare             mathematically and visually annotate the difference between an image and its reconstruction
  -complex operator    perform complex mathematics on an image sequence
  -composite           composite image
  -copy geometry offset
                       copy pixels from one area of an image to another
  -crop geometry       cut out a rectangular region of the image
  -deconstruct         break down an image sequence into constituent parts
  -evaluate-sequence operator
                       evaluate an arithmetic, relational, or logical expression
  -flatten             flatten a sequence of images
  -fx expression       apply mathematical expression to an image channel(s)
  -hald-clut           apply a Hald color lookup table to the image
  -layers method       optimize, merge, or compare image layers
  -morph value         morph an image sequence
  -mosaic              create a mosaic from an image sequence
  -poly terms          build a polynomial from the image sequence and the corresponding
                       terms (coefficients and degree pairs).
  -print string        interpret string and print to console
  -process arguments   process the image with a custom image filter
  -separate            separate an image channel into a grayscale image
  -smush geometry      smush an image sequence together
  -write filename      write images to this file

Image Stack Operators:
  -clone indexes       clone an image
  -delete indexes      delete the image from the image sequence
  -duplicate count,indexes
                       duplicate an image one or more times
  -insert index        insert last image into the image sequence
  -reverse             reverse image sequence
  -swap indexes        swap two images in the image sequence

Miscellaneous Options:
  -debug events        display copious debugging information
  -distribute-cache port
                       distributed pixel cache spanning one or more servers
  -help                print program options
  -list type           print a list of supported option arguments
  -log format          format of debugging information
  -version             print version information

By default, the image format of `file' is determined by its magic
number.  To specify a particular image format, precede the filename
with an image format name and a colon (i.e. ps:image) or specify the
image type as the filename suffix (i.e. image.ps).  Specify 'file' as
'-' for standard input or output. dari PNG ke SVG menghasilkan SVG dengan inline base64, bukan vector path sejati. Hasil: file raksasa. Selalu cek output ImageMagick — jangan asumsi SVG otomatis kecil.

**3. Selalu cek file sizes setelah deploy:**
Logo 2.3 MB untuk ikon 28×28 pixel — absurd. Setelah di-webp jadi 6 KB.

**4. Content-visibility bukan satu-satunya penyebab konten tidak kelihatan:**
User lapor konten hilang — asumsi rendering issue, tapi ternyata file size ekstrim (2.3 MB logo gak sempat load).

**Belum Selesai:**
- Cloudflare cache untuk gambar lama masih max-age 604800 — perlu purge manual atau tunggu 1 minggu
- Game "Beriman kepada Hari Akhir" masih pakai URL Canva placeholder 
- PROTA Kelas 8 + Soal Tabayyun belum ada

### Sesi 24 (25 Juni 2026) — Debug Audit & Optimasi Besar-besaran

**Effort: ~2 jam**

| # | Perubahan | Kategori | Detail |
|---|-----------|----------|--------|
| 1 | **Hapus varcel.svg 2.3 MB** | 🔴 CRITICAL | File typo "vercel.svg" tidak dipakai — 2.3 MB inline base64 PNG. Hapus dari public/. |
| 2 | **Optimasi logo.svg 2.3 MB → logo.webp 6 KB** | 🔴 CRITICAL | Logo PAI di Navbar/Footer: SVG base64 1248×1248 (2.3 MB) → WebP 256×256 (6 KB). **99.7% lebih kecil.** Update Navbar.tsx + Footer.tsx. |
| 3 | **Optimasi icon.svg 2.3 MB → 149 B** | 🔴 CRITICAL | Favicon SVG: ganti base64 PNG → wrapper SVG yang ref `/logo.webp`. **99.99% lebih kecil.** |
| 4 | **Resize icon.png 1.2 MB → 210 KB** | 🟡 MEDIUM | PWA icon 1248×1248 → 512×512. |
| 5 | **Resize apple-icon.png 169 KB → 36 KB** | 🟡 MEDIUM | Apple touch icon 1248×1248 → 180×180. |
| 6 | **Hapus 4 starter Next.js SVGs** | 🟡 MEDIUM | `next.svg`, `file.svg`, `globe.svg`, `window.svg` — tidak dipakai. |
| 7 | **Hapus avatar PNGs (3 file, ~1.5 MB)** | 🟢 LOW | `avatar-{1,2,3}.png` — sudah ada WebP. |
| 8 | **Hapus hero-illustration.png (57 KB)** | 🟢 LOW | Gambar hero — sudah ada WebP. |
| 9 | **Hapus evaluasi PNGs (9 file, ~2.1 MB)** | 🟢 LOW | Semua slug di GRADIENT_SLUGS — code path PNG tidak pernah dijalankan. |
| 10 | **Hapus 2 extra game images** | 🟢 LOW | `game-melestarikan-alam.webp`, `game-membangun-toleransi.webp` — tidak ada di GAMES_FALLBACK. |
| 11 | **Purge Cloudflare cache** | ✅ | Setelah semua perubahan — user harus Ctrl+F5 hard refresh. |

**Total bandwidth saved: ~10 MB** (dari ~14 MB ke ~4 MB).

### After-Action Review

**1. Typo file bisa bikin bloat besar:**
`varcel.svg` (typo "vercel.svg") 2.3 MB tidak terdeteksi selama 2 minggu. Lesson: periodic audit `public/` untuk file orphaned.

**2. SVG dengan base64 PNG jebakan:**
ImageMagick `convert` dari PNG ke SVG menghasilkan SVG dengan inline base64, bukan vector path sejati. Hasil: file raksasa. Selalu cek output ImageMagick — jangan asumsi SVG otomatis kecil.

**3. Selalu cek file sizes setelah deploy:**
Logo 2.3 MB untuk ikon 28×28 pixel — absurd. Setelah di-webp jadi 6 KB.

**4. Content-visibility bukan satu-satunya penyebab konten tidak kelihatan:**
User lapor konten hilang — asumsi rendering issue, tapi ternyata file size ekstrim (2.3 MB logo gak sempat load).

**Belum Selesai (Sesi 24):**
- Cloudflare cache untuk gambar lama masih max-age 604800 — perlu purge manual atau tunggu 1 minggu
- Game "Beriman kepada Hari Akhir" masih pakai URL Canva placeholder 
- PROTA Kelas 8 + Soal Tabayyun belum ada

### Sesi 25 (27 Juni 2026) — Redesign Navigasi Mobile & Desktop

**Effort: ~45 menit**

**Latar Belakang:**
User (pemilik agensi) mengeluh navigasi mobile di akalcenter.my.id "banyak banget fitur di bawah nya" — BottomTabBar saat itu punya 8-9 item (termasuk Video, Hafalan, Diskusi, Qur'an, Refleksi). Desktop Navbar juga overload dengan 9 item + conditional.

**Metodologi:**
Skill `diskusi` (Triple-Layer Intelligence Engine) digunakan untuk analisis sistematis:
- **Fase 0:** Konfirmasi scope — spesifik navigasi mobile
- **Siklus 1 (LOW):** Riset best practice navigasi mobile 2026 — Apple HIG (max 5 tabs), Material Design (max 5 bottom nav), tren 2026 floating bar + bottom sheet
- **Siklus 2 (HIGH):** Matriks masalah — 3 akar masalah: (1) overload visual, (2) ambiguity label (Video/Hafalan/Diskusi/Qur'an/Refleksi campur aduk), (3) touch target <44px
- **Siklus 3 (EXPERT):** Sintesis kreatif — 3 pendekatan dievaluasi: (A) "Kompas Digital" (carousel), (B) "Navigasi Seperti Masjid 2026" (5 tabs + bottom sheet), (C) "Kartu Sakti" (swipeable card)
- **Keputusan Final:** **Jalur B — "Navigasi Seperti Masjid 2026"** — bottom tab 5 items + bottom sheet, floating pill style, center featured tab (Game)

**Perubahan Implementasi:**

| # | File | Perubahan |
|---|------|----------|
| 1 | `BottomTabBar.tsx` | **Rewrite total.** Dari 8-9 CMS-driven tabs → 5 core tabs (Beranda/Materi/Kuis/Game/Lainnya). Game jadi center featured tab (icon beda warna, elevated). "Lainnya" buka bottom sheet. Floating pill style. Navbar legit: `md:hidden`. |
| 2 | `BottomTabBar.tsx` | **Bottom sheet built-in** — Grid 2 kolom: Qur'an, Refleksi, Diskusi, Tentang, + Masuk (kalau belum login) atau Keluar (kalau sudah login). Sheet pakai `motion` spring animation, backdrop blur. |
| 3 | `Navbar.tsx` | **Streamline.** Dari 9 fallback items → 7 items (Beranda, Pendidik, Materi, Kuis, Game, Qur'an, Tentang). Hapus Video, Hafalan, Diskusi dari navbar (masih ada di halaman via card masing-masing). |
| 4 | `AGENTS.md` | Dokumentasi Sesi 25 ini. |

**Alasan perubahan per item (dari riset):**

| Item | Sebelum | Sesudah | Alasan |
|------|---------|---------|--------|
| Video | Navbar + BottomTab | Hanya di halaman `/materi` | Konsumsi video pasif — tidak perlu akses cepat. Halaman diakses dari detail materi. |
| Hafalan | Navbar + BottomTab | Hanya di halaman `/materi` | Fitur review — akses cukup dari menu belajar. Bottom sheet "Qur'an" mencakup. |
| Diskusi | Navbar + BottomTab | Bottom sheet "Lainnya" | Diskusi butuh akses tapi tidak setiap hari. Bottom sheet cukup. |
| Refleksi | BottomTab | Bottom sheet "Lainnya" | Sama: penting tapi tidak perlu selalu di tab utama. |
| Game | Navbar + BottomTab | Featured center tab | Gamifikasi = engagement driver untuk siswa SMP. Dibedakan visual. |
| Qur'an | BottomTab | Bottom sheet + Navbar desktop | Desktop perlu akses; mobile cukup dari bottom sheet. |

**Arsitektur Navigasi Baru (Mobile):**
```
┌─────────────────────────────────────────────┐
│  Beranda  │  Materi  │  [🎮] Game  │  Kuis  │  Lainnya  │
│    🏠    │   📖    │   GAMEPAD   │  📋   │    🔲     │
└─────────────────────────────────────────────┘
                   │
                   ▼ Bottom Sheet ──────────────┐
                  ┌──────┬──────┐                │
                  │Qur'an│Refleksi│              │
                  ├──────┼──────┤                │
                  │Diskusi│Tentang│              │
                  ├──────┼──────┤                │
                  │Masuk/Keluar  │               │
                  └──────┴──────┘                │
                  └──────────────────────────────┘
```

**Verifikasi:**
- ✅ `npx next build` sukses (zero errors)
- ✅ Navbar items telah streamline: 7 items dari 9
- ✅ BottomTabBar baru punya 5 tabs + bottom sheet
- ✅ Mobile: BottomTabBar muncul, Desktop: Navbar muncul (existing `hidden md:flex` logic)
- ✅ Bottom sheet: motion spring animation, backdrop blur, keyboard Escape to close
- ✅ Layout padding bottom `5rem` tetap cocok untuk tab bar height 4rem + safe area

**Teknis Detail:**
- Bottom sheet z-50 (di atas tab bar z-40)
- Tab bar pakai `bg-white/90 backdrop-blur-2xl` + border tipis + shadow atas
- Game tab featured: `bg-primary` rounded-2xl, elevated with shadow, `scale-110` saat active
- Bottom sheet: 2-column grid, icon + label + description per card
- Responsive: `md:hidden` di tab bar, `hidden md:flex` di nav desktop
- Minimum touch target 44px untuk semua item

**Jebakan:**
- CMS override `navigation?.navbarItems` bisa kembalikan 8+ item — harus di-filter manual. Sekarang `NAV_ITEMS_FALLBACK` jadi 7, tapi kalau CMS override masih panjang, tampilan desktop bisa overload lagi. **Belum di-fix** — perlu update `keystatic.config.ts` atau CMS content.
- `Grid3x3` icon dari lucide untuk "Lainnya" — alternatif: `MoreHorizontal` atau `LayoutGrid`

**Dampak:**
- Mobile UX jauh lebih bersih (5 tab + sheet vs 8-9 tab)
- Desktop nav juga lebih ringan (7 vs 9 item)
- Bottom sheet bisa di-expand kapan saja dengan item baru tanpa bikin tab bar overload
- Game sebagai featured tab mendorong engagement siswa

### Sesi 26 (27 Juni 2026) — Favicon Fix & HTML Browser Cache

**Effort: ~1,5 jam**

**Latar Belakang:**
Dua masalah dilaporkan: (1) Favicon di tab browser blank (putih), (2) New-tab load lambat karena tidak ada browser cache.

| # | Masalah | Akar | Fix |
|---|---------|------|-----|
| 1 | **Favicon blank** | `icon.svg` pake `<image href="/logo.webp">` — SVG wrapper yang ref file eksternal. Browser tab butuh self-contained SVG. | Embed WebP sebagai `data:image/webp;base64,…` langsung di SVG. 8.5 KB, self-contained. |
| 2 | **New-tab load lambat** | Worker cuma set `max-age=120` (2 menit) untuk HTML. Setiap new tab fetch ulang dari origin. | Naikkan ke `public, max-age=86400` (1 hari) untuk semua HTML. Browser cache penuh. |

**Fix Detail:**

**Fix #1 — Favicon:**
- `src/app/icon.svg` — dari `<image href="/logo.webp">` → embedded `data:image/webp;base64,…`
- File lain (favicon.ico, icon.png, apple-icon.png, opengraph-image.png) tidak diubah.
- Deploy Vercel + purge Cloudflare cache.

**Fix #2 — Worker Cache-Control:**
- `workers/akal-center/index.ts` — HTML browser cache 120s → 86400s
- Tambah deteksi `isHtmlPage` untuk kontrol lebih granular
- Strip Next.js RSC Vary headers dari HTML → `Vary: Accept-Encoding` (bantu edge caching)
- HTML cuma di-cache kalau `request.method === 'GET'` (HEAD request skip)
- Bersihin semua debug headers (X-Debug-Version, X-Debug-TTL, X-Debug-CF)
- Git commit `36dda78`, Worker deploy v2cc8e983

**Root Cause Diagnosis — Worker Cache-Control "Tidak Muncul":**
Awalnya kelihatan Cache-Control gak di-set sama Worker. Ternyata **`curl -I` (HEAD request)** gak masuk ke cabang `request.method === 'GET'`, jatuh ke `else` (`no-cache`). Di browser beneran (GET) selalu jalan.

**Cloudflare Edge Cache — Masih DYNAMIC:**
Cache Rule Cloudflare udah di-set `override_origin` + `Edge TTL 1 day` (via browser session `kt-cf`, rule ID `16536ee30a374929bdbace45f5cec744`). Tapi `cf-cache-status: DYNAMIC` tetap muncul. Kemungkinan: Worker responses inherently dynamic — Cloudflare edge gak cache response dari Worker.

Browser cache (`max-age=86400`) udah cukup solve keluhan user. Edge cache butuh riset lanjutan (mungkin pindah dari Worker proxy ke Cloudflare Pages).

**Verifikasi:**
- ✅ Favicon muncul di tab browser (Chrome, Firefox, HP)
- ✅ Homepage: `cache-control: public, max-age=86400`
- ✅ Materi page: `cache-control: public, max-age=86400`, `vary: Accept-Encoding`
- ✅ API: `cache-control: no-cache`
- ✅ Static assets (favicon.ico, dll): `cache-control: public, max-age=604800`
- ✅ `_next/static/`: `cache-control: public, max-age=31536000, immutable`
- ✅ Security headers: `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`
- ✅ `X-Worker: akal-center` header aktif
- ✅ Vercel deploy + git commit (`36dda78`) + push

**Jebakan:**
- `curl -I` mengirim HEAD request → tidak masuk `request.method === 'GET'`. Selalu test caching pake GET (`curl -sD -` tanpa `-I`).
- Cloudflare Cache Rule + Worker = DYNAMIC. Worker responses dianggap dynamic oleh edge. `cf` property di `new Response()` init juga tidak efektif.
- Browser cache `max-age` sudah cukup untuk solve masalah "new tab slow" — edge cache adalah optimasi lanjutan.

### Sesi 27 (28 Juni 2026) — Login Gate & Debug Worker Error 1101

**Effort: ~2 jam**

**Latar Belakang:**
Klien minta semua konten di-lock: pengunjung harus login dulu sebelum bisa akses halaman mana pun. Dua masalah muncul: (1) tidak ada auth gate di edge, (2) setelah deploy, Cloudflare Worker error 1101 bikin website mati total.

---

#### Bagian A — Auth Gate (middleware → proxy)

**Deskripsi:**
Next.js 16 mendeprekasi `middleware.ts` — ganti dengan `proxy.ts`. File ini berjalan di Vercel Edge Runtime, intercept tiap request sebelum mencapai handler.

**File baru:**
| File | Fungsi |
|------|--------|
| `src/proxy.ts` | Auth gate edge — cek cookie `akal_sesi`, redirect ke `/login?redirect=...` kalau gak valid |
| `src/app/login/page.tsx` | Login page — reuse `FormMasuk` dari `/masuk`, server check session, redirect ke `/` kalau sudah login |

**File diubah:**
| File | Perubahan |
|------|-----------|
| `src/components/layout/Navbar.tsx` | Tambah `pathname.startsWith("/login")` ke hide logic (2 occurrences). Link Masuk → `/login` |
| `src/components/layout/BottomTabBar.tsx` | Sama: hide di `/login`. Link Masuk di sheet → `/login` |
| `src/app/masuk/FormMasuk.tsx` | Baca `?redirect=` dari `window.location.search`, kirim ke `/api/masuk` sebagai form field |
| `src/app/api/masuk/route.ts` | Pakai `redirect` dari formData (bukan hardcoded `/`) — untuk murid & guru |

**Arsitektur proxy.ts (auth flow):**
```
User → akalcenter.my.id/materi
  → Vercel Edge (proxy.ts)
    → Cek cookie akal_sesi
      → Valid → NextResponse.next() → render halaman
      → Invalid/None → redirect 307 ke /login?redirect=/materi
```

**Public paths (whitelist, tanpa auth):**
- `/login`, `/masuk`, `/masuk-guru` — halaman login
- `/api/*` — API endpoints (masih pakai auth internal masing-masing: JWT verify, rate limit, API key)
- `/_next/*`, `/images/*`, `/pdf/*` — static assets

**Teknis Detail:**
- Cookie: `akal_sesi` (httpOnly, sameSite=lax, 8 jam expiry)
- JWT verify pakai `jose.jwtVerify` (Edge-compatible)
- `config.matcher` exclude `_next/static`, `_next/image`, favicon, icon, font files
- Masuk-guru page (`/masuk-guru`) tetap sebagai halaman statis (di-allow proxy, tidak di-protect middleware) karena auth-nya sudah di handle oleh page sendiri

---

#### Bagian B — Worker Crash Error 1101 🔴 CRITICAL

**Kronologi:**
1. Deploy proxy.ts ke Vercel → build sukses, deploy sukses
2. User lapor website mati: Cloudflare error 1101 "Worker threw exception"
3. Diagnosis pake `wrangler tail` → lihat exception:
   ```
   TypeError: Can't modify immutable headers. at index.js:109:30
   ```
4. Root cause: proxy.ts return 307 redirect (`Location: /login?redirect=%2F` — **relative URL**).
   Worker punya logika: kalau 3xx + Location mengandung domain Vercel → clone response + replace Location.
   Karena Location **relatif** (tidak mengandung domain Vercel), response TIDAK di-clone.
   Setelah itu, block header mutation (`Cache-Control`, `Security-Headers`, `X-Worker`) jalan di response **immutable** dari `fetch()` → TypeError.

**Mekanisme bug:**
```
Vercel return 307 → Location: /login?redirect=%2F (relative)
  ↓ Worker line 108-121: cek 3xx
  ↓ Location tidak mengandung ORIGIN → skip clone
  ↓ Worker line 124-126: !(3xx) → false → skip clone lagi
  ↓ Worker line 129-150: headers.set() on IMMUTABLE Response → TypeError 💥
```

**Fix `workers/akal-center/index.ts`:**
- Sebelumnya: clone response cuma untuk non-3xx (line 124 `if (!(status >= 300 && status < 400))`)
- Sesudah: clone **unconditionally** — `response = new Response(response.body, response)` selalu jalan
- Efek: response selalu mutable sebelum header mutation. Kalau redirect sudah di-clone duluan (line 115), clone ulang tidak masalah karena ReadableStream cuma di-refer, tidak di-consume.

**Verifikasi:**
- ✅ `akalcenter.my.id/` → 307 redirect to `/login?redirect=%2F`
- ✅ `akalcenter.my.id/materi` → 307 redirect to `/login?redirect=%2Fmateri`
- ✅ `akalcenter.my.id/login?redirect=%2F` → 200 OK (login page)
- ✅ `X-Worker: akal-center` header aktif
- ✅ `wrangler tail` — no exceptions
- ✅ `curl -sIL` — follow redirect chain sampai 200

**Deploy:**
- Vercel deploy (2x): `git commit 3745b8e` + `39424b8`
- Worker deploy: `wrangler deploy` version `eb549103-cb02-4d82-a0a2-2cc730e6b43c`
- Git push main: `a6976cf`

**Jebakan (lesson learned):**
1. **Next.js 16 `proxy.ts` bukan `middleware.ts`** — `middleware` convention deprecated, harus rename export function jadi `proxy` atau default export. Build warning → error kalau function name `middleware` di file `proxy.ts`.
2. **Worker `fetch()` response immutable** — di Cloudflare Workers, response dari `fetch()` tidak bisa diubah headers-nya langsung. Selalu clone pake `new Response(response.body, response)` sebelum mutasi header.
3. **Redirect Vercel pake relative URL** — setelah deploy proxy.ts, Vercel return 307 dengan Location relatif (`/login?...`). Worker yang handle absolute URL (domain Vercel) gak detect ini, dan skip clone.
4. **`wrangler tail` untuk debug Worker** — sangat berguna. Format `--format=json` kasih full context (request, response, exception stack).
5. **Cek `cf-cache-status: DYNAMIC`** — setelah fix, HTML page masih DYNAMIC di Cloudflare edge. Worker response dianggap inherently dynamic. Browser cache (`max-age=86400`) cukup untuk solve use case.

---

#### Bagian C — Cache-Control Conflict: Auth Gate vs Browser Cache 🔴 CRITICAL

**Gejala:**
- User buka `akalcenter.my.id` → tidak langsung redirect ke `/login`
- Harus refresh (F5/Ctrl+F5) dulu baru kena redirect
- Setelah login, kunjungan berikutnya masih dikirim ke `/login` lagi (redirect loop)

**Latar Belakang:**
Sesi 26 (Favicon Fix & HTML Browser Cache) menaikkan `Cache-Control` untuk HTML dari `max-age=120` jadi `public, max-age=86400` (24 jam). Tujuannya: new-tab load lebih cepat. Saat itu belum ada auth gate, jadi semua halaman publik — caching aman.

Sesi 27 (Bagian A) deploy proxy.ts auth gate. Ternyata **tidak kompatibel** dengan HTML caching.

**Root Cause:**
1 baris di `workers/akal-center/index.ts:133-135`:

```javascript
// SEBELUM (Sesi 26) — semua HTML di-cache 24 jam:
response.headers.set('Cache-Control', 'public, max-age=86400');
```

Worker tidak membedakan antara response 200 OK (halaman) dan 307 redirect. Keduanya dianggap `isHtmlPage`, keduanya dapat `max-age=86400`.

**Mekanisme Bug — Dua Masalah Sekaligus:**

```
MASALAH #1 — OLD PAGE CACHE (pre-auth-gate)
  User kunjungi website SEBELUM proxy.ts di-deploy:
    ├─ Server return 200 OK (halaman penuh)
    ├─ Worker set Cache-Control: public, max-age=86400
    └─ Browser cache halaman 24 jam ✅ (aman dulu)
  
  Setelah proxy.ts deploy, user yang SAMA kunjungi lagi:
    ├─ Browser: "saya punya cache valid 24 jam" → serve dari cache
    ├─ Request TIDAK dikirim ke server
    ├─ proxy.ts: TIDAK DIJALANKAN
    └─ User: lihat halaman lama (tanpa redirect) ❌

MASALAH #2 — 307 REDIRECT JUGA DI-CACHE
  User baru (first visit setelah proxy.ts):
    ├─ Browser: GET /
    ├─ proxy.ts: cek cookie → tidak ada → 307 redirect ke /login?redirect=%2F
    ├─ Worker: set Cache-Control: public, max-age=86400 ← 307 di-cache!
    └─ Browser: cache 307 redirect 24 jam

  User login, lalu kunjungi / lagi:
    ├─ Browser: "saya punya cache 307 valid" → follow redirect ke /login
    ├─ Request TIDAK dikirim ke server
    ├─ proxy.ts: TIDAK DIJALANKAN — gak sempat cek cookie valid!
    └─ User: "kok disuruh login lagi? padahal udah login!" ❌
```

**Validasi Riset Web (Stack Overflow, RFC 9111, Cloudflare docs):**
| Temuan | Sumber |
|--------|--------|
| 307 **tidak di-cache secara default** oleh browser | RFC 9111, SO |
| Tapi kalau `Cache-Control` mengizinkan (`public, max-age=N`), browser **AKAN** cache 307 | Fetch Spec, Chromium behavior |
| Browser yang follow cached redirect **tidak mengirim request apapun** ke server | Chrome DevTools docs |
| `public` directive berarti bisa di-cache oleh **shared cache** (CDN, proxy bersama) | Cloudflare docs |
| `no-cache` = cache boleh disimpan, tapi **WAJIB revalidasi** setiap kali sebelum dipakai | RFC 9111 |

**Dampak & Risiko:**
| Risiko | Level | Detail |
|--------|-------|--------|
| Auth gate tidak berfungsi sama sekali | 🔴 CRITICAL | Browser skip request → proxy.ts gak pernah jalan |
| Redirect loop setelah login | 🔴 CRITICAL | 307 redirect cached → user selalu dikirim ke `/login` walau sudah login |
| Login page di-cache 24 jam | 🟡 MEDIUM | Perubahan login page tidak terlihat sampai cache expire |
| Cache `public` = shared | 🟡 MEDIUM | Bisa di-cache oleh CDN/proxy bersama → user lain lihat response orang lain (walau 307, tetap tidak seharusnya) |
| User bingung & lapor website error | 🟡 MEDIUM | "Website saya error, harus refresh dulu baru bisa" |

**Fix — 1 baris di `workers/akal-center/index.ts:133-135`:**

```javascript
// SESUDAH — HTML harus revalidasi setiap kali karena ada auth gate:
response.headers.set('Cache-Control', 'private, no-cache, must-revalidate');
```

| Directive | Arti |
|-----------|------|
| `private` | Hanya di-cache di browser user, bukan CDN/proxy bersama |
| `no-cache` | Boleh disimpan, tapi WAJIB tanya server setiap kali mau dipakai |
| `must-revalidate` | JANGAN SAJIKAN cache basi — kalau gagal hubungi server, tampilkan error |

**Side Effect Assessment:**
| Sebelum (max-age=86400) | Sesudah (no-cache) |
|-------------------------|-------------------|
| 0 request untuk repeat visit (instant) | 1 request ke Vercel tiap visit |
| Auth gate: ❌ Bypass total | Auth gate: ✅ Jalan sempurna |
| Bandwidth: 0 (cache) | Bandwidth: ~50-120 KB per page (kecil) |
| Server load: 0 | Server load: +1 request per visit (JWT verify ringan) |

**Yang TIDAK berubah:**
- `_next/static/*` → tetap `max-age=31536000, immutable`
- PDF, gambar (ico/png/jpg/webp/woff2) → tetap `max-age=604800` (1 minggu)
- API (`/api/*`) → tetap `no-cache`

**Verifikasi Setelah Fix:**
```bash
# 307 redirect — no-cache ✅
curl -sI https://akalcenter.my.id/ | grep cache-control
→ cache-control: private, no-cache, must-revalidate

# Login page — no-cache ✅
curl -sI https://akalcenter.my.id/login | grep cache-control
→ cache-control: private, no-cache, must-revalidate

# Materi — redirect no-cache ✅
curl -sI https://akalcenter.my.id/materi | grep cache-control
→ cache-control: private, no-cache, must-revalidate

# Static asset — tetap immutable ✅
curl -sI https://akalcenter.my.id/_next/static/chunks/app/layout-xxx.js | grep cache-control
→ cache-control: public, max-age=31536000, immutable

# API — tetap no-cache ✅
curl -sI https://akalcenter.my.id/api/doa | grep cache-control
→ cache-control: no-cache
```

**Deploy:**
- Worker deploy version: `cae07f1b-1104-4ad1-8de1-5538c409f6f2`
- Git commit: `df12687`
- Branch: `main`

**Catatan untuk pengguna lama:**
Browser yang sudah cache halaman dengan `max-age=86400` TIDAK otomatis terpengaruh. Mereka perlu:
1. Hard refresh (Ctrl+F5 / Cmd+Shift+R) — sekali saja
2. Atau tutup browser & buka ulang — Chrome kadang invalidate cache saat restart
3. Setelah itu, semua kunjungan baru dapat header `no-cache` dan auth gate jalan normal

**Lesson Learned (tambah ke jebakan global):**
5. **`Cache-Control` harus diaudit SETELAH setiap perubahan keamanan/auth.** `max-age=N` yang dulu aman bisa jadi celah setelah ada auth gate. Jangan asumsi cache lama masih aman.
6. **307 redirect juga bisa di-cache browser** kalau `Cache-Control` mengizinkan. Selalu set `no-cache` untuk redirect yang bergantung pada auth state.
7. **Ketika menambah auth gate, kurasi ulang semua header cache.** Yang tadinya "optimasi performa" bisa jadi "lubang keamanan".

---

