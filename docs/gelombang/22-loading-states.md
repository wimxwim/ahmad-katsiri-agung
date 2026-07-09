# Gelombang 22 — Loading & State Visibility

> Pastikan semua layar penting punya state visual lengkap:
> idle → loading → success → error. Tidak ada yang silent fail.

## Checklist Eksekusi

- [ ] Upload flow (`/guru/upload`): idle → uploading → extracting → success/error
- [ ] AI generation flow (`/guru/upload` + `/guru/drafts`): queued → generating → ready/failed
- [ ] Publish flow (`/guru/drafts`): idle → publishing → published/error
- [ ] Quiz submit (`/siswa/cbt`): idle → submitting → submitted/timeout
- [ ] Skeleton loading untuk semua list page
- [ ] Toast/notification untuk operasi async

## File yang Boleh Disentuh

| File | Tujuan |
|------|--------|
| `src/app/guru/upload/page.tsx` | State visual tambahan |
| `src/app/guru/drafts/page.tsx` | State visual tambahan |
| `src/app/siswa/cbt/[id]/page.tsx` | Submit state handling |
| `src/components/ui/` | Komponen loading/skeleton reusable |

## File yang Dilarang Disentuh Tanpa Approval

| File | Alasan |
|------|--------|
| `src/lib/db/schema.ts` | Tidak terkait state visual |
| `src/lib/auth.ts` | Tidak terkait state visual |

## Acceptance Criteria

- [ ] Upload: ada progress bar + status text + error message jika gagal
- [ ] Generation: badge status `queued|extracting|generating|ready|failed` terlihat
- [ ] Publish: button show loading spinner + disable double-click + success/error toast
- [ ] Quiz submit: button disable setelah klik + loading + result muncul
- [ ] Skeleton: setiap list loading pakai `SkeletonList` atau `SkeletonCard`
- [ ] Build hijau
