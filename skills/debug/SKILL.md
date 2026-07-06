---
name: debug
description: Systematic Root Cause Analysis Engine — 4 fase forensik debug + lapisan keputusan (forensik → hipotesis → konfirmasi → fix+defend, dengan risk classification, evidence-based confidence, decision trade-off, rollback safety gate, dan exit criteria). Trigger: 'gunakan skills debug', 'skills debug', 'debug ini', 'ada error', 'tidak jalan', 'kenapa ini error'. Wajib dipakai SETELAH coding selesai (Langkah 5.5 di 00_SOP_EKSEKUSI_AI.md). DILARANG tulis fix sebelum root cause teridentifikasi DAN risk/rollback plan disetujui.
allowed-tools: []
metadata:
  author: Agensi / OpenCode
  version: "2026.3"
  scope: post-build verification
  pairs_with: 00_SOP_EKSEKUSI_AI.md, 09_sop_kerja.md
  updated: "2026-07-01"
  changelog: "2026.2 — Risk Classification, Evidence-Based Confidence Tier, Decision Trade-off Engine, Rollback Safety Gate, Time-box & Escalation Protocol, Data Safety in Logs, Exit Criteria, Knowledge Base Feedback Loop. 2026.3 — Self-Verification Bias Guard (independent test, bukan klaim sendiri), protokol khusus Performance/Latency & Security bug, protokol Distributed/Multi-Service debugging, protokol Vendor/Third-Party bug (tidak bisa diedit), AI-Hallucinated-Code Check, Post-Deploy Monitoring Window, Audit Trail untuk fix Critical/production, Systemic Pattern Escalation (root cause berulang → architecture debt, bukan cuma dicatat)"
---

# 🔍 SKILL: DEBUG — Systematic Root Cause Analysis Engine
**Versi:** 2026.3
**Trigger:** `gunakan skills debug` / `skills debug` / `debug ini` / `ada error` / `tidak jalan`

---

## ⚡ FILOSOFI INTI

> *"Debugging bukan tebak-tebakan. Ini investigasi ilmiah. Detektif tidak menangkap tersangka sebelum punya bukti."*

**SATU ATURAN BESI:**
```
❌ DILARANG KERAS: Tulis fix sebelum root cause teridentifikasi 100%
✅ WAJIB: Buktikan root cause dulu — baru tulis satu baris kode fix
```

Skill ini menjalankan **4 fase investigasi** secara berurutan.
Tidak boleh skip. Tidak boleh langsung ke fix. Investigasi dulu.

```
FASE 1 — FORENSIK    : Kumpulkan bukti. Baca error. Baca kode.
FASE 2 — HIPOTESIS   : Bentuk teori. Uji satu per satu.
FASE 3 — KONFIRMASI  : Buktikan root cause. Bukan asumsi — fakta.
FASE 4 — FIX + DEFEND: Fix minimal. Verifikasi. Pasang penjaga.
```

---

## 🔒 ATURAN GLOBAL DEBUG (BERLAKU SEPANJANG SESI)

| Aturan | Detail |
|--------|--------|
| **NO GUESSING** | Setiap klaim tentang penyebab bug harus didukung bukti dari kode nyata |
| **ONE CHANGE AT A TIME** | Setiap percobaan fix hanya ubah SATU hal — supaya hasilnya bisa diinterpretasikan |
| **READ BEFORE FIX** | Wajib baca file yang terlibat secara penuh sebelum ubah apapun |
| **MINIMAL FIX** | Fix sekecil mungkin — jangan refactor sambil debug |
| **VERIFY AFTER FIX** | Setelah fix, wajib verifikasi bug tidak muncul lagi DAN tidak ada yang baru rusak |
| **NO PARALLEL HYPOTHESES** | Uji satu hipotesis sampai selesai — jangan ganti ke hipotesis lain sebelum hasil pertama jelas |
| **SEARCH IF UNSURE** | Kalau tidak yakin tentang behavior suatu library/API — cari dokumentasinya dulu |
| **TIME-BOX** | Setiap fase punya batas usaha wajar (lihat [2C]/[3C]). Kalau batas terlampaui tanpa hasil → STOP, jangan lanjut menebak. Eskalasi ke user dengan format di [2C] |
| **DATA SAFETY IN LOGS** | Saat kutip error/log/stack trace di laporan: redact credential, token, API key, password, dan PII (email/nomor telepon/NIK) sebelum ditampilkan. Ganti dengan `[REDACTED]` |
| **NO FAKE CONFIDENCE** | Dilarang klaim "confidence 95%" atau angka probabilitas tanpa dasar statistik nyata. Gunakan tier evidence-based di [3B] — bukan angka yang terlihat presisi tapi sebenarnya karangan |

---

---

# ══════════════════════════════════════════════
# 🔍 FASE 1 — FORENSIK (Kumpulkan Semua Bukti)
# ══════════════════════════════════════════════

> *"Seorang detektif tidak menyimpulkan sebelum mengamati TKP secara menyeluruh."*

Jangan sentuh kode dulu. Kumpulkan bukti sebanyak mungkin.

---

## [1A] BACA ERROR SECARA LITERAL

Baca pesan error kata per kata. Jangan skip, jangan interpretasikan dulu.

**Yang dicatat:**
```
□ Tipe error persis: (TypeError / SyntaxError / ReferenceError / 500 / 404 / dsb)
□ Pesan error persis: (copy kata-katanya — jangan parafrase)
□ File dan baris yang disebutkan: (trace lengkap — dari atas ke bawah)
□ Timestamp: (kapan pertama muncul? Selalu muncul atau intermittent?)
□ Environment: (dev / staging / production? OS? Node version? Browser?)
□ Kondisi saat error: (action apa yang dilakukan user? Input apa yang diberikan?)
```

**Klasifikasi error:**
- 🔴 **Runtime Error** — program jalan tapi crash di tengah jalan
- 🟡 **Logic Error** — program jalan tapi output salah / behavior tidak sesuai harapan
- 🟠 **Integration Error** — dua sistem tidak nyambung dengan benar
- 🔵 **Environment Error** — kode benar tapi konfigurasi/dependency bermasalah
- ⚫ **Regression** — dulu jalan, sekarang tidak — ada yang berubah

---

## [1B] BACA KODE YANG TERLIBAT (Penuh, Bukan Sekilas)

Trace stack dari error ke atas sampai titik awal request/action.

**Yang dibaca:**
```
□ File dan fungsi yang disebut di stack trace — baca seluruhnya
□ File yang memanggil fungsi bermasalah (caller) — baca juga
□ Semua import/dependency yang dipakai di file tersebut
□ Konfigurasi yang relevan (env variable, config file, middleware)
□ Data yang masuk ke fungsi bermasalah (tipe, format, nilai nyata)
□ Data yang keluar (atau yang seharusnya keluar)
```

**Buat peta alur data:**
```
[Input dari mana] → [Fungsi A] → [Fungsi B] → [Fungsi C] → [Output / Error terjadi di sini]

Tandai di titik mana data mulai "salah" — bukan di mana error muncul,
tapi di mana data pertama kali menjadi salah.
```

---

## [1B-1] CEK HALUSINASI KODE (KHUSUS KALAU KODE DITULIS AI SEBELUMNYA)

Kalau kode yang bermasalah sebelumnya ditulis oleh AI agent (termasuk sesi
sebelumnya dari diri sendiri), ada kelas bug yang tidak ada di kode buatan
manusia: **API/fungsi/parameter yang terlihat masuk akal tapi sebenarnya
tidak pernah ada.**

```
□ Apakah fungsi/method/parameter yang dipanggil benar-benar ada di
  dokumentasi resmi library ini? (bukan diasumsikan ada karena "biasanya
  library lain punya fungsi ini")
□ Kalau versi library disebut spesifik — apakah fungsi ini ada di versi
  tersebut? (bisa saja fungsi itu ada tapi baru di versi lebih baru/lama)
□ Cek import/package name — apakah nama package-nya benar persis?
  (typosquatting/nama mirip package lain yang beda fungsi)
```
Kalau ditemukan API yang tidak ada — ini BUKAN bug biasa, ini root cause
langsung. Jangan cari penjelasan lain, perbaiki dengan API yang benar
(cari di dokumentasi resmi, bukan ditebak lagi).

---

## [1C] CARI KONTEKS PERUBAHAN TERAKHIR

Bug baru biasanya punya penyebab baru.

```
□ Apa yang terakhir diubah sebelum bug ini muncul?
   → File apa? Fungsi apa? Library apa yang diupdate?
□ Apakah bug ini muncul setelah merge/commit tertentu?
   → Bisa gunakan: git log --oneline -20
□ Apakah ada dependency yang baru diinstall atau diupdate?
   → Cek package.json / requirements.txt vs package-lock.json
□ Apakah ada perubahan environment? (upgrade Node, Python, OS, dsb)
□ Apakah bug ini selalu ada atau baru muncul?
```

---

## [1D] REPRODUKSI MINIMAL

Sebelum lanjut, pastikan bug bisa direproduksi secara konsisten.

```
□ Apa langkah paling minimal untuk membuat bug ini muncul?
   → Tulis step by step yang bisa diulang
□ Apakah bug ini 100% reproducible atau intermittent?
   → Kalau intermittent: dalam kondisi apa dia muncul? Beban tinggi? Race condition?
□ Apakah hanya di satu environment atau semua environment?
□ Apakah hanya dengan input tertentu?
   → Cari: apa yang BERBEDA antara input yang berhasil vs yang gagal?
```

**OUTPUT FASE 1:**
```
BUG CARD:
─────────────────────────────────────────────
Tipe Error    : [tipe]
Pesan Error   : [persis dari console/log — REDACT credential/PII kalau ada]
Lokasi        : [file:baris]
Alur Data     : [A → B → C → ERROR di D]
Pertama Muncul: [kapan / setelah perubahan apa]
Reproducible  : Ya / Tidak / Intermittent
Kondisi       : [apa yang harus dilakukan untuk reproduce]
─────────────────────────────────────────────
```

---

## [1E] KLASIFIKASI RISIKO (RISK MATRIX)

Tidak semua bug diperlakukan sama. Bug login gagal ≠ bug database corruption.
Klasifikasi ini menentukan seberapa hati-hati dan seberapa banyak verifikasi
yang dibutuhkan sebelum fix di [Fase 4].

```
SEVERITY (dampak kalau tidak diperbaiki):
🔴 Critical — data hilang/corrupt, security breach, sistem down total
🟠 High     — fitur inti tidak bisa dipakai, banyak user terdampak
🟡 Medium   — fitur sekunder rusak, ada workaround
⚪ Low      — kosmetik, edge case jarang terjadi

BLAST RADIUS (seberapa luas area yang tersentuh oleh fix):
□ Satu fungsi/file terisolasi
□ Satu modul, dipanggil beberapa tempat
□ Shared utility / dipakai lintas modul
□ Core data model / schema / auth layer

REVERSIBILITAS FIX (seberapa mudah dibatalkan kalau salah):
□ Mudah — ubah kode, langsung revert dengan git
□ Sedang — ada migrasi data tapi bisa di-rollback
□ Sulit — mengubah data production, tidak ada rollback otomatis
```

**Aturan berdasarkan risiko:**
```
IF Severity = Critical ATAU Blast Radius = Core data model/auth
THEN wajib: rollback plan tertulis SEBELUM fix ditulis (lihat [4A-2])
     + verifikasi ekstra di [4C] (tidak boleh diskip)
     + pertimbangkan eskalasi ke user sebelum eksekusi fix di production

IF Reversibilitas = Sulit
THEN wajib: backup/snapshot data sebelum fix dijalankan di production
```

---

---

# ══════════════════════════════════════════════
# 🧪 FASE 2 — HIPOTESIS (Teori + Pengujian Ilmiah)
# ══════════════════════════════════════════════

> *"Setiap hipotesis adalah pertanyaan. Setiap test adalah jawaban. Jangan pindah ke pertanyaan berikutnya sebelum yang ini terjawab."*

---

## [2A] BENTUK HIPOTESIS BERDASARKAN BUKTI

Dari bukti di Fase 1, buat daftar hipotesis yang mungkin.

**Format hipotesis yang benar:**
```
Hipotesis X: "Bug terjadi KARENA [mekanisme spesifik], yang menyebabkan [efek yang diamati]"

Contoh BENAR:
"Bug terjadi karena fungsi getUser() mengembalikan null ketika user tidak login,
tapi caller tidak handle kasus null, sehingga .name crash dengan TypeError"

Contoh SALAH (terlalu umum):
"Bug terjadi karena ada masalah di auth"
```

**Urutan hipotesis berdasarkan probabilitas:**
```
Hipotesis 1: [yang paling mungkin berdasarkan bukti — uji ini dulu]
Hipotesis 2: [yang kedua paling mungkin]
Hipotesis 3: [yang ketiga]
...
```

**Panduan menentukan probabilitas:**
- Hipotesis paling mungkin = yang paling dekat dengan lokasi error di stack trace
- Uji yang paling mudah diverifikasi dulu (bukan yang paling dramatis)
- Satu hipotesis = satu mekanisme yang spesifik

---

## [2B] UJI HIPOTESIS — SATU PER SATU

Untuk setiap hipotesis, ikuti protokol ini:

```
PROTOKOL UJI HIPOTESIS:
────────────────────────────────────────────────
1. PREDIKSI   : Kalau hipotesis ini benar, apa yang akan kita lihat?
                "Kalau masalahnya di X, maka ketika saya Y, hasilnya harus Z"

2. TEST       : Lakukan observasi/eksperimen minimal yang bisa membuktikan atau
                membantah hipotesis ini TANPA mengubah kode production
                → Tambah console.log / print di titik strategis
                → Periksa nilai variabel saat runtime
                → Isolasi fungsi dan test dengan input minimal
                → Cek return value yang sebenarnya (bukan yang diasumsikan)

3. OBSERVASI  : Apa yang benar-benar terjadi?
                Catat hasil nyata — bukan yang diharapkan

4. KESIMPULAN :
   ✅ Hasil cocok dengan prediksi → Hipotesis TERKONFIRMASI → Lanjut ke Fase 3
   ❌ Hasil tidak cocok dengan prediksi → Hipotesis DITOLAK → Uji hipotesis berikutnya
   ❓ Hasil tidak jelas → Perlu data tambahan → Tambah logging lebih detail
────────────────────────────────────────────────
```

**Teknik bisection (untuk bug yang sulit dilokasi):**
```
Ketika tidak tahu di bagian mana bug berada:

1. Tentukan titik BENAR (working state) dan titik SALAH (broken state)
2. Tambah checkpoint/log di TENGAH antara keduanya
3. Apakah tengah sudah salah atau masih benar?
   → Sudah salah: bug ada di SEPARUH PERTAMA
   → Masih benar: bug ada di SEPARUH KEDUA
4. Ulangi — potong lagi di tengah — sampai titik exak ditemukan

Untuk git: git bisect start → git bisect bad HEAD → git bisect good [commit lama]
```

**Teknik divide and conquer (untuk data flow yang panjang):**
```
Untuk alur: A → B → C → D → E (error di E)

Test: apakah output D sudah salah?
  → Ya: test output C → apakah C sudah salah?
      → Ya: test output B → dst.
  → Tidak: bug ada antara D dan E
```

---

## [2C] STOP CONDITION & ESKALASI (KALAU 3 HIPOTESIS DITOLAK ATAU WAKTU HABIS)

**BERHENTI.** Jangan terus menebak-nebak. Ini bukan kegagalan — ini sinyal
bahwa AI butuh lebih banyak informasi daripada yang tersedia sekarang.

**Trigger STOP (salah satu cukup):**
```
□ 3 hipotesis sudah diuji dan ditolak semua
□ Sudah menghabiskan ~30 menit setara usaha investigasi tanpa progres bukti baru
□ Bukti yang ada saling kontradiksi dan tidak bisa direkonsiliasi
```

**Sebelum eskalasi ke user, coba dulu (satu putaran, jangan berulang):**
```
□ Baca ulang dokumentasi library/framework yang terlibat
□ Search internet: "[error message persis] [tech stack]"
□ Cari: apakah ini known bug di library? Ada issue di GitHub-nya?
□ Cek: apakah asumsi tentang behavior library sudah benar?
   (Library mungkin tidak bekerja seperti yang diasumsikan)
□ Tambah logging lebih agresif — lihat nilai SEBENARNYA semua variabel
□ Buat test case yang paling minimal mungkin yang bisa reproduce bug
```

**Kalau masih tidak ketemu → eskalasi ke user dengan format ini (jangan cuma bilang "belum ketemu"):**
```
🛑 ESKALASI — Butuh Input User
─────────────────────────────────────────────
Yang sudah dicoba:
1. Hipotesis A — [ringkasan] → DITOLAK karena [bukti]
2. Hipotesis B — [ringkasan] → DITOLAK karena [bukti]
3. Hipotesis C — [ringkasan] → DITOLAK karena [bukti]

Bukti yang masih valid:
- [bukti yang konsisten di semua percobaan]

Bukti yang kontradiktif/tidak terjelaskan:
- [kalau ada]

Yang saya butuhkan dari kamu:
- [pertanyaan spesifik — mis. "apakah ada perubahan konfigurasi server yang
   tidak tercermin di git log?" bukan pertanyaan generik "ada info tambahan?"]
─────────────────────────────────────────────
```
Jangan lanjut ke Fase 3 dengan root cause yang belum benar-benar terkonfirmasi
hanya karena ingin terlihat "selesai".

---

---

# ══════════════════════════════════════════════
# ✅ FASE 3 — KONFIRMASI ROOT CAUSE
# ══════════════════════════════════════════════

> *"Hipotesis yang terkonfirmasi masih bukan root cause. Root cause adalah 'kenapa hipotesis itu terjadi'."*

---

## [3A] DARI HIPOTESIS KE ROOT CAUSE

Hipotesis yang terkonfirmasi hanya menunjukkan LOKASI bug.
Root cause menjelaskan MENGAPA bug ada di sana.

**Tanya "Kenapa?" minimal 3 kali:**
```
Hipotesis terkonfirmasi: "getUser() mengembalikan null"

Kenapa #1: Kenapa getUser() mengembalikan null?
→ Karena tidak ada session yang valid

Kenapa #2: Kenapa tidak ada session yang valid?
→ Karena token JWT sudah expired dan tidak di-refresh

Kenapa #3: Kenapa token tidak di-refresh?
→ Karena refresh logic tidak dipanggil di route ini — di-skip waktu refactor minggu lalu

ROOT CAUSE: Refresh logic ter-skip saat refactor karena tidak ada test yang cover case ini
```

**Bedakan:**
- 🔴 **Root Cause** = alasan fundamental kenapa bug ini bisa ada
- 🟡 **Symptom** = apa yang user/developer lihat
- 🟠 **Proximate Cause** = titik langsung di mana error terjadi

---

## [3B] VERIFIKASI ROOT CAUSE

Sebelum lanjut fix, konfirmasi root cause dengan cara:

```
□ Bisa dijelaskan dengan kalimat yang spesifik dan logis?
  "Bug ini terjadi karena [X], yang menyebabkan [Y], sehingga [Z error muncul]"
  
□ Kalau root cause ini diperbaiki, apakah semua symptom akan hilang?
  → Kalau tidak semua hilang: mungkin ada root cause lain yang belum ketemu

□ Apakah root cause ini konsisten dengan SEMUA bukti yang dikumpulkan di Fase 1?
  → Kalau ada bukti yang tidak cocok: root cause belum benar

□ Bisa dibuat test yang fail karena root cause ini dan pass setelah fix?
  → Kalau tidak bisa: root cause masih terlalu abstrak
```

---

## [3C] CONFIDENCE TIER (EVIDENCE-BASED, BUKAN ANGKA KARANGAN)

**Kenapa bukan persentase:** AI tidak punya probabilitas kalibrasi yang valid.
Menulis "confidence 96%" itu terlihat presisi tapi sebenarnya cuma teks —
bukan statistik sungguhan. Yang dipakai di sini adalah **tier berbasis
checklist bukti yang benar-benar terisi**, bukan perasaan AI.

```
Centang kategori bukti yang benar-benar didapat (bukan diasumsikan):

□ Reproduksi konsisten (bug muncul lagi setiap kali langkah diulang)
□ Stack trace / error message menunjuk langsung ke lokasi root cause
□ Ada test yang fail SEBELUM fix karena root cause ini secara spesifik
□ "Kenapa?" 3x sudah dijawab dengan bukti nyata di tiap tingkat (bukan tebakan)
□ Root cause konsisten dengan SEMUA bukti Fase 1 (tidak ada yang kontradiktif)
□ Sudah dicek: tidak ada penjelasan alternatif yang sama-sama cocok dengan bukti

TIER:
🟢 HIGH    — 5-6 kategori tercentang → boleh lanjut ke Fase 4
🟡 MEDIUM  — 3-4 kategori tercentang → boleh lanjut TAPI tambahkan verifikasi
             ekstra di [4C] sebelum anggap selesai, dan sebutkan gap-nya di
             laporan akhir
🔴 LOW     — ≤2 kategori tercentang → JANGAN fix. Kembali ke Fase 2, hipotesis
             belum benar-benar terkonfirmasi — ini masih dugaan
```
Tulis tier ini apa adanya di output Fase 3 — termasuk kalau MEDIUM, jangan
dibulatkan ke HIGH supaya laporan "terlihat lengkap".

**OUTPUT FASE 3:**
```
ROOT CAUSE STATEMENT:
─────────────────────────────────────────────────────────
"Bug ini terjadi karena [root cause spesifik].

Mekanisme:
[input/trigger] → [mengapa root cause aktif] → [efek langsung] → [error yang terlihat]

Bukti yang mendukung:
- [bukti 1 dari fase 1 atau 2]
- [bukti 2]
- [bukti 3]

Confidence Tier : 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW  [lihat [3C]]
Risk Class      : [dari [1E] — Severity / Blast Radius / Reversibilitas]

Fix yang diperlukan:
[deskripsi fix minimal yang menyentuh root cause, bukan symptom]
─────────────────────────────────────────────────────────
```

---

---

# ══════════════════════════════════════════════
# 🔧 FASE 4 — FIX + DEFEND
# ══════════════════════════════════════════════

> *"Fix yang baik adalah yang terkecil yang solve root cause — bukan yang terbesar yang 'terlihat' menyeluruh."*

---

## [4A] DESAIN FIX MINIMAL

Sebelum tulis kode:

```
□ Apa perubahan TERKECIL yang memperbaiki root cause?
  → Jangan refactor sekalian, jangan "sekalian beresin yang lain"
  → Satu bug = satu fix fokus

□ Apakah fix ini menyentuh root cause atau hanya symptom?
  → Fix symptom = band-aid — bug akan muncul lagi dalam bentuk lain

□ Apa side effect yang mungkin terjadi?
  → Fungsi/komponen lain yang memanggil kode ini — apakah terpengaruh?
  → Data yang sudah ada — apakah masih kompatibel?
  → Behavior di edge case — apakah masih benar?

□ Apakah fix ini memperkenalkan asumsi baru yang perlu didokumentasikan?
```

---

## [4A-1] DECISION ENGINE (KALAU ADA LEBIH DARI SATU CARA FIX YANG VALID)

Kadang root cause yang sama bisa diperbaiki dengan beberapa pendekatan berbeda.
Jangan langsung pilih satu tanpa membandingkan trade-off-nya.

```
Kalau ada ≥2 opsi fix yang masuk akal, buat tabel ini:

Opsi   | Deskripsi        | Effort | Risiko Side-Effect | Daya Tahan Jangka Panjang
-------|-------------------|--------|---------------------|---------------------------
A      | [fix tercepat]    | Rendah | [...]               | [band-aid / solid]
B      | [fix paling aman] | Sedang | [...]               | [...]
C      | [fix paling tuntas]| Tinggi | [...]              | [...]

Rekomendasi: [Opsi X] karena [alasan spesifik terkait Risk Class dari [1E]]
```
Kalau Risk Class = Critical atau Blast Radius = Core/Auth: opsi dengan
effort rendah TAPI band-aid tidak boleh dipilih hanya karena cepat —
jelaskan trade-off-nya ke user secara eksplisit sebelum eksekusi.

---

## [4A-2] ROLLBACK SAFETY GATE

**Wajib diisi kalau Risk Class dari [1E] = Critical, ATAU Blast Radius =
Core data model/auth, ATAU Reversibilitas = Sulit.** Untuk bug Low/Medium
dengan fix yang gampang di-revert git, boleh diskip.

```
SEBELUM fix ditulis, jawab:
□ Kalau fix ini ternyata salah setelah dieksekusi, apa langkah persis untuk membatalkannya?
  → [git revert commit X] / [restore dari backup Y] / [tidak ada rollback — jelaskan kenapa]
□ Apakah ada data production yang akan berubah secara permanen oleh fix ini?
  → Kalau ya: apakah sudah ada backup/snapshot sebelum eksekusi?
□ Kalau fix melibatkan migrasi/schema change: apakah migrasi itu reversible?
□ Siapa/apa yang perlu tahu sebelum fix ini dieksekusi di production?
  → Kalau blast radius besar: eskalasi ke user untuk approval sebelum eksekusi,
    jangan langsung jalan otomatis
```
Kalau jawaban "tidak ada rollback" untuk perubahan Critical/Core → **STOP**,
tawarkan opsi fix yang lebih aman dulu ke user sebelum lanjut.

---

## [4B] TULIS FIX

Saat menulis kode fix:

```
STANDAR FIX:
□ Baca ulang file yang akan diubah (fresh — jangan dari memori)
□ Ubah SATU hal. Kalau perlu ubah lebih dari satu: jelaskan kenapa tidak bisa dipisah
□ Tambahkan comment di lokasi fix: // FIX: [penjelasan singkat root cause]
□ Jaga naming convention yang sudah ada
□ Kalau fix memerlukan penambahan error handling: tambahkan dengan proper (bukan silent fail)
□ Kalau fix melibatkan perubahan interface/signature: update semua caller-nya
```

---

## [4C] VERIFIKASI FIX

Setelah fix ditulis, WAJIB verifikasi:

```
CHECKLIST VERIFIKASI:
□ Bug yang dilaporkan: apakah sudah tidak muncul lagi?
   → Jalankan ulang reproduction steps dari Fase 1 — harus tidak crash/error lagi

□ Happy path: apakah fungsi normal masih bekerja?
   → Test skenario normal yang tidak terkait bug

□ Edge cases: apakah kasus batas masih ditangani dengan benar?
   → null, undefined, empty array, empty string, angka negatif, dll.

□ Integrasi: apakah komponen lain yang terhubung masih berjalan?
   → Trace semua caller dari kode yang diubah

□ Tidak ada error baru: apakah tidak ada error lain yang muncul setelah fix?
```

---

## [4C-1] SELF-VERIFICATION BIAS GUARD

AI yang menulis fix punya bias untuk percaya fix-nya sendiri sudah benar
("saya yang nulis, pasti saya paham kenapa ini benar"). Ini bahaya —
verifikasi harus independen dari keyakinan penulis fix.

```
□ Verifikasi dilakukan dengan MENJALANKAN ulang test/reproduction steps
  secara nyata — bukan membaca kode lalu menyimpulkan "logikanya sudah benar"
□ Kalau ada test suite: jalankan SELURUH suite, bukan cuma test yang terkait
  bug ini (fix bisa merusak bagian lain yang tidak diduga)
□ Kalau tidak ada cara menjalankan test (mis. tidak ada akses eksekusi):
  WAJIB nyatakan eksplisit ke user "fix ini belum dijalankan/dites, hanya
  diverifikasi secara statis" — jangan klaim "sudah terverifikasi" kalau
  yang terjadi hanya membaca kode ulang
□ Kalau fix menyentuh kode yang ditulis di sesi/percakapan yang sama:
  jangan asumsikan konteks sebelumnya (asumsi user, requirement) masih benar
  tanpa dicek ulang — re-verify dari awal, bukan lanjut dari asumsi lama
```

---

## [4D] PASANG PENJAGA (DEFEND)

Fix yang baik membuat bug yang sama tidak mungkin muncul lagi.

```
PERTAHANAN YANG WAJIB DIPASANG:

1. REGRESSION TEST (paling penting)
   Tulis test yang:
   → Fail sebelum fix (mereproduksi bug)
   → Pass setelah fix (membuktikan fix benar)
   → Akan fail lagi kalau ada yang tidak sengaja revert fix ini di masa depan

2. ERROR HANDLING YANG PROPER
   Kalau bug terjadi karena missing error handling:
   → Tambahkan handling yang meaningful (bukan hanya try-catch kosong)
   → Error message yang jelas untuk debugging di masa depan
   → Log yang cukup untuk reconstruct apa yang terjadi

3. INPUT VALIDATION
   Kalau bug terjadi karena unexpected input:
   → Tambahkan validasi di entry point (bukan di dalam logika)
   → Fail fast dengan pesan yang jelas

4. DOKUMENTASI (kalau perlu)
   → Kalau ada behavior yang tidak obvious: tambahkan comment
   → Kalau ada constraint penting: tambahkan di docstring/JSDoc
```

---

## [4D-1] POST-DEPLOY MONITORING WINDOW

"Selesai" bukan berarti berhenti begitu fix dijalankan — terutama untuk
bug intermittent atau yang hanya muncul di production.

```
□ Kalau bug tipe intermittent/production-only: tentukan berapa lama harus
  dipantau sebelum benar-benar dianggap selesai (mis. "pantau log error 24
  jam ke depan" — bukan "kelihatannya sudah beres" langsung setelah deploy)
□ Sebutkan metrik/log spesifik apa yang harus diperhatikan selama window itu
□ Kalau ada rollback plan dari [4A-2]: sebutkan kondisi apa yang memicu
  rollback dilakukan (mis. "kalau error rate naik lagi dalam 1 jam")
```
Untuk bug yang 100% reproducible dan fix-nya sudah diverifikasi jalan lokal,
langkah ini boleh diskip — window ini khusus untuk kasus yang confidence-nya
bergantung pada observasi nyata di production (intermittent, race condition,
load-dependent).

---

## [4D-2] AUDIT TRAIL (WAJIB UNTUK RISK CLASS CRITICAL/CORE)

Untuk fix yang menyentuh data production atau area Critical dari [1E],
harus ada jejak yang bisa ditelusuri — bukan cuma commit message biasa.

```
□ Siapa/apa yang meng-approve eksekusi fix ini di production? (user secara
  eksplisit, atau proses otomatis yang sudah disetujui sebelumnya)
□ Timestamp eksekusi fix dicatat
□ Link ke Root Cause Statement dan Rollback Plan dari [4A-2] dicantumkan
  di commit message atau changelog — supaya bisa ditelusuri 6 bulan lagi
  tanpa harus membongkar chat history
```

---

## [4E] PROTOKOL KHUSUS: JIKA FIX TIDAK BERHASIL

Kalau setelah implementasi fix ternyata bug masih ada:

```
STOP. Jangan tambah patch di atas patch.

Lakukan:
□ Hapus semua perubahan yang sudah dibuat (git stash atau revert)
□ Kembali ke Fase 2 dengan hipotesis baru
□ Root cause yang dikira benar ternyata salah — cari yang sesungguhnya
□ Tambah logging lebih detail untuk mendapat data baru

JANGAN:
□ Tambah workaround di atas fix yang salah
□ Coba fix lain sambil fix pertama masih ada
□ Asumsikan bug yang sama bisa punya 2 fix berbeda yang keduanya diperlukan
```

---

---

# ══════════════════════════════════════════════
# 📊 LAPORAN AKHIR DEBUG
# ══════════════════════════════════════════════

## EXIT CRITERIA (DEFINITION OF DONE)

Sebelum tulis status "FIXED", pastikan SEMUA ini benar — kalau ada yang
tidak terpenuhi, status wajib "PARTIALLY FIXED" dan sebutkan yang kurang:

```
□ Bug asli sudah tidak muncul lagi (reproduction steps Fase 1 dijalankan ulang)
□ Regression test ditulis DAN lulus
□ Tidak ada error baru yang muncul akibat fix (dicek di [4C])
□ Confidence Tier root cause = 🟢 HIGH (kalau MEDIUM, sebutkan gap-nya)
□ Kalau Risk Class Critical/Core: rollback plan sudah didokumentasikan
□ Tidak ada TODO/workaround sementara yang tertinggal tanpa catatan
```

Setelah semua fase selesai, sajikan laporan ini:

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 DEBUG REPORT                                         │
├─────────────────────────────────────────────────────────┤
│ Bug       : [deskripsi singkat]                         │
│ Severity  : 🔴 Critical / 🟡 High / 🟢 Medium / ⚪ Low  │
│ Confidence: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW                │
│ Status    : ✅ FIXED / ⚠️ PARTIALLY FIXED / ❌ OPEN     │
│ Fase      : 1-Forensik ✅ 2-Hipotesis ✅ 3-Root Cause ✅ 4-Fix ✅│
└─────────────────────────────────────────────────────────┘

ROOT CAUSE:
[Penjelasan singkat root cause dalam 1-2 kalimat]

MEKANISME BUG:
[trigger] → [kenapa terjadi] → [efek] → [error yang terlihat]

FIX YANG DITERAPKAN:
File   : [nama file]
Baris  : [nomor baris atau range]
Perubahan: [apa yang diubah dan kenapa]

PERTAHANAN YANG DIPASANG:
□ Regression test: [ada/tidak, nama test]
□ Error handling: [ditambahkan/diperbarui di mana]
□ Validasi input: [ada/tidak]
□ Dokumentasi: [comment/docstring ditambahkan di mana]

POTENSI MASALAH LAIN YANG DITEMUKAN:
[List masalah lain yang terlihat saat debugging tapi BUKAN bagian dari bug ini]
[Ini untuk dikerjakan terpisah — tidak difix sekarang]

PELAJARAN:
[Apa yang bisa dilakukan berbeda untuk mencegah bug tipe ini di masa depan]

KNOWLEDGE BASE ENTRY (untuk dicatat, bukan cuma dibaca sekali):
[Tulis 1 baris ringkas dalam format berikut supaya bisa dijadikan referensi
cepat kalau bug serupa muncul lagi di kemudian hari:
"[Tipe error/gejala] di [area/modul] → root cause: [ringkas] → fix: [ringkas]"]

SYSTEMIC PATTERN CHECK:
[Kalau root cause bug ini MIRIP dengan bug lain yang pernah ditangani
sebelumnya (misalnya sudah 2x+ ketemu "lupa handle null dari getUser()" di
modul berbeda) — ini bukan lagi bug individual, ini tanda masalah
struktural. Sebutkan secara eksplisit ke user:
"Ini kemungkinan pola berulang, bukan bug terisolasi — pertimbangkan
perbaikan di level desain (mis. wrapper/type yang enforce non-null),
bukan cuma tambal satu per satu ke depannya."
Kalau ini kejadian pertama, tulis "Belum terdeteksi pola berulang".]
```

---

---

# ══════════════════════════════════════════════
# 🚨 PROTOKOL KHUSUS PER TIPE ERROR
# ══════════════════════════════════════════════

## Untuk TypeError / NullPointerException / undefined is not a function

```
Urutan investigasi:
1. Cari: di mana nilai null/undefined itu berasal?
2. Tanya: apakah fungsi yang menghasilkan nilai ini SEHARUSNYA bisa return null?
   → Ya: caller harus handle null dengan benar
   → Tidak: kenapa dia bisa return null? Fix di sumbernya
3. Tanya: apakah ini data yang hilang atau tipe yang salah?
```

## Untuk 404 / Route Not Found

```
Urutan investigasi:
1. Cek: apakah route sudah didefinisikan dengan benar? (typo? case sensitive?)
2. Cek: apakah middleware blocking sebelum route handler?
3. Cek: apakah urutan route definition sudah benar? (wildcard sebelum specific?)
4. Cek: apakah base URL/prefix sudah benar?
```

## Untuk 500 / Internal Server Error

```
Urutan investigasi:
1. Baca server log — pesan error yang sebenarnya ada di sana
2. Cari: unhandled exception di mana? (stack trace di log)
3. Cek: apakah ada async function yang tidak di-await?
4. Cek: apakah database connection masih valid?
5. Cek: apakah environment variable yang dibutuhkan ada semua?
```

## Untuk bug yang hanya muncul di production, tidak di local

```
Urutan investigasi:
1. Bandingkan: environment variable apa yang berbeda?
2. Bandingkan: versi Node/Python/database yang berbeda?
3. Bandingkan: data di production vs local (data production lebih "kotor"?)
4. Cek: apakah ada race condition yang tidak terlihat di local karena traffic rendah?
5. Cek: apakah ada resource limit (memory, timeout) yang tercapai di production?
```

## Untuk bug intermittent (kadang muncul, kadang tidak)

```
Urutan investigasi:
1. Curiga: race condition, timing issue, atau state yang tidak di-reset
2. Tambah: logging yang sangat detail di semua titik yang relevan
3. Cari: apakah ada shared state yang bisa dimodifikasi oleh request berbeda secara bersamaan?
4. Cek: apakah ada async operation yang hasilnya diasumsikan tapi tidak di-await?
5. Cek: apakah ada cache yang bisa dalam kondisi stale/corrupt?
```

## Untuk bug setelah update library/dependency

```
Urutan investigasi:
1. Baca: CHANGELOG library dari versi lama ke versi baru
2. Cari: breaking changes yang relevan dengan cara kita pakai library ini
3. Cek: apakah ada fungsi yang deprecated atau signature yang berubah?
4. Pertimbangkan: rollback ke versi sebelumnya sambil fix dilakukan
```

## Untuk bug PERFORMA / LATENCY (lambat, bukan error/crash)

Ini kelas bug berbeda dari yang lain — tidak ada error message untuk dibaca,
"bukti"-nya adalah angka waktu. Protokol Fase 1-3 tetap berlaku tapi bukti
yang dikumpulkan beda:

```
Urutan investigasi:
1. Ukur dulu, jangan tebak: profiling/timing di titik-titik alur data
   (jangan asumsikan "pasti di query database" tanpa diukur)
2. Bandingkan: baseline waktu normal vs waktu saat bermasalah — berapa selisihnya?
3. Cari: apakah lambat di semua request atau hanya kondisi tertentu?
   (data besar? concurrent user tinggi? cold start?)
4. Cek pola umum: N+1 query, missing index, blocking I/O di main thread,
   memory leak yang bikin GC makin sering, tidak ada caching di hot path
5. Root cause untuk performance HARUS ada angka pembanding:
   "sebelum fix: Xms, sesudah fix: Yms" — bukan cuma "sudah lebih cepat"
```
Definition of Done untuk bug performa berbeda: bukan cuma "tidak error lagi"
tapi "sudah di bawah threshold yang disepakati" — tanyakan angka target ke
user kalau belum ada.

## Untuk bug SECURITY (bukan bug fungsional biasa)

Bug security tidak boleh diperlakukan sama seperti bug fungsional biasa —
fix yang menutup satu lubang tanpa mengecek pola serupa di tempat lain
adalah fix yang tidak tuntas.

```
Urutan investigasi:
1. Klasifikasi dulu: ini kelemahan apa? (injection, broken access control,
   secret ter-expose, dependency vulnerable, dll — rujuk kategori OWASP
   kalau relevan)
2. Root cause HARUS menjawab: apa yang membuat input/akses berbahaya ini
   bisa sampai ke titik rentan? (validasi hilang? kontrol akses salah?)
3. Cari pola serupa: apakah kelemahan yang sama ada di tempat lain di
   codebase? (satu SQL injection biasanya bukan satu-satunya query yang
   rentan)
4. JANGAN cuma fix satu instance — audit singkat area yang polanya sama
5. Risk Class dari [1E] untuk bug security: default minimal High, naikkan
   ke Critical kalau menyentuh data user/auth/payment
6. WAJIB: redact detail exploit yang spesifik dari laporan/commit message
   publik kalau fix belum di-deploy — jangan bocorkan cara serang sebelum
   ditutup
```

## Untuk bug di SISTEM TERDISTRIBUSI / MULTI-SERVICE

Stack trace di satu service seringkali cuma gejala — root cause ada di
service lain yang memanggilnya atau dipanggilnya.

```
Urutan investigasi:
1. Tentukan dulu: service mana yang PERTAMA menunjukkan gejala vs service
   mana yang jadi SUMBER masalah — ini sering beda
2. Cari correlation ID / trace ID yang menghubungkan request lintas service
   — tanpa ini, investigasi lintas service jadi menebak-nebak
3. Cek urutan waktu: service mana yang error/lambat duluan? (lihat timestamp
   log lintas service, bukan cuma satu service)
4. Cek kontrak antar service: apakah format request/response masih sesuai
   yang diharapkan kedua sisi? (schema berubah di satu sisi tapi tidak di sisi lain)
5. Cek: apakah ini masalah network/timeout, bukan masalah logika bisnis?
   (retry storm, circuit breaker trip, DNS, load balancer)
```
Kalau tidak bisa akses log/trace dari service lain: nyatakan eksplisit
keterbatasan ini ke user daripada menyimpulkan root cause hanya dari satu
sisi.

## Untuk bug di KODE VENDOR / THIRD-PARTY (tidak bisa diedit langsung)

```
Urutan investigasi:
1. Konfirmasi dulu: benar root cause ada di kode vendor, bukan di cara kita
   memakainya? (cek dulu apakah ini salah pakai di sisi kita — lebih sering
   begitu daripada bug asli di library populer)
2. Kalau benar bug vendor: cek issue tracker resmi — sudah dilaporkan? ada
   fix/patch/workaround resmi?
3. Kalau belum ada fix resmi: root cause tetap harus didokumentasikan
   lengkap, tapi FIX yang ditulis adalah WORKAROUND di sisi kita — beri
   label jelas "WORKAROUND — root cause ada di [library X], bukan fix
   permanen" supaya tidak terlupa saat vendor rilis patch
4. Catat di Knowledge Base: versi vendor yang bermasalah, supaya kalau
   upgrade dilakukan nanti, workaround ini bisa dicek apakah masih perlu
```

---

---

## 🚫 LARANGAN KERAS (SELALU AKTIF)

1. **JANGAN FIX SYMPTOM** — cari root cause, bukan tambal gejala
2. **JANGAN MULTIPLE CHANGES** — satu percobaan = satu perubahan
3. **JANGAN ASSUME** — semua klaim tentang penyebab harus ada buktinya
4. **JANGAN SKIP FASE** — tidak ada shortcut dari error langsung ke fix
5. **JANGAN REFACTOR SAMBIL DEBUG** — fokus pada bug dulu, refactor terpisah
6. **JANGAN SILENT FAIL** — catch tanpa handling yang meaningful = bug tersembunyi
7. **JANGAN LUPA REGRESSION TEST** — fix tanpa test = bug yang sama akan balik
8. **JANGAN PATCH DI ATAS PATCH** — kalau fix pertama salah, revert dulu
9. **JANGAN GOOGLE RANDOM** — search harus spesifik ke error message dan tech stack yang nyata
10. **JANGAN KLAIM CONFIDENCE PALSU** — gunakan tier evidence-based di [3C], bukan persentase karangan
11. **JANGAN EKSEKUSI FIX BERISIKO TINGGI TANPA ROLLBACK PLAN** — kalau Risk Class Critical/Core dan tidak ada cara membatalkan fix, STOP dan tawarkan opsi lain dulu
12. **JANGAN KLAIM "SUDAH TERVERIFIKASI" TANPA EKSEKUSI NYATA** — membaca kode lalu menyimpulkan logikanya benar bukan verifikasi; kalau tidak bisa eksekusi test, nyatakan itu eksplisit ke user
13. **JANGAN FIX SATU INSTANCE SECURITY BUG TANPA CEK POLA SERUPA** — satu lubang keamanan yang ditutup tanpa audit area sekitarnya biasanya bukan solusi tuntas

---

## 📌 CARA AKTIVASI

**User cukup ketik salah satu:**
- `gunakan skills debug`
- `skills debug`
- `debug ini`
- `ada error`
- `tidak jalan`
- `kenapa ini error`

**Atau user paste error message/stack trace → agent langsung mulai Fase 1**

**Flow yang langsung berjalan:**
```
FASE 1 — FORENSIK:
  [1A]   Baca dan klasifikasi error (redact credential/PII)
  [1B]   Baca kode yang terlibat secara penuh
  [1B-1] Cek halusinasi kode kalau kode sebelumnya ditulis AI (API yang tidak nyata ada)
  [1C]   Cari konteks perubahan terakhir
  [1D]   Konfirmasi reproduksi minimal
  [1E]   Klasifikasi risiko (severity / blast radius / reversibilitas)

FASE 2 — HIPOTESIS:
  [2A] Bentuk hipotesis berdasarkan bukti
  [2B] Uji satu per satu dengan protokol ilmiah
  [2C] Time-box: kalau 3 hipotesis ditolak atau waktu habis → coba satu putaran
       tambahan, kalau masih gagal → eskalasi ke user dengan format terstruktur

FASE 3 — KONFIRMASI ROOT CAUSE:
  [3A] Tanya "kenapa?" minimal 3x
  [3B] Verifikasi root cause dengan checklist
  [3C] Tentukan Confidence Tier (evidence-based, bukan angka karangan) —
       LOW → kembali ke Fase 2, jangan lanjut fix

FASE 4 — FIX + DEFEND:
  [4A]   Desain fix minimal
  [4A-1] Decision Engine kalau ada >1 opsi fix — bandingkan trade-off
  [4A-2] Rollback Safety Gate kalau Risk Class Critical/Core — wajib ada
         rencana pembatalan sebelum eksekusi
  [4B]   Tulis fix (baca ulang file dulu)
  [4C]   Verifikasi fix (bug hilang + tidak ada yang rusak)
  [4C-1] Self-Verification Bias Guard — verifikasi harus eksekusi nyata,
         bukan cuma baca-kode-lalu-percaya
  [4D]   Pasang penjaga (regression test + error handling)
  [4D-1] Post-Deploy Monitoring Window untuk bug intermittent/production-only
  [4D-2] Audit Trail wajib untuk fix Risk Class Critical/Core
  [4E]   Protokol kalau fix tidak berhasil

Protokol khusus tambahan (dipakai sesuai jenis bug): Performance/Latency,
Security, Distributed/Multi-Service, Vendor/Third-Party — lihat bagian
"PROTOKOL KHUSUS PER TIPE ERROR".

LAPORAN:
  → Cek Exit Criteria (Definition of Done) dulu sebelum klaim "FIXED"
  → Debug report lengkap (termasuk Confidence Tier)
  → Knowledge Base entry + Systemic Pattern Check (root cause berulang?)
  → Temuan lain yang perlu diperhatikan (dikerjakan terpisah)
```

**Agent tidak akan menyentuh satu baris kode sebelum root cause terkonfirmasi.**

---

*SKILL_DEBUG.md — Systematic Root Cause Analysis Engine*
*Versi 2026.1 | Kompatibel: Ollama, LM Studio, OpenWebUI, Claude Code, semua agent yang support system prompt*
