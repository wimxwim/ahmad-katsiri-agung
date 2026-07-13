# TODO FINAL — AKAL CENTER v2

> **Tanggal:** 13 Juli 2026
> **Sumber:** Diskusi 2 hari + Audit 6 Sub-Agent (middleware, generate flow, database, API, frontend, security)
> **Total Task:** 80 item (50 original + 30 temuan audit, beberapa overlap sudah di-merge)

---

## 🔴 FASE 0: CRITICAL FIX — Build & Runtime (HARI INI — 5 task)

| # | ID | Task | File | Detail |
|---|----|------|------|--------|
| C1 | **MID-01** | **Rename middleware.ts → proxy.ts** | `src/middleware.ts` → `src/proxy.ts` | Next.js 16 deprecation warning. Root `proxy.ts` sudah ada (Edge-safe, Web Crypto, CSRF, CSP nonce, role guard, legacy redirects). Tinggal pindahin + hapus middleware.ts. |
| C2 | **AUTH-01** | **Fix `randomUUID` from `crypto` di auth.ts** | `src/lib/auth.ts:4` | Edge runtime incompatible. Ganti `import { randomUUID } from "crypto"` → `crypto.randomUUID()` (Web Crypto API, tersedia di Node 19+ dan Edge). Hanya dipakai di `signSession()` line 51. `verifySession()` tidak terpengaruh. |
| C3 | **CRON-01** | **Hapus CRON_SECRET hardcoded fallback** | `src/app/api/v1/cron/generate/route.ts:12` | `"akal-cron-secret"` exposed di public repo. Ganti: wajibkan env var, return 401 kalau tidak diset. |
| C4 | **GEN-01** | **Auto-trigger generate setelah upload** | `src/app/api/v1/guru/uploads/route.ts` | Upload selesai → status `extracted` → TIDAK auto-generate. Guru harus manual klik "Generate AI" di Draft AI. Toast "AI sedang memproses" menyesatkan. Fix: auto-trigger `runGenerationFromText()` fire-and-forget setelah upload sukses. ATAU ubah toast jadi "Dokumen berhasil diupload. Silakan generate dari halaman Draft AI." |
| C5 | **SEC-01** | **Server-side CSRF validation** | Semua API route (state-changing) | `x-csrf-token` dikirim client tapi TIDAK PERNAH diverifikasi server. Double-submit cookie pattern tidak lengkap. Tambah middleware/helper validasi CSRF di semua POST/PUT/PATCH/DELETE endpoint (kecuali webhook + auth). |

---

## 🟠 FASE 1: AI Pipeline Fix (HARI INI — 8 task)

| # | ID | Task | File | Detail |
|---|----|------|------|--------|
| 1.1 | **AI-01** | **Fix default model ke `gpt-5.6-luna`** | `src/lib/ai.ts` | ✅ DONE. `getModelName()` + `getFlashModel()` default ke `gpt-5.6-luna`. |
| 1.2 | **AI-02** | **`buildSoalSystemPrompt(n)` — dynamic soal prompt** | `src/lib/ai-generator.ts` | Prompt hardcode "10 soal" → fungsi dinamis: `buildSoalSystemPrompt(soalCount)`. Termasuk tingkat kesulitan dinamis (30% mudah, 40% sedang, 30% sulit). |
| 1.3 | **AI-03** | **`buildQuizSystemPrompt(n)` — dynamic quiz prompt** | `src/lib/ai-generator.ts` | Prompt hardcode "5 soal" → fungsi dinamis: `buildQuizSystemPrompt(quizCount)`. |
| 1.4 | **AI-04** | **`fallbackAiResults(text, soalCount?, quizCount?)` — dynamic fallback** | `src/lib/ai-generator.ts` | Fallback hardcode 5 quiz + 10 soal → dinamis sesuai parameter. |
| 1.5 | **AI-05** | **`runGenerationFromText()` terima soalCount + quizCount** | `src/lib/ai-generator.ts` | Signature: `(id, text, guruId, soalCount?, quizCount?)`. Default: soal=10, quiz=5. |
| 1.6 | **AI-06** | **`runGeneration()` juga terima soalCount + quizCount** | `src/lib/ai-generator.ts` | Konsisten dengan `runGenerationFromText()`. |
| 1.7 | **AI-07** | **Query params `?soalCount=X&quizCount=Y` di generate route** | `src/app/api/v1/guru/drafts/[id]/generate/route.ts` | Baca dari `request.nextUrl.searchParams`. Validasi: soalCount 10-35, quizCount 5-15. Default: soal=10, quiz=5. Response tambah field `soalCount` + `quizCount`. |
| 1.8 | **AI-08** | **Perbaiki normalizer soal di ai-sanitizer.ts** | `src/lib/ai-sanitizer.ts` | Soal sering `not_generated` karena output AI tidak sesuai schema. Perbaiki: normalisasi tipe (PG/ISIAN/ESSAY), opsi (array→object), kunci, payload. |

---

## 🟡 FASE 2: Kategori File + Upload Rapih (HARI INI — 5 task)

| # | ID | Task | File | Detail |
|---|----|------|------|--------|
| 2.1 | **DB-01** | **Tambah kolom `kategori` di `fileMateri`** | `src/lib/db/schema.ts` | Enum: `materi` / `ppt` / `soal` / `docs` / `modul_ajar`. Default: `materi`. |
| 2.2 | **DB-02** | **Generate + apply migrasi** | `drizzle/`, Supabase | `ALTER TABLE file_materi ADD COLUMN kategori VARCHAR(20) DEFAULT 'materi'`. |
| 2.3 | **UPL-01** | **Auto-detect kategori dari nama file** | `src/app/api/v1/guru/uploads/route.ts` | Regex: `-ppt` → ppt, `-soal` → soal, `modul ajar` → modul_ajar, `.docx` → docs, else materi. |
| 2.4 | **UPL-02** | **Simpan `kategori` saat insert `fileMateri`** | `src/app/api/v1/guru/uploads/route.ts` | Pass `kategori` ke INSERT. |
| 2.5 | **UPL-03** | **Filter draft by kategori di list** | `src/app/guru/drafts/page.tsx` | Opsional: filter dropdown untuk kategori di halaman Draft AI. |

---

## 🟢 FASE 3: Token Balance System (BESOK — 14 task)

| # | ID | Task | File | Detail |
|---|----|------|------|--------|
| 3.1 | **TOK-01** | **Tambah tabel `token_balances` di schema** | `src/lib/db/schema.ts` | Kolom: `userId` (FK users, PK), `balance` (integer, Rp), `totalTopup` (integer), `totalSpent` (integer), `lastTopupAt` (timestamp), `updatedAt`. |
| 3.2 | **TOK-02** | **Generate + apply migrasi** | `drizzle/`, Supabase | `CREATE TABLE token_balances (...)`. |
| 3.3 | **TOK-03** | **Buat `src/lib/token-service.ts`** | NEW | Functions: `getBalance(userId)`, `checkBalance(userId, amount)`, `deductBalance(userId, amount)`, `creditBalance(userId, amount)`. Semua transactional. |
| 3.4 | **TOK-04** | **`GET /api/v1/guru/token/balance`** | NEW route | Return: `{ balance, totalTopup, totalSpent, lastTopupAt }`. Auth: `requireGuru`. |
| 3.5 | **TOK-05** | **`POST /api/v1/guru/token/topup`** | NEW route | Body: `{ amount: 10000|15000|20000|25000|30000|50000, proofImage: File }`. Upload bukti ke ImageKit. INSERT `payments` (status: pending). Auto-credit 15 detik → UPDATE `token_balances`. Kirim notif Telegram. |
| 3.6 | **TOK-06** | **Validasi top-up** | NEW route | Amount: salah satu dari [10K, 15K, 20K, 25K, 30K, 50K]. File: image only (JPG/PNG/WebP), max 5MB. Rate limit: 5x/hari per user. |
| 3.7 | **TOK-07** | **Auto-credit 15 detik delay** | `token-service.ts` | Simulasi "dana masuk" — `setTimeout(15000)` lalu `creditBalance()`. Return success dengan saldo baru. |
| 3.8 | **TOK-08** | **Buat `src/lib/telegram-notif.ts`** | NEW | Bot token dari `TELEGRAM_BOT_TOKEN` env var. Chat ID dari `TELEGRAM_CHAT_ID` env var. Function: `sendTopupNotification(userId, nama, amount, proofUrl, newBalance)`. |
| 3.9 | **TOK-09** | **Format notif Telegram** | `telegram-notif.ts` | `"🔔 Top-up baru!\nUser: {nama} (ID: {userId})\nNominal: Rp{amount}\nBukti: {proofUrl}\nSaldo sekarang: Rp{newBalance}"` |
| 3.10 | **TOK-10** | **Token deduction saat generate** | `ai-generator.ts` + generate route | Sebelum generate: `checkBalance(guruId, 132)` → kalau kurang return 402. Setelah generate sukses: `deductBalance(guruId, 132)`. |
| 3.11 | **TOK-11** | **Error 402 — saldo kurang** | generate route | `{ "error": "Saldo token tidak cukup. Minimal Rp132/generate. Top-up sekarang?", "balance": 5000, "required": 132 }` |
| 3.12 | **TOK-12** | **Auto-create token_balances row saat register** | register route | Insert row dengan balance=0 untuk semua user baru. |
| 3.13 | **TOK-13** | **Audit log transaksi token** | `event-store.ts` | Append event `token.topup` / `token.deduct` / `token.generate`. |
| 3.14 | **TOK-14** | **Rate limit top-up: 5x/hari** | `rate-limit.ts` | `checkRateLimitPerUser("topup:${userId}", 5, 86400)`. |

---

## 🔵 FASE 4: Materi Sharing (PRIVAT/PUBLIK/KRABAT) — LUSA (14 task)

| # | ID | Task | File | Detail |
|---|----|------|------|--------|
| 4.1 | **SHR-01** | **Tambah tabel `materi_sharing`** | `schema.ts` | Kolom: `materiPublishedId` (FK, PK), `visibility` enum (PRIVAT/PUBLIK/KRABAT), `price` (integer, hanya untuk PUBLIK), `approvalStatus` (PENDING/APPROVED/REJECTED), `updatedAt`. |
| 4.2 | **SHR-02** | **Tambah tabel `materi_purchase`** | `schema.ts` | Kolom: `id`, `buyerId` (FK users), `materiPublishedId` (FK), `sellerId` (FK users), `price`, `purchasedAt`. |
| 4.3 | **SHR-03** | **Tambah tabel `krabat_connections`** | `schema.ts` | Kolom: `id`, `guruId` (FK users), `connectedGuruId` (FK users), `status` enum (PENDING/ACTIVE/REJECTED), `createdAt`, `updatedAt`. |
| 4.4 | **SHR-04** | **Generate + apply migrasi** | `drizzle/`, Supabase | 3 tabel baru. |
| 4.5 | **SHR-05** | **`POST /api/v1/guru/materi/:id/sharing`** | NEW route | Set visibility: PRIVAT (default) / KRABAT / PUBLIK. PUBLIK: auto-set `approvalStatus=PENDING` (butuh izin developer). |
| 4.6 | **SHR-06** | **Default visibility: PRIVAT** | — | Materi baru published → otomatis PRIVAT. Hanya guru sendiri + siswanya yang bisa akses. |
| 4.7 | **SHR-07** | **`GET /api/v1/katalog`** | NEW route | List materi dengan `visibility=PUBLIK` DAN `approvalStatus=APPROVED`. Public endpoint (no auth required untuk list). |
| 4.8 | **SHR-08** | **`POST /api/v1/katalog/:id/beli`** | NEW route | Guru beli materi PUBLIK. Potong saldo buyer, tambah saldo seller (80%), platform (20%). Copy materi ke akun buyer. |
| 4.9 | **SHR-09** | **`POST /api/v1/guru/krabat/connect`** | NEW route | Request koneksi ke guru lain. Status: PENDING. |
| 4.10 | **SHR-10** | **`POST /api/v1/guru/krabat/approve`** | NEW route | Approve/reject koneksi. Status: ACTIVE/REJECTED. |
| 4.11 | **SHR-11** | **KRABAT access control** | Guard middleware | Materi KRABAT hanya bisa dilihat guru dengan koneksi ACTIVE. |
| 4.12 | **SHR-12** | **ARSIP visibility** | sharing route | Tambah enum ARSIP: hanya guru sendiri (tidak siswa, tidak guru lain). |
| 4.13 | **SHR-13** | **Developer approval API untuk PUBLIK** | NEW | `POST /api/v1/owner/sharing/approve` / `reject`. Hanya owner. |
| 4.14 | **SHR-14** | **Sharing audit log** | `event-store.ts` | Append event `materi.share`, `materi.purchase`, `krabat.connect`, `krabat.approve`. |

---

## 🟣 FASE 5: Auth & Security Hardening (BESOK — 7 task)

| # | ID | Task | File | Detail |
|---|----|------|------|--------|
| 5.1 | **SEC-02** | **Password complexity policy** | `register/route.ts` | Tambah Zod validation: minimal 1 uppercase, 1 lowercase, 1 digit. Min length tetap 8. |
| 5.2 | **SEC-03** | **Account-level login lockout** | `login/route.ts` | Setelah 5x gagal login → lock 15 menit. Track via Redis: `lockout:${email}`. |
| 5.3 | **SEC-04** | **SameSite cookie `lax` → `strict`** | Semua auth endpoint | Evaluasi impact ke OAuth redirect. Kalau aman, ganti ke `strict`. Kalau tidak, pertahankan `lax` + perkuat CSRF server-side (C5). |
| 5.4 | **SEC-05** | **Logout: revoke refresh token walau session expired** | `logout/route.ts` | Cek cookie `akal_refresh` → decode tanpa verifikasi → extract userId → revoke all refresh tokens. Idempotent. |
| 5.5 | **SEC-06** | **Login rate limit lebih ketat dari register** | Rate limit config | Saat ini: login 5/15s, register 3/60s. Balik: login 3/60s, register 5/60s. |
| 5.6 | **SEC-07** | **CSP: tambah `report-uri`** | `middleware.ts` → `proxy.ts` | Arahkan ke `/api/csp-report`. Endpoint sudah ada. |
| 5.7 | **SEC-08** | **WA number: hapus hardcode default** | `constants.ts:5` | Ganti `\|\| "6285158795502"` → throw error kalau env tidak diset. WA number hanya dari env var. |

---

## 🟤 FASE 6: Database Cleanup (LUSA — 6 task)

| # | ID | Task | File | Detail |
|---|----|------|------|--------|
| 6.1 | **DB-03** | **Fix migration journal desync** | `drizzle/meta/_journal.json` | Tambah entries 0014-0023 ke journal. Supaya Drizzle CLI tidak conflict. |
| 6.2 | **DB-04** | **Buat migration 0017 (`owner_metrics_daily`)** | NEW migration | AGENTS.md klaim sudah ada tapi file tidak ada. Buat tabel + materialized view untuk daily owner metrics. |
| 6.3 | **DB-05** | **Sinkronkan 30+ manual indexes ke schema.ts** | `schema.ts` | Indexes dibuat via manual SQL migration (0013b-0020) tapi tidak dideklarasi di Drizzle. Tambah deklarasi `index()` di setiap tabel yang relevan. |
| 6.4 | **DB-06** | **Tambah missing Drizzle relations** | `schema.ts` | `payments.userId → users`, `ai_requests.userId → users`, `quota_usages.userId → users`, `quota_usages.quotaId → quotas`, `student_ability.kursusId → kursus`, `transaksi.siswaId → users`, `skill → fileMateri`. |
| 6.5 | **DB-07** | **Tambah missing indexes** | `schema.ts` | `file_materi.guruId`, `file_materi.kursusId`, `file_materi.status`, `quiz_published.guruId`, `soal_published.aiGenerationId`, `transaksi.kursusId`. |
| 6.6 | **DB-08** | **Tambah missing indexes** (lanjutan) | migration SQL | Indexes untuk performance: `ai_requests.(user_id, created_at)` sudah ada, cek sisanya. |

---

## ⚪ FASE 7: UI Polish & Gap Fix (MINGGU DEPAN — 10 task)

| # | ID | Task | File | Detail |
|---|----|------|------|--------|
| 7.1 | **UI-01** | **Tombol Generate untuk status `queued`** | `drafts/page.tsx` | Saat ini hanya `extracted` + `failed` yang ada tombol Generate. Tambah `queued`. |
| 7.2 | **UI-02** | **Tombol Regenerate Quiz & Soal di detail page** | `drafts/[id]/page.tsx` | Saat ini hanya tab Materi yang ada tombol Regenerate. Tambah di tab Quiz & Soal. |
| 7.3 | **UI-03** | **Endpoint `/regenerate` (full) dipanggil dari UI** | `drafts/[id]/page.tsx` | Endpoint sudah ada tapi TIDAK PERNAH dipanggil. Tambah tombol "Regenerate All". |
| 7.4 | **UI-04** | **Fix toast upload menyesatkan** | `upload/page.tsx` | "Sistem AI sedang memproses" → "Dokumen berhasil diupload. Silakan generate dari halaman Draft AI." (kalau tidak auto-generate). |
| 7.5 | **UI-05** | **Tambah `/guru/nilai` & `/guru/sertifikat` ke sidebar** | `GuruLayoutClient.tsx` | Halaman sudah ada, tidak ada link di sidebar. |
| 7.6 | **UI-06** | **Halaman `/guru/token` — top-up + riwayat** | NEW page | Tampilkan saldo, form top-up (nominal selector + upload bukti), riwayat transaksi. |
| 7.7 | **UI-07** | **Saldo token di dashboard `/guru/beranda`** | `beranda/page.tsx` | Tampilkan badge saldo token + link ke `/guru/token`. |
| 7.8 | **UI-08** | **Filter kategori di halaman Draft AI** | `drafts/page.tsx` | Dropdown filter: Semua / Materi / PPT / Soal / Docs. |
| 7.9 | **UI-09** | **Empty MIME type tidak lolos** | upload route | `if (file.type && ...)` → kalau MIME kosong, reject. (Saat ini lolos, tapi magic bytes catch). |
| 7.10 | **UI-10** | **Tambahkan halaman `/guru/drafts?kategori=ppt` untuk filter** | `drafts/page.tsx` | Query param filter by kategori. |

---

## ⬜ FASE 8: Upload 42 File + Test Masal (MINGGU DEPAN — 8 task)

| # | ID | Task | Detail |
|---|----|------|--------|
| 8.1 | **TST-01** | Upload 3 sample file (1 topik: materi+ppt+soal) via `apaaja@gmail.com` | Manual test. |
| 8.2 | **TST-02** | Generate dengan `?soalCount=15&quizCount=10` | Manual test. |
| 8.3 | **TST-03** | Verify kualitas materi, quiz, soal | Cek konten, relevansi, distraktor. |
| 8.4 | **TST-04** | Approve → close review → publish | Full flow end-to-end. |
| 8.5 | **TST-05** | Siswa akses + kerjakan quiz | Daftar siswa baru, enroll, akses materi, submit quiz. |
| 8.6 | **TST-06** | Upload semua 42 file (14 topik × 3 file) | Batch upload via API/script. |
| 8.7 | **TST-07** | Generate semua 42 file | Batch generate. |
| 8.8 | **TST-08** | Approve + publish semua | Batch approve. |

---

## 🟥 FASE 9: Cron & Observability (ONGOING — 4 task)

| # | ID | Task | File | Detail |
|---|----|------|------|--------|
| 9.1 | **OBS-01** | **Perbaiki `/api/health` — checkImageKit() + checkSupabase()** | `health/route.ts` | Saat ini false-alarm "degraded". Endpoint yang dicek salah target. |
| 9.2 | **OBS-02** | **Tambah health metric: token balance service** | `health/route.ts` | Cek apakah `token-service.ts` bisa query DB. |
| 9.3 | **OBS-03** | **Tambah health metric: Telegram bot** | `health/route.ts` | Cek koneksi ke Telegram Bot API. |
| 9.4 | **OBS-04** | **Daily cron: bersihkan payment pending > 24 jam** | NEW cron route | Auto-reject payment yang tidak diverifikasi dalam 24 jam. |

---

## 📊 STATISTIK TOTAL

| Fase | Prioritas | Task Count | Estimasi |
|------|-----------|-----------|----------|
| Fase 0 | 🔴 CRITICAL | 5 | Hari ini |
| Fase 1 | 🟠 AI Pipeline | 8 | Hari ini |
| Fase 2 | 🟡 Upload Rapih | 5 | Hari ini |
| Fase 3 | 🟢 Token System | 14 | Besok |
| Fase 4 | 🔵 Sharing | 14 | Lusa |
| Fase 5 | 🟣 Security | 7 | Besok |
| Fase 6 | 🟤 DB Cleanup | 6 | Lusa |
| Fase 7 | ⚪ UI Polish | 10 | Minggu depan |
| Fase 8 | ⬜ Testing | 8 | Minggu depan |
| Fase 9 | 🟥 Cron/Observ | 4 | Ongoing |
| **TOTAL** | | **80** | |

---

## 🗺️ URUTAN EKSEKUSI PER HARI

```
HARI 1 (SENIN):
  Fase 0: C1 (proxy.ts) → C2 (randomUUID) → C3 (CRON_SECRET) → C4 (auto-generate) → C5 (CSRF)
  Fase 1: AI-02 s/d AI-08 (dynamic prompt + soalCount/quizCount + normalizer)
  Fase 2: DB-01, DB-02, UPL-01, UPL-02 (kategori file)

HARI 2 (SELASA):
  Fase 3: TOK-01 s/d TOK-14 (token system lengkap)
  Fase 5: SEC-02 s/d SEC-08 (auth hardening)

HARI 3 (RABU):
  Fase 4: SHR-01 s/d SHR-14 (sharing system)
  Fase 6: DB-03 s/d DB-08 (database cleanup)

HARI 4 (KAMIS):
  Fase 7: UI-01 s/d UI-10 (UI polish + gap fix)

HARI 5 (JUMAT):
  Fase 8: TST-01 s/d TST-08 (upload 42 file + test masal)
  Fase 9: OBS-01 s/d OBS-04 (cron + observability)
```

---

## 📝 CATATAN

- **Frontend:** Fokus backend. Semua task frontend (Fase 7) hanya untuk gap minimal agar sistem berfungsi.
- **Marketplace:** DITUNDA. Tidak ada jual-beli materi untuk sekarang. Sharing hanya PRIVAT/PUBLIK/KRABAT — PUBLIK belum bisa beli (pending approval developer).
- **Modul Ajar:** DITUNDA. Fitur PRO dihapus. Semua guru FREE.
- **Token price:** Rp132/generate (200% margin).
- **Semua hasil penjualan = SALDO KREDIT.** Tidak bisa dicairkan. Hanya untuk generate token.
- **Deploy:** Setiap fase yang menyentuh kode diakhiri dengan `npm run build` → deploy Vercel.