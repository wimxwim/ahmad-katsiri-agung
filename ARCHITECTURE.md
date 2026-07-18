# AKAL Center — Architecture & System Design

> **Updated:** 18 Juli 2026 — production audit, database cleaned, 13 fixes deployed
> **Stack:** Next.js 16.2.10 (Vercel sin1) + Supabase Postgres (Singapore) + ImageKit + NaraRouter AI
> **Domain:** https://akalcenter.my.id

---

## 1. Deployment Architecture (Actual)

```
Browser
  │
  ▼
Vercel (sin1 — Singapore)
  ├─ Next.js 16.2.10 App Router (Turbopack)
  ├─ Edge Middleware (CSP, auth guard, CSRF, role routing)
  ├─ 94 static pages + ~100 dynamic/API routes
  ├─ Cron: daily midnight (cleanup, generate queue)
  └─ Build: NODE_OPTIONS=--max-old-space-size=8192
       │
       ├─ Supabase Postgres (Singapore, Pooler)
       │   ├─ 39 migrations (0000-0038)
       │   ├─ 44 tables, ~30 active
       │   └─ Connection: aws-1-ap-southeast-1.pooler.supabase.com:6543
       │
       ├─ ImageKit (PDF storage, 20 GB free)
       │
       ├─ NaraRouter (AI — deepseek-v4-flash-bynara)
       │   └─ Base: https://router.bynara.id/v1
       │
       ├─ Upstash Redis (caching, rate limiting, session)
       │
       └─ Cloudflare Worker (akal-centre proxy)
           └─ workers/akal-centre/index.ts
```

---

## 2. Request Lifecycle

```
1. Browser request
   │
2. Vercel Edge Middleware (src/middleware.ts)
   ├─ CSP headers
   ├─ JWT verification (cookie: __Host-akal_sesi)
   ├─ Role-based routing (guru ↔ siswa)
   ├─ CSRF token (cookie: __Host-psrf)
   └─ x-user-* headers forwarded
   │
3. Route Handler (src/app/api/v1/**)
   ├─ Rate limit (IP + user, sliding window)
   ├─ Route guard (requireGuru / requireSiswa)
   ├─ Input validation (zod v4)
   ├─ Business logic
   ├─ DB query (Drizzle ORM, parameterized)
   └─ Response (structured JSON)
   │
4. Client (React 19, motion/react)
   ├─ data-cache.ts (30s TTL in-memory)
   ├─ apiFetch() helper (src/lib/api-helpers.ts)
   ├─ Skeleton loaders + error states + empty states
   └─ Staggered animation (EASE_CURVE: [0.16, 1, 0.3, 1])
```

---

## 3. Authentication Flow

```
┌─ LOGIN ─────────────────────────────────────────────────┐
│  POST /api/v1/auth/login                                 │
│  → validate Zod input                                     │
│  → IP rate limit                                          │
│  → find user by email                                     │
│  → verify Argon2 password                                 │
│  → check portal intent (guru/siswa)                       │
│  → sign JWT (ES256 or HS256 fallback)                     │
│  → set __Host-akal_sesi cookie (httpOnly, 8h)             │
│  → set __Host-akal_refresh cookie (httpOnly, 30d)         │
│  → audit event                                            │
│  → redirect to role home                                  │
└──────────────────────────────────────────────────────────┘

┌─ SESSION ────────────────────────────────────────────────┐
│  Cookie: __Host-akal_sesi                                 │
│  Payload: { userId, role, nama, email, kelas, ... }      │
│  Role mapping: SISWA→murid, GURU→guru                    │
│  Guard: route-guard-v2.ts (requireGuru/requireSiswa)     │
│  Layout: require-dashboard-session.ts (page-level)        │
└──────────────────────────────────────────────────────────┘

┌─ LOGOUT ─────────────────────────────────────────────────┐
│  POST /api/v1/auth/logout (MUST be POST, never GET)       │
│  → clear cookies                                          │
│  → revoke refresh tokens                                  │
│  → redirect to /masuk                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (Key Tables)

### Content Pipeline
```
ai_generation (79 records cleaned)
  ├─ guru_id, status (queued/extracting/generating/ready/rejected)
  ├─ extraction_text, prompt_version
  │
  ├─→ materi_published (12 records cleaned)
  │     ├─ judul, konten, ringkasan, kursus_id
  │     └─ materi_sharing (visibility: PRIVAT/PUBLIK/KRABAT)
  │
  ├─→ quiz_published (12 records cleaned)
  │     ├─ judul, mode_evaluasi (BELAJAR/ULANGAN/CBT)
  │     ├─ durasi_menit, kursus_id
  │     │
  │     └─→ soal_published (190 records cleaned)
  │           ├─ pertanyaan, tipe (PG/ISIAN/ESSAY)
  │           ├─ pilihan_ganda (jsonb), kunci, poin, urutan
  │           └─→ quiz_attempt (siswa answers, nilai)
  │
  └─→ file_materi (78 records cleaned)
        ├─ kategori, file_url (ImageKit), extraction_text
```

### User & Enrollment
```
users
  ├─ role: GURU | SISWA | ASISTEN_GURU | ORANG_TUA | OWNER | ADMIN_SEKOLAH
  │
  ├─→ kursus (guru_id, status, judul)
  │     └─→ siswa_kursus (siswa_id, status: AKTIF/SELESAI)
  │
  └─→ kelas (guru_id, nama, tingkat)
        └─→ siswa_kelas (siswa_id, kelas_id)
```

### Token & Payment
```
token_balances (user_id, balance, total_spent, is_unlocked)
  └─→ token_transactions (amount, type, reference)

payments (user_id, amount, status, proof_url)
  └─→ transaksi (payment_id, kursus_id, status)
```

---

## 5. AI Pipeline

```
┌─ UPLOAD ─────────────────────────────────────────────────┐
│  Guru upload PDF/DOCX via /guru/upload                    │
│  → ImageKit storage                                       │
│  → Extract text (unpdf, 30s)                              │
│  → Save to file_materi.extraction_text                    │
│  → Create ai_generation (status: extracted)               │
│  → Upload does NOT auto-trigger generate (BY DESIGN)      │
└──────────────────────────────────────────────────────────┘

┌─ GENERATE ───────────────────────────────────────────────┐
│  Guru clicks "Generate AI" in /guru/drafts                │
│  → POST /api/v1/guru/drafts/{id}/generate                 │
│  → 3 AI calls sequential: materi → quiz → soal            │
│  → NaraRouter: deepseek-v4-flash-bynara                   │
│  → Fallback: local generator (ai-generator.ts)            │
│  → Sanitizer: ai-sanitizer.ts (normalizes output)         │
│  → Save to ai_output (per-category)                       │
│  → Status: ready (for review)                             │
└──────────────────────────────────────────────────────────┘

┌─ REVIEW & PUBLISH ───────────────────────────────────────┐
│  Guru reviews in /guru/drafts/{id}                        │
│  → Approve/reject per category (materi/quiz/soal)         │
│  → "Close Review" → publish to siswa                      │
│  → Creates: materi_published + quiz_published + soal_published │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Caching Strategy

| Layer | Tech | TTL | What |
|-------|------|-----|------|
| Client | data-cache.ts (in-memory Map) | 30s | Dashboard, quiz list, materi list |
| Server | Upstash Redis | 5min | Kursus catalog, AI generation status |
| Server | cache-layer.ts | 1h | Quiz start timestamps, session data |
| CDN | Vercel Edge | 1y | Static assets (_next/static) |

---

## 7. Rate Limiting

| Scope | Limit | Window |
|-------|-------|--------|
| IP (general) | 60 req | 1 min |
| User (general) | 120 req | 1 min |
| Siswa dashboard | 30 req | 1 min |
| Siswa quiz detail | 30 req | 1 min |
| Siswa quiz submit | 10 req | 1 min |
| AI generation | 10 req | 1 day |
| Login attempts | 5 req | 15 min |

---

## 8. API Route Map (114 handlers)

### Auth (9 routes)
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/set-password
GET  /api/v1/auth/google
GET  /api/v1/auth/callback/google
GET  /api/v1/auth/jwks
```

### Siswa (11 routes)
```
GET  /api/v1/siswa/dashboard
GET  /api/v1/siswa/materi
GET  /api/v1/siswa/materi/{id}
POST /api/v1/siswa/materi/{id}       (progress tracking)
GET  /api/v1/siswa/quiz
GET  /api/v1/siswa/quiz/{id}         (ambil soal)
POST /api/v1/siswa/quiz/{id}/start   (catat mulai)
POST /api/v1/siswa/quiz/{id}/submit  (nilai + jawaban)
GET  /api/v1/siswa/progres
GET  /api/v1/siswa/feed
GET  /api/v1/siswa/pengumuman
```

### Guru (30+ routes)
```
GET  /api/v1/guru/dashboard
GET  /api/v1/guru/analytics
GET  /api/v1/guru/onboarding
POST /api/v1/guru/onboarding
GET  /api/v1/guru/uploads
POST /api/v1/guru/uploads
GET  /api/v1/guru/drafts
GET  /api/v1/guru/drafts/{id}
POST /api/v1/guru/drafts/{id}/generate
POST /api/v1/guru/drafts/{id}/close-review
POST /api/v1/guru/drafts/{id}/approve-materi
POST /api/v1/guru/drafts/{id}/reject-materi
POST /api/v1/guru/drafts/{id}/regenerate-materi
POST /api/v1/guru/drafts/{id}/edit-materi
POST /api/v1/guru/drafts/{id}/approve-quiz
POST /api/v1/guru/drafts/{id}/reject-quiz
POST /api/v1/guru/drafts/{id}/approve-soal
POST /api/v1/guru/drafts/{id}/reject-soal
GET  /api/v1/guru/kelas
POST /api/v1/guru/kelas
PATCH /api/v1/guru/kelas/{id}
DELETE /api/v1/guru/kelas/{id}
POST /api/v1/guru/kelas/{id}/invite
GET  /api/v1/guru/siswa
GET  /api/v1/guru/siswa/{id}
POST /api/v1/guru/siswa/import
GET  /api/v1/guru/kursus/{id}/progres
GET  /api/v1/guru/materi/{id}/sharing
POST /api/v1/guru/materi/{id}/sharing
GET  /api/v1/guru/sertifikat/kursus
POST /api/v1/guru/sertifikat/generate
GET  /api/v1/guru/token/balance
POST /api/v1/guru/token/topup
POST /api/v1/guru/krabat/connect
POST /api/v1/guru/krabat/approve
```

### Shared (20+ routes)
```
GET  /api/v1/kursus
POST /api/v1/kursus
GET  /api/v1/kursus/{id}
POST /api/v1/kursus/{id}/invite
PATCH /api/v1/kursus/{id}/publish
GET  /api/v1/kursus/{id}/nilai
GET  /api/v1/katalog
POST /api/v1/enroll
GET  /api/v1/enroll/status
GET  /api/v1/pengumuman
POST /api/v1/pengumuman
GET  /api/v1/pengumuman/{id}
PUT  /api/v1/pengumuman/{id}
DELETE /api/v1/pengumuman/{id}
POST /api/v1/payment/create
POST /api/v1/payment/submit
POST /api/v1/payment/webhook
GET  /api/v1/token/balance
GET  /api/v1/token/plans
POST /api/v1/token/topup
POST /api/v1/token/topup/upload
POST /api/v1/sertifikat/generate
POST /api/v1/invite/kelas/consume
```

### Cron (6 routes)
```
POST /api/v1/cron/generate
POST /api/v1/cron/cleanup
POST /api/v1/cron/analytics
POST /api/v1/cron/prune-events
POST /api/v1/cron/refresh-ai-costs
POST /api/v1/cron/reset-quota
```

---

## 9. File Map

| File | Role |
|------|------|
| `src/middleware.ts` | Edge: CSP, auth guard, CSRF, role routing |
| `src/lib/auth.ts` | JWT sign/verify (crypto.randomUUID) |
| `src/lib/session.ts` | Role mapping, cookie constants |
| `src/lib/route-guard-v2.ts` | Canonical API guards |
| `src/lib/require-dashboard-session.ts` | Page layout guard |
| `src/lib/ai.ts` | NaraRouter client (deepseek-v4-flash-bynara) |
| `src/lib/ai-generator.ts` | AI orchestration (upload→generate→fallback) |
| `src/lib/ai-sanitizer.ts` | AI output normalizer |
| `src/lib/db/schema.ts` | Drizzle ORM schema (~30 tables) |
| `src/lib/db/migrations/` | 39 SQL migration files |
| `src/lib/cache-layer.ts` | Redis cache abstraction |
| `src/lib/data-cache.ts` | Client-side in-memory cache |
| `src/lib/rate-limit.ts` | Sliding window rate limiter |
| `src/lib/csrf.ts` | CSRF headers + validation |
| `src/lib/api-helpers.ts` | apiFetch() helper |
| `src/lib/api-response.ts` | Structured API responses |
| `src/lib/event-store.ts` | Hash-chained audit events |
| `workers/akal-centre/` | Cloudflare Worker proxy |

---

*Audited from production codebase — 18 Juli 2026.*