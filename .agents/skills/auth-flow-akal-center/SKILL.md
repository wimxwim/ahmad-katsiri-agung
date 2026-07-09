---
name: auth-flow-akal-center
description: "Complete authentication flow reference for AKAL Center platform. Covers JWT session management, role-based access control, portal intent separation, middleware guards, server-side route guards, login/refresh/logout flows, and AuthResult<T> pattern. Load this skill whenever modifying auth-related code, adding new protected routes, or debugging login/session issues."
---

# Auth Flow — AKAL Center

Referensi lengkap arsitektur autentikasi platform AKAL Center (Next.js 16 App Router).

---

## 1. Arsitektur Umum

```
Browser                    Edge Middleware              Server Component            API Route
   │                            │                            │                       │
   │── request dengan cookie ──→│                            │                       │
   │                            │── verify JWT ────────────→│                       │
   │                            │←── set x-user-* headers   │                       │
   │                            │── forward ke page ──────→│                       │
   │                            │                            │── verify session ──→│
   │                            │                            │←── session data      │
   │←── render page ───────────│                            │                       │
```

### Lapisan Verifikasi (berurutan)
1. **Edge Middleware** (`middleware.ts`) — verifikasi JWT, set `x-user-*` headers, proteksi rute prefix
2. **Server Component Layout** (e.g., `guru/layout.tsx`) — `verifySession()` + guard role
3. **Route Handler Guard** (`route-guard.ts`) — `requireSession()` / `requireRole()` / `requirePortal()`
4. **Server Action Guard** (`guard.ts`) — `requireAuth()` / `requireRole()` via server-only cookies

---

## 2. Role & Portal

### Role Database (kolom `users.role`)
| Value DB | SesiRole | Portal | Dashboard |
|----------|----------|--------|-----------|
| `MURID` | `murid` | siswa | `/siswa` |
| `GURU` | `guru` | guru | `/guru` |
| `ASISTEN_GURU` | `guru` | guru | `/guru` |
| `OWNER` | `owner` | guru | `/owner` |
| `ADMIN_SEKOLAH` | `admin_sekolah` | guru | `/admin-sekolah` |
| `ORANG_TUA` | `orang_tua` | siswa | `/orang-tua` |

### Konversi role DB → SesiRole
`src/lib/session.ts` — fungsi `roleToSessionRole()`

### Portal Intent Mapping
```typescript
INTENT_PORTAL = {
  guru:  ["guru", "owner", "admin_sekolah"],
  siswa: ["murid", "orang_tua"],
};
```

---

## 3. Session Token (JWT)

### Signing (login)
- **File:** `src/lib/auth.ts` — `signSession()`
- **Algoritma:** ES256 (jika `JWT_PRIVATE_KEY` + `JWT_PUBLIC_KEY` ada) atau HS256 (fallback)
- **Expiry:** 8 jam (`SESSION_DURATION_SECONDS`)
- **Payload:** `SesiPayload` — `{ userId, role, nama, email }`
- **Audience:** `akal-center-api`

### Verification
- **File:** `src/lib/auth.ts` — `verifySession()` → returns `AuthResult<SesiPayload>`
- **Algoritma:** Coba ES256 dulu, fallback HS256
- **Key resolution:** `src/lib/auth-keys.ts`

### AuthResult Pattern
```typescript
type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; code: "expired" | "invalid" | "internal" };
```

### Cookie
| Cookie | Name | Path | MaxAge | HttpOnly |
|--------|------|------|--------|----------|
| Session | `akal_sesi` | `/` | 8 jam | ✅ |
| Refresh | `akal_refresh` | `/api/v1/auth/refresh` | 30 hari | ✅ |

---

## 4. Login Flow

### 4a. Email/Password Login
```
FormMasuk.tsx                 /api/v1/auth/login            Browser
     │                              │                         │
     │── POST {email, password,     │                         │
     │       portalIntent} ────────→│                         │
     │                              │── verify password       │
     │                              │── signSession()          │
     │                              │── createRefreshToken()   │
     │                              │── set cookies ─────────→│
     │←── {success, redirect} ─────│                         │
     │                              │                         │
     │── window.location.href       │                         │
     │   = result.redirect ────────→│                         │
```

### 4b. Google OAuth Login
```
FormMasuk.tsx              /api/v1/auth/google           Google
     │                              │                      │
     │── window.location.href ─────→│                      │
     │                              │── redirect ke Google→│
     │                              │                      │
     │                              │←── auth code ───────│
     │                              │                      │
     │            /api/v1/auth/callback/google             │
     │                              │                      │
     │                              │── verify Google token│
     │                              │── signSession()       │
     │                              │── set cookies         │
     │                              │── redirect ke dashboard
```

### 4c. Error Codes (Login API)
| Code | Status | Description |
|------|--------|-------------|
| `INTENT_MISMATCH` | 403 | Role user tidak cocok dengan portal yang dipilih |
| `NO_PASSWORD_SET` | 401 | User belum set password (harus login Google dulu) |
| — | 401 | Email/password salah |
| — | 429 | Rate limit exceeded |

---

## 5. Route Protection Layers

### 5a. Edge Middleware (`middleware.ts`)
- Matcher: `/_next/static|_next/image|favicon.ico)`, `/:path*`
- Verifikasi JWT → set `x-user-*` headers
- Proteksi prefix:
  - `/guru/*` → allowed: `guru`, `owner`, `admin_sekolah`
  - `/siswa/*` → allowed: `murid`, `orang_tua`
  - `/owner/*` → allowed: `owner`
  - `/admin-sekolah/*` → allowed: `owner`, `admin_sekolah`
  - `/orang-tua/*` → allowed: `orang_tua`
- Jika tidak login → redirect `/masuk?redirect=<path>`
- Jika role tidak diizinkan → redirect ke ROLE_HOME
- Legacy redirects: `/dashboard-guru/*` → `/guru/*`, `/dashboard-siswa/*` → `/siswa/*`
- Legacy aliases: `/pendidik/*` → `/guru/*`, `/peserta-didik/*` → `/siswa/*`
- CSRF protection untuk method POST/PUT/DELETE

### 5b. Server Layout Guard (`*/layout.tsx`)
```typescript
// Pattern (guru/layout.tsx, siswa/layout.tsx, dll)
const cookieStore = await cookies();
const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
const session = _ar && _ar.success ? _ar.data : null;
if (!session) redirect("/masuk?portal=...&redirect=...");
if (!ALLOWED.includes(session.role)) redirect(ROLE_HOME_PATHS[session.role] || "/");
```

### 5c. Route Handler Guard (`route-guard.ts`)
```typescript
// Di API route handler
const session = await requireSession(request);         // 401 jika tidak login
const session = await requireRole(request, ["guru"]);   // 403 jika role salah
const session = await requireGuru(request);              // shortcut untuk guru
const session = await requireSiswa(request);             // shortcut untuk siswa
const session = await requirePortal(request, "guru");    // cek intent portal
```

### 5d. Server Action Guard (`guard.ts`)
```typescript
// Di server component/server action
const session = await requireAuth();           // lempar AuthError(401) jika tidak login
const session = await requireRole(["guru"]);    // lempar AuthError(403) jika role salah
```

---

## 6. Session Refresh

**Endpoint:** `POST /api/v1/auth/refresh`
**Trigger:** Saat middleware mendeteksi JWT expired, client panggil refresh endpoint
**Mekanisme:** `rotateRefreshToken()` — verifikasi refresh token di DB → sign session baru + rotasi refresh token

---

## 7. Logout

**Endpoint:** `POST /api/v1/auth/logout`
**Actions:**
- Hapus refresh token dari DB
- Hapus cookie `akal_sesi` + `akal_refresh`
- Redirect ke `/masuk`

---

## 8. Register Flow

**Endpoint:** `POST /api/v1/auth/register`
**File:** `src/app/daftar/page.tsx` + `DaftarPicker.tsx`
**Alur:**
1. User pilih role (siswa/guru) di `/daftar`
2. Isi form (nama, email, password, optional kelas/noAbsen)
3. API buat user di DB dengan role default
4. Auto-login: sign session + set cookies
5. Redirect ke dashboard sesuai role

---

## 9. Edge Cases & Error Handling

| Skenario | Yang Terjadi |
|----------|-------------|
| Token expired | `verifySession` return `{ success: false, code: "expired" }` → layout redirect ke `/masuk` |
| Token invalid (tampered) | `verifySession` return `{ success: false, code: "invalid" }` → layout redirect ke `/masuk` |
| Wrong portal | `requirePortal()` throw `GuardError("INTENT_MISMATCH")` → error message: "Gunakan portal yang sesuai" |
| No refresh token | Refresh endpoint return 401 → client harus login ulang |
| Cookie hilang | Middleware treat sebagai unauthenticated → redirect ke `/masuk` |
| Rate limit login | `checkRateLimit()` → 429 dengan `retry-after` header |

---

## 10. File Reference Map

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | `signSession()`, `verifySession()`, `signQuizToken()`, `verifyQuizToken()`, `AuthResult<T>` |
| `src/lib/auth-keys.ts` | Key loading untuk ES256/HS256 |
| `src/lib/session.ts` | `SesiPayload`, `SesiRole`, `ROLE_HOME_PATHS`, `INTENT_PORTAL`, `getRequestSession()` |
| `src/lib/auth-password.ts` | `verifyPassword()`, `hashPassword()` (Argon2id via @node-rs/argon2) |
| `src/lib/middleware/guard.ts` | `getSession()`, `requireAuth()`, `requireRole()` (server-only cookies) |
| `src/lib/route-guard.ts` | `requireSession()`, `requireRole()`, `requirePortal()`, `requireGuru()`, `requireSiswa()` (request-based) |
| `middleware.ts` | Edge middleware — JWT verify, header injection, CSRF, role-based prefix protection |
| `src/app/masuk/page.tsx` | Login page (server) — check existing session, render FormMasuk |
| `src/app/masuk/FormMasuk.tsx` | Login form (client) — email/password + Google OAuth |
| `src/app/daftar/page.tsx` | Register page |
| `src/app/daftar/DaftarPicker.tsx` | Role picker on register page |
| `src/app/api/v1/auth/login/route.ts` | Login API — verify password, sign session, set cookies |
| `src/app/api/v1/auth/register/route.ts` | Register API |
| `src/app/api/v1/auth/logout/route.ts` | Logout API — revoke refresh token, clear cookies |
| `src/app/api/v1/auth/refresh/route.ts` | Session refresh API |
| `src/app/api/v1/auth/google/route.ts` | Google OAuth initiation |
| `src/app/api/v1/auth/callback/google/route.ts` | Google OAuth callback |
| `src/app/guru/layout.tsx` | Guru dashboard layout — session guard |
| `src/app/siswa/layout.tsx` | Siswa dashboard layout — session guard |
| `src/app/owner/layout.tsx` | Owner dashboard layout — session guard |
| `src/app/admin-sekolah/layout.tsx` | Admin sekolah layout — session guard |
| `src/app/orang-tua/layout.tsx` | Orang tua layout — session guard |
| `src/lib/refresh-token.ts` | Refresh token CRUD (DB-backed) |
| `src/lib/auth-audit.ts` | Auth event logging |

---

## 11. AuthResult<T> Usage Patterns

### Pattern A — Ternary (single call per file)
```typescript
const _ar = await verifySession(token);
return _ar.success ? _ar.data : null;
```

### Pattern B — Direct call with early return
```typescript
const _ar = await verifySession(token);
if (!_ar.success) return apiError("Sesi tidak valid", 401);
return _ar.data;
```

### Pattern C — Conditional property access
```typescript
const session = _ar?.success ? _ar.data : null;
if (!session) redirect("/masuk");
```
