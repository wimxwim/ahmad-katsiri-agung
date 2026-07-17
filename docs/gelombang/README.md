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

> Gelombang 01-17 telah selesai dan file dokumentasinya diarsipkan (tidak lagi tersedia di repo).

| File | Gelombang | Status |
|------|-----------|--------|
| [`18-analytics-remedial.md`](18-analytics-remedial.md) | 18 — Analytics & Remedial UX | ✅ SELESAI |
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
