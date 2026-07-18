# AGENTS.md — AKAL Center v2

> **Update:** 18 Juli 2026 — database cleaned, 13 bug fixes deployed, quiz flow repaired.
> **Active plan:** `prd/TODO-FINAL-v2.md` — read before any feature work.
> **Model:** `deepseek-v4-flash-bynara` via NaraRouter (`src/lib/ai.ts:getModelName()`).
> **Token monetization:** Rp132/generate (200% margin), QRIS GoPay, Telegram notif.
> **Database:** Cleared to 1 user (AKA CHANNEL). All other data deleted for clean testing.

## Stack (locked)

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.10 App Router, TypeScript strict |
| CSS | Tailwind CSS v4 (oklch @theme) |
| Animation | motion/react, ease `[0.16, 1, 0.3, 1] as const` |
| Icons | lucide-react (NEVER @animateicons/react/lucide) |
| Fonts | Bricolage Grotesque (heading), Inter (body), Amiri (Quran), JetBrains Mono |
| Hosting | Vercel (sin1), project "ahmad-katsiri-agung", branch `main` |
| DB | Supabase Postgres (Singapore), Drizzle ORM |
| Storage | ImageKit (PDF/media) |
| Auth | JWT HS256/ES256 (jose) + Google OAuth, cookie `__Host-akal_sesi` |
| Validation | zod v4 |
| Package manager | npm |

## Commands

```bash
npm run dev              # Next.js dev server
npm run build            # NODE_OPTIONS=--max-old-space-size=8192 next build
npm run test             # vitest run
npm run test:watch       # vitest
npx tsc --noEmit         # TypeScript check only (fast, no build)
npx drizzle-kit generate # Generate migration from schema.ts changes
npx drizzle-kit push     # Push schema to DB (needs TTY)
npx vercel --prod --yes  # Deploy to Vercel production (akalcenter.my.id)
```

## Architecture (what you'd miss from filenames alone)

```
src/middleware.ts        # CSP, auth guard, role-based routing. Next.js 16 warns about name.
                         # Root-level proxy.ts does NOT exist — middleware.ts IS the proxy.
src/lib/auth.ts          # JWT sign/verify. Uses `crypto.randomUUID()` (Web Crypto, Edge-safe).
src/lib/ai.ts            # NaraRouter client. Default model: deepseek-v4-flash-bynara.
                         # Base URL: https://router.bynara.id/v1
                         # API key: AI_API_KEY || NARAROUTER_API_KEY
src/lib/ai-generator.ts  # Orchestrates upload→extract→AI/fallback→save draft.
                         # buildSoalSystemPrompt(n) + buildQuizSystemPrompt(n) both exist.
                         # runGenerationFromText(id, text, guruId, soalCount?, quizCount?)
src/lib/ai-sanitizer.ts  # Normalizes AI output. DO NOT DELETE — prevents schema invalid.
src/lib/session.ts       # roleToSessionRole(): DB uppercase → session lowercase.
                         # "GURU"/"ASISTEN_GURU" → "guru", "SISWA" → "murid".
                         # Cookie: __Host-akal_sesi (httpOnly, secure, sameSite=lax).
src/lib/db/schema.ts     # ~30 tables. All v2 tables exist (token_balances, materi_sharing,
                         # krabat_connections, fileMateri.kategori). Migration 0000-0038.
src/lib/db/migrations/   # 39 SQL files (0000-0038). Applied manually to Supabase.
                         # drizzle/ folder exists at root with Drizzle meta.
src/app/api/v1/          # 114 API route handlers (auth, guru, siswa, kursus, enroll, payment, etc.)
src/app/api/             # Legacy routes (health, sesi, csp-report) — frozen.
```

## Data flow: Siswa Quiz (critical path)

```
Siswa klik kuis di /siswa/quiz
  → /siswa/cbt/[id] → GET /api/v1/siswa/quiz/[id]  (ambil soal)
  → QuizEngine.startQuiz() → POST /api/v1/siswa/quiz/[id]/start  (catat start)
  → Siswa kerjakan soal
  → Submit → POST /api/v1/siswa/quiz/[id]/submit  (nilai + jawabanBenar)
  → QuizEngine tampilkan hasil
```

**Rules:**
- `kunci` jawaban dikirim ke client HANYA untuk mode `BELAJAR`. Mode `ULANGAN`/`CBT` tidak.
- `POST /siswa/quiz/[id]/start` WAJIB dipanggil sebelum submit. Submit endpoint cek cache key ini.
- QuizEngine feedback real-time (benar/salah) hanya bekerja di mode BELAJAR.

## Critical gotchas

1. **CSRF token sent but NEVER validated server-side** — `x-csrf-token` header exists but no server-side check. Double-submit cookie pattern incomplete.
2. **Migration journal desync** — `drizzle/meta/_journal.json` missing entries 0014-0023. Drizzle CLI may conflict.
3. **DB role uppercase → session role lowercase** — `roleToSessionRole()` in `src/lib/session.ts`. "SISWA" → "murid", "GURU" → "guru".
4. **Password with special chars in DATABASE_URL** — MUST `encodeURIComponent()` before using in connection string.
5. **Migrations NOT auto-applied** — run SQL manually in Supabase SQL Editor. Check `information_schema.columns` before assuming migration exists.
6. **Vercel production branch = `main`** (not `master`). Push to `main` to trigger deploy.
7. **NEVER import `@animateicons/react/lucide`** — caused Vercel build failure. Use `lucide-react` only.
8. **NEVER delete `vercel.json`**.
9. **NEVER hardcode `NODE_ENV`** in any .env file.
10. **NEVER commit credentials** — repo is PUBLIC. Use `.env.example` with placeholders.
11. **Cron job is daily midnight** (`0 0 * * *`) — Vercel Hobby limit. Processes stuck `aiGeneration` queue. Normal flow: manual generate from Draft AI page.
12. **Logout MUST be POST** — `<Link href="/api/v1/auth/logout">` is a security risk (browser prefetch). Use `<button>` + `fetch(POST)` + `router.push("/masuk")`.
13. **Onboarding syncs server + localStorage** — `/guru/onboarding` fetches `GET /api/v1/guru/onboarding`, posts `POST /api/v1/guru/onboarding` on step completion. localStorage is fallback.
14. **Draft polling only runs when processing drafts exist** — `setInterval` only active when `drafts.some(d => d.status === 'queued' || d.status === 'extracting' || d.status === 'generating')`. Stops automatically when no processing drafts.
15. **Use `apiFetch()` from `@/lib/api-helpers`** — preferred over raw `fetch()` in guru pages. Raw `fetch` is still used in siswa pages (no standard yet).
16. **Upload does NOT auto-trigger generate** — BY DESIGN. Upload only does upload + extraction. Guru manually clicks "Generate AI" in Draft AI page.

## Design system (immutable)

- Colors: primary `#005231`, tertiary `#5a4200`, surface `#f2fcf7`
- Glass: `bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px]`
- Shimmer: `linear-gradient(90deg, #eec055, #ffdf9b, #eec055, #ffdf9b)`
- Border: `rgba(27,107,69,0.15)`
- Mobile-first: `px-3 sm:px-5 lg:px-8`
- Animation ease: `[0.16, 1, 0.3, 1] as const` — NEVER change
- Class merge: `cn()` from `src/lib/utils.ts`

## Auth rules

- `/masuk` and `/daftar` are the only public auth entry points
- Portal intent: `/masuk?portal=guru` vs `/masuk?portal=siswa`
- Role mismatch → explicit error, never silent redirect
- All AI output = draft until guru approves
- File upload = untrusted content

## OpenCode Agent Rules

- **Use sub-agents for execution** — Bash commands, file writes, and deploy go through `sidekick` agent via `task` tool.
- **Use explore agent for research** — Reading files, searching code, and cross-referencing.
- **Main agent handles:** git commit, git push, critical decisions, and review.
- **Vercel deploy** — `npx vercel --prod --yes` via sidekick. Auto-deploys on push to `main`.
- **Support page (`/support`)** — QRIS donation + Telegram notif. DO NOT touch. Took 1+ week to fix.
- **Database is clean** — 1 user (AKA CHANNEL, katsiriagung99@gmail.com). All other data deleted. Create new test data as needed.

## Legacy (DELETED — do NOT recreate)

- `src/data/materi.ts`, `src/data/soal.ts`, `src/lib/google-sheets.ts`
- `src/lib/cms.ts`, `src/lib/cms-data.ts`
- Routes: `/materi`, `/evaluasi`, `/refleksi`, `/diskusi`, `/hafalan`, `/video`, `/dalil`
- Keystatic reader frozen, `content/*` is archive only
- All new content must be DB-driven (Drizzle + Supabase)

## Before committing

```bash
git diff --cached | grep -iE 'DATABASE_URL|SUPABASE_SERVICE_ROLE|JWT_SECRET|ENCRYPTION_SECRET|GOOGLE_CLIENT_SECRET|IMAGEKIT_PRIVATE_KEY|RESEND_API_KEY|REDIS_URL|NARAROUTER_API_KEY|SMTP_PASSWORD|token'
# Must return NOTHING. If it returns anything, STOP and remove credentials.
```

## Active TODO

Read `prd/TODO-FINAL-v2.md` for the full 80-task plan. Remaining priorities:

1. **CSRF validation** — server-side check missing (gotcha #1)
2. **AI generate pipeline** — upload 42 sample files, test full flow (Fase 8)
3. **Payment integration** — frontend wiring for `/siswa/payment` (placeholder)
4. **Migration journal sync** — fix `_journal.json` desync (gotcha #2)
5. **Katalog page** — public course browsing frontend for `/api/v1/katalog`

## ⚠️ LESSON LEARNED — JANGAN Kill/Restart Chrome

**Kejadian (15 Jul 2026):** Chrome di-kill dan restart dengan `--remote-debugging-port=9222`
untuk keperluan browser-act. Akibat: **semua Chrome profile hilang, semua akun logout**
(GitHub, Vercel, Cloudflare, Supabase, Google, dll). Pemilik kehilangan semua sesi login.

**ATURAN BARU:**
- **JANGAN PERNAH kill Chrome** untuk alasan apapun
- **JANGAN PERNAH restart Chrome** dengan flag `--remote-debugging-port`
- Jika browser-act chrome-direct tidak bisa connect, **hentikan**, jangan dipaksa
- Gunakan browser-act **chrome_local** (managed browser) atau minta user login manual
- **Tidak ada pengecualian.** Kehilangan Chrome profile = bencana.