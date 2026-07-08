# 🔐 TODO GELOMBANG S — Security & Quality Audit Remediation
**Status:** DRAFT — Disisipkan antara Gel.8A dan Gel.9
**Basis:** Riset standar 2026 (Next.js 16, TypeScript 5.8, Drizzle ORM, Supabase Auth) + audit forensik 49 route files, 27 page files, 20+ schema/db files
**Metrik Health:** 6.5/10 — Auth 6/10 · DB 4/10 · API 8/10 · Frontend 3/10 · Quality 6/10
**Estimasi Total:** ~3–5 hari kerja (50 item)
**Prioritas:** 🔴 P0 (data-loss/security) > 🟡 P1 (struktural) > 🟢 P2 (polish)

> **Instruksi AI Agent:** Kerjakan dalam urutan S0 → S1 → S2 → S3. Jangan lompat.
> Tiap item = 1 task atomik. Centang [x] setelah selesai.
> Jika error → STOP, laporkan, jangan lanjut.

---

## ════════════════════════════════════════════
## 🔴 S0 — CRITICAL: Security & Data Integrity (0.5–1 hari)
## ════════════════════════════════════════════

*Prioritas tertinggi. Kerjakan ini DULU sebelum apa pun.*

### S0.1 — Migrasi JWT HS256 → ES256 + Refresh Token Rotation

- [ ] **S-001** — Generate ES256 key pair: `openssl ecparam -genkey -name prime256v1 -noout -out private.pem && openssl ec -in private.pem -pubout -out public.pem`
- [ ] **S-002** — Ganti `src/lib/auth.ts:16-20`: `SignJWT(algorithm: 'HS256')` → `algorithm: 'ES256'` pakai private key
- [ ] **S-003** — Ganti `src/middleware.ts:42-50`: verify dari HS256 symmetric → ES256 public key
- [ ] **S-004** — Tambah `JWKS` endpoint: `src/app/api/v1/auth/jwks/route.ts` serve public key di format JWK (kty, crv, x, y)
- [ ] **S-005** — Buat tabel `refresh_tokens` di `schema.ts`: `id uuid PK`, `userId uuid FK`, `tokenHash text`, `expiresAt timestamp`, `revokedAt timestamp?`, `createdAt timestamp`
- [ ] **S-006** — Generate migration untuk tabel refresh_tokens: `npx drizzle-kit generate`
- [ ] **S-007** — Implementasi refresh token di login: `src/lib/auth.ts:32-37` — generate access token (15 menit) + refresh token (7 hari, disimpan hash di DB)
- [ ] **S-008** — Buat route `POST /api/v1/auth/refresh`: terima refresh_token, verify hash match + not revoked → rotasi token baru + revoke yang lama
- [ ] **S-009** — Buat route `POST /api/v1/auth/revoke`: revoke semua refresh token user saat logout
- [ ] **S-010** — Update middleware untuk prefer `Authorization: Bearer` header parsing (selain cookie)
- [ ] **S-011** — **Verifikasi:** JWT verify dengan public key → pass; forge dengan secret berbeda → reject (401)

### S0.2 — Fix Schema-Migration Drift: FK Cascade

- [ ] **S-012** — Audit `src/lib/db/schema.ts`: identifikasi semua `onDelete` / `onUpdate` yang terdefinisi di `relations()`
- [ ] **S-013** — Generate migration yang drop FK constraints lama + recreate dengan `ON DELETE CASCADE` / `SET NULL` yang benar
- [ ] **S-014** — **Verifikasi:** Hapus user → semua FK child (siswa_kursus, jawaban_log, dll) ikut terhapus (atau set null)
- [ ] **S-015** — **Verifikasi:** `student_ability` UNIQUE constraint di DB = `(siswa_id, kursus_id)`; drop old constraint, create composite unique
- [ ] **S-016** — Test: enroll siswa ke 2+ kursus → insert row kedua OK (bukan error duplicate key)

### S0.3 — Payment Webhook Transaction

- [ ] **S-017** — `src/app/api/v1/payment/webhook/route.ts:65-90`: wrap 3 operasi DB dalam `db.transaction(async (tx) => { ... })`:
  - `tx.update(transaksi).set({ status: 'SUKSES' })`
  - `tx.select().from(siswa_kursus).where(...)` — cek duplicate enrollment
  - `tx.insert(siswa_kursus).values(...)`
- [ ] **S-018** — **Verifikasi:** Simulasi crash di tengah transaksi → DB tetap konsisten (tidak ada bayar tanpa akses)

### S0.4 — Server-Only Guards

- [ ] **S-019** — `src/lib/db/index.ts:1`: tambah `import "server-only"`
- [ ] **S-020** — `src/lib/redis.ts:1`: tambah `import "server-only"`
- [ ] **S-021** — `src/lib/auth.ts:1`: tambah `import "server-only"`
- [ ] **S-022** — `src/lib/crypto.ts:1`: tambah `import "server-only"`
- [ ] **S-023** — `src/lib/midtrans.ts:1`: tambah `import "server-only"`
- [ ] **S-024** — `src/lib/auth-password.ts:1`: tambah `import "server-only"`
- [ ] **S-025** — **Verifikasi:** `npx next build` — pastikan tidak ada error akibat server-only modules di client code

### S0.5 — Fix Redis Config Mismatch

- [ ] **S-026** — Opsi A: ganti `src/lib/redis.ts:3` → baca `REDIS_URL` (sama dengan `.env.local`), atau
- [ ] **S-027** — Opsi B: ganti `.env.local` → `UPSTASH_REDIS_REST_URL=...` (ikuti kode)
- [ ] **S-028** — **Verifikasi:** `console.log(await redis.ping())` return `"PONG"` (bukan null)

---

## ════════════════════════════════════════════
## 🟡 S1 — HIGH: Auth, API, DB, Frontend Remediation (2–3 hari)
## ════════════════════════════════════════════

### S1.1 — Auth & API Pattern Fixes

- [ ] **S-029** — Structur apiError: `src/lib/api-response.ts`
  - Ganti `{ error: string }` → `{ error: { code: string, message: string, details?: unknown } }`
  - Tambah helper: `apiValidationError(zodError)`, `apiForbidden()`, `apiNotFound()`, `apiConflict()`
- [ ] **S-030** — Refactor 5 route yang bypass apiError:
  - `register/route.ts:47` → pakai `apiValidationError()` / `apiConflict()`
  - `kursus/route.ts:83` → pakai `apiError()`
  - `enroll/route.ts:33` → pakai `apiError()`
  - `payment/create/route.ts:34,100` → pakai `apiError()`
  - `sertifikat/generate/route.ts:40` → pakai `apiError()`
- [ ] **S-031** — Fix INTENT_MISMATCH parsing di frontend:
  - `src/app/masuk/FormMasuk.tsx:64-68`: ganti `error.includes('INTENT_MISMATCH')` → `error.code === 'INTENT_MISMATCH'`
  - Hapus semua `.includes('::')` parsing pattern
- [ ] **S-032** — Forward user identity dari middleware:
  - `src/middleware.ts:89-176`: setelah JWT verify, set header `x-user-id`, `x-user-role`
  - Update semua route handler: baca dari header (bukan re-parse cookie setiap kali)
- [ ] **S-033** — `__Host-` prefix ke session cookie:
  - `src/lib/session.ts`: `akal_sesi` → `__Host-akal_sesi` (butuh `path: '/'` + `secure: true`)
  - `src/middleware.ts`: update cookie name constant
- [ ] **S-034** — Konsolidasi duplikasi:
  - `middleware.ts:46-50` & `auth.ts` — `getJwtSecret()` → satu sumber di `auth.ts`
  - `login/route.ts:29-35`, `register/route.ts:30-36`, `callback/google/route.ts:25-31` — `roleToSessionRole()` → satu sumber di `session.ts`
- [ ] **S-035** — Fix cookie order bug Google callback:
  - `callback/google/route.ts:158,218`: panggil `clearTempCookies(resp)` SEBELUM `resp.cookies.set(SESSION, token)`, bukan sesudah
- [ ] **S-036** — Fix silent empty return:
  - `guru/drafts/route.ts:13-15`: ganti `return { data: [] }` → `return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Akses ditolak' } }, { status: 401 })`
- [ ] **S-037** — Rate limiting di approve/reject draft:
  - `guru/drafts/[id]/approve/route.ts`: tambah `checkRateLimitPerUser` > `checkRateLimit`
  - `guru/drafts/[id]/reject/route.ts`: sama
- [ ] **S-038** — Zod validation di siswa/materi:
  - `siswa/materi/[id]/route.ts:115-117`: ganti manual `.catch(() => ({}))` + clamping → Zod `safeParse`
- [ ] **S-039** — Fix silent JSON parse:
  - `quiz/[id]/submit/route.ts:58`: ganti `request.json().catch(() => ({}))` → biarkan promise reject (catch di handler)
- [ ] **S-040** — Auth guard di pengumuman:
  - `pengumuman/[id]/route.ts:24-28`: tambah minimal `requireAuth()` + scope check ke kursus user

### S1.2 — Database & Migration Fixes

- [ ] **S-041** — Refactor eager DB connection ke lazy proxy:
  - `src/lib/db/index.ts:5-19`: ganti `const pool = new Pool(config); const db = drizzle(pool, { schema })` →
    ```ts
    function createDb() {
      const pool = new Pool(config);
      pool.on('error', (err) => console.error('DB pool error:', err));
      return drizzle(pool, { schema });
    }
    let _db: ReturnType<typeof createDb> | null = null;
    const db = new Proxy({} as ReturnType<typeof createDb>, {
      get(_, prop) {
        if (!_db) _db = createDb();
        return (_db as any)[prop];
      }
    });
    ```
- [ ] **S-042** — Fix password rehash:
  - `login/route.ts:113`: ganti fire-and-forget `.catch(() => {})` → `await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId)).returning()`
- [ ] **S-043** — Export `$inferSelect` / `$inferInsert` untuk semua tabel:
  - `src/lib/db/schema.ts` (akhir file): `export type User = typeof users.$inferSelect; export type NewUser = typeof users.$inferInsert;` (ulangi untuk 20+ tabel)
  - Hapus semua `as unknown as` di query files
- [ ] **S-044** — Fix event store index:
  - Migration: drop index `(stream_id, version)` → create index `(stream_id, created_at)`
  - Update `analytics/route.ts:53-62` untuk pakai index baru
- [ ] **S-045** — Tambah missing FK indexes (12 columns):
  - Generate migration: `CREATE INDEX idx_transaksi_siswa ON transaksi(siswa_id);` — ulangi untuk: `transaksi.kursus_id`, `file_materi.skill_id`, `quiz_session.kursus_id`, `jawaban_log.quiz_session_id`, `pengumuman.kursus_id`, `soal_published.ai_generation_id`, dll
- [ ] **S-046** — Fix broken hash chain:
  - `src/lib/event-store.ts:30`: ganti `previousHash: hash(currentPayload)` → `previousHash: hash(previousEvent)`, di mana `previousEvent = sha256(prevHash + prevPayload + prevVersion)`

### S1.3 — Frontend RSC & Error Handling

- [ ] **S-047** — Refactor halaman siswa ke Server Component (kecuali CBT):
  - `/siswa` (page.tsx): hapus "use client", jadi async, ganti `useEffect + fetch` → `await db.query()`
  - `/siswa/materi` (page.tsx): sama
  - `/siswa/materi/[id]` (page.tsx): sama
  - `/siswa/quiz` (page.tsx): sama
  - `/siswa/progres` (page.tsx): sama
  - `/siswa/pengumuman` (page.tsx): sama
  - Pisahkan interaktivitas ke client component leaf (e.g., `ProgresClient.tsx`, `QuizListClient.tsx`)
  - Tambah `export const metadata = { ... }` di setiap halaman
- [ ] **S-048** — Refactor halaman guru ke Server Component (kecuali upload/draft editor):
  - `/guru` (page.tsx): hapus "use client", jadi async
  - `/guru/kursus` (page.tsx): sama
  - `/guru/siswa` (page.tsx): sama
  - `/guru/analytics` (page.tsx): sama
  - `/guru/kelas` (page.tsx): sama
  - `/owner` (page.tsx): sama
  - `/admin-sekolah` (page.tsx): sama
  - `/orang-tua` (page.tsx): sama
  - Pisahkan interaktivitas
  - Tambah `export const metadata`
- [ ] **S-049** — Tambah route-level `loading.tsx` + `error.tsx`:
  - Buat file di: `/siswa/materi/`, `/siswa/quiz/`, `/siswa/cbt/`, `/guru/kursus/`, `/guru/siswa/`, `/guru/analytics/`, `/guru/drafts/`, `/guru/drafts/[id]/`, `/guru/upload/`
- [ ] **S-050** — Tambah `Suspense` boundaries:
  - Di semua halaman dengan data section independen (feed + sidebar di `/siswa`, statcards + chart di `/guru/analytics`)
- [ ] **S-051** — Fix 22 empty catch blocks:
  - `QuizLogin.tsx:46` — tambah `console.error` + user feedback toast
  - `auth-password.ts:28` — tambah `console.error` + throw meaningful
  - `cms.ts` (10x) — setiap catch tambah `console.error`
  - `ai-sanitizer.ts:104,113,122` — tambah `console.error` + rethrow
  - `profil/page.tsx:40` — tambah `console.error`
  - `quran/page.tsx:59` — tambah `console.error`
  - `verify/[nomor]/page.tsx:34` — tambah `console.error`
  - `guru/onboarding/page.tsx:45,62,73` — tambah `console.error`
  - `guru/drafts/page.tsx:44` — tambah `console.error`
  - `guru/drafts/[id]/page.tsx:75` — tambah `console.error`
  - `guru/upload/page.tsx:51` — tambah `console.error`
- [ ] **S-052** — Fix Google OAuth orphan user:
  - `callback/google/route.ts:109-135`: pindah insert user ke DB (line 109) SETELAH intent mismatch check (line 122)
  - Jika intent mismatch → jangan insert user. Return error bersih.

---

## ════════════════════════════════════════════
## 🟡 S2 — MEDIUM: Structural & Quality (1 hari)
## ════════════════════════════════════════════

- [ ] **S-053** — Ganti hardcoded `https://akalcenter.my.id`:
  - Buat `src/lib/constants.ts`: `export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://akalcenter.my.id';`
  - Ganti di: `layout.tsx` (4x), `sitemap.ts`, `materi/[slug]/page.tsx`, `google-oauth.ts`, `ai.ts`, `midtrans.ts`, 18 layout files
- [ ] **S-054** — Tambah `noUncheckedIndexedAccess` di `tsconfig.json`:
  - `"noUncheckedIndexedAccess": true`
  - Budget 30 menit untuk fix potensi error baru
- [ ] **S-055** — Split `FormMasuk.tsx` (524 lines):
  - `FormPilihPortal.tsx` (portal selector step)
  - `FormMasukSiswa.tsx` (email + password, GURU denied message)
  - `FormMasukGuru.tsx` (email + password, SISWA denied message)
- [ ] **S-056** — Split `QuizEngine.tsx` (636 lines):
  - `QuizTimer.tsx` (countdown + auto-submit)
  - `QuizQuestion.tsx` (single question render + option select)
  - `QuizResult.tsx` (score + review panel)
- [ ] **S-057** — Refactor `src/data/soal.ts` (2259 lines):
  - Buat tabel `soal_migrasi` di Supabase
  - Script migrasi: parse data → insert ke tabel
- [ ] **S-058** — Tambah `generateMetadata` untuk dynamic pages:
  - `/siswa/materi/[id]/page.tsx`
  - `/siswa/cbt/[id]/page.tsx`
  - `/guru/drafts/[id]/page.tsx`
  - `/guru/kursus/[id]/page.tsx`
- [ ] **S-059** — Konsistenkan rate limit sync/async:
  - `pengumuman/route.ts`, `pengumuman/[id]/route.ts`: ganti `checkRateLimitSync` → `checkRateLimit`
- [ ] **S-060** — Standardisasi cookie access:
  - Pilih satu pola (rekomendasi: `await cookies()` async untuk konsistensi dengan Next.js 16)
  - Refactor semua route handler yang masih pakai `request.cookies.get()`
- [ ] **S-061** — Tambah `aud` + `jti` claims di JWT:
  - `src/lib/auth.ts:16-20,32-37`: `aud: 'akal-center-api'`, `jti: crypto.randomUUID()`
  - Middleware verify: cek `aud` match
- [ ] **S-062** — Fix `SesiPayload.userId` jadi required:
  - `src/lib/session.ts:6`: `userId?: string` → `userId: string`
  - Hapus semua `session.userId!` non-null assertion
- [ ] **S-063** — Fix empty catch di root layout:
  - `layout.tsx:198`: CMS data error → `console.error('CMS load failed:', err)` + render fallback section
- [ ] **S-064** — Fix form element access:
  - `RefleksiForm.tsx`, `BalasForm.tsx`, `DiskusiForm.tsx` (10 instance): ganti `as unknown as HTMLXElement` → `useRef` + `HTMLFormControlsCollection`
- [ ] **S-065** — Fix AES-GCM key validation:
  - `src/lib/crypto.ts:8`: tambah `if (!/^[0-9a-f]{64}$/i.test(hexKey)) throw new Error('Invalid encryption key format')`
- [ ] **S-066** — Tambah Pool error listener:
  - `src/lib/db/index.ts`: `pool.on('error', (err) => console.error('Unexpected pool error:', err))`

---

## ════════════════════════════════════════════
## 🟢 S3 — LOW: Polish & Hygiene (opsional)
## ════════════════════════════════════════════

- [ ] **S-067** — `layout.tsx:282`: pindahkan `NEXT_PUBLIC_GA_ID` ke env var (bukan hardcoded `G-FKHV466K10`)
- [ ] **S-068** — `api-response.ts`: tambah `apiNotFound()`, `apiForbidden()`, `apiConflict()`, `apiValidationError()` helpers
- [ ] **S-069** — `lib/constants.ts`: buat constant `SITE_URL`, `SESSION_COOKIE_NAME`, `CSRF_COOKIE_NAME` single source of truth
- [ ] **S-070** — Hapus dead code: `verifyStreamIntegrity` (tidak pernah dipanggil), `migratePasswordHash` (tidak pernah dipanggil)
- [ ] **S-071** — `middleware.ts`: ganti `SESSION_COOKIE_NAME` inline → import dari `session.ts`
- [ ] **S-072** — Update `.env.example` dengan 10+ env var yang belum terdokumentasi:
  - `NEXT_PUBLIC_APP_URL`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NARAROUTER_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`
- [ ] **S-073** — Evaluasi dependency:
  - `dotenv` — mungkin tidak perlu (Next.js built-in env)
  - `@markdoc/markdoc` — dead weight dari Keystatic
  - Usulkan hapus jika confirmed unused
- [ ] **S-074** — Migrasi `src/data/soal.ts` ke Supabase (lanjutan S-057)
- [ ] **S-075** — Tambah production logging:
  - Ganti `console.log` di payment webhook → struktur log (pino mini atau `logger.info({ ... })` format)
  - Tambah `requestId` correlation di setiap request

---

## ════════════════════════════════════════════
## 📊 PROGRESS TRACKER
## ════════════════════════════════════════════

| Gelombang | Fokus | Items | Selesai | Status |
|-----------|-------|-------|---------|--------|
| S0 | 🔴 Security Critical | 28 | 0 | ⬜ |
| S1 | 🟡 High Priority | 24 | 0 | ⬜ |
| S2 | 🟡 Medium Priority | 14 | 0 | ⬜ |
| S3 | 🟢 Low Priority | 9 | 0 | ⬜ |
| **TOTAL** | | **75** | **0** | **0%** |

---

## 🔗 DEPENDENCY GRAPH

```
S0 🔴 — Security & Data Integrity (HARUS duluan)
 │
 ├──► S1.1 — Auth & API Pattern (butuh apiError fix + middleware forward)
 │
 ├──► S1.2 — DB & Migration (butuh FK cascade + lazy proxy)
 │
 ├──► S1.3 — Frontend RSC Refactor (independent, tapi prioritas setelah S0)
 │
 └──► S2 — Medium Priority (independent, bisa paralel)
       │
       └──► S3 — Polish (tidak blocking apa pun)
```

## 🎯 REKOMENDASI JALUR EKSEKUSI

| Hari | Scope | Item |
|------|-------|------|
| **Hari 1** | S0 all + S1.1 quick | S-001 s.d. S-031 (Redis, JWT ES256, apiError, server-only, FK cascade) |
| **Hari 2** | S1.1 remaining + S1.2 | S-032 s.d. S-046 (middleware forward, cookie fix, lazy proxy, inferSelect, indexes) |
| **Hari 3–4** | S1.3 Frontend RSC | S-047 s.d. S-052 (17 page refactor, loading.tsx, Suspense, empty catch, orphan user) |
| **Hari 5** | S2 + S3 | S-053 s.d. S-075 (hardcoded URL, split components, generateMetadata, polish) |

---

*Gelombang S — Security & Quality Audit Remediation*
*Dibuat dari: Audit Forensik Gel.1-8A (Juli 2026) — 49 route files, 27 page files, 20+ schema/db files*
*Basis: Next.js 16, Drizzle ORM, Supabase Auth, ES256, Server Components*
