# 🧠 AKAL CENTER — TODO SUPER STABILIZATION
**Versi:** 1.0 | **Tanggal:** 10 Juli 2026
**Strategi:** Mentor (Read-Only) → Source of Truth → Gap Analysis → Build (Per Epic) → Review
**Agent:** `mentor.md` (analisis) + `build.md` (eksekusi)
**Estimasi Total:** 2-3 minggu | **Token AI:** ~250-400K

> **Instruksi:** Kerjakan URUT per SESI. Jangan lompat. Jangan skip Mentor.
> Setiap SESI = satu sesi AI. Output setiap sesi jadi input sesi berikutnya.
> Tujuan akhir: aplikasi yang KONSISTEN, tidak bikin kesasar, Source of Truth jelas.

---

## ══════════════════════════════════════════
## PRA-SESI: Verifikasi Lingkungan
## ══════════════════════════════════════════

- [ ] **ENV-001** — `npx next build` → pastikan ZERO errors sebelum mulai
- [ ] **ENV-002** — `git status` → pastikan working tree bersih
- [ ] **ENV-003** — `git branch` → pastikan di branch `main`
- [ ] **ENV-004** — Buat branch kerja: `git checkout -b feat/stabilization`
- [ ] **ENV-005** — Baca ulang `AGENTS.md` (semua keputusan D-001 s/d D-017)
- [ ] **ENV-006** — Baca ulang `build.md` (execution protocol, critical rules, design system)
- [ ] **ENV-007** — Baca ulang `mentor.md` (prinsip dasar, katalog skill, metodologi, format laporan)

---

## ══════════════════════════════════════════
## SESI 1: MENTOR — AUDIT TOTAL (Fase 0)
## ══════════════════════════════════════════

**Agent:** `mentor.md` (temperature 0.1)
**Peran:** READ-ONLY. Tidak menulis kode. Tidak mengubah apa pun.
**Estimasi token:** 15-20K
**Output:** Laporan markdown — `docs/AUDIT-KONDISI-SAAT-INI.md`

### Prompt Sesi 1

```
⚠️ JANGAN MENGUBAH KODE. JANGAN MENULIS KODE. Hanya membaca dan melaporkan.

Saya ingin melakukan stabilisasi total terhadap proyek AKAL Center.
Ini adalah SESI PERTAMA dari serangkaian sesi. Tugas kamu: MEMBACA & MELAPORKAN.

Load skill: auth-flow-akal-center, design-taste-frontend, high-end-visual-design,
ui-ux-pro-max, code-review-and-quality, backend-patterns, security-review

BACA file-file berikut secara berurutan (dari disk, bukan dari memori):

## GRUP A: Auth Core (wajib baca semua)
1. src/middleware.ts
2. src/lib/session.ts
3. src/lib/auth.ts
4. src/app/api/v1/auth/login/route.ts
5. src/app/api/v1/auth/logout/route.ts (jika ada)
6. src/app/api/v1/auth/register/route.ts
7. src/app/api/v1/auth/refresh/route.ts (jika ada)

## GRUP B: Entry Pages (wajib baca semua)
8. src/app/(auth)/masuk/page.tsx
9. src/app/(auth)/daftar/page.tsx
10. src/app/layout.tsx
11. src/app/page.tsx (landing)

## GRUP C: Dashboard Layouts (wajib baca semua)
12. src/app/guru/layout.tsx
13. src/app/siswa/layout.tsx
14. src/app/owner/layout.tsx (jika ada)

## GRUP D: Sample Dashboard Pages (baca 2-3 per role)
15. src/app/guru/beranda/page.tsx (atau page.tsx di /guru)
16. src/app/siswa/beranda/page.tsx (atau page.tsx di /siswa)
17. src/app/guru/kursus/page.tsx (jika ada)
18. src/app/siswa/kursus/page.tsx (jika ada)

## GRUP E: API v1 Sample (baca 3-4 endpoint)
19. src/app/api/v1/kursus/route.ts (jika ada)
20. src/app/api/v1/enroll/route.ts (jika ada)
21. src/app/api/v1/guru/route.ts (jika ada)
22. src/app/api/v1/siswa/route.ts (jika ada)

## GRUP F: UI Components (baca 3-4 komponen utama)
23. src/components/layout/Navbar.tsx
24. src/components/layout/Sidebar.tsx (jika ada)
25. src/components/ui/Button.tsx (jika ada)
26. src/lib/utils.ts

Untuk SETIAP file, laporkan:
- Fungsi file ini apa?
- Apakah ada ketidakkonsistenan dengan file lain?
- Apakah ada potensi bug?
- Apakah ada tipe `any`?
- Apakah ada hardcode yang harusnya env var?

GUNAKAN format laporan 6 seksi dari mentor.md:
1. Ringkasan Eksekutif (3-5 kalimat)
2. Temuan per File (dengan kutipan baris spesifik)
3. Klasifikasi Severity (Critical / Required / Nit / Optional / FYI)
4. Ketidakkonsistenan (pola A vs pola B)
5. Technical Debt (TODO, HACK, hardcode, dipaksakan)
6. Keputusan Akhir (Approve / Approve with follow-up / Request changes)

JANGAN memberikan solusi. JANGAN menulis kode perbaikan.
Hanya observasi berbasis bukti.
```

### Checklist Sesi 1

- [ ] **S1-001** — Jalankan prompt di atas di agent `mentor.md`
- [ ] **S1-002** — Simpan output ke `docs/AUDIT-KONDISI-SAAT-INI.md`
- [ ] **S1-003** — Verifikasi: laporan punya 6 seksi lengkap
- [ ] **S1-004** — Verifikasi: setiap temuan punya kutipan file:baris

---

## ══════════════════════════════════════════
## SESI 2: MENTOR — SOURCE OF TRUTH (Fase 1)
## ══════════════════════════════════════════

**Agent:** `mentor.md` (temperature 0.1)
**Peran:** READ-ONLY. Membuat dokumen referensi.
**Estimasi token:** 10-15K
**Input:** `docs/AUDIT-KONDISI-SAAT-INI.md` (dari Sesi 1)
**Output:** Dokumen — `docs/SOURCE-OF-TRUTH.md`

### Prompt Sesi 2

```
⚠️ JANGAN MENGUBAH KODE. Output hanya dokumen.

Berdasarkan laporan audit di docs/AUDIT-KONDISI-SAAT-INI.md, buat
DOKUMEN "SOURCE OF TRUTH" untuk AKAL Center.

Load skill: auth-flow-akal-center, backend-patterns, site-architecture

Dokumen ini adalah KONTRAK. Semua perbaikan nanti HARUS mengikuti dokumen ini.
Dokumen ini menjawab: "Bagaimana aplikasi ini SEHARUSNYA bekerja?"

BAGIAN WAJIB:

## 1. ALUR AUTH LENGKAP (Flow Chart ASCII)
```
Landing (/) — publik
  |
  v
Klik "Masuk" → /masuk?portal=guru ATAU /masuk?portal=siswa
  |
  v
Form login (email + password)
  |
  v
POST /api/v1/auth/login
  |
  v
Server: validasi email+password → JWT access token dibuat (15 menit)
  |
  v
Cookie "session" di-set (httpOnly, secure, sameSite=lax, path=/)
  |
  v
Response: { success: true, data: { user: {...}, redirectTo: "/guru" | "/siswa" } }
  |
  v
Client: redirect ke dashboard sesuai role
  |
  v
Middleware: baca cookie "session" → decode JWT → set header:
  x-user-id, x-user-role, x-user-email, x-user-nama
  |
  v
Dashboard: layout.tsx baca headers → render
  |
  v
Refresh halaman: middleware validasi ulang → OK (session masih hidup)
  |
  v
Logout: POST /api/v1/auth/logout → cookie "session" dihapus → redirect /
```

## 2. KONTRAK DATA (Data Contract)

### Response API — Format BENAR:
```typescript
// Sukses
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string, details?: unknown } }
```

### HTTP Status Codes:
- 200: OK (GET, PUT, PATCH sukses)
- 201: Created (POST sukses)
- 400: Bad Request (validasi gagal)
- 401: Unauthorized (belum login)
- 403: Forbidden (role salah)
- 404: Not Found
- 409: Conflict (duplicate)
- 500: Internal Server Error

### Cookie:
- Nama: "session"
- httpOnly: true
- secure: true (production) / false (development)
- sameSite: "lax"
- path: "/"
- maxAge: 15 menit (access token)

### Header (di-set oleh middleware):
- x-user-id: string (UUID)
- x-user-role: "guru" | "siswa" | "owner" | "admin_sekolah" | "orang_tua"
- x-user-email: string
- x-user-nama: string

## 3. ATURAN ROUTING

| Route | Access | Middleware Guard |
|-------|--------|-----------------|
| / | publik | tidak ada |
| /masuk | publik | tidak ada |
| /daftar | publik | tidak ada |
| /kursus | publik | tidak ada |
| /fitur | publik | tidak ada |
| /harga | publik | tidak ada |
| /tentang | publik | tidak ada |
| /guru/* | guru ONLY | role = "guru" |
| /siswa/* | siswa ONLY | role = "siswa" |
| /owner/* | owner ONLY | role = "owner" |
| /admin-sekolah/* | admin_sekolah ONLY | role = "admin_sekolah" |
| /orang-tua/* | orang_tua ONLY | role = "orang_tua" |

Jika role tidak cocok dengan route prefix → 403 Forbidden (bukan redirect diam-diam).

## 4. KONVENSI FRONTEND (dari AGENTS.md + build.md)

### Design System:
- Warna: primary=#005231 | tertiary=#5a4200 | surface=#f2fcf7
- Glass: bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px]
- Border: rgba(27,107,69,0.15)
- Radius: sm:0.25rem md:0.75rem lg:1rem xl:1.5rem custom:32px-80px
- Shadows: shadow-glass | shadow-glass-lg | shadow-glass-xl

### Font:
- Heading: Bricolage Grotesque
- Body: Inter
- Quran: Amiri
- Code: JetBrains Mono

### Animasi:
- Ease curve: [0.16, 1, 0.3, 1] as const
- Duration: 0.5-0.7s
- Stagger delay: 0.08-0.15
- Hero: initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}
- Scroll reveal: whileInView + viewport={{ once:true }}

### Layout:
- Mobile-first: px-3 sm:px-5 lg:px-8
- cn() dari src/lib/utils.ts untuk className kondisional
- TIDAK BOLEH pakai `any` type

## 5. STATE MANAGEMENT
- Data user: dari server headers (x-user-*), dibaca di layout.tsx atau server component
- UI state lokal: useState
- TIDAK BOLEH menyimpan password/token/secret di localStorage/sessionStorage
- TIDAK BOLEH fetch user dari client-side (gunakan headers dari middleware)

## 6. KONVENSI BACKEND

### Struktur API Route:
```typescript
// src/app/api/v1/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({ ... })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() } },
        { status: 400 }
      )
    }
    // ... business logic ...
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    )
  }
}
```

### Middleware:
- Cek cookie "session" → decode JWT → set x-user-* headers
- Cek role vs route prefix → 403 jika mismatch
- TIDAK redirect diam-diam lintas role

OUTPUT: SATU file markdown. Simpan ke docs/SOURCE-OF-TRUTH.md.
Bukan kode. Bukan perbaikan. Hanya dokumen referensi.
```

### Checklist Sesi 2

- [ ] **S2-001** — Jalankan prompt di atas di agent `mentor.md`
- [ ] **S2-002** — Simpan output ke `docs/SOURCE-OF-TRUTH.md`
- [ ] **S2-003** — Verifikasi: dokumen punya 6 bagian lengkap
- [ ] **S2-004** — Verifikasi: flow chart auth bisa dibaca dengan jelas

---

## ══════════════════════════════════════════
## SESI 3: MENTOR — GAP ANALYSIS (Fase 2)
## ══════════════════════════════════════════

**Agent:** `mentor.md` (temperature 0.1)
**Peran:** READ-ONLY. Membandingkan dua dokumen.
**Estimasi token:** 8-12K
**Input:** `docs/AUDIT-KONDISI-SAAT-INI.md` + `docs/SOURCE-OF-TRUTH.md`
**Output:** Dokumen — `docs/GAP-ANALYSIS.md`

### Prompt Sesi 3

```
⚠️ JANGAN MENGUBAH KODE. Hanya analisis gap.

Load skill: code-review-and-quality, auth-flow-akal-center

Bandingkan laporan audit (docs/AUDIT-KONDISI-SAAT-INI.md) dengan
Source of Truth (docs/SOURCE-OF-TRUTH.md).

Temukan SEMUA ketidaksesuaian. Format:

| # | Flow | Seharusnya | Kenyataan | Gap | Severity | File |
|---|------|-----------|-----------|-----|----------|------|

KELOMPOKKAN berdasarkan severity:

### 🔴 CRITICAL — menyebabkan error/redirect loop/blank page/security hole
### 🟡 HIGH — inkonsistensi yang membingungkan user
### 🟢 LOW — ketidakrapian kosmetik

Untuk setiap gap, tulis:
- Apa yang seharusnya terjadi (dari Source of Truth)
- Apa yang sebenarnya terjadi (dari Audit)
- Di file mana gap ini berada
- Apa dampaknya ke user

JANGAN memberikan solusi. JANGAN menulis kode perbaikan.
Hanya daftar gap yang terverifikasi.

Simpan ke docs/GAP-ANALYSIS.md.
```

### Checklist Sesi 3

- [ ] **S3-001** — Jalankan prompt di atas di agent `mentor.md`
- [ ] **S3-002** — Simpan output ke `docs/GAP-ANALYSIS.md`
- [ ] **S3-003** — Verifikasi: semua gap punya severity + file + dampak
- [ ] **S3-004** — Verifikasi: gap diurutkan dari yang paling critical

---

## ══════════════════════════════════════════
## SESI 4: BUILD — EPIC 1: Auth Foundation
## ══════════════════════════════════════════

**Agent:** `build.md` (temperature 0.2)
**Peran:** WRITE. Hanya mengubah file yang disebutkan.
**Estimasi token:** 20-40K
**Input:** `docs/SOURCE-OF-TRUTH.md` + `docs/GAP-ANALYSIS.md`
**Target:** Semua gap 🔴 CRITICAL di area Auth

### Prompt Sesi 4

```
⚠️ KONTEKS: Baca dulu docs/SOURCE-OF-TRUTH.md dan docs/GAP-ANALYSIS.md.

Load skill: auth-flow-akal-center, security-review, backend-patterns

TUGAS: Perbaiki Epic 1 — Auth Foundation.

HANYA file-file ini yang boleh disentuh:
- src/middleware.ts
- src/lib/session.ts
- src/lib/auth.ts
- src/app/api/v1/auth/login/route.ts
- src/app/api/v1/auth/logout/route.ts (atau buat jika belum ada)
- src/app/api/v1/auth/register/route.ts (jika ada)

TARGET (dari Source of Truth):
1. Cookie harus bernama "session" (httpOnly, secure, sameSite=lax, path=/)
2. JWT access token masa berlaku 15 menit
3. Middleware harus decode JWT dari cookie, set x-user-* headers:
   x-user-id, x-user-role, x-user-email, x-user-nama
4. Login response format: { success: true, data: { user, redirectTo } }
5. Logout harus menghapus cookie "session" dan redirect ke /
6. Role guard: akses /guru/* oleh siswa → 403 Forbidden (bukan redirect)
7. Role guard: akses /siswa/* oleh guru → 403 Forbidden (bukan redirect)
8. Middleware harus handle role: guru, siswa, owner, admin_sekolah, orang_tua

ATURAN:
- JANGAN ubah file selain yang disebutkan di atas
- JANGAN tambah library baru
- JANGAN ubah design system (warna, font, animasi)
- JANGAN pakai `any` type
- JANGAN tambah komentar (kecuali bug fix annotation)
- GUNAKAN cn() dari src/lib/utils.ts untuk className kondisional
- GUNAKAN ease curve: [0.16, 1, 0.3, 1] as const

EXECUTION PROTOCOL:
1. READ: Baca semua file yang akan disentuh (dari disk, bukan memori)
2. TRACE: Map setiap import, caller, data flow
3. PLAN: State apa yang diubah, kenapa, apa yang bisa break
4. EXECUTE: Tulis perubahan minimal, precise
5. VERIFY: npx next build → ZERO errors
6. REPORT: File diubah, alasan, next step

Setelah selesai: jalankan npx next build. Kalau gagal → perbaiki sampai hijau.
Kalau build hijau → laporkan: file apa yang diubah, apa yang diperbaiki.
```

### Checklist Sesi 4

- [ ] **S4-001** — Jalankan prompt di atas di agent `build.md`
- [ ] **S4-002** — `npx next build` → ZERO errors
- [ ] **S4-003** — Test manual: login guru → masuk dashboard guru
- [ ] **S4-004** — Test manual: login siswa → masuk dashboard siswa
- [ ] **S4-005** — Test manual: login guru → akses /siswa → 403
- [ ] **S4-006** — Test manual: login siswa → akses /guru → 403
- [ ] **S4-007** — Test manual: logout → cookie hilang → redirect /
- [ ] **S4-008** — Test manual: refresh halaman → session tetap hidup

---

## ══════════════════════════════════════════
## SESI 5: MENTOR — REVIEW EPIC 1
## ══════════════════════════════════════════

**Agent:** `mentor.md` (temperature 0.1)
**Peran:** READ-ONLY. Review hasil Epic 1.
**Estimasi token:** 5-8K
**Input:** `docs/SOURCE-OF-TRUTH.md` + hasil kerja Sesi 4

### Prompt Sesi 5

```
⚠️ JANGAN MENGUBAH KODE. Hanya review.

Load skill: code-review-and-quality, auth-flow-akal-center, security-review

Review hasil Epic 1 (Auth Foundation) yang baru selesai.

BACA file-file yang diubah di Epic 1:
- src/middleware.ts
- src/lib/session.ts
- src/lib/auth.ts
- src/app/api/v1/auth/login/route.ts
- src/app/api/v1/auth/logout/route.ts
- src/app/api/v1/auth/register/route.ts (jika diubah)

Bandingkan dengan Source of Truth (docs/SOURCE-OF-TRUTH.md):

1. Apakah cookie sudah bernama "session"?
2. Apakah middleware sudah set x-user-* headers dengan benar?
3. Apakah login response format sudah sesuai?
4. Apakah logout sudah menghapus cookie?
5. Apakah role guard sudah berfungsi (403 untuk mismatch)?
6. Apakah ada tipe `any` yang tersisa?
7. Apakah ada regression? (yang tadinya jalan sekarang rusak?)

GUNAKAN format laporan 6 seksi dari mentor.md.
Keputusan akhir: Approve / Approve with follow-up / Request changes.
```

### Checklist Sesi 5

- [ ] **S5-001** — Jalankan prompt di atas di agent `mentor.md`
- [ ] **S5-002** — Jika "Approve" → lanjut ke Epic 2
- [ ] **S5-003** — Jika "Request changes" → ulangi Sesi 4 dengan feedback dari Sesi 5
- [ ] **S5-004** — Jika "Approve with follow-up" → catat follow-up, lanjut ke Epic 2

---

## ══════════════════════════════════════════
## SESI 6: BUILD — EPIC 2: Frontend Foundation
## ══════════════════════════════════════════

**Agent:** `build.md` (temperature 0.2)
**Peran:** WRITE. Konsolidasi komponen UI.
**Estimasi token:** 20-40K
**Input:** `docs/SOURCE-OF-TRUTH.md` + `docs/GAP-ANALYSIS.md`
**Target:** Semua gap 🟡 HIGH di area Frontend

### Prompt Sesi 6

```
⚠️ KONTEKS: Baca docs/SOURCE-OF-TRUTH.md dan docs/GAP-ANALYSIS.md.

Load skill: design-taste-frontend, high-end-visual-design, ui-ux-pro-max,
vercel-react-best-practices

TUGAS: Perbaiki Epic 2 — Frontend Foundation.

⚠️ PENTING: Ikuti DESIGN SYSTEM AKAL CENTER yang SUDAH ADA.
JANGAN ganti font, warna, animation framework, atau design tokens.
Yang sudah ada:
- Font: Bricolage Grotesque (heading), Inter (body)
- Warna: primary=#005231, tertiary=#5a4200, surface=#f2fcf7
- Animasi: motion/react dengan ease [0.16, 1, 0.3, 1]
- Glass: bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px]

FOKUS perbaikan (dari Gap Analysis):

## 1. Konsistensi Komponen
- Button: semua tombol harus pakai variant yang konsisten (primary, secondary, ghost, outline)
- Input: semua input harus pakai styling yang sama
- Modal: semua modal harus pakai pattern yang sama
- Card: semua card harus pakai bg-glass pattern

## 2. Empty State
- Semua halaman yang menampilkan list → harus ada empty state ("Belum ada data")
- Empty state harus ada CTA (mis: "Mulai Kursus Pertama")

## 3. Error State
- Semua halaman yang fetch data → harus ada error state ("Gagal memuat data")
- Error state harus ada tombol "Coba Lagi"

## 4. Loading State
- Semua halaman yang fetch data → harus ada loading skeleton
- Bukan spinner kosong, tapi skeleton yang menyerupai konten

## 5. Responsive
- Mobile-first: px-3 sm:px-5 lg:px-8
- Sidebar: di mobile jadi drawer, di desktop tetap terlihat
- Navbar: di mobile hamburger menu, di desktop full nav

## 6. 404 Page
- Custom 404 page dengan design AKAL Center
- Ada tombol "Kembali ke Beranda"

## 7. Error Boundary
- Global error boundary dengan reset button
- Pesan error yang manusiawi (bukan stack trace)

ATURAN:
- JANGAN ubah file auth (middleware, session, auth, login/logout)
- JANGAN tambah library baru
- JANGAN ubah design system
- JANGAN pakai `any` type
- GUNAKAN cn() untuk className kondisional
- Mobile-first: px-3 sm:px-5 lg:px-8

EXECUTION PROTOCOL: READ → TRACE → PLAN → EXECUTE → VERIFY (npx next build) → REPORT
```

### Checklist Sesi 6

- [ ] **S6-001** — Jalankan prompt di atas di agent `build.md`
- [ ] **S6-002** — `npx next build` → ZERO errors
- [ ] **S6-003** — Test: semua halaman ada empty state (list kosong)
- [ ] **S6-004** — Test: semua halaman ada error state (fetch gagal)
- [ ] **S6-005** — Test: semua halaman ada loading state (skeleton)
- [ ] **S6-006** — Test: mobile responsive (px-3, hamburger menu)
- [ ] **S6-007** — Test: 404 page custom muncul
- [ ] **S6-008** — Test: error boundary menangkap error

---

## ══════════════════════════════════════════
## SESI 7: MENTOR — REVIEW EPIC 2
## ══════════════════════════════════════════

**Agent:** `mentor.md` (temperature 0.1)
**Peran:** READ-ONLY. Review hasil Epic 2.
**Estimasi token:** 5-8K

### Prompt Sesi 7

```
⚠️ JANGAN MENGUBAH KODE. Hanya review.

Load skill: code-review-and-quality, design-taste-frontend, high-end-visual-design,
ui-ux-pro-max, vercel-react-best-practices

Review hasil Epic 2 (Frontend Foundation).

BACA komponen-komponen yang diubah. Bandingkan dengan Source of Truth.

1. Apakah komponen konsisten? (Button, Input, Modal, Card, Navbar, Sidebar)
2. Apakah empty/error/loading state sudah ada di semua halaman?
3. Apakah mobile-first: px-3 sm:px-5 lg:px-8?
4. Apakah cn() dipakai untuk className kondisional?
5. Apakah animasi pakai ease [0.16, 1, 0.3, 1]?
6. Apakah ada warna/font hardcode di luar design system?
7. Apakah ada tipe `any`?
8. Apakah 404 page dan error boundary berfungsi?

GUNAKAN format laporan 6 seksi dari mentor.md.
Keputusan akhir: Approve / Approve with follow-up / Request changes.
```

### Checklist Sesi 7

- [ ] **S7-001** — Jalankan prompt di atas di agent `mentor.md`
- [ ] **S7-002** — Approve → lanjut ke Epic 3
- [ ] **S7-003** — Request changes → ulangi Sesi 6

---

## ══════════════════════════════════════════
## SESI 8: BUILD — EPIC 3: Routing & Guard
## ══════════════════════════════════════════

**Agent:** `build.md` (temperature 0.2)
**Peran:** WRITE. Perbaiki routing, redirect, guard.
**Estimasi token:** 15-25K
**Input:** `docs/SOURCE-OF-TRUTH.md` + `docs/GAP-ANALYSIS.md`

### Prompt Sesi 8

```
⚠️ KONTEKS: Baca docs/SOURCE-OF-TRUTH.md dan docs/GAP-ANALYSIS.md.

Load skill: auth-flow-akal-center, site-architecture

TUGAS: Perbaiki Epic 3 — Routing & Guard.

HANYA file-file ini yang boleh disentuh:
- Semua layout.tsx di dashboard (/guru, /siswa, /owner, /admin-sekolah, /orang-tua)
- Semua redirect logic
- 404 page (src/app/not-found.tsx)
- Error boundary (src/app/error.tsx)

TARGET (dari Source of Truth):
1. / → publik, tidak ada guard
2. /masuk → publik, tidak ada guard
3. /daftar → publik, tidak ada guard
4. /kursus → publik, tidak ada guard
5. /guru/* → guru ONLY, 403 jika bukan guru
6. /siswa/* → siswa ONLY, 403 jika bukan siswa
7. /owner/* → owner ONLY, 403 jika bukan owner
8. /admin-sekolah/* → admin_sekolah ONLY
9. /orang-tua/* → orang_tua ONLY
10. Setelah login → redirect ke dashboard sesuai role (BUKAN ke /)
11. Akses halaman auth (/masuk, /daftar) saat sudah login → redirect ke dashboard
12. Dynamic route → loading.tsx ada
13. 404 → custom page dengan design AKAL Center
14. Error → global error boundary

ATURAN:
- JANGAN ubah middleware, session, auth, atau komponen UI
- JANGAN tambah library baru
- JANGAN redirect diam-diam lintas role (harus 403 Forbidden)
- GUNAKAN cn() untuk className kondisional

EXECUTION PROTOCOL: READ → TRACE → PLAN → EXECUTE → VERIFY (npx next build) → REPORT
```

### Checklist Sesi 8

- [ ] **S8-001** — Jalankan prompt di atas di agent `build.md`
- [ ] **S8-002** — `npx next build` → ZERO errors
- [ ] **S8-003** — Test: akses / → tampil landing
- [ ] **S8-004** — Test: akses /masuk → tampil login
- [ ] **S8-005** — Test: akses /guru tanpa login → redirect ke /masuk
- [ ] **S8-006** — Test: akses /siswa sebagai guru → 403
- [ ] **S8-007** — Test: akses /guru sebagai siswa → 403
- [ ] **S8-008** — Test: akses /masuk saat sudah login → redirect ke dashboard
- [ ] **S8-009** — Test: akses /asdfgh → 404 custom
- [ ] **S8-010** — Test: dynamic route → loading.tsx muncul

---

## ══════════════════════════════════════════
## SESI 9: MENTOR — REVIEW EPIC 3
## ══════════════════════════════════════════

**Agent:** `mentor.md` (temperature 0.1)
**Estimasi token:** 5-8K

### Prompt Sesi 9

```
⚠️ JANGAN MENGUBAH KODE. Hanya review.

Load skill: code-review-and-quality, auth-flow-akal-center, site-architecture

Review hasil Epic 3 (Routing & Guard).

BACA semua layout.tsx yang diubah. Bandingkan dengan Source of Truth.

1. Apakah semua route publik bisa diakses tanpa login?
2. Apakah semua route dashboard terproteksi dengan role guard?
3. Apakah login redirect ke dashboard yang benar?
4. Apakah akses /masuk saat sudah login redirect ke dashboard?
5. Apakah 404 custom page berfungsi?
6. Apakah error boundary berfungsi?
7. Apakah ada route yang tidak sesuai dengan Source of Truth?

GUNAKAN format laporan 6 seksi dari mentor.md.
Keputusan akhir: Approve / Approve with follow-up / Request changes.
```

### Checklist Sesi 9

- [ ] **S9-001** — Jalankan prompt di atas di agent `mentor.md`
- [ ] **S9-002** — Approve → lanjut ke Epic 4
- [ ] **S9-003** — Request changes → ulangi Sesi 8

---

## ══════════════════════════════════════════
## SESI 10: BUILD — EPIC 4: Dashboard Guru
## ══════════════════════════════════════════

**Agent:** `build.md` (temperature 0.2)
**Estimasi token:** 20-35K
**Input:** `docs/SOURCE-OF-TRUTH.md` + `docs/GAP-ANALYSIS.md`

### Prompt Sesi 10

```
⚠️ KONTEKS: Baca docs/SOURCE-OF-TRUTH.md dan docs/GAP-ANALYSIS.md.

Load skill: design-taste-frontend, high-end-visual-design, backend-patterns, vercel-react-best-practices

TUGAS: Perbaiki Epic 4 — Dashboard Guru.

HANYA file-file di /guru/* yang boleh disentuh:
- src/app/guru/layout.tsx
- src/app/guru/beranda/page.tsx
- src/app/guru/kursus/page.tsx
- src/app/guru/siswa/page.tsx
- src/app/guru/upload/page.tsx
- src/app/guru/drafts/page.tsx
- src/app/guru/nilai/page.tsx
- src/app/guru/sertifikat/page.tsx
- src/app/guru/analytics/page.tsx
- src/app/guru/kelas/page.tsx

TARGET:
1. Konsisten dengan design system AKAL Center
2. Empty state untuk setiap halaman list
3. Error state untuk setiap halaman yang fetch data
4. Loading skeleton untuk setiap halaman
5. Mobile responsive
6. Breadcrumb atau navigasi yang jelas (user tidak kesasar)
7. Data guru diambil dari x-user-* headers (bukan client fetch)

ATURAN:
- JANGAN ubah file di luar /guru/*
- JANGAN ubah middleware, session, auth
- JANGAN tambah library baru
- JANGAN ubah design system
- GUNAKAN cn() untuk className kondisional
- Mobile-first: px-3 sm:px-5 lg:px-8

EXECUTION PROTOCOL: READ → TRACE → PLAN → EXECUTE → VERIFY (npx next build) → REPORT
```

### Checklist Sesi 10

- [ ] **S10-001** — Jalankan prompt di atas di agent `build.md`
- [ ] **S10-002** — `npx next build` → ZERO errors
- [ ] **S10-003** — Test: navigasi dashboard guru jelas (tidak kesasar)
- [ ] **S10-004** — Test: semua halaman ada empty/error/loading state
- [ ] **S10-005** — Test: mobile responsive

---

## ══════════════════════════════════════════
## SESI 11: BUILD — EPIC 5: Dashboard Siswa
## ══════════════════════════════════════════

**Agent:** `build.md` (temperature 0.2)
**Estimasi token:** 20-35K

### Prompt Sesi 11

```
⚠️ KONTEKS: Baca docs/SOURCE-OF-TRUTH.md dan docs/GAP-ANALYSIS.md.

Load skill: design-taste-frontend, high-end-visual-design, backend-patterns, vercel-react-best-practices

TUGAS: Perbaiki Epic 5 — Dashboard Siswa.

HANYA file-file di /siswa/* yang boleh disentuh:
- src/app/siswa/layout.tsx
- src/app/siswa/beranda/page.tsx
- src/app/siswa/kursus/page.tsx
- src/app/siswa/materi/page.tsx
- src/app/siswa/quiz/page.tsx
- src/app/siswa/cbt/page.tsx
- src/app/siswa/progres/page.tsx
- src/app/siswa/pengumuman/page.tsx
- src/app/siswa/payment/page.tsx

TARGET: Sama seperti Epic 4 (konsistensi, empty/error/loading state, mobile, navigasi jelas)

ATURAN: Sama seperti Epic 4. JANGAN ubah file di luar /siswa/*.

EXECUTION PROTOCOL: READ → TRACE → PLAN → EXECUTE → VERIFY (npx next build) → REPORT
```

### Checklist Sesi 11

- [ ] **S11-001** — Jalankan prompt di atas di agent `build.md`
- [ ] **S11-002** — `npx next build` → ZERO errors
- [ ] **S11-003** — Test: navigasi dashboard siswa jelas (tidak kesasar)
- [ ] **S11-004** — Test: semua halaman ada empty/error/loading state
- [ ] **S11-005** — Test: mobile responsive

---

## ══════════════════════════════════════════
## SESI 12: BUILD — EPIC 6: API Consistency
## ══════════════════════════════════════════

**Agent:** `build.md` (temperature 0.2)
**Estimasi token:** 15-25K

### Prompt Sesi 12

```
⚠️ KONTEKS: Baca docs/SOURCE-OF-TRUTH.md dan docs/GAP-ANALYSIS.md.

Load skill: backend-patterns, code-review-and-quality

TUGAS: Perbaiki Epic 6 — API Consistency.

HANYA file-file API yang boleh disentuh (semua di src/app/api/v1/).

TARGET (dari Source of Truth):
1. Semua response harus format: { success: true, data: T } atau { success: false, error: { code, message, details? } }
2. Semua input harus divalidasi dengan Zod
3. Semua error harus di-handle (try-catch)
4. HTTP status code harus sesuai:
   - 200: OK, 201: Created
   - 400: Bad Request, 401: Unauthorized, 403: Forbidden
   - 404: Not Found, 409: Conflict, 500: Internal Server Error
5. TIDAK boleh ada response mentah (tanpa wrapper)
6. TIDAK boleh ada error yang tidak di-handle (unhandled rejection)

ATURAN:
- JANGAN ubah file di luar src/app/api/v1/
- JANGAN ubah middleware, session, auth, komponen UI
- JANGAN tambah library baru
- JANGAN pakai `any` type

EXECUTION PROTOCOL: READ → TRACE → PLAN → EXECUTE → VERIFY (npx next build) → REPORT
```

### Checklist Sesi 12

- [ ] **S12-001** — Jalankan prompt di atas di agent `build.md`
- [ ] **S12-002** — `npx next build` → ZERO errors
- [ ] **S12-003** — Test: semua API response pakai format { success, data/error }
- [ ] **S12-004** — Test: semua input divalidasi Zod
- [ ] **S12-005** — Test: semua error di-handle (tidak ada unhandled rejection)

---

## ══════════════════════════════════════════
## SESI 13: MENTOR — FINAL REVIEW (Epic 4-6)
## ══════════════════════════════════════════

**Agent:** `mentor.md` (temperature 0.1)
**Estimasi token:** 10-15K

### Prompt Sesi 13

```
⚠️ JANGAN MENGUBAH KODE. Hanya review final.

Load skill: code-review-and-quality, auth-flow-akal-center, design-taste-frontend,
high-end-visual-design, backend-patterns, security-review

Review FINAL seluruh hasil stabilisasi (Epic 1-6).

BACA ulang Source of Truth (docs/SOURCE-OF-TRUTH.md).

Bandingkan kondisi SEKARANG dengan Source of Truth:

1. Apakah auth flow sudah sesuai? (login → JWT → cookie → middleware → dashboard)
2. Apakah frontend sudah konsisten? (komponen, empty/error/loading state)
3. Apakah routing sudah benar? (publik vs protected, role guard)
4. Apakah dashboard guru dan siswa sudah jelas? (tidak bikin kesasar)
5. Apakah API sudah konsisten? (response format, Zod, error handling)
6. Apakah ada regression?
7. Apakah build hijau?

GUNAKAN format laporan 6 seksi dari mentor.md.

TULIS rekomendasi: apa yang sudah baik, apa yang masih perlu follow-up.

Keputusan akhir: Approve (siap merge) / Approve with follow-up (merge tapi ada catatan) /
Request changes (belum siap merge).
```

### Checklist Sesi 13

- [ ] **S13-001** — Jalankan prompt di atas di agent `mentor.md`
- [ ] **S13-002** — Jika "Approve" → lanjut ke SESI 14 (merge)
- [ ] **S13-003** — Jika "Request changes" → perbaiki epic yang bermasalah

---

## ══════════════════════════════════════════
## SESI 14: MERGE & DEPLOY
## ══════════════════════════════════════════

- [ ] **MRG-001** — `git add -A`
- [ ] **MRG-002** — `git commit -m "feat: stabilization epic 1-6 — auth, frontend, routing, dashboard, API"`
- [ ] **MRG-003** — `git checkout main`
- [ ] **MRG-004** — `git merge feat/stabilization`
- [ ] **MRG-005** — `npx next build` → ZERO errors (cek ulang)
- [ ] **MRG-006** — `git push origin main`
- [ ] **MRG-007** — `npx vercel --prod --yes`
- [ ] **MRG-008** — Test production: https://akalcenter.my.id
- [ ] **MRG-009** — Test: login guru → dashboard guru → OK
- [ ] **MRG-010** — Test: login siswa → dashboard siswa → OK
- [ ] **MRG-011** — Test: akses salah role → 403 → OK
- [ ] **MRG-012** — Test: logout → redirect / → OK

---

## ══════════════════════════════════════════
## 📊 RINGKASAN: Urutan Eksekusi
## ══════════════════════════════════════════

```
PRA-SESI: Verifikasi lingkungan (build hijau, git bersih)

SESI 1  (MENTOR): Audit total → docs/AUDIT-KONDISI-SAAT-INI.md
SESI 2  (MENTOR): Source of Truth → docs/SOURCE-OF-TRUTH.md
SESI 3  (MENTOR): Gap Analysis → docs/GAP-ANALYSIS.md

SESI 4  (BUILD):  Epic 1 — Auth Foundation
SESI 5  (MENTOR): Review Epic 1

SESI 6  (BUILD):  Epic 2 — Frontend Foundation
SESI 7  (MENTOR): Review Epic 2

SESI 8  (BUILD):  Epic 3 — Routing & Guard
SESI 9  (MENTOR): Review Epic 3

SESI 10 (BUILD):  Epic 4 — Dashboard Guru
SESI 11 (BUILD):  Epic 5 — Dashboard Siswa
SESI 12 (BUILD):  Epic 6 — API Consistency

SESI 13 (MENTOR): Final Review (Epic 4-6)

SESI 14: Merge & Deploy
```

```
ESTIMASI TOKEN AI:
  Mentor (Sesi 1-3, 5, 7, 9, 13): ~60-90K token
  Build  (Sesi 4, 6, 8, 10-12):   ~120-200K token
  TOTAL:                            ~180-290K token
```

---

## ══════════════════════════════════════════
## ⚠️ ATURAN EMAS (JANGAN DILANGGAR)
## ══════════════════════════════════════════

1. **JANGAN SKIP MENTOR.** Setiap Build WAJIB didahului Mentor.
2. **JANGAN CAMPUR Mentor dan Build.** Mentor = read-only. Build = write-only.
3. **JANGAN SKIP REVIEW.** Setiap Epic WAJIB direview sebelum lanjut.
4. **JANGAN "SEKALIAN".** Satu Epic = satu fokus. Jangan "sekalian perbaiki yang lain."
5. **JANGAN UBAH DESIGN SYSTEM.** Warna, font, animasi SUDAH FINAL.
6. **JANGAN TAMBAH LIBRARY BARU.** Tanpa izin eksplisit.
7. **JANGAN PAKAI `any`.** Semua tipe harus eksplisit.
8. **BUILD HIJAU = WAJIB.** `npx next build` harus ZERO errors sebelum lanjut.
9. **GIT BERSIH = WAJIB.** Commit setelah setiap Epic selesai.
10. **SOURCE OF TRUTH = ALKITAB.** Semua perubahan harus mengacu ke docs/SOURCE-OF-TRUTH.md.

---

*TODO-SUPER-STABILIZATION.md — AKAL Center*
*Strategi: Mentor → Source of Truth → Gap → Build per Epic → Review*
*14 Sesi | 2-3 Minggu | ~250K Token AI*