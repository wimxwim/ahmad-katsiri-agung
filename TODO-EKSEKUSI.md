# TODO Eksekusi — AKAL Center

> Disusun oleh Profesor Senior Arsitek. Setiap item mencantumkan *skill* yang wajib dimuat sebelum eksekusi.
> Prinsip: baca semua file yang disentuh (Step 1), trace dependency (Step 2), load skill relevan, eksekusi (Step 4), build (Step 5).

---

## P0 — Segera (Sebelum Produksi Stabil)

### P0.1 Finalisasi Data Model (Gelombang 14)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 1 | ✅ Sudah ada — review schema Drizzle untuk kelengkapan relasi guru-siswa, pastikan index untuk query dashboard | `src/lib/db/schema/*.ts` | `warehouse-and-schema-design` · `schema-evolution-and-contract-migrations` · `code-review-and-quality` |
| 2 | ✅ Sudah ada — review tabel `ai_generation`, pastikan kolom `promptVersion` untuk versioning prompt | `*migrations/*.sql` · `src/lib/db/schema/` | `data-quality-and-contract-testing` · `architect` |
| 3 | **Tambah tabel prompt/version metadata** — buat tabel `ai_prompt_versions` untuk versioning prompt generator | `src/lib/db/schema/` · `src/lib/ai-generator.ts` | `schema-evolution-and-contract-migrations` · `backend-patterns` · `data-specification` |
| 4 | **Tambah tabel generation_attepts / retry history** — lacak tiap retry agar tidak loss history | `src/lib/db/schema/` · `src/lib/ai-generator.ts` | `data-quality-and-contract-testing` · `pipeline-planning-and-task-breakdown` |
| 5 | **Tambah index untuk query dashboard guru sering dipakai** — analisis query pattern guru/siswa | `src/lib/db/schema/` · `drizzle.config.ts` | `warehouse-performance-and-cost-optimization` · `duckdb-local-analytics-and-dev` |

### P0.2 Security Hardening Minimum (Gelombang 15)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 6 | **Validasi DOCX zip bomb** — batasi rasio kompresi dan ukuran ekstraksi | `src/lib/text-extractor.ts` · `src/app/api/v1/guru/uploads/route.ts` | `security-review` · `backend-patterns` |
| 7 | **Validasi PDF text extraction runaway** — batasi jumlah halaman dan karakter output | `src/lib/text-extractor.ts` | `security-review` · `code-review-and-quality` |
| 8 | **Batasi jumlah upload per guru per periode** — rate limit upload per user per jam | `src/app/api/v1/guru/uploads/route.ts` · `src/lib/rate-limit.ts` | `security-review` · `backend-patterns` |
| 9 | **Batasi concurrent generation job per guru** — cegah overload AI API dari satu user | `src/app/api/v1/guru/drafts/[id]/regenerate/route.ts` · `src/lib/rate-limit.ts` | `security-review` · `api-and-saas-ingestion-patterns` |
| 10 | **Timeout aman extraction & generation** — pastikan fetch ke AI API punya timeout | `src/lib/text-extractor.ts` · `src/lib/ai-generator.ts` | `backend-patterns` · `kafka-resilience-and-schema-evolution` |
| 11 | **Pastikan user tidak bisa baca draft guru lain** — audit scope query semua route drafts | `src/app/api/v1/guru/drafts/**/route.ts` | `security-review` · `differential-review` · `backend-patterns` |
| 12 | **Pastikan privat asset tidak bisa ditebak URL** — audit akses ke file yang belum publish | `src/lib/storage/ImageKitAdapter.ts` · route upload | `security-review` · `source-reliability-and-extraction-resilience` |

### P0.3 Auth Finalization (Gelombang 12 — sisa polishing)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 13 | **Audit length & strength session token** — pastikan JWT_SECRET cukup kuat, pastikan `jti` unik per sesi | `src/lib/auth.ts` · `src/lib/auth-keys.ts` | `security-review` · `architect` |
| 14 | **Audit refresh token rotation** — pastikan refresh token di-rotate tiap pakai dan revoked setelah logout | `src/lib/refresh-token.ts` · `src/app/api/v1/auth/refresh/route.ts` | `security-review` · `code-review-and-quality` |

---

## P1 — Workflow Guru (Gelombang 16)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 15 | **Dashboard "apa yang harus saya lakukan"** — card prioritas: upload baru, review draft, publish materi, undang siswa | `src/app/guru/beranda/page.tsx` · `src/app/api/v1/guru/dashboard/route.ts` | `frontend-design` · `design-taste-frontend` · `ui-ux-pro-max` · `vercel-react-best-practices` |
| 16 | **Status badge kursus** (draft/publik/arsip) — tampilkan status visual yang jelas | `src/app/guru/kursus/page.tsx` · komponen badge | `frontend-design` · `design-taste-frontend` |
| 17 | **Quick action cards** — upload, review draft, buat kuis, undang siswa dari beranda | `src/app/guru/beranda/page.tsx` | `frontend-design` · `ui-ux-pro-max` |
| 18 | **Card "siswa belum mengerjakan"** — tampilkan jumlah siswa yang belum mulai per kursus | `src/app/api/v1/guru/analytics/route.ts` · `src/app/guru/beranda/page.tsx` | `warehouse-and-schema-design` · `superset-and-metrics-serving` · `backend-patterns` |
| 19 | **Card "topik paling lemah"** — dari data quiz attempt, identifikasi soal dengan error rate tinggi | `src/app/api/v1/guru/analytics/route.ts` | `warehouse-and-schema-design` · `data-observability-and-sla-management` |
| 20 | **Card "draft AI menunggu review"** — jumlah draft `ready` yang belum di-review | `src/app/guru/beranda/page.tsx` · `src/app/api/v1/guru/drafts/route.ts` | `frontend-design` · `backend-patterns` |
| 21 | **Search & filter daftar siswa** — filter by kelas, nama, progres | `src/app/guru/siswa/page.tsx` · API route | `frontend-design` · `ui-ux-design-pro` · `backend-patterns` |
| 22 | **Search & filter daftar draft AI** — filter by status, tanggal, judul | `src/app/guru/drafts/page.tsx` · API route | `frontend-design` · `backend-patterns` |
| 23 | **Search & filter daftar kursus** — filter by status, nama, tanggal publish | `src/app/guru/kursus/page.tsx` · API route | `frontend-design` · `backend-patterns` |
| 24 | **Closure state upload** — setelah upload berhasil, tampilkan "Selesai" + link ke draft | `src/app/guru/upload/page.tsx` | `frontend-design` · `design-taste-frontend` |
| 25 | **Closure state publish** — setelah publish materi/quiz, tampilkan "Berhasil dipublikasikan" | `src/app/api/v1/kursus/[id]/publish/route.ts` · redirect page | `frontend-design` · `ui-ux-pro-max` |

---

## P1 — Workflow Siswa (Gelombang 17)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 26 | **Continue card — materi terakhir dibuka** — dari progres terakhir, tampilkan "Lanjutkan Belajar" | `src/app/siswa/beranda/page.tsx` · API feed | `frontend-design` · `design-taste-frontend` · `backend-patterns` |
| 27 | **Section "Hari Ini"** — jadwal/aktivitas hari ini (khususnya jika ada deadline quiz) | `src/app/siswa/beranda/page.tsx` | `frontend-design` · `ui-ux-pro-max` |
| 28 | **Section quiz berikutnya** — tampilkan quiz belum dikerjakan | `src/app/siswa/beranda/page.tsx` | `frontend-design` · `backend-patterns` |
| 29 | **Riwayat hasil quiz mudah dibaca** — tabel nilai per attempt, per kursus | `src/app/siswa/progres/page.tsx` · API progres | `frontend-design` · `ui-ux-design-pro` · `warehouse-and-schema-design` |
| 30 | **Badge progres yang tidak kekanak-kanakan** — % progres, bukan emoji/stars | `src/app/siswa/materi/page.tsx` · komponen badge | `frontend-design` · `design-taste-frontend` |
| 31 | **Pengumuman guru card** — pin pengumuman penting di beranda siswa | `src/app/siswa/beranda/page.tsx` · API pengumuman | `frontend-design` · `backend-patterns` |
| 32 | **Fallback jika belum tergabung kelas** — tampilkan "Kamu belum terdaftar di kelas mana pun. Hubungi gurumu." | `src/app/siswa/beranda/page.tsx` · `src/components/ui/EmptyState.tsx` | `frontend-design` · `site-architecture` |

---

## P1 — Analytics (Gelombang 18)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 33 | **Summary analytics bahasa guru** — ubah metrik mentah jadi narasi: "15 siswa belum tuntas" | `src/app/guru/analytics/page.tsx` · API analytics | `frontend-design` · `semantic-layer-and-metric-governance` · `superset-and-metrics-serving` |
| 34 | **Visual weak topic** — bar chart/tabel soal dengan error rate tinggi | `src/app/guru/analytics/page.tsx` | `frontend-design` · `ui-ux-design-pro` · `warehouse-and-schema-design` |
| 35 | **Remedial recommendation card** — saran otomatis untuk siswa dengan nilai di bawah KKM | `src/app/guru/analytics/page.tsx` · API analytics | `data-quality-and-contract-testing` · `semantic-layer-and-metric-governance` |
| 36 | **CTA kirim remedial** — tombol di card rekomendasi untuk kirim notifikasi | `src/app/guru/analytics/page.tsx` | `frontend-design` · `backend-patterns` |
| 37 | **Detail progres per siswa** — halaman `/guru/siswa/[id]` dengan riwayat quiz, nilai, progres | `src/app/guru/siswa/[id]/page.tsx` · API | `frontend-design` · `warehouse-and-schema-design` |
| 38 | **Detail progres per kursus** — halaman `/guru/kursus/[id]/progres` | `src/app/guru/kursus/[id]/progres/page.tsx` · API | `frontend-design` · `warehouse-and-schema-design` |

---

## P2 — Content Governance (Gelombang 19)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 39 | **Tag konten legacy** — tentukan mana yang tetap publik, mana arsip internal | `src/data/materi.ts` · `src/lib/cms-data.ts` | `data-catalog-and-discovery` · `data-security-compliance-and-regulated-data` |
| 40 | **Coexist legacy + konten baru** — pastikan siswa tidak bingung, label visual "lama" vs "baru" | `src/app/materi/[slug]/page.tsx` · `src/app/siswa/materi/page.tsx` | `frontend-design` · `site-architecture` |
| 41 | **Label visual konten legacy di UI** — badge `Materi Lama` | `src/components/` | `frontend-design` · `design-taste-frontend` |

---

## P2 — State & Loading (Gelombang 22)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 42 | **Audit semua halaman dashboard** — pastikan ada state idle, loading, success, error, empty | Semua halaman di `/guru/` dan `/siswa/` | `code-review-and-quality` · `frontend-design` · `vercel-react-best-practices` |
| 43 | **Upload flow state visual lengkap** — idle → uploading → processing → done/error | `src/app/guru/upload/page.tsx` | `frontend-design` · `design-taste-frontend` · `ui-ux-pro-max` |
| 44 | **AI generation flow state visual lengkap** — queue → extracting → generating → ready/failed | `src/app/guru/drafts/page.tsx` | `frontend-design` · `design-taste-frontend` |
| 45 | **Publish flow state visual lengkap** — confirming → publishing → done/error | `src/app/api/v1/kursus/[id]/publish/route.ts` · `src/app/guru/kursus/page.tsx` | `frontend-design` · `vercel-react-best-practices` |
| 46 | **Siswa tahu kapan quiz terkirim vs diproses** — loading state + success toast pada submit quiz | `src/app/siswa/quiz/page.tsx` · CBT route | `frontend-design` · `vercel-react-best-practices` |

---

## P2 — Observability (Gelombang 10A sisa)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 47 | **Panel admin ringan** — halaman `/owner/audit` untuk lihat upload gagal + generation gagal | `src/app/owner/audit/page.tsx` · API | `frontend-design` · `incident-triage-and-pipeline-recovery` · `data-observability-and-sla-management` |
| 48 | **Dokumentasi env final** — buat `.env.example` final dari `.env.local` yang sudah stabil | `.env.example` | `data-platform-operating-model-and-service-ownership` · `terraform-and-data-platform-infrastructure` |

---

## P3 — Dokumentasi Agent (Gelombang 20)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 49 | **Pecah TODO per gelombang jadi file turunan** — buat `TODO-GELOMBANG-*.md` per wave | `TODO-GELOMBANG-14.md` · `TODO-GELOMBANG-15.md` dst | `data-specification` · `pipeline-planning-and-task-breakdown` |
| 50 | **Buat checklist eksekusi per gelombang** — file terpisah dengan acceptance criteria | `CHECKLIST-GELOMBANG-*.md` | `data-quality-and-contract-testing` · `code-review-and-quality` |
| 51 | **Buat daftar file boleh sentuh / tidak boleh sentuh** — guardrails untuk agent bawahan | `AGENTS.md` — tambah section | `architect` · `data-platform-operating-model-and-service-ownership` |
| 52 | **Acceptance criteria per screen** — Gelombang 21: definisi selesai per halaman | `ACCEPTANCE-CRITERIA.md` | `data-specification` · `code-review-and-quality` |

---

## P3 — Mode Evaluasi (Gelombang 8A sisa)

| # | Item | File Terkait | Skill Wajib |
|---|------|-------------|-------------|
| 53 | **Tampilan siswa berbeda per mode evaluasi** — BELAJAR vs ULANGAN vs CBT: layout, score visibility, timer | `src/app/siswa/cbt/[id]/page.tsx` · `src/app/siswa/quiz/page.tsx` | `frontend-design` · `ui-ux-design-pro` · `backend-patterns` |
| 54 | **UI publish dengan selector mode** — guru pilih mode evaluasi saat publish quiz | `src/app/guru/kursus/[id]/publish/page.tsx` · API publish | `frontend-design` · `design-taste-frontend` |
| 55 | **String instruksi "tunggu konfirmasi guru"** — untuk mode ujian sekolah | `src/app/siswa/cbt/[id]/page.tsx` | `frontend-design` · `site-architecture` |

---

## Ringkasan Prioritas

| Prioritas | Jumlah Item | Fokus |
|-----------|-------------|-------|
| **P0** | 14 item | Data model final + security hardening + auth audit |
| **P1** | 24 item | Workflow guru + workflow siswa + analytics |
| **P2** | 8 item | Content governance + state visual + observability |
| **P3** | 13 item | Dokumentasi agent + mode evaluasi |

### Catatan Eksekusi

1. **Setiap item** → baca semua file terkait, trace dependency, load skill dari daftar, eksekusi, `npm run build`
2. **Prioritas ketat** — selesaikan P0 sebelum P1. Tidak ada lompatan.
3. **Untuk perubahan API**: tambahkan `security-review` + `backend-patterns` sebagai skill dasar
4. **Untuk perubahan UI**: tambahkan `frontend-design` + `vercel-react-best-practices` sebagai skill dasar
5. **Untuk perubahan database**: tambahkan `warehouse-and-schema-design` + `schema-evolution-and-contract-migrations`
6. **Build wajib hijau** sebelum klaim selesai
