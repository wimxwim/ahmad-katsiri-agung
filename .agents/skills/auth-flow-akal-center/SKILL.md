---
name: auth-flow-akal-center
description: "Use when modifying or debugging AKAL Center authentication, sessions, cookies, login/register, Google OAuth, refresh/logout, portal intent, role guards, protected routes, CSRF interactions, auth database access, or RLS context. Also use before adding any endpoint or dashboard that depends on user identity or authorization."
---

# Auth Flow — AKAL Center

Project-specific source of truth for AKAL Center authentication. Read the actual files before editing because this document distinguishes **current production-compatible behavior**, **known transitional debt**, and **target architecture**.

## Core invariants

1. Database role is the identity source; URLs and form-selected portals are only intent.
2. Guru-family and siswa-family portals must never silently accept each other.
3. Session JWT lives only in an HttpOnly cookie; never expose it to client JavaScript.
4. Every protected API route performs its own server-side guard. Middleware is not sufficient authorization.
5. Ownership comes from the verified session, never from request body, query string, or route alone.
6. State-changing requests require CSRF unless explicitly exempted for a justified protocol endpoint.
7. Authentication and RLS are separate boundaries. Never set transaction-local RLS context in a standalone guard query.
8. Build success is not auth verification. Test actual status codes, cookies, redirects, role mismatch, and database effects.

## Current architecture

```text
Browser
  ├─ HttpOnly akal_sesi cookie
  ├─ HttpOnly akal_refresh cookie, refresh-path only
  └─ readable __Host-psrf cookie for double-submit CSRF
       │
       ▼
middleware.ts
  ├─ verifies JWT for protected page prefixes
  ├─ applies role-prefix navigation guard
  ├─ writes x-user-* request headers
  ├─ creates/checks CSRF token
  └─ applies CSP
       │
       ├─ Dashboard layout → requireDashboardSession()
       ├─ API route → route-guard-v2 require*()
       └─ Transitional route → dal.getSession()
```

### Boundary responsibilities

| Layer | Current responsibility | Must not do |
|---|---|---|
| `middleware.ts` | Navigation gate, JWT precheck, CSRF, CSP, legacy redirects | Replace API authorization or database ownership checks |
| `require-dashboard-session.ts` | Server-layout cookie verification and role redirect | Authorize API mutations |
| `route-guard-v2.ts` | Canonical guard for protected v1 Route Handlers | Set RLS context outside the transaction that executes business queries |
| `dal.ts` | Transitional cookie-based session reader for legacy/unmigrated routes | Become a second permanent auth architecture |
| Route handler | Role guard, validation, ownership, business operation | Trust `x-user-*`, body `userId`, or portal query without verification |
| Database/RLS | Defense in depth and row isolation when runtime role does not bypass RLS | Substitute application authorization |

## Roles, portals, and homes

Database enum values are uppercase. Session roles are lowercase and defined by `SesiRole`.

| Database role | Session role | Portal family | Home |
|---|---|---|---|
| `SISWA` or fallback student role | `murid` | siswa | `/siswa` |
| `GURU` | `guru` | guru | `/guru` |
| `ASISTEN_GURU` | `guru` | guru | `/guru` |
| `OWNER` | `owner` | guru | `/owner` |
| `ADMIN_SEKOLAH` | `admin_sekolah` | guru | `/admin-sekolah` |
| `ORANG_TUA` | `orang_tua` | siswa | `/orang-tua` |

Canonical mapping in `src/lib/session.ts`:

```typescript
INTENT_PORTAL = {
  guru: ["guru", "owner", "admin_sekolah"],
  siswa: ["murid", "orang_tua"],
};
```

Never infer authorization from `?portal=guru`. Portal intent exists to reject accidental cross-portal login and produce a clear UX error.

## Session JWT

### Payload

`SesiPayload` currently contains:

```typescript
interface SesiPayload extends JWTPayload {
  userId: string;
  role: SesiRole;
  nama: string;
  email?: string;
  kelas?: string;
  noAbsen?: string;
  nis?: string;
  sekolah?: string;
}
```

Only treat `userId`, `role`, and identity fields signed by the server as trustworthy. Re-read the database when a sensitive decision requires current account state because JWT claims remain stale until refreshed or reissued.

### Signing and verification

- `src/lib/auth.ts`: `signSession()`, `verifySession()`, `AuthResult<T>`.
- Access lifetime: 8 hours.
- Audience on signing: `akal-center-api`.
- JTI: random UUID.
- ES256 is selected only when both `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` exist.
- HS256 is the fallback and requires `JWT_SECRET` of at least 32 characters.
- `verifySession()` is wrapped in React `cache()` for request-level deduplication.
- JWKS endpoint: `GET /api/v1/auth/jwks`; empty key set when ES256 public key is absent.

Current caveat: signing sets an audience, but verification currently does not explicitly pass expected audience/issuer. Treat audience and issuer enforcement as target hardening, not as already implemented behavior.

### Result pattern

```typescript
type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; code: "expired" | "invalid" | "internal" };
```

Always narrow on `success` before reading `data`.

## Cookies

| Cookie | Current path | HttpOnly | SameSite | Lifetime |
|---|---|---:|---|---:|
| `akal_sesi` | `/` | yes | `lax` | 8 hours |
| `akal_refresh` | `/api/v1/auth/refresh` | yes | `lax` | 30 days |
| `akal_google_state` | `/` | yes | `lax` | 10 minutes |
| `akal_google_portal` | `/` | yes | `lax` | 10 minutes |
| `akal_google_return` | `/` | yes | `lax` | 10 minutes |
| `__Host-psrf` | `/` | no | `strict` | 24 hours |

All auth entry points must use the same session cookie attributes. `SameSite=Lax` is intentional for OAuth top-level redirect compatibility. Same-site client `fetch()` already sends cookies by default; `credentials: "include"` may be explicit but is not a repair for server-side failures.

Important current inconsistency: password login creates access and refresh cookies, but password registration and Google callback currently create only `akal_sesi`. Do not document refresh as universal until those flows issue refresh tokens too.

## Password login

Endpoint: `POST /api/v1/auth/login`.

```text
validate Zod input
→ IP rate limit
→ normalize email
→ find non-deleted user
→ map DB role to SesiRole
→ enforce portalIntent
→ require passwordHash
→ verify Argon2 password
→ opportunistic rehash when required
→ sign access JWT
→ create hashed DB-backed refresh token
→ set cookies
→ append auth audit event
→ return role-safe redirect
```

`redirectTo` must start with one slash, must not start with `//`, and must not contain `://`. Preserve this rule for every auth redirect.

### Login errors

| Condition | Code/status |
|---|---|
| Invalid input | `400` |
| Unknown email or wrong password | `401`, intentionally generic |
| Google-only account | `NO_PASSWORD_SET`, `401` |
| Portal mismatch | `INTENT_MISMATCH`, `403` |
| Rate limited | `RATE_LIMITED`, `429` with `Retry-After` |

Never disclose whether an arbitrary email exists except where the existing product intentionally guides an authenticated/known Google-only account flow.

## Password registration

Endpoint: `POST /api/v1/auth/register`.

Current accepted public roles: `SISWA`, `GURU`, `ASISTEN_GURU`, `ORANG_TUA`. Owner and school admin are not public registration roles.

```text
validate input and requested role
→ IP rate limit
→ enforce portal/role compatibility
→ reject active duplicate email
→ hash password with Argon2id
→ insert user
→ sign access JWT
→ set session cookie
→ audit register and login
→ redirect by session role
```

Current caveat: registration does not issue a refresh token. Future work should make successful password registration consistent with login without weakening rotation/revocation semantics.

## Google OAuth

### Start

Endpoint: `GET /api/v1/auth/google`.

- Scopes are limited to `openid email profile`.
- Random state is stored in an HttpOnly temporary cookie.
- Portal and safe `returnTo` are stored in temporary cookies.
- OAuth cookies use `SameSite=Lax`.
- `returnTo` accepts only local absolute paths, never `//`.

### Callback

Endpoint: `GET /api/v1/auth/callback/google`.

```text
rate limit
→ handle provider cancellation
→ constant-shape state validation
→ exchange code and verify Google ID token audience
→ require verified Google email
→ find non-deleted user by googleId OR email
→ create first-time user from selected portal, or link existing email
→ reject portal mismatch
→ reject conflicting googleId
→ sign session
→ clear temporary cookies
→ redirect to safe returnTo or role home
```

First-time Google registration derives the role from portal: guru → `GURU`, otherwise → `SISWA`. Existing users retain their database role.

Current caveat: callback does not create an `akal_refresh` token. A future unification must add refresh issuance to both new and existing Google-user branches.

## Refresh and logout

### Refresh token design

- Random token: 48 bytes, base64url.
- Browser cookie value: `family:token`.
- Database stores SHA-256 token hash, never raw token.
- Expiry: 30 days.
- Rotation revokes the current row and creates a replacement in the same family.
- Invalid/reused token attempts revoke the family.
- A refreshed access token reloads current user role/name/email from DB.

Endpoint: `POST /api/v1/auth/refresh`.

The refresh cookie path intentionally limits browser transmission to this endpoint.

### Logout

Endpoint: `POST /api/v1/auth/logout`.

- Idempotent.
- Attempts to audit a valid session.
- Clears access, refresh, and Google temporary cookies.
- Revokes user refresh tokens best-effort.

Current caveat: refresh-token revocation is started without awaiting completion. Treat guaranteed revocation before response as future hardening.

## Protected pages

Dashboard layouts call `requireDashboardSession()`:

| Layout | Allowed roles | Portal on re-login |
|---|---|---|
| `/guru` | guru, owner, admin sekolah | guru |
| `/siswa` | murid, orang tua | siswa |
| `/owner` | owner | guru |
| `/admin-sekolah` | admin sekolah, owner | guru |
| `/orang-tua` | orang tua | siswa |

The helper reads `akal_sesi`, verifies it, redirects unauthenticated users to `/masuk?portal=...&redirect=...`, and redirects wrong roles to their own role home.

## Protected API routes

Use `src/lib/route-guard-v2.ts` for all new v1 routes.

```typescript
export async function POST(request: NextRequest) {
  try {
    const session = await requireGuru(request);
    const input = Schema.parse(await request.json());

    const row = await createOwnedResource({
      ...input,
      guruId: session.userId,
    });

    return apiSuccess(row, 201);
  } catch (error) {
    if (error instanceof GuardError) {
      return apiError(error.code, error.message, undefined, error.status);
    }
    return apiError("INTERNAL_ERROR", "Terjadi kesalahan server", undefined, 500);
  }
}
```

### Canonical guards

| Guard | Allowed session roles |
|---|---|
| `requireSession` | any authenticated role |
| `requireGuru` | guru, owner, admin sekolah |
| `requireSiswa` | murid, orang tua |
| `requireOwner` | owner |
| `requireRole` | explicit list |
| `requirePortal` | explicit guru/siswa family with mismatch message |

`requireSession()` currently verifies the cookie itself and updates `last_active_at` at most once per five minutes as a best-effort write. It intentionally does not configure RLS.

## Transitional auth surfaces

These exist now but must not be copied into new code:

- `src/lib/dal.ts#getSession()` is used by unmigrated routes.
- `src/lib/session.ts#getRequestSession()` prefers middleware `x-user-*` headers, then verifies cookie; it is currently not the canonical v1 guard.
- `/api/sesi` exposes a safe client session projection for `SessionProvider`.
- `/session` is unrelated Keystatic compatibility routing; do not confuse it with app auth.
- `apiError()` supports legacy and structured signatures; new auth code should use structured errors.

Migration direction: move protected v1 handlers to `route-guard-v2`, then rename it to the canonical guard only after all callers and tests are migrated. Do not create a third guard.

## CSRF interaction

Middleware uses double-submit CSRF for unsafe `/api/*` requests:

```text
cookie __Host-psrf === header x-csrf-token
```

Safe methods create the CSRF cookie when absent. Auth and protocol endpoints are currently exempted, including login, register, Google OAuth, refresh, logout, set-password, payment webhook, and health-style endpoints.

When adding a state-changing endpoint:

1. Do not add it to `SKIP_CSRF_PATHS` by default.
2. Send `x-csrf-token` from the readable cookie.
3. Keep ownership and role checks even after CSRF passes.
4. Webhooks use provider signature verification instead of browser CSRF.

Current caveat: `set-password` and `logout` are exempt despite changing state. Reassess exemptions during hardening rather than copying them.

## RLS and Supabase boundary

The application currently connects with a Postgres role that was observed to have `BYPASSRLS`. Therefore application queries must enforce authorization explicitly; existing policies are not sufficient protection for that connection.

`src/lib/db/tenant-context.ts#withTenant()` is the only valid pattern for future transaction-scoped RLS execution:

```text
db.transaction
→ set app.current_user_id/current_role/current_tenant_id locally
→ SET LOCAL ROLE authenticated
→ execute every protected query through the same tx object
```

Never do this:

```text
requireSession
→ standalone set_config(..., TRUE)
→ later db query
```

`TRUE` is transaction-local; the value disappears after the standalone statement transaction, and pooled connections make session-scoped alternatives unsafe. Also audit policy recursion before runtime-role cutover: production has shown recursive `kelas ↔ siswa_kelas` policies under non-bypass roles.

Target future architecture:

1. Reconcile repository migrations with production policies.
2. Remove recursive policies.
3. Create a least-privileged runtime role without `BYPASSRLS`.
4. Run ownership tests for two gurus, two students, owner, and anon.
5. Cut over connection credentials only after the matrix passes.

## Client session

`SessionProvider` fetches `/api/sesi` and exposes a non-secret projection for navbar/dashboard display. It is UX state, not an authorization source. Never authorize rendering, mutations, or ownership solely from `useSession()`.

## Audit logging

`src/lib/auth-audit.ts` writes best-effort events to the hash-chained event store:

- login success/failure
- registration success/duplicate
- logout
- intent mismatch
- Google link
- password set

Emails are hashed and IP addresses are masked. Never add passwords, JWTs, refresh tokens, OAuth codes, raw cookies, or full child data to logs.

## Adding a protected route

1. Read the neighboring route and every caller.
2. Select the narrowest canonical guard.
3. Validate input with Zod before database work.
4. Derive owner IDs from session.
5. Add an explicit ownership predicate even when RLS exists.
6. Keep CSRF enabled for mutations.
7. Return structured API errors.
8. Test no cookie, wrong role, correct role, wrong owner, invalid input, and success.
9. Run `npm run build`.
10. Test the deployed endpoint; build alone is insufficient.

## Debugging order

When many authenticated pages fail together, inspect evidence in this order:

1. Network status and response body for one representative GET and POST.
2. Presence and attributes of `akal_sesi`.
3. `verifySession()` result and algorithm/key configuration.
4. Route guard used by the failing endpoint.
5. CSRF cookie/header for unsafe methods.
6. Database exception code and ownership predicate.
7. Runtime database role and RLS behavior.
8. Production migration/policy drift.

Do not assume cookie failure merely because APIs return `401/500`. Do not assume Supabase Advisor warnings explain application failure. Reproduce the boundary that fails.

## Verification matrix

Minimum auth regression suite:

| Scenario | Expected |
|---|---|
| Guru password login through guru portal | success, guru-family home |
| Siswa through guru portal | `INTENT_MISMATCH`, 403 |
| Guru through siswa portal | `INTENT_MISMATCH`, 403 |
| Google state mismatch | rejected, temp cookies cleared |
| Existing email first Google login | googleId linked, original role retained |
| Google-only user password login | `NO_PASSWORD_SET`, 401 |
| Missing session on protected API | 401 |
| Wrong role on protected API | 403 |
| Guru A mutates Guru B resource | 403 or 404, no data change |
| Unsafe API without CSRF | 403 unless explicitly exempt |
| Refresh token rotation | old token unusable, new pair issued |
| Logout | cookies cleared and refresh family revoked |
| Expired JWT | rejected or refreshed by explicit client flow |

## Current debt and future decisions

Do not accidentally describe these as finished:

- Mixed `route-guard-v2` and `dal.getSession()` callers remain.
- Registration and Google OAuth do not issue refresh cookies.
- Logout revocation is best-effort and not awaited.
- JWT audience/issuer verification is not explicit.
- Some CSRF exemptions are broader than ideal.
- Client registration error parsing is not fully standardized.
- Runtime DB connection currently bypasses RLS.
- Production RLS policies need reconciliation and recursion fixes.
- No complete automated auth/RLS integration suite exists yet.

Prioritize in this order: tests for current flows → canonical guard migration → uniform refresh issuance → stricter JWT verification → CSRF exemption reduction → RLS runtime-role cutover.

## File map

| File | Role |
|---|---|
| `middleware.ts` | Edge JWT precheck, page role gate, CSRF, CSP |
| `src/lib/session.ts` | Roles, payload, cookie constants, portal/home mapping |
| `src/lib/auth.ts` | Access JWT sign/verify and `AuthResult` |
| `src/lib/auth-keys.ts` | ES256/HS256 key selection and JWKS export |
| `src/lib/auth-password.ts` | Argon2id password hashing and verification |
| `src/lib/refresh-token.ts` | Hashed refresh families, rotation, revocation |
| `src/lib/google-oauth.ts` | Google OAuth client and ID token profile verification |
| `src/lib/route-guard-v2.ts` | Canonical new Route Handler guards |
| `src/lib/require-dashboard-session.ts` | Dashboard layout guard |
| `src/lib/dal.ts` | Transitional legacy session reader |
| `src/lib/db/tenant-context.ts` | Future transaction-scoped RLS context |
| `src/lib/auth-audit.ts` | Privacy-reduced auth events |
| `src/app/api/sesi/route.ts` | Client-safe session projection |
| `src/app/api/v1/auth/login/route.ts` | Password login |
| `src/app/api/v1/auth/register/route.ts` | Password registration |
| `src/app/api/v1/auth/google/route.ts` | OAuth start |
| `src/app/api/v1/auth/callback/google/route.ts` | OAuth callback/link/signup |
| `src/app/api/v1/auth/refresh/route.ts` | Refresh rotation |
| `src/app/api/v1/auth/logout/route.ts` | Logout and cookie cleanup |
| `src/app/api/v1/auth/set-password/route.ts` | Password creation for Google account |
| `src/app/api/v1/auth/jwks/route.ts` | ES256 public JWKS |

## Forbidden shortcuts

- Never trust client role, user ID, school ID, or ownership fields.
- Never store session or refresh tokens in localStorage.
- Never expose `JWT_SECRET`, private key, refresh hash, or database credentials.
- Never weaken portal intent separation to make login “work.”
- Never use middleware alone as API authorization.
- Never make a new permanent guard while two already exist.
- Never add broad CSRF exemptions as a convenience fix.
- Never use session-scoped RLS settings on pooled connections.
- Never claim an auth fix from build output alone; test production behavior.
