# CATATAN DISKUSI — AKAL Center
**Tanggal:** 6 Juli 2026
**Mode:** Diskusi Project (3 Siklus Penuh)
**Status:** CATATAN SAJA — BELUM DIEKSEKUSI

---

## 1. RINGKASAN KONDISI SAAT INI

| Aspek | Skor | Status |
|-------|------|--------|
| Security | 9/10 | ✅ CSP, HSTS, JWT, rate limiting, Zod |
| UI/UX | 8/10 | ✅ Glass morphism, mobile-first, animasi halus |
| Content | 9/10 | ✅ 14 bab, 8 bank soal HOTS, quiz engine |
| Architecture | 8/10 | ✅ Next.js 16 App Router, clean code |
| Auth | 5/10 | ⚠️ JWT ada, tidak ada registrasi flow |
| Database | 4/10 | ⚠️ Google Sheets (rapuh, tidak scalable) |
| AI Integration | 0/10 | ❌ Tidak ada |
| Perangkat Ajar Generator | 0/10 | ❌ BELUM ADA (killer feature) |
| Multi-Guru | 0/10 | ❌ Single-guru hardcoded |
| Payment | 0/10 | ❌ Tidak ada |
| SEO | 2/10 | 🔥 noindex memblokir semua halaman |

---

## 2. TEMUAN KRITIS DARI SCAN WEBSITE

### 2.1 SEO — CRITICAL
- `noindex, nofollow` di meta tag robots memblokir SEMUA halaman dari Google
- Auth gate (proxy.ts) redirect SEMUA halaman ke `/login` (307)
- Tidak ada JSON-LD structured data
- Tidak ada canonical tags
- Sitemap 27 URL tapi semua redirect ke login
- Typo di og:author: "Aggung" (seharusnya "Agung")

### 2.2 Security — EXCELLENT
- CSP nonce strict-dynamic ✅
- HSTS max-age=31536000; includeSubDomains; preload ✅
- X-Frame-Options: DENY ✅
- X-Content-Type-Options: nosniff ✅
- Referrer-Policy: strict-origin-when-cross-origin ✅
- Rate limiting in-memory ✅
- Zod validation ✅

### 2.3 API Endpoints
- `/api/doa` → ✅ 200 OK
- `/api/siswa/cek` → ⚠️ 405 (butuh POST)
- `/api/kuis/selesai` → ⚠️ 405 (butuh POST)
- `/api/kuis/rekap` → 🔒 403 (butuh auth)

### 2.4 Vercel ToS
- Vercel Hobby = non-komersial → website klien melanggar ToS
- Rekomendasi: migrasi ke Cloudflare Pages atau VPS lokal

---

## 3. KONTEKS BISNIS (dari percakapan)

### 3.1 Visi Baru
- AKAL Center ingin expand dari **PAI saja** ke **semua mata pelajaran**
- Target: guru-guru tua yang biasa beli file perangkat ajar (CP/TP/PROTA/PROSEM/bank soal)
- Harga file manual: Rp250-300rb/semester
- AKAL Center bisa kasih lebih murah + lebih lengkap

### 3.2 Keputusan Bisnis (sudah disetujui user)
- **Pricing:** Per Semester (Rp100-120rb)
- **Mata Pelajaran:** Langsung 6 mapel (PAI, B.Indonesia, B.Inggris, MTK, IPA, IPS)
- **Budget AI:** Rp200rb/bulan via NaraRouter (router.bynara.id)
- **AI Strategy:** Multi-model, tampilkan "AI Cerdas" di frontend

### 3.3 Target User
- Guru (terutama guru tua yang tidak tech-savvy)
- Siswa SMP/SMA
- Kepala sekolah
- Orang tua (view-only)

### 3.4 Kompetitor
| Platform | Fitur | Harga | Gap |
|----------|-------|-------|-----|
| Ruangguru | Video, soal, bimbel | Rp150-400rb/bulan | Tidak ada PAI, tidak ada perangkat ajar guru |
| Zenius | Video, soal, tryout | Rp50-100rb/bulan | Fokus UTBK, tidak ada perangkat ajar |
| Teacher AI | Generate RPP, soal | Rp50rb/bulan | Hanya generate dokumen, tidak ada ekosistem belajar |
| Canva Education | Template RPP | Gratis | Tidak ada integrasi quiz/nilai/analytics |
| CBT/Kodelan | Ujian berbasis komputer | Rp500rb-2jt/tahun | Hanya CBT, tidak ada konten/materi |

**GAP:** Tidak ada platform yang SATU menyediakan perangkat ajar otomatis + belajar + quiz + analytics + harga terjangkau.

---

## 4. RISET AI MODELS 2026

### 4.1 NaraRouter (router.bynara.id) — YANG DIPAKAI
- Indonesian AI gateway (byNara)
- OpenAI-compatible API
- Base URL: `https://router.bynara.id/v1`
- API key format: `sk-nara-xxxx`

### 4.2 Model yang Tersedia di NaraRouter

| Model | Input/M | Output/M | Untuk Apa |
|-------|---------|----------|-----------|
| DeepSeek V4 Flash byNara | Rp486 | Rp971 | Chatbot siswa (FREE TIER!) |
| MiMo V2.5 | Rp567 | Rp1,511 | Chatbot siswa (fallback) |
| MiniMax M3 | Rp2,697 | Rp10,789 | AI Agent, workflow kompleks |
| DeepSeek V4 Pro | Rp3,911 | Rp7,822 | Grading essay, reasoning |
| Kimi K2.6 | Rp3,661 | Rp18,358 | Multimodal, konten |
| GLM 5.1 | Rp3,187 | Rp10,199 | Chat, percakapan |
| Qwen 3.7 Max | Rp15,725 | Rp47,174 | Generate perangkat ajar |
| Claude Sonnet 4.5 | Rp5,399 | Rp26,996 | Advanced reasoning |
| GPT-5.4 | Rp8,985 | Rp53,908 | General purpose |

### 4.3 Estimasi Biaya per Operasi

| Operasi | Model | Estimasi Token | Biaya |
|---------|-------|---------------|-------|
| Generate 1 perangkat ajar | Qwen 3.7 Max | ~5K | Rp177 |
| Generate 1 bank soal (25 soal) | Qwen 3.7 Max | ~8K | Rp283 |
| Chatbot siswa 1 sesi | DeepSeek V4 Flash (FREE) | ~3K | Rp0 |
| Grading 1 essay | DeepSeek V4 Pro | ~4K | Rp23 |

### 4.4 Budget Rp200rb/bulan Allocation

| Aktivitas | Model | Jumlah | Biaya |
|-----------|-------|--------|-------|
| Generate perangkat ajar | Qwen 3.7 Max | ~500 | Rp88.500 |
| Generate bank soal | Qwen 3.7 Max | ~200 | Rp56.600 |
| Chatbot siswa | DeepSeek V4 Flash (FREE) | Unlimited | Rp0 |
| Grading essay | DeepSeek V4 Pro | ~2.000 | Rp46.000 |
| **TOTAL** | | | **~Rp191.100** |

---

## 5. ARSITEKTUR YANG DIREKOMENDASIKAN

### 5.1 Stack Final
```
Frontend:  Next.js 16 + Tailwind v4 + TypeScript (SUDAH ADA)
Backend:   Next.js API Routes + Drizzle ORM (GANTI dari Google Sheets)
Database:  PostgreSQL di VPS + Redis (GANTI dari Google Sheets)
Auth:      jose JWT + registrasi flow (TAMBAH)
AI:        NaraRouter multi-model (BARU)
Payment:   Midtrans QRIS (BARU)
PDF:       @react-pdf/renderer (BARU)
```

### 5.2 Perubahan dari Stack Saat Ini
| Komponen | Saat Ini | Target |
|----------|----------|--------|
| Database | Google Sheets | PostgreSQL (Drizzle ORM) |
| ORM | Tidak ada | Drizzle ORM (bukan Prisma) |
| Auth | JWT only | JWT + registrasi + RBAC |
| AI | Tidak ada | NaraRouter multi-model |
| Payment | Tidak ada | Midtrans |
| PDF | Tidak ada | @react-pdf/renderer |
| State | useState | TanStack Query + Zustand |
| Real-time | Tidak ada | SSE (bukan WebSocket) |

### 5.3 Prinsip "Besar Tapi Ringan"
- Frontend minimalis: bento grid, card-based, micro-interactions
- Backend powerful: Drizzle raw SQL + Redis cache + BKT/IRT di background worker
- Database hemat: PostgreSQL di localhost (tanpa network overhead)
- AI gratis: DeepSeek V4 Flash via NaraRouter (free tier)
- Storage guru: Google Drive (bukan storage platform)
- Progressive complexity: mulai sederhana, tambah kompleksitas saat data cukup

---

## 6. FITUR KILLER: PERANGKAT AJAR GENERATOR

### 6.1 Input
- Mata pelajaran (6 mapel: PAI, B.Indonesia, B.Inggris, MTK, IPA, IPS)
- Kelas (7, 8, 9 untuk SMP / 10, 11, 12 untuk SMA)
- Bab / topik
- Kurikulum Merdeka (Fase D/E/F)

### 6.2 Output (per generate)
| Dokumen | Format | Estimasi Token |
|---------|--------|---------------|
| CP (Capaian Pembelajaran) | PDF | ~1K |
| TP (Tujuan Pembelajaran) | PDF | ~1.5K |
| PROTA (Program Tahunan) | PDF | ~2K |
| PROSEM (Program Semester) | PDF | ~2K |
| Modul Ajar | PDF | ~3K |
| Bank Soal (25 soal + kunci) | PDF + Online | ~8K |

### 6.3 AI Prompt Strategy per Mapel
| Mapel | Prompt Khusus |
|-------|--------------|
| PAI | Akurasi dalil, rujukan tafsir, adab Islam |
| B. Indonesia | KBBI, PUEBI, struktur teks |
| B. Inggris | CEFR level, communicative approach |
| Matematika | MathJax rendering, step-by-step |
| IPA | Scientific method, fenomena sehari-hari |
| IPS | Konteks Indonesia, Kurikulum Merdeka |

---

## 7. TIMELINE EKSEKUSI (8 Minggu)

```
MINGGU 1-2: Fondasi + Killer Feature
  ├─ Setup NaraRouter API integration
  ├─ Build Perangkat Ajar Generator (Qwen 3.7 Max)
  ├─ Build Bank Soal Generator
  └─ Checklist: □ NaraRouter key □ Generator UI □ PDF template □ API endpoint

MINGGU 3-4: Auth + Database
  ├─ Build registrasi + login flow (Guru + Siswa)
  ├─ Migrasi dari Google Sheets ke PostgreSQL (Drizzle)
  ├─ Multi-guru generalization (hapus hardcode)
  └─ Checklist: □ Register page □ Login flow □ Drizzle schema □ Migration

MINGGU 5-6: AI Tutor + Analytics
  ├─ AI Tutor chatbot (DeepSeek V4 Flash - GRATIS)
  ├─ Essay grading (DeepSeek V4 Pro)
  ├─ Analytics real: BKT + Risk Score connected
  └─ Checklist: □ Chatbot UI □ Grading API □ BKT pipeline □ Dashboard guru

MINGGU 7-8: Payment + Polish
  ├─ Payment: Midtrans (paket per semester Rp100-120rb)
  ├─ Dashboard guru: lampu hijau-kuning-merah
  ├─ Notifikasi: Telegram alerts
  ├─ Testing + bug fixes
  └─ Checklist: □ Midtrans integration □ Dashboard □ Telegram □ E2E test
```

---

## 8. QUICK WINS (< 1 Jam)

1. Setup NaraRouter API key — daftar di router.bynara.id
2. Hapus noindex di layout.tsx (kalau mau SEO)
3. Buat halaman `/peserta-didik` (sudah ada placeholder)

---

## 9. HAL YANG BELUM DIPERBAIKI (dari scan)

### CRITICAL
- `noindex, nofollow` memblokir SEMUA halaman dari Google
- Auth gate redirect SEMUA halaman ke login
- Tidak ada registrasi flow

### HIGH
- Typo og:author "Aggung"
- Tidak ada canonical tags
- Tidak ada JSON-LD structured data
- Vercel Hobby melanggar ToS untuk situs klien

### MEDIUM
- Tidak ada 404 page visible
- API endpoints return 405/403 tanpa dokumentasi
- Quiz data embedded di HTML (large page size)

### LOW
- Tidak ada cookie consent banner (UU PDP)
- Robots.txt Allow tapi meta noindex (konflik)

---

## 10. CATATAN PENTING

- **JANGAN hapus vercel.json** — critical untuk framework detection
- **JANGAN tambah komentar di kode** (kecuali fix bug)
- **JANGAN ganti warna/font/design system** yang sudah ada
- **JANGAN ubah animasi pattern** (ease curve, stagger, duration)
- **git config user.name harus wimxwim**
- **Build dulu: npx next build** sebelum deploy

---

## 11. REFERENSI DOKUMEN

| Dokumen | Lokasi |
|---------|--------|
| Ringkasan Eksekutif | `prd/01-ringkasan-eksekutif.md` |
| Audit Kondisi | `prd/02-audit-kondisi-saat-ini.md` |
| Arsitektur Target | `prd/03-arsitektur-target.md` |
| Matriks Fitur | `prd/04-matriks-fitur-per-role.md` |
| Mesin Analitik | `prd/05-spesifikasi-mesin-analitik.md` |
| Model Data | `prd/06-model-data.md` |
| Rencana Migrasi | `prd/07-rencana-migrasi.md` |
| Riset 2026 | `prd/08-riset-2026-rekomendasi.md` |
| AGENTS.md | `AGENTS.md` |
| **Catatan ini** | **`CATATAN-DISKUSI.md`** |

---

*File ini adalah catatan hasil diskusi project AKAL Center tanggal 6 Juli 2026.*
*BELUM DIEKSEKUSI — hanya rencana dan analisis.*
*Dibuat oleh OpenCode (diskusi skill v2026.3)*
