# AUDIT REGRESSION — 18 Juli 2026

> **Trigger:** Backend dirombak besar-besaran (Fase 0-3, 32 task) → frontend error di mana-mana
> **Status:** 1 root cause ditemukan, 1 fix, 11 temuan tambahan dari audit cross-reference
> **Dampak:** Semua POST/PUT/PATCH/DELETE API gagal 403
> **Audit lanjutan:** Cross-reference `backend-dev-guidelines` (12 file) + schema/migration + PRD Fase 0

---

## 🔴 ROOT CAUSE: `middleware.ts` → `proxy.ts` (Commit 59e097afa, 13 Jul 2026)

Commit `feat(v2): Fase 0-3 complete — 32/80 tasks` merename:

```
src/middleware.ts → src/proxy.ts
```

**Next.js HANYA mengenali file bernama `middleware.ts`** (di root atau `src/`). Begitu direname ke `proxy.ts`, middleware berhenti total.

### Bukti

1. **Middleware manifest kosong**
   ```
   .next/server/middleware-manifest.json = {"middleware": {}, "sortedMiddleware": [], "functions": {}}
   ```

2. **CSRF cookie tidak pernah diset**
   ```bash
   $ curl -si https://akalcenter.my.id/guru | grep -i "psrf\|csrf"
   # (kosong — tidak ada Set-Cookie __Host-psrf)
   ```

3. **Compiled middleware.js tidak mengandung kode proxy.ts**
   ```bash
   $ grep -c "proxy\|csrf\|psrf" .next/server/middleware.js
   0
   ```

4. **POST generate = 403**
   ```bash
   $ curl -X POST https://akalcenter.my.id/api/v1/guru/drafts/[id]/generate
   HTTP/2 403
   {"error": "CSRF token tidak valid"}
   ```

---

## 📊 Dampak — API yang Terkena

Semua POST/PUT/PATCH/DELETE ke endpoint non-exempt gagal 403 karena `validateCsrf()` di `src/lib/csrf-server.ts` tidak menemukan cookie `__Host-psrf`.

| Endpoint | Dampak |
|----------|--------|
| `POST /api/v1/guru/drafts/[id]/generate` | ❌ AI Generate gagal 403 |
| `POST /api/v1/guru/uploads` | ❌ Upload dokumen gagal 403 |
| `POST /api/v1/token/topup/upload` | ❌ Upload bukti top-up gagal 403 |
| `POST /api/v1/donation` | ❌ Donasi gagal 403 |
| `POST /api/v1/donation/upload` | ❌ Upload bukti donasi gagal 403 |
| `POST /api/v1/guru/kursus` | ❌ Buat kursus gagal 403 |
| `POST /api/v1/guru/kelas` | ❌ Buat kelas gagal 403 |
| `POST /api/v1/guru/drafts/[id]/approve` | ❌ Approve draft gagal 403 |
| Semua POST/PUT/PATCH/DELETE lainnya | ❌ Gagal 403 |

### Yang TIDAK Terkena (EXEMPT_PREFIXES)

| Endpoint | Kenapa Aman |
|----------|-------------|
| `POST /api/v1/auth/*` | Exempt — auth flow |
| `POST /api/v1/payment/webhook` | Exempt — webhook |
| `GET /api/*` | Aman — GET tidak dicek CSRF |
| Login, Register, Refresh | Exempt — `/api/v1/auth/*` |

---

## ✅ FIX: Rename Balik

```bash
cd /home/ngome/agensi/proyek/akal-center
mv src/proxy.ts src/middleware.ts
```

**1 file, 1 baris command.** Setelah rename, rebuild, deploy ulang.

---

## 🔍 Temuan Tambahan

### 1. Build OOM — Perlu `NODE_OPTIONS`

Build Next.js gagal OOM di memori default Node.js (512MB). Project butuh ~4GB.

**Fix:** Tambah env var di Vercel:
```
NODE_OPTIONS = --max-old-space-size=4096
```
✅ **Sudah dilakukan** via Vercel CLI (18 Jul 2026).

### 2. Telegram Token — Masih Aman

`TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` masih ada di Vercel env vars (38 hari). Tidak hilang. Top-up/Donasi gagal karena CSRF, bukan karena Telegram.

### 3. AI Generate — `requireUnlocked` Gate Baru

Commit `fa00aba52` (16 Jul) menambahkan `requireUnlocked()` di generate route. User yang belum pernah top-up akan kena 402 "Fitur generate AI terkunci". Ini by design (PRD-UNIFIED-LAUNCH-v2.md Fase 0).

### 4. Token Balance Guru `apaaja@gmail.com`

```
balance: Rp941.596
totalTopup: Rp931.666
totalSpent: Rp70
isUnlocked: true
```

Saldo cukup. Generate seharusnya bisa setelah CSRF fix.

### 5. Dashboard Guru — Normal

4 kursus, 3 siswa, 19 draft menunggu, 8 materi published, 8 quiz published. Tidak ada error.

### 6. Session Cookie Name — `__Host-akal_sesi` vs `akal_sesi`

**File:** `src/lib/session.ts:18`

```typescript
export const SESSION_COOKIE_NAME = "__Host-akal_sesi";
```

Kode menggunakan `__Host-akal_sesi` (dengan prefix `__Host-`), tapi dokumentasi di `auth-flow-akal-center` skill dan AGENTS.md masih menyebut `akal_sesi`. Prefix `__Host-` menambahkan constraint browser: cookie **harus** `Secure`, `Path=/`, dan **tidak boleh** punya `Domain` attribute. Semua endpoint sudah comply. Hanya dokumentasi yang ketinggalan.

**Dampak:** Tidak ada bug runtime. Tapi saat debugging cookie, engineer akan mencari nama yang salah.

### 7. Logout — Clear Refresh Cookie dengan Path yang Salah

**File:** `src/app/api/v1/auth/logout/route.ts:49`

Refresh cookie **di-set** dengan `path: "/api/v1/auth/refresh"` (line 145 di login, line 128 di register, line 168 di Google callback). Tapi saat logout, cookie **di-clear** dengan `path: "/"`:

```typescript
// ❌ Clear dengan path yang berbeda
response.cookies.set(REFRESH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
```

Browser akan menghapus cookie untuk path `/` saja. Cookie refresh asli di path `/api/v1/auth/refresh` **tidak terhapus** — masih bisa dipakai untuk refresh token setelah logout.

**Fix:** Ganti `path: "/"` → `path: "/api/v1/auth/refresh"` di line 49.

### 8. `RegisterSchema` — Hanya Izinkan `SISWA` & `ORANG_TUA`

**File:** `src/app/api/v1/auth/register/route.ts:26`

```typescript
role: z.enum(["SISWA", "ORANG_TUA"]).optional().default("SISWA"),
```

`auth-flow-akal-center` skill mendokumentasikan: "Current accepted public roles: SISWA, GURU, ASISTEN_GURU, ORANG_TUA". Tapi kode hanya menerima `SISWA` dan `ORANG_TUA`. Guru/asisten guru tidak bisa register via form publik.

**Dampak:** Guru harus dibuat manual oleh owner. Jika ini disengaja (PRD mengarah ke invite-only), update skill docs. Jika tidak, tambahkan `"GURU"` dan `"ASISTEN_GURU"` ke enum.

### 9. `set-password` Route — Tidak Ada

**Path:** `src/app/api/v1/auth/set-password/route.ts` → **NOT FOUND**

`auth-flow-akal-center` skill mendokumentasikan endpoint ini sebagai cara user Google membuat password. `login/route.ts` mengembalikan error `NO_PASSWORD_SET` (line 95) tapi tidak ada endpoint untuk membuat password baru.

**Dampak:** User yang login via Google tidak bisa mengatur kata sandi. Mereka harus terus login via Google.

### 10. `src/lib/dal.ts` — Tidak Ada

**Path:** `src/lib/dal.ts` → **NOT FOUND**

`auth-flow-akal-center` skill mendokumentasikan `dal.getSession()` sebagai transitional session reader untuk legacy routes. File tidak ada. Tidak ada grep hit untuk `dal.getSession` di seluruh codebase — artinya tidak ada caller yang tersisa. File ini aman dihapus dari dokumentasi.

### 11. CSP `report-uri` — Deprecated

**File:** `next.config.ts:26`

```
... report-uri /api/csp-report
```

`report-uri` sudah deprecated sejak CSP Level 3. Browser modern mungkin mengabaikan directive ini. `report-to` adalah penggantinya (memerlukan `Report-To` header terpisah). Tapi `/api/csp-report` endpoint juga tidak ditemukan.

**Dampak:** CSP violation tidak dilaporkan ke mana pun. Tidak ada visibility jika ada XSS atau injection attempt.

---

## 🗄️ Schema & Migration Desync

Audit 18 Juli menemukan ketidaksinkronan antara Drizzle schema, migration files, dan migration journal.

### 11.1 Migration Journal Tidak Lengkap

**File:** `src/lib/db/migrations/meta/_journal.json`

| Status | Detail |
|--------|--------|
| Journal entries | 17 entries (idx 0-16) |
| Migration files di folder | 36 file SQL (0000-0035) |
| **Gap entries** | 0014-0032, 0035 **tidak terdaftar** di journal |
| Entry terakhir journal | 0034 (`fix_unique_constraints`) |
| Migration terakhir di folder | 0035 (`add_idempotency_and_lease`) |

**Dampak:** `drizzle-kit generate` akan conflict karena journal tidak tahu migration 0014-0032 sudah di-apply. `drizzle-kit push` mungkin skip atau re-apply migration yang sudah ada.

### 11.2 Dua Folder Migration Berbeda

| Folder | Isi | Numbering |
|--------|-----|-----------|
| `src/lib/db/migrations/` | 36 file SQL (0000-0035) | Manual migration |
| `drizzle/` | 3 file SQL (0015, 0016, 0017) | `drizzle-kit generate` output |

File di `drizzle/` berbeda isinya dengan `src/lib/db/migrations/`:
- `drizzle/0015_rls_policies.sql` ≠ `src/lib/db/migrations/0015_schema_optimization.sql`
- `drizzle/0016_business_systems.sql` ≠ `src/lib/db/migrations/0016_ai_daily_costs_view.sql`

**Dampak:** Dua source of truth untuk migration. Tim tidak tahu mana yang sudah di-apply ke production Supabase.

### 11.3 Schema Tabel Baru — Belum Ada di Journal

`schema.ts` (1328 lines) mendefinisikan tabel-tabel ini yang ada di migration files tapi tidak di journal:

| Tabel | Migration File | Di Journal? |
|-------|---------------|-------------|
| `token_balances` | 0025 | ❌ |
| `token_transactions` | 0030 | ❌ |
| `materi_sharing` | 0026 | ❌ |
| `krabat_connections` | 0027 | ❌ |
| `invite_tokens` | 0028 | ❌ |
| `quotas` | 0030 | ❌ |
| `quota_usages` | 0030 | ❌ |
| `ai_requests` | 0030 | ❌ |
| `mata_pelajaran` | 0030 | ❌ |
| `jenjang` | 0030 | ❌ |
| `payments` | 0030 | ❌ |
| `onboarding_progress` | 0030 | ❌ |

---

## 📋 PRD Fase 0 — Progress Gap

PRD-UNIFIED-LAUNCH-v2.md (16 Juli 2026) mendefinisikan Fase 0 ANTI-BONCOS dengan 8 task. Per 18 Juli, **progress = 0/8 (0%)**.

| # | Task | Status | File |
|---|---|---|---|
| 0.1 | `INITIAL_TOKEN_BALANCE` 10000 → 2000 | ❌ | `token-constants.ts:22` masih `10000` |
| 0.2 | Aktifkan `DAILY_GENERATE_LIMIT` (5x/hari) | ❌ | Defined di `token-constants.ts:24`, tidak enforced |
| 0.3 | Tambah kolom `tier` + `resetAt` di `token_balances` | ❌ | `token_balances` belum punya kolom ini |
| 0.4 | Migrasi + push ke Supabase | ❌ | Terblokir oleh journal desync (§11) |
| 0.5 | Cron reset kuota bulanan | ❌ | Route `/api/v1/cron/reset-quota` belum ada |
| 0.6 | Halaman pilih paket (`/guru/langganan`) | ❌ | Belum ada |
| 0.7 | Middleware cek tier (blokir generate) | ❌ | Generate route tidak cek tier |
| 0.8 | Notifikasi "kuota habis → upgrade" | ❌ | Dashboard belum ada notifikasi |

**Catatan:** Task 0.3 (kolom `tier` + `resetAt`) memerlukan migration. Migration journal harus diperbaiki dulu (§11) sebelum `drizzle-kit push` bisa jalan.

---

## 🏗️ Arsitektur Route Handler

Audit cross-reference dengan `backend-dev-guidelines` skill (12 file: SKILL.md + 11 resources) menemukan 3 deviasi struktural:

### 12.1 Business Logic di Route Handler

**Guideline:** `routing-and-controllers.md` — "Routes Should NEVER contain business logic"  
**Reality:** 80+ route handler mencampur Drizzle query + business logic + response formatting dalam satu file.

**Contoh:** `src/app/api/v1/guru/drafts/[id]/generate/route.ts` — **329 baris** berisi:
- Drizzle query langsung (5 query point)
- Balance checking + deduction
- Rate limiting + concurrent guard
- AI generation orchestration
- Error handling + refund logic

**Guideline target:** Route (10 baris) → Controller (30 baris) → Service (100 baris) → Repository (50 baris)

### 12.2 Tidak Ada Service Layer

Tidak ada satupun file `*Service.ts` atau `*Repository.ts` di project. Semua business logic + database access ada di dalam route handler. File `src/lib/token-service.ts` adalah utility, bukan service layer.

### 12.3 Tidak Ada Sentry

Semua error handler menggunakan `console.error()`. Tidak ada `@sentry/nextjs` terinstall. 80+ route handler menulis error ke console — tidak ada aggregation, alerting, atau tracing.

---

## 🎯 Prioritas Action (Updated)

| # | Action | File | Estimasi | Blocker? |
|---|--------|------|----------|----------|
| 1 | **Rename `src/proxy.ts` → `src/middleware.ts`** | `src/proxy.ts` | 1 menit | 🔴 Production down |
| 2 | Fix logout refresh cookie path | `logout/route.ts:49` | 1 menit | 🟠 Security |
| 3 | Rebuild + deploy ulang | — | 5 menit | 🔴 |
| 4 | Test: POST generate, top-up, donasi, upload | — | 5 menit | 🔴 |
| 5 | Verifikasi CSRF cookie diset di response | — | 1 menit | 🔴 |
| 6 | `INITIAL_TOKEN_BALANCE` 10000 → 2000 | `token-constants.ts` | 5 menit | 🟡 PRD Fase 0 |
| 7 | Rebuild migration journal | `_journal.json` | 30 menit | 🟡 Blokir 0.4 |
| 8 | PRD Fase 0 tasks 0.2-0.8 | 7 file | 3 jam | 🟡 Launch readiness |

---

## 📝 Catatan untuk AGENTS.md

AGENTS.md saat ini salah menyebutkan:
```
C1 | MID-01 | Rename middleware.ts → proxy.ts | Next.js 16 deprecation warning.
```

**Fakta:** Next.js 16 TIDAK mendeprecate `middleware.ts`. Rename ini justru mematikan middleware. Harus dikoreksi di AGENTS.md.

### Koreksi Tambahan untuk AGENTS.md

1. **Session cookie name:** AGENTS.md & auth-flow skill menyebut `akal_sesi`. Kode menggunakan `__Host-akal_sesi`. Update docs.

2. **Google callback refresh token:** AGENTS.md (line 31) & auth-flow skill menyebut "callback does not create an akal_refresh token". **Kode sudah issue refresh token** (line 150-151, 221-222 di `google/callback/route.ts`). Docs outdated.

3. **Register refresh token:** Auth-flow skill menyebut "registration does not issue a refresh token". **Kode sudah issue** (line 104-105 di `register/route.ts`). Docs outdated.

4. **`set-password` endpoint:** Didokumentasikan di auth-flow skill tapi tidak ada di codebase. Either buat endpoint atau hapus dari docs.

5. **`dal.ts`:** Didokumentasikan di auth-flow skill tapi tidak ada di codebase. Tidak ada caller tersisa. Hapus dari docs.

6. **Migration journal:** AGENTS.md (line 29) menyebut "Migration journal desync: 0014-0023 not in _journal.json". Per 18 Juli, gap membesar ke 0014-0032 + 0035.

7. **`backend-dev-guidelines` skill:** Ada di `.agents/agent-skills-hub/skills/backend-dev-guidelines/` (12 file). Tidak pernah di-refer ke AGENTS.md. Project melanggar 3 dari 7 prinsip non-negotiable: tidak ada service layer, tidak ada Sentry, tidak ada `unifiedConfig`.

---

## 🔬 Metodologi Investigasi

1. Test login via `curl` → 200 OK (auth aman)
2. Test GET dashboard → 200 OK (data normal)
3. Test GET balance → 200 OK (saldo cukup)
4. Test POST generate → **403 CSRF** (pertama kali ketemu error)
5. Cek CSRF cookie → tidak ada di response header
6. Cek middleware manifest → **kosong** (middleware tidak jalan)
7. Cek git log → rename `middleware.ts → proxy.ts` di commit 59e097afa
8. Cek compiled middleware.js → 0 referensi ke proxy/csrf/psrf
9. Konfirmasi root cause: Next.js tidak mengenali `proxy.ts` sebagai middleware

---

*Dibuat: 18 Juli 2026 | Investigasi awal: ~30 menit | Audit lanjutan: ~2 jam | Root cause: 1 file rename | Temuan tambahan: 11 item*