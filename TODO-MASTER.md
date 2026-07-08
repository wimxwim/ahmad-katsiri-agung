# 🏗️ AKAL CENTER — MASTER TODO LIST
**Versi:** 1.0 | **Tanggal:** 6 Juli 2026
**Sumber:** PRD 01-08 + Audit GPT 5.5 + AUDIT-FLAW + diskusi.md + RINGKASAN_KLIEN
**Total Item:** 200+ | **Estimasi Total:** 8-12 minggu

> **Instruksi untuk AI Agent:** Kerjakan berurutan per BLOCK. Jangan lompat.
> Tiap item = 1 task atomik. Centang [x] setelah selesai.
> Jika error → STOP, laporkan, jangan lanjut.

---

## ══════════════════════════════════════════
## BLOCK 0: PRE-FLIGHT CHECK (Sebelum Coding)
## ══════════════════════════════════════════

- [ ] **PRE-001** — Baca ulang `AGENTS.md` (design system, aturan coding, struktur folder)
- [ ] **PRE-002** — Baca ulang `DESAIN.md` (warna, font, animasi, radius, shadow)
- [ ] **PRE-003** — Baca `src/components/beranda/HeroSection.tsx` (pattern animasi standar)
- [ ] **PRE-004** — Baca `src/components/beranda/FeatureGrid.tsx` (pattern grid + stagger)
- [ ] **PRE-005** — Baca `src/components/layout/Navbar.tsx` (pattern navigasi)
- [ ] **PRE-006** — Baca `src/lib/utils.ts` (cn() utility)
- [ ] **PRE-007** — Baca `src/lib/constants.ts` (EASE_CURVE, GRADIENT_SLUGS)
- [ ] **PRE-008** — Baca `src/app/globals.css` (custom @theme, animasi, glass)
- [ ] **PRE-009** — `npx next build` — pastikan zero errors sebelum mulai mengubah apapun
- [ ] **PRE-010** — `git status` — pastikan working tree bersih
- [ ] **PRE-011** — `git branch` — pastikan di branch yang benar
- [ ] **PRE-012** — Buat branch: `git checkout -b feat/master-todo-execution`

---

## ══════════════════════════════════════════
## BLOCK 1: P0 — CRITICAL SECURITY (Hari 1-2)
## ══════════════════════════════════════════

### 1A: vercel.json + Origin Check

- [ ] **SEC-001** — Buat `vercel.json` di root (framework detection Next.js + redirect/rewrite rules)
- [ ] **SEC-002** — `src/app/api/kuis/selesai/route.ts` — Fix origin check: ganti `startsWith()` jadi parse URL + exact hostname match
- [ ] **SEC-003** — `src/app/api/kuis/rekap/route.ts` — Fix origin check: ganti `startsWith()` jadi parse URL + exact hostname match
- [ ] **SEC-004** — Audit semua file yang pakai `startsWith()` untuk origin/domain check → fix semua

### 1B: Auth Gate V1 API

- [ ] **SEC-005** — `src/app/api/v1/auth/register/route.ts` — Public register HANYA boleh role `SISWA`, role tidak boleh dari request body
- [ ] **SEC-006** — `src/app/api/v1/kursus/route.ts` — Pasang JWT auth middleware (requireAuth), hanya GURU/OWNER bisa POST/PUT
- [ ] **SEC-007** — `src/app/api/v1/enroll/route.ts` — Pasang JWT auth, hanya SISWA bisa enroll diri sendiri
- [ ] **SEC-008** — `src/app/api/v1/kursus/[id]/nilai/route.ts` — Pasang auth, hanya GURU pemilik kursus atau ADMIN bisa akses
- [ ] **SEC-009** — `src/app/api/v1/enroll/status/route.ts` — Pasang auth, hanya siswa ybs atau guru/admin bisa akses
- [ ] **SEC-010** — Buat `src/lib/auth-actions.ts` — helper `requireAuth()` dan `requireRole()` reusable untuk semua API
- [ ] **SEC-011** — Audit semua route `/api/v1/*` — pastikan semua default protected

### 1C: Rate Limiter (In-Memory → Redis-Ready)

- [ ] **SEC-012** — `src/lib/rate-limit.ts` — Fix silent bypass saat store >= MAX_STORE_SIZE (jangan `if store.size < MAX` lalu silent pass, harus reject)
- [ ] **SEC-013** — `src/lib/rate-limit.ts` — Tambah fallback graceful: kalau store penuh, tetap rate-limit dengan LRU eviction
- [ ] **SEC-014** — `src/lib/rate-limit.ts` — Tambah Redis adapter (opsional, pakai `REDIS_URL` env jika tersedia, fallback ke in-memory)
- [ ] **SEC-015** — `src/app/api/masuk/route.ts` — Rate limit by IP + email/nama (bukan IP saja)
- [ ] **SEC-016** — `src/app/api/kuis/selesai/route.ts` — Rate limit by JWT userId + IP

### 1D: CSP Fix

- [ ] **SEC-017** — `next.config.ts` — Hapus `'unsafe-inline'` dari script-src
- [ ] **SEC-018** — `next.config.ts` — Ganti CSP jadi true nonce-based: `'nonce-{nonce}' 'strict-dynamic'`
- [ ] **SEC-019** — `src/middleware.ts` (atau `src/proxy.ts`) — Generate nonce per request, inject ke header CSP + HTML

### 1E: Password + Auth Hardening

- [ ] **SEC-020** — `src/lib/auth-password.ts` — Ganti bcrypt jadi bcryptjs dengan cost factor 12 (atau siapkan migrasi ke argon2id)
- [ ] **SEC-021** — `src/app/api/masuk/route.ts` — Tambah constant-time comparison untuk password guru
- [ ] **SEC-022** — `src/app/api/masuk/route.ts` — Tambah account lockout setelah 5x gagal login (15 menit)
- [ ] **SEC-023** — `src/app/api/masuk/route.ts` — Tambah audit trail login (IP, User-Agent, timestamp, success/fail) ke log/Telegram
- [ ] **SEC-024** — `src/lib/session.ts` — Pastikan SameSite cookie = `strict` (bukan `lax`)
- [ ] **SEC-025** — `src/lib/logout.ts` — Implementasi JWT blacklist/revocation (pakai Redis set dengan TTL = remaining token time)
- [ ] **SEC-026** — `src/middleware.ts` (atau `src/proxy.ts`) — Cek blacklist token tiap request

### 1F: Content-Type + Body Size + Input Validation

- [ ] **SEC-027** — Semua API route POST/PUT — Tambah cek Content-Type header (wajib application/json)
- [ ] **SEC-028** — Semua API route — Tambah body size limit (pakai Next.js `bodyParser.sizeLimit` atau manual check)
- [ ] **SEC-029** — `src/lib/validation.ts` — Audit semua Zod schema, pastikan semua endpoint punya validasi input
- [ ] **SEC-030** — `src/lib/sanitize.ts` — Audit: pastikan handle javascript: URLs, event handlers, encoded chars

### 1G: Mock Data → Ganti/Hapus

- [ ] **SEC-031** — `src/app/api/v1/kursus/route.ts` — Hapus `mockKursus` array, ganti ke Drizzle DB insert/select
- [ ] **SEC-032** — `src/app/api/v1/enroll/route.ts` — Ganti mock ke Drizzle DB
- [ ] **SEC-033** — `src/app/api/v1/kursus/[id]/nilai/route.ts` — Ganti mock ke Drizzle DB
- [ ] **SEC-034** — `src/data/mock.ts` — Tambah comment `// DEPRECATED: only for dev/demo` atau hapus jika tidak dipakai

### 1H: Hardcoded Secrets

- [ ] **SEC-035** — `docker-compose.prod.yml` — Hapus semua hardcoded `akaldev`, ganti ke `${POSTGRES_PASSWORD:?missing}`
- [ ] **SEC-036** — `scripts/prod-entrypoint.sh` — Hapus fallback hardcoded password
- [ ] **SEC-037** — `.env.example` — Ganti `ENCRYPTION_SECRET=0000...` ke placeholder yang jelas
- [ ] **SEC-038** — Audit seluruh codebase: `grep -r "akaldev\|password123\|admin123" --include="*.ts" --include="*.tsx" --include="*.yml" --include="*.sh" .`

### 1I: Docker Security

- [ ] **SEC-039** — `docker-compose.prod.yml` — Hapus `ports: "3000:3000"`, hanya internal network
- [ ] **SEC-040** — `docker-compose.prod.yml` — App container: tambah `deploy.resources.limits.memory: 1500M`
- [ ] **SEC-041** — `docker-compose.prod.yml` — Postgres: `deploy.resources.limits.memory: 400M`
- [ ] **SEC-042** — `docker-compose.prod.yml` — Redis: `deploy.resources.limits.memory: 150M` + `command: redis-server --maxmemory 100mb --maxmemory-policy allkeys-lru`
- [ ] **SEC-043** — `Dockerfile` — Pastikan user non-root (`USER nodejs`)
- [ ] **SEC-044** — `Dockerfile` — Pastikan jemalloc terinstall + env LD_PRELOAD

### 1J: Cloudflare Worker Fix

- [ ] **SEC-045** — `workers/akal-center/index.ts` — Fix ORIGIN default: jangan fallback ke `akalcenter.my.id`, harus explicit
- [ ] **SEC-046** — `workers/akal-center/index.ts` — Tambah guard: jika ORIGIN host === request host → return config error, jangan proxy loop

---

## ══════════════════════════════════════════
## BLOCK 2: P0 — BUG FIXES (Hari 2-3)
## ══════════════════════════════════════════

### 2A: Quiz Engine Fix

- [ ] **BUG-001** — `src/components/evaluasi/QuizEngine.tsx` — Fix: intro menampilkan "0 soal" → pakai `bab.soal.length` di state intro
- [ ] **BUG-002** — `src/components/evaluasi/QuizEngine.tsx` — Fix: jawaban terakhir tidak tersimpan → hitung final di variabel lokal sebelum submit, jangan andalkan state async
- [ ] **BUG-003** — `src/components/evaluasi/QuizEngine.tsx` — Fix: ulang kuis tidak submit ulang → reset `submittedRef.current = false` di `startQuiz()`
- [ ] **BUG-004** — `src/components/evaluasi/QuizEngine.tsx` — Tambah attempt number tracking (attempt 1, 2, 3...)
- [ ] **BUG-005** — `src/components/evaluasi/QuizEngine.tsx` — Tambah best score & latest score display
- [ ] **BUG-006** — `src/components/evaluasi/QuizEngine.tsx` — Tambah retry logic untuk submit ke API (3x retry dengan exponential backoff)
- [ ] **BUG-007** — `src/app/api/kuis/selesai/route.ts` — Tambah status feedback ke user (simpan gagal? tampilkan pesan + tombol coba lagi)

### 2B: Navbar Overflow + CMS

- [ ] **BUG-008** — `keystatic.config.ts` — Tambah filter/limit navigation items (< 8 item) atau tambah scroll/dropdown
- [ ] **BUG-009** — `src/components/layout/Navbar.tsx` — Handle overflow navigasi (pakai dropdown "Lainnya..." jika > 7 item)
- [ ] **BUG-010** — `src/lib/cms-config.ts` — Pastikan `CMS_ENABLED` default `false` jika env tidak diset

### 2C: Rekap Nilai

- [ ] **BUG-011** — `src/app/pendidik/page.tsx` — Fix: "0 dari 0" display bug (cek `data.error` + catch block)
- [ ] **BUG-012** — `src/app/api/kuis/rekap/route.ts` — Tambah error handling yang lebih baik (non-200 response)
- [ ] **BUG-013** — `src/app/pendidik/page.tsx` — Tambah loading skeleton saat fetch rekap

### 2D: General UI/UX

- [ ] **BUG-014** — Audit semua halaman — cek empty state (data kosong tampil apa?)
- [ ] **BUG-015** — Audit semua halaman — cek error state (fetch gagal tampil apa?)
- [ ] **BUG-016** — Audit semua halaman — cek loading state (fetch berjalan tampil skeleton?)
- [ ] **BUG-017** — `src/app/not-found.tsx` — Pastikan 404 page custom (bukan default Next.js)
- [ ] **BUG-018** — `src/app/error.tsx` — Pastikan error boundary works + reset button

---

## ══════════════════════════════════════════
## BLOCK 3: P1 — DATABASE PERSISTENCE (Hari 3-5)
## ══════════════════════════════════════════

### 3A: Drizzle Schema — Finalisasi

- [ ] **DB-001** — `src/lib/db/schema.ts` — Review 14 table: pastikan semua kolom lengkap sesuai PRD 06
- [ ] **DB-002** — `src/lib/db/schema.ts` — Tambah tabel `event_store` (id, streamId, version, eventType, payload JSONB, previousHash, signature, createdAt)
- [ ] **DB-003** — `src/lib/db/schema.ts` — Tambah tabel `google_drive_auth` (id, guruId FK unique, refreshTokenEncrypted, googleEmail, driveFolderId, status, createdAt)
- [ ] **DB-004** — `src/lib/db/schema.ts` — Tambah tabel `file_materi` (id, skillId FK, guruId FK, namaFile, tipeMime, ukuranBytes, lokasi enum, driveFileId, linkAkses)
- [ ] **DB-005** — `src/lib/db/schema.ts` — Tambah tabel `feature_flag` (id, name unique, enabled, createdAt)
- [ ] **DB-006** — `src/lib/db/schema.ts` — Tambah tabel `sertifikat` (id, siswaId FK, kursusId FK, nomorSertifikat unique, qrSecretHash, issuedAt)
- [ ] **DB-007** — `src/lib/db/schema.ts` — Tambah tabel `transaksi` (id, siswaId, kursusId, jumlah, metodePembayaran, paymentGatewayRef, status, paidAt)
- [ ] **DB-008** — `src/lib/db/schema.ts` — Tambah tabel `risk_snapshot` (id, siswaId FK, kursusId, riskScore, status, komponen JSONB, snapshotDate)
- [ ] **DB-009** — `src/lib/db/schema.ts` — Tambah tabel `remedial_recommendation` (id, siswaId, skillId FK, prioritasScore, status, createdAt)
- [ ] **DB-010** — `src/lib/db/schema.ts` — Tambah tabel `teacher_readiness_snapshot` (id, guruId, triScore, komponen JSONB, snapshotDate)
- [ ] **DB-011** — `src/lib/db/schema.ts` — Pastikan semua `@default(uuid())` → pakai UUID v7
- [ ] **DB-012** — `src/lib/db/schema.ts` — Tambah Drizzle relations untuk semua Foreign Key
- [ ] **DB-013** — `src/lib/db/schema.ts` — Tambah index untuk kolom yang sering di-query (siswaId, kursusId, skillId, createdAt)
- [ ] **DB-014** — `drizzle.config.ts` — Pastikan config valid + `schema` path benar
- [ ] **DB-015** — Generate migrasi: `npx drizzle-kit generate`
- [ ] **DB-016** — Jalankan migrasi: `npx drizzle-kit migrate`
- [ ] **DB-017** — `npx next build` — pastikan tidak ada type error setelah schema update

### 3B: DB Client + Connection

- [ ] **DB-018** — `src/lib/db/index.ts` — Review singleton Drizzle client (pastikan globalThis pattern untuk hot reload)
- [ ] **DB-019** — `.env.example` — Tambah `DATABASE_URL` dengan format jelas
- [ ] **DB-020** — `.env.local` — Set `DATABASE_URL` untuk development (pointing ke local PG atau Neon dev)

### 3C: Data Layer — Ganti Mock ke Real

- [ ] **DB-021** — `src/lib/db/queries/kursus.ts` — Buat query functions: createKursus, getKursusById, getKursusByGuru, updateKursus, deleteKursus
- [ ] **DB-022** — `src/lib/db/queries/user.ts` — Buat query functions: createUser, getUserByEmail, getUserById, updateUser
- [ ] **DB-023** — `src/lib/db/queries/enroll.ts` — Buat query functions: enrollSiswa, getEnrollmentsBySiswa, getEnrollmentsByKursus
- [ ] **DB-024** — `src/lib/db/queries/jawaban.ts` — Buat query functions: insertJawaban, getJawabanLogBySiswa, getJawabanLogBySoal
- [ ] **DB-025** — `src/lib/db/queries/nilai.ts` — Buat query functions: getNilaiByKursus, getNilaiBySiswa
- [ ] **DB-026** — `src/app/api/v1/kursus/route.ts` — Ganti mock array ke Drizzle query
- [ ] **DB-027** — `src/app/api/v1/enroll/route.ts` — Ganti mock ke Drizzle query
- [ ] **DB-028** — `src/app/api/v1/kursus/[id]/nilai/route.ts` — Ganti mock ke Drizzle query
- [ ] **DB-029** — `src/app/api/v1/auth/register/route.ts` — Ganti mock ke Drizzle insert User
- [ ] **DB-030** — `src/app/api/v1/auth/login/route.ts` — Implementasi login via Drizzle (cek email + verify password)
- [ ] **DB-031** — `src/app/api/kuis/selesai/route.ts` — Tambah parallel write ke Drizzle (selain Google Sheets untuk backward compat)
- [ ] **DB-032** — `src/app/api/kuis/rekap/route.ts` — Tambah opsi baca dari Drizzle (selain Google Sheets)

---

## ══════════════════════════════════════════
## BLOCK 4: P1 — DASHBOARD GURU REAL (Hari 5-8)
## ══════════════════════════════════════════

- [ ] **DASH-001** — `src/app/dashboard-guru/page.tsx` — Buat dashboard utama guru (ringkasan: total kursus, total siswa, kuis terbaru)
- [ ] **DASH-002** — `src/app/dashboard-guru/kursus/page.tsx` — List kursus milik guru (grid card, dari DB)
- [ ] **DASH-003** — `src/app/dashboard-guru/kursus/[id]/page.tsx` — Detail kursus: daftar siswa, daftar skill, quiz sessions
- [ ] **DASH-004** — `src/app/dashboard-guru/kursus/create/page.tsx` — Form buat kursus baru (judul, deskripsi, slug, harga)
- [ ] **DASH-005** — `src/app/dashboard-guru/kursus/[id]/edit/page.tsx` — Form edit kursus
- [ ] **DASH-006** — `src/app/dashboard-guru/siswa/page.tsx` — List siswa (tabel: nama, kelas, kursus, status)
- [ ] **DASH-007** — `src/app/dashboard-guru/nilai/page.tsx` — Gradebook: matriks siswa × quiz (dari DB, bukan Sheets)
- [ ] **DASH-008** — `src/app/dashboard-guru/nilai/[kursusId]/page.tsx` — Detail nilai per kursus
- [ ] **DASH-009** — `src/components/dashboard/GradebookTable.tsx` — Komponen tabel nilai reusable
- [ ] **DASH-010** — `src/components/dashboard/StatCard.tsx` — Komponen stat card (total X, tren naik/turun)
- [ ] **DASH-011** — `src/app/dashboard-guru/layout.tsx` — Layout dashboard (sidebar kiri: nav, main content kanan)
- [ ] **DASH-012** — `src/app/dashboard-guru/loading.tsx` — Loading skeleton untuk dashboard
- [ ] **DASH-013** — `src/app/dashboard-guru/error.tsx` — Error boundary untuk dashboard
- [ ] **DASH-014** — `src/app/dashboard-guru/soal/page.tsx` — Bank soal guru (CRUD soal, tagging ke skill)
- [ ] **DASH-015** — `src/app/dashboard-guru/soal/create/page.tsx` — Form buat soal (PG, ISIAN, ESSAY)
- [ ] **DASH-016** — `src/app/dashboard-guru/soal/import/page.tsx` — Import soal massal via CSV/Excel
- [ ] **DASH-017** — `src/app/dashboard-guru/quiz/page.tsx` — Quiz session management (buat quiz, pilih soal, atur durasi)
- [ ] **DASH-018** — `src/app/dashboard-guru/siswa/import/page.tsx` — Import siswa via CSV (auto-create akun + enroll)
- [ ] **DASH-019** — `src/app/dashboard-guru/nilai/export/page.tsx` — Export nilai ke CSV/Excel
- [ ] **DASH-020** — `src/components/layout/Navbar.tsx` — Tambah link ke Dashboard Guru (hanya tampil jika role=GURU)

---

## ══════════════════════════════════════════
## BLOCK 5: P2 — PRIVACY & MODERATION (Hari 8-9)
## ══════════════════════════════════════════

- [ ] **PRV-001** — `src/app/api/refleksi/route.ts` — Ganti default visibility: refleksi privat ke guru (bukan publik)
- [ ] **PRV-002** — `src/app/api/diskusi/route.ts` — Tambah moderation: status pending → approved (guru approve dulu)
- [ ] **PRV-003** — `src/app/diskusi/[slug]/page.tsx` — Hanya tampilkan diskusi yang sudah approved
- [ ] **PRV-004** — `src/app/api/siswa/cek/route.ts` — Hapus/tidak perlu minta NIK, cukup nama + tanggalLahir
- [ ] **PRV-005** — `src/app/api/siswa/cek/route.ts` — Tambah rate limit ketat (5 req/menit per IP)
- [ ] **PRV-006** — `src/app/tentang/page.tsx` — Tambah section Kebijakan Privasi (link ke halaman `/kebijakan-privasi`)
- [ ] **PRV-007** — `src/app/kebijakan-privasi/page.tsx` — Buat halaman kebijakan privasi (UU PDP compliance)
- [ ] **PRV-008** — `src/app/syarat-layanan/page.tsx` — Buat halaman syarat layanan
- [ ] **PRV-009** — `src/app/refleksi/page.tsx` — Tambah consent checkbox "Saya setuju refleksi ini dibagikan ke guru"
- [ ] **PRV-010** — `src/app/diskusi/[slug]/page.tsx` — Tambah disclaimer "Diskusi dimoderasi, jangan share data pribadi"
- [ ] **PRV-011** — `src/lib/db/schema.ts` — Pastikan tabel `users` punya kolom `deletedAt` (soft delete UU PDP)
- [ ] **PRV-012** — `src/app/api/v1/account/me/route.ts` — Buat DELETE endpoint (anonimkan data, soft delete)
- [ ] **PRV-013** — `src/app/api/v1/account/export/route.ts` — Buat GET endpoint (export semua data user dalam JSON)

---

## ══════════════════════════════════════════
## BLOCK 6: P3 — VPS PRODUCTION (Hari 9-12)
## ══════════════════════════════════════════

### 6A: Docker Setup

- [ ] **VPS-001** — `Dockerfile` — Review + finalize (jemalloc, V8 flags, multi-stage build jika perlu)
- [ ] **VPS-002** — `.dockerignore` — Pastikan komplit (node_modules, .next, .git, .env*, docs, prd, audit*, skills, *.md)
- [ ] **VPS-003** — `docker-compose.yml` — Review service app (build context, env vars, healthcheck)
- [ ] **VPS-004** — `docker-compose.yml` — Service postgres: volume persisten, port internal only
- [ ] **VPS-005** — `docker-compose.yml` — Service redis: volume persisten, maxmemory config
- [ ] **VPS-006** — `docker-compose.yml` — Service caddy: reverse proxy ke app:3000, auto-SSL
- [ ] **VPS-007** — `infra/caddy/Caddyfile` — Buat konfigurasi Caddy (reverse proxy, HSTS header)
- [ ] **VPS-008** — `docker-compose.prod.yml` — Finalize production compose (no hardcoded secrets, resource limits)
- [ ] **VPS-009** — `scripts/prod-entrypoint.sh` — Buat entrypoint script (wait for DB, run migration, start app)
- [ ] **VPS-010** — Test build: `docker compose -f docker-compose.yml build`
- [ ] **VPS-011** — Test run: `docker compose -f docker-compose.yml up -d` → cek logs → cek `/api/health`

### 6B: Environment + Secrets

- [ ] **VPS-012** — `.env.production.example` — Buat template env production (semua var tanpa nilai)
- [ ] **VPS-013** — Generate secrets: `JWT_SECRET`, `ENCRYPTION_SECRET`, `ADMIN_API_KEY` — semua random 64 char
- [ ] **VPS-014** — Generate `POSTGRES_PASSWORD` random 32 char
- [ ] **VPS-015** — Rotasi credential Telegram bot jika perlu

### 6C: Backup + Restore

- [ ] **VPS-016** — `scripts/backup.sh` — Buat script backup harian (pg_dump → gzip → encrypt → upload R2/Drive)
- [ ] **VPS-017** — `scripts/restore.sh` — Buat script restore (download → decrypt → unzip → pg_restore → migrate)
- [ ] **VPS-018** — Test backup: jalankan `backup.sh`, verifikasi file terenkripsi ada
- [ ] **VPS-019** — Test restore: jalankan `restore.sh` ke database testing, verifikasi data lengkap
- [ ] **VPS-020** — `crontab` — Setup cron untuk backup harian (jam 2 pagi)

### 6D: Monitoring

- [ ] **VPS-021** — `src/app/api/health/route.ts` — Health check endpoint (cek DB + Redis, return uptime + timestamp)
- [ ] **VPS-022** — `src/app/api/monitor/ping/route.ts` — Deep health check (cek DB write+read, Redis write+read)
- [ ] **VPS-023** — `docker-compose.yml` — Pastikan healthcheck tiap service terpasang
- [ ] **VPS-024** — Setup UptimeRobot (atau BetterUptime) untuk monitor `akalcenter.my.id`
- [ ] **VPS-025** — `scripts/synthetic-monitor.sh` — Buat script: login → ambil soal → submit → cek 200 OK (cron tiap 15 menit)
- [ ] **VPS-026** — `src/lib/telegram.ts` — Tambah alert: RAM > 85%, error spike, siswa risk > 0.6

### 6E: Hardening

- [ ] **VPS-027** — VPS: nonaktifkan root SSH, ganti port SSH, key-based auth only
- [ ] **VPS-028** — VPS: setup UFW (hanya buka 80, 443 dari Cloudflare IP range)
- [ ] **VPS-029** — VPS: install fail2ban untuk SSH
- [ ] **VPS-030** — `docker-compose.yml` — App service: `restart: unless-stopped`
- [ ] **VPS-031** — `docker-compose.yml` — Logging: max-size 10m, max-file 3 (hemat 60GB SSD)
- [ ] **VPS-032** — Cloudflare: SSL mode Full (Strict)
- [ ] **VPS-033** — Cloudflare: WAF rule untuk `/api/masuk`, `/api/v1/auth/*`, `/api/kuis/selesai` (rate limit)

---

## ══════════════════════════════════════════
## BLOCK 7: P4 — DATA MIGRATION (Hari 12-14)
## ══════════════════════════════════════════

- [ ] **MIG-001** — `scripts/migrate-sheets-to-db.ts` — Script: baca Google Sheets RekapNilai → insert ke JawabanLog
- [ ] **MIG-002** — `scripts/migrate-sheets-to-db.ts` — Script: baca DaftarSiswa → insert ke tabel users (role SISWA)
- [ ] **MIG-003** — `scripts/migrate-cms-to-db.ts` — Script: baca Keystatic slugs → insert ke tabel kursus
- [ ] **MIG-004** — `scripts/migrate-soal-to-db.ts` — Script: baca soal dari CMS/JSON → insert ke tabel soal + skill
- [ ] **MIG-005** — Jalankan semua script migrasi di environment dev
- [ ] **MIG-006** — Verifikasi data: `SELECT count(*) FROM users`, `jawaban_log`, `kursus`, `soal`
- [ ] **MIG-007** — Backup database dev sebelum migrasi production
- [ ] **MIG-008** — Jalankan migrasi di production VPS
- [ ] **MIG-009** — Verifikasi production: bandingkan jumlah data Sheets vs DB
- [ ] **MIG-010** — Setup dual-write: quiz submit → tulis ke DB + Google Sheets (selama transisi 2 minggu)
- [ ] **MIG-011** — Setelah 2 minggu verifikasi → disable Google Sheets write (keep as archive)

---

## ══════════════════════════════════════════
## BLOCK 8: P5 — GOOGLE DRIVE PER GURU (Hari 14-16)
## ══════════════════════════════════════════

- [ ] **GDR-001** — Google Cloud Console: Enable Google Drive API
- [ ] **GDR-002** — Google Cloud Console: Buat OAuth 2.0 Client ID (Web application)
- [ ] **GDR-003** — Google Cloud Console: Set redirect URI `https://akalcenter.my.id/api/guru/drive/callback`
- [ ] **GDR-004** — `.env` — Tambah `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] **GDR-005** — `src/lib/storage/IStorageAdapter.ts` — Buat interface: upload, delete, getLink, getStream
- [ ] **GDR-006** — `src/lib/storage/LocalAdapter.ts` — Implementasi local fallback (simpan ke `./uploads/`)
- [ ] **GDR-007** — `src/lib/storage/GDriveAdapter.ts` — Implementasi Google Drive (OAuth2 + drive.files.create)
- [ ] **GDR-008** — `src/lib/storage/GDriveAdapter.ts` — Fungsi: cek/buat folder "AKAL Center" di Drive guru
- [ ] **GDR-009** — `src/lib/storage/GDriveAdapter.ts` — Fungsi: upload file, set permission reader anyone, return webContentLink
- [ ] **GDR-010** — `src/lib/storage/StorageFactory.ts` — getAdapterForGuru(guruId): cek DB → GDriveAdapter atau LocalAdapter
- [ ] **GDR-011** — `src/lib/crypto.ts` — Buat fungsi encryptAES256 / decryptAES256 (untuk refresh token)
- [ ] **GDR-012** — `src/app/api/guru/drive/connect/route.ts` — GET: generate OAuth URL Google, redirect
- [ ] **GDR-013** — `src/app/api/guru/drive/callback/route.ts` — GET: exchange code → refresh_token → encrypt → simpan DB
- [ ] **GDR-014** — `src/app/api/guru/materi/upload/route.ts` — POST: terima file → getAdapter → upload → return link
- [ ] **GDR-015** — `src/app/dashboard-guru/materi/page.tsx` — UI upload materi (drag-and-drop, progress bar)
- [ ] **GDR-016** — `src/app/dashboard-guru/materi/page.tsx` — UI list materi (nama file, tipe, ukuran, link)
- [ ] **GDR-017** — `src/app/dashboard-guru/settings/page.tsx` — Halaman settings guru (connect/disconnect Google Drive)
- [ ] **GDR-018** — Test end-to-end: guru connect Drive → upload PDF → file di Drive → siswa akses link

---

## ══════════════════════════════════════════
## BLOCK 9: P6 — QUIZ ENGINE v2 + EVENT SOURCING (Hari 16-19)
## ══════════════════════════════════════════

- [ ] **EVT-001** — `src/lib/db/schema.ts` — Pastikan tabel `event_store` sudah ada (cek Block 3)
- [ ] **EVT-002** — `src/lib/event-store.ts` — Buat helper: appendEvent(streamId, eventType, payload)
- [ ] **EVT-003** — `src/lib/event-store.ts` — Hash chain: previousHash = SHA256(prevHash + payload + version)
- [ ] **EVT-004** — `src/lib/event-store.ts` — HMAC signature untuk event kritis (opsional)
- [ ] **EVT-005** — `src/app/api/v1/quiz/submit/route.ts` — API submit kuis v2: write ke EventStore + push ke Redis queue
- [ ] **EVT-006** — `src/app/api/v1/quiz/submit/route.ts` — Idempotency: cek header `X-Idempotency-Key` di Redis
- [ ] **EVT-007** — `src/lib/redis.ts` — Buat Redis client singleton (pakai `REDIS_URL` env)

### Worker Analytics

- [ ] **EVT-008** — `worker/analytics.ts` — Buat worker process: BRPOP queue:analytics → process event
- [ ] **EVT-009** — `worker/analytics.ts` — Process JAWABAN_SUBMITTED: parse jawaban, hitung benar/salah
- [ ] **EVT-010** — `worker/analytics.ts` — Write JawabanLog (read model) ke database
- [ ] **EVT-011** — `worker/analytics.ts` — Hitung BKT → update SkillMastery
- [ ] **EVT-012** — `worker/analytics.ts` — Hitung Elo → update Soal.eloRating + StudentAbility.theta
- [ ] **EVT-013** — `worker/analytics.ts` — Hitung Risk Score → insert RiskSnapshot
- [ ] **EVT-014** — `worker/analytics.ts` — Jika P(L) < 0.6 → insert RemedialRecommendation
- [ ] **EVT-015** — `worker/analytics.ts` — Jika risk > 0.5 → kirim Telegram alert ke guru
- [ ] **EVT-016** — `worker/analytics.ts` — Emit ANALYTICS_UPDATED event setelah semua selesai
- [ ] **EVT-017** — `worker/analytics.ts` — JITTER: random delay 0-2 detik antar processing
- [ ] **EVT-018** — `worker/analytics.ts` — Memory: panggil `global.gc()` setelah process batch jika perlu
- [ ] **EVT-019** — `docker-compose.yml` — Tambah service worker (image app, command worker.js, memory limit 512M)
- [ ] **EVT-020** — `Dockerfile` — Pastikan worker juga pakai jemalloc

### Load Shedding

- [ ] **EVT-021** — `src/app/api/v1/quiz/submit/route.ts` — Cek panjang Redis queue, jika > 500 → reject 503
- [ ] **EVT-022** — `src/lib/redis.ts` — Helper: getQueueLength() → Redis LLEN

---

## ══════════════════════════════════════════
## BLOCK 10: P7 — MATERI & QUIZ UI IMPROVEMENTS (Hari 19-21)
## ══════════════════════════════════════════

- [ ] **UI-001** — `src/app/materi/page.tsx` — Tambah filter by kelas (7/8/9) + search
- [ ] **UI-002** — `src/app/materi/[slug]/page.tsx` — Tambah progress bar per bab (dari localStorage atau DB)
- [ ] **UI-003** — `src/app/materi/[slug]/page.tsx` — Tambah "Tandai Selesai" button + centang hijau
- [ ] **UI-004** — `src/components/materi/MateriDetailClient.tsx` — Tambah table of contents (sub-topik navigasi)
- [ ] **UI-005** — `src/app/evaluasi/page.tsx` — Tambah history quiz sebelumnya (attempts, best score)
- [ ] **UI-006** — `src/app/game/page.tsx` — Pastikan 12 game punya cover WebP semua
- [ ] **UI-007** — `src/app/video/page.tsx` — Tambah thumbnail YouTube (bukan hanya link)
- [ ] **UI-008** — `src/app/hafalan/page.tsx` — Tambah progress tracking (dalil mana yang sudah dihafal)
- [ ] **UI-009** — `src/components/evaluasi/QuizEngine.tsx` — Tambah timer countdown di UI
- [ ] **UI-010** — `src/components/evaluasi/QuizEngine.tsx` — Tambah nomor soal + progress (5/20)
- [ ] **UI-011** — `src/components/evaluasi/QuizEngine.tsx` — Tambah review jawaban di result screen
- [ ] **UI-012** — `src/components/evaluasi/QuizEngine.tsx` — Tambah share score (WA, copy link)

---

## ══════════════════════════════════════════
## BLOCK 11: P8 — ANALYTICS DASHBOARD (Hari 21-24)
## ══════════════════════════════════════════

### 11A: Domain Logic (Pure Functions — No DB)

- [ ] **ANL-001** — `src/lib/analytics/calculateBKT.ts` — Implementasi updateBKT (prior, isCorrect, params) → posterior
- [ ] **ANL-002** — `src/lib/analytics/calculateBKT.ts` — Implementasi slipForward (prior, pT) → posterior
- [ ] **ANL-003** — `src/lib/analytics/calculateElo.ts` — Implementasi updateElo (ratingSiswa, ratingSoal, isCorrect, K)
- [ ] **ANL-004** — `src/lib/analytics/calculateRiskScore.ts` — Implementasi calculateRiskScore (6 metrics) → 0-1
- [ ] **ANL-005** — `src/lib/analytics/calculateSpacedRep.ts` — Implementasi SM-2 algorithm (qualityScore, prevInterval, EF, n)
- [ ] **ANL-006** — `src/lib/analytics/calculateTRI.ts` — Implementasi Teacher Readiness Index (6 dimensi)
- [ ] **ANL-007** — `src/lib/analytics/calculateIRT.ts` — Implementasi irt3PL (theta, a, b, c) → probability
- [ ] **ANL-008** — `src/lib/analytics/calculateIRT.ts` — Implementasi estimateTheta (Newton-Raphson, max 30 iterasi)
- [ ] **ANL-009** — Unit test: calculateBKT (selalu benar, selalu salah, campuran)
- [ ] **ANL-010** — Unit test: calculateElo (benar soal sulit, salah soal mudah)
- [ ] **ANL-011** — Unit test: calculateRiskScore (aman, pantau, berisiko, kritis)
- [ ] **ANL-012** — Unit test: calculateSpacedRep (quality 0-5, interval progression)

### 11B: Analytics API

- [ ] **ANL-013** — `src/app/api/v1/analytics/siswa/[id]/route.ts` — GET: return BKT mastery per skill + risk score
- [ ] **ANL-014** — `src/app/api/v1/analytics/kursus/[id]/route.ts` — GET: return rata-rata BKT per skill, risk distribution
- [ ] **ANL-015** — `src/app/api/v1/analytics/guru/[id]/tri/route.ts` — GET: return TRI score + komponen breakdown
- [ ] **ANL-016** — `src/app/api/v1/analytics/remedial/[siswaId]/route.ts` — GET: return remedial recommendations

### 11C: Analytics UI (Dashboard Guru)

- [ ] **ANL-017** — `src/components/dashboard/RadarChart.tsx` — Komponen radar chart (BKT mastery per skill) — pakai recharts
- [ ] **ANL-018** — `src/components/dashboard/RiskTable.tsx` — Tabel siswa dengan warna risk (hijau/kuning/oranye/merah)
- [ ] **ANL-019** — `src/components/dashboard/SkillBar.tsx` — Progress bar per skill dengan persentase penguasaan
- [ ] **ANL-020** — `src/components/dashboard/TRIChart.tsx` — Radar chart TRI (6 dimensi)
- [ ] **ANL-021** — `src/app/dashboard-guru/analytics/[kursusId]/page.tsx` — Halaman analytics per kursus
- [ ] **ANL-022** — `src/app/dashboard-guru/siswa/[id]/page.tsx` — Halaman detail siswa (BKT, risk, remedial)
- [ ] **ANL-023** — `src/app/dashboard-guru/tri/page.tsx` — Halaman TRI guru (skor + rekomendasi)

### 11D: Cron Jobs

- [ ] **ANL-024** — `scripts/cron/calibrate-irt.ts` — Kalibrasi ulang IRT a,b,c tiap malam (jika >100 jawaban per soal)
- [ ] **ANL-025** — `scripts/cron/calculate-tri.ts` — Hitung TRI semua guru tiap malam
- [ ] **ANL-026** — `scripts/cron/cleanup-logs.ts` — Cleanup jawaban_log > 365 hari
- [ ] **ANL-027** — `scripts/cron/spaced-repetition.ts` — Generate notifikasi review untuk siswa (nextReviewAt <= today)

---

## ══════════════════════════════════════════
## BLOCK 12: P9 — SERTIFIKAT + PAYMENT (Hari 24-27)
## ══════════════════════════════════════════

### 12A: Sertifikat

- [ ] **CRT-001** — `pnpm add @react-pdf/renderer`
- [ ] **CRT-002** — `src/lib/sertifikat/generateQRHash.ts` — SHA-256(nomorSertifikat + siswaId + secret)
- [ ] **CRT-003** — `src/components/sertifikat/CertificateTemplate.tsx` — Template PDF sertifikat (pakai @react-pdf/renderer)
- [ ] **CRT-004** — `src/components/sertifikat/CertificateTemplate.tsx` — QR code di sertifikat (pakai qrcode.react atau library QR)
- [ ] **CRT-005** — `src/app/api/v1/sertifikat/generate/route.ts` — POST: generate PDF + simpan nomor + hash ke DB
- [ ] **CRT-006** — `src/app/api/verify/[nomor]/route.ts` — GET: verifikasi sertifikat (cek hash di DB)
- [ ] **CRT-007** — `src/app/verify/[nomor]/page.tsx` — Halaman verifikasi publik (valid/tidak valid)
- [ ] **CRT-008** — `src/app/dashboard-guru/sertifikat/page.tsx` — UI guru: lihat/unduh sertifikat siswa
- [ ] **CRT-009** — `src/app/dashboard-siswa/sertifikat/page.tsx` — UI siswa: lihat/unduh sertifikat sendiri

### 12B: Payment (Midtrans)

- [ ] **PAY-001** — Daftar akun Midtrans (https://midtrans.com)
- [ ] **PAY-002** — `.env` — Tambah `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_MERCHANT_ID`
- [ ] **PAY-003** — `pnpm add midtrans-client` (atau pakai fetch langsung ke API)
- [ ] **PAY-004** — `src/lib/midtrans.ts` — Buat helper: createTransaction, verifySignature
- [ ] **PAY-005** — `src/app/api/v1/payment/create/route.ts` — POST: create Snap token → return redirect URL
- [ ] **PAY-006** — `src/app/api/v1/payment/webhook/route.ts` — POST: terima notifikasi Midtrans → verifikasi signature → update transaksi
- [ ] **PAY-007** — `src/app/api/v1/payment/webhook/route.ts` — Auto-enroll siswa setelah pembayaran sukses
- [ ] **PAY-008** — `src/app/dashboard-siswa/payment/page.tsx` — UI siswa: pilih paket, bayar
- [ ] **PAY-009** — `src/app/dashboard-guru/revenue/page.tsx` — UI guru: lihat pendapatan

---

## ══════════════════════════════════════════
## BLOCK 13: P10 — QA & TESTING (Hari 27-29)
## ══════════════════════════════════════════

- [ ] **QA-001** — `npx next build` — pastikan zero warnings + zero errors
- [ ] **QA-002** — `npx eslint .` — pastikan zero errors
- [ ] **QA-003** — `npx tsc --noEmit` — pastikan type checking lulus
- [ ] **QA-004** — Audit visual: buka semua halaman di browser, cek mobile + desktop
- [ ] **QA-005** — Test flow guru: register → buat kursus → upload materi → buat soal → buat quiz → lihat nilai
- [ ] **QA-006** — Test flow siswa: register → enroll kursus → akses materi → kerjakan quiz → lihat nilai → lihat sertifikat
- [ ] **QA-007** — Test flow payment: siswa bayar → webhook diterima → auto-enroll → akses kursus
- [ ] **QA-008** — Test security: coba akses API tanpa token → harus 401
- [ ] **QA-009** — Test security: coba register sebagai GURU via API publik → harus ditolak
- [ ] **QA-010** — Test security: coba akses nilai siswa lain → harus 403
- [ ] **QA-011** — Test rate limit: spam login 10x → harus kena block sementara
- [ ] **QA-012** — Test load: Apache Bench `ab -n 1000 -c 50 https://akalcenter.my.id/api/health`
- [ ] **QA-013** — Test backup: jalankan backup.sh → restore ke DB testing → verifikasi
- [ ] **QA-014** — Test Docker: `docker compose -f docker-compose.prod.yml up --build` → semua service UP
- [ ] **QA-015** — Test offline: matikan Redis → pastikan app tidak crash, return graceful error
- [ ] **QA-016** — Test memory: `docker stats` saat load test → pastikan RAM < 3.5GB di VPS 4GB

---

## ══════════════════════════════════════════
## BLOCK 14: P11 — LAUNCH PREP (Hari 29-30)
## ══════════════════════════════════════════

- [ ] **LCH-001** — `README.md` — Update dokumentasi (cara setup, deploy, backup, monitoring)
- [ ] **LCH-002** — `docs/architecture.md` — Buat dokumentasi arsitektur final (tech stack, data flow, deployment)
- [ ] **LCH-003** — `docs/api.md` — Dokumentasi API (semua endpoint, auth, contoh request/response)
- [ ] **LCH-004** — Domain: pastikan `akalcenter.my.id` pointing ke VPS (bukan Vercel)
- [ ] **LCH-005** — Cloudflare: SSL Full Strict, WAF rules, rate limiting
- [ ] **LCH-006** — VPS: semua service Docker Compose UP + restart policy
- [ ] **LCH-007** — Database: migration production sukses, RLS enabled
- [ ] **LCH-008** — Auth: register + login guru & siswa jalan
- [ ] **LCH-009** — Backup: cron job aktif, restore terverifikasi
- [ ] **LCH-010** — Monitoring: UptimeRobot + synthetic monitor aktif
- [ ] **LCH-011** — `vercel.json` — Setup redirect dari Vercel ke domain baru (atau hapus Vercel deployment)
- [ ] **LCH-012** — `git add -A && git commit -m "feat: AKAL Center v2 — multi-guru platform with analytics"`
- [ ] **LCH-013** — `git push origin main`

---

## ══════════════════════════════════════════
## BLOCK 15: P12 — POST-LAUNCH ITERATION (Bulan 2-3)
## ══════════════════════════════════════════

- [ ] **POST-001** — Kumpulkan 500+ data jawaban real sebelum kalibrasi IRT
- [ ] **POST-002** — Validasi Risk Score: korelasi dengan nilai ujian akhir → kalibrasi bobot
- [ ] **POST-003** — Implementasi IRT 3PL penuh (setelah >100 jawaban per soal)
- [ ] **POST-004** — Implementasi quiz adaptif (soal berikutnya berdasarkan theta sementara)
- [ ] **POST-005** — Tambah import soal massal via Excel (guru upload XLSX → parse → insert)
- [ ] **POST-006** — Tambah export nilai ke Excel (gradebook → download XLSX)
- [ ] **POST-007** — Dark mode toggle (untuk guru yang lembur malam)
- [ ] **POST-008** — PWA offline support (service worker cache untuk akses materi tanpa internet)

---

## ══════════════════════════════════════════
## BLOCK 16: P13 — AI FEATURES (Bulan 3-4)
## ══════════════════════════════════════════

- [ ] **AI-001** — Setup DeepSeek V3 via OpenRouter/NaraRouter (gratis)
- [ ] **AI-002** — `.env` — Tambah `OPENROUTER_API_KEY`, `AI_MODEL=deepseek/deepseek-chat`
- [ ] **AI-003** — `src/lib/ai/tutor.ts` — AI Tutor: terima pertanyaan + konteks materi → return jawaban
- [ ] **AI-004** — `src/lib/ai/grading.ts` — AI Grading: terima jawaban essay + rubrik → return nilai + feedback
- [ ] **AI-005** — `src/lib/ai/generate-soal.ts` — AI Generate Soal: terima teks materi → return 5 soal PG + kunci
- [ ] **AI-006** — `src/lib/ai/semantic-cache.ts` — Semantic Cache: embedding → cosine similarity → Redis cache
- [ ] **AI-007** — `src/app/api/v1/ai/tutor/route.ts` — POST: tanya AI tutor (dengan rate limit + cache)
- [ ] **AI-008** — `src/app/api/v1/ai/grade/route.ts` — POST: AI grading essay (guru approve/edit)
- [ ] **AI-009** — `src/app/api/v1/ai/generate-soal/route.ts` — POST: AI generate soal (guru review)
- [ ] **AI-010** — `src/app/dashboard-guru/soal/ai-generate/page.tsx` — UI: guru input teks → AI generate soal → review → save
- [ ] **AI-011** — `src/app/dashboard-siswa/ai-tutor/page.tsx` — UI: chat AI tutor (nonaktif saat halaman quiz)
- [ ] **AI-012** — `src/lib/ai/growth-mindset.ts` — Growth Mindset: reframe feedback kegagalan oleh AI

---

## ══════════════════════════════════════════
## BLOCK 17: FUTURE — V2 ADVANCED (Bulan 4+)
## ══════════════════════════════════════════

- [ ] **FUT-001** — Multi-tenancy: domain custom per sekolah (sekolah.sch.id → white-label)
- [ ] **FUT-002** — Event Sourcing penuh: hash-chain di semua event kritis
- [ ] **FUT-003** — Hexagonal architecture: extract domain/application/infrastructure
- [ ] **FUT-004** — PgBouncer: connection pooling untuk >100 concurrent
- [ ] **FUT-005** — Materialized views: mv_class_analytics untuk dashboard berat
- [ ] **FUT-006** — Video conference: integrasi Zoom/BigBlueButton
- [ ] **FUT-007** — Forum diskusi: per kursus, guru moderate
- [ ] **FUT-008** — Wiki kolaboratif: siswa + guru edit dokumen bersama
- [ ] **FUT-009** — Chat real-time: antara guru-siswa
- [ ] **FUT-010** — Kalender akademik: jadwal kelas, ujian, deadline
- [ ] **FUT-011** — Grup siswa: guru bisa bikin kelompok kerja
- [ ] **FUT-012** — Marketplace kursus: guru jual kursus, siswa beli
- [ ] **FUT-013** — REST API publik: integrasi dengan sistem sekolah lain
- [ ] **FUT-014** — Argon2id migration: ganti bcrypt ke argon2id
- [ ] **FUT-015** — CSRF Double Submit Cookie
- [ ] **FUT-016** — 2FA untuk admin
- [ ] **FUT-017** — OWASP ZAP scan + penetration test
- [ ] **FUT-018** — GDPR / UU PDP full compliance audit
- [ ] **FUT-019** — Chaos engineering: kill random service, pastikan system survive
- [ ] **FUT-020** — Horizontal scaling: load balancer + multi-instance

---

## ══════════════════════════════════════════
## BLOCK X: DELETED / REJECTED ITEMS
## ══════════════════════════════════════════

> Hal-hal yang sengaja DITUNDA atau DITOLAK berdasarkan PRD 08 + audit GPT 5.5:

- ~~Event Sourcing penuh~~ → Tunda ke Fase 2 (V2 Advanced)
- ~~Hexagonal architecture penuh~~ → Sederhanakan, pakai struktur App Router
- ~~PgBouncer~~ → Tunda sampai >100 concurrent user
- ~~Materialized Views~~ → Tunda sampai data >1000 siswa
- ~~Puppeteer untuk PDF~~ → Ganti ke @react-pdf/renderer
- ~~Prisma ORM~~ → Pakai Drizzle ORM (sudah terpasang)
- ~~Neon Postgres~~ → Pakai PostgreSQL di VPS
- ~~WebSocket~~ → Ganti ke SSE (lebih ringan)
- ~~SCORM/LTI/xAPI~~ → Tidak relevan untuk SMP/MTs Indonesia
- ~~Neon Postgres for production~~ → Hanya untuk staging/dev

---

## ══════════════════════════════════════════
## 📊 PROGRESS TRACKER
## ══════════════════════════════════════════

| Block | Nama | Items | Selesai | Status |
|-------|------|-------|---------|--------|
| 0 | Pre-Flight | 12 | 0 | ⬜ (build passes) |
| 1 | P0 Security | 46 | 10 | 🟡 SEC-001,005,006,008,009,012,020,021,022,024 verified |
| 2 | P0 Bug Fixes | 18 | 8 | 🟡 BUG-001,008,009,010,011,014-018 verified |
| 3 | P1 Database | 32 | 14 | 🟡 DB-001-010, 018 verified; migration 0001 new |
| 4 | P1 Dashboard Guru | 20 | 12 | 🟢 DASH-001-004,006-013,020 verified + dashboard-siswa new |
| 5 | P2 Privacy | 13 | 6 | 🟡 PRV-007,008,009,010,011,012 verified |
| 6 | P3 VPS Production | 33 | 18 | 🟡 Dockerfile+compose+Caddyfile+backup/restore+health check |
| 7 | P4 Data Migration | 11 | 5 | 🟡 MIG-001-004 scripts created + run-all |
| 8 | P5 Google Drive | 18 | 0 | ⬜ |
| 9 | P6 Quiz Engine v2 | 22 | 0 | ⬜ |
| 10 | P7 UI Improvements | 12 | 4 | 🟡 search materi + YouTube thumbnail + timer (existing) + progress bar (existing) |
| 11 | P8 Analytics | 27 | 0 | ⬜ |
| 12 | P9 Sertifikat + Payment | 18 | 12 | 🟢 Midtrans scaffold + Sertifikat scaffold + QR hash + verify |
| 13 | P10 QA | 16 | 2 | 🟡 build ✅ + typecheck ✅ |
| 14 | P11 Launch | 13 | 0 | ⬜ |
| 15 | P12 Post-Launch | 8 | 0 | ⬜ |
| 16 | P13 AI Features | 12 | 0 | ⬜ |
| 17 | Future V2 | 20 | 0 | ⬜ |
| **TOTAL** | | **351** | **91** | **26%** |

> **Last updated:** 6 Juli 2026 — Session audit + scaffolding

---

> *MASTER TODO LIST — AKAL Center v2.0*
> *Dibuat dari sintesis: PRD 01-08 + Audit GPT 5.5 (17 file) + AUDIT-FLAW + diskusi.md + AGENTS.md + DESAIN.md + RINGKASAN_KLIEN.md*
> *AI Agent: kerjakan dari PRE-001. Jangan skip. Laporkan progress per block.*
