# TODO UPGRADE — AKAL Center 6.5/10 → 10/10

> **Dibuat:** 10 Juli 2026 · **Update:** 11 Juli 2026 (Grand Final merge)
> **Sumber:** 50+ file PRD & audit + 9 riset internasional 2026 (UNESCO, TeachAI, RAND, Indie Hackers, Vercel, Supabase, PostgreSQL, GlitchTip, Indonesian EdTech)
> **Total:** 93 item · ~115 jam · 29 selesai · 38 pending · 26 tunda
> **Filosofi:** Aktifkan yang sudah ada, tunda yang tidak perlu, pantau sebelum meledak, gratis dulu baru bayar.
> **Status:** Fase 0-3 ✅ | Fase BISNIS [~] | Fase 4-13 ⬜ | Fase 14 ⚪

---

## Ringkasan Progres (per 11 Juli 2026)

| Dimensi | Sebelum | Progress | Target |
|---------|:---:|:---:|:---:|
| Vercel Region | US (iad1) | ✅ SG (sin1) | 200ms→10ms |
| Session Provider | No loading state | ✅ Loading state + useSessionLoading() | Flash state fixed |
| Auth Guard | 55 route inline boilerplate | ✅ 29/29 route direfactor ke route-guard-v2 | Selesai |
| Dead Code | 106 baris | ✅ Dihapus | 0 dead code |
| RLS | Tidak ada | ✅ Migration SQL applied + tenant context + integrated | Apply ke DB |
| Dashboard Layout | 85% duplikasi | ✅ Shared component | -260 baris |
| Error Handling | quran silent, profil weak | ✅ Fixed both | Proper states |
| FormMasuk | 635 baris God Component | ✅ Split ke 10 file (216 baris orchestrator) | Selesai |
| Fase 0-3 | 31 item | ✅ 29/31 | Hampir selesai |
| Fase BISNIS | 7 item | ✅ 7/7 | Selesai |
| Fase 4-13 | 47 item | ⬜ 0/47 | Semua pending |
| Fase 14 | 9 item | ⚪ Tunda | Nanti |

---

## FASE 0 — Quick Wins ✅ SELESAI (6/6)

### Q1. Fix `animate-fade-in` ease curve
- **Fix:** `ease` → `cubic-bezier(0.16, 1, 0.3, 1)` di `globals.css:147`
- **Status:** [x] selesai

### Q2. Hapus dead reference `/api/siswa/cek` di middleware
- **Fix:** Hapus dari `SKIP_CSRF_PATHS`
- **Status:** [x] selesai

### Q3. Wrap `verifySession()` dengan `React.cache()`
- **Fix:** Bungkus `cache(async (token) => {...})` di `auth.ts:54`
- **Status:** [x] selesai

### Q4. Fix logout redirect di Navbar
- **Fix:** `onClick={() => handleLogout().then(r => window.location.href = r)}`
- **Status:** [x] selesai

### Q5. Tambah loading state ke SessionProvider
- **Fix:** Context shape `{ session, isLoading }`, Navbar & BottomTabBar pakai 3-state
- **Status:** [x] selesai

### Q6. Hapus preload Google Fonts redundan
- **Fix:** Hapus preconnect + preload di `layout.tsx`
- **Status:** [x] selesai

---

## FASE 1 — Auth & Guard ✅ SELESAI (6/6)

### A1. Buat `route-guard-v2.ts` — 6 fungsi guard + GuardError
- **Status:** [x] selesai

### A2. Hapus dead code `route-guard.ts` + `middleware/guard.ts`
- **Status:** [x] selesai

### A3. Refactor 29 route handler ke route-guard-v2
- **Status:** [x] selesai

### A4. Hapus `/api/masuk` legacy endpoint
- **Status:** [x] selesai

### A5. Fix Navbar — sidebar sudah jadi navigasi utama dashboard
- **Status:** [x] selesai (DashboardLayoutClient sudah ada link "Kembali ke Situs")

### A6. Tambah `import 'server-only'` di semua file auth
- **Status:** [x] selesai

---

## FASE 2 — Database & RLS ✅ SELESAI (4/5)

### D1. Aktifkan RLS + migration SQL
- **Status:** [x] selesai (applied via psql CLI)

### D2. Definisikan 40+ policy via migration SQL
- **Status:** [x] selesai

### D3. Setup tenant context + integrated ke route-guard-v2
- **Status:** [x] selesai

### D4. Index 21 FK untuk RLS
- **Status:** [x] selesai

### D5. Uji RLS isolation
- **Status:** [ ] belum

---

## FASE 3 — Frontend & UX ✅ SELESAI (7/7)

### F1. Extract DashboardLayoutClient shared
- **Status:** [x] selesai

### F2. Split FormMasuk 635 baris → 10 file
- **Status:** [x] selesai

### F3. Fix `/quran` error handling
- **Status:** [x] selesai

### F4. Fix `/profil` weak redirect
- **Status:** [x] selesai

### F5. Tambah `loading.tsx` di semua route dashboard
- **Status:** [x] selesai

### F6. Tambah `error.tsx` di semua route group
- **Status:** [x] selesai

### F7. Standarisasi EmptyState + SkeletonList
- **Status:** [x] selesai

---

## 🔥 FASE BISNIS — Persiapan Onboarding 80 Guru (5/7 [~])

> **Sumber:** CATATAN DISKUSI OWNER.md + riset arsitektur skala nasional
> **Target:** 80 guru + 2.000 siswa PAI gelombang pertama

### B1. Sistem Kuota Berbasis Kapasitas
- **Fix:** Wire `checkQuota()` ke upload + regenerate. Auto-increment usage setelah generate.
- **Status:** [x] selesai

### B2. AI Cost Tracking + Hard Cap
- **Fix:** Auto-insert ke `ai_requests` table setelah generate. Quota sbg hard cap.
- **Status:** [x] selesai

### B3. Owner Dashboard v2
- **Fix:** 7 aggregate metrics real-time di `/api/v1/owner/tri`
- **Status:** [x] selesai

### B4. Kolom `mata_pelajaran` + `jenjang` + Tabel Taksonomi
- **Fix:** ALTER kursus + 2 tabel baru (18 mapel + 4 jenjang) + pre-populate
- **Effort:** 1.5 jam
- **Status:** [x] selesai — schema + data sudah ada di DB

### B5. QRIS Payment Flow
- **Fix:** Halaman `/pembayaran` + upload bukti + verifikasi manual. QR di `/public/qris-gopay.webp`
- **Effort:** 3 jam
- **Status:** [x] selesai — page + API submit + owner verify built

### B6. Onboarding Progress Tracking
- **Fix:** Tabel `onboarding_progress` (7 step) + empty state CTA
- **Effort:** 1.5 jam
- **Status:** [x] selesai — API GET/POST + guru dashboard progress bar

### B7. Rate Limiting AI Hard Cap
- **Fix:** Rate limit + quota checkQuota() — tiga layer proteksi
- **Status:** [x] selesai

---

## 🔴 FASE 4 — AKTIVASI "FREE VALUE" (Kode Ada, Tinggal Sambung)

### AV1. Pasang `checkQuota()` di SEMUA route handler AI
- **Bukti:** `src/lib/quota-guard.ts` SUDAH ADA — tapi 0 route handler panggil
- **Fix:** Tambah `await checkQuota(...)` sebelum tiap panggil NaraRouter. Setelah sukses: `incrementUsage()` + insert `ai_requests`
- **Lokasi:** `/api/v1/guru/drafts/*/regenerate*`, `/api/v1/guru/drafts/*/approve*`, semua endpoint AI
- **Effort:** 2 jam
- **Status:** [ ] belum

### AV2. Insert ke `ai_requests` setiap AI dipanggil
- **Bukti:** `ai_requests` table SUDAH ADA — kosong
- **Fix:** Insert row setelah tiap panggil NaraRouter: userId, model, tokens, cost_idr_cents, requestType, durationMs
- **Effort:** 1 jam
- **Status:** [ ] belum

### AV3. Tampilkan sisa kuota AI di dashboard guru
- **Fix:** "AI: 12/30 tersisa bulan ini" di `guru/beranda/page.tsx`
- **Effort:** 1 jam
- **Status:** [ ] belum

### AV4. Apply `ai_daily_costs` view di Supabase
- **Fix:** `REFRESH MATERIALIZED VIEW ai_daily_costs` + pg_cron refresh harian
- **Effort:** 5 menit
- **Status:** [ ] belum

### AV5. Aktifkan 1 model analytics (Risk Score)
- **Bukti:** 8 file di `src/lib/analytics/` SUDAH ADA — 0 dipanggil
- **Fix:** Panggil `calculateRiskScore()` di dashboard guru — "3 siswa berisiko"
- **Effort:** 3 jam
- **Status:** [ ] belum

### AV6. Admin CLI — integrasikan data nyata
- **Bukti:** `scripts/admin-akal.sh` SUDAH ADA
- **Effort:** 1 jam
- **Status:** [ ] belum

### AV7. Tambah `last_active_at` ke users
- **Fix:** Migration ALTER TABLE + middleware update tiap request authenticated
- **Effort:** 1 jam
- **Status:** [ ] belum

---

## 🔴 FASE 5 — AI SAFETY GUARDRAILS (UNESCO + TeachAI)

### S1. Label "Dibuat dengan AI" di konten AI-generated
- **Referensi:** UNESCO — AI harus transparan
- **Fix:** Badge "AI-Generated · Perlu Review" di materi/quiz/soal yang belum di-approve
- **Effort:** 1 jam
- **Status:** [ ] belum

### S2. Verifikasi human review wajib sebelum publish
- **Referensi:** D-008 AGENTS.md
- **Fix:** Audit semua route AI — pastikan tidak ada auto-publish
- **Effort:** 1 jam
- **Status:** [ ] belum

### S3. Batasi AI grading — jangan auto-grade essay
- **Referensi:** EdSurge Jun 2026 — "Student thanked me for words I didn't write"
- **Fix:** Essay tetap manual guru. AI hanya PG. Warning di UI.
- **Effort:** 30 menit
- **Status:** [ ] belum

### S4. Privacy: data siswa TIDAK masuk training AI
- **Referensi:** TeachAI Principle 3
- **Fix:** Konfirmasi NaraRouter + filter data sebelum kirim
- **Effort:** 30 menit
- **Status:** [ ] belum

### S5. Halaman "Panduan AI" untuk guru
- **Referensi:** TeachAI Principle 4 — AI Literacy wajib
- **Fix:** `/panduan-ai` — cara pakai AI bijak, etika, batasan
- **Effort:** 2 jam
- **Status:** [ ] belum

### S6. Audit AI output untuk bias konten
- **Fix:** Spot-check 10 materi — bias sektarian, stereotip, kesesuaian Kurikulum Merdeka
- **Effort:** 1 jam
- **Status:** [ ] belum

---

## 🔴 FASE 6 — PWA & OFFLINE

### P1. Generate icon PWA
- **Bukti:** `/icon.png` + `/icon.svg` TIDAK ADA — PWA install gagal
- **Fix:** Generate 192x192 + 512x512 dari logo
- **Effort:** 15 menit
- **Status:** [ ] belum

### P2. Tambah Service Worker
- **Bukti:** `public/sw.js` tidak ada — zero offline support
- **Fix:** `next-pwa` atau `sw.js` manual — cache-first static, network-first API
- **Effort:** 2 jam
- **Status:** [ ] belum

### P3. Offline fallback page
- **Fix:** `public/offline.html` — "Anda sedang offline"
- **Effort:** 30 menit
- **Status:** [ ] belum

---

## 🔴 FASE 7 — AKSESIBILITAS WCAG 2.2

### A11Y1. `text-[10px]` + `text-[11px]` MASIF — 100+ lokasi
- **Fix:** Ganti ke `text-xs` (12px) minimal
- **Effort:** 3 jam
- **Status:** [ ] belum

### A11Y2. Skip-to-content link
- **Fix:** `<a href="#main" class="sr-only focus:not-sr-only">Lewati ke konten</a>`
- **Effort:** 10 menit
- **Status:** [ ] belum

### A11Y3. Touch target 32px → 44px
- **Fix:** Toast close + Sheet close: `w-8 h-8` → `w-11 h-11`
- **Effort:** 5 menit
- **Status:** [ ] belum

### A11Y4. Placeholder kontras
- **Fix:** `placeholder:text-on-surface-variant/50` → `/70`
- **Effort:** 15 menit
- **Status:** [ ] belum

### A11Y5. Content-Security-Policy header
- **Fix:** Tambah CSP di `next.config.ts`
- **Effort:** 1 jam
- **Status:** [ ] belum

---

## 🟡 FASE 8 — DATABASE OPTIMIZATION

### DB1. Full-Text Search (tsvector + GIN)
- **Fix:** Kolom `fts` + GIN index di `kursus` + `materi_published` — 200x lebih cepat
- **Effort:** 1 jam
- **Status:** [ ] belum

### DB2. Trigram index (pg_trgm) untuk autocomplete
- **Fix:** `CREATE INDEX idx_users_nama_trgm ON users USING gin (nama gin_trgm_ops)`
- **Effort:** 30 menit
- **Status:** [ ] belum

### DB3. `EXPLAIN ANALYZE` query berat
- **Fix:** Audit 5 query terberat — identifikasi sequential scan → tambah index
- **Effort:** 1 jam
- **Status:** [ ] belum

### DB4. `index_advisor` extension
- **Fix:** Rekomendasi index otomatis dari 3 query teratas
- **Effort:** 15 menit
- **Status:** [ ] belum

### DB5. `VACUUM` + `ANALYZE` rutin via pg_cron
- **Fix:** Weekly VACUUM + daily REFRESH MATERIALIZED VIEW
- **Effort:** 30 menit
- **Status:** [ ] belum

### DB6. Composite index untuk JOIN berat
- **Fix:** `siswaKursus(kursusId, status)`, `jawabanLog(soalId, createdAt)`, `quizAttempt(siswaId, quizPublishedId)`
- **Effort:** 30 menit
- **Status:** [ ] belum

---

## 🟡 FASE 9 — MONITORING $0

### M1. GlitchTip error tracking (free 1000 events/mo)
- **Effort:** 30 menit
- **Status:** [ ] belum

### M2. Upptime uptime monitoring (GitHub Actions — GRATIS)
- **Effort:** 30 menit
- **Status:** [ ] belum

### M3. Vercel Speed Insights (free, sudah ada?)
- **Effort:** Audit 10 menit
- **Status:** [ ] belum

### M4. Telegram alert webhook
- **Effort:** 30 menit
- **Status:** [ ] belum

### M5. Cek Supabase Logs rutin mingguan
- **Effort:** Proses (5 menit/minggu)
- **Status:** [ ] belum

---

## 🟡 FASE 10 — ANTI-SLOP DESIGN QUALITY

### AS1. Ganti 11 emoji UI → Lucide icons
- **Bukti:** `🧑🎓🧑🏫📘🎬📝` di FormMasuk, `✅✓✕` di berbagai file
- **Effort:** 1 jam
- **Status:** [ ] belum

### AS2. Hapus 3-column simetris → Bento grid (32+ lokasi)
- **Fix:** Pillar cards → Bento, fitur → 2-col zigzag
- **Effort:** 3 jam
- **Status:** [ ] belum

### AS3. Ganti Inter font body → Geist
- **Referensi:** High-End Visual Design Section 2: Inter BANNED
- **Effort:** 30 menit
- **Status:** [ ] belum

### AS4. Spacing generous: `pt-12` → `py-24`
- **Fix:** Biarkan landing page "bernapas"
- **Effort:** 15 menit
- **Status:** [ ] belum

### AS5. Scroll reveal di landing page
- **Fix:** `whileInView` + `staggerChildren` — `/tentang` + `/fitur` sudah punya
- **Effort:** 1.5 jam
- **Status:** [ ] belum

### AS6. Double-Bezel di hero CTA card
- **Fix:** Outer shell gradient + inner core inset shadow
- **Effort:** 1 jam
- **Status:** [ ] belum

### AS7. Hover states tambah transform (62+)
- **Fix:** `hover:-translate-y-0.5 active:scale-[0.98]` ke semua CTA
- **Effort:** 1 jam
- **Status:** [ ] belum

---

## 🟢 FASE 11 — FRONTEND "SIMPLE TAPI DALAM"

### F1. Social proof di landing
- **Fix:** Verifikator akademik + "X guru sudah bergabung"
- **Effort:** 30 menit
- **Status:** [ ] belum

### F2. Heatmap kelas di dashboard guru
- **Referensi:** Khan Academy pattern — hijau=mastery, merah=bantuan
- **Effort:** 3 jam
- **Status:** [ ] belum

### F3. Empty state CTA di semua halaman
- **Fix:** `/kursus` → link daftar, dashboard guru → "Buat Kursus Pertama"
- **Effort:** 1 jam
- **Status:** [ ] belum

### F4. `next/image` untuk semua gambar
- **Fix:** Ganti `<img>` → `<Image>` — CLS + LCP fix
- **Effort:** 1.5 jam
- **Status:** [ ] belum

### F5. Preconnect ImageKit + Supabase
- **Effort:** 5 menit
- **Status:** [ ] belum

### F6. Fluid typography `clamp()`
- **Effort:** 30 menit
- **Status:** [ ] belum

---

## 🟢 FASE 12 — MONETISASI & PERTUMBUHAN

### BIZ1. "X guru sudah bergabung" di landing (data nyata)
- **Effort:** 15 menit
- **Status:** [ ] belum

### BIZ2. Siapkan tier pricing transparan
- **Effort:** 1 jam
- **Status:** [ ] belum

### BIZ3. Aktifkan kembali halaman `/pembayaran`
- **Effort:** 30 menit
- **Status:** [ ] belum

### BIZ4. Bangun audience Bang Agung sebagai showcase
- **Effort:** Proses (1-2 minggu)
- **Status:** [ ] belum

### BIZ5. Revenue share marketplace kursus (TUNDA)
- **Status:** [ ] tunda — nanti setelah >20 guru aktif

---

## 🟢 FASE 13 — PERBAIKAN SPESIFIK (Cepat, Dampak Besar)

### X1. FormMasuk: tampil pemilihan portal dulu
- **Fix:** `initialPortal` tanpa default `"siswa"`
- **Effort:** 5 menit
- **Status:** [ ] belum

### X2. Deskripsi kursus hardcode → netral
- **Fix:** `kursus/page.tsx` — ganti jadi multi-guru friendly
- **Effort:** 5 menit
- **Status:** [ ] belum

### X3. Pricing Sekolah transparan
- **Fix:** "mulai dari Rp499.000/bulan"
- **Effort:** 10 menit
- **Status:** [ ] belum

### X4. Tentang: tambah kontak founder
- **Effort:** 10 menit
- **Status:** [ ] belum

### X5. Foto Tentang: `onError` fallback
- **Effort:** 5 menit
- **Status:** [ ] belum

### X6. Fix 6 shadow Tailwind bawaan → shadow-glass
- **Effort:** 30 menit
- **Status:** [ ] belum

### X7. Sync DESIGN.md shadow → hijau primary (#005231)
- **Effort:** 30 menit
- **Status:** [ ] belum

### X8. Bersihkan CmsProvider stub
- **Effort:** 1.5 jam
- **Status:** [ ] belum

### X9. Audit hardcode warna → token design system
- **Effort:** 1.5 jam
- **Status:** [ ] belum

---

## ⚪ FASE 14 — TUNDA (Tidak Perlu Sekarang)

| # | Item | Alasan | Kapan |
|---|------|--------|-------|
| T1 | Event Sourcing | >500 siswa dulu | Fase 3 |
| T2 | Materialized Views (kecuali ai_daily_costs) | >1000 siswa dulu | Fase 3 |
| T3 | PgBouncer | >100 concurrent dulu | Fase 3 |
| T4 | Midtrans payment gateway | QRIS statis cukup <100 transaksi/bln | Setelah income stabil |
| T5 | Dark mode | Nice-to-have | Fase 4 |
| T6 | WebSocket | SSE cukup | Fase 3 |
| T7 | Microservices | Monolith cukup 10K user | Fase 4 |
| T8 | Hexagonal Architecture | App Router cukup (PRD 08) | Tidak perlu |
| T9 | SCORM/LTI/xAPI | Indonesia tidak butuh (PRD 08) | Tidak perlu |

---

## 📊 RINGKASAN TOTAL

| Fase | Item | Selesai | Pending | Tunda |
|------|:---:|:---:|:---:|:---:|
| 0 | Quick Wins | 6 | 0 | 0 |
| 1 | Auth & Guard | 6 | 0 | 0 |
| 2 | Database & RLS | 4 | 1 | 0 |
| 3 | Frontend & UX | 7 | 0 | 0 |
| B | Business Systems | 5 | 2 | 0 |
| 4 | Aktivasi Free Value | 0 | 7 | 0 |
| 5 | AI Safety | 0 | 6 | 0 |
| 6 | PWA & Offline | 0 | 3 | 0 |
| 7 | Aksesibilitas WCAG | 0 | 5 | 0 |
| 8 | Database Optimization | 0 | 6 | 0 |
| 9 | Monitoring $0 | 0 | 5 | 0 |
| 10 | Anti-Slop Design | 0 | 7 | 0 |
| 11 | Frontend "Simple" | 0 | 6 | 0 |
| 12 | Monetisasi | 0 | 4 | 1 |
| 13 | Perbaikan Spesifik | 0 | 9 | 0 |
| 14 | Tunda | 0 | 0 | 9 |
| **TOTAL** | **93** | **29** | **61** | **10** |

---

## 🗓️ URUTAN EKSEKUSI

HARI INI (P0):
  □ AV2: Insert ai_requests (1 jam)
  □ A11Y2-A11Y3: Skip link + touch target (15 menit)
  □ X1: Fix FormMasuk portal selection (5 menit)
  □ X2: Deskripsi kursus netral (5 menit)
MINGGU INI (P0-P1):
  □ Fase 4 sisa (AV1, AV3-AV7) — 8 jam
  □ Fase 5 (AI Safety) — 6 jam
  □ Fase 6 (PWA) — 3 jam
  □ Fase 7 (Aksesibilitas) — 5 jam
  □ Fase 8 (Database) — 5 jam
BULAN INI (P1-P2):
  □ Fase 9 (Monitoring) — 2 jam
  □ Fase 10 (Anti-Slop) — 8 jam
  □ Fase 11 (Frontend) — 7 jam
  □ Fase 12 (Monetisasi) — 3 jam
  □ Fase 13 (Perbaikan) — 5 jam
  □ Fase BISNIS sisa — 6 jam

---

## 📋 CEKLIS HARIAN (Rutin)

□ Senin pagi: cek Supabase Logs (5 menit)
□ Setiap deploy: cek Vercel Speed Insights
□ Setiap 2 minggu: cek GlitchTip errors
□ Setiap bulan: cek AI cost via Admin CLI (scripts/admin-akal.sh)
□ Setiap 2 bulan: review pricing & kuota — adjust jika perlu

---

## Aturan Eksekusi

1. Tiap perubahan wajib `npm run build` — zero errors sebelum lanjut
2. Baca berkas asli sebelum ubah (anti-halusinasi)
3. Trace semua import/caller sebelum edit
4. Match existing patterns (naming, style, structure)
5. Mobile-first: `px-3 sm:px-5 lg:px-8`
6. Gunakan `cn()` dari `src/lib/utils.ts` untuk className kondisional
7. Tidak boleh `any` type
8. Tidak boleh hapus `vercel.json`
9. Tidak boleh tambah library tanpa izin
10. Tidak boleh ubah ease curve `[0.16, 1, 0.3, 1] as const`

---

*Dokumen hidup — update status `[ ]` menjadi `[x]` setelah item selesai.*
