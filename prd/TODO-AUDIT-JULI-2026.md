# TODO AUDIT JULI 2026 — 47 Task, 7 Fase

> **Dibuat:** 14 Juli 2026
> **Tim:** Frontend + Backend
> **Sumber:** Diskusi intensif + audit codebase + laporan-padat.md + DESIGN.md + PRD existing

---

## FASE 0: CRITICAL — Rate Limit + Error Handling (8 task)

| # | Task | File | Masalah |
|:--:|------|------|---------|
| 0.1 | Naikkan rate limit `kelas-list` | `api/v1/guru/kelas/route.ts` | 30/15s → 60/30s |
| 0.2 | Naikkan rate limit `drafts-list` | `api/v1/guru/drafts/route.ts` | 30/60s → 60/60s |
| 0.3 | Naikkan rate limit `dashboard` | `api/v1/guru/dashboard/route.ts` | 10/60s → 20/60s |
| 0.4 | Frontend: bedakan 429 vs 500 di Draft AI | `guru/drafts/page.tsx` | `res.status === 429` → "Terlalu banyak request" |
| 0.5 | Frontend: bedakan 429 di Kelas | `guru/kelas/page.tsx` | Sama |
| 0.6 | Frontend: bedakan 429 di Dashboard | `guru/beranda/page.tsx` | Sama |
| 0.7 | Frontend: bedakan 429 di Siswa | `guru/siswa/page.tsx` | Sama |
| 0.8 | Frontend: tambah Retry-After countdown | Semua halaman guru | `retryAfter` header → tampilkan countdown |

## FASE 1: AI MODEL SWITCH (6 task)

| # | Task | File | Detail |
|:--:|------|------|--------|
| 1.1 | Ganti default model `getModelName()` | `src/lib/ai.ts` | `gpt-5.6-luna` → `deepseek-v4-flash-bynara` |
| 1.2 | Hapus `MODELS_WITHOUT_TEMP` set | `src/lib/ai.ts` | DeepSeek support temperature dgn `thinking:disabled` |
| 1.3 | Tambah `thinking: {type: "disabled"}` | `src/lib/ai.ts` | Auto-detect DeepSeek → inject thinking param |
| 1.4 | Update `fallbackAiResults()` | `src/lib/ai-generator.ts` | Terima dynamic `soalCount`/`quizCount` |
| 1.5 | Update `.env.local` | `.env.local` | `AI_MODEL=deepseek-v4-flash-bynara` |
| 1.6 | Update Vercel env | Vercel Dashboard | `AI_MODEL=deepseek-v4-flash-bynara` |

## FASE 2: UPLOAD → GENERATE FLOW (7 task)

| # | Task | File | Detail |
|:--:|------|------|--------|
| 2.1 | Fix upload response: tambah `redirectTo` | `api/v1/guru/uploads/route.ts` | `redirectTo: "/guru/drafts"` + `generationId` |
| 2.2 | Upload page: auto-redirect toast | `guru/upload/page.tsx` | Toast + tombol "Lihat Draft AI →" |
| 2.3 | Draft detail: "Generate Semua" button | `guru/drafts/[id]/page.tsx` | 1 klik → materi+quiz+soal |
| 2.4 | Draft detail: jumlah soal selector | `guru/drafts/[id]/page.tsx` | Input: PG[15-35], Isian[5-15], Essay[5-15] |
| 2.5 | Draft detail: progress bar real-time | `guru/drafts/[id]/page.tsx` | Polling setiap 3 detik |
| 2.6 | Draft detail: "Approve & Publish Semua" | `guru/drafts/[id]/page.tsx` | 1 klik publish semua |
| 2.7 | Commit `input-materi.ts` changes | `scripts/input-materi.ts` | Prompt match schema + bynara default |

## FASE 3: MATH RENDERING (5 task)

| # | Task | File | Detail |
|:--:|------|------|--------|
| 3.1 | Install KaTeX | `package.json` | `npm install katex @types/katex` |
| 3.2 | Buat `MathRenderer` component | `src/components/ui/MathRenderer.tsx` | Deteksi `$...$` + `$$...$$` → SSR-safe |
| 3.3 | CSP audit + update | `workers/akal-center/index.ts` | Verifikasi `style-src 'unsafe-inline'` cukup |
| 3.4 | Inject MathRenderer ke QuizEngine | `src/components/siswa/QuizEngine.tsx` | Render math di pertanyaan + opsi |
| 3.5 | Halaman test math | `guru/test-math/page.tsx` | Test semua rumus |

## FASE 4: QUIZ ENGINE PORT (9 task)

| # | Task | File | Detail |
|:--:|------|------|--------|
| 4.1 | Buat `QuizEngine.tsx` | `src/components/siswa/QuizEngine.tsx` | Port dari old repo |
| 4.2 | State machine | `QuizEngine.tsx` | `login` → `intro` → `playing` → `result` |
| 4.3 | Soal-per-soal + AnimatePresence | `QuizEngine.tsx` | `currentIndex` + smooth transition |
| 4.4 | Feedback instan | `QuizEngine.tsx` | Hijau/merah setelah pilih |
| 4.5 | Timer + auto-submit | `QuizEngine.tsx` | Countdown + refs |
| 4.6 | Navigasi cepat (1-35) | `QuizEngine.tsx` | Klik nomor lompat |
| 4.7 | Support ISIAN + ESSAY | `QuizEngine.tsx` | Input text + textarea |
| 4.8 | Buat `QuizResult.tsx` | `src/components/siswa/QuizResult.tsx` | Skor + remedial + review |
| 4.9 | Update CBT page | `siswa/cbt/[id]/page.tsx` | Ganti UI lama → QuizEngine + QuizResult |

## FASE 5: GURU ANALYTICS DASHBOARD (5 task)

| # | Task | File | Detail |
|:--:|------|------|--------|
| 5.1 | Risk Score card | `guru/beranda/page.tsx` | "Siswa Berisiko: 5" + badge warna |
| 5.2 | Weak Topics card | `guru/beranda/page.tsx` | Topik dgn error rate tertinggi |
| 5.3 | BKT mastery chart | `src/components/guru/MasteryChart.tsx` | Progress bar P(L) per skill |
| 5.4 | Detail siswa + remedial | `guru/siswa/[id]/page.tsx` | BKT + Risk + tombol remedial |
| 5.5 | Filter siswa by risk | `guru/siswa/page.tsx` | Dropdown: Semua/Aman/Pantau/Berisiko/Kritis |

## FASE 6: POLISH + DEPLOY (5 task)

| # | Task | File | Detail |
|:--:|------|------|--------|
| 6.1 | Loading/Empty/Error states | Semua halaman | Skeleton, illustration, retry |
| 6.2 | RTL Arabic test | Soal Arab | `dir="rtl"` + font Amiri |
| 6.3 | Aksesibilitas audit | Semua UI baru | WCAG 2.2 AA |
| 6.4 | `npm run build` | — | Zero errors |
| 6.5 | Deploy Vercel + Worker | — | `vercel --prod` + `wrangler deploy` |

## FASE 7: DOCUMENTATION (2 task)

| # | Task | File | Detail |
|:--:|------|------|--------|
| 7.1 | Update `AGENTS.md` | `AGENTS.md` | Koreksi fakta: randomUUID, CRON_SECRET, buildQuizSystemPrompt |
| 7.2 | Update `laporan-padat.md` | `laporan-padat.md` | Tandai model switch completed |

---

## RINGKASAN

| Fase | Nama | Task |
|:----:|------|:----:|
| 0 | Rate Limit + Error Handling | 8 |
| 1 | AI Model Switch | 6 |
| 2 | Upload → Generate Flow | 7 |
| 3 | Math Rendering | 5 |
| 4 | Quiz Engine Port | 9 |
| 5 | Guru Analytics | 5 |
| 6 | Polish + Deploy | 5 |
| 7 | Documentation | 2 |
| **TOTAL** | | **47** |