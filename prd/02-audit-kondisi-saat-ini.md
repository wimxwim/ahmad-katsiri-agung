# AKAL CENTER — Audit Kondisi Saat Ini (Deep Dive)

**Tanggal Audit:** 6 Juli 2026  
**Basis:** 27 sesi pengerjaan + repo `wimxwim/ahmad-katsiri-agung`  
**Status:** LIVE di `akalcenter.my.id`

---

## 1. ASSET YANG DIMILIKI

### 1.1 Stack Teknis

| Layer | Teknologi | Versi | Catatan |
|-------|-----------|-------|---------|
| Framework | Next.js (App Router) | 16.2.7 | TypeScript strict |
| CSS | Tailwind CSS v4 | ^4 | Custom theme (oklch colors) |
| Animasi | motion (motion/react) | ^12.40.0 | Ease curve `[0.16, 1, 0.3, 1] as const` |
| Ikon | lucide-react | ^1.17.0 | — |
| Font | Bricolage Grotesque, Inter, Amiri | Google Fonts via next/font | + JetBrains Mono |
| Hosting | Vercel Hobby (gratis) | — | Blocked .vercel.app via vercel.json |
| CDN | Cloudflare Worker | akal-center.wimxgooo.workers.dev | Reverse proxy, cache, security headers |
| Domain | akalcenter.my.id | Rumahweb Rp35.000 | NS: amalia.ns.cloudflare.com |
| CMS | Keystatic | git-based | 4 collections, OAuth GitHub |
| Sheets API | googleapis | ^173.0.0 | Service Account JWT |
| Analitik | @vercel/analytics, @vercel/speed-insights | — | GA4 via @next/third-parties |
| Auth | jose (JWT) | — | Edge-compatible, HS256 |
| Validation | zod | v4 via Next.js | 4 endpoint schemas |
| Utils | clsx, tailwind-merge | — | shadcn pattern |

### 1.2 Design System

| Token | Value |
|-------|-------|
| Primary | `#005231` (hijau gelap premium) |
| Tertiary | `#5a4200` / `#775900` (gold accent) |
| Surface | `#f2fcf7` (putih kehijauan) |
| Glass | `rgba(255,255,255,0.6)` + `backdrop-blur-2xl` |
| Border Precision | `rgba(27,107,69,0.15)` |
| Shimmer Text | `linear-gradient(90deg, #eec055, #ffdf9b, #eec055, #ffdf9b)` |
| Radius | sm: 0.25rem, md: 0.75rem, lg: 1rem, xl: 1.5rem (custom: 32-80px) |
| Shadow Glass | `shadow-glass`, `shadow-glass-lg`, `shadow-glass-xl` |

### 1.3 Konten (14 Bab Materi)

| Slug | Kelas | Bab | Label | Video |
|------|-------|-----|-------|-------|
| beriman-kepada-malaikat | 7 | 1 | AKIDAH | ❌ |
| membiasakan-tabayyun-menjauhi-ghibah | 7 | 2 | AKHLAK | ❌ |
| salat-mencegah-perbuatan-keji-dan-mungkar | 7 | 3 | AKHLAK | ❌ |
| melestarikan-alam-cerminan-orang-beriman | 7 | 4 | AKHLAK | ✅ |
| amanah-dan-jujur | 8 | 1 | AKHLAK | ✅ |
| beriman-kepada-kitab-allah | 8 | 2 | AKIDAH | ✅ |
| beriman-kepada-nabi-dan-rasul | 8 | 3 | AKIDAH | ❌ |
| membangun-toleransi | 8 | 4 | AKHLAK | ❌ |
| moderasi-beragama | 8 | 5 | AKHLAK | ❌ |
| adab-dalam-islam | 9 | 1 | AKHLAK | ❌ |
| beriman-kepada-hari-akhir | 9 | 2 | AKIDAH | ❌ |
| beriman-kepada-qada-dan-qadar | 9 | 3 | AKIDAH | ❌ |
| semangat-mencari-ilmu | 9 | 4 | AKHLAK | ❌ |
| manusia-khalifah-di-muka-bumi | 9 | 5 | AKIDAH | ❌ |

### 1.4 Halaman Aktif

```
/                              → Beranda (HeroSection + FeatureGrid + DualCTACards + RuangDoa + AyatBlock)
/materi                        → Daftar bab, filter kelas
/materi/[slug]                 → Detail bab (content, dalil, dimensi, video, nav)
/pendidik                      → Portal Pendidik (perangkat ajar, rekap nilai, statistik)
/game                          → 6 card game Canva eksternal
/evaluasi                      → Portal kuis (filter kelas + QuizEngine)
/video                         → Video gallery filter kelas
/hafalan                       → Flashcard hafalan dalil
/dalil/al-isra-34              → Analisis dalil QS Al-Isra:34
/tentang                       → Filosofi, pendiri, visi misi, tim verifikator
/peserta-didik                 → Placeholder "Segera Hadir"
/login                         → Login page (FormMasuk)
/masuk                         → Form masuk siswa (reuse FormMasuk)
/masuk-guru                    → Form masuk guru
/keystatic                     → CMS dashboard (OAuth GitHub)
```

### 1.5 API Endpoint

| Endpoint | Method | Fungsi | Security |
|----------|--------|--------|----------|
| `/api/doa` | POST/GET | Submit & fetch doa | Rate limit, Zod, sanitize XSS |
| `/api/siswa/cek` | POST | Verifikasi Nama+TTL | Rate limit, Zod, return JWT |
| `/api/kuis/selesai` | POST | Simpan hasil kuis | JWT verify, Rate limit, dedup |
| `/api/kuis/rekap` | GET | Merge DaftarSiswa+RekapNilai | API key, Rate limit |
| `/api/masuk` | POST | Login siswa/guru | Credential check, set cookie |
| `/api/keystatic/[...params]` | ALL | CMS OAuth + token | GitHub OAuth |
| `/api/csp-report` | POST | CSP violation report | Report-only |
| `/api/health` | GET | Health check | Public |

---

## 2. AUDIT KEAMANAN (Sesi 15 & 17)

### 2.1 Yang Sudah Diperbaiki

| # | Temuan | Level | Fix |
|---|--------|-------|-----|
| 1 | Mass Assignment submit nilai tanpa verifikasi | 🔴 CRITICAL | JWT token flow |
| 2 | IDOR rekap expose semua data | 🔴 CRITICAL | API key + password gate |
| 3 | Stored XSS via `/api/doa` | 🟠 HIGH | sanitizeText() |
| 4 | Rate limiting via Worker | 🟠 HIGH | In-memory Map + Cloudflare |
| 5 | X-Frame-Options conflict | 🟠 HIGH | Konsisten DENY |
| 6 | No CSP di next.config | 🟡 MEDIUM | CSP nonce strict-dynamic |
| 7 | No HSTS | 🟡 MEDIUM | Strict-Transport-Security |
| 8 | No Zod validation | 🟡 MEDIUM | Zod schemas for 4 endpoints |
| 9 | Dead dependency (lenis) | 🟡 MEDIUM | npm uninstall |
| 10 | Zod error leak | 🟡 MEDIUM | Generic "Data tidak valid" |
| 11 | Sanitizer upgrade | 🟡 MEDIUM | Handle javascript: URLs, event handlers |
| 12 | sessionStorage API key | 🟡 MEDIUM | React state only |
| 13 | Origin binding JWT | 🟡 MEDIUM | Cek Origin/Referer header |
| 14 | .env.local bocor | 🟠 HIGH | Hapus dari disk |

### 2.2 Security Headers Aktif

```
Content-Security-Policy: nonce-{uuid} strict-dynamic
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### 2.3 Yang Belum Ada (dari Audit Checklist)

| Item | Level | Estimasi |
|------|-------|----------|
| Argon2id (ganti bcrypt) | 🟡 MEDIUM | 1 jam |
| CSRF Double Submit Cookie | 🟡 MEDIUM | 2 jam |
| CAPTCHA di login | 🟢 LOW | 2 jam |
| Audit trail login (IP, UA, timestamp) | 🟡 MEDIUM | 1 jam |
| Account lockout setelah N gagal | 🟡 MEDIUM | 1 jam |
| 2FA untuk admin | 🟢 LOW | 3 jam |
| Git history scan (trufflehog) | 🟡 MEDIUM | 30 menit |

---

## 3. AUDIT DATA FLOW

### 3.1 Google Sheets (Saat Ini)

| Sheet Tab | Kolom | Fungsi | Status |
|-----------|-------|--------|--------|
| DaftarSiswa | No, NamaLengkap, Kelas, TanggalLahir | Verifikasi Nama+TTL | ✅ Aktif |
| DoaUcapan | ID, Nama, Isi Doa, Waktu | Doa wall submissions | ✅ Aktif |
| RekapNilai | Tanggal, Nama, Kelas, Absen, Status, Bab, Skor, Total, Persentase, Lulus | Hasil kuis siswa | ✅ Aktif |

### 3.2 Telegram Notifikasi

- **Bot:** @AKAL_Centre_bot
- **Dual chat:** TELEGRAM_CHAT_ID (primary) + TELEGRAM_CHAT_ID_2 (secondary)
- **Event:** Doa baru + Kuis selesai
- **Format:** Markdown (escape khusus `_`, `*`, `[`, `(` )

### 3.3 Keystatic CMS

| Collection | Entries | Storage |
|------------|---------|---------|
| Bab Materi | 14/14 | `content/materi/{slug}/index.json` |
| Bank Soal | 8/8 | `content/soal/{slug}/index.json` |
| Game Edukasi | 12/12 | `content/game/{slug}/index.json` |
| Koleksi Hadits | 6/6 | `content/hadits/{slug}/index.json` |

### 3.4 Cloudflare Worker

- **Cache strategy:** `_next/static/*` → immutable 1 tahun, gambar/PDF → 1 minggu, HTML → `no-cache, must-revalidate`, API → `no-cache`
- **Security headers:** HSTS, XFO, XCTO, RP (from Worker, fallback)
- **Rate limiter:** In-memory Map (10 POST/30s, 30 GET/60s per IP)

---

## 4. YANG HARDCODED KE SINGLE-GURU

Ini adalah target utama yang harus digeneralisasi untuk multi-guru:

| File | Hardcode | Generalisasi |
|------|----------|-------------|
| `Navbar.tsx` | "AKAL Center" statis | Dinamis dari `sekolah.nama` / `guru.nama` |
| `Footer.tsx` | "Ahmad Katsiri Agung" | Dari database `users` |
| `/tentang/page.tsx` | Foto & bio Bang Agung | Dari `users` table + CMS |
| `/materi/page.tsx` | 14 bab hardcoded di `materi.ts` | Dari Keystatic (sudah CMS) + Postgres untuk metadata kursus |
| `RuangDoa.tsx` | Submit ke Sheets tab DoaUcapan | Tetap via API, tapi scope per kursus/guru |
| `QuizEngine.tsx` | Bank soal dari `soal.ts` | Dari CMS (sudah) + Postgres untuk jawaban_log |
| `materi.ts` | ALL_MATERI Record | Konten tetap di Keystatic, metadata relasi di Postgres |

---

## 5. KESENJANGAN DENGAN BLUEPRINT MASA DEPAN

| Aspek | Saat Ini | Target | Gap |
|-------|----------|--------|-----|
| **Database** | Google Sheets + Keystatic (git-based) | Neon Postgres + Prisma | Harus setup + migrasi |
| **Auth** | Form Masuk sederhana + JWT | Register/Login + Role (RBAC) | Butuh sistem register + role table |
| **Multi-tenant** | 1 guru hardcoded | N guru dengan isolasi data | RLS + sekolah_id middleware |
| **Storage** | Vercel public/ folder | Google Drive per guru | OAuth2 flow + adapter pattern |
| **Evaluasi** | Quiz → Sheets | Quiz → Postgres → EventStore → Analytics | Pipeline baru |
| **Analitik** | Skor rata-rata, persentase | IRT, BKT, Risk Score, Elo, TRI | Engine matematis dari nol |
| **Sertifikat** | Tidak ada | PDF + QR anti-palsu (hash kriptografis) | Puppeteer + SHA-256 |
| **AI** | Tidak ada | AI Tutor + AI Grading + Growth Mindset | Integrasi LLM API |
| **Pembayaran** | Tidak ada | QRIS via Xendit/Midtrans | Webhook + invoice |

---

## 6. KESIMPULAN AUDIT

**Kekuatan:**
- Fondasi teknis sangat matang untuk proyek solo developer — security di atas rata-rata
- CMS sudah berfungsi, klien bisa edit konten sendiri
- Data flow (Sheets + Telegram) sudah real-time
- CDN + caching sudah optimal untuk Vercel Hobby

**Kelemahan:**
- Single-guru — arsitektur saat ini tidak bisa scale ke multi-guru tanpa perubahan besar
- Tidak ada database relasional — semua data transaksional di Google Sheets (rapuh untuk query kompleks)
- Tidak ada sistem tracking progress siswa per topik — nilai cuma skor total
- Tidak ada analitik prediktif — guru harus membaca data manual
- Storage Vercel terbatas — tidak scalable untuk video/file besar banyak guru

**Prioritas migrasi:**
1. Database (Postgres + Prisma)
2. Auth + Role (RBAC)
3. Multi-tenancy (sekolah_id, RLS)
4. Quiz Engine v2 (jawaban_log, bukan Google Sheets)
5. Google Drive per guru
6. Mesin analitik (setelah 500+ jawaban terkumpul)
