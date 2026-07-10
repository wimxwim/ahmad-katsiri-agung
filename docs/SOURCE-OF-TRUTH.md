# 📖 AKAL CENTER — SOURCE OF TRUTH
**Versi:** 1.0 | **Tanggal:** 10 Juli 2026
**Basis:** Audit codebase nyata (Sesi 1) + auth-flow-akal-center skill
**Status:** Dokumen referensi — semua perbaikan HARUS mengacu ke dokumen ini.

> **Ini adalah KONTRAK.** Semua perubahan kode nanti harus diverifikasi terhadap dokumen ini.
> Setiap penyimpangan dari dokumen ini adalah bug, bukan variasi.

---

## 1. ALUR AUTH LENGKAP

```
┌─────────────────────────────────────────────────────────────────┐
│                     ALUR AUTH — AKAL CENTER                      │
└─────────────────────────────────────────────────────────────────┘

Landing (/) — publik, tidak ada guard
  │
  ▼
Klik "Masuk" → /masuk?portal=guru ATAU /masuk?portal=siswa
  │
  ▼
Halaman /masuk (src/app/masuk/page.tsx)
  │── Cek cookie "akal_sesi" → jika valid → redirect ke dashboard
  │── Render FormMasuk.tsx (client component)
  │
  ▼
Form login (email + password + portalIntent)
  │
  ▼
POST /api/v1/auth/login (src/app/api/v1/auth/login/route.ts)
  │── Rate limit: 5 attempt / 15 detik per IP
  │── Zod validasi: LoginSchema
  │── Cek user di DB (users table, email + deletedAt IS NULL)
  │── Intent mismatch check: INTENT_PORTAL[portal] vs roleToSessionRole(user.role)
  │── Password verify: verifyPassword() → Argon2id via @node-rs/argon2
  │── signSession() → JWT (ES256 jika ada key pair, HS256 fallback)
  │── createRefreshToken() → SHA256-hashed, DB-backed, family-based rotation
  │── Set cookie "akal_sesi" (httpOnly, secure, sameSite=lax, path=/, maxAge=8h)
  │── Set cookie "akal_refresh" (httpOnly, secure, sameSite=lax, path=/api/v1/auth/refresh, maxAge=30d)
  │── Audit log: auth.login.success / auth.login.failed
  │── Response: { success: true, user: {...}, redirect: "/guru/beranda" | "/siswa/beranda" }
  │
  ▼
Client: window.location.href = redirect
  │
  ▼
Middleware (middleware.ts — root level)
  │── Generate CSP nonce per request
  │── Cek cookie "akal_sesi" → jwtVerify (ES256 public key atau HS256 secret)
  │── Set header: x-user-id, x-user-role, x-user-nama, x-user-email
  │── Proteksi prefix:
  │     /guru/* → allowed: [guru, owner, admin_sekolah]
  │     /siswa/* → allowed: [murid, orang_tua]
  │     /owner/* → allowed: [owner]
  │     /admin-sekolah/* → allowed: [owner, admin_sekolah]
  │     /orang-tua/* → allowed: [orang_tua]
  │── Jika tidak login → redirect /masuk?redirect=<path>
  │── Jika role tidak diizinkan → 403 Forbidden (BUKAN redirect)
  │── CSRF: cookie __Host-psrf + header x-csrf-token untuk POST/PUT/DELETE
  │
  ▼
Dashboard Layout (guru/layout.tsx, siswa/layout.tsx)
  │── requireDashboardSession(allowedRoles, portal, defaultRedirect)
  │── Cek cookie "akal_sesi" → verifySession()
  │── Jika tidak login → redirect /masuk?portal=...&redirect=...
  │── Jika role tidak diizinkan → redirect ROLE_HOME_PATHS
  │── Render GuruLayoutClient / SiswaLayoutClient
  │
  ▼
Dashboard Page (guru/beranda/page.tsx, siswa/beranda/page.tsx)
  │── Baca session dari x-user-* headers atau cookies()
  │── Render dashboard content
  │
  ▼
Refresh Halaman
  │── Middleware validasi ulang JWT → set x-user-* headers
  │── Layout guard validasi ulang → OK
  │── Session tetap hidup (8 jam)
  │
  ▼
Session Expired (setelah 8 jam)
  │── Middleware: JWT expired → redirect /masuk
  │── ATAU client: POST /api/v1/auth/refresh
  │     └── rotateRefreshToken() → rotasi token family → cookie baru
  │
  ▼
Logout
  │── POST /api/v1/auth/logout
  │── revokeUserRefreshTokens(userId)
  │── Hapus cookie: akal_sesi, akal_refresh, akal_google_state, akal_google_portal, akal_google_return
  │── Response: { success: true, redirect: "/" }
  │── Client: redirect ke /
```

---

## 2. KONTRAK DATA

### 2.1 Cookie

| Cookie | Nama | httpOnly | secure | sameSite | path | maxAge |
|--------|------|----------|--------|----------|------|--------|
| Session | `akal_sesi` | true | true (prod) | **lax** | `/` | 8 jam (28800) |
| Refresh | `akal_refresh` | true | true (prod) | **lax** | `/api/v1/auth/refresh` | 30 hari |
| CSRF | `__Host-psrf` | false | true (prod) | strict | `/` | 24 jam |

### 2.2 Header (di-set oleh middleware)

| Header | Nilai | Tipe |
|--------|-------|------|
| `x-user-id` | UUID user | string |
| `x-user-role` | SesiRole | "murid" \| "guru" \| "owner" \| "admin_sekolah" \| "orang_tua" |
| `x-user-nama` | Nama lengkap | string |
| `x-user-email` | Email user | string |
| `x-nonce` | CSP nonce | string (hex, 64 char) |

### 2.3 Response API — Format

```typescript
// Sukses
{ success: true, data?: T }
// ATAU
{ success: true, user: {...}, redirect: "..." }

// Error
{ error: { code: string, message: string, details?: unknown } }
```

### 2.4 HTTP Status Codes

| Kode | Makna | Kapan |
|------|-------|-------|
| 200 | OK | GET, PUT, PATCH sukses |
| 201 | Created | POST sukses (opsional) |
| 307 | Temporary Redirect | Legacy redirects |
| 308 | Permanent Redirect | Legacy path aliases |
| 400 | Bad Request | Validasi Zod gagal |
| 401 | Unauthorized | Belum login / password salah |
| 403 | Forbidden | Role mismatch / intent mismatch / CSRF |
| 404 | Not Found | Resource tidak ada |
| 409 | Conflict | Duplicate (email sudah terdaftar) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled exception |

### 2.5 Error Codes

| Code | HTTP Status | Deskripsi |
|------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Input tidak valid |
| `UNAUTHORIZED` | 401 | Harap login terlebih dahulu |
| `AUTH_REQUIRED` | 401 | Sesi habis, silakan masuk ulang |
| `NO_PASSWORD_SET` | 401 | Akun belum punya password |
| `FORBIDDEN` | 403 | Akses ditolak |
| `INTENT_MISMATCH` | 403 | Role user tidak cocok dengan portal yang dipilih |
| `NOT_FOUND` | 404 | Data tidak ditemukan |
| `CONFLICT` | 409 | Data sudah ada |
| `RATE_LIMITED` | 429 | Terlalu banyak permintaan |

---

## 3. ROLE & PORTAL

### 3.1 Konversi Role DB → SesiRole

| Role DB (kolom `users.role`) | SesiRole | Portal | Dashboard |
|------------------------------|----------|--------|-----------|
| `MURID` | `murid` | siswa | `/siswa/beranda` |
| `GURU` | `guru` | guru | `/guru/beranda` |
| `ASISTEN_GURU` | `guru` | guru | `/guru/beranda` |
| `OWNER` | `owner` | guru | `/owner` |
| `ADMIN_SEKOLAH` | `admin_sekolah` | guru | `/admin-sekolah` |
| `ORANG_TUA` | `orang_tua` | siswa | `/orang-tua` |

### 3.2 Portal Intent Mapping

```typescript
INTENT_PORTAL = {
  guru:  ["guru", "owner", "admin_sekolah"],
  siswa: ["murid", "orang_tua"],
};
```

### 3.3 ROLE_HOME_PATHS

```typescript
ROLE_HOME_PATHS = {
  owner:          "/owner",
  admin_sekolah:  "/admin-sekolah",
  guru:           "/guru",
  murid:          "/siswa",
  orang_tua:      "/orang-tua",
};
```

---

## 4. ATURAN ROUTING

### 4.1 Rute Publik (tidak ada guard)

| Route | Keterangan |
|-------|------------|
| `/` | Landing page |
| `/masuk` | Login page (portal=guru / portal=siswa) |
| `/daftar` | Register page |
| `/kursus` | Katalog kursus publik |
| `/fitur` | Fitur platform |
| `/harga` | Harga/pricing |
| `/tentang` | Tentang AKAL Center |
| `/quran` | Tools Quran |
| `/pembayaran` | Halaman pembayaran QRIS |
| `/kebijakan-privasi` | Privacy policy |
| `/syarat-layanan` | Terms of service |

### 4.2 Rute Terproteksi (middleware + layout guard)

| Route Prefix | Allowed Roles | Middleware Action |
|-------------|---------------|-------------------|
| `/guru/*` | guru, owner, admin_sekolah | 403 jika role tidak diizinkan |
| `/siswa/*` | murid, orang_tua | 403 jika role tidak diizinkan |
| `/owner/*` | owner | 403 jika role tidak diizinkan |
| `/admin-sekolah/*` | owner, admin_sekolah | 403 jika role tidak diizinkan |
| `/orang-tua/*` | orang_tua | 403 jika role tidak diizinkan |

### 4.3 Legacy Redirects (backward compatibility)

| Path Lama | Redirect ke | Status |
|-----------|-------------|--------|
| `/login` | `/masuk` | 307 |
| `/masuk-guru` | `/masuk?portal=guru` | 307 |
| `/register` | `/daftar` | 307 |
| `/register-guru` | `/daftar?portal=guru` | 307 |
| `/dashboard-guru/*` | `/guru/*` (jika role guru) | 308 |
| `/dashboard-siswa/*` | `/siswa/*` (jika role siswa) | 308 |
| `/pendidik/*` | `/guru/*` | 308 |
| `/peserta-didik/*` | `/siswa/*` | 308 |

### 4.4 Dashboard Index Redirects

| Route | Redirect ke |
|-------|------------|
| `/guru` | `/guru/beranda` |
| `/siswa` | `/siswa/beranda` |

---

## 5. KONVENSI FRONTEND

### 5.1 Design System (dari AGENTS.md + build.md)

| Token | Nilai |
|-------|-------|
| Primary | `#005231` |
| Tertiary | `#5a4200` |
| Surface | `#f2fcf7` |
| Glass | `bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px]` |
| Border | `rgba(27,107,69,0.15)` |
| Shimmer | `linear-gradient(90deg, #eec055, #ffdf9b, #eec055, #ffdf9b)` |
| Radius sm | `0.25rem` |
| Radius md | `0.75rem` |
| Radius lg | `1rem` |
| Radius xl | `1.5rem` |
| Radius custom | `32px-80px` |
| Shadows | `shadow-glass`, `shadow-glass-lg`, `shadow-glass-xl` |

### 5.2 Font

| Peran | Font | Variabel |
|-------|------|----------|
| Heading | Bricolage Grotesque | `--font-bricolage-grotesque` |
| Body | Inter | `--font-inter` |
| Quran | Amiri | `--font-amiri` |
| Code | JetBrains Mono | `--font-jetbrains-mono` |

### 5.3 Animasi

| Properti | Nilai |
|----------|-------|
| Ease curve | `[0.16, 1, 0.3, 1] as const` |
| Duration | `0.5-0.7s` |
| Stagger delay | `0.08-0.15` |
| Hero | `initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}` |
| Grid | `variants + staggerChildren:0.08` |
| Sidebar | `left x:-30 | right x:30` |
| Scroll reveal | `whileInView + viewport={{ once:true }}` |
| Mobile backdrop | `@media(max-width:640px) backdrop-blur 8px→2px` |

### 5.4 Layout Rules

| Aturan | Detail |
|--------|--------|
| Mobile-first | `px-3 sm:px-5 lg:px-8` |
| className utility | `cn()` dari `src/lib/utils.ts` |
| Type strict | TIDAK BOLEH pakai `any` |
| Library | Hanya dari `package.json` yang sudah ada |
| Komentar | Hanya untuk bug fix annotation |

---

## 6. KONVENSI BACKEND

### 6.1 Struktur File

| File | Fungsi |
|------|--------|
| `middleware.ts` (root) | Edge middleware — JWT verify, CSP, CSRF, role prefix protection |
| `src/lib/session.ts` | `SesiPayload`, `SesiRole`, cookie names, `ROLE_HOME_PATHS`, `INTENT_PORTAL`, `getRequestSession()` |
| `src/lib/auth.ts` | `signSession()`, `verifySession()`, `signQuizToken()`, `verifyQuizToken()`, `AuthResult<T>` |
| `src/lib/auth-keys.ts` | Key loading: `getSigningKey()`, `getVerifyingKey()`, `hs256Secret()`, `hasES256Keys()` |
| `src/lib/auth-password.ts` | `hashPassword()`, `verifyPassword()` (Argon2id via @node-rs/argon2) |
| `src/lib/refresh-token.ts` | `createRefreshToken()`, `rotateRefreshToken()`, `revokeUserRefreshTokens()` |
| `src/lib/route-guard-v2.ts` | `requireSession()`, `requireRole()`, `requireGuru()`, `requireSiswa()`, `requirePortal()` |
| `src/lib/require-dashboard-session.ts` | `requireDashboardSession()` — guard terpusat untuk layout |
| `src/lib/api-response.ts` | `apiSuccess()`, `apiError()`, `apiValidationError()`, `apiUnauthorized()`, `apiForbidden()`, `apiNotFound()`, `apiConflict()`, `apiRateLimit()` |
| `src/lib/rate-limit.ts` | `checkRateLimit()`, `ipFromRequest()` |
| `src/lib/auth-audit.ts` | `logAuthEvent()` — audit trail login/register/logout |

### 6.2 API Route Pattern

```typescript
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit"
import { apiError, apiRateLimit } from "@/lib/api-response"

const Schema = z.object({ ... })

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request)
    const rl = await checkRateLimit(`action:${ip}`, N, TTL)
    if (!rl.allowed) return apiRateLimit(rl.retryAfter)

    const body = await request.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400)
    }

    // Business logic...

    return NextResponse.json({ success: true, data: result })
  } catch (e) {
    console.error("Error:", e)
    return apiError("Terjadi kesalahan server", 500)
  }
}
```

### 6.3 Middleware Pattern

```typescript
// middleware.ts (root level)
// 1. CSP nonce → set header + response header
// 2. Legacy redirects (backward compatibility)
// 3. Role-protected prefix check:
//    - Get cookie "akal_sesi" → jwtVerify
//    - Set x-user-* headers
//    - If no session → redirect /masuk?redirect=<path>
//    - If role not allowed → 403 Forbidden
// 4. CSRF: GET/HEAD/OPTIONS → set cookie __Host-psrf
//           POST/PUT/DELETE → verify x-csrf-token header
```

---

## 7. JWT & SESSION

### 7.1 JWT Signing

| Properti | Nilai |
|----------|-------|
| Algoritma | ES256 (jika `JWT_PRIVATE_KEY` + `JWT_PUBLIC_KEY` ada), HS256 (fallback) |
| Expiry | 8 jam (`SESSION_DURATION_SECONDS = 28800`) |
| Audience | `akal-center-api` |
| JTI | `randomUUID()` |
| Payload | `{ userId, role, nama, email?, kelas?, noAbsen?, nis?, sekolah? }` |

### 7.2 JWT Verification

| Level | Metode | Key |
|-------|--------|-----|
| Middleware (edge) | `jwtVerify()` dari `jose` | ES256 public key (`importSPKI`) atau HS256 secret |
| Server component | `verifySession()` → `AuthResult<SesiPayload>` | Cached via `cache()` |
| Route handler | `requireSession()` → throw `GuardError` | Via `verifySession()` |

### 7.3 Refresh Token

| Properti | Nilai |
|----------|-------|
| Format | `family:token` (UUID:base64url random 48 bytes) |
| Hash | SHA256 |
| Expiry | 30 hari |
| Rotation | Rotate on use (revoke old, issue new in same family) |
| Reuse detection | Revoke entire family if token reuse detected |

### 7.4 Session vs Refresh Cookie Path

| Cookie | Path | Alasan |
|--------|------|--------|
| `akal_sesi` | `/` | Perlu dikirim di setiap request |
| `akal_refresh` | `/api/v1/auth/refresh` | Hanya dikirim ke refresh endpoint |

---

## 8. RATE LIMIT

| Endpoint | Key | Max | Window |
|----------|-----|-----|--------|
| Login | `login:{ip}` | 5 | 15 detik |
| Register | `register:{ip}` | 3 | 60 detik |
| Refresh | `refresh:{ip}` | 10 | 60 detik |
| Logout | `logout:{ip}` | 30 | 60 detik |

---

## 9. CSP (Content Security Policy)

Di-generate oleh middleware per request dengan nonce.

```
default-src 'self'
script-src 'self' 'nonce-{nonce}' https://www.youtube.com ...
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: blob: https:
font-src 'self' https://fonts.gstatic.com data:
frame-src 'self' https://www.youtube.com ...
media-src 'self' https://cdn.equran.id ...
connect-src 'self' https://equran.id ...
object-src 'none'
base-uri 'self'
form-action 'self'
```

---

## 10. FILE REFERENCE MAP (LENGKAP)

| File | Purpose |
|------|---------|
| `middleware.ts` | Edge middleware — JWT verify, CSP, CSRF, role prefix protection |
| `src/lib/session.ts` | `SesiPayload`, `SesiRole`, `SESSION_COOKIE_NAME`, `ROLE_HOME_PATHS`, `INTENT_PORTAL` |
| `src/lib/auth.ts` | `signSession()`, `verifySession()`, `AuthResult<T>` |
| `src/lib/auth-keys.ts` | Key loading untuk ES256/HS256 |
| `src/lib/auth-password.ts` | Argon2id password hashing |
| `src/lib/refresh-token.ts` | Refresh token CRUD + rotation |
| `src/lib/route-guard-v2.ts` | `requireSession()`, `requireRole()`, `requirePortal()` |
| `src/lib/require-dashboard-session.ts` | Guard terpusat untuk layout dashboard |
| `src/lib/api-response.ts` | `apiSuccess()`, `apiError()`, helpers |
| `src/lib/rate-limit.ts` | Rate limiting |
| `src/lib/auth-audit.ts` | Auth event logging |
| `src/app/api/v1/auth/login/route.ts` | Login API |
| `src/app/api/v1/auth/register/route.ts` | Register API |
| `src/app/api/v1/auth/logout/route.ts` | Logout API |
| `src/app/api/v1/auth/refresh/route.ts` | Session refresh API |
| `src/app/masuk/page.tsx` | Login page (server) |
| `src/app/masuk/FormMasuk.tsx` | Login form (client) |
| `src/app/guru/layout.tsx` | Guru dashboard layout — guard |
| `src/app/siswa/layout.tsx` | Siswa dashboard layout — guard |
| `src/app/guru/page.tsx` | Guru index → redirect /guru/beranda |
| `src/app/siswa/page.tsx` | Siswa index → redirect /siswa/beranda |
| `src/app/layout.tsx` | Root layout — font, providers, analytics |
| `src/lib/utils.ts` | `cn()` utility |

---

*SOURCE-OF-TRUTH.md — AKAL Center*
*Dokumen ini adalah KONTRAK. Semua perubahan kode diverifikasi terhadap dokumen ini.*
*Setiap penyimpangan dari dokumen ini adalah bug, bukan variasi.*