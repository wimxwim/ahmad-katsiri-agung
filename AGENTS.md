# AGENTS.md — AKAL Center v2

> **Update:** 13 Juli 2026 — v2 planning complete, 80-task TODO-FINAL-v2.md written.
> **Active plan:** `prd/TODO-FINAL-v2.md` — read before any feature work.
> **Model:** `gpt-5.6-luna` via NaraRouter (stable from Vercel, 1-3s).
> **Token monetization:** Rp132/generate (200% margin), QRIS GoPay, Telegram notif.

## Stack (locked)

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.7 App Router, TypeScript strict |
| CSS | Tailwind CSS v4 (oklch @theme) |
| Animation | motion/react, ease `[0.16, 1, 0.3, 1] as const` |
| Icons | lucide-react (NEVER @animateicons/react/lucide) |
| Fonts | Bricolage Grotesque (heading), Inter (body), Amiri (Quran), JetBrains Mono |
| Hosting | Vercel (sin1), project "ahmad-katsiri-agung", branch `main` |
| DB | Supabase Postgres (Singapore), Drizzle ORM |
| Storage | ImageKit (PDF/media) |
| Auth | JWT HS256/ES256 (jose) + Google OAuth, cookie `akal_sesi` |
| Validation | zod v4 |
| Package manager | npm |

## Commands

```bash
npm run dev              # Next.js dev server
npm run build            # NODE_OPTIONS=--max-old-space-size=8192 next build
npm run test             # vitest run
npm run test:watch       # vitest
npx drizzle-kit generate # Generate migration from schema.ts changes
npx drizzle-kit push     # Push schema to DB (needs TTY)
```

## Architecture (what you'd miss from filenames alone)

```
src/middleware.ts        # CSP, auth guard, role-based routing. Next.js 16 warns about name.
                         # Root-level proxy.ts does NOT exist — middleware.ts IS the proxy.
src/lib/auth.ts          # JWT sign/verify. Line 4: `import { randomUUID } from "crypto"`
                         # — incompatible with Edge runtime. Needs fix to `crypto.randomUUID()`.
src/lib/ai.ts            # NaraRouter client. Default model: gpt-5.6-luna.
                         # Base URL fallback: https://router.bynara.id/v1
                         # API key fallback: AI_API_KEY || NARAROUTER_API_KEY
src/lib/ai-generator.ts  # Orchestrates upload→extract→AI/fallback→save draft.
                         # `buildSoalSystemPrompt(n)` EXISTS (dynamic count).
                         # `buildQuizSystemPrompt(n)` does NOT exist yet.
                         # `fallbackAiResults()` hardcodes 5 quiz + 10 soal.
                         # `runGenerationFromText(id, text, guruId)` — 3 params, no soalCount/quizCount.
src/lib/ai-sanitizer.ts  # Normalizes AI output. DO NOT DELETE — prevents schema invalid.
src/lib/session.ts       # `roleToSessionRole()`: DB uppercase → session lowercase.
                         # "GURU"/"ASISTEN_GURU" → "guru", "SISWA" → "murid".
                         # Cookie: `akal_sesi` (httpOnly, secure, sameSite=lax).
src/lib/db/schema.ts     # 1145 lines, ~30 tables. Missing: token_balances, materi_sharing,
                         # krabat_connections. fileMateri has NO `kategori` column.
                         # Migration journal desync: 0014-0023 not in _journal.json.
src/lib/db/migrations/   # 24 SQL files (0000-0023). Applied manually to Supabase.
                         # Drizzle generate writes to drizzle/ folder (0015-0017 there).
src/app/api/v1/          # New API routes (auth, guru, siswa, kursus, enroll, payment, etc.)
src/app/api/             # Legacy routes (doa, keystatic) — some deleted, some frozen.
```

## Critical gotchas

1. **`randomUUID` from `crypto` breaks Edge** — ✅ FIXED (14 Jul 2026). `src/lib/auth.ts` now uses `crypto.randomUUID()` (Web Crypto).
2. **CRON_SECRET hardcoded fallback** — ✅ FIXED (14 Jul 2026). `src/app/api/v1/cron/generate/route.ts` no longer has hardcoded `"akal-cron-secret"`. Uses `process.env.CRON_SECRET` only.
3. **CSRF token sent but NEVER validated server-side** — `x-csrf-token` header exists but no server-side check. Double-submit cookie pattern incomplete.
4. **Upload does NOT auto-trigger generate** — ✅ BY DESIGN (14 Jul 2026). Upload only does upload + extraction. Guru manually clicks "Generate AI" in Draft AI page. Cron job (daily midnight) processes stuck queues.
5. **`runGenerationFromText()` accepts soalCount/quizCount** — ✅ FIXED. `src/lib/ai-generator.ts:runGenerationFromText()` accepts `soalCount` and `quizCount` params.
6. **`buildQuizSystemPrompt(n)` exists** — ✅ FIXED. `src/lib/ai-generator.ts` has both `buildQuizSystemPrompt(n)` and `buildSoalSystemPrompt(n)`.
7. **`fallbackAiResults()` accepts dynamic counts** — ✅ FIXED. `src/lib/ai-generator.ts:fallbackAiResults()` accepts `quizCount` and `soalCount` params.
8. **Model AI default** — ✅ UPDATED (14 Jul 2026). Default model is `deepseek-v4-flash-bynara` (was `gpt-5.6-luna`). Temperature works via `thinking: {type: "disabled"}` auto-injection.
9. **No `token_balances`, `materi_sharing`, `krabat_connections` tables** — needed for v2 token system + sharing.
10. **Migration journal desync** — `drizzle/meta/_journal.json` missing entries 0014-0023. Drizzle CLI may conflict.
11. **DB role uppercase → session role lowercase** — `roleToSessionRole()` in `src/lib/session.ts`. "SISWA" → "murid", "GURU" → "guru".
12. **Password with special chars in DATABASE_URL** — MUST `encodeURIComponent()` before using in connection string.
13. **Migrations NOT auto-applied** — run SQL manually in Supabase SQL Editor. Check `information_schema.columns` before assuming migration exists.
14. **Vercel production branch = `main`** (not `master`). Merge to `main` to deploy.
15. **NEVER import `@animateicons/react/lucide`** — caused Vercel build failure. Use `lucide-react` only.
16. **NEVER delete `vercel.json`**.
17. **NEVER hardcode `NODE_ENV`** in any .env file.
18. **NEVER commit credentials** — repo is PUBLIC. Use `.env.example` with placeholders.
19. **Cron job is daily midnight** (`0 0 * * *`) — Vercel Hobby limit. Processes stuck `aiGeneration` queue. Normal flow: manual generate from Draft AI page (no waiting).

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

Read `prd/TODO-FINAL-v2.md` for the full 80-task plan. Current priority order:

1. **Fase 0 (CRITICAL):** middleware.ts cleanup, randomUUID fix, CRON_SECRET, auto-generate, CSRF
2. **Fase 1 (AI):** dynamic quiz prompt, soalCount/quizCount params, normalizer fix
3. **Fase 2 (Upload):** kategori column, auto-detect from filename
4. **Fase 3 (Token):** token_balances table, top-up API, Telegram notif, deduction at generate
5. **Fase 4 (Sharing):** materi_sharing, krabat_connections, PRIVAT/PUBLIK/KRABAT visibility
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

