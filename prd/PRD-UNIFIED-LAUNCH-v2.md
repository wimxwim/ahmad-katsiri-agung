# PRD UNIFIED — AKAL Center Launch v2

> **Tanggal:** 16 Juli 2026
> **Sumber:** 2+ jam diskusi × 6 skill marketing × audit codebase × TODO-MIGRASI-v2
> **Keputusan:** Gabungan strategi marketing (chat) + infrastruktur teknis (MIGRASI-v2)
> **Prinsip:** Ambil yang benar, tolak yang salah, tunda yang belum prioritas.

---

## I. KEPUTUSAN TEGAS

### ✅ DITERIMA (dari MIGRASI-v2)

| # | Item | Alasan |
|---|------|--------|
| 1 | Visi platform multi-guru | Sudah ada di codebase, ini arah yang benar |
| 2 | Import data v1 (14 bab Ahmad) | Seed data penting untuk demo ke kerabat |
| 3 | Resource tab (game, video, hadits, PDF) | Fitur bagus — TAPI DITUNDA ke Fase 4 |
| 4 | Halaman publik /game, /video, /hafalan | SEO + traffic organik — TAPI DITUNDA |
| 5 | Progressive unlock | Anti-abuse bagus — TAPI DITUNDA |
| 6 | Cache layer (Redis) | Sudah ada, optimalkan |
| 7 | kolom `metadata JSONB` di `kursus` | Fleksibel untuk data tambahan — TAPI DITUNDA |

### ❌ DITOLAK (dari MIGRASI-v2)

| # | Item | Kenapa Ditolak |
|---|------|---------------|
| 1 | **"Guru bayar per MURID AKTIF"** | Biaya siswa = database I/O = Rp0. Tidak ada yang perlu dibayar per siswa. Yang mahal itu AI GENERATE (Rp33-100/generate). Metrik salah. |
| 2 | **Paket: FREE 50 murid / BASIC 20K 200 murid / PRO 50K 500 murid** | Harga terlalu tinggi untuk guru honorer. Target kita Rp5.000-20.000/guru/bulan. |
| 3 | **"1 sekolah 1.200 murid → server cost tertutup"** | Server cost 1.200 siswa = Rp0 (Supabase free tier). Yang mahal AI generate, bukan siswa. |
| 4 | **Resource + halaman publik sebagai PRIORITAS LAUNCH** | Bukan prioritas. Launch harus simpel: upload PDF → generate AI. |

### 🆕 DITAMBAHKAN (dari diskusi kita)

| # | Item | Dari |
|---|------|------|
| 1 | **9-layer defense** (daily limit, concurrent, fingerprinting, verifikasi HP) | Diskusi anti-boncos |
| 2 | **3-fase launch** (Founding Member → Invite-Only → Buka Umum) | Skill launch + community + referrals |
| 3 | **Model "MULAI" & "LANJUTKAN"** | Diskusi pricing + marketing-psychology |
| 4 | **INITIAL_TOKEN_BALANCE 10000 → 2000** | Diskusi anti-boncos |
| 5 | **DAILY_GENERATE_LIMIT enforced** | Audit codebase (defined but not used) |
| 6 | **Notifikasi "kuota habis → upgrade"** | Diskusi CTA halus |
| 7 | **Cron potong token** | Audit codebase (cron generate gratis) |
| 8 | **Bahasa WhatsApp untuk Founding Member** | Diskusi copywriting |

---

## II. MODEL BISNIS FINAL

### Paket

|  | MULAI (Gratis) | LANJUTKAN (Rp10.000/bln) | SEKOLAH (Rp200.000/bln) |
|---|---|---|---|
| **Generate AI** | 20/bulan | 50/bulan | 200/bulan |
| **Upload dokumen** | 3/bulan | Unlimited | Unlimited |
| **Kelas** | 1 | 5 | 20 |
| **Siswa** | Unlimited | Unlimited | Unlimited |
| **CBT + auto-koreksi** | ✅ | ✅ | ✅ |
| **Analytics** | ❌ | ✅ | ✅ |
| **Sertifikat** | ❌ | ✅ | ✅ |
| **Support** | Komunitas | WhatsApp | WhatsApp Prioritas |
| **Admin dashboard** | ❌ | ❌ | ✅ |
| **Multi-guru** | ❌ | ❌ | ✅ (10 guru) |

### Kenapa Model Ini?

| Prinsip | Penjelasan |
|---|---|
| **Bayar per GENERATE, bukan per murid** | Biaya asli = AI generate (Rp33-100). Siswa = Rp0. |
| **Siswa unlimited** | Karena tidak ada biaya. Malah jadi nilai jual: "Wah, siswanya unlimited!" |
| **Rp10.000/bulan** | Target: guru individu. Rp5.000-9.400 profit per guru. |
| **SEKOLAH Rp200.000** | Untuk institusi dengan 10+ guru. Admin dashboard + laporan. |

### Profit per Guru (LANJUTKAN Rp10.000)

| Skenario | Biaya AI | Pendapatan | Profit |
|---|---|---|---|
| 50 generate, tanpa cache | 50 × Rp100 = Rp5.000 | Rp10.000 | **Rp5.000** |
| 50 generate, dengan cache | 50 × Rp12 = Rp600 | Rp10.000 | **Rp9.400** |
| Rata-rata (50% cache hit) | 50 × Rp56 = Rp2.800 | Rp10.000 | **Rp7.200** |

---

## III. 9 LAPIS PERTAHANAN ANTI-BONCOS

| # | Lapis | Status | Deskripsi |
|---|---|---|---|
| 1 | **Daily rate limit** | ❌ Defined, NOT enforced | Maks 5 generate/hari |
| 2 | **Concurrent limit** | ✅ Enforced | 1 job AI per guru |
| 3 | **IP rate limit** | ✅ Enforced | 10 trigger/menit per IP |
| 4 | **Token deduction** | ✅ Enforced | Rp85/generate |
| 5 | **Token habis = berhenti** | ✅ Enforced | `checkGenerateBalance()` |
| 6 | **Kurangi token gratis** | ❌ Belum | 10000 → 2000 (117 → 23 generate) |
| 7 | **1 device = 1 sesi** | ❌ Belum | Login baru → logout sesi lama |
| 8 | **Verifikasi HP** | ❌ Belum | Anti multi-account |
| 9 | **Cron potong token** | ❌ Belum | Cron generate tidak gratis |

---

## IV. STRATEGI PELUNCURAN: 3 FASE

### Fase 1: "Founding Member" (Bulan 1 — Gratis, Undangan)

> **Prinsip:** Reciprocity + Exclusivity + IKEA Effect

**Target:** 20 guru PAI (kerabat + teman Ahmad)

**Aksi:**
1. Kirim WhatsApp personal ke 20 guru PAI
2. Mereka diundang sebagai **Founding Member** — akses GRATIS seumur hidup
3. Tidak ada pembayaran. Tidak ada limit.
4. Mereka upload PDF, generate AI, pakai semua fitur
5. Minta feedback + testimoni

**Bahasa WA:**
> "Assalamualaikum Pak/Bu. Saya Ahmad Katsiri, guru PAI. Saya sedang membangun AKAL Center — asisten AI yang bisa bikin materi, quiz, dan soal dalam 90 detik dari upload PDF. Saya mencari 20 guru PAI pertama sebagai **Founding Member**. Anda dapat akses GRATIS seumur hidup. Saya hanya minta Anda mencoba dan memberi masukan. Berminat?"

**Kenapa ini penting:**
- Mereka merasa SPESIAL (diundang, bukan daftar sendiri)
- Mereka merasa "berhutang budi" (reciprocity) → akan share
- Mereka kasih testimoni asli (social proof)
- Biaya AI: ~Rp360/bulan/guru × 20 = Rp7.200/bulan

### Fase 2: "Invite-Only" (Bulan 2 — Gratis 30 Hari, Eksklusif)

> **Prinsip:** Scarcity + Social Proof + Viral Loop

**Target:** 60 guru baru (dari 20 Founding Member × 3 kode undangan)

**Aksi:**
1. Setiap Founding Member dapat 3 kode undangan unik
2. Halaman daftar hanya bisa diakses dengan kode undangan
3. Guru baru daftar → GRATIS 30 hari (20 generate)
4. Setelah 30 hari: pilih LANJUTKAN (Rp10.000/bln) atau berhenti

**Bahasa untuk Founding Member:**
> "Bu, terima kasih sudah jadi Founding Member. Anda dapat 3 kode undangan untuk rekan guru PAI lain. Mereka dapat GRATIS 30 hari. Silakan dibagikan."

**Kenapa ini penting:**
- Scarcity: "Hanya lewat undangan" → FOMO → minta diundang
- Social Proof: "Bu Ani yang undang saya" → trust tinggi
- Viral loop: 20 × 3 = 60 guru baru

### Fase 3: Buka Umum (Bulan 3+ — Berbayar)

> **Prinsip:** Social Proof + Anchoring + Loss Aversion

**Target:** 100+ guru

**Aksi:**
1. Platform sudah punya 20-80 guru aktif + testimoni
2. Buka pendaftaran umum
3. MULAI (gratis) vs LANJUTKAN (Rp10.000/bln)
4. Founding Member: LANJUTKAN GRATIS SEUMUR HIDUP
5. Early Adopter (Fase 2): LANJUTKAN Rp5.000/bln (diskon 50%)

### Proyeksi Pendapatan

| Bulan | Fase | Guru Aktif | Pendapatan |
|---|---|---|---|
| 1 | Founding Member | 20 (gratis) | **Rp0** |
| 2 | Invite-Only | 60 (30 hari gratis) | **Rp0** |
| 3 | Buka Umum | 50 bertahan, 30 bayar | **Rp150.000-300.000** |
| 4+ | Stabil | 80 bertahan, 50 bayar | **Rp250.000-500.000** |

---

## V. RENCANA EKSEKUSI TEKNIS

### FASE 0: ANTI-BONCOS + LAUNCH (3 jam) — 🔴 PRIORITAS TERTINGGI

| # | Tugas | File | Waktu |
|---|---|---|---|
| 0.1 | `INITIAL_TOKEN_BALANCE` 10000 → 2000 | `src/lib/token-constants.ts` | 5 menit |
| 0.2 | Aktifkan `DAILY_GENERATE_LIMIT` di generate route | `src/app/api/v1/guru/drafts/[id]/generate/route.ts` | 15 menit |
| 0.3 | Tambah kolom `tier` + `resetAt` di `token_balances` | `src/lib/db/schema.ts` | 15 menit |
| 0.4 | Migrasi + push ke Supabase | `npx drizzle-kit generate && push` | 10 menit |
| 0.5 | Cron reset kuota bulanan | `src/app/api/v1/cron/reset-quota/route.ts` (BARU) | 30 menit |
| 0.6 | Halaman pilih paket (MULAI / LANJUTKAN) | `src/app/guru/langganan/page.tsx` (BARU) | 1 jam |
| 0.7 | Middleware cek tier (blokir generate) | Generate route | 30 menit |
| 0.8 | Notifikasi "kuota habis → upgrade" | Dashboard + generate response | 30 menit |

### FASE 1: IMPORT DATA v1 (2 jam) — 🟡 PRIORITAS TINGGI

| # | Tugas | Waktu |
|---|---|---|
| 1.1 | Recover data v1 dari git history (`content/` directory) | 30 menit |
| 1.2 | Script import: baca JSON → insert ke DB (kursus, ai_generation, materi, quiz, soal) | 1 jam |
| 1.3 | Verifikasi: Ahmad login → 14 kursus, 351 soal | 30 menit |

### FASE 2: LAUNCH + KOMUNITAS (ongoing) — 🟡 PRIORITAS TINGGI

| # | Tugas |
|---|---|
| 2.1 | Kirim WA ke 20 guru PAI (Founding Member) |
| 2.2 | Feedback loop + perbaikan bug |
| 2.3 | Kumpulkan testimoni + screenshot |
| 2.4 | Sistem invite code (3 kode/guru) |

### FASE 3: RESOURCE + PUBLIK (nanti) — 🟢 PRIORITAS RENDAH

| # | Tugas | Dari MIGRASI-v2 |
|---|---|---|
| 3.1 | Tabel `resource` + API CRUD | Fase 0 + 1 |
| 3.2 | Tab Resource di dashboard guru | Fase 2 |
| 3.3 | Tab Game + Video di dashboard siswa | Fase 3 |
| 3.4 | Halaman /game, /video, /hafalan | Fase 4 |
| 3.5 | Progressive unlock | Fase 3 |
| 3.6 | Kolom `metadata JSONB` di kursus | Fase 0.1 |

---

## VI. PSIKOLOGI — Kenapa Strategi Ini Bekerja

| Prinsip | Cara Pakai |
|---|---|
| **Zero-Price Effect** | "Gratis" itu beda psikologis dari Rp1. Guru akan ambil. |
| **Reciprocity** | Kamu kasih GRATIS dulu → mereka merasa "berhutang budi" → share. |
| **Endowment Effect** | Upload dokumen SENDIRI → "ini milik saya" → males pindah. |
| **IKEA Effect** | Invest effort (upload PDF, review) → nilai platform naik. |
| **Exclusivity (Scarcity)** | "Hanya undangan" → FOMO → minta diundang. |
| **Unity Principle** | "Sesama guru PAI" → identitas bersama → saling bantu. |
| **Social Proof** | Lihat teman sejawat pakai → "saya juga harus pakai." |
| **Loss Aversion** | Setelah 30 hari gratis → "sayang kalau berhenti" → lanjut bayar. |
| **Anchoring** | "Biasanya bikin soal 2 jam" → Rp10.000 terasa sangat murah. |
| **Goal-Gradient** | "20 generate tersisa" → guru makin semangat pakai. |

---

## VII. YANG TIDAK BERUBAH

| Komponen | Status | Keterangan |
|---|---|---|
| AI Pipeline | ✅ TETAP | Upload → extract → generate → approve |
| Auth system | ✅ TETAP | proxy.ts, JWT, CSRF, role guard |
| Quiz Engine | ✅ TETAP | QuizEngine.tsx, CBT, auto-koreksi |
| Guru dashboard | ✅ TETAP | +1 halaman langganan |
| Siswa dashboard | ✅ TETAP | Tidak berubah |
| Cache layer | ✅ TETAP | Redis 30s TTL |
| Design system | ✅ TETAP | Colors, fonts, glass, animation |
| vercel.json | ✅ TETAP | JANGAN DIHAPUS |

---

## VIII. RINGKASAN KEPUTUSAN

| Aspek | MIGRASI-v2 | DISKUSI KITA | KEPUTUSAN FINAL |
|---|---|---|---|
| Model bisnis | Per murid | Per generate + subscription | **Per generate + subscription** |
| Paket | 4 tier (FREE/20K/50K/100K) | 2 tier (MULAI gratis + LANJUTKAN 10K) | **2 tier + SEKOLAH opsional** |
| Token gratis | 10.000 (117 generate) | 2.000 (23 generate) | **2.000** |
| Daily limit | Not enforced | 5x/hari | **5x/hari (enforced)** |
| Launch | Tidak ada rencana | 3 fase (Founder → Invite → Open) | **3 fase** |
| Resource system | Prioritas 1 | Ditunda | **DITUNDA ke Fase 3** |
| Halaman publik | Prioritas 1 | Ditunda | **DITUNDA ke Fase 3** |
| Import data v1 | Fase 5 | Fase 1 | **Fase 1 (setelah anti-boncos)** |
| Harga per guru | Rp20K-100K | Rp10K | **Rp10.000/bulan** |
| Profit per guru | Tidak dihitung | Rp5.000-9.400 | **Rp5.000-9.400** |