---
name: diskusi
description: Triple-Layer Intelligence Engine untuk analisis project mendalam (kode, arsitektur, strategi). 3 siklus forensik + riset LOW/HIGH/EXPERT sebelum rekomendasi. Trigger otomatis: 'gunakan skills diskusi untuk mengambil keputusan', 'diskusi project', 'analisis project', 'techlead mode', '!diskusi'. BUKAN untuk obrolan ringan.
allowed-tools: []
metadata:
  author: Agensi / OpenCode
  version: "2026.3"
  scope: project analysis
  pairs_with: AGENTS.md, 00_SOP_EKSEKUSI_AI.md
  updated: "2026-06-26"
---

# 🧠 SKILL: DISKUSI — Triple-Layer Intelligence Engine v2026.3
**Trigger:** `gunakan skills diskusi untuk mengambil keputusan` / `diskusi project` / `analisis project` / `!diskusi` / `techlead mode`

---

## ⚡ FILOSOFI INTI

> *"Satu kali riset adalah dugaan. Dua kali adalah konfirmasi. Tiga kali adalah keyakinan."*

Skill ini menjalankan **3 siklus intelijen berlapis** sebelum memberikan satu rekomendasi pun.
Setiap siklus lebih dalam, lebih kritis, dan lebih spesifik dari siklus sebelumnya.

Sebelum masuk siklus, tanyakan ke user: **"Apakah ini sesi analisis menyeluruh (3 siklus penuh), atau kamu ingin mendiskusikan satu hal spesifik?"** — lalu sesuaikan siklusnya. Jika hanya pertanyaan spesifik, cukup Siklus 1 + jawab langsung.

```
◀─── KONFIRMASI CAKUPAN ───▶

APAKAH ANALISIS MENYELURUH?
  ├─ YA  →  FASE 0 (Konteks Produk) → 3 SIKLUS PENUH
  └─ TIDAK → FASE 0 → SIKLUS 1 → JAWAB LANGSUNG
```

---

## 🔒 ATURAN GLOBAL (BERLAKU DI SEMUA SIKLUS)

| Aturan | Detail |
|--------|--------|
| **NO HALLUCINATION** | Tidak tahu isi file? BACA. Tidak tahu jawaban? CARI. Jangan asumsi. |
| **NO ISOLATED CODE** | Setiap baris kode baru harus terhubung ke yang sudah ada |
| **NO GENERIC ADVICE** | Semua rekomendasi harus mengacu kondisi nyata project ini |
| **NO MULTI-QUESTION** | Maksimal 1 pertanyaan kritis ke user, di akhir saja |
| **NO SKIP CRITICAL** | Temuan 🔴 CRITICAL harus selalu masuk rekomendasi utama |
| **SEARCH BEFORE ASSUME** | Sebelum nyatakan sesuatu sebagai fakta — verifikasi dulu |
| **GRACEFUL FALLBACK** | Jika web search tidak tersedia, gunakan pengetahuan internal, beri label `[INTERNAL-KNOWLEDGE]`, rekomendasikan verifikasi manual |
| **CHECKPOINT TIAP SIKLUS** | Tulis ringkasan temuan setelah setiap siklus (bisa dilanjutkan jika terputus) |
| **SOURCE CONFLICT** | Jika sumber riset bertolak belakang, prioritaskan yang punya evidence terkuat (benchmark, kode production), laporkan konflik ke user |
| **LAHAN BESAR → PEMINDAIAN BERTAHAP** | Baca entry point → core modules → file paling banyak di-import. Jangan "baca semua file" mentah-mentah |
| **STOP REFACTOR RULE (MVP)** | Jika project masih MVP/staging, jangan rekomendasi refactor besar kecuali: security, potential data corruption, atau blocker feature |

---

# ══════════════════════════════════════════════
# 📋 FASE 0 — PRODUCT CONTEXT
# ══════════════════════════════════════════════

Sebelum siklus analisis, cari konteks produk. Keputusan arsitektur tanpa konteks ini sering salah.

**Cari jawaban (dari file, konfigurasi, atau tanya user maks 1):**
```
□ MVP atau production?
□ Internal tool atau publik?
□ Target user: berapa estimasi user aktif?
□ Deadline: kapan harus rilis?
□ Prioritas bisnis saat ini: apa yang paling menghasilkan value?
```

Catat jawaban — ini akan mempengaruhi bobot setiap rekomendasi nanti.

---

# ══════════════════════════════════════════════
# 🟢 SIKLUS 1 — LOW LEVEL INTELLIGENCE
# ══════════════════════════════════════════════

> *Tujuan: Membangun peta awal. Lihat gambaran besar. Temukan pertanyaan-pertanyaan penting.*

Simpan checkpoint setelah siklus ini selesai: **`[CHECKPOINT] SIKLUS 1 SELESAI — [ringkasan 3-5 poin]`**

---

## [1A] BACA PERTAMA — PEMETAAN STRUKTUR

Pahami anatomi project. Untuk proyek besar (>50 file), prioritaskan:
1. **Entry points** (main, index, app, routes)
2. **Core modules** (yang di-import paling banyak)
3. **Konfigurasi** (package.json, .env, config files)

**Yang dicari:**
```
□ Daftar folder & file utama (top 2 level)
□ Tech stack (deteksi dari package.json / requirements.txt / go.mod / Gemfile / dsb)
□ Entry point aplikasi (main file, index, app)
□ File konfigurasi (.env, config.js, settings.py, dsb)
□ Database/storage yang dipakai
□ External service yang disambungkan
```

**Buat peta visual:**
```
[PROJECT NAME]
├── 📁 [folder] → fungsi: ___ → status: ✅/⚠️/❌/🔥
├── 📁 [folder] → fungsi: ___ → status: ✅/⚠️/❌/🔥
├── 📄 [file kunci] → peran: ___ → status: ✅/⚠️/❌/🔥
└── ...

Legenda: ✅ Solid | ⚠️ Parsial | ❌ Tidak Ada | 🔥 Ada Masalah
```

**Output 1A:** Daftar pertanyaan yang muncul dari pemetaan ini.

---

## [1B] RISET LOW — ORIENTASI EKOSISTEM

**Tujuan:** Pahami standar dan konvensi komunitas untuk tech stack yang ditemukan di 1A.

**Query wajib (sesuaikan tech stack, jika web search tidak tersedia → `[INTERNAL-KNOWLEDGE]`):**
```
Query 1: "[tech stack utama] project structure best practices 2025"
Query 2: "[framework] recommended folder structure production app"
Query 3: "[bahasa pemrograman] common mistakes beginners avoid"
Query 4: "[tech stack] MVP development checklist standard"
Query 5: "[framework] official documentation getting started conventions"
```

**Sumber prioritas:**
1. Official documentation framework/library (paling mudah diakses)
2. "Awesome [tech]" GitHub repositories
3. Starter template populer di GitHub (stars > 1000)
4. Stack Overflow (max 3 tahun)
5. Engineering blog perusahaan (jika terindeks, sebagai pelengkap)

---

## [1C] BACA ULANG + VALIDASI LOW

```
□ Apakah struktur sudah ikuti standar yang ditemukan di riset?
□ Ada gap antara standar komunitas dan kondisi nyata sekarang?
□ Tools yang direkomendasikan komunitas — sudah ada? Belum?
```

**Update peta project:**
- `[NONSTANDAR]` → hal yang menyimpang dari best practice
- `[MISSING STD]` → standar komunitas yang belum ada

**OUTPUT SIKLUS 1:**
> Ringkasan 5-7 poin temuan LOW level.
> Tanyakan ke user: "Apakah peta project dan temuan awal ini sesuai? Lanjut Siklus 2?"

---

---

# ══════════════════════════════════════════════
# 🟡 SIKLUS 2 — HIGH LEVEL INTELLIGENCE
# ══════════════════════════════════════════════

> *Tujuan: Masuk ke dalam. Pahami logika bisnis. Temukan masalah nyata yang tersembunyi.*

Simpan checkpoint setelah siklus ini: **`[CHECKPOINT] SIKLUS 2 SELESAI — [ringkasan 3-5 poin]`**

---

## [2A] BACA KEDUA — PEMBEDAHAN FUNGSIONAL

Fokus pada core modules yang teridentifikasi di Siklus 1. Jangan baca semua file.

### Logika Bisnis
```
□ Alur utama aplikasi dari input user sampai output — sudah lengkap?
□ Ada gap di tengah alur? Di mana putusnya?
□ Kondisi bisnis yang belum di-handle: edge case, error state, empty state
□ Validasi input — sudah ada di semua titik yang perlu?
```

### Integrasi Antar Komponen
```
□ Setiap import/require — apakah file yang diimport ada dan pathnya benar?
□ Setiap function call — apakah fungsi yang dipanggil exist dan signature-nya cocok?
□ Data flow — apakah data yang dikirim dari A sesuai format yang diharapkan B?
□ Kode orphan — ada fungsi/komponen yang dibuat tapi tidak pernah dipanggil?
```

### Database & Storage
```
□ Schema — apakah sesuai data yang akan disimpan?
□ Query — ada SQL injection? N+1 problem? Missing index?
□ Migration — ada file migration? Sudah up to date?
```

### Security Surface
```
□ Authentication & Authorization — siapa boleh akses apa?
□ Input sanitization — user input langsung masuk ke query/render tanpa filter?
□ Credential — ada password/API key yang hardcoded di kode?
□ CORS, CSRF, XSS protection — ada/tidak/salah konfigurasi?
□ Rate limiting — ada perlindungan dari abuse?
```

### Performance Baseline
```
□ Loop bersarang yang berpotensi O(n²) atau lebih buruk?
□ Request ke database/API di dalam loop?
□ Kalkulasi berat yang bisa di-cache tapi tidak di-cache?
```

### Technical Debt
```
□ TODO / FIXME / HACK / XXX comment di kode
□ Hardcoded value yang harusnya jadi environment variable
□ Duplikasi logika yang bisa di-refactor
```

---

## [2B] RISET HIGH — SOLUSI SPESIFIK TERVERIFIKASI

**Query wajib** (jika web search tidak tersedia → `[INTERNAL-KNOWLEDGE]`):
```
Query 1: "[masalah spesifik #1] best solution [tech stack] production 2025"
Query 2: "[masalah spesifik #2] how to fix [framework] correctly"
Query 3: "[fitur yang belum ada tapi perlu] implementation guide [tech stack]"
Query 4: "[security issue yang ditemukan] how to prevent [tech stack] 2025"
Query 5: "[library yang dipakai] vs [alternatif populer] performance comparison"
```

---

## [2C] BACA ULANG + KOREKSI HIGH

**Update matriks masalah:**

| Masalah | File:Baris | Severity | Solusi Terverifikasi | Effort |
|---------|-----------|----------|----------------------|--------|
| [masalah] | [lokasi] | 🔴/🟡/🟢 | [solusi dari riset] | S/M/L/XL |

**OUTPUT SIKLUS 2:**
> Daftar masalah terverifikasi dengan solusi dikonfirmasi komunitas.

---

---

# ══════════════════════════════════════════════
# 🔴 SIKLUS 3 — EXPERT LEVEL INTELLIGENCE
# ══════════════════════════════════════════════

> *Tujuan: Lihat yang tidak terlihat. Antisipasi masalah 3 langkah ke depan. Buat keputusan seperti CTO.*

Simpan checkpoint setelah siklus ini: **`[CHECKPOINT] SIKLUS 3 SELESAI — [ringkasan 3-5 poin]`**

---

## [3A] BACA KETIGA — ANALISIS STRATEGIS

Baca kode terakhir kalinya pada file inti saja — bukan cari bug, lihat sistem secara keseluruhan.

### Skalabilitas Arsitektur
```
□ Kalau user bertambah 10x, bagian mana yang collapse pertama?
□ Arsitektur saat ini memungkinkan scale horizontal?
□ Ada single point of failure?
□ Coupling antar modul terlalu tight?
□ Ada God Object / God Function?
```

### Maintainability Jangka Panjang
```
□ Developer baru masuk — seberapa cepat paham kode ini?
□ Naming convention seragam?
□ Dokumentasi — ada? Outdated?
□ Test coverage — ada test untuk case penting?
```

### Dependency Risk
```
□ Library paling kritikal — di-maintain atau deprecated?
□ Ada vendor lock-in?
□ Security vulnerability di dependency?
```

### Business Logic Completeness
```
□ User journey utama — end-to-end atau putus?
□ Error handling — kalau API external down, apa yang terjadi?
□ Logging & monitoring — bisa deteksi kegagalan di production?
```

---

## [3B] RISET EXPERT — VALIDASI KEPUTUSAN STRATEGIS

**Query wajib** (jika web search tidak tersedia → `[INTERNAL-KNOWLEDGE]`):
```
Query 1: "[arsitektur yang dipakai] at scale lessons learned [tech stack]"
Query 2: "when to refactor vs rewrite [jenis project] technical debt decision"
Query 3: "production readiness checklist [jenis aplikasi] [tech stack]"
Query 4: "[jenis aplikasi] scaling from 0 to 10k users lessons learned"
```

**Sumber prioritas:**
1. Dokumentasi resmi & GitHub issues library terkait
2. Stack Overflow (high vote, max 3 tahun)
3. Engineering blog (Vercel, Shopify, Discord, dll — jika terindeks)
4. High Scalability blog / Martin Fowler (pelengkap)

Jika temuan dari sumber berbeda bertolak belakang: prioritaskan yang punya benchmark/evidence, lalu laporkan konflik.

---

## [3C] BACA FINAL + SINTESIS EXPERT

```
□ Semua temuan dari 3 siklus — mana yang benar-benar penting vs noise?
□ Korelasi: apakah masalah A dan B punya root cause yang sama?
□ Urutan ideal: apakah setiap step mempersiapkan step berikutnya?
□ Risk assessment: kalau salah pilih jalur, worst case?
□ Quick win: ada yang selesai < 1 jam, impact besar, dan TIDAK disentuh jalur utama?
□ Non-negotiable: apa yang HARUS ada sebelum siap production?
```

---

---

# ══════════════════════════════════════════════
# 📊 PRESENTASI KEPUTUSAN FINAL
# ══════════════════════════════════════════════

---

## 🏥 DIAGNOSIS PROJECT

```
┌─────────────────────────────────────────────────────────┐
│ Nama Project   : [deteksi otomatis]                     │
│ Tech Stack     : [deteksi otomatis]                     │
│ Stage          : [dari FASE 0]                          │
│ Health Score   : [X/10]                                 │
│ Riset Selesai  : ✅ LOW  ✅ HIGH  ✅ EXPERT             │
│ Confidence     : High / Medium / Low                    │
└─────────────────────────────────────────────────────────┘
```

**Satu kalimat jujur tentang kondisi project:**
> *"[Kalimat yang benar-benar menggambarkan kondisi, tanpa pemanis]"*

---

## 🗺️ PETA STATUS PROJECT (Final)

```
✅ Solid  ⚠️ Parsial  ❌ Hilang  🔥 Kritis  🔒 Security  [NONSTANDAR]  [MISSING STD]
```

---

## 🔬 TEMUAN LENGKAP — 3 SIKLUS INTELIJEN

### ✅ Yang Sudah Solid
### ⚠️ Yang Perlu Perhatian
### 🔴 CRITICAL — HARUS DISELESAIKAN DULU
### 🔒 Security Issues
### 📉 Technical Debt Menumpuk

---

## 📊 ROI MATRIKS

| Task | Effort | User Impact | Business Impact | Prioritas |
|------|--------|-------------|-----------------|-----------|
| [task] | S/M/L/XL | Rendah/Sedang/Tinggi | Rendah/Sedang/Tinggi | 🔴/🟡/🟢 |

---

## 🌐 INSIGHT DARI ENGINEER INTERNASIONAL
*(3 Layer Riset: LOW + HIGH + EXPERT)*

**Layer 1 — Standar Komunitas (dari Riset LOW):**
> [Insight paling relevan]

**Layer 2 — Solusi Teruji (dari Riset HIGH):**
> [Insight solusi konkret sudah terbukti]

**Layer 3 — Perspektif Senior (dari Riset EXPERT):**
> [Insight dari engineer berpengalaman]

---

## 🚀 REKOMENDASI JALUR

---

### 🥇 JALUR UTAMA — [Nama Spesifik]

**Dasar keputusan setelah 3 siklus analisis:**
[Argumentasi teknis berdasarkan data riset, bukan opini]

**Langkah eksekusi detail:**
```
STEP 1: [Nama aksi — File disentuh — Estimasi]
  ├─ Yang dikerjakan  : [deskripsi detail]
  ├─ File disentuh    : [list file spesifik]
  ├─ Integrasi dengan : [komponen lain yang perlu update]
  └─ Checklist        : □ [item] □ [item]

STEP 2: [Nama aksi — File disentuh — Estimasi]
  ├─ Bergantung pada  : Step 1 selesai
  └─ ...
```

**Risiko kalau tidak dipilih:** [konsekuensi konkret]
**Estimasi total:** [waktu realistis]
**Kompleksitas:** 🟢 Mudah / 🟡 Sedang / 🔴 Kompleks / ⚫ Expert

---

### 🥈 JALUR ALTERNATIF — [Nama Spesifik]

**Kapan pilih ini:** [kondisi spesifik]
**Trade-off:** [apa didapat vs dikorbankan]

---

## 🎯 DECISION RECORD

**Decision:** [apa yang dipilih]
**Alternatif yang ditolak:** [opsi lain]
**Alasan penolakan:** [tradeoff]
**Konsekuensi (3 bulan ke depan):** [dampak]

---

## ⚡ QUICK WIN (< 1 Jam, Impact Langsung)
*Hanya rekomendasi quick win yang TIDAK disentuh oleh langkah eksekusi Jalur Utama.*

1. [Quick win #1 — waktu — impact]
2. [Quick win #2 — waktu — impact]

---

## 📅 TIMELINE REALISTIS (Berdasarkan Konteks Produk + Jalur Utama)

```
HARI 1   : [aksi] ─── [alasan urutan]
HARI 2-3 : [aksi] ─── [bergantung pada hari 1]
HARI 4-5 : [aksi] ─── [bergantung pada hari 2-3]
HARI 6+  : [aksi] ─── [bisa belakangan karena...]
```

---

## ✅ REKOMENDASI AKHIR

```
→ JALUR UTAMA: [Nama Jalur]

Karena: [2-3 kalimat argumentasi berdasarkan data riset]
```

> **Satu pertanyaan sebelum mulai:** [PERTANYAAN PALING KRITIS — atau skip jika sudah clear]
>
> Atau ketik `lanjut jalur utama` untuk mulai eksekusi.

---

---

# ══════════════════════════════════════════════
# ⚙️ PROTOKOL EKSEKUSI KODE
# ══════════════════════════════════════════════

*(Aktif setelah user konfirmasi jalur)*

## Sebelum Eksekusi — Check Git

```
WAJIB CEK:
□ Cek `git status` — apakah working tree bersih?
□ Jika ada perubahan belum commit → tanya user: "Ada perubahan yang belum disimpan.
  Lanjut? (bisa kehilangan kerjaan)"
□ Cek branch saat ini — apakah branch yang benar?
```

## Sebelum Tulis Satu Baris Kode

```
WAJIB:
□ Baca ulang SEMUA file yang akan disentuh — dari disk, bukan dari memori
□ Trace semua import/dependency di file tersebut
□ Identifikasi fungsi/komponen yang sudah ada dan bisa dipakai ulang
□ Cek test yang perlu diupdate setelah perubahan ini
□ Kalau tidak yakin → SEARCH dulu, jangan asumsi
```

## Saat Menulis Kode

```
□ Naming convention HARUS konsisten dengan kode yang sudah ada
□ Setiap fungsi baru harus tersambung ke sistem yang sudah ada
□ Error handling wajib (bukan hanya happy path)
□ Tidak boleh hardcode — gunakan constant/config/env var
□ Kalau membuat asumsi — tulis // ASUMSI: [penjelasan]
```

## Setelah Selesai Satu Step

```
□ Review: kode baru menyebabkan sesuatu yang lama broken?
□ Trace: semua pemanggil modul ini masih bekerja?
□ Test: jalankan test, kalau tidak ada → test manual core flow
□ Lapor ke user: apa berubah, apa tersambung, apa next step
```

---

## 🚫 LARANGAN KERAS (SELALU AKTIF)

1. **JANGAN HALUSINASI** — Tidak tahu isi file? Baca. Tidak tahu jawaban? Cari. Titik.
2. **JANGAN SKIP INTEGRASI** — Kode baru yang tidak tersambung > tidak ada kode
3. **JANGAN REKOMENDASI GENERIK** — Semua saran harus mengacu kondisi nyata project ini
4. **JANGAN TANYA BANYAK** — Maksimal 1 pertanyaan kritis. Sisanya kerjakan sendiri.
5. **JANGAN ABAIKAN CRITICAL** — Temuan 🔴 harus selalu masuk rekomendasi utama
6. **JANGAN KODE TANPA BACA** — Wajib 3 siklus forensik + riset dulu, kode belakangan
7. **JANGAN LANJUT KALAU RAGU** — Ada yang ambigu? Klarifikasi SATU hal paling kritis
8. **JANGAN SKIP SIKLUS** — Tidak ada shortcut dari LOW langsung ke EXPERT
9. **JANGAN OVER-ENGINEERING (MVP)** — Jika MVP, jangan refactor besar kecuali security/data corruption/blocker
10. **JANGAN REKOMENDASI QUICK WIN YANG BENTROK JALUR UTAMA** — Cek dulu sebelum kasih quick win

---

## 📌 CARA AKTIVASI

**User cukup ketik:** `gunakan skills diskusi untuk mengambil keputusan` / `diskusi project` / `analisis project` / `!diskusi` / `techlead mode`

**Flow otomatis:**

```
KONFIRMASI CAKUPAN ─── Apakah sesi menyeluruh atau spesifik?

FASE 0 — Product Context (cari konteks produk)

SIKLUS 1 — LOW:
  [1A] Baca kode (prioritas entry point + core module)
  [1B] Riset LOW → [INTERNAL-KNOWLEDGE] jika offline
  [1C] Baca ulang → validasi
  [CHECKPOINT + KONFIRMASI USER]

SIKLUS 2 — HIGH:
  [2A] Baca mendalam (core modules)
  [2B] Riset HIGH → solusi spesifik
  [2C] Baca ulang → koreksi
  [CHECKPOINT]

SIKLUS 3 — EXPERT:
  [3A] Baca strategis (file inti)
  [3B] Riset EXPERT → validasi arsitektur
  [3C] Sintesis final → timeline
  [CHECKPOINT]

PRESENTASI:
  → Diagnosis + ROI + Decision Record + 3 jalur + Quick Wins

EKSEKUSI:
  → Setelah user konfirmasi (cek git dulu)
  → Report setiap step selesai
```

---

*SKILL_DISKUSI_v3.md — Triple-Layer Intelligence Engine*
*Versi 2026.3 | Upgrade: FASE 0, graceful fallback, prioritasi file, checkpoint tiap siklus, konfirmasi cakupan, konflik sumber, ROI matriks, Decision Record, stop refactor rule untuk MVP, verifikasi git, confidence High/Med/Low.*
