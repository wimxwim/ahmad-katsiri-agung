# AUDIT DASHBOARD — 18 Juli 2026

> Audit menyeluruh dashboard Guru (56 file) & Siswa (35 file) AKAL Center.
> **Total: 90 temuan** — 6 Critical, 12 High, 36 Medium, 36 Low.
> Fokus: bug, data inconsistency, cache staleness, auth gap, race condition.

---

## 🔴 CRITICAL (6)

### C1 — QuizEngine tidak bedakan mode BELAJAR/ULANGAN/CBT
**File:** `src/components/siswa/QuizEngine.tsx`
**Dampak:** Feedback real-time (benar/salah) selalu muncul, termasuk di mode CBT/ULANGAN.
Ini melanggar aturan CBT — siswa seharusnya tidak lihat jawaban benar saat ujian.
**Akar:** `QuizEngineProps` tidak punya prop `modeEvaluasi`. Engine tidak tahu mode quiz.
**Fix:** Tambah `modeEvaluasi` ke props, conditional `showFeedback` hanya untuk BELAJAR.

### C2 — QuizEngine `startQuiz` fire-and-forget
**File:** `src/components/siswa/QuizEngine.tsx`
**Dampak:** Jika POST `/api/v1/siswa/quiz/[id]/start` gagal, submit juga gagal (server cek cache key start). Kerjaan siswa hilang.
**Fix:** Await start, tampilkan error + retry kalau gagal.

### C3 — Profil siswa 404
**File:** `src/app/siswa/SiswaLayoutClient.tsx`
**Dampak:** `profileHref="/siswa/profil"` — halaman tidak ada. Klik avatar = 404.
**Fix:** Buat halaman `/siswa/profil` atau arahkan ke `/siswa/beranda`.

### C4 — Beranda siswa double fetch (`userId` cycle)
**File:** `src/app/siswa/beranda/page.tsx`
**Dampak:** Dashboard selalu fetch 2x saat first load karena dependency cycle `userId` → `fetchData` → `useEffect`.
**Fix:** Pisahkan userId dari dependency fetchData, atau gunakan ref.

### C5 — Cache tidak invalidate setelah mutation
**File:** `src/app/siswa/` (beranda, materi, quiz)
**Dampak:** Setelah siswa tandai materi selesai / selesai quiz / konsumsi invite, cache tetap stale 30-60 detik.
Hanya invalidate saat tab focus.
**Fix:** Panggil `invalidateCache` setelah setiap mutation sukses.

### C6 — Invite konsumsi tidak refresh dashboard
**File:** `src/app/siswa/beranda/page.tsx`
**Dampak:** Siswa join kelas via invite, lihat pesan "Berhasil", tapi dashboard tetap `terdaftar: false`.
**Fix:** Panggil `fetchData()` setelah `consumeInvite` sukses.

---

## 🟠 HIGH (12)

### H1 — GradebookTable `siswaQuizMap` selalu empty
**File:** `src/app/guru/kursus/[id]/nilai/page.tsx:109`
**Dampak:** `<GradebookTable siswa={gradebookSiswa} quizzes={["Kuis"]} siswaQuizMap={new Map()} />` — data quiz per-siswa tidak muncul.
**Fix:** Fetch data quiz dari API, populate `siswaQuizMap`.

### H2 — Token balance stale setelah generate AI
**File:** `src/app/guru/drafts/page.tsx:44-49`
**Dampak:** Balance di-fetch sekali saat mount, tidak refresh setelah transaksi. Guru salah baca saldo.
**Fix:** Refresh balance setelah generate/topup sukses.

### H3 — Progress bar beranda guru hardcoded `/5`
**File:** `src/app/guru/beranda/page.tsx:517`
**Dampak:** `Math.min((data.draftMenunggu / 5) * 100, 100)` — jika draft > 5, bar selalu 100%.
**Fix:** Gunakan total draft (draftMenunggu + draftSelesai) sebagai denominator.

### H4 — Race condition `busyRef` vs `busy` di draft detail
**File:** `src/app/guru/drafts/[id]/page.tsx:79-80`
**Dampak:** `busyRef.current` selalu 1 render di belakang `busy`. Polling bisa jalan saat mutation.
**Fix:** Set `busyRef.current` langsung di `setBusy()`, bukan di `useEffect`.

### H5 — `window.location.href` redirect di drafts
**File:** `src/app/guru/drafts/page.tsx:62-67`
**Dampak:** `setTimeout(() => window.location.href = "/guru/topup", 2000)` — tidak cancelable, navigasi paksa.
**Fix:** Gunakan `router.push()` atau `useEffect` dengan state.

### H6 — Beranda guru: error onboarding API di-silent
**File:** `src/app/guru/beranda/page.tsx:248-250`
**Dampak:** Jika onboarding API gagal, tidak ada error. User tidak tahu data stale.
**Fix:** Set error state atau fallback ke localStorage.

### H7 — `mapToEngine` hilangkan `modeEvaluasi`
**File:** `src/app/siswa/cbt/[id]/page.tsx`
**Dampak:** `mapToEngine` hanya pass `{ id, judul, durasiMenit, totalSoal, soal }` — mode hilang.
QuizEngine tidak bisa bedakan BELAJAR/ULANGAN/CBT.
**Fix:** Tambah `modeEvaluasi` ke return `mapToEngine`.

### H8 — Client-side fallback scoring rusak untuk CBT/ULANGAN
**File:** `src/components/siswa/QuizEngine.tsx` — `hitungSkor()`
**Dampak:** Saat server submit gagal, fallback ke client-side scoring. `kunci` = `""` untuk CBT → semua jawaban dianggap salah.
**Fix:** Jangan fallback ke client scoring untuk CBT/ULANGAN. Tampilkan error + retry.

### H9 — `markSelesai` tidak reset `showConfirm` saat error
**File:** `src/app/siswa/materi/[id]/page.tsx`
**Dampak:** Error muncul tapi tombol "Tandai Selesai" tetap bisa diklik — UI state rusak.
**Fix:** Reset `showConfirm` di catch block.

### H10 — Materi konten raw HTML — potential XSS
**File:** `src/app/siswa/materi/[id]/page.tsx`
**Dampak:** `materi.konten` dirender via `<div className="prose" dangerouslySetInnerHTML>` — jika AI-generated content tidak disanitasi.
**Fix:** Pastikan server-side sanitizer berjalan, atau gunakan DOMPurify client-side.

### H11 — Halaman kursus siswa: `nama` field salah mapping
**File:** `src/app/siswa/kursus/page.tsx`
**Dampak:** API join users pada `siswaId` → `nama` = nama siswa sendiri (bukan guru). Field tidak digunakan.
**Fix:** Join ke `users` sebagai guru (via `kursus.guruId`) untuk dapat nama guru.

### H12 — Dashboard siswa fetch tanpa CSRF headers
**File:** `src/app/siswa/beranda/page.tsx`
**Dampak:** Raw `fetch` tanpa `csrfHeaders()`. Akan break jika CSRF validation diaktifkan.
**Fix:** Gunakan `csrfHeaders()` atau migrate ke `apiFetch`.

---

## 🟡 MEDIUM (36)

### Guru (22)
| # | File | Masalah |
|---|------|---------|
| M1 | `guru/siswa/page.tsx:60` | `riskStatus: null` dikategorikan "aman" — sembunyikan siswa bermasalah |
| M2 | `guru/siswa/page.tsx:43` | `kursusOptions` stale saat filter — tidak refresh |
| M3 | `guru/analytics/page.tsx:113` | `noData` check terlalu agresif — `totalKursus === 0` saja |
| M4 | `guru/analytics/page.tsx:206` | `rataNilaiKeseluruhan > 0` blokir insight section |
| M5 | `guru/upload/page.tsx:79` | Auto-select kursus bisa overwrite user choice |
| M6 | `guru/kelas/page.tsx:82` | `handleDelete` tidak ada loading state |
| M7 | `guru/nilai/page.tsx` | Halaman hanya daftar kursus, bukan nilai — misleading |
| M8 | `guru/profil/page.tsx:72` | `handleDonate` POST tanpa body |
| M9 | `guru/onboarding/page.tsx:87` | Fire-and-forget POST — desync server |
| M10 | `guru/onboarding/page.tsx:71` | `auto` parameter tidak diimplementasikan |
| M11 | `guru/siswa/[id]/page.tsx:186` | `pL` calculation ambiguous — /100 atau tidak? |
| M12 | `guru/siswa/[id]/page.tsx:205` | "Kirim Tugas Remedial" hanya navigasi ke drafts |
| M13 | `guru/kursus/[id]/page.tsx:38` | Aggregasi client-side dari log per-jawaban — rawan error |
| M14 | `guru/kursus/[id]/page.tsx:125` | `quizSelesaiCount` bisa string — type mismatch |
| M15 | `guru/buat/page.tsx:9` | Slug collision tidak ditangani |
| M16 | `guru/buat/page.tsx:104` | Dropdown kelas hardcoded (7,8,9) — tidak terkoneksi DB |
| M17 | `guru/drafts/[id]/published/page.tsx:26` | `admin_sekolah` tidak diizinkan |
| M18 | `guru/kursus/[id]/progres/page.tsx:38` | Endpoint mungkin belum ada |
| M19 | `guru/langganan/page.tsx:41` | Fitur paket di-hardcode — tidak sinkron backend |
| M20 | `guru/topup/page.tsx:136` | Stale `balance` di closure saat update optimistik |
| M21 | `guru/kursus/page.tsx:68` | `document.execCommand("copy")` deprecated |
| M22 | `guru/kursus/page.tsx:102` | Raw `fetch` — tidak konsisten dengan `apiFetch` |

### Siswa (14)
| # | File | Masalah |
|---|------|---------|
| M23 | `siswa/materi/page.tsx` | `welcome` param stay di URL — banner muncul lagi saat refresh |
| M24 | `siswa/materi/page.tsx` | `handleFilterClick` pakai `window.location.pathname` — fragile |
| M25 | `siswa/materi/[id]/page.tsx` | `nextId` bergantung pada `urutan` — gap bisa skip materi |
| M26 | `siswa/materi/[id]/page.tsx` | `markSelesai` selalu kirim `progress: 100` — tidak support partial |
| M27 | `siswa/quiz/page.tsx` | Semua quiz link ke `/siswa/cbt/` — URL misleading |
| M28 | `siswa/progres/page.tsx` | `rataNilai` include CBT dengan `null` as 0 — tarik turun rata-rata |
| M29 | `siswa/progres/page.tsx` | `totalSelesai` hitung BELAJAR + SELESAI — label misleading |
| M30 | `siswa/kursus/page.tsx` | `status` raw DB value (AKTIF/SELESAI) — tidak ada label Indonesia |
| M31 | `siswa/kursus/page.tsx` | Tidak ada kursus detail page — siswa tidak lihat info kursus |
| M32 | `siswa/pengumuman/page.tsx` | `target` field fetched tapi tidak ditampilkan |
| M33 | `siswa/payment/page.tsx` | Orphaned — tidak ada link ke halaman ini |
| M34 | `siswa/SiswaLayoutClient.tsx` | `KatalogKursusBar` link ke `/kursus` publik — hilang konteks dashboard |
| M35 | `siswa/SiswaLayoutClient.tsx` | `OnboardingSiswa` selalu mounted — wasteful |
| M36 | `siswa/SiswaLayoutClient.tsx` | `useTabFocus` invalidate terlalu agresif — semua cache clear |

---

## 🟢 LOW (36)

### Guru (18)
| # | File | Masalah |
|---|------|---------|
| L1 | `guru/layout.tsx` | Session tidak di-pass ke client — extra API call |
| L2 | `guru/page.tsx` | Duplikasi auth logic — 2x JWT verify |
| L3 | `guru/layout.tsx` | `alive` flag pattern tidak konsisten |
| L4 | `guru/siswa/page.tsx` | `setLoading(true)` redundan |
| L5 | `guru/analytics/page.tsx` | Double-nested height di bar chart |
| L6 | `guru/upload/page.tsx` | `pickFile` reset state tanpa konfirmasi |
| L7 | `guru/kelas/page.tsx` | `handleUpdate` tidak ada loading state |
| L8 | `guru/nilai/page.tsx` | Raw `fetch` tanpa CSRF |
| L9 | `guru/sertifikat/page.tsx` | `generated` timeout bisa konflik |
| L10 | `guru/profil/page.tsx` | Logout error diabaikan |
| L11 | `guru/onboarding/page.tsx` | `reset()` tidak sinkron ke server |
| L12 | `guru/test-math/page.tsx` | Test page seharusnya tidak di production |
| L13 | `guru/kursus/page.tsx` | Inconsistent API client (raw fetch vs apiFetch) |
| L14 | `guru/upload/page.tsx` | CSRF headers tidak selalu dikirim |
| L15 | `guru/drafts/page.tsx` | Tidak ada refresh token balance |
| L16 | `guru/beranda/page.tsx` | `retryCount` tidak di-reset unmount |
| L17 | `guru/drafts/[id]/page.tsx` | Polling pattern tidak konsisten |
| L18 | `guru/siswa/[id]/page.tsx` | `MasteryChart` menerima data tidak tervalidasi |

### Siswa (18)
| # | File | Masalah |
|---|------|---------|
| L19 | `siswa/materi/page.tsx` | `handleRetry` duplikasi fetch logic |
| L20 | `siswa/materi/page.tsx` | `progressPersen: 0` ditampilkan "Baru" — confusing |
| L21 | `siswa/materi/[id]/page.tsx` | `r.json()` dipanggil 2x saat error |
| L22 | `siswa/quiz/page.tsx` | `nilaiTerbaik != null` — loose comparison |
| L23 | `siswa/cbt/[id]/page.tsx` | Loading state — simple animate-pulse, bukan skeleton |
| L24 | `siswa/cbt/[id]/page.tsx` | Tidak ada CSRF headers |
| L25 | `siswa/kursus/page.tsx` | Tidak ada cache |
| L26 | `siswa/progres/page.tsx` | Tidak ada cache |
| L27 | `siswa/progres/page.tsx` | `durasiDetik` tidak handle hours |
| L28 | `siswa/pengumuman/page.tsx` | Tidak ada cache |
| L29 | `siswa/pengumuman/page.tsx` | Pinned items tidak dipisah visual |
| L30 | `siswa/beranda/page.tsx` | `totalAttempt` vs `totalSelesai` metrik beda — side-by-side misleading |
| L31 | `siswa/beranda/page.tsx` | `completedQuiz.slice(0,3)` vs `totalAttempt` — inconsistency |
| L32 | `siswa/beranda/page.tsx` | `progressPct` global across semua kursus — tidak meaningful |
| L33 | `siswa/beranda/page.tsx` | `continueLearning` picks first unsorted — not optimal |
| L34 | `siswa/beranda/page.tsx` | `inviteMessage` data dari API langsung — no sanitization |
| L35 | `siswa/quiz/page.tsx` | Quiz list item link ke CBT — URL misleading |
| L36 | `siswa/SiswaLayoutClient.tsx` | `FloatingActionMenu` behavior opaque |

---

## 🔗 CROSS-CUTTING: Guru ↔ Siswa Sync Gap

| # | Gap | Impact |
|---|-----|--------|
| CS1 | Guru upload materi → siswa tidak dapat notifikasi real-time | Cache stale 30-60 detik |
| CS2 | Guru publish quiz → QuizEngine tidak tahu mode | CBT feedback bocor |
| CS3 | Siswa selesai quiz → GradebookTable guru kosong | Guru tidak bisa lihat nilai per-quiz |
| CS4 | Siswa tandai materi selesai → Progress guru tidak update real-time | Guru lihat progress stale |
| CS5 | Guru invite siswa → Dashboard siswa tidak refresh | Siswa lihat `terdaftar: false` |
| CS6 | Inconsistent API client — guru pakai `apiFetch`, siswa pakai raw `fetch` | Error handling berbeda |

---

## 📊 API Endpoint Inventory

| Endpoint | Method | Dari | Auth | CSRF |
|----------|--------|------|------|------|
| `/api/v1/siswa/dashboard` | GET | Beranda | `requireSiswa` | ❌ |
| `/api/v1/siswa/feed` | GET | Materi | `requireSiswa` | ❌ |
| `/api/v1/siswa/materi` | GET | Materi list | `requireSiswa` | ❌ |
| `/api/v1/siswa/materi/[id]` | GET | Materi detail | `requireSiswa` | ❌ |
| `/api/v1/siswa/materi/[id]` | POST | Mark selesai | `requireSiswa` | ✅ |
| `/api/v1/siswa/quiz` | GET | Quiz list | `requireSiswa` | ❌ |
| `/api/v1/siswa/quiz/[id]` | GET | CBT detail | `requireSiswa` | ❌ |
| `/api/v1/siswa/quiz/[id]/start` | POST | QuizEngine | `requireSiswa` | ❌ |
| `/api/v1/siswa/quiz/[id]/submit` | POST | QuizEngine | `requireSiswa` | ❌ |
| `/api/v1/siswa/progres` | GET | Progres | `requireSiswa` | ❌ |
| `/api/v1/siswa/pengumuman` | GET | Pengumuman | `requireSiswa` | ❌ |
| `/api/v1/enroll/status` | GET | Kursus | `requireSiswa` | ❌ |
| `/api/v1/invite/kelas/consume` | POST | Beranda | — | ✅ |
| `/api/v1/guru/dashboard` | GET | Beranda guru | `requireGuru` | ❌ |
| `/api/v1/guru/onboarding` | GET/POST | Onboarding | `requireGuru` | ❌ |
| `/api/v1/guru/analytics` | GET | Analytics | `requireGuru` | ❌ |
| `/api/v1/guru/siswa` | GET | Siswa list | `requireGuru` | ❌ |
| `/api/v1/guru/kursus/[id]/nilai` | GET | Nilai | `requireGuru` | ❌ |
| `/api/v1/guru/kursus/[id]/progres` | GET | Progres | `requireGuru` | ❌ |
| `/api/v1/token/balance` | GET | Token | `requireGuru` | ❌ |
| `/api/v1/kursus` | GET | Kursus list | `requireGuru` | ❌ |
| `/api/v1/auth/logout` | POST | Logout | — | ❌ |

---

## 🎯 Rencana Perbaikan (Prioritas)

| Prioritas | Item | Estimasi | Agent |
|-----------|------|----------|-------|
| **P0** | QuizEngine: tambah `modeEvaluasi`, conditional feedback | 1 jam | 1 engine |
| **P0** | Cache invalidation: semua titik mutation | 1.5 jam | 2 agent |
| **P1** | GradebookTable: populate `siswaQuizMap` | 30 menit | 1 back |
| **P1** | Token balance: refresh setelah transaksi | 30 menit | 1 front |
| **P1** | Beranda siswa: fix `userId` double fetch | 30 menit | 1 front |
| **P1** | Profil siswa: buat halaman | 1 jam | 1 front |
| **P2** | Standardize API client (semua pakai `apiFetch`) | 1 jam | 1 back |
| **P2** | Progress bar, race condition, redirect fixes | 1 jam | 2 front |
| **P3** | Semua LOW items (cleanup, consistency) | 2 jam | 2 agent |
| **P4** | Build + Deploy + Test | 30 menit | 1 agent |

---

> **Dibuat:** 18 Juli 2026
> **Audit oleh:** AI Agent Team (6 sub-agent parallel)
> **Status:** Menunggu persetujuan untuk mulai perbaikan