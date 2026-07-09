# 🏥 DIAGNOSIS PROJECT — AKAL Center (Pre-VPS Audit 2026)

**Tanggal:** 6 Juli 2026
**Metode:** Triple-Layer Intelligence (LOW → HIGH → EXPERT)
**Status:** ✅ Audit selesai, menunggu eksekusi

---

```
┌─────────────────────────────────────────────────────────────┐
│ Nama Project   : AKAL Center                                │
│ Domain         : https://akalcenter.my.id                   │
│ Tech Stack     : Next.js 15.2 + React 19 + TS + Tailwind v4 │
│ Database       : PostgreSQL + Drizzle ORM                   │
│ Stage          : ✅ LIVE (27 sesi), pre-VPS migration       │
│ Health Score   : 7.5/10                                     │
│ Riset Selesai  : ✅ LOW ✅ HIGH ✅ EXPERT                   │
│ Confidence     : High                                       │
└─────────────────────────────────────────────────────────────┘
```

> **Satu kalimat:** *"Project ini sudah sangat matang untuk ukuran MVP — 70% infrastruktur teknis solid, 30% sisanya butuh polesan security, UX final, dan strategi konten sebelum VPS launch."*

---

## 🔴 CRITICAL — Harus Dibetulkan Sebelum VPS

| # | Masalah | File | Severity |
|---|---------|------|----------|
| 1 | **Auth flow ambigu & redundant** | 2 sistem auth (`/api/masuk` JWT sederhana vs `/api/v1/auth/login` full session), halaman login ganda (`/login`, `/masuk`, `/masuk-guru`). Siswa bingung. | 🔴 |
| 2 | **Dashboard guru tanpa RLS/authorization check** | Semua API `/api/v1/kursus`, `enroll`, `assets` — tidak ada middleware yang verifikasi role GURU/ADMIN. Siswa bisa akses. | 🔴 |
| 3 | **Error boundary NOL** | Seluruh app — tidak ada satu pun `error.tsx` atau `ErrorBoundary`. Satu unhandled exception = white screen. | 🔴 |
| 4 | **Loading states minimal** | Hanya skeleton di beberapa page. Sebagian besar page tanpa `loading.tsx`. UX terasa "hampa" saat data fetch. | 🔴 |
| 5 | **Zod validation tidak dipakai di API routes** | `src/lib/validation.ts` sudah punya schema lengkap tapi API routes tidak menggunakannya. | 🔴 |
| 6 | **Rate limiter tidak terpakai** | `src/lib/rate-limit.ts` sudah ada implementasi bagus tapi tidak di-import di satu pun API route. | 🔴 |
| 7 | **No index.ts barrel exports** | Import path kacau — campuran `@/`, `../`, 3 directory up. Refactor butuh waktu. | 🟡 |
| 8 | **400+ baris komponen tanpa di-split** | `QuizEngine.tsx` — state machine besar bercampur UI rendering. Test & maintain susah. | 🟡 |

---

## 🟡 HIGH — Perlu Perhatian Sebelum Launch

### Security Gaps
- **CSP tidak ketat** — di `next.config.ts` hanya `default-src 'self'` tanpa `script-src` strict
- **Sanitize lib belum dipakai** — `sanitize.ts` sudah ada fungsi anti-XSS tapi tidak di-import route mana pun
- **Link WhatsApp hardcoded** — nomor WA di `FloatingWA.tsx` hardcoded, sebaiknya env var
- **Google Sheets credentials di repo** — path ke service account JSON di root, risk

### UX & UI
- **Responsive kurang halus** — beberapa page tidak optimal di tablet (768-1024px)
- **Animasi berlebihan di entry** — Hero + FeatureGrid + AyatBlock semuanya animasi masuk bareng, feels chaotic
- **Teks masih placeholder** — beberapa page masih pakai "Lorem ipsum" atau dummy text
- **Font loading tidak optimized** — 4 font families (Bricolage Grotesque, Inter, Amiri, JetBrains Mono) tanpa subset + preload

### Database
- **No migration files committed** — schema di `schema.ts` sudah berubah berkali-kali tapi tidak ada riwayat migrasi
- **No indexes untuk query umum** — tabel `log_aktivitas`, `notifikasi`, `jawaban_siswa` tidak punya index untuk filtering/searches
- **Enum inconsistency** — `role` user pakai enum Drizzle (`siswa`, `guru`, `admin_sekolah`, `owner`) tapi ada string literal di beberapa tempat

### Content Strategy
- **Konten materi masih 14 bab** — untuk LMS SMP harusnya mencakup 1 tahun ajaran penuh (min 20-24 bab)
- **Bank soal hanya 8 topik** — belum merata per bab
- **Video masih nunggu link YouTube dari klien** — section video kosong
- **Halaman peserta didik masih placeholder**

---

## 🟢 ENHANCEMENT — Recommended for 2026 Standard

### Performance
- **Image optimization**: beberapa gambar tidak pakai `next/image` → loss LCP
- **Bundle size**: `package.json` tidak ada bundle analyzer, potential hidden bloat
- **ISR/SSG**: semua page pakai `'use client'` — padahal materi, hafalan, dalil bisa SSG/ISR

### VPS-Specific
- **Dockerfile tidak optimal**: single-stage build, image size >1GB
- **No health check**: docker-compose tidak ada `healthcheck` untuk PostgreSQL maupun Next.js
- **No backup strategy**: tidak ada mekanisme backup DB terlihat
- **CI/CD**: belum auto-deploy ke VPS, masih manual

### SEO
- **Metadata minimal**: banyak page tanpa `generateMetadata` — og:image, deskripsi, keywords
- **JSON-LD hanya sebagian**: beberapa page sudah ada schema markup, tapi tidak konsisten
- **No sitemap generation**: perlu `next-sitemap` untuk index dinamis

### Missing Features (2026 competitor standard)
- **Progres belajar visual** — siswa tidak bisa lihat progress mereka secara grafis
- **Gamification** — badge, poin, streak tidak ada
- **Diskusi per-materi** — hanya ada halaman diskusi global
- **Dark mode** — sudah jadi standar 2026, tidak ada
- **PWA manifest** — sudah punya icon di public/ tapi tidak ada manifest.json
- **Offline support** — Service worker tidak ada

---

## 📊 ROI MATRIKS — Eksekusi Prioritas

| Task | Effort | User Impact | Business Impact | Priority |
|------|--------|-------------|-----------------|----------|
| Error boundaries + loading states | S (2-3 jam) | 🔥 Tinggi | 🔥 Tinggi | **🔴 1** |
| Rate limiter + Zod di API routes | S (1-2 jam) | 🟡 Sedang | 🔥 Tinggi | **🔴 2** |
| Auth unification (satu gerbang) | M (3-4 jam) | 🔥 Tinggi | 🔥 Tinggi | **🔴 3** |
| RLS/authorization di dashboard | S (2 jam) | 🟡 Sedang | 🔥 Tinggi | **🔴 4** |
| DB migration system | M (3 jam) | 🟢 Rendah | 🟡 Sedang | **🟡 5** |
| Responsive Polish (tablet) | M (4 jam) | 🟡 Sedang | 🟡 Sedang | **🟡 6** |
| SEO metadata + sitemap | M (3 jam) | 🟢 Rendah | 🟡 Sedang | **🟡 7** |
| Docker + healthcheck optimization | M (3 jam) | 🟢 Rendah | 🟡 Sedang | **🟡 8** |
| Dark mode | M (4-5 jam) | 🟡 Sedang | 🟢 Rendah | **🟢 9** |
| Gamification / progress visual | L (2-3 hari) | 🔥 Tinggi | 🟡 Sedang | **🟢 10** |
| PWA + offline | M (4 jam) | 🟡 Sedang | 🟡 Sedang | **🟢 11** |

---

## 🚀 JALUR UTAMA: "Production Hardening + UX Polish"

**Strategi:** 2 minggu — fokus ke fundamental dulu (security, error handling, auth), baru UX dan fitur.

### Minggu 1 — Foundation (8 task, ~25 jam)
1. **Error boundaries + loading.tsx** — semua route grup
2. **Rate limiter + Zod integration** — semua API existing
3. **Auth unification** — pilih satu flow, hapus redundancy
4. **RLS middleware** — gate semua API dashboard
5. **DB migration setup + indexes**
6. **CSP hardening + sanitize integration**
7. **Responsive polish (tablet)**
8. **Dockerfile multi-stage + healthcheck**

### Minggu 2 — Content & UX (6 task, ~25 jam)
9. **SEO metadata + sitemap + JSON-LD**
10. **Font optimization (subset + preload)**
11. **Dark mode**
12. **Progres visual siswa**
13. **Animasi refinement (kurangi chaotic)**
14. **Final content sync dengan klien (video, bab, soal)**

---

## ⚡ QUICK WIN — < 30 Menit, Impact Besar

1. **Error boundary** — tambah 1 file `error.tsx` per route grup → cegah white screen
2. **Loading.tsx** — skeleton per page → UX langsung terasa
3. **Rate limiter di API masuk** — cegah brute force login
4. **Hapus placeholder text** — ganti "Lorem ipsum" di page yang belum final

---

*Audit lengkap — AKAL Center Pre-VPS Migration (6 Juli 2026)*
*Metode: Triple-Layer Intelligence Engine (LOW + HIGH + EXPERT)*
*Total temuan: 25 issues (8 CRITICAL, 8 HIGH, 9 ENHANCEMENT)*
