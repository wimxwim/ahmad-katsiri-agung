# Incident Report — 2026-07-08

## Ringkasan
Dua anomali dilaporkan setelah deploy multi-user auth refactor (Gelombang 1):
1. **Login redirect failure** — user kembali ke halaman depan seperti pengunjung baru setelah login
2. **Memory spike** — penggunaan RAM naik 30%→99% dalam ~10 menit setelah kegagalan login

---

## Anomali 1 — Login Redirect ke Halaman Depan

### Severity: 🟡 High

### Root Cause
Di `src/app/masuk/page.tsx` baris 39, pengguna yang **sudah login** dan mengunjungi `/masuk` diarahkan ke `/` (halaman depan publik) alih-alih dashboard sesuai role mereka:

```typescript
// SEBELUM (problem)
if (_ar.success) {
  redirect(redirectTo || "/");  // ← "/" adalah halaman publik!
}
```

Parameter `redirectTo` hanya terisi jika URL mengandung `?redirect=...`. Tanpa itu, logika fallback ke `"/"` yang merupakan landing page publik — bukan dashboard guru/siswa.

### Skenario Terjadinya
1. User login via email → API berhasil → cookie diset → client `window.location.href = "/guru"`
2. Namun middleware edge belum sempat membaca cookie (race condition ringan) → dianggap belum login
3. User diarahkan ke `/masuk?redirect=/guru`
4. Cookie sudah ada → `/masuk/page.tsx` membaca sesi valid
5. `redirectTo` = `/guru` → seharusnya OK jika query param dipertahankan

**Skenario lebih mungkin:** User buka `/masuk` tanpa redirect param → diarahkan ke `/` seperti fresh visitor.

### Fix Diterapkan
```typescript
// SESUDAH (fixed)
import { ROLE_HOME_PATHS } from "@/lib/session";

if (_ar.success) {
  redirect(redirectTo || ROLE_HOME_PATHS[_ar.data.role] || "/");
}
```

Sekarang user yang sudah login dan membuka `/masuk` langsung diarahkan ke dashboard yang sesuai role mereka (guru→`/guru`, siswa→`/siswa`, dll).

### File Berubah
- `src/app/masuk/page.tsx`: import `ROLE_HOME_PATHS`, ganti `"/"` → `ROLE_HOME_PATHS[_ar.data.role]`

---

## Anomali 2 — Memory Spike 30%→99% (Infinite Loop)

### Severity: 🔴 Critical

### Root Cause
Di `src/app/guru/drafts/page.tsx` baris 52-60, `useEffect` memiliki **`[drafts]` sebagai dependency** sementara `load()` di dalamnya memanggil `setDrafts()` yang selalu membuat **array reference baru**. Ini menciptakan infinite re-render cascade:

```typescript
// SEBELUM (problematic)
useEffect(() => {
  load();  // ← setDrafts(data || []) → array reference baru
  const interval = setInterval(() => {
    if (drafts.some(...)) { load(); }  // ← drafts stale di closure
  }, 5000);
  return () => clearInterval(interval);
}, [drafts]);  // ← dependency array reference BERUBAH TIAP RENDER
```

### Mekanisme Cascade
```
Render(1): drafts=[] → effect jalan → load() → setDrafts([...items])
Render(2): drafts=[...items] (baru) → cleanup interval → effect jalan lagi → load() → setDrafts([...items]) (referensi baru!)
Render(3): drafts=[...items] (referensi baru lagi) → ...
→ INFINITE LOOP
```

Setiap siklus: 1 fetch API + 1 re-render React. Dalam 10 menit (600 detik / ~0.5s per siklus) = 1200+ siklus. Akumulasi closure, promise queue, dan fiber tree React menyebabkan memori membengkak.

### Fix Diterapkan
```typescript
// SESUDAH (fixed)
const draftsRef = useRef(drafts);
draftsRef.current = drafts;

useEffect(() => {
  load();
  const interval = setInterval(() => {
    // Baca nilai terkini lewat ref, bukan closure stale
    if (draftsRef.current.some((d) => ["queued", "extracting", "generating"].includes(d.status))) {
      load();
    }
  }, 5000);
  return () => clearInterval(interval);
}, []);  // ← empty deps, effect jalan SEKALI
```

### File Berubah
- `src/app/guru/drafts/page.tsx`:
  - Tambah import `useRef`
  - Tambah `draftsRef` + sync `draftsRef.current`
  - Ubah `useEffect` dependency dari `[drafts]` → `[]`
  - Interval baca `draftsRef.current` alih-alih `drafts` stale

---

## Ringkasan Perubahan

| File | Anomali | Fix |
|------|---------|-----|
| `src/app/masuk/page.tsx` | #1 | Redirect ke dashboard sesuai role, bukan `/` |
| `src/app/guru/drafts/page.tsx` | #2 | `useRef` + empty deps `[]` untuk polling |

## Rekomendasi Pencegahan

1. **ESLint rule:** `react-hooks/exhaustive-deps` — akan menangkap `[drafts]` sebagai dependency yang tidak perlu. Aktifkan di konfigurasi ESLint.
2. **Review pattern polling:** Semua komponen dengan polling interval wajib menggunakan `useRef` + `[]` dependency. Audit komponen serupa.
3. **Memory monitoring:** Tambahkan metrics dasar di dashboard Vercel untuk mendeteksi memory spike dini.
