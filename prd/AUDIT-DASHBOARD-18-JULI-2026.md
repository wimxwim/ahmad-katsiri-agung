# AUDIT DASHBOARD — 18 Juli 2026 (v4 FINAL · PRE-FLIGHT CORRECTED)

> **Sumber:** 2 audit independen + verifikasi kode + pre-flight check (build, schema, endpoint)
> **Total:** 101 temuan terverifikasi — 9 Critical · 22 High · 41 Medium · 29 Low
> **5 FALSE ALARM dihapus:** C5 (guru/kursus), C6 (token endpoint), C12 (handleInvite), H14 (XSS), H20 (partial state)

---

## 🔴 CRITICAL (9) — VERIFIED + PRE-FLIGHT CORRECTED

### C1 — `kunci` jawaban dikirim ke client di CBT detail endpoint
**File:** `src/app/api/v1/siswa/quiz/[id]/route.ts` (CBT detail endpoint)
**Bukti:** `soalPublished` table punya kolom `kunci` (schema.ts:978). CBT endpoint kirim soal + kunci ke QuizEngine.
**Koreksi Pre-Flight:** `quizPublished` TIDAK punya kolom `kunci`. `...q` di dashboard/quiz list endpoint aman. Yang bocor adalah CBT detail endpoint yang mengirim data `soalPublished` (termasuk `kunci`) ke client.
**Risiko:** 🔴 Siswa bisa lihat jawaban CBT via DevTools di halaman ujian. Melanggar aturan AGENTS.md.
**Dampak Positif:** CBT benar-benar ujian tanpa kunci tersedia di client.
**Dampak Negatif:** Perlu bedakan response CBT vs BELAJAR — hanya kirim `kunci` untuk mode BELAJAR.
**Fix:** Di CBT detail endpoint, hapus `kunci` dari response untuk mode ULANGAN/CBT. Hanya kirim `kunci` untuk mode BELAJAR.

### C2 — Semua 8 file API route MISSING `export const runtime = "nodejs"`
**File:** `guru/dashboard`, `guru/siswa`, `guru/drafts`, `guru/kelas`, `siswa/dashboard`, `siswa/materi`, `siswa/progres`, `siswa/quiz`
**Bukti:** 0 dari 8 file punya deklarasi. Hanya 6 file di seluruh codebase yang punya (kursus, katalog, pengumuman, support, audit, cron).
**Risiko:** 🔴 Next.js 16 bisa default ke Edge Runtime → `cookies is not defined`, Redis crash, Drizzle crash.
**Dampak Positif:** Mencegah crash production di Edge Runtime.
**Dampak Negatif:** Tidak ada — 1 baris per file, zero risk.
**Fix:** Tambah `export const runtime = "nodejs";` di setiap file route.

### C3 — QuizEngine tidak bedakan mode BELAJAR/ULANGAN/CBT
**File:** `src/components/siswa/QuizEngine.tsx` + `src/app/siswa/cbt/[id]/page.tsx:26-41`
**Bukti:** `QuizData` interface tidak punya `modeEvaluasi`. `mapToEngine` drop field ini. Tidak ada referensi `BELAJAR`, `ULANGAN`, atau `CBT` di seluruh QuizEngine (457 baris).
**Risiko:** 🔴 Feedback real-time muncul di SEMUA mode termasuk CBT. Siswa lihat jawaban benar saat ujian.
**Dampak Positif:** CBT jadi benar-benar ujian (tanpa feedback). BELAJAR tetap ada feedback.
**Dampak Negatif:** Perlu restruktur props QuizEngine. Perlu test CBT + BELAJAR.
**Fix:** Tambah `modeEvaluasi` ke `QuizData` + `mapToEngine`. Gate feedback + jawabanBenar dengan `modeEvaluasi === "BELAJAR"`.

### C4 — QuizEngine `startQuiz` fire-and-forget
**File:** `src/components/siswa/QuizEngine.tsx:136-139`
**Bukti:** `fetch(...).catch(() => { /* fire-and-forget */ })` — tidak await, tidak error handling.
**Risiko:** 🔴 Jika `/start` gagal, submit juga gagal (server cek cache key). Kerjaan siswa hilang.
**Dampak Positif:** Mencegah siswa kehilangan jawaban setelah mengerjakan quiz.
**Dampak Negatif:** UX — perlu loading state sebelum quiz mulai. Tambah ~200ms latency.
**Fix:** Await start, tampilkan error + retry kalau gagal.

### C5 — `router.refresh()` tidak re-fetch data client-side (2+ halaman)
**File:** `src/app/guru/kursus/page.tsx:131`, `src/app/guru/nilai/page.tsx:57`
**Bukti:** `onClick={() => router.refresh()}` — ini hanya re-render Server Components. Halaman "use client".
**Risiko:** 🔴 Tombol "Coba lagi" = no-op. User stuck di error state permanen.
**Dampak Positif:** Retry button berfungsi. User bisa recover dari error.
**Dampak Negatif:** Tidak ada — ganti 1 baris per file.
**Fix:** Ganti retry button dengan `setLoading(true); fetchData()`.

### C6 — Profil siswa 404
**File:** `src/app/siswa/SiswaLayoutClient.tsx:73`
**Bukti:** `profileHref="/siswa/profil"` — directory `src/app/siswa/profil/` tidak ada.
**Risiko:** 🔴 Klik avatar = 404. User bingung.
**Dampak Positif:** Navigasi berfungsi. Siswa bisa lihat data diri.
**Dampak Negatif:** Perlu buat halaman baru (atau redirect ke beranda — lebih murah).
**Fix:** Redirect `/siswa/profil` ke `/siswa/beranda` atau buat halaman profil.

### C7 — `copyInvite` tanpa try/catch → unhandled promise rejection
**File:** `src/app/guru/kelas/page.tsx:41-42`
**Bukti:** `await navigator.clipboard.writeText(link)` tanpa wrapper try/catch.
**Risiko:** 🔴 Non-HTTPS atau browser lama → crash. `setCopied` tidak dipanggil.
**Dampak Positif:** Copy link tetap berfungsi dengan graceful error handling.
**Dampak Negatif:** Tidak ada — tambah 3 baris try/catch.
**Fix:** Bungkus dengan try/catch, tampilkan toast error.

### C8 — `SubscriptionLockedError` ditelan sebagai 500
**File:** `src/app/api/v1/guru/kelas/route.ts:66-70`
**Bukti:** Catch block hanya cek `GuardError`. `SubscriptionLockedError` tidak ada di file.
**Risiko:** 🔴 User suspended dapat 500 (bukan 403). Tidak tahu kenapa gagal.
**Dampak Positif:** Error message yang jelas untuk suspended user.
**Dampak Negatif:** Tidak ada — tambah 1 kondisi if.
**Fix:** Tambah `if (e instanceof SubscriptionLockedError) return apiError(e.message, 403)`.

### C9 — IP-based rate limiting bisa return `"unknown"` (DoS vector)
**File:** `src/lib/rate-limit.ts:159-170`, `guru/drafts/route.ts:13-14`
**Bukti:** `ipFromRequest` return `"unknown"` jika tidak ada header proxy. Semua user share bucket.
**Risiko:** 🔴 Satu user bisa exhaust rate limit untuk semua user (tanpa proxy headers).
**Dampak Positif:** Rate limit per-user yang adil. Tidak bisa di-DoS.
**Dampak Negatif:** Ganti strategi rate limit di 2 endpoint.
**Fix:** Fallback ke user-based rate limiting (`checkRateLimitPerUser`).

---

## 🟠 HIGH (22)

### H1 — GradebookTable `siswaQuizMap` selalu empty
**File:** `src/app/guru/kursus/[id]/nilai/page.tsx:109`
**Bukti:** `<GradebookTable siswa={gradebookSiswa} quizzes={["Kuis"]} siswaQuizMap={new Map()} />` — hardcoded empty Map.
**Fix:** Fetch data quiz dari API, populate `siswaQuizMap`.

### H2 — Cache tidak invalidate setelah mutation (Siswa)
**File:** `src/app/siswa/` (beranda, materi, quiz)
**Fix:** Panggil `invalidateCache` + trigger refetch setelah setiap mutation sukses.

### H3 — Invite konsumsi tidak refresh dashboard
**File:** `src/app/siswa/beranda/page.tsx`
**Fix:** Panggil `fetchData()` setelah `consumeInvite` sukses.

### H4 — Beranda siswa double fetch (`userId` cycle)
**File:** `src/app/siswa/beranda/page.tsx`
**Fix:** Pisahkan userId dari dependency fetchData, atau gunakan ref.

### H5 — `fetchData` recursive retry pakai stale closure (Guru Beranda)
**File:** `src/app/guru/beranda/page.tsx:233-242`
**Fix:** Gunakan useCallback atau pindahkan fetchData ke luar component.

### H6 — Empty state Beranda Guru cek `totalKursus === 0` saja
**File:** `src/app/guru/beranda/page.tsx:290`
**Fix:** Cek apakah user punya aktivitas APAPUN (siswa, draft, kelas, kursus).

### H7 — Progress bar beranda guru hardcoded `/5`
**File:** `src/app/guru/beranda/page.tsx:517`
**Bukti:** `Math.min((data.draftMenunggu / 5) * 100, 100)` — hardcoded divisor.
**Fix:** Gunakan total draft (draftMenunggu + draftSelesai) sebagai denominator.

### H8 — Token balance stale setelah generate AI
**File:** `src/app/guru/drafts/page.tsx:44-49`
**Fix:** Refresh balance setelah generate/topup sukses + useTabFocus.

### H9 — Race condition `busyRef` vs `busy` di draft detail
**File:** `src/app/guru/drafts/[id]/page.tsx:79-80`
**Fix:** Set `busyRef.current` langsung di `setBusy()`, bukan di `useEffect`.

### H10 — `window.location.href` redirect di drafts (hard reload)
**File:** `src/app/guru/drafts/page.tsx:62-67`
**Fix:** Gunakan `router.push()`.

### H11 — Beranda guru: error onboarding API di-silent
**File:** `src/app/guru/beranda/page.tsx:248-250`
**Fix:** Set error state atau fallback ke localStorage.

### H12 — Client-side fallback scoring rusak untuk CBT/ULANGAN
**File:** `src/components/siswa/QuizEngine.tsx:204-213`
**Bukti:** Catch block submit panggil `hitungSkor()` lokal. `kunci` = `""` untuk CBT.
**Fix:** Jangan fallback ke client scoring untuk CBT/ULANGAN. Tampilkan error + retry.

### H13 — `markSelesai` tidak reset `showConfirm` saat error
**File:** `src/app/siswa/materi/[id]/page.tsx`
**Fix:** Reset `showConfirm` di catch block.

### H14 — Halaman kursus siswa: `nama` field salah mapping
**File:** `src/app/siswa/kursus/page.tsx`
**Fix:** Join ke `users` sebagai guru (via `kursus.guruId`).

### H15 — Dashboard siswa fetch tanpa CSRF headers
**File:** `src/app/siswa/beranda/page.tsx`
**Fix:** Gunakan `csrfHeaders()` atau migrate ke `apiFetch`.

### H16 — Halaman Kursus Guru pakai raw `fetch`, bukan `apiFetch`
**File:** `src/app/guru/kursus/page.tsx`
**Fix:** Migrasi ke `apiFetch`.

### H17 — Halaman Drafts pakai raw `fetch`, bukan `apiFetch`
**File:** `src/app/guru/drafts/page.tsx`
**Fix:** Migrasi ke `apiFetch`.

### H18 — Halaman Nilai pakai raw `fetch`, bukan `apiFetch`
**File:** `src/app/guru/nilai/page.tsx`
**Fix:** Migrasi ke `apiFetch`.

### H19 — Race condition filter siswa (no AbortController)
**File:** `src/app/guru/siswa/page.tsx:51-53`
**Bukti:** Tidak ada `AbortController` atau `signal` di seluruh file (224 baris).
**Fix:** Tambah AbortController, batalkan request sebelumnya.

### H20 — Materi halaman siswa fetch `kursusList` dari API dashboard (coupling)
**File:** `src/app/siswa/materi/page.tsx:88-106`
**Fix:** Buat atau gunakan endpoint khusus `kursusList`.

### H21 — Drafts polling bisa tumpuk (request storm)
**File:** `src/app/guru/drafts/page.tsx:135-140`
**Fix:** Tambah guard `isLoading` sebelum panggil `load()`.

### H22 — Code duplication `fetchQuiz` di dashboard + quiz routes
**File:** `siswa/dashboard/route.ts` (line 205-258) ≈ `siswa/quiz/route.ts` (line 25-75)
**Fix:** Extract ke shared helper `src/lib/quiz-helpers.ts`.

---

## 🟡 MEDIUM (41)

### Guru (22)
| # | File | Masalah |
|---|------|---------|
| M1 | `guru/siswa/page.tsx:41` | `result.raw as` cast — unsafe type assertion |
| M2 | `guru/siswa/page.tsx:60` | `riskStatus: null` dikategorikan "aman" |
| M3 | `guru/siswa/page.tsx:43` | `kursusOptions` stale saat filter |
| M4 | `guru/siswa/route.ts:67-69` | Filtering `kursusId` client-side AFTER limit/offset |
| M5 | `guru/analytics/page.tsx:113` | `noData` check terlalu agresif |
| M6 | `guru/analytics/page.tsx:206` | `rataNilaiKeseluruhan > 0` blokir insight |
| M7 | `guru/upload/page.tsx:79` | Auto-select kursus overwrite user choice |
| M8 | `guru/kelas/page.tsx:82` | `handleDelete` tidak ada loading state |
| M9 | `guru/kelas/page.tsx` | Edit form tidak ada client-side validation |
| M10 | `guru/nilai/page.tsx` | Halaman hanya daftar kursus, bukan nilai |
| M11 | `guru/nilai/page.tsx` | `SELECT *` tanpa kolom selection |
| M12 | `guru/profil/page.tsx:72` | `handleDonate` POST tanpa body |
| M13 | `guru/onboarding/page.tsx:87` | Fire-and-forget POST — desync server |
| M14 | `guru/onboarding/page.tsx:71` | `auto` parameter tidak diimplementasikan |
| M15 | `guru/siswa/[id]/page.tsx:186` | `pL` calculation ambiguous |
| M16 | `guru/siswa/[id]/page.tsx:205` | "Kirim Tugas Remedial" hanya navigasi |
| M17 | `guru/kursus/[id]/page.tsx:38` | Aggregasi client-side rawan error |
| M18 | `guru/kursus/[id]/page.tsx:125` | `quizSelesaiCount` bisa string |
| M19 | `guru/buat/page.tsx:9` | Slug collision tidak ditangani |
| M20 | `guru/buat/page.tsx:104` | Dropdown kelas hardcoded |
| M21 | `guru/drafts/[id]/published/page.tsx:26` | `admin_sekolah` tidak diizinkan |
| M22 | `guru/topup/page.tsx:136` | Stale `balance` di closure |

### Siswa (13)
| # | File | Masalah |
|---|------|---------|
| M23 | `siswa/materi/page.tsx` | `welcome` param stay di URL |
| M24 | `siswa/materi/page.tsx` | `handleFilterClick` pakai pathname |
| M25 | `siswa/materi/page.tsx` | `handleRetry` duplikasi fetch logic |
| M26 | `siswa/materi/[id]/page.tsx` | `nextId` bergantung `urutan` |
| M27 | `siswa/materi/[id]/page.tsx` | `markSelesai` selalu progress 100 |
| M28 | `siswa/quiz/page.tsx` | Semua quiz link ke `/siswa/cbt/` |
| M29 | `siswa/progres/page.tsx` | `totalSelesai` label misleading |
| M30 | `siswa/kursus/page.tsx` | `status` raw DB value |
| M31 | `siswa/kursus/page.tsx` | Tidak ada kursus detail page |
| M32 | `siswa/pengumuman/page.tsx` | `target` field tidak ditampilkan |
| M33 | `siswa/pengumuman/page.tsx` | Tidak ada retry button |
| M34 | `siswa/payment/page.tsx` | Orphaned — tidak ada link |
| M35 | `siswa/SiswaLayoutClient.tsx` | `KatalogKursusBar` hilang konteks dashboard |

### API/Infra (6)
| # | File | Masalah |
|---|------|---------|
| M36 | Semua API | Inconsistent rate limiting (3 strategi) |
| M37 | Semua API | Inconsistent `Cache-Control` (6 endpoint missing) |
| M38 | Semua API | Inconsistent response format (no `apiSuccess`) |
| M39 | `guru/kursus/[id]/progres` | `requireRole` exclude `admin_sekolah` |
| M40 | `siswa/dashboard` | Double caching (Redis + HTTP) |
| M41 | `siswa/dashboard` | `fetchPengumuman` bisa leak cross-course |

---

## 🟢 LOW (29)

### Guru (16)
| # | File | Masalah |
|---|------|---------|
| L1 | `guru/layout.tsx` | Session tidak di-pass ke client |
| L2 | `guru/page.tsx` | Duplikasi auth logic |
| L3 | `guru/layout.tsx` | `alive` flag pattern tidak konsisten |
| L4 | `guru/siswa/page.tsx` | `setLoading(true)` redundan |
| L5 | `guru/analytics/page.tsx` | Double-nested height bar chart |
| L6 | `guru/upload/page.tsx` | `pickFile` reset tanpa konfirmasi |
| L7 | `guru/kelas/page.tsx` | `handleUpdate` no loading state |
| L8 | `guru/nilai/page.tsx` | Raw `fetch` tanpa CSRF |
| L9 | `guru/sertifikat/page.tsx` | `generated` timeout konflik |
| L10 | `guru/profil/page.tsx` | Logout error diabaikan |
| L11 | `guru/onboarding/page.tsx` | `reset()` tidak sinkron |
| L12 | `guru/test-math/page.tsx` | Test page di production |
| L13 | `guru/kursus/page.tsx` | Inconsistent API client |
| L14 | `guru/upload/page.tsx` | CSRF headers tidak selalu |
| L15 | `guru/drafts/page.tsx` | No refresh token balance |
| L16 | `guru/beranda/page.tsx` | `retryCount` tidak di-reset |

### Siswa (13)
| # | File | Masalah |
|---|------|---------|
| L17 | `siswa/materi/page.tsx` | `progressPersen: 0` = "Baru" |
| L18 | `siswa/materi/[id]/page.tsx` | `r.json()` 2x saat error |
| L19 | `siswa/quiz/page.tsx` | `nilaiTerbaik != null` loose |
| L20 | `siswa/quiz/page.tsx` | `modeBadge` null unknown |
| L21 | `siswa/cbt/[id]/page.tsx` | Loading animate-pulse |
| L22 | `siswa/cbt/[id]/page.tsx` | No CSRF headers |
| L23 | `siswa/kursus/page.tsx` | No cache |
| L24 | `siswa/progres/page.tsx` | No cache |
| L25 | `siswa/progres/page.tsx` | `durasiDetik` no hours |
| L26 | `siswa/pengumuman/page.tsx` | No cache |
| L27 | `siswa/pengumuman/page.tsx` | Pinned no visual |
| L28 | `siswa/beranda/page.tsx` | Metrik side-by-side misleading |
| L29 | `siswa/SiswaLayoutClient.tsx` | `FloatingActionMenu` opaque |

---

## 🔗 CROSS-CUTTING: Guru ↔ Siswa Sync Gap

| # | Gap | Impact |
|---|-----|--------|
| CS1 | Guru upload materi → siswa tidak dapat notifikasi real-time | Cache stale 30-60 detik |
| CS2 | Guru publish quiz → QuizEngine tidak tahu mode | CBT feedback bocor |
| CS3 | Siswa selesai quiz → GradebookTable guru kosong | Guru tidak bisa lihat nilai |
| CS4 | Siswa tandai materi selesai → Progress guru tidak update | Guru lihat progress stale |
| CS5 | Guru invite siswa → Dashboard siswa tidak refresh | Siswa lihat `terdaftar: false` |
| CS6 | Inconsistent API client (guru apiFetch, siswa raw fetch) | Error handling berbeda |

---

## 📊 PRE-FLIGHT CHECK SUMMARY

| Check | Hasil |
|-------|-------|
| **Build** | ✅ OK — 94 halaman, zero error |
| **Schema** | ✅ `kunci` di `soalPublished` (bukan `quizPublished`) |
| **Endpoint guru/kursus** | ✅ `/api/v1/kursus` ADA, properly scoped → C5 FALSE |
| **Endpoint token/balance** | ✅ `/api/v1/token/balance` ADA, berfungsi (duplikasi, bukan broken) |
| **Database** | ✅ 1 user (AKA CHANNEL), bersih, siap test |

---

## 🎯 Rencana Perbaikan (Prioritas + Jam)

| Prioritas | Item | Estimasi | Risk |
|-----------|------|----------|------|
| **P0** | C1: Fix kunci di CBT endpoint (hapus kunci untuk CBT/ULANGAN) | 30 min | LOW |
| **P0** | C2: Tambah `runtime = "nodejs"` 8 file | 15 min | ZERO |
| **P0** | C3+C4: QuizEngine mode + startQuiz await | 2 jam | MEDIUM |
| **P0** | C5-C9: 5 critical fixes (router, profil, copy, subscription, rate limit) | 1 jam | ZERO-LOW |
| **P1** | H1: GradebookTable populate | 30 min | LOW |
| **P1** | H2-H4: Cache invalidation + refresh | 1 jam | MEDIUM |
| **P1** | H5-H11: Beranda guru fixes | 1.5 jam | LOW |
| **P1** | H12-H15: QuizEngine + materi + CSRF | 1 jam | MEDIUM |
| **P1** | H16-H22: Standardize apiFetch + race condition | 1.5 jam | LOW |
| **P2** | M1-M41: Medium items | 3 jam | LOW |
| **P3** | L1-L29: Low items | 2 jam | ZERO |
| **P4** | Build + Deploy + Test | 30 min | ZERO |

**Total estimasi:** 14.5 jam kerja. 6 agent paralel = ~2.5 jam.

---

## 📊 FALSE ALARMS (dihapus setelah verifikasi)

| ID | Temuan | Kenapa FALSE |
|----|--------|-------------|
| ~~C5~~ | guru/kursus endpoint missing | `/api/v1/kursus` ADA & properly scoped ke `guruId` |
| ~~C6~~ | Token endpoint salah | `/api/v1/token/balance` ADA & berfungsi (duplikasi, bukan broken) |
| ~~C12~~ | `handleInvite` error object | API selalu return `apiError(string)` → `j.error` selalu string |
| ~~H14~~ | `dangerouslySetInnerHTML` XSS | Materi dirender via `{materi.konten}` (JSX auto-escape) |
| ~~H20~~ | `handlePublish` partial state | Pakai functional setState + spread — pattern React yang benar |

---

> **Dibuat:** 18 Juli 2026 · **Pre-Flight:** Build ✅ · Schema ✅ · Endpoint ✅ · DB ✅
> **5 FALSE ALARM dihapus** · **101 temuan final** · **Siap eksekusi**