# #potensi-upgrade-frontend — AKAL Center

> **Dibuat:** 11 Juli 2026
> **Status:** Katalog — tidak ada kode yang diubah
> **Metode:** Audit 3-siklus (diskusi) + riset internet + scan kode

---

## 🔴 HIGH — Bug nyata (harus difix sebelum traffic naik)

### H-1: Memory leak `URL.createObjectURL` tanpa `revokeObjectURL`

- **File:** `src/app/pembayaran/page.tsx` baris 22
- **Masalah:** `setPreview(URL.createObjectURL(f))` dipanggil setiap user upload bukti pembayaran, tapi `URL.revokeObjectURL()` tidak pernah dipanggil. Object URL menumpuk di memory.
- **Dampak:** Device low-end (siswa) bisa crash setelah upload 3-5x.
- **Fix:** Tambah `useEffect` cleanup dengan `URL.revokeObjectURL(preview)`, atau langsung revoke setelah upload selesai.
- **Effort:** 15 menit

### H-2: 0 test frontend

- **File:** Tidak ada `*.test.tsx` atau `*.spec.tsx` satupun di seluruh project
- **Masalah:** Tidak ada automated test. Setiap perubahan adalah gamble — tidak tahu apakah ada yang rusak.
- **Dampak:** Regression risk tinggi. Refactor mana pun tidak aman.
- **Fix:** Minimal: smoke test untuk halaman utama (`/`, `/masuk`, `/daftar`, `/kursus`). Ideal: component test untuk shared UI.
- **Effort:** 3-5 hari (setup + basic coverage)

---

## 🟡 MEDIUM — Technical debt (bikin lambat, harus dikerjakan bertahap)

### M-1: 10 duplikasi input field — harus jadi shared `<Input>` component

**Pattern yang diulang 10x:**
```
className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white ..."
```

| # | File | Baris |
|---|------|-------|
| 1 | `src/app/masuk/_components/FormDaftarSiswa.tsx` | 22, 32, 49, 60 |
| 2 | `src/app/masuk/_components/FormLoginGuru.tsx` | 36 |
| 3 | `src/app/masuk/_components/FormLoginSiswa.tsx` | 36 |
| 4 | `src/app/daftar/DaftarPicker.tsx` | 158, 168, 205, 216 |

**Dampak:** 1 perubahan desain (misal border radius) = edit 10 tempat.

**Fix:** Buat `src/components/ui/Input.tsx` dengan variant props. Ganti semua 10 pemakaian.

**Effort:** 2 jam

---

### M-2: 13 `window.location.reload()` — anti-pattern SPA

| # | File | Baris |
|---|------|-------|
| 1 | `src/app/guru/beranda/page.tsx` | 87 |
| 2 | `src/app/guru/analytics/page.tsx` | 96 |
| 3 | `src/app/guru/kursus/page.tsx` | 61 |
| 4 | `src/app/guru/kursus/[id]/page.tsx` | 74 |
| 5 | `src/app/guru/kursus/[id]/nilai/page.tsx` | 70 |
| 6 | `src/app/guru/siswa/page.tsx` | 71 |
| 7 | `src/app/guru/nilai/page.tsx` | 55 |
| 8 | `src/app/guru/sertifikat/page.tsx` | 51 |
| 9 | `src/app/siswa/beranda/page.tsx` | 96 |
| 10 | `src/app/siswa/materi/page.tsx` | 52 |
| 11 | `src/app/siswa/kursus/page.tsx` | 50 |
| 12 | `src/app/kursus/page.tsx` | 84 |
| 13 | `src/app/kursus/[slug]/page.tsx` | 89 |

**Dampak:** Full page reload — hilang state, animasi jelek, UX buruk.

**Fix:** Ganti dengan `router.refresh()` atau re-fetch state via `useEffect` retrigger.

**Effort:** 1 jam

---

### M-3: 9 nomor WhatsApp hardcode di 6 file

| # | File | Baris |
|---|------|-------|
| 1 | `src/app/page.tsx` | 246, 291 |
| 2 | `src/app/harga/page.tsx` | 151, 235 |
| 3 | `src/app/fitur/page.tsx` | 406 |
| 4 | `src/app/pembayaran/page.tsx` | 141 |
| 5 | `src/app/tentang/page.tsx` | 174 |
| 6 | `src/app/masuk/role-mismatch/page.tsx` | 101 |
| 7 | `src/components/ui/ScreenContracts.tsx` | 221 |

**Dampak:** Kalau nomor WA ganti, harus edit 9 tempat.

**Fix:** Pindahkan ke `NEXT_PUBLIC_WA_NUMBER` di `.env` + constant.

**Effort:** 30 menit

---

### M-4: Missing `loading.tsx` — blank screen saat loading

**Route yang belum ada `loading.tsx`:**

| # | Route | Dampak |
|---|-------|--------|
| 1 | `src/app/guru/kursus/[id]/` | Blank saat buka detail kursus |
| 2 | `src/app/guru/siswa/[id]/` | Blank saat buka detail siswa |
| 3 | `src/app/guru/kursus/[id]/nilai/` | Blank saat buka nilai |
| 4 | `src/app/guru/kursus/[id]/progres/` | Blank saat buka progres |
| 5 | `src/app/siswa/materi/` | Blank saat load materi |
| 6 | `src/app/siswa/materi/[id]/` | Blank saat buka detail materi |
| 7 | `src/app/siswa/cbt/` | Blank saat load CBT |
| 8 | `src/app/siswa/quiz/` | Blank saat load quiz |
| 9 | `src/app/kursus/[slug]/` | Blank saat buka detail kursus publik |
| 10 | `src/app/pembayaran/` | Blank saat load payment |

**Fix:** Tambah `loading.tsx` di setiap route, pakai skeleton dari `src/components/ui/SkeletonBlocks.tsx` yang sudah ada.

**Effort:** 2 jam

---

### M-5: Missing `error.tsx` — 0 file error boundary

**Tidak ada satupun `error.tsx` di seluruh app.**

**Dampak:** Kalau salah satu dashboard crash (misal API error, data null), user lihat blank screen — tidak ada error message, tidak ada retry button, tidak ada jalan keluar.

**Fix Minimal:**
- `src/app/error.tsx` — root error boundary
- `src/app/guru/error.tsx` — dashboard guru
- `src/app/siswa/error.tsx` — dashboard siswa
- `src/app/owner/error.tsx` — dashboard owner
- `src/app/kursus/error.tsx` — katalog publik

**Effort:** 1 jam

---

### M-6: Stale closure di `setInterval` + `useEffect` tanpa cleanup

| # | File | Masalah |
|---|------|---------|
| 1 | `src/app/guru/analytics/page.tsx:56-71` | `useEffect` fetch tanpa cleanup flag — setState on unmounted |
| 2 | `src/app/guru/kursus/page.tsx:30-44` | Sama — fetch tanpa cleanup |
| 3 | `src/app/guru/drafts/[id]/page.tsx:85-99` | `setInterval` dengan `draft` di closure — stale state |
| 4 | `src/app/admin/monitoring/page.tsx:66` | `fetchData` tidak memoized di `setInterval` |

**Fix:** Tambah `let alive = true` pattern atau `AbortController` untuk fetch. Gunakan `useRef` untuk state di interval.

**Effort:** 1 jam

---

### M-7: KKM threshold hardcode

| # | File | Nilai |
|---|------|-------|
| 1 | `src/app/api/v1/guru/analytics/route.ts:107` | `const KKM = 70` |
| 2 | `src/app/api/v1/guru/siswa/[id]/route.ts` | `75` |
| 3 | `src/app/api/v1/guru/kursus/[id]/progres/route.ts` | `56` |
| 4 | `src/app/guru/analytics/page.tsx:358` | Display `(70)` |

**Dampak:** KKM tidak konsisten antar route. Harusnya per-course config.

**Fix:** Pindahkan ke kolom database atau constant.

**Effort:** 30 menit

---

## 🟢 LOW — Nice to have (tidak urgent)

### L-1: 56 halaman `"use client"` — tidak mengikuti best practice

**Yang mana:** Semua halaman dashboard (`/guru/*`, `/siswa/*`, `/owner`, `/admin-sekolah`, `/orang-tua`), `/kursus`, `/quran`, `/game`, `/fitur`, `/tentang`, `/pembayaran`.

**Kenapa ini masalah:** Next.js App Router dirancang agar Server Component sebagai default. Client Component seharusnya hanya untuk interaktivitas (form, animasi, state). Pattern yang benar: `page.tsx` (Server) → fetch data → passing ke Client Component sebagai props.

**Kenapa tidak urgent:** Aplikasi masih jalan, bundle size masih acceptable untuk 0 traffic. Fix ini bisa dikerjakan bertahap seiring refactor fitur.

**Referensi:** [Next.js Server Components docs](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

**Effort:** 3-5 hari (bertahap)

---

### L-2: 40+ arbitrary Tailwind values

Contoh: `py-[13px]`, `py-[15px]`, `rounded-[13px]`, `rounded-[32px]`, `text-[16px]`, `text-[13px]`, `text-[15px]`, `max-w-[1280px]`, `min-w-[120px]`, `min-w-[140px]`, `min-w-[180px]`, `min-h-[44px]`, `max-w-[200px]`, `max-w-[160px]`, `max-w-[36ch]`, `tracking-[0.18em]`, `grid-cols-[1.1fr_0.9fr]`, `w-[50px]`, `h-[50px]`, `rounded-[14px]`, `rounded-[18px]`, `p-[18px]`, `rounded-[24px]`, `rounded-[28px]`, `text-[34px]`, `text-[120px]`, `blur-[120px]`, `blur-[100px]`, `w-[500px]`, `h-[500px]`, `w-[400px]`, `h-[400px]`

**Kenapa ini masalah:** Menyulitkan design system enforcement. Kalau mau ganti spacing system, harus search & replace manual.

**Fix:** Konsolidasi ke `@theme` tokens di `globals.css`. Beberapa sudah tidak bisa (misal blur untuk dekorasi), tapi yang repetitif bisa.

**Effort:** 2 jam

---

### L-3: `optimizePackageImports` belum dikonfigurasi

**File:** `next.config.ts`

**Library yang bisa di-optimize:** `lucide-react` (17+ icon imports di beberapa file)

```ts
experimental: {
  optimizePackageImports: ['lucide-react'],
}
```

**Effort:** 5 menit

---

### L-4: Keystatic layout bypass root layout

**File:** `src/app/keystatic/layout.tsx:59-77`

**Masalah:** Return raw `<html><body>` di access denied — tidak ada CSS, font, metadata.

**Dampak:** Minimal (hanya untuk admin CMS yang di-freeze).

**Effort:** 30 menit

---

## 📊 RINGKASAN

| Prioritas | Jumlah | Estimasi Total |
|-----------|--------|---------------|
| 🔴 HIGH | 2 | 15 menit + 3-5 hari |
| 🟡 MEDIUM | 7 | ~8 jam |
| 🟢 LOW | 4 | ~4 hari (bertahap) |

---

## ⚡ Urutan Pengerjaan yang Disarankan

```
1. H-1: Fix memory leak (15 menit) — quick win, bug nyata
2. M-1: Shared Input + Button (2 jam) — stop duplikasi membesar
3. M-4: Tambah loading.tsx (2 jam) — user experience
4. M-5: Tambah error.tsx (1 jam) — crash protection
5. M-2: Ganti window.location.reload() (1 jam) — UX
6. M-3: Extract WA number (30 menit) — maintenance
7. M-6: Fix stale closure (1 jam) — reliability
8. M-7: KKM threshold (30 menit) — consistency
9. H-2: Setup test (3-5 hari) — safety net
10. L-1: Server Components migration (bertahap)
11. L-2: Arbitrary values consolidation
12. L-3: optimizePackageImports
13. L-4: Keystatic layout fix
```

---

*Katalog ini adalah marker — tidak ada kode yang diubah. Semua file path dan baris sudah diverifikasi dari kode aktual.*