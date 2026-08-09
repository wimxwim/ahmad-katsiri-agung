# AGENTS.md — AKAL Center v2

> **Update:** 22 Juli 2026 — dynamic pricing, grade adaptation, soal fix deployed.
> **Active plan:** `prd/PRD-MATERI-SOAL-COVERAGE.md` — materi-soal pipeline + grade adaptation.
> **Model:** `deepseek-v4-flash` via NaraRouter (`src/lib/ai.ts:getModelName()`).
> **Pricing:** Dynamic (11.5× margin). `FREE_GENERATE_MODE=true` env var bypasses top-up requirement.

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
src/lib/ai.ts            # NaraRouter client. Default model: deepseek-v4-flash.
                         # Base URL: https://router.bynara.id/v1
                         # API key: AI_API_KEY || NARAROUTER_API_KEY
                         # chatWithFallback: flash → mimo fallback chain. DO NOT remove Mimo fallback.
src/lib/ai-generator.ts  # Orchestrates upload→extract→AI/fallback→save draft.
                         # buildMateriSystemPrompt(tingkat?) — comprehensive materi with grade adaptation.
                         # buildSoalSystemPrompt(count, tingkat?) — simple 9-rule prompt (flash model limit).
                         # buildQuizSystemPrompt(count) — quiz prompt.
                         # runGeneration(file) — used by regenerate route. No tingkat param.
                         # runGenerationFromText(text, guruId, tingkat?) — used by generate route.
                         # validateCoverage(materiKonten, soalItems) — checks soal coverage %.
                         # Default soalCount: 20 (not 35 — flash model times out at 35).
                         # SOAL_TIMEOUT_MS: 180s. Fetch timeout: 180s.
                         # Source cap: 20_000 chars. Materi maxTokens: 2_500.
                         # GRADE_GUIDELINES: 6 Fase (A-F), tingkatToFase() helper.
                         # Soal generation uses source text, NOT materi content (flash model constraint).
src/lib/ai-sanitizer.ts  # Normalizes AI output. DO NOT DELETE.
                         # MateriResultSchema: judul, ringkasan, tujuanPembelajaran, pendahuluan,
                         #   konten (with dalil, contoh, hikmah, poinSoal), istilahKunci, poinPenting, refleksi.
                         # GeneratedSoalSchema: pertanyaan, tipe, opsi, kunci, penjelasan?, sourceSection?
                         # CRITICAL: soal parse failure → falls back to local template (GARBAGE).
                         #   When soalStatus=draft but questions are "Apa inti dari...", AI failed silently.
src/lib/ai-regenerate.ts # Regenerate materi/quiz/soal individually. Uses buildMateriSystemPrompt from ai-generator.
                         # Regenerate MATERI_SYSTEM constant removed — now imports from ai-generator.
src/lib/session.ts       # roleToSessionRole(): DB uppercase → session lowercase.
                         # "GURU"/"ASISTEN_GURU" → "guru", "SISWA" → "murid".
                         # Cookie: __Host-akal_sesi (httpOnly, secure, sameSite=lax).
src/lib/token-service.ts # Dynamic pricing: estimateGenerationCost(), calculateActualPrice(),
                         #   settleGenerationCost(), deductGenerateCostDynamic().
                         # requireUnlocked() — bypassed when FREE_GENERATE_MODE=true.
                         # MIN_GENERATE_CHARGE=50, MAX_GENERATE_CHARGE=500, MARGIN_MULTIPLIER=11.5.
src/lib/token-constants.ts # GENERATE_COST=85 (legacy flat rate). Dynamic pricing constants above.
src/lib/db/schema.ts     # ~30 tables. aiGeneration has tingkat+fase columns (migration 0052).
                         # fileMateri has kelasId column (migration 0052).
src/lib/db/migrations/   # 54 SQL files (0000-0052). Applied manually to Supabase.
                         # drizzle/ folder exists at root with Drizzle meta.
src/app/api/v1/          # 114 API route handlers (auth, guru, siswa, kursus, enroll, payment, etc.)
src/app/api/             # Legacy routes (health, sesi, csp-report) — frozen.
```

## AI Generation Pipeline (critical path)

```
Upload PDF → /api/v1/guru/uploads
  → Extract text (inline, 60s timeout)
  → Save to fileMateri + aiGeneration (status: extracted)
  → User clicks "Buat AI" → POST /api/v1/guru/drafts/[id]/generate
  → Pre-charge: estimateGenerationCost(sourceText.length)
  → after() callback:
    1. Generate MATERI: buildMateriSystemPrompt(tingkat) + source text → maxTokens 2500
    2. Generate QUIZ: buildQuizSystemPrompt(5) + source text → maxTokens 800
    3. Generate SOAL: buildSoalSystemPrompt(20) + source text → maxTokens 5000, timeout 180s
    4. Parse all outputs (parseMateriSafe, parseQuizSafe, parseSoalSafe)
    5. If parse fails → fallbackAiResults() → GARBAGE template (silent failure!)
    6. settleGenerationCost(tokensIn, tokensOut, preCharged) → refund excess
```

**Critical rules:**
- Soal count default is 20, NOT 35. Flash model times out at 35 soal.
- Soal prompt MUST stay simple (9 rules max). Complex coverage/sourceSection rules → flash model fails.
- Do NOT change soal generation to use materi content. Flash model can't handle it. Use source text.
- `chatWithFallback` has flash→mimo chain. Do NOT remove the Mimo fallback.
- Regenerate route MUST use `after()` wrapper. Without it, Vercel kills the background job.
- Concurrent limit TTL for regenerate: 3 minutes (not 30 min default).
- `FREE_GENERATE_MODE=true` env var bypasses top-up requirement. Set in Vercel dashboard.
- Upload NOW requires `kelasId` in FormData. Rejects with 400 if missing.
- `kunci` jawaban dikirim ke client HANYA untuk mode `BELAJAR`. Mode `ULANGAN`/`CBT` tidak.

## Critical gotchas

1. **Soal fallback is SILENT** — when AI fails, `fallbackAiResults()` produces valid JSON that parses successfully. Status shows `draft`, no errorMessage unless parse itself fails. Check soal content: if questions are "Apa inti dari pernyataan berikut..." or "Mengapa siswa perlu memahami materi tentang...", AI failed silently.
2. **Flash model prompt limit** — keep soal prompt under ~500 chars. Complex rules (ATURAN COVERAGE, sourceSection, penjelasan, grade-specific rules) → flash model fails.
3. **Migration journal desync** — `drizzle/meta/_journal.json` missing entries 0014-0023. Drizzle CLI may conflict.
4. **DB role uppercase → session role lowercase** — `roleToSessionRole()` in `src/lib/session.ts`. "SISWA" → "murid", "GURU" → "guru".
5. **Password with special chars in DATABASE_URL** — MUST `encodeURIComponent()` before using in connection string.
6. **Migrations NOT auto-applied** — run SQL manually in Supabase SQL Editor. Check `information_schema.columns` before assuming migration exists.
7. **Vercel production branch = `main`** (not `master`). Push to `main` to trigger deploy.
8. **NEVER import `@animateicons/react/lucide`** — caused Vercel build failure. Use `lucide-react` only.
9. **NEVER delete `vercel.json`**.
10. **NEVER hardcode `NODE_ENV`** in any .env file.
11. **NEVER commit credentials** — repo is PUBLIC. Use `.env.example` with placeholders.
12. **Cron job is daily midnight** (`0 0 * * *`) — Vercel Hobby limit. Processes stuck `aiGeneration` queue. Normal flow: manual generate from Draft AI page.
13. **Logout MUST be POST** — `<Link href="/api/v1/auth/logout">` is a security risk (browser prefetch). Use `<button>` + `fetch(POST)` + `router.push("/masuk")`.
14. **Onboarding syncs server + localStorage** — `/guru/onboarding` fetches `GET /api/v1/guru/onboarding`, posts `POST /api/v1/guru/onboarding` on step completion. localStorage is fallback.
15. **Draft polling only runs when processing drafts exist** — `setInterval` only active when `drafts.some(d => d.status === 'queued' || d.status === 'extracting' || d.status === 'generating')`. Stops automatically when no processing drafts.
16. **Upload does NOT auto-trigger generate** — BY DESIGN. Upload only does upload + extraction. Guru manually clicks "Generate AI" in Draft AI page.
17. **Dynamic pricing hides margin** — UI shows "Biaya bervariasi sesuai panjang dokumen". Never show Rp85/generate or margin percentage.
18. **`git add -A` includes unrelated files** — the `skills/` directory has deleted files from other sessions. Only stage files you actually changed.

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

Read `prd/PRD-MATERI-SOAL-COVERAGE.md` for the full plan. See `prd/TODO-MASTER.md` for task tracking.

## ⚠️ CRITICAL: NEVER kill/restart Chrome with --remote-debugging-port — will destroy all Chrome profiles and log out all accounts. Use chrome_local only.