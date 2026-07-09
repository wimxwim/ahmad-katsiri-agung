# Gelombang 21 — Screen-by-Screen Acceptance Criteria

> Buat acceptance criteria detail per halaman penting, sehingga sub-agent
> bisa verifikasi kualitas sebelum deploy.

## Checklist Eksekusi

- [ ] Landing page hero — layout, heading, CTA, animasi, responsive
- [ ] Landing page workflow section — 5-step flow, icon, teks
- [ ] Halaman `/masuk` — form, Google OAuth, intent selector, error states
- [ ] Halaman `/daftar` — form, role picker, validasi
- [ ] Halaman `/guru/upload` — drag-drop, progress, error handling
- [ ] Halaman `/guru/drafts/[id]` — review tabs, approve/reject, regenerate
- [ ] Dashboard guru kosong — empty state, onboarding CTA
- [ ] Dashboard siswa kosong — empty state, continue learning
- [ ] Halaman ujian selesai — timer, score, hidden score mode

## File yang Boleh Disentuh

| File | Tujuan |
|------|--------|
| `docs/gelombang/21-acceptance-criteria.md` | File ini — mengisi detail AC |
| `src/app/...` | Hanya jika ada bug yang ditemukan saat verifikasi |

## File yang Dilarang Disentuh Tanpa Approval

| File | Alasan |
|------|--------|
| `src/lib/db/schema.ts` | Bukan bagian dari AC |
| `src/app/api/` | Bukan bagian dari AC screen |

## Acceptance Criteria (Meta)

- [ ] Setiap halaman punya checklist: layout, responsive mobile, loading state, empty state, error state, success state
- [ ] AC bisa dipakai agent lain untuk verifikasi tanpa perlu tanya user
- [ ] Build hijau
