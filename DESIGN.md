# AKAL Center — UI/UX Journey & Design System

> **Updated:** 18 Juli 2026 — full audit of 34 pages, 114 API routes
> **Design System:** Islamic education platform, premium glass morphism, gold accents

---

## 1. Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#005231` (deep green) |
| Tertiary | `#5a4200` (gold brown) |
| Surface | `#f2fcf7` (mint white) |
| Glass | `bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px]` |
| Border | `rgba(27,107,69,0.15)` |
| Shimmer | `linear-gradient(90deg, #eec055, #ffdf9b, #eec055, #ffdf9b)` |
| Animation | `ease: [0.16, 1, 0.3, 1] as const` |
| Fonts | Bricolage Grotesque (heading), Inter (body), Amiri (Quran), JetBrains Mono (code) |
| Breakpoints | `px-3 sm:px-5 lg:px-8` (mobile-first) |

---

## 2. Perjalanan Siswa (Student Journey)

### 2.1 Login / Register
```
/siswa/beranda (protected)
  │
  ▼ (belum login)
/masuk?portal=siswa
  ├─ Form: Email + Password
  ├─ Google OAuth
  └─ Link ke /daftar?portal=siswa
  │
  ▼ (belum punya akun)
/daftar?portal=siswa
  ├─ Form: Nama, Email, Password, Kelas, No Absen
  └─ Auto-login setelah register
  │
  ▼ (login sukses)
/siswa/beranda
```

### 2.2 Dashboard Beranda (`/siswa/beranda`)
```
┌─────────────────────────────────────────────────────────┐
│  Halo, [Nama]!                                          │
│  Lanjutkan belajarmu dan pantau progres di sini.        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Kursus  │ │  Materi  │ │  Selesai │ │   Kuis   │   │
│  │    3     │ │    12    │ │    5     │ │    8     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│  ⚡ Lanjutkan Belajar                                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [Kursus]  Judul Materi — 65% selesai       →   │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ⚠️ Perlu Dikerjakan                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Quiz Bab 1 — 10 soal, 20 menit, BELAJAR    →   │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Hasil Kuis Terbaru                              Lihat  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  85  Quiz Bab 1 — 20 menit, 5 soal          →   │   │
│  │  70  Quiz Bab 2 — 15 menit, 5 soal          →   │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Progress Belajar                                Detail │
│  ┌──────────────────────────────────────────────────┐   │
│  │  5 dari 12 materi — 42% perjalanan belajar       │   │
│  │  ████████░░░░░░░░░░░░░░░░░░                      │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Materi Terbaru                                  Lihat  │
│  ┌─ Bab 1: Pengertian Akidah                    →   ┐   │
│  ┌─ Bab 2: Rukun Iman                           →   ┐   │
│  └─ ... (5 items)                                    │   │
├─────────────────────────────────────────────────────────┤
│  📢 Pengumuman                                          │
│  ┌─ [PINNED] Ujian Tengah Semester — 15 Juli 2026      │
│  └─ ... (3 items)                                      │
└─────────────────────────────────────────────────────────┘

Bottom Nav: [Beranda] [Materi] [Kuis] [Progres] [Menu]
```

### 2.3 Materi (`/siswa/materi`)
```
┌─────────────────────────────────────────────────────────┐
│  📚 Materi Pembelajaran                                  │
│  Filter kursus + pencarian                              │
├─────────────────────────────────────────────────────────┤
│  ┌─ Bab 1: Pengertian Akidah — 65% selesai         →   ┐
│  ┌─ Bab 2: Rukun Iman — 100% selesai ✅            →   ┐
│  └─ ... (list with progress bars)                       │
└─────────────────────────────────────────────────────────┘
```

### 2.4 Detail Materi (`/siswa/materi/[id]`)
```
┌─────────────────────────────────────────────────────────┐
│  ← Kembali                                              │
│  Bab 1: Pengertian Akidah                               │
│  Kursus: Akidah Akhlak Kelas 7                          │
├─────────────────────────────────────────────────────────┤
│  [Konten materi — teks panjang, scrollable]              │
│  Ringkasan, Pendahuluan, Konten, Poin Penting           │
│  MathRenderer untuk LaTeX (opsional)                    │
├─────────────────────────────────────────────────────────┤
│  [✓] Selesai Baca — tandai selesai                      │
│  Progress: 65%                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.5 Kuis (`/siswa/quiz`)
```
┌─────────────────────────────────────────────────────────┐
│  📝 Kuis & Evaluasi                                     │
│  Uji pemahamanmu                                        │
├─────────────────────────────────────────────────────────┤
│  Cara mengerjakan: 1. Pilih kuis  2. Kerjakan  3. Skor  │
├─────────────────────────────────────────────────────────┤
│  ┌─ Quiz Bab 1 — BELAJAR — 20 menit, 5 soal       →   ┐
│  ┌─ Quiz Bab 2 — SELESAI — 20 menit, 5 soal, Nilai 85 →│
│  └─ ... (list with mode badges)                         │
└─────────────────────────────────────────────────────────┘
```

### 2.6 Mengerjakan Soal (`/siswa/cbt/[id]`)
```
┌─ INTRO ─────────────────────────────────────────────────┐
│         📖 Quiz Bab 1                                    │
│     Uji pemahamanmu dengan 5 soal.                       │
│   ┌──────────┐  ┌──────────┐                            │
│   │ 5 Soal   │  │ 20 Menit │                            │
│   └──────────┘  └──────────┘                            │
│          [ Mulai Kuis ]                                  │
│          ← Kembali                                       │
└─────────────────────────────────────────────────────────┘
         │  (POST /siswa/quiz/[id]/start)
         ▼
┌─ PLAYING ───────────────────────────────────────────────┐
│  ← Keluar                          ⏱ 18:45              │
│  Soal 1 dari 5                                          │
│  ████████████████████░░░░ 20%                           │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [PG]  Apa pengertian akidah secara bahasa?       │   │
│  │                                                  │   │
│  │  ○ A. Kepercayaan yang pasti                     │   │
│  │  ● B. Ikatan yang kuat                     ← klik│   │
│  │  ○ C. Keyakinan hati                            │   │
│  │  ○ D. Keimanan yang teguh                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [Mode BELAJAR: ✅ hijau = benar, ❌ merah = salah]      │
│                                                         │
│              [ Selanjutnya → ]                           │
│                                                         │
│  [1] [2] [3] [4] [5]  (navigasi soal)                   │
└─────────────────────────────────────────────────────────┘
         │  (submit setelah soal terakhir)
         ▼
┌─ RESULT ────────────────────────────────────────────────┐
│              🏆 Luar Biasa!                              │
│              4/5 — 80% Benar                             │
│   ┌──────────┐  ┌──────────┐                            │
│   │ 4 Benar  │  │ 1 Salah  │                            │
│   └──────────┘  └──────────┘                            │
│        [ Ulangi Kuis ]  [ Review Jawaban ]               │
│        ← Kembali ke Daftar Kuis                          │
└─────────────────────────────────────────────────────────┘
```

### 2.7 Progres (`/siswa/progres`)
```
┌─────────────────────────────────────────────────────────┐
│  📊 Progres Belajar                                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 3 Kursus │ │ 12 Materi│ │ 5 Tuntas │ │ 8 Kuis   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│  Quiz History — grouped by course                        │
│  ┌─ Akidah Akhlak Kelas 7                                │
│  │   Quiz Bab 1 — 85 — 20 Jul 2026                      │
│  │   Quiz Bab 2 — 70 — 19 Jul 2026                      │
│  └─ ... per course                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Perjalanan Guru (Teacher Journey)

### 3.1 Dashboard Beranda (`/guru/beranda`)
```
┌─────────────────────────────────────────────────────────┐
│  Onboarding: [✓] Buat Kursus [✓] Upload [ ] Buat Kelas  │
│  ⚠️ 3 draft perlu ditinjau                               │
├─────────────────────────────────────────────────────────┤
│  Ruang Kerja — [Buat Kursus]                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Kursus  │ │  Siswa   │ │ Draft AI │ │  Materi  │   │
│  │    3     │ │    45    │ │    5     │ │    12    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│  Quick Actions:                                          │
│  [Upload] [Buat Kursus] [Kelola Siswa] [Lihat Nilai]    │
├─────────────────────────────────────────────────────────┤
│  Draft AI Pipeline                                       │
│  Extracted → Generating → Ready → Review                 │
├─────────────────────────────────────────────────────────┤
│  Kursus Terbaru                                          │
│  ┌─ Akidah Akhlak Kelas 7 — 25 siswa, 12 materi         │
│  └─ ... (3 items)                                       │
├─────────────────────────────────────────────────────────┤
│  Insight Siswa: 3 siswa remedial, Bab 2 tersulit         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Upload Dokumen (`/guru/upload`)
```
┌─────────────────────────────────────────────────────────┐
│  📤 Upload Dokumen                                       │
│  Ubah PDF/DOCX jadi materi, quiz, dan soal               │
├─────────────────────────────────────────────────────────┤
│  Pilih Kursus: [Akidah Akhlak Kelas 7 ▼]                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │         📎 Drag & drop file di sini               │   │
│  │         PDF, DOCX, max 10 MB                     │   │
│  │         atau klik untuk pilih file                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [Upload & Ekstrak]                                      │
│                                                         │
│  Riwayat Upload:                                         │
│  ┌─ bab1_akidah.pdf — Extracted — 15 Jul 2026           │
│  └─ ... (10 items)                                      │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Draft AI (`/guru/drafts`)
```
┌─────────────────────────────────────────────────────────┐
│  🤖 Draft AI — [Token: 120]                              │
│  Filter: Search | Status ▼ | Kategori ▼                  │
├─────────────────────────────────────────────────────────┤
│  ┌─ bab1_akidah.pdf — READY — [Tinjau]                  │
│  ┌─ bab2_iman.pdf — EXTRACTED — [Buat AI]               │
│  └─ ... (auto-polling 5s for processing drafts)          │
└─────────────────────────────────────────────────────────┘
```

### 3.4 Review Draft (`/guru/drafts/[id]`)
```
┌─────────────────────────────────────────────────────────┐
│  ← Kembali         bab1_akidah.pdf — Perlu Ditinjau      │
│  [Materi] [Kuis] [Soal]  ← tabs with status badges      │
├─────────────────────────────────────────────────────────┤
│  Tab: Materi                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Judul: Pengertian Akidah                        │   │
│  │  Ringkasan: Akidah berasal dari bahasa Arab...   │   │
│  │  Konten: [teks panjang, bisa diedit]             │   │
│  └──────────────────────────────────────────────────┘   │
│  [Setujui Materi] [Tolak] [Regenerate] [Edit]          │
├─────────────────────────────────────────────────────────┤
│  Tab: Kuis                                               │
│  ┌─ Soal 1: Apa pengertian akidah? [Setujui] [Tolak] ┐  │
│  └─ ... (5 soal)                                        │
├─────────────────────────────────────────────────────────┤
│  Tab: Soal                                               │
│  ┌─ Soal 1 (PG): Kunci=A [Setujui] [Tolak]          ┐  │
│  └─ ... (10 soal)                                       │
├─────────────────────────────────────────────────────────┤
│  ✅ Semua disetujui — [Terbitkan ke Siswa]               │
└─────────────────────────────────────────────────────────┘
```

### 3.5 Kursus Saya (`/guru/kursus`)
```
┌─────────────────────────────────────────────────────────┐
│  📚 Kursus Saya                              [Buat Baru] │
│  Search: [________]                                      │
├─────────────────────────────────────────────────────────┤
│  ┌─ Akidah Akhlak Kelas 7 — Published                   │
│  │   25 siswa, 12 materi, 5 quiz                         │
│  │   [Detail] [Nilai] [Undang] [Publikasi/Privatkan]    │
│  └─ Akidah Akhlak Kelas 8 — Draft                       │
│  └─ ... (grid)                                          │
└─────────────────────────────────────────────────────────┘
```

### 3.6 Kelola Siswa (`/guru/siswa`)
```
┌─────────────────────────────────────────────────────────┐
│  👥 Daftar Siswa                                         │
│  Search: [________]  Kursus: [Semua ▼]  Risk: [Semua ▼] │
├─────────────────────────────────────────────────────────┤
│  Desktop Table:                                          │
│  No | Nama | Kursus | Status                             │
│  1  | Ahmad| Akidah 7| TUNTAS                           │
│  2  | Siti | Akidah 7| BELUM TUNTAS ⚠️                  │
│  └─ ... (table)                                         │
│                                                         │
│  Mobile Cards:                                           │
│  ┌─ Ahmad — Akidah 7 — TUNTAS ✅                        │
│  ┌─ Siti — Akidah 7 — BELUM TUNTAS ⚠️                   │
└─────────────────────────────────────────────────────────┘
```

### 3.7 Detail Siswa (`/guru/siswa/[id]`)
```
┌─────────────────────────────────────────────────────────┐
│  ← Kembali                                               │
│  Ahmad — Kelas 7A — No. Absen 12                         │
│  Status: TUNTAS ✅  |  Kursus: Akidah 7, Akhlak 7       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ 8 Attempt│ │ 5 Selesai│ │ Rata 82  │                │
│  └──────────┘ └──────────┘ └──────────┘                │
├─────────────────────────────────────────────────────────┤
│  Mastery Chart (radar/bar)                               │
├─────────────────────────────────────────────────────────┤
│  Quiz History:                                           │
│  ┌─ Quiz Bab 1 — 85 — 20 Jul 2026                       │
│  └─ ... (list)                                          │
├─────────────────────────────────────────────────────────┤
│  [Kirim Tugas Remedial] → /guru/drafts                   │
│  [Lihat Nilai Detail] → /guru/kursus/[id]/nilai          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Navigation Structure

### Siswa Sidebar (Desktop) / Bottom Nav (Mobile)
```
Beranda    → /siswa/beranda
Materi     → /siswa/materi
Kursus Saya → /siswa/kursus
Kuis       → /siswa/quiz
Progres    → /siswa/progres
Pengumuman → /siswa/pengumuman
Ke Halaman Utama → /
```

### Guru Sidebar
```
Beranda     → /guru/beranda
Upload      → /guru/upload
Draft AI    → /guru/drafts
Kursus Saya → /guru/kursus
Siswa       → /guru/siswa
Nilai       → /guru/nilai
Analytics   → /guru/analytics
Kelas       → /guru/kelas
Sertifikat  → /guru/sertifikat
Top-Up      → /guru/topup
Langganan   → /guru/langganan
Profil      → /guru/profil
```

---

## 5. Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| **Loading** | Skeleton cards matching layout dimensions (not spinners) |
| **Empty** | Icon + title + description + CTA button |
| **Error** | AlertTriangle icon + message + retry button (3 auto-retries) |
| **Hover** | `hover:bg-white/80 hover:border-primary/25` on cards |
| **Active** | `active:scale-[0.99]` tactile press |
| **Stagger** | `motion.div` + `staggerChildren: 0.06-0.08` |
| **Spring** | `ease: [0.16, 1, 0.3, 1] as const` — NEVER linear |
| **Glass** | `bg-white/60 backdrop-blur-2xl border border-border-precision` |
| **Touch** | Min 44x44px tap targets, `cursor-pointer` on clickable |

---

## 6. State Transitions

### Siswa Quiz Flow
```
IDLE → loading (skeleton)
  → error (retry button)
  → empty (no quizzes message)
  → data (quiz list)

QUIZ LIST → click quiz → CBT page
  → INTRO (start button)
  → PLAYING (answer questions, timer, feedback for BELAJAR mode)
  → RESULT (score, review, retry)
```

### Guru Draft Flow
```
IDLE → loading (skeleton)
  → empty (no drafts, upload CTA)
  → data (draft list with status badges)

UPLOAD → extracting → extracted
  → [Buat AI] → generating → ready
  → [Tinjau] → review page

REVIEW → approve/reject per category
  → [Terbitkan] → published confirmation
```

---

## 7. Anti-Patterns (Forbidden)

- No emojis as icons (use lucide-react)
- No pure black (#000000) — use off-black
- No centered hero sections
- No 3-column equal card layouts
- No generic spinner loaders — use skeletons
- No linear easing — use spring physics
- No `h-screen` — use `min-h-[100dvh]`
- No `@animateicons/react/lucide` — use `lucide-react`
- No deleting `vercel.json`
- No Inter font — project uses Bricolage Grotesque + Inter

---

*Audited from 34 pages, 114 API routes — 18 Juli 2026.*