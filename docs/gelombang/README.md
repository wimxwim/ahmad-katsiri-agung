# Dokumentasi Gelombang — AKAL Center

> Panduan untuk agent bawahan (sub-agent AI) saat mengerjakan gelombang tertentu.
> Setiap gelombang punya file sendiri dengan checklist, file scope, dan acceptance criteria.

## Cara Pakai

1. Baca file gelombang target (misal `20-dokumentasi-agent.md`)
2. Pahami **file yang boleh disentuh** dan **yang dilarang**
3. Ikuti **checklist eksekusi** urut
4. Penuhi **acceptance criteria** sebelum klaim selesai
5. Jalankan `npx next build` — **0 error = syarat wajib**

## Daftar Gelombang

| File | Gelombang | Status |
|------|-----------|--------|
| [`01-auth-routing.md`](01-auth-routing.md) | 1 — Arsitektur Ulang Auth & Routing | ✅ SELESAI |
| [`02-landing-page.md`](02-landing-page.md) | 2 — Landing Page Baru Total | ✅ SELESAI |
| [`03-freeze-keystatic.md`](03-freeze-keystatic.md) | 3 — Freeze Keystatic & Bridge | ✅ SELESAI |
| [`04-auth-baru.md`](04-auth-baru.md) | 4 — Auth Email/Password + Google | ✅ SELESAI |
| [`05-workspace-guru.md`](05-workspace-guru.md) | 5 — Workspace Guru Multi-Tenant | ✅ SELESAI |
| [`05a-role-home.md`](05a-role-home.md) | 5A — Role Home Tambahan | ✅ SELESAI |
| [`06-storage-imagekit.md`](06-storage-imagekit.md) | 6 — Storage ImageKit | ✅ SELESAI |
| [`07-ai-generator.md`](07-ai-generator.md) | 7 — AI Generator Dokumen | ✅ SELESAI |
| [`08-dashboard-siswa.md`](08-dashboard-siswa.md) | 8 — Dashboard Siswa Baru | ✅ SELESAI |
| [`08a-evaluasi.md`](08a-evaluasi.md) | 8A — Mode Evaluasi | ✅ SELESAI |
| [`09-legacy-bridge.md`](09-legacy-bridge.md) | 9 — Legacy Bridge | ✅ SELESAI |
| [`10-hardening.md`](10-hardening.md) | 10 — Hardening Minimum | ✅ SELESAI |
| [`10a-observability.md`](10a-observability.md) | 10A — Observability | ✅ SELESAI |
| [`11-frontend-rebuild.md`](11-frontend-rebuild.md) | 11 — Frontend Rebuild | ✅ SELESAI |
| [`12-auth-ux.md`](12-auth-ux.md) | 12 — Auth UX Completion | ✅ SELESAI |
| [`13-route-migration.md`](13-route-migration.md) | 13 — Route Migration | ✅ SELESAI |
| [`14-data-model.md`](14-data-model.md) | 14 — Data Model Completion | ✅ SELESAI |
| [`15-security-abuse.md`](15-security-abuse.md) | 15 — Security & Abuse Cases | ✅ SELESAI |
| [`16-guru-polish.md`](16-guru-polish.md) | 16 — Guru Workflow Polishing | ✅ SELESAI |
| [`17-siswa-polish.md`](17-siswa-polish.md) | 17 — Student Workflow Polishing | ✅ SELESAI |
| [`18-analytics-remedial.md`](18-analytics-remedial.md) | 18 — Analytics & Remedial UX | ✅ SELESAI |
| [`19-legacy-governance.md`](19-legacy-governance.md) | 19 — Content Governance | ✅ SKIP |
| [`20-dokumentasi-agent.md`](20-dokumentasi-agent.md) | 20 — Dokumentasi Agent Bawahan | 🏗️ AKTIF |
| [`21-acceptance-criteria.md`](21-acceptance-criteria.md) | 21 — Screen-by-Screen Acceptance Criteria | ❌ |
| [`22-loading-states.md`](22-loading-states.md) | 22 — Loading & State Visibility | ❌ |

## Aturan Global untuk Semua Agent

### File yang TIDAK BOLEH Disentuh Tanpa Approval

| File/Direktori | Alasan |
|----------------|--------|
| `vercel.json` | Konfigurasi deploy Vercel — jangan hapus/edit |
| `keystatic.config.ts` | Dibekukan — jangan ubah |
| `content/*` | Arsip Keystatic — jangan baca/tulis kode |
| `prd/*` | Dokumen PRD — baca saja, jangan edit |
| `.env.local` / `.env` | Rahasia — jangan commit atau ubah |
| `package.json` scripts & dependencies | Jangan tambah library baru tanpa izin |
| `src/lib/db/schema.ts` | Schema DB — perubahan wajib lewat migrasi |
| `tailwind.config.*` | Design system — jangan ubah warna/font/radius |
| `src/app/globals.css` | CSS global — jangan ubah token design |

### Wajib Dilakukan Setiap Perubahan

- [ ] Baca file yang akan disentuh dari disk (bukan dari memori)
- [ ] Trace import & dependency
- [ ] Gunakan `cn()` dari `src/lib/utils.ts` untuk className kondisional
- [ ] Mobile-first: `px-3 sm:px-5 lg:px-8`
- [ ] Jangan tambah komentar (kecuali annotation fix bug)
- [ ] `npx next build` — 0 error sebelum klaim selesai
- [ ] Jangan ubah animation ease curve `[0.16, 1, 0.3, 1]`

### Role & Portal Reference

| DB Role | Session Role | Dashboard Path |
|---------|-------------|----------------|
| `MURID` | `murid` | `/siswa/*` |
| `GURU` | `guru` | `/guru/*` |
| `ASISTEN_GURU` | `guru` | `/guru/*` |
| `OWNER` | `owner` | `/owner/*` |
| `ADMIN_SEKOLAH` | `admin_sekolah` | `/admin-sekolah/*` |
| `ORANG_TUA` | `orang_tua` | `/orang-tua/*` |
