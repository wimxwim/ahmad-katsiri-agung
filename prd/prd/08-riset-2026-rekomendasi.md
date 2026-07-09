# AKAL CENTER — Riset 2026 & Rekomendasi Tambahan

**Tanggal Riset:** 6 Juli 2026  
**Sumber:** GitHub (Chamilo 2.0, Tarikul-Islam-Anik), Web Research (Next.js 16, Drizzle, Midtrans, Reddit, Stack Overflow, docs resmi)  
**Tujuan:** Melengkapi 7 PRD existing dengan temuan riset terbaru 2026

---

## RINGKASAN STACK REKOMENDASI (Setelah Riset)

```
SEBELUM RISET (PRD 01-07):
  Next.js 16 + Prisma + Neon Postgres + Redis + Puppeteer + Xendit/Midtrans

SETELAH RISET (UPDATE):
  Next.js 16 + Drizzle ORM + PostgreSQL VPS + Redis (lokal/Upstash) +
  TanStack Query + Zustand + @react-pdf/renderer + Midtrans
```

**Perubahan Kunci:**
1. Prisma → **Drizzle ORM** (lebih ringan untuk query analitik IRT/BKT)
2. Neon Postgres → **PostgreSQL di VPS** (latency <1ms, tanpa egress cost)
3. State management → **TanStack Query + Zustand** (belum disebut di PRD)
4. PDF → **@react-pdf/renderer** (lebih ringan dari Puppeteer)
5. Payment → **Midtrans** (API paling matang, QRIS ready)

---

## 1. PENAMBAHAN WAJIB KE PRD

### 1.1 Ganti Prisma ke Drizzle ORM (PRD 06 & 07)

| | Prisma | Drizzle | Dampak untuk AKAL Center |
|---|---|---|---|
| Bundle Size | ~6 MB (Rust engine) | 7.4 KB (0 deps) | VPS 4GB: hemat RAM signifikan |
| Query Analitik | `$queryRaw` (keluar type-safe) | SQL-like native (`db.select().from()`) | IRT/BKT query tetap type-safe |
| Edge Runtime | ⚠️ Butuh Data Proxy | ✅ Native | proxy.ts berjalan di edge |
| Migrations | `prisma migrate` (shadow DB) | `drizzle-kit` (SQL file based) | Lebih transparan |
| Benchmarks | Lebih lambat | 4.6k req/s (p95 100ms) | Quiz submit performa lebih tinggi |

**Rekomendasi:** Ganti seluruh schema Prisma di PRD 06 ke Drizzle. Tidak perlu install Prisma — langsung `pnpm add drizzle-orm drizzle-kit pg`.

### 1.2 PostgreSQL di VPS, Bukan Neon (PRD 03 & 07)

Neon tetap berguna untuk **staging/development** dengan branching gratis. Tapi untuk produksi di VPS 4GB:

| Alasan | Detail |
|--------|--------|
| Latency | <1ms (localhost) vs 20-50ms (Neon Singapore) |
| Biaya | Flat (sudah termasuk VPS) vs variabel per CU-hour |
| Kontrol | Full (tuning postgresql.conf, materialized views, RLS) |
| Tidak ada egress cost | Semua transfer internal VPS |

### 1.3 TanStack Query + Zustand (PRD 04 & 07)

Belum disebut di PRD manapun. Krusial untuk frontend:

```
TanStack Query → fetch cache:
  - Daftar kursus, daftar bab, soal kuis
  - Hasil analitik (staleTime: 5 menit)
  - Submit jawaban (mutation + invalidate)

Zustand → UI state:
  - Timer kuis (countdown per soal)
  - Sidebar mobile (open/close)
  - Filter kelas aktif
  - Bottom sheet state
  - Auth session (user, role)
```

### 1.4 Midtrans sebagai Payment Gateway (PRD 04 & 07)

Spesifik ke Indonesia:

| Fitur | Detail |
|-------|--------|
| QRIS | 0.7% (subsidi BI), settlement H+1 |
| Virtual Account | Rp 3.500 per transaksi (Mandiri, BNI, BRI, BCA) |
| e-Wallet | 1.5% (GoPay, OVO, DANA, ShopeePay) |
| Integrasi | Midtrans Snap (redirect, tidak perlu PCI-DSS) |
| API | REST, webhook signature verification |
| Izin | BI + Kominfo PSE |

### 1.5 SSE untuk Real-Time (PRD 03)

WebSocket terlalu berat untuk VPS 4GB. Gunakan **Server-Sent Events**:

```typescript
// API Route: /api/events/stream
export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        controller.enqueue(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
      }, 15000); // Keep-alive setiap 15 detik
      req.signal.addEventListener('abort', () => clearInterval(interval));
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
```

Gunakan untuk:
- Notifikasi nilai baru ke dashboard guru
- Alert Risk Score berubah
- Sinkronisasi timer kuis (sebagai source of truth, fallback ke polling)

### 1.6 @react-pdf/renderer untuk Sertifikat (PRD 07)

Ganti Puppeteer dengan @react-pdf/renderer:

| | @react-pdf/renderer | Puppeteer |
|---|---|---|
| RAM per PDF | ~50 MB | 200-500 MB (Chrome instance) |
| Desain | JSX Components | HTML + CSS |
| Font Custom | ✅ .ttf | ✅ CSS @font-face |
| Tanpa Headless Browser | ✅ | ❌ (butuh Chrome) |

**⚠️ Peringatan untuk Teks Arab (Dalil):** @react-pdf/renderer kurang bagus untuk RTL. Jika sertifikat perlu teks Arab, gunakan Puppeteer sebagai fallback khusus halaman sertifikat saja.

---

## 2. IDE TAMBAHAN DARI CHAMILO 2.0

Chamilo 2.0 (rilis 29 Juni 2026 — seminggu lalu!) menggunakan stack: **Symfony + Vue.js + Tailwind CSS + JWT + AI (OpenAI/Grok/Gemini/Claude/DeepSeek)**.

Fitur-fitur yang **bisa diadopsi** (bukan copy-paste, tapi ide):

### 2.1 AI Co-Creation Quiz (Baru — belum di PRD)
Chamilo 2.0: "AI auto-generate soal" dan "AI grading essay"
**Untuk AKAL Center:** Tambah fitur di dashboard guru:
- Button "Buat Soal dengan AI" → kirim teks materi ke LLM → return 5 soal PG + kunci
- Button "Saran Nilai AI" untuk tugas essay → AI baca jawaban siswa + rubrik → return skor + feedback

### 2.2 Multi-LLM Support (Baru — belum di PRD)
Chamilo 2.0 mendukung semua LLM: OpenAI, Grok, Gemini, Claude, DeepSeek.
**Untuk AKAL Center:** Gunakan **DeepSeek V3** (gratis via OpenRouter/NaraRouter) untuk AI Tutor dan AI Grading — tidak perlu bayar API mahal.

### 2.3 QR Code di Sertifikat (Sudah di PRD 07)
Chamilo 2.0 punya fitur ini. PRD kita sudah ada. ✅

### 2.4 GDPR/UU PDP Compliance (Sudah di PRD secara konsep)
Chamilo 2.0 punya: export personal data, right to be forgotten.
PRD 06 kita sudah ada: `deletedAt` soft delete, endpoint export-my-data.

### 2.5 Badge & Skills Management (Sudah di PRD 04)
Chamilo 2.0 punya skills management dengan scale/levels.
PRD 04 kita sudah ada: badge/lencana, poin, leaderboard.

### 2.6 SCORM/LTI/xAPI — SKIP
Chamilo 2.0 mendukung standar internasional. **Tidak perlu** untuk AKAL Center — target SMP/MTs Indonesia tidak butuh interoperabilitas dengan LMS lain.

---

## 3. IDE TAMBAHAN DARI TARIKUL-ISLAM-ANIK

Profil Tarikul Islam Anik: full-stack developer Bangladesh, 211 followers, menggunakan stack: **Python, TypeScript, Dart, Next.js, Tailwind, React, Node.js**.

Relevansi untuk AKAL Center:
- Stack Next.js + Tailwind sudah kita pakai ✅
- Portofolionya di [oxyzen.dev](https://oxyzen.dev) menggunakan animasi dan UI sederhana tapi profesional
- Inspirasi: tampilan "simple tapi dalam" — banyak informasi di satu halaman tanpa scroll overload

**Ide yang bisa diadopsi:**
1. **Bento grid layout** untuk dashboard guru — informasi padat dalam grid rapi (sudah ada di PRD 04 sebagai radar chart + risk table)
2. **Micro-interactions** — transisi halus saat hover card, loading skeleton yang elegan
3. **Dark mode toggle** — fitur kecil tapi berkesan untuk guru yang sering lembur malam

---

## 4. YANG BISA DIKURANGI / DISEDERHANAKAN

### 4.1 Event Sourcing — Tunda ke Fase 2
Event Sourcing (EventStore + hash-chain) adalah fitur canggih tapi **kompleksitas tinggi**. Untuk 1 guru + <100 siswa, ini over-engineering.

**Rekomendasi:** Fase 1 cukup pakai:
- `jawaban_log` table (simple append-only)
- Audit trail kolom `created_at` + `updated_at`
- Hash-chain **hanya untuk sertifikat** (QR anti-palsu), bukan untuk setiap jawaban

Event Sourcing diaktifkan di Fase 2 saat sudah ada >500 siswa dan butuh audit compliance.

### 4.2 Hexagonal Architecture — Sederhanakan
Folder `domain/`, `application/`, `infrastructure/`, `interfaces/` bagus secara teori, tapi untuk solo developer, struktur folder Next.js App Router sudah cukup untuk isolasi.

**Rekomendasi:** Pakai struktur App Router dengan pattern:
```
src/
├── app/api/v1/       → HTTP layer (controllers)
├── lib/
│   ├── db/           → Drizzle schema + queries (infrastructure)
│   ├── analytics/    → Pure functions (domain)
│   └── auth/         → Auth logic (application)
└── components/       → UI layer
```

Tidak perlu folder `domain/`, `application/`, `infrastructure/` terpisah — cukup pisahkan pure functions dari DB calls.

### 4.3 PgBouncer — Tunda
Untuk <50 concurrent user, connection pooling PostgreSQL bawaan sudah cukup. PgBouncer hanya diperlukan saat >100 concurrent.

**Rekomendasi:** Setup PgBouncer di Fase 3, bukan Fase 1.

### 4.4 Materialized Views — Tunda
`mv_class_analytics` berguna untuk dashboard dengan 1000+ siswa. Untuk <100 siswa, query langsung dengan index sudah cukup cepat.

**Rekomendasi:** Tambah index dulu, materialized view di Fase 2.

---

## 5. STACK FINAL YANG DIREKOMENDASIKAN

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND — Next.js 16                    │
│  App Router · Turbopack · React Compiler · Streaming SSR   │
│  TanStack Query (data) · Zustand (UI state)                │
│  Tailwind CSS v4 · motion/react · lucide-react              │
│  @react-pdf/renderer (sertifikat)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND — Next.js API Routes             │
│  Drizzle ORM (query type-safe)                             │
│  jose (JWT) · Zod (validation) · crypto (encryption)        │
│  googleapis (Drive) · Midtrans (payment)                    │
│  DeepSeek V3 via OpenRouter (AI Tutor/Grading)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA — VPS PostgreSQL + Redis             │
│  PostgreSQL 16 (localhost, latency <1ms)                    │
│  Redis 7 (session, rate limiting, cache analytics)          │
│  Google Drive API (storage file guru)                       │
│  Keystatic (konten statis — tetap dipakai)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. REKOMENDASI PERUBAHAN PER PRD

| PRD | Perubahan |
|-----|-----------|
| **01-ringkasan-eksekutif.md** | ✅ Tidak perlu perubahan signifikan |
| **02-audit-kondisi-saat-ini.md** | + Tambah note: Prisma belum terinstall, Drizzle lebih cocok |
| **03-arsitektur-target.md** | ❌ Ganti: Prisma → Drizzle, Neon → VPS PG, WebSocket → SSE, Puppeteer → @react-pdf/renderer |
| **04-matriks-fitur-per-role.md** | + Tambah: AI Co-Creation Quiz, Multi-LLM Support, Dark Mode |
| **05-spesifikasi-mesin-analitik.md** | + Tambah: Redis caching untuk hasil IRT/BKT, SSE untuk notifikasi risk score |
| **06-model-data.md** | ❌ Rewrite: Prisma schema → Drizzle schema. Tetap sertakan ERD yang sama. |
| **07-rencana-migrasi.md** | ❌ Update: Phase 1 tanpa Event Sourcing + Hexagonal + PgBouncer. Midtrans spesifik. |

---

## 7. CEKLIS KRITIS SEBELUM MULAI KODE

- [ ] Install Drizzle, bukan Prisma: `pnpm add drizzle-orm drizzle-kit pg`
- [ ] PostgreSQL di VPS, bukan Neon (simpan Neon untuk staging)
- [ ] Install TanStack Query: `pnpm add @tanstack/react-query`
- [ ] Install Zustand: `pnpm add zustand`
- [ ] Install @react-pdf/renderer: `pnpm add @react-pdf/renderer`
- [ ] Daftar akun Midtrans (bukan Xendit)
- [ ] Setup Redis di Docker Compose (jangan serverless dulu)
- [ ] Gunakan DeepSeek V3 via OpenRouter untuk AI (gratis)
- [ ] Simple audit log dulu, Event Sourcing nanti

---

## 8. PRINSIP "BESAR TAPI RINGAN, KELIHATAN SIMPLE WALAU ISI RUMIT"

| Prinsip | Implementasi |
|---------|-------------|
| **Frontend minimalis** | Bento grid, card-based, micro-interactions, skeleton loading |
| **Backend powerful** | Drizzle raw SQL + Redis cache + BKT/IRT di background worker |
| **Database hemat** | PostgreSQL di localhost — tanpa network overhead |
| **AI gratis** | DeepSeek V3 via OpenRouter/NaraRouter (sudah ada API key) |
| **Storage guru** | Google Drive — bukan storage platform |
| **Progressive complexity** | Mulai sederhana, tambah kompleksitas saat data sudah cukup |

---

*Riset selesai. Dokumen ini melengkapi PRD 01-07. Tidak ada PRD yang perlu dihapus — cukup update beberapa bagian spesifik seperti yang disebut di Section 6.*
