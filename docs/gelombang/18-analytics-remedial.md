# Gelombang 18 — Analytics & Remedial UX ✅ SELESAI

> Enhanced dashboard guru dengan insight naratif, weak topic visual, remedial card,
> CTA aksi, dan TRI untuk owner.

## Checklist Eksekusi

- [x] Summary analytics naratif: "Ringkasan untuk Bapak/Ibu Guru" dalam bahasa Indonesia ramah
- [x] Visual weak topic top-3: badge prioritas + progress bar multi-warna (merah/oranye/kuning)
- [x] Remedial recommendation card: filter "Siswa Perlu Bimbingan Tambahan"
- [x] 3 CTA aksi: Tinjau Semua Siswa, Buat Quiz Remedial, Lihat Kursus
- [x] API `/api/v1/owner/tri`: kalkulasi 6 dimensi per guru + simpan snapshot
- [x] Halaman owner dashboard: tabel TRI dengan score, label, mini bar komponen

## File yang Disentuh

| File | Perubahan |
|------|-----------|
| `src/app/guru/analytics/page.tsx` | Insight naratif, weak topic, remedial card, CTA |
| `src/app/guru/beranda/page.tsx` | Sama (insight di beranda) |
| `src/app/api/v1/owner/tri/route.ts` | **Baru** — API endpoint TRI |
| `src/app/owner/page.tsx` | Section TRI dengan tabel guru |

## Acceptance Criteria Terpenuhi

- [x] Guru lihat ringkasan dalam bahasa Indonesia, bukan angka mentah
- [x] Weak topic ditampilkan dengan prioritas jelas
- [x] Ada tindakan yang bisa diambil (CTA)
- [x] Owner bisa lihat readiness semua guru
- [x] Build hijau
