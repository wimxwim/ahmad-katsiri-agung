# AKAL CENTER v2 — Lanjutan Fase 4 (Materi Sharing)

## Konteks
Commit `59e097afa` di branch `main` sudah dipush. Fase 0-3 selesai (32/80 task).
Build hijau, zero errors.

## Tugas: Fase 4 — Materi Sharing (PRIVAT/PUBLIK/KRABAT) — 14 task

Baca `prd/TODO-FINAL-v2.md` untuk detail lengkap. Ringkasan:

### Database (SHR-01 s/d SHR-04)
1. Tambah tabel `materi_sharing` di `src/lib/db/schema.ts`:
   - `materiPublishedId` (FK materi_published, PK)
   - `visibility` enum: PRIVAT / PUBLIK / KRABAT / ARSIP
   - `approvalStatus` enum: PENDING / APPROVED / REJECTED (hanya untuk PUBLIK)
   - `updatedAt`

2. Tambah tabel `krabat_connections`:
   - `id` PK
   - `guruId` (FK users)
   - `connectedGuruId` (FK users)
   - `status` enum: PENDING / ACTIVE / REJECTED
   - `createdAt`, `updatedAt`

3. Tambah relations + migration SQL (0026, 0027)

### API Endpoints (SHR-05 s/d SHR-13)
4. `POST /api/v1/guru/materi/:id/sharing` — set visibility
   - Default: PRIVAT (hanya guru sendiri + siswanya)
   - PUBLIK → auto-set approvalStatus=PENDING (butuh izin developer)
   - KRABAT → hanya guru dengan koneksi ACTIVE
   - ARSIP → hanya guru sendiri (tidak siswa)

5. `GET /api/v1/katalog` — list materi PUBLIK + APPROVED (public endpoint)

6. `POST /api/v1/guru/krabat/connect` — request koneksi ke guru lain (status PENDING)

7. `POST /api/v1/guru/krabat/approve` — approve/reject koneksi (status ACTIVE/REJECTED)

8. `POST /api/v1/owner/sharing/approve` + `/reject` — developer approval untuk PUBLIK

### Access Control (SHR-11, SHR-12)
9. KRABAT access guard: materi KRABAT hanya bisa dilihat guru dengan koneksi ACTIVE
10. ARSIP: hanya guru sendiri (tidak siswa, tidak guru lain)

### Audit (SHR-14)
11. Audit log via `appendEvent()` untuk share, krabat connect/approve

## Aturan
- Baca file sebelum edit
- `cn()` untuk className, mobile-first `px-3 sm:px-5 lg:px-8`
- Jangan ubah design system, animasi, warna
- Jangan tambah library baru
- Jangan commit credentials
- `npm run build` harus zero errors sebelum klaim selesai
- Migration SQL tulis manual (drizzle-kit generate broken karena journal desync)
- Gunakan `NODE_OPTIONS=--max-old-space-size=8192` untuk build

## File yang sudah ada (jangan dibuat ulang)
- `src/lib/db/schema.ts` — tambah tabel di sini
- `src/lib/event-store.ts` — appendEvent sudah ada
- `src/lib/route-guard-v2.ts` — requireGuru, requireOwner sudah ada
- `src/lib/csrf-server.ts` — validateCsrf sudah ada
- `src/lib/api-response.ts` — apiError, apiRateLimit sudah ada

## Urutan kerja
1. Baca `prd/TODO-FINAL-v2.md` Fase 4
2. Baca `src/lib/db/schema.ts` untuk lihat pola tabel + relations
3. Tambah `materi_sharing` + `krabat_connections` table + relations
4. Tulis migration SQL (0026, 0027)
5. Buat API routes satu per satu
6. `npm run build` → pastikan zero errors
7. Commit + push