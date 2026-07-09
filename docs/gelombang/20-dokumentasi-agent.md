# Gelombang 20 — Dokumentasi untuk Agent Bawahan

> Membuat struktur dokumentasi per-gelombang sehingga sub-agent AI bisa
> mengerjakan gelombang tertentu secara mandiri tanpa ngebobol aturan.

## Checklist Eksekusi

- [x] Buat direktori `docs/gelombang/`
- [x] Buat `README.md` — indeks + aturan global + file yang dilarang
- [x] Buat `_template.md` — template standar untuk gelombang baru
- [x] Buat file dokumentasi untuk gelombang yang masih aktif / akan dikerjakan (20, 21, 22)
- [x] Buat file dokumentasi untuk gelombang yang baru selesai sebagai contoh (18)
- [ ] Update TODO progress

## File yang Boleh Disentuh

| File | Tujuan |
|------|--------|
| `docs/gelombang/*.md` | Membuat/mengedit dokumentasi gelombang |
| `TODO-V2-MULTI-GURU.md` | Update progress |

## File yang Dilarang Disentuh

| File | Alasan |
|------|--------|
| Semua file `src/` | Dokumentasi saja — tidak ada perubahan kode |
| `prd/` | Dokumen PRD — jangan diedit untuk dokumentasi agent |

## Acceptance Criteria

- [x] Agent baru bisa buka `docs/gelombang/README.md` dan langsung paham scope
- [x] Setiap gelombang punya file sendiri dengan checklist + file scope + acceptance
- [x] Aturan global (file terlarang, role mapping) terdokumentasi di satu tempat
- [ ] Build hijau
