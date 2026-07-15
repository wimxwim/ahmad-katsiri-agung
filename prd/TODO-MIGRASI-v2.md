# TODO MIGRASI v2 — AKAL Center Platform

> **Tanggal:** 15 Juli 2026  
> **Status:** RANCANGAN — belum eksekusi  
> **Commit terakhir:** 67d5e2b54 — audit batches 0-6 (6.000+ baris dihapus, 800+ ditambah)

---

## I. IDE — Visi Platform

```
AKAL CENTER = PLATFORM e-learning multi-guru untuk PAI/Akidah Akhlak SMP/MTs

BUKAN: Website statis 14 bab hardcode milik Ahmad doang
TAPI:  Platform di mana SEMUA guru bisa:
       • Buat kursus sendiri
       • Upload materi → AI generate (materi + quiz + soal + dalil)
       • Tambah resource manual (game, video, hadits, PDF)
       • Undang murid sendiri
       • Pantau progres murid

14 bab v1 = seed data Ahmad (kursus biasa, bukan hardcode)
```

**Prinsip ekonomi:**
- Guru bayar per MURID AKTIF (bukan cuma AI generate)
- Free: 50 murid | Basic 20K: 200 murid | Pro 50K: 500 murid | Sekolah 100K: 1.500 murid
- 1 sekolah 1.200 murid → butuh paket SEKOLAH → server cost tertutup
- Anti-boncos: cache layer, progressive unlock, rate limit

---

## II. RANCANGAN — Desain & Layout

### Dashboard Guru — Tab Resource (BARU)

```
┌──────────────────────────────────────────────────────────┐
│  Kursus: Adab dalam Islam                                 │
│  [Materi] [Quiz] [Siswa] [Resource] ← TAB BARU           │
│                                                           │
│  ┌─ Kuota: 47/200 siswa terpakai ─────────────────────┐  │
│  │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  23%       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [+ Tambah Game]  [+ Tambah Video]  [+ Tambah Hadits]     │
│                                                           │
│  🎮 Game                         🔗 EKSTERNAL             │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Game Adab dalam Islam                             │    │
│  │ kuis-bangun-ruang9.my.canva.site/adab-dalam...    │    │
│  │                                          [Hapus ✕]│    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  🎥 Video                                               │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Video Pembelajaran Adab                           │    │
│  │ youtube.com/embed/xxxxx                [Hapus ✕]  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  📜 Hadits                      HR. Muslim               │
│  ┌──────────────────────────────────────────────────┐    │
│  │ "Sesungguhnya kejujuran itu membawa..."           │    │
│  │                                    [Hapus ✕]      │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  📄 PDF/PPT                                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 📄 PROTA Kelas 7    [Download]    [Hapus ✕]       │    │
│  │ 📄 PROSEM Kelas 8   [Download]    [Hapus ✕]       │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### Dashboard Siswa — Tab Game + Video (BARU)

```
┌──────────────────────────────────────────────────────┐
│  Kursus: Adab dalam Islam                             │
│  [Materi] [Quiz] [Game] [Video] ← TAB BARU           │
│                                                       │
│  ── Tab Game ──                                       │
│  ┌──────────────────┐ ┌──────────────────┐           │
│  │     🎮            │ │     🎮            │           │
│  │  Game Adab       │ │  Game Jujur      │           │
│  │  dalam Islam     │ │  dan Amanah      │           │
│  │  [Mainkan →]     │ │  [Mainkan →]     │           │
│  └──────────────────┘ └──────────────────┘           │
│                                                       │
│  ── Tab Video ──                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │          ▶ Video Pembelajaran                │    │
│  │          [YouTube embed iframe]              │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Halaman Publik — 3 Halaman Baru

```
┌──────────────────────────────────────────────────────────┐
│  NAVBAR: Beranda | Fitur | Harga | Kursus | Game | Video │
│                                          Hafalan | Quran  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  /game — Grid Game Canva                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │ 🎮 Adab  │ │ 🎮 Jujur │ │ 🎮 Iman  │                 │
│  │ [Main]   │ │ [Main]   │ │ [Main]   │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
│                                                           │
│  /video — Grid YouTube                                   │
│  ┌──────────────────┐ ┌──────────────────┐               │
│  │ ▶ Adab (Kelas 9) │ │ ▶ Jujur (Kls 8) │               │
│  └──────────────────┘ └──────────────────┘               │
│                                                           │
│  /hafalan — Flashcard Dalil                              │
│  ┌──────────────────────────────────────────┐            │
│  │ QS. Al-Qalam [68]: 4            [Balik]  │            │
│  │ وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ          │            │
│  │ "Dan sesungguhnya engkau benar-benar..."  │            │
│  │                              [✓ Hafal]    │            │
│  └──────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────┘
```

---

## III. ARSITEKTUR — Diagram Sistem

### Arsitektur Database (perubahan)

```
                         ┌──────────────────┐
                         │     kursus        │
                         │  + metadata JSONB │ ← KOLOM BARU
                         │  {kelas, bab,     │
                         │   dalil, dimensi, │
                         │   poinPenting}    │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
    │  ai_generation   │ │materiPublished│ │    resource      │ ← TABEL BARU
    │  (AI pipeline)   │ │ quizPublished │ │  tipe: GAME,     │
    │  status:approved │ │ soalPublished │ │  VIDEO, HADITS,  │
    │  (import v1)     │ │ (publish)     │ │  PDF, PPT        │
    └─────────────────┘ └──────────────┘ └──────────────────┘
```

### Arsitektur Ekonomi (perubahan)

```
┌──────────────────────────────────────────────────┐
│                  GURU BAYAR                       │
│         Rp20K-100K/bulan (paket kuota)            │
│                                                    │
│  ┌──────────────┐    ┌──────────────┐             │
│  │  AI GENERATE  │    │  MELAYANI     │             │
│  │  Rp85/generate│    │  MURID        │             │
│  │  (token)      │    │  (kuota seat) │             │
│  └──────────────┘    └──────────────┘             │
│                                                    │
│  ┌──────────────────────────────────────────┐     │
│  │  CACHE LAYER (Redis + CDN)                │     │
│  │  1 DB query → 1.200 murid terlayani       │     │
│  └──────────────────────────────────────────┘     │
│                                                    │
│  ┌──────────────────────────────────────────┐     │
│  │  PROGRESSIVE UNLOCK                       │     │
│  │  Bab 1 selesai → Bab 2 terbuka            │     │
│  │  Murid tidak bisa akses 30 materi sekaligus│     │
│  └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘

PAKET:
┌──────────┬──────────┬────────────┬──────────────┐
│  FREE    │  BASIC   │    PRO     │   SEKOLAH    │
│  Rp0     │  Rp20K   │   Rp50K    │   Rp100K     │
│  50 murid│ 200 murid│ 500 murid  │ 1.500 murid  │
│  15 upld │ 100 upld │ 500 upld   │ unlimited    │
│  15 kurs │ 50 kurs  │ 200 kurs   │ unlimited    │
└──────────┴──────────┴────────────┴──────────────┘
```

### Arsitektur Data Flow — Import v1 → v2

```
  14 JSON v1 (dari git history)
  content/materi/*/index.json
  content/soal/*/index.json
  content/game/*/index.json
  content/hadits/*/index.json
  content/perangkat-ajar/index.json
              │
              ▼
  ┌─────────────────────────┐
  │  SCRIPT IMPORT (1x)     │
  │  TypeScript + service   │
  │  role key               │
  └───────────┬─────────────┘
              │
    ┌─────────┼─────────┬──────────┬──────────┐
    ▼         ▼         ▼          ▼          ▼
  kursus  ai_gen   materiPub  quizPub   soalPub
  (14)    (14)     (14)       (14)      (351)
              │
              ├── metadata JSONB (dalil, dimensi, poinPenting)
              └── resource (game, video, hadits, PDF, PPT)
                   (12 + 14 + 6 + 42 = 74 row)
```

---

## IV. TODO — Daftar Tugas

### FASE 0: Database (1 jam)

| # | Tugas | File | Prioritas |
|---|-------|------|-----------|
| 0.1 | Tambah kolom `metadata JSONB` ke `kursus` | `src/lib/db/schema.ts` | ⭐⭐⭐ |
| 0.2 | Tambah kolom `max_students INTEGER` ke `token_balances` | `src/lib/db/schema.ts` | ⭐⭐⭐ |
| 0.3 | Tambah kolom `current_students INTEGER` ke `token_balances` | `src/lib/db/schema.ts` | ⭐⭐⭐ |
| 0.4 | Buat tabel `resource` | `src/lib/db/schema.ts` | ⭐⭐⭐ |
| 0.5 | Tambah relations `resource` → `kursus`, `users` | `src/lib/db/schema.ts` | ⭐⭐ |
| 0.6 | Generate migrasi Drizzle | `npx drizzle-kit generate` | ⭐⭐⭐ |
| 0.7 | Push ke Supabase | `npx drizzle-kit push` | ⭐⭐⭐ |

### FASE 1: Backend API (2 jam)

| # | Tugas | Endpoint | Auth | Prioritas |
|---|-------|----------|------|-----------|
| 1.1 | POST resource (+ validasi URL) | `/api/v1/guru/kursus/[id]/resource` | Guru | ⭐⭐⭐ |
| 1.2 | GET list resource | `/api/v1/guru/kursus/[id]/resource` | Guru | ⭐⭐ |
| 1.3 | DELETE resource | `/api/v1/guru/kursus/[id]/resource/[rid]` | Guru | ⭐⭐ |
| 1.4 | GET resource (siswa) | `/api/v1/siswa/kursus/[id]/resource` | Siswa | ⭐⭐⭐ |
| 1.5 | GET video publik | `/api/v1/public/video` | Publik | ⭐⭐⭐ |
| 1.6 | GET hafalan publik | `/api/v1/public/hafalan` | Publik | ⭐⭐⭐ |
| 1.7 | GET kuota murid | `/api/v1/guru/quota` | Guru | ⭐⭐⭐ |
| 1.8 | PATCH metadata kursus | `/api/v1/guru/kursus/[id]/metadata` | Guru | ⭐⭐ |

### FASE 2: Dashboard Guru (2 jam)

| # | Tugas | File | Prioritas |
|---|-------|------|-----------|
| 2.1 | Tab Resource di `/guru/kursus/[id]` | `src/app/guru/kursus/[id]/page.tsx` | ⭐⭐⭐ |
| 2.2 | Form tambah Game (input URL Canva) | Component baru | ⭐⭐⭐ |
| 2.3 | Form tambah Video (input URL YouTube) | Component baru | ⭐⭐⭐ |
| 2.4 | Form tambah Hadits (input teks) | Component baru | ⭐⭐⭐ |
| 2.5 | Form upload PDF (Supabase Storage) | Component baru | ⭐⭐ |
| 2.6 | Kuota siswa bar (progress bar) | Component baru | ⭐⭐⭐ |

### FASE 3: Dashboard Siswa (2 jam)

| # | Tugas | File | Prioritas |
|---|-------|------|-----------|
| 3.1 | Tab Game di `/siswa/kursus/[id]` | Halaman baru | ⭐⭐⭐ |
| 3.2 | Tab Video di `/siswa/kursus/[id]` | Halaman baru | ⭐⭐⭐ |
| 3.3 | Progressive unlock (Bab 1 selesai → Bab 2) | `src/app/siswa/materi/` | ⭐⭐⭐ |

### FASE 4: Halaman Publik (2 jam)

| # | Tugas | File | Prioritas |
|---|-------|------|-----------|
| 4.1 | Halaman `/game` — grid Canva publik | `src/app/game/page.tsx` (BARU) | ⭐⭐⭐ |
| 4.2 | Halaman `/video` — grid YouTube publik | `src/app/video/page.tsx` (BARU) | ⭐⭐⭐ |
| 4.3 | Halaman `/hafalan` — flashcard dalil | `src/app/hafalan/page.tsx` (BARU) | ⭐⭐⭐ |
| 4.4 | Tambah link di Navbar + BottomTabBar | `Navbar.tsx`, `BottomTabBar.tsx` | ⭐⭐ |

### FASE 5: Import Data v1 (1 jam)

| # | Tugas | Prioritas |
|---|-------|-----------|
| 5.1 | Recover data v1 dari git history | ⭐⭐⭐ |
| 5.2 | Script import: baca JSON → insert DB | ⭐⭐⭐ |
| 5.3 | Verifikasi: Ahmad login → 14 kursus | ⭐⭐⭐ |
| 5.4 | Verifikasi: Siswa login → materi + quiz | ⭐⭐⭐ |
| 5.5 | Test mobile + PC | ⭐⭐ |

---

## V. HASIL — Ekspektasi Akhir

### Tampilan Akhir (Diagram)

```
┌──────────────────────────────────────────────────────────────┐
│                        AKAL CENTER v2                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                      NAVBAR                              │ │
│  │  Beranda  Fitur  Harga  Kursus  Game  Video  Hafalan    │ │
│  │  Quran  Tentang                          [Masuk/Daftar] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │ │
│  │  │ Guru A   │  │ Guru B   │  │ Guru C   │              │ │
│  │  │ (Ahmad)  │  │ (Bu Siti)│  │ (Pak Budi)│              │ │
│  │  │          │  │          │  │          │              │ │
│  │  │ 14 bab   │  │ Fisika   │  │ Matematika│             │ │
│  │  │ 351 soal │  │ 5 video  │  │ 20 soal  │              │ │
│  │  │ 12 game  │  │ 3 hadits │  │ 10 game  │              │ │
│  │  │ 14 video │  │ 5 PDF    │  │ 2 PDF    │              │ │
│  │  │ 6 hadits │  │          │  │          │              │ │
│  │  │ 42 PDF   │  │          │  │          │              │ │
│  │  └──────────┘  └──────────┘  └──────────┘              │ │
│  │       │              │              │                   │ │
│  │       ▼              ▼              ▼                   │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │              MURID LIHAT KURSUS                   │  │ │
│  │  │  Murid A → kursus Ahmad (diundang)                │  │ │
│  │  │  Murid B → kursus Bu Siti (diundang)              │  │ │
│  │  │  Publik  → kursus publik (tanpa login)             │  │ │
│  │  │  Tampilan SAMA PERSIS — tidak bisa bedakan        │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    BOTTOM TAB (Mobile)                    │ │
│  │  Beranda  Materi  Kuis  Game  Video  Hafalan  Lainnya   │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Yang Berubah vs Yang Tidak

| Komponen | Status | Keterangan |
|----------|--------|------------|
| `content/` directory | ❌ DIHAPUS | v1 legacy data |
| Keystatic CMS | ❌ DIHAPUS | Tidak dipakai |
| `/game` page | ❌ DIHAPUS | Akan dibuat ulang |
| `/video` page | 🆕 BARU | Grid YouTube |
| `/hafalan` page | 🆕 BARU | Flashcard dalil |
| `kursus.metadata` | 🆕 BARU | JSONB untuk kelas, dalil, dimensi |
| `resource` table | 🆕 BARU | Game, video, hadits, PDF, PPT |
| `token_balances` | ✏️ DIUBAH | +max_students, +current_students |
| AI Pipeline | ✅ TETAP | Upload → generate → approve |
| Auth system | ✅ TETAP | proxy.ts, JWT, CSRF |
| Quiz Engine | ✅ TETAP | QuizEngine.tsx |
| Guru dashboard | ✅ TETAP | +1 tab Resource |
| Siswa dashboard | ✅ TETAP | +2 tab Game, Video |
| Cache layer | ✅ SUDAH ADA | Redis 30s TTL |
| Progressive unlock | 🆕 BARU | Bab 1 selesai → Bab 2 |

### Total Perubahan

| Kategori | Jumlah |
|----------|--------|
| Kolom baru | 3 (metadata, max_students, current_students) |
| Tabel baru | 1 (resource) |
| API baru | 8 endpoint |
| Tab dashboard guru | 1 (Resource) |
| Tab dashboard siswa | 2 (Game, Video) |
| Halaman publik baru | 3 (/game, /video, /hafalan) |
| Fitur baru | 2 (kuota murid, progressive unlock) |
| Script import | 1 (sekali jalan) |
| Yang tidak diubah | AI pipeline, auth, quiz, upload, progres, invite |

---

## VI. CATATAN KEAMANAN

| Risiko | Mitigasi |
|--------|----------|
| URL game/video injection | Validasi: hanya Canva + YouTube domain |
| metadata JSONB di-render | DOMPurify + textContent, NO dangerouslySetInnerHTML |
| CSRF POST resource | Double-submit cookie (proxy.ts) |
| Guru hapus resource guru lain | Cek `resource.guru_id === session.userId` |
| 1 guru bawa 1.200 murid → boncos | Kuota murid per paket |
| Murid bot auto-klik quiz | Rate limit + timer minimal + CSRF |
| PDF upload abuse | Validasi MIME + magic bytes + size ≤10MB |
| Import massal | Service role key, tidak ekspos API publik |