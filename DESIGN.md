# AKAL Center — Design, Direction, and Product System

**Versi:** 2.0 Draft Rebuild

**Tanggal update:** 7 Juli 2026

**Status:** Dokumen kerja aktif untuk rebuild total platform

**Peran dokumen ini:**

- penyangga keputusan desain dan arsitektur produk

- pengarah agent coding agar tidak kembali ke pola website lama

- jembatan antara codebase nyata, diskusi strategis, dan implementasi bertahap

- rujukan utama untuk landing page baru, auth baru, dashboard baru, AI generator dokumen, dan sistem multi-guru

---

## 0. Cara Membaca Dokumen Ini

Dokumen lama `DESIGN.md` berisi diskusi campuran antara ide, emosi, kebutuhan bisnis, dan arsitektur teknis.

Dokumen baru ini mengekstrak inti yang benar-benar dipakai sebagai pegangan implementasi.

Fokusnya bukan nostalgia pada alur lama.

Fokusnya adalah membangun versi baru yang terasa berbeda total.

Jika ada konflik antara dokumen ini dan sisa pola lama di codebase, utamakan dokumen ini **selama keputusan itu juga konsisten dengan `AGENTS.md`, `TODO-V2-MULTI-GURU.md`, dan hasil verifikasi codebase terbaru**.

---

## 1. Sumber Kebenaran Dokumen Ini

Isi dokumen ini disusun dari kombinasi berikut:

1. Codebase nyata `akal-center` yang sudah dibaca dan diverifikasi pada area kritikal:

   - auth lama dan auth baru

   - route dashboard

   - schema Drizzle

   - middleware

   - integrasi Keystatic

   - storage abstraction

   - Google Sheets legacy

2. Codebase referensi `gotong-royong-pwa` yang sudah dibaca dan diverifikasi pada area auth:

   - Supabase server client

   - Google OAuth flow

   - callback exchange session

   - route auth behavior

3. Keputusan terbaru user dalam diskusi aktif:

   - ORM final = Drizzle

   - fase sekarang = Vercel + Supabase + ImageKit

   - VPS ditunda sampai trafik dan pelanggan naik

   - Keystatic dibekukan untuk fitur baru

   - payment online ditunda

   - AI prioritas = generator PDF/DOCX menjadi materi, quiz, soal, dan turunannya

   - frontend harus dirombak total karena alur lama dianggap tidak matang

4. Verifikasi web 2026 yang benar-benar dilakukan di sesi ini:

   - Vercel docs/pricing: Hobby untuk personal/non-commercial use

   - Supabase pricing: Free project pause setelah 1 minggu inactivity, 500 MB DB, 1 GB storage

   - NaraRouter docs: endpoint OpenAI-compatible di `https://router.bynara.id/v1`, key format `sk-nry-*`

   - ImageKit key yang diberikan bisa dipakai ke API file list

   - Supabase secret key yang diberikan valid ke REST endpoint

5. File environment nyata project:

   - `AKAL CENTER Environment.md`

   - `.env.local`

---

## 2. Ringkasan Besar: AKAL Center Mau Jadi Apa

AKAL Center **bukan lagi** sekadar website belajar PAI untuk satu guru.

AKAL Center sedang dibentuk menjadi:

**platform pembelajaran multi-guru yang membantu guru mengubah dokumen menjadi pembelajaran siap pakai, mengelola siswa, memberi evaluasi, dan memahami perkembangan belajar dengan lebih cepat dan lebih rapi.**

Kalimat paling penting untuk semua agent:

> Ini adalah rebuild platform, bukan tambal sulam website lama.

Kalimat kedua paling penting:

> AI bukan pusat perhatian di muka. AI adalah mesin bantu kerja guru di belakang alur yang jelas.

Kalimat ketiga paling penting:

> Frontend harus terasa seperti produk baru, bukan kosmetik di atas arsitektur lama.

---

## 3. North Star Produk

North star AKAL Center fase sekarang:

**Guru mengunggah dokumen pembelajaran, sistem menghasilkan draft materi, quiz, dan soal, guru meninjau dan menerbitkan, siswa belajar dan mengerjakan, lalu guru melihat perkembangan dengan cara yang praktis.**

North star ini menuntut 5 hal utama:

1. auth yang tegas

2. ruang guru yang benar-benar punya sense of ownership

3. ruang siswa yang sederhana dan fokus ke belajar

4. pipeline AI dokumen yang aman dan dapat ditinjau

5. fondasi data yang kuat agar analitik tidak perlu rombak lagi nanti

---

## 4. Apa yang Bukan Fokus Utama Sekarang

Hal-hal di bawah ini **bukan** penggerak utama fase sekarang:

- marketplace besar

- payment online otomatis

- AI chatbot generik yang terlalu luas

- fitur orang tua lengkap

- TRI untuk semua guru pelanggan

- event sourcing penuh sejak hari pertama

- VPS migration sekarang juga

- mempertahankan UX website lama hanya karena sudah live

Kalau ada keraguan implementasi, tanyakan:

> Apakah ini membantu north star sekarang, atau cuma menambah beban?

---

## 5. Keputusan Strategis yang Sudah Terkunci

### 5.1 Infra fase sekarang

- app web di `Vercel`

- database teks dan data terstruktur di `Supabase`

- PDF, gambar, dan media lain di `ImageKit`

- Cloudflare tetap relevan untuk domain, edge, dan perlindungan layer depan

### 5.2 Infra fase nanti

- jika guru/siswa/usage naik signifikan, pindah ke `VPS`

- pada saat itu, codebase seharusnya pindah infra tanpa harus ubah arsitektur produk dari nol

### 5.3 ORM

- `Drizzle` final

### 5.4 Keystatic

- dibekukan untuk fitur baru

- konten lama masih boleh dibaca sebagai legacy

- fitur baru berbasis materi/quiz/soal harus DB-driven

### 5.5 AI

- prioritas utama adalah `document-to-learning pipeline`

- input utama: PDF dan DOCX

- output utama: materi, quiz, soal

- semua output AI = draft dulu

- guru wajib approve sebelum publish

### 5.6 Payment

- online payment ditunda

- CTA sementara = hubungi WhatsApp

### 5.7 Auth

- guru dan siswa tidak boleh lagi campur portalnya

- role mismatch harus jadi error eksplisit

- intent login hanya membantu UX, role tetap sumber kebenaran dari DB/session

---

## 6. Kondisi Nyata Codebase Saat Dokumen Ini Ditulis

Ini bukan asumsi.

Ini ringkasan dari pembacaan codebase nyata yang sudah diverifikasi di sesi ini.

### 6.1 Yang sudah ada

- codebase sudah punya schema Drizzle yang jauh lebih maju dari website lama

- role sudah ada:

  - `OWNER`

  - `ADMIN_SEKOLAH`

  - `GURU`

  - `ASISTEN_GURU`

  - `SISWA`

  - `ORANG_TUA`

- route dashboard sudah ada:

  - `dashboard-guru/*`

  - `dashboard-siswa/*`

- auth email/password berbasis session JWT sudah ada

- route register siswa sudah ada

- event store table sudah ada di schema

- tabel `google_drive_auth` sudah ada di schema

- tabel `skill_mastery`, `risk_snapshot`, `teacher_readiness_snapshot` sudah ada di schema

- middleware sudah memisahkan dashboard guru dan dashboard siswa secara lebih baik dibanding flow lama

### 6.2 Yang masih legacy

- Google Sheets masih dipakai untuk:

  - verifikasi siswa lama

  - submit hasil kuis

  - rekap nilai

  - doa

  - diskusi

  - refleksi

- Keystatic masih deeply wired ke:

  - materi

  - soal

  - game

  - hadits

  - navigation

  - site config

  - about

  - perangkat ajar

  - pendidik page

### 6.3 Yang masih setengah jadi

- `StorageFactory` sudah sadar ada `google_drive_auth`, tetapi implementasi adapter nyata belum hidup

- auth baru sudah membaik, tetapi register guru final belum ada

- beberapa role sudah ada di schema, tapi belum punya dashboard final

- landing page publik baru baru mulai dirombak

---

## 7. Definisi Ulang Produk

### 7.1 Versi lama

Versi lama bisa diringkas sebagai:

> situs PAI single-guru dengan materi, quiz, game, dan Google Sheets.

### 7.2 Versi baru

Versi baru harus dipahami sebagai:

> platform kerja guru dan belajar siswa, dengan AI document generator sebagai mesin diferensiasi utama, didukung alur auth, review, publish, dan analitik yang jauh lebih matang.

### 7.3 Konsekuensi desain

Karena definisi produk berubah, maka yang harus berubah juga:

- landing page

- onboarding

- auth UX

- dashboard layout

- copywriting utama

- hierarchy navigasi

- visual emphasis

- prioritas data model

Tidak cukup ganti warna kartu atau CTA.

Harus terasa seperti produk baru.

---

## 8. Pilar Desain Produk

Ada 7 pilar desain utama untuk versi baru.

### Pilar 1 — Tegas

Setiap halaman harus menjawab jelas:

- ini halaman untuk siapa

- aksi utamanya apa

- langkah berikutnya apa

### Pilar 2 — Tidak campur portal

Guru tidak boleh merasa masuk seperti siswa.

Siswa tidak boleh tersesat ke ruang guru.

Owner dan admin sekolah harus punya jalur yang tidak ambigu.

### Pilar 3 — Dokumen jadi pembelajaran

Setiap elemen utama harus mendukung narasi besar:

`dokumen -> draft -> review -> publish -> belajar -> analisis`

### Pilar 4 — Aman untuk dunia nyata

Fitur upload harus didesain dengan asumsi file upload itu berbahaya.

### Pilar 5 — Guru tetap pusat keputusan

AI hanya membantu kerja.

AI tidak menggantikan otoritas guru.

### Pilar 6 — Bisa tumbuh ke multi-guru tanpa rewrite besar

Desain halaman, route, state, dan struktur data tidak boleh terlalu terikat ke satu guru lagi.

### Pilar 7 — Terasa modern 2026

Bukan karena banyak animasi.

Tapi karena:

- alur jelas

- intent jelas

- state jelas

- feedback cepat

- tampilan konsisten

- onboarding minim kebingungan

---

## 9. Visual Language yang Harus Dipertahankan

Walau arsitektur produk berubah total, design language dasar tetap dipakai.

### 9.1 Warna utama

```txt
Primary        #005231
Primary hover  #006b3e
Tertiary       #5a4200
Tertiary soft  #775900
Surface        #f2fcf7
Text dark      #0a0a0a
Border         rgba(27,107,69,0.15)
```

### 9.2 Font utama

- Heading = `Bricolage Grotesque`

- Body = `Inter`

- Arabic/Quran = `Amiri`

- Technical/mono = `JetBrains Mono`

### 9.3 Glass style

```css
background: rgba(255,255,255,0.6)
backdrop-filter: blur(24px)
border: 1px solid rgba(27,107,69,0.15)
```

### 9.4 Shadow

```css
--shadow-glass: 0 4px 24px -2px rgba(0, 82, 49, 0.06);
--shadow-glass-lg: 0 12px 40px -8px rgba(0, 82, 49, 0.08);
--shadow-glass-xl: 0 24px 56px -12px rgba(0, 82, 49, 0.12);
```

### 9.5 Ease curve

```ts
const easeCurve = [0.16, 1, 0.3, 1] as const
```

### 9.6 Rule mutlak

- jangan tambah UI library baru

- jangan ganti tone visual jadi template SaaS generik biru-putih yang dingin

- jangan ubah desain menjadi terlalu startup-korporat tanpa karakter

---

## 10. Tone of Interface

Tone visual dan copy untuk platform baru harus berada di antara tiga kutub:

### 10.1 Profesional

Karena guru dan sekolah harus percaya bahwa ini alat kerja serius.

### 10.2 Hangat

Karena pembelajaran agama dan sekolah tidak cocok jika UI terasa steril dan robotik.

### 10.3 Tajam

Karena alur produk harus langsung dipahami tanpa banyak membaca.

### 10.4 Hindari

- terlalu ramai

- terlalu banyak ornamen religius dekoratif tanpa fungsi

- landing page yang terlalu “website lembaga”

- halaman login yang terasa seperti portal admin jadul

- dashboard yang terlalu penuh kartu tanpa hierarchy

---

## 11. Bentuk Produk Baru: Tiga Dunia

Produk harus dipisahkan secara jelas ke dalam tiga dunia besar.

### 11.1 Dunia publik

Tujuan:

- menjelaskan value produk

- membangun trust

- mengarahkan ke daftar/masuk

- menunjukkan mengapa ini berbeda dari website lama dan LMS generik

Halaman utama:

- `/`

- `/fitur`

- `/harga`

- `/tentang`

- `/masuk`

- `/daftar`

### 11.2 Dunia guru

Tujuan:

- mengelola konten pembelajaran

- mengelola siswa

- mengelola AI draft

- melihat analitik

- menerbitkan materi/quiz/soal

Halaman utama target:

- `/guru`

- `/guru/kursus`

- `/guru/siswa`

- `/guru/uploads`

- `/guru/analytics`

### 11.3 Dunia siswa

Tujuan:

- belajar

- mengerjakan quiz

- mengakses CBT

- melihat progres

- membaca pengumuman dari guru

Halaman utama target:

- `/siswa`

- `/siswa/materi`

- `/siswa/quiz`

- `/siswa/cbt`

- `/siswa/progres`

---

## 12. User Journey Inti

### 12.1 User journey publik

1. User datang ke `/`

2. User melihat bahwa produk ini bisa mengubah dokumen jadi materi/quiz/soal

3. User memahami produk ini untuk guru dan siswa

4. User klik `Coba Gratis`

5. User dibawa ke `/daftar`

### 12.2 User journey guru baru

1. Guru buka `/daftar`

2. Guru pilih `Saya Guru`

3. Guru daftar via email/password atau Google

4. Guru masuk ke onboarding awal guru

5. Guru membuat kursus pertama

6. Guru upload PDF/DOCX

7. AI membuat draft

8. Guru review

9. Guru publish

10. Guru mulai melihat ruang kerja sebagai workspace nyata

### 12.3 User journey siswa baru

1. Siswa buka landing atau link dari guru

2. Siswa masuk via `/masuk` atau `/daftar`

3. Siswa masuk ke ruang siswa

4. Siswa melihat materi dan quiz yang memang relevan

5. Siswa mengerjakan dan menyimpan progres

### 12.4 User journey guru login ulang

1. Guru buka `/masuk?portal=guru`

2. Guru login dengan email/password atau Google

3. Sistem cek role asli

4. Jika role bukan guru/owner/admin sekolah, sistem menolak dengan pesan jelas

5. Jika benar, masuk ke dashboard guru

### 12.5 User journey siswa login ulang

1. Siswa buka `/masuk?portal=siswa`

2. Siswa login

3. Sistem cek role asli

4. Jika role bukan siswa, sistem menolak dengan pesan jelas

5. Jika benar, masuk ke dashboard siswa

---

## 13. Auth Design Principles

### 13.1 Satu entry utama publik

Hanya dua entry auth yang dianggap resmi:

- `/masuk`

- `/daftar`

### 13.2 `/masuk-guru` bukan flow terpisah

`/masuk-guru` hanya alias atau redirect ke `/masuk?portal=guru`

### 13.3 Intent bukan role

Portal guru/siswa adalah **intent UX**, bukan sumber kebenaran auth.

Role sebenarnya tetap berasal dari DB/session.

### 13.4 Role mismatch harus eksplisit

Contoh yang benar:

- akun siswa mencoba masuk dari portal guru -> tampilkan pesan bahwa akun itu siswa

- akun guru mencoba masuk dari portal siswa -> tampilkan pesan bahwa akun itu guru

Contoh yang salah:

- redirect diam-diam ke dashboard lain

- tetap mengizinkan masuk tanpa menjelaskan mismatch

### 13.5 Tidak ada double form yang tumpang tindih

Masalah lama: terlalu banyak pintu login dan mode campur.

Target baru: satu arsitektur auth yang rapi.

---

## 14. Register Design Principles

### 14.1 Register guru dan siswa harus dipisah dari awal

Satu halaman boleh.

Tapi pilihan peran awal harus jelas.

### 14.2 Guru bukan turunan dari siswa

Sistem tidak boleh lagi menganggap guru sebagai variasi kecil dari akun siswa.

### 14.3 Register guru harus menyiapkan workspace

Setelah daftar, guru harus diarahkan ke:

- ruang kerja

- buat kursus pertama

- upload dokumen pertama

### 14.4 Register siswa harus menyiapkan pengalaman belajar

Setelah daftar, siswa diarahkan ke:

- beranda siswa

- kelas/kursus yang tersedia

- materi awal

---

## 15. Frontend Public Page System

### 15.1 Landing page `/`

Landing page harus menjelaskan empat hal secara sangat cepat:

1. ini produk untuk siapa

2. apa bedanya dengan alat lama

3. bagaimana AI dipakai secara aman

4. apa langkah selanjutnya

### 15.2 Section minimum landing page

#### Hero

- headline kuat

- subheadline jelas

- CTA daftar

- CTA masuk

#### Value pillars

- untuk guru

- untuk siswa

- untuk sekolah

#### Killer feature section

- AI document generator

- materi

- quiz

- soal

#### Workflow section

- upload

- generate

- review

- publish

- belajar

- analisis

#### Trust section

- guru approve hasil AI

- upload aman

- role dipisah

- data siswa seminimal mungkin

#### CTA bawah

- coba gratis

- hubungi WA

### 15.3 `/fitur`

Tujuan:

- mendalami fitur

- memisahkan fitur guru, siswa, sekolah

### 15.4 `/harga`

Tujuan:

- menjelaskan harga yang sedang diuji

- menegaskan payment masih manual via WA

### 15.5 `/tentang`

Tujuan:

- menjelaskan visi baru platform

- tidak lagi terasa hanya halaman profil satu guru semata

---

## 16. Dashboard Design Principles

### 16.1 Dashboard guru

Dashboard guru harus terasa seperti:

`workspace`

bukan sekadar katalog halaman.

Hal-hal yang wajib terasa:

- ada yang harus dikerjakan sekarang

- ada dokumen yang bisa diupload

- ada draft yang menunggu review

- ada siswa yang belajar

- ada analitik yang berguna

### 16.2 Dashboard siswa

Dashboard siswa harus terasa seperti:

`ruang belajar pribadi`

bukan dashboard admin mini.

Hal-hal yang wajib terasa:

- apa yang harus dipelajari hari ini

- evaluasi yang tersedia

- progres yang sedang berjalan

- pengumuman guru yang relevan

### 16.3 Owner/admin sekolah

Tidak harus penuh sekarang.

Tapi struktur route dan konsep perannya harus benar dari awal.

---

## 17. Keystatic Freeze Strategy

### 17.1 Prinsip dasar

Keystatic **tidak dihapus sekarang**.

Tapi Keystatic **tidak boleh** dipakai untuk fitur baru.

### 17.2 Yang masih boleh

- baca materi lama

- baca soal lama

- baca game lama

- baca hadits lama

- baca singleton legacy jika belum dipindah

### 17.3 Yang tidak boleh lagi

- membuat materi baru lewat content/

- membuat quiz baru lewat content/

- membuat soal baru lewat content/

- membuat upload file baru ke jalur CMS lama

### 17.4 Prinsip migrasi

konten lama = legacy read-only

konten baru = DB-driven

---

## 18. AI System Principles

### 18.1 AI bukan chatbot dulu

Fase sekarang AI harus diposisikan terutama sebagai:

- generator draft materi

- generator draft quiz

- generator draft soal

- generator turunan perangkat ajar bila nanti dibutuhkan

### 18.2 Input

- PDF

- DOCX

### 18.3 Tahapan AI

1. upload file

2. ekstrak teks

3. parsing struktur isi

4. kirim teks ke model

5. hasilkan draft

6. simpan ke draft table

7. guru review

8. publish manual

### 18.4 Hal yang dilarang

- file upload langsung dieksekusi

- hasil AI langsung publish

- AI menulis ke data siswa tanpa review yang tepat

- AI menerima secret atau akses DB langsung tanpa batas

### 18.5 Hal yang wajib

- validasi output AI

- sanitasi output AI

- error state jika generation gagal

- retry flow

- budget awareness

### 18.6 Production Stability Contract — AI Document Pipeline

Per 11 Juli 2026, alur upload dokumen sudah berhasil di production setelah masalah berlapis: build Vercel gagal karena import ikon yang tidak tersedia, health check AI membaca env salah, NaraRouter `GET /v1/models` hidup tetapi `POST /v1/chat/completions` dari Vercel timeout, dan output soal AI kadang meleset dari schema.

Kontrak ini **jangan diubah tanpa bukti production baru**:

1. `src/lib/ai.ts` memakai endpoint OpenAI-compatible NaraRouter dengan fallback base URL:

   ```txt
   https://router.bynara.id/v1
   ```

   Key dibaca dari `AI_API_KEY || NARAROUTER_API_KEY`. Jangan wajibkan `AI_BASE_URL` karena env itu boleh kosong.

2. `src/lib/ai-generator.ts` harus mempertahankan local fallback generator. Jika NaraRouter timeout/502/504 dari Vercel, sistem tetap membuat draft materi, quiz, dan soal dari teks ekstraksi agar guru tidak melihat upload gagal total.

3. `src/lib/ai-sanitizer.ts` harus mempertahankan normalisasi output AI. Variasi seperti `Pilihan Ganda`, `items`, `questions`, `choices`, opsi array, atau kunci berupa teks jawaban harus dinormalisasi dulu sebelum Zod schema final.

4. Draft tidak boleh gagal total hanya karena bagian soal invalid. Minimal materi dan quiz yang valid tetap disimpan sebagai draft. Semua hasil tetap draft dan wajib direview guru.

5. Health check `/api/health` harus menampilkan kondisi realistis: ImageKit connected, AI connected untuk `GET /models`, Supabase REST `not_applicable` jika app tetap memakai Drizzle/Postgres langsung.

6. Jangan impor `@animateicons/react/lucide` di production. Dashboard guru harus memakai `lucide-react` karena package path itu pernah membuat Vercel build gagal.

### 18.7 Upgrade Path yang Aman

Upgrade yang disarankan bukan menghapus fallback, tetapi mengganti lapisan reliability dengan pengganti yang terbukti:

1. **Durable AI job queue** — upload route cukup menyimpan file dan enqueue job. Worker/queue yang memproses ekstraksi dan AI. Pilihan: Vercel Workflows, Cloudflare Queue/Worker, atau VPS worker.

2. **Vercel AI Gateway** — gunakan base URL OpenAI-compatible `https://ai-gateway.vercel.sh/v1` dengan `AI_GATEWAY_API_KEY` atau BYOK. Ini memberi observability, model routing, dan lebih cocok dengan runtime Vercel.

3. **NaraRouter support escalation** — laporkan bahwa `GET /v1/models` dari Vercel berhasil tetapi `POST /v1/chat/completions` timeout 504. Sertakan timestamp, region Vercel, dan model yang dipakai. Jangan kirim API key.

4. **Quality fallback upgrade** — fallback lokal sekarang adalah safety net agar fitur tidak mati. Jika kualitas ingin ditingkatkan, buat template deterministic yang lebih pedagogis atau jadikan fallback sebagai draft minimal yang bisa diregenerate ketika provider AI sehat.

Urutan upgrade yang aman:

```txt
1. Pertahankan fallback lokal yang sudah terbukti.
2. Tambah queue/worker atau AI Gateway sebagai jalur utama baru.
3. Tes upload PDF nyata sampai status ready + materi/quiz/soal draft.
4. Baru boleh mengubah fallback lama, jangan sebelumnya.
```

---

## 19. File Upload Security Principles

Ini bagian yang sangat penting karena user sudah eksplisit khawatir soal file berbahaya.

### 19.1 Semua upload dianggap tidak tepercaya

Tidak ada pengecualian.

### 19.2 Jangan pernah melakukan hal berikut

- menjalankan file upload

- menganggap extension sebagai jaminan aman

- menyimpan file ke path yang bisa diperlakukan sebagai executable artifact

- membiarkan AI/tool internal menuruti instruksi tersembunyi dari file tanpa validasi

### 19.3 Wajib lakukan

- cek MIME type

- cek magic bytes

- batasi ukuran file

- batasi jenis file

- ekstrak teks dulu

- simpan metadata upload di DB

- log upload activity

- tampilkan status processing yang jelas

### 19.4 AI ingestion principle

Kalau bisa, kirim **teks ekstraksi** ke model.

Jangan kirim file binary mentah jika tidak perlu.

### 19.5 Ekstensi yang boleh untuk fase awal

- `.pdf`

- `.doc`

- `.docx`

- `.jpg`

- `.jpeg`

- `.png`

- `.webp`

### 19.6 Ekstensi yang tidak boleh untuk fase awal

- `.php`

- `.js`

- `.ts`

- `.sh`

- `.html`

- `.svg` jika tidak diproteksi ketat

- executable archive tanpa jalur verifikasi

---

## 20. Storage Strategy Fase Sekarang

### 20.1 Struktur utama

- semua media baru -> `ImageKit`

- semua metadata -> `Supabase`

### 20.2 Kenapa bukan Vercel

Karena Vercel bukan persistent user file storage.

### 20.3 Kenapa bukan Google Drive dulu untuk semua

Google Drive per guru memang menarik sebagai fase berikutnya.

Tapi fase sekarang keputusan yang sudah terkunci adalah:

- `ImageKit` dulu untuk file/media platform baru

### 20.4 Prinsip file ownership

Walau file fisik di ImageKit, struktur metadata dan ownership harus tetap mendukung masa depan multi-guru:

- siapa guru pemilik upload

- upload ini milik kursus mana

- file dipakai oleh draft materi mana

- file dipakai oleh quiz/soal mana

---

## 21. Supabase Strategy Fase Sekarang

### 21.1 Supabase dipakai untuk apa

- user

- role

- sekolah

- kursus

- kelas

- siswa

- materi metadata

- quiz

- soal

- jawaban

- progress

- draft AI

- analytics snapshot

### 21.2 Supabase bukan rumah akhir

Keputusan user sudah jelas:

- Supabase sekarang

- VPS nanti jika usage sudah besar

Jadi desain harus:

- tidak vendor-coupled secara berlebihan

- tetap SQL-centric

- tetap Drizzle-friendly

---

## 22. Route Naming Principles

### 22.1 Publik

- `/`

- `/fitur`

- `/harga`

- `/tentang`

- `/masuk`

- `/daftar`

### 22.2 Guru

- `/guru`

- `/guru/kursus`

- `/guru/siswa`

- `/guru/uploads`

- `/guru/analytics`

### 22.3 Siswa

- `/siswa`

- `/siswa/materi`

- `/siswa/quiz`

- `/siswa/cbt`

- `/siswa/progres`

### 22.4 Rule

Gunakan route baru sebagai target final.

Route lama boleh hidup sementara sebagai bridge.

---

## 23. Copywriting Principles

### 23.1 Copy publik

Harus fokus ke manfaat dan alur.

Contoh tone benar:

- “Ubah dokumen jadi pembelajaran siap pakai.”

- “AI membantu, guru memutuskan.”

- “Masuk ke ruang yang tepat.”

### 23.2 Copy guru

Harus terasa sebagai alat kerja:

- “Upload dokumen”

- “Review draft”

- “Terbitkan materi”

- “Lihat progres siswa”

### 23.3 Copy siswa

Harus sederhana:

- “Mulai belajar”

- “Lanjutkan materi”

- “Kerjakan quiz”

- “Lihat progres”

### 23.4 Copy error auth

Harus eksplisit.

Contoh benar:

- “Akun ini terdaftar sebagai siswa. Gunakan portal siswa atau ganti akun.”

- “Akun ini terdaftar sebagai guru. Gunakan portal guru atau ganti akun.”

---

## 24. Layout Rules

### 24.1 Public layout

Public layout tidak boleh lagi terlalu mirip halaman materi sekolah lama.

Harus terasa seperti produk.

### 24.2 Auth layout

Auth layout harus:

- fokus

- tidak ramai

- punya hierarchy visual yang jelas

- menegaskan perbedaan guru dan siswa

### 24.3 Dashboard layout

Dashboard layout harus:

- stabil

- mudah dipindai

- punya sidebar/nav yang masuk akal

- tidak menampilkan opsi yang tidak relevan dengan role

---

## 25. Mobile-First Mandate

### 25.1 Wajib

Semua desain dimulai dari:

```txt
px-3 sm:px-5 lg:px-8
```

### 25.2 Konsekuensi

Landing page harus tetap meyakinkan di HP.

Form auth harus nyaman di HP.

Dashboard siswa harus terasa ringan di HP murah.

Dashboard guru harus usable di tablet dan laptop.

### 25.3 Jangan lakukan

- jangan desain dashboard hanya dari perspektif monitor besar

- jangan mengandalkan hover untuk informasi penting

- jangan buat tabel besar tanpa fallback mobile

---

## 26. Dashboard Guru: Section Blueprint

Halaman `/guru` minimal harus punya blok berikut:

### 26.1 Overview

- jumlah kursus

- jumlah siswa aktif

- jumlah draft AI menunggu review

- jumlah materi terbit

- jumlah quiz aktif

### 26.2 Action shortcuts

- upload dokumen

- buat kursus

- kelola siswa

- review draft

### 26.3 Draft pipeline

- dokumen terbaru diupload

- status extraction

- status generation

- status review

### 26.4 Siswa insight

- siswa yang tertinggal

- topik lemah

- quiz yang belum dikerjakan

### 26.5 Pengumuman / catatan sistem

- notifikasi penting

- update pipeline

---

## 27. Dashboard Siswa: Section Blueprint

Halaman `/siswa` minimal harus punya blok berikut:

### 27.1 Continue learning

- materi terakhir dibuka

- quiz berikutnya

- tugas/ujian aktif jika ada

### 27.2 Hari ini

- target belajar hari ini

- materi yang direkomendasikan

- pengumuman terbaru guru

### 27.3 Progress

- materi selesai

- quiz selesai

- progres keseluruhan sederhana

### 27.4 Jangan jadikan dashboard siswa seperti admin

Siswa tidak butuh terlalu banyak angka internal.

Mereka butuh tahu langkah belajar berikutnya.

---

## 28. AI Draft Review Screen Principles

Halaman review draft AI untuk guru harus selalu menampilkan:

- sumber dokumen

- status processing

- hasil draft materi

- hasil draft quiz

- hasil draft soal

- tombol edit

- tombol approve

- tombol reject/regenerate

### 28.1 Jangan lakukan

- jangan sembunyikan sumber dokumen

- jangan campur antara hasil AI final dengan draft mentah

- jangan paksa guru approve satu bundle kalau dia hanya mau pakai sebagian

### 28.2 Yang ideal

Guru bisa:

- publish materi saja

- simpan quiz sebagai draft

- buang soal tertentu

---

## 29. Analytics Principles

### 29.1 Fase sekarang

Analytics harus berguna, bukan sok ilmiah di UI.

Yang ditampilkan dulu:

- progres belajar

- siswa belum mengerjakan

- topik paling sering salah

- sinyal risiko awal

### 29.2 Fase nanti

Lebih dalam bisa menyusul:

- BKT detail

- risk snapshot lebih matang

- TRI internal

- recommendation engine lebih kuat

### 29.3 Rule utama

UI analytics harus bicara bahasa guru, bukan bahasa paper ilmiah.

---

## 30. Teacher Readiness Index Principles

Keputusan user saat ini:

- TRI disimpan dulu untuk owner/internal

- belum untuk semua guru pelanggan

Konsekuensi:

- schema boleh ada

- UI global jangan dibuka ke semua guru dulu

- jika dibahas ke guru, framing harus suportif, bukan menghakimi

---

## 31. Legacy Route Policy

Route lama yang masih boleh hidup sementara:

- `/api/siswa/cek`

- `/api/kuis/selesai`

- `/api/kuis/rekap`

- route legacy berbasis Sheets lain

### 31.1 Tujuannya

Sebagai bridge.

Bukan fondasi baru.

### 31.2 Aturan agent

Jangan membangun fitur baru di atas route-route ini.

---

## 32. Naming Rules

### 32.1 Gunakan nama yang sesuai domain pendidikan

Contoh yang baik:

- `guru`

- `siswa`

- `kursus`

- `kelas`

- `materi`

- `quiz`

- `soal`

- `draft`

### 32.2 Hindari nama ambigu

- `data`

- `form1`

- `engine-new`

- `portal-final-fix`

- `temp`

---

## 33. Navigation Philosophy

### 33.1 Public nav

ringkas

jelas

tidak padat link seperti website sekolah lama

### 33.2 Guru nav

harus memetakan pekerjaan

bukan kategori dekoratif

### 33.3 Siswa nav

harus memetakan belajar

bukan fitur admin

---

## 34. CTA Philosophy

CTA utama publik:

- `Coba Gratis`

CTA auth:

- `Masuk`

- `Daftar`

CTA guru:

- `Upload Dokumen`

- `Review Draft`

- `Terbitkan`

CTA siswa:

- `Mulai Belajar`

- `Lanjutkan`

- `Kerjakan Quiz`

CTA payment sementara:

- `Hubungi WhatsApp`

---

## 35. Animation Rules

### 35.1 Tetap pakai pattern yang sudah ada

Hero:

```ts
initial={{ y: 40, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.6, ease: easeCurve }}
```

Cards:

```ts
staggerChildren: 0.08
duration: 0.5
```

### 35.2 Jangan terlalu ramai

Produk baru harus terasa halus dan dewasa.

Bukan parade animasi.

### 35.3 Auth pages

Animasi boleh ada.

Tapi jangan sampai memperlambat pemahaman form.

---

## 36. Accessibility Rules

### 36.1 Minimum

- label form jelas

- intent error jelas

- focus state terlihat

- contrast cukup

- role/portal selection bisa dipakai keyboard

### 36.2 Untuk siswa

Perhatikan bahwa banyak user mungkin memakai HP murah dan konsentrasi rendah.

Jadi:

- jangan terlalu banyak teks instruksi dalam satu layar

- jangan banyak keputusan sekaligus

---

## 37. SEO Rules untuk Publik

### 37.1 Wajib index hanya untuk halaman publik

Halaman dashboard dan auth tidak perlu index.

### 37.2 Hindari masalah lama

- jangan lagi blok semua halaman publik lewat auth gate

- jangan lagi pasang meta noindex global yang tidak perlu

### 37.3 Landing page baru

Harus bisa dipahami crawler sebagai:

- platform guru-siswa

- AI document generator

- SaaS edukasi, bukan sekadar halaman materi tunggal

---

## 38. Performance Rules

### 38.1 Landing page

- tidak boleh jadi terlalu berat hanya karena mau terlihat modern

- image utama harus terukur

- section harus modular

### 38.2 Dashboard

- data penting tampil dulu

- list besar dimuat bertahap

- jangan fetch semuanya sekaligus jika tidak perlu

### 38.3 Build

Karena build pernah OOM, semua perubahan besar harus disiplin terhadap bundle dan memory.

---

## 39. Content System Principles

### 39.1 Konten lama

Masih bisa dibaca sebagai legacy.

### 39.2 Konten baru

Harus masuk sistem baru.

### 39.3 Guru-generated content

Semua konten buatan guru pada platform baru harus punya metadata berikut:

- owner guru

- kursus

- kelas

- status draft/publish/archive

- sumber upload

- versi

---

## 40. Document Generator Product Narrative

Narasi yang harus berulang di UI publik dan guru:

### 40.1 Masalah guru

Guru sering punya dokumen, tapi tidak punya waktu mengubahnya jadi pengalaman belajar digital.

### 40.2 Solusi AKAL Center

AKAL Center membantu mengubah dokumen itu menjadi:

- materi

- quiz

- soal

### 40.3 Posisi AI

AI mempercepat pekerjaan.

Guru memeriksa dan memutuskan.

### 40.4 Value akhir

Siswa mendapat pembelajaran yang lebih terstruktur.

Guru mendapat alur kerja yang lebih ringan.

---

## 41. UX Rules untuk Error State

### 41.1 Error auth

Harus spesifik.

### 41.2 Error upload

Harus menjelaskan apakah:

- file terlalu besar

- jenis file salah

- ekstraksi gagal

- AI generation gagal

### 41.3 Error role

Harus menjelaskan bahwa user masuk lewat portal yang salah.

---

## 42. Empty State Rules

### 42.1 Guru baru

Kalau dashboard kosong, jangan kosong membisu.

Harus ada:

- sambutan

- langkah pertama

- CTA upload dokumen

- CTA buat kursus

### 42.2 Siswa baru

Kalau belum ada materi, jelaskan bahwa guru belum menerbitkan materi.

---

## 43. Keputusan UX yang Sudah Terjadi di Codebase

Hal-hal berikut sudah mulai diperbaiki dan harus dipertahankan:

- login guru sekarang mulai diarahkan ke intent `portal=guru`

- login dan daftar tidak lagi harus hidup dalam tiga halaman auth yang saling konflik

- landing page mulai diarahkan ke produk baru

- build OOM sudah diatasi di script build

---

## 44. Keputusan UX yang Masih Harus Diselesaikan

- finalisasi `/masuk`

- finalisasi `/daftar`

- route `/guru` dan `/siswa` baru

- owner/admin sekolah placeholder

- dashboard siswa final

- dashboard guru final

- CTA pricing manual

- penghapusan jejak UX single-guru lama di banyak komponen lain

---

## 45. Validasi Kualitas Sebelum Klaim Selesai

Jangan menganggap desain baru selesai jika belum lolos pertanyaan berikut:

1. Apakah user baru paham produk ini dalam 5-10 detik?

2. Apakah guru dan siswa punya pintu masuk yang tegas?

3. Apakah hasil AI jelas sebagai draft, bukan final?

4. Apakah alur upload -> review -> publish terasa?

5. Apakah dashboard siswa dan guru benar-benar terasa berbeda?

6. Apakah halaman lama yang membingungkan masih menyisakan jalur konflik?

---

## 46. Batasan Keras untuk Semua Agent

### 46.1 Jangan lakukan ini

- jangan membuat fitur baru lewat Keystatic

- jangan membangun auth baru yang mencampur siswa dan guru lagi

- jangan membangun upload flow tanpa menganggap file sebagai untrusted

- jangan memperlakukan landing page lama sebagai baseline UX final

- jangan memperkenalkan dashboard yang sekadar indah tapi tidak membantu workflow

### 46.2 Wajib lakukan ini

- baca `AGENTS.md`

- baca `TODO-V2-MULTI-GURU.md`

- test build setelah perubahan besar

- jaga design system tetap konsisten

---

## 47. Referensi Internal yang Harus Diikuti

### 47.1 Dokumen wajib

- `AGENTS.md`

- `prd/TODO-V2-MULTI-GURU.md`

- `prd/01-ringkasan-eksekutif.md`

- `prd/02-audit-kondisi-saat-ini.md`

- `prd/03-arsitektur-target.md`

- `prd/06-model-data.md`

- `prd/07-rencana-migrasi.md`

- `prd/08-riset-2026-rekomendasi.md`

### 47.2 Code yang penting

- `src/lib/db/schema.ts`

- `middleware.ts`

- `src/lib/auth.ts`

- `src/app/api/v1/auth/*`

- `src/lib/cms*.ts`

- `keystatic.config.ts`

---

## 48. Route Inventory Singkat yang Perlu Diingat

### 48.1 Public sekarang yang masih ada

- `/`

- `/materi`

- `/evaluasi`

- `/game`

- `/video`

- `/tentang`

- `/peserta-didik`

- `/masuk`

- `/masuk-guru`

- `/daftar`

### 48.2 Dashboard sekarang yang ada di code

- `/dashboard-guru`

- `/dashboard-guru/kursus`

- `/dashboard-guru/nilai`

- `/dashboard-guru/siswa`

- `/dashboard-guru/sertifikat`

- `/dashboard-siswa`

- `/dashboard-siswa/kursus`

- `/dashboard-siswa/payment`

### 48.3 Target naming yang diinginkan

- `/guru`

- `/guru/kursus`

- `/guru/siswa`

- `/guru/uploads`

- `/guru/analytics`

- `/siswa`

- `/siswa/materi`

- `/siswa/quiz`

- `/siswa/cbt`

- `/siswa/progres`

---

## 49. Landing Page Visual System Blueprint

### 49.1 Hero composition

- tag kecil di atas

- headline besar

- subheadline yang tidak terlalu panjang

- dua CTA utama

- panel sisi kanan yang menjelaskan killer feature

### 49.2 Supporting sections

- value cards

- pipeline cards

- trust/security cards

- CTA bawah

### 49.3 What to avoid

- jangan pakai hero seperti lembaga kursus konvensional

- jangan jadikan halaman depan hanya kumpulan fitur lama

- jangan jadikan halaman depan seperti blog konten bab-bab

---

## 50. Final Statement

AKAL Center versi baru harus memenuhi tiga rasa sekaligus:

### Rasa 1

Saat user pertama kali datang, dia merasa:

> “Ini produk modern, bukan website pembelajaran biasa.”

### Rasa 2

Saat guru masuk, dia merasa:

> “Saya punya ruang kerja yang rapi dan jelas.”

### Rasa 3

Saat siswa masuk, dia merasa:

> “Saya tahu harus mulai dari mana, dan saya tidak masuk ke tempat yang salah.”

Kalau tiga rasa ini belum muncul, maka desain ulang belum selesai.

---

## 51. Changelog Dokumen Ini

### 2026-07-07

- `DESIGN.md` lama yang berupa diskusi mentah diganti dengan dokumen desain produk yang lebih terstruktur

- arah diubah dari website single-guru ke platform multi-guru

- keputusan strategis terbaru dari user dimasukkan

- konteks codebase nyata dimasukkan

- prinsip auth, AI, storage, dan frontend baru dikunci

- fokus landing page, auth, dashboard, dan AI pipeline dijadikan fondasi utama

---

## 52. Appendix A — Checklist Desain Publik

- [ ] headline jelas

- [ ] subheadline tidak bertele-tele

- [ ] CTA daftar terlihat tanpa scroll

- [ ] CTA masuk terlihat jelas

- [ ] section value guru ada

- [ ] section value siswa ada

- [ ] section value sekolah ada

- [ ] section killer feature AI ada

- [ ] section trust ada

- [ ] pricing sementara ke WA tercermin

- [ ] visual tetap konsisten dengan design token utama

---

## 53. Appendix B — Checklist Auth

- [ ] `/masuk` jadi entry utama

- [ ] `/daftar` jadi entry utama

- [ ] `/masuk-guru` hanya alias

- [ ] login guru tidak bisa pakai akun siswa

- [ ] login siswa tidak bisa pakai akun guru

- [ ] intent mismatch punya pesan eksplisit

- [ ] Google auth tidak mencampur role sembarangan

- [ ] register guru ada

- [ ] register siswa ada

---

## 54. Appendix C — Checklist Dashboard Guru

- [ ] overview nyata

- [ ] jumlah kursus

- [ ] jumlah siswa

- [ ] jumlah draft AI

- [ ] upload dokumen

- [ ] review draft

- [ ] publish material

- [ ] analytics ringkas

- [ ] siswa tertinggal terlihat

---

## 55. Appendix D — Checklist Dashboard Siswa

- [ ] continue learning

- [ ] materi terbaru

- [ ] quiz tersedia

- [ ] CBT entry bila ada

- [ ] pengumuman guru

- [ ] progress sederhana

- [ ] tidak terasa seperti admin panel

---

## 56. Appendix E — Checklist AI Generator

- [ ] upload PDF

- [ ] upload DOCX

- [ ] extraction text

- [ ] draft materi

- [ ] draft quiz

- [ ] draft soal

- [ ] review guru

- [ ] publish guru

- [ ] retry flow

- [ ] error flow

---

## 57. Appendix F — Checklist Keamanan Upload

- [ ] mime check

- [ ] magic bytes check

- [ ] file size check

- [ ] extension whitelist

- [ ] no executable types

- [ ] extract text before AI if possible

- [ ] metadata stored

- [ ] audit upload stored

---

## 58. Appendix G — Checklist Legacy Bridge

- [ ] google sheets tetap hidup sementara

- [ ] cms lama tetap bisa dibaca

- [ ] fitur baru tidak menulis ke content lama

- [ ] route lama tidak jadi dasar fitur baru

---

## 59. Appendix H — Checklist Verifikasi Build

- [ ] `npm run build` hijau

- [ ] route auth baru tidak error

- [ ] landing page baru compile

- [ ] dashboard lama tidak pecah parah

- [ ] middleware masih berjalan

---

## 60. Penutup

Dokumen ini tidak dibuat untuk jadi hiasan.

Dokumen ini dibuat agar semua agent, semua implementasi, dan semua keputusan berikutnya tetap berpijak pada satu arah yang sama:

**AKAL Center sedang dibangun ulang sebagai platform multi-guru dengan AI document generator, alur auth yang tegas, dan pengalaman produk yang benar-benar baru.**

---

## 61. Appendix I — Ringkasan Inti dari Diskusi Lama yang Wajib Diselamatkan

Berikut adalah inti emosional dan operasional dari diskusi lama yang **harus tetap hidup** walaupun bentuk sistemnya berubah:

### 61.1 Akar sistem harus kuat

Kalimat inti dari diskusi lama bisa diringkas menjadi:

> database dan backend adalah akar, tiang, dan tulang punggung sistem.

Maknanya untuk desain sekarang:

- jangan membuat UI yang seolah-olah modern tapi menggantung pada flow data yang rapuh

- jangan membuat upload dan generation pipeline tanpa status yang dapat dipantau

- jangan membuat dashboard cantik yang datanya tidak punya sumber kebenaran yang jelas

### 61.2 Data tidak boleh hilang diam-diam

Diskusi lama berulang kali menekankan bahwa data siswa tidak boleh hilang hanya karena:

- jaringan putus

- submit gagal

- request timeout

- browser error

- state frontend tertinggal

Implikasi desain:

- selalu tampilkan status yang menjelaskan apakah data:

  - sudah tersimpan

  - sedang diproses

  - gagal

  - butuh tindakan ulang

### 61.3 AI untuk meringankan guru, bukan menggantikan guru

Ini adalah prinsip paling penting setelah keamanan.

Implikasi ke UI:

- semua copy AI harus memakai bahasa bantu kerja

- hindari kalimat seperti “AI membuatkan semuanya otomatis tanpa guru”

- gunakan kalimat seperti:

  - “AI membuat draft awal”

  - “Guru meninjau sebelum terbit”

  - “AI mempercepat, guru memutuskan”

### 61.4 Sistem harus terasa terpantau

Dalam diskusi lama ada kekhawatiran kuat bahwa sistem harus:

- cepat tertangani

- terpantau

- fleksibel

- akurat

Makna desain untuk 2026:

- banyak state harus terlihat di UI

- jangan menyembunyikan proses penting di balik button hitam

- perlu panel status untuk:

  - upload

  - extraction

  - generation

  - review

  - publish

---

## 62. Appendix J — Public Information Architecture yang Lebih Final

### 62.1 Struktur publik yang disarankan

Urutan halaman publik yang paling masuk akal:

1. `/`

2. `/fitur`

3. `/harga`

4. `/tentang`

5. `/masuk`

6. `/daftar`

7. `/kebijakan-privasi`

8. `/syarat-layanan`

### 62.2 Fungsi tiap halaman

#### `/`

Menjual produk dalam 5-10 detik pertama.

#### `/fitur`

Memperjelas fitur tanpa mengulang hero landing page.

#### `/harga`

Menjelaskan struktur penawaran dan bahwa payment masih manual.

#### `/tentang`

Menyampaikan alasan, visi, dan kepercayaan produk.

#### `/masuk`

Tempat masuk untuk seluruh role publik, dengan intent yang dipisah.

#### `/daftar`

Tempat onboarding role baru, terutama guru dan siswa.

### 62.3 Hal yang tidak perlu lagi ditonjolkan di publik

- daftar bab lama sebagai jantung homepage

- kesan bahwa website ini hanya tempat melihat materi PAI

- CTA yang terlalu menekankan “gabung sekarang” tanpa menjelaskan nilai baru

---

## 63. Appendix K — Halaman Publik Per-Section dengan Acceptance Criteria

### 63.1 Hero utama

**Tujuan:**

- visitor paham apa produknya

- visitor paham untuk siapa

- visitor paham kenapa ini beda dari website lama

**Elemen wajib:**

- eyebrow kecil

- headline besar

- subheadline jelas

- CTA daftar

- CTA masuk

- panel visual killer feature

**Acceptance criteria:**

- seseorang yang belum kenal produk bisa menjelaskan nilai inti setelah membaca hero

- CTA utama terlihat tanpa scroll di desktop dan mobile normal

- tidak ada kalimat hero yang terdengar seperti copy kursus online generik

### 63.2 Value section

**Elemen wajib:**

- card guru

- card siswa

- card sekolah

**Acceptance criteria:**

- tiap card menjawab masalah nyata role tersebut

- card tidak hanya berisi slogan kosong

### 63.3 Workflow section

**Elemen wajib:**

- upload

- extraction

- draft

- review

- publish

- belajar

**Acceptance criteria:**

- alur terasa sebagai sistem, bukan fitur acak

### 63.4 Trust section

**Elemen wajib:**

- guru approve hasil AI

- role terpisah

- upload aman

- data siswa seperlunya

**Acceptance criteria:**

- trust section tidak terlalu teknis

- tapi cukup kuat untuk meyakinkan guru/developer/owner

---

## 64. Appendix L — Auth State Machine Final

### 64.1 State publik

```txt
guest
  -> lihat landing page
  -> pilih masuk
  -> pilih daftar
```

### 64.2 State masuk

```txt
/masuk
  -> pilih portal intent
     -> guru
     -> siswa
  -> pilih metode auth
     -> email/password
     -> google
```

### 64.3 State validasi login

```txt
credentials entered
  -> backend cek akun ada?
     -> tidak ada => error
  -> backend cek password benar?
     -> tidak => error
  -> backend cek role user
  -> backend cek intent portal
     -> mismatch => error eksplisit
     -> match => issue session + redirect
```

### 64.4 State redirect per role

```txt
OWNER -> /owner
ADMIN_SEKOLAH -> /admin-sekolah
GURU -> /guru
ASISTEN_GURU -> /guru
SISWA -> /siswa
ORANG_TUA -> /orang-tua
```

### 64.5 State daftar

```txt
/daftar
  -> pilih guru atau siswa
  -> isi data minimal
  -> submit
  -> buat account
  -> issue session
  -> redirect ke home per role
```

### 64.6 State error penting

```txt
portal guru + akun siswa -> tampilkan error portal salah
portal siswa + akun guru -> tampilkan error portal salah
email terdaftar tapi tanpa password -> arahkan set password atau login Google
google login email sama -> link identity ke account yang sama
```

---

## 65. Appendix M — Register Field Matrix

### 65.1 Guru

**Minimal field sekarang:**

- nama

- email

- password

- metode auth alternatif Google

**Field tambahan nanti:**

- nama sekolah

- jenis sekolah

- nomor WhatsApp

- mapel utama

- jenjang

### 65.2 Siswa

**Minimal field sekarang:**

- nama

- email

- password

**Field opsional sekarang:**

- kelas

- no absen

**Field jangan dipaksa sekarang:**

- NISN

- data identitas sensitif

- alamat detail

### 65.3 Orang tua

Belum prioritas.

Jika nanti diaktifkan, cukup:

- nama

- email

- relasi dengan siswa

### 65.4 Admin sekolah

Belum prioritas penuh.

Jika nanti diaktifkan:

- nama

- email kerja

- sekolah

---

## 66. Appendix N — Role Permission Matrix Ringkas

### 66.1 OWNER

boleh:

- lihat semua school summary

- lihat TRI internal

- lihat job failure

- kelola feature flag

tidak wajib sekarang:

- panel super-admin kompleks

### 66.2 ADMIN_SEKOLAH

boleh:

- lihat guru di sekolahnya

- lihat summary siswa di sekolahnya

- lihat analytics sekolah tingkat tinggi

tidak boleh:

- ubah konten guru tanpa mekanisme yang jelas

### 66.3 GURU

boleh:

- upload dokumen

- generate draft

- review/publish

- kelola siswa di ruangnya

- lihat analytics kelasnya

### 66.4 ASISTEN_GURU

boleh:

- bantu kelola operasional tertentu

tidak boleh:

- akses revenue/konfigurasi utama

### 66.5 SISWA

boleh:

- belajar

- kerjakan quiz

- lihat progres sendiri

### 66.6 ORANG_TUA

boleh:

- lihat progres anak bila fitur nanti diaktifkan

tidak boleh:

- edit apa pun

---

## 67. Appendix O — Dashboard Guru Screen Inventory

### 67.1 `/guru`

Blok minimum:

- greeting

- summary stats

- draft waiting review

- upload CTA

- siswa perlu perhatian

- kursus terbaru

### 67.2 `/guru/kursus`

Blok minimum:

- list kursus

- filter status

- create kursus

- quick actions

### 67.3 `/guru/kursus/[id]`

Tab minimum:

- overview

- materi

- quiz

- soal

- siswa

- pengumuman

### 67.4 `/guru/uploads`

Blok minimum:

- upload box

- upload history

- processing state

- failed state

### 67.5 `/guru/drafts`

Blok minimum:

- filter by type

- filter by status

- card draft materi

- card draft quiz

- card draft soal

### 67.6 `/guru/analytics`

Blok minimum:

- class progress

- weak topic summary

- not attempted summary

- risk summary

---

## 68. Appendix P — Dashboard Siswa Screen Inventory

### 68.1 `/siswa`

Blok minimum:

- continue learning

- materi terbaru

- quiz aktif

- progress ringkas

- pengumuman

### 68.2 `/siswa/materi`

Blok minimum:

- list materi

- filter kelas/kursus jika perlu

- status selesai/belum

- CTA lanjut belajar

### 68.3 `/siswa/quiz`

Blok minimum:

- quiz tersedia

- quiz selesai

- riwayat nilai

### 68.4 `/siswa/cbt`

Blok minimum:

- daftar CBT aktif

- instruksi

- hasil akhir

### 68.5 `/siswa/progres`

Blok minimum:

- materi selesai

- quiz selesai

- topik yang perlu perhatian

---

## 69. Appendix Q — Empty State Library

### 69.1 Guru belum punya kursus

Copy contoh:

> Belum ada kursus. Mulai dari membuat kursus pertama agar dokumen dan draft AI bisa ditempatkan dengan rapi.

CTA:

- Buat Kursus Pertama

### 69.2 Guru belum upload dokumen

Copy contoh:

> Belum ada dokumen. Upload PDF atau DOCX untuk mulai membuat draft materi, quiz, dan soal.

CTA:

- Upload Dokumen

### 69.3 Guru belum punya draft

Copy contoh:

> Belum ada draft AI. Setelah dokumen diunggah dan diproses, hasilnya akan muncul di sini untuk ditinjau.

### 69.4 Siswa belum punya materi

Copy contoh:

> Belum ada materi yang diterbitkan untukmu. Tunggu guru menerbitkan pembelajaran baru.

### 69.5 Siswa belum punya quiz

Copy contoh:

> Belum ada quiz aktif. Kamu bisa mulai dari materi yang sudah tersedia.

---

## 70. Appendix R — Loading, Pending, and Failure States

### 70.1 Uploading

State harus eksplisit:

- menunggu file

- mengunggah

- berhasil diunggah

- gagal unggah

### 70.2 Extracting

State harus eksplisit:

- mengekstrak teks

- ekstraksi gagal

- ekstraksi berhasil

### 70.3 Generating

State harus eksplisit:

- AI sedang membuat draft materi

- AI sedang membuat draft quiz

- AI sedang membuat draft soal

### 70.4 Review

State harus eksplisit:

- menunggu ditinjau

- perlu revisi

- ditolak

- diterbitkan

---

## 70A. Appendix R2 — Skeleton, Progressive Reveal, and Perceived Speed

Untuk layar yang memuat data, prinsip utamanya adalah:

> **Skeleton lebih baik daripada spinner kosong. Progressive reveal lebih baik daripada ledakan konten sekaligus.**

### 70A.1 Yang salah

```txt
[spinner berputar]
... tunggu 2-3 detik ...
[semua konten baru muncul sekaligus]
```

Masalah dari pola ini:

- user merasa aplikasi lambat

- user tidak tahu apakah sistem sedang bekerja atau macet

- ketika loading agak lama, kepercayaan turun

### 70A.2 Yang benar

```txt
Detik 0:
┌────────────────────┐
│ ████████████████   │
│ ████████           │
│ ████████████████   │
└────────────────────┘

Detik 0.5:
┌────────────────────┐
│ [gambar blur]      │
│ ████████           │
│ ████████████████   │
└────────────────────┘

Detik 1:
┌────────────────────┐
│ [gambar jernih]    │
│ Judul              │
│ ████████████████   │
└────────────────────┘

Detik 1.5:
┌────────────────────┐
│ [gambar jernih]    │
│ Judul              │
│ Deskripsi lengkap  │
└────────────────────┘
```

### 70A.3 Prinsip implementasi

- tampilkan struktur dulu, data belakangan

- angka ringkasan boleh muncul lebih cepat daripada list detail

- thumbnail/blur preview boleh muncul lebih dulu daripada gambar final

- list panjang jangan menunggu semua data sebelum render pertama

### 70A.4 Wajib dipakai pada area berikut

- landing page section yang memuat konten dari server

- dashboard guru overview

- dashboard siswa overview

- daftar kursus guru

- daftar draft AI

- daftar upload dokumen

- analytics cards

- feed materi siswa

### 70A.5 Rule agent

Kalau sebuah layar masih memakai spinner tunggal penuh layar padahal bisa memakai skeleton per blok, anggap pekerjaan belum rapi.

---

## 70B. Appendix R3 — Screen Contract: Halaman Ujian Selesai

Halaman selesai ujian **wajib** terasa final, meyakinkan, dan tidak ambigu.

Ini bukan layar kecil. Ini adalah penutup state penting yang harus memberi rasa aman pada siswa dan guru.

### 70B.1 Struktur minimum

```txt
┌─────────────────────────────────────┐
│                                     │
│         ✅ UJIAN SELESAI            │
│                                     │
│  Mata Pelajaran: PAI               │
│  Kelas: 7A                         │
│  Waktu pengerjaan: 67 menit        │
│  Jumlah soal dijawab: 20/20        │
│                                     │
│  Nilai akan diumumkan oleh guru.    │
│  Jangan tutup halaman ini.          │
│                                     │
│  ───────────────────────────────    │
│  ⚠ Tunggu konfirmasi dari guru      │
│    sebelum meninggalkan ruangan     │
│                                     │
└─────────────────────────────────────┘
```

### 70B.2 Informasi wajib

- status selesai yang sangat jelas

- nama ujian atau mata pelajaran

- kelas

- waktu pengerjaan

- jumlah soal dijawab

- pesan tentang status nilai

- instruksi jangan tutup halaman jika memang konteks ujian sekolah memerlukannya

### 70B.3 Jangan lakukan

- jangan redirect mendadak tanpa konfirmasi visual

- jangan tampilkan halaman kosong atau toast singkat saja

- jangan tampilkan skor final jika mode ujian memang harus menunggu guru

- jangan tampilkan UI ambigu seperti “mungkin sudah terkirim”

### 70B.4 Acceptance criteria

- siswa paham ujian sudah benar-benar selesai

- siswa paham apakah nilai langsung muncul atau menunggu guru

- guru bisa menganggap layar ini cukup formal untuk konteks kelas/ujian

---

## 71. Appendix S — Checklist Keamanan Upload yang Lebih Detail

### 71.1 Validasi awal

- ukuran file

- mime

- extension

- magic bytes

### 71.2 Validasi pipeline

- file tidak dieksekusi

- file tidak dirender sebagai HTML executable

- file tidak diteruskan ke subsistem lain tanpa filter

### 71.3 Validasi AI

- ekstrak teks dulu

- batasi panjang teks

- tandai jika dokumen kosong/tidak terbaca

- jangan jalankan instruksi tersembunyi dari dokumen

### 71.4 Validasi storage

- file tersimpan dengan owner yang jelas

- path tidak bisa dimanipulasi user

- preview URL aman

---

## 72. Appendix T — Document Extraction Strategy

### 72.1 PDF

Target fase awal:

- ekstrak teks yang cukup baik

- identifikasi heading/subheading

- identifikasi bagian penting

- fallback jika PDF adalah scan dan sulit dibaca

### 72.2 DOCX

Target fase awal:

- ekstrak paragraf

- pertahankan urutan teks

- identifikasi heading jika bisa

### 72.3 Output extraction yang perlu disimpan

- raw text

- normalized text

- section candidates

- extraction warnings

---

## 73. Appendix U — AI Output Design Contract

### 73.1 Draft materi minimal harus punya

- judul

- ringkasan

- tujuan belajar

- isi utama

- poin penting

- penutup ringkas

### 73.2 Draft quiz minimal harus punya

- judul quiz

- deskripsi singkat

- daftar soal

- kunci jawaban

### 73.3 Draft soal minimal harus punya

- teks soal

- tipe soal

- opsi jika pilihan ganda

- kunci

### 73.4 Jangan simpan output mentah saja

Harus diubah ke struktur yang bisa direview manusia.

---

## 74. Appendix V — Mode Evaluasi Matrix

### 74.1 Belajar biasa

karakteristik:

- santai

- bisa diulang

- fokus pemahaman

### 74.2 Ulangan biasa

karakteristik:

- formal ringan

- skor tercatat

- tidak seketat CBT penuh

### 74.3 CBT

karakteristik:

- lebih terkunci

- state ujian lebih tegas

- instruksi dan hasil akhir terpisah

### 74.4 Konsekuensi desain

Jangan lagi pakai satu tampilan quiz untuk semua mode tanpa pembeda yang jelas.

---

## 75. Appendix W — Public vs Private Data Boundary

### 75.1 Public

- copy produk

- fitur

- harga

- tentang

- materi legacy yang memang sengaja publik jika tetap dibuka

### 75.2 Private Guru

- upload

- draft

- siswa

- analytics

- unpublished content

### 75.3 Private Siswa

- progres

- attempt

- hasil

- pengumuman pribadi jika nanti ada

### 75.4 Private Internal

- owner analytics

- TRI internal

- job failure admin view

---

## 76. Appendix X — Copy Deck Awal yang Boleh Dipakai

### 76.1 Headline publik kandidat

- Ubah dokumen jadi pembelajaran siap pakai.

- Dari PDF ke materi, quiz, dan soal yang siap ditinjau guru.

- Satu ruang kerja untuk guru, satu ruang belajar untuk siswa.

### 76.2 Subheadline kandidat

- AI membantu menyusun draft. Guru tetap memegang keputusan akhir.

- Dirancang untuk membantu kerja guru lebih cepat tanpa mengacaukan alur belajar siswa.

### 76.3 CTA kandidat

- Coba Gratis

- Masuk ke Portal

- Upload Dokumen Pertama

- Review Draft AI

### 76.4 Error copy kandidat

- Akun ini terdaftar sebagai siswa. Gunakan portal siswa.

- Akun ini terdaftar sebagai guru. Gunakan portal guru.

- Dokumen belum bisa diproses. Periksa format dan coba lagi.

---

## 77. Appendix Y — Legacy-to-New Route Map

| Legacy | Target baru | Catatan |
|---|---|---|
| `/login` | `/masuk` | alias |
| `/masuk-guru` | `/masuk?portal=guru` | alias intent |
| `/pendidik` | `/guru` | nanti redirect atau ganti total |
| `/peserta-didik` | `/siswa` | nanti redirect atau ganti total |
| `/dashboard-guru` | `/guru` | legacy dashboard route |
| `/dashboard-siswa` | `/siswa` | legacy dashboard route |

---

## 78. Appendix Z — Checklist untuk Agent Sebelum Menyentuh Frontend

- [ ] baca `AGENTS.md`

- [ ] baca `TODO-V2-MULTI-GURU.md`

- [ ] baca `DESIGN.md`

- [ ] pastikan tidak membangun fitur baru lewat Keystatic

- [ ] pastikan portal guru dan siswa tidak dicampur lagi

- [ ] pastikan hasil AI tetap draft

- [ ] pastikan upload diperlakukan sebagai untrusted content

- [ ] jalankan `npm run build`

---

## 79. Appendix AA — Hal-hal yang Perlu Diperiksa Ulang Saat Coding

### 79.1 Build memory

Karena build pernah OOM, setiap perubahan frontend besar harus memperhatikan:

- import besar

- banyak page client component yang tidak perlu

- asset image terlalu berat

### 79.2 Route shadowing

Karena route lama masih hidup, setiap route baru harus dicek apakah tertimpa alias atau redirect lama.

### 79.3 Session assumptions

Banyak komponen lama mungkin masih menganggap role hanya `guru` vs `murid`.

### 79.4 Content assumption

Banyak komponen lama masih menganggap materi dan soal datang dari Keystatic atau `src/data/*`.

---

## 80. Appendix AB — Peta Data Minimal yang Harus Stabil Dulu

Untuk menghindari rombak ulang besar, model berikut harus dianggap sangat penting:

- `users`

- `sekolah`

- `kursus`

- `skill`

- `soal`

- `quiz_session`

- `jawaban_log`

- `file_materi`

- `google_drive_auth` jika nanti diaktifkan

- tabel AI draft yang akan ditambahkan

### 80.1 Prinsip

Lebih baik mengunci struktur inti lebih awal daripada membiarkan agent-agent bawah membuat variasi model yang saling tabrak.

---

## 81. Appendix AC — Kapan DESIGN.md Harus Diupdate Lagi

Dokumen ini harus diupdate lagi bila:

- auth final berubah signifikan

- storage strategy berubah dari ImageKit ke strategi lain

- Google Drive per guru diaktifkan penuh

- route target berubah

- payment online diaktifkan

- dashboard owner/admin/orang tua mulai dibangun serius

- AI pipeline berubah dari single-stage ke queue multi-stage yang lebih kompleks

---

## 82. Appendix AD — Pernyataan Final untuk Agent di Bawah

Kalau kamu agent coding yang membaca ini, pegang tiga kalimat ini:

1. **Jangan kembali ke alur lama.**

2. **Jangan campurkan guru dan siswa lagi.**

3. **Jangan anggap AI sebagai auto-publish machine.**

Kalau tiga ini dilanggar, berarti kamu keluar dari arah desain AKAL Center.

---

## 83. Appendix AE — Screen Contract: Upload Dokumen Guru

Layar upload dokumen guru adalah salah satu layar paling penting di seluruh produk baru.

Kalau layar ini terasa ruwet, lambat, atau tidak meyakinkan, maka killer feature produk ikut terasa lemah.

### 83.1 Tujuan layar

- guru bisa upload dokumen dengan tenang

- guru paham dokumen ini akan dipakai untuk apa

- guru tahu status file setelah upload

- guru tidak takut file “hilang” atau “tidak jelas masuk ke mana”

### 83.2 Struktur minimum

```txt
┌───────────────────────────────────────────┐
│ Upload Dokumen Pembelajaran               │
│                                           │
│ Gunakan PDF atau DOCX untuk membuat       │
│ draft materi, quiz, dan soal.             │
│                                           │
│ [ Dropzone / Pilih File ]                 │
│                                           │
│ Format: PDF, DOCX                         │
│ Maks ukuran: 10 MB                        │
│                                           │
│ Kursus tujuan: [dropdown]                 │
│ Kelas tujuan : [dropdown/opsional]        │
│                                           │
│ [Unggah dan Proses]                       │
│                                           │
│ ---------------------------------------   │
│ Riwayat Upload                            │
│ - file-a.pdf      extracting              │
│ - file-b.docx     ready for review        │
│ - file-c.pdf      failed                  │
└───────────────────────────────────────────┘
```

### 83.3 Informasi wajib

- nama layar yang jelas

- file type yang didukung

- batas ukuran file

- kursus tujuan

- kelas tujuan bila relevan

- CTA utama

- riwayat/status upload

### 83.4 Copy yang disarankan

- “Gunakan PDF atau DOCX untuk membuat draft materi, quiz, dan soal.”

- “File akan diproses aman sebagai draft. Guru tetap meninjau sebelum diterbitkan.”

### 83.5 Jangan lakukan

- jangan tampilkan upload box tanpa penjelasan apa yang akan terjadi

- jangan sembunyikan status file sesudah upload

- jangan pakai kata-kata teknis yang tidak perlu seperti “ingest”, “parse”, atau “transform” di layar utama guru

---

## 84. Appendix AF — Screen Contract: Status Proses Dokumen

Sesudah upload, guru harus bisa melihat progres secara bertahap.

### 84.1 State minimum

```txt
uploaded
extracting
extracted
generating
ready for review
published
failed
```

### 84.2 Tampilan ideal

```txt
┌───────────────────────────────────────────┐
│ File: Modul-Amanah-Kelas-8.pdf            │
│ Kursus: Akidah Akhlak 8A                  │
│                                           │
│ Status: Generating Draft                  │
│ [██████████------] 63%                    │
│                                           │
│ Sedang membuat draft materi, quiz,        │
│ dan soal dari dokumen ini.                │
│                                           │
│ [Lihat Detail] [Batalkan jika diizinkan]  │
└───────────────────────────────────────────┘
```

### 84.3 Rule UX

- status harus manusiawi, bukan status teknis mentah

- gunakan progress bar jika memang ada tahapan berurutan

- jika gagal, tampilkan alasan yang bisa dipahami

Contoh:

- “Dokumen tidak bisa dibaca dengan baik. Coba file lain atau unggah versi yang lebih jelas.”

---

## 85. Appendix AG — Screen Contract: Review Draft AI

Ini adalah layar kedua paling penting setelah upload.

Di sinilah guru memutuskan apakah hasil AI layak dipakai.

### 85.1 Tujuan layar

- memberi rasa kontrol penuh ke guru

- memisahkan dengan jelas draft materi, quiz, dan soal

- memudahkan guru approve sebagian, bukan semua sekaligus

### 85.2 Struktur minimum

```txt
┌───────────────────────────────────────────┐
│ Review Draft AI                           │
│ Sumber: Modul-Amanah-Kelas-8.pdf          │
│                                           │
│ [Tab Materi] [Tab Quiz] [Tab Soal]        │
│                                           │
│ Status dokumen: Ready for Review          │
│ Model: [nama model]                       │
│                                           │
│ ---------------------------------------   │
│ Judul materi                              │
│ Ringkasan                                 │
│ Tujuan belajar                            │
│ Isi materi                                │
│                                           │
│ [Edit] [Approve Materi] [Reject]          │
│                                           │
│ ---------------------------------------   │
│ Draft quiz                                │
│ [Approve Quiz]                            │
│                                           │
│ ---------------------------------------   │
│ Draft soal                                │
│ [Approve Soal]                            │
└───────────────────────────────────────────┘
```

### 85.3 Kemampuan yang wajib ada

- approve materi saja

- approve quiz saja

- approve soal saja

- edit sebelum approve

- reject

- regenerate per output bila memungkinkan

### 85.4 Jangan lakukan

- jangan paksa satu tombol “approve semua” sebagai satu-satunya jalan

- jangan sembunyikan sumber dokumen

- jangan sembunyikan model atau status generation

---

## 86. Appendix AH — Screen Contract: Dashboard Guru Kosong Pertama Kali

Guru yang baru masuk tidak boleh dilempar ke dashboard kosong yang dingin.

### 86.1 Struktur minimum

```txt
┌───────────────────────────────────────────┐
│ Selamat datang, [Nama Guru]               │
│                                           │
│ Mari mulai workspace pertamamu:           │
│                                           │
│ 1. Buat kursus pertama                    │
│ 2. Upload dokumen pertama                 │
│ 3. Tinjau draft AI                        │
│ 4. Terbitkan materi ke siswa              │
│                                           │
│ [Buat Kursus Pertama]                     │
│ [Upload Dokumen Pertama]                  │
└───────────────────────────────────────────┘
```

### 86.2 Rule

- harus ada langkah pertama

- harus ada CTA jelas

- harus menjelaskan value kerja berikutnya

---

## 87. Appendix AI — Screen Contract: Dashboard Siswa Kosong Pertama Kali

### 87.1 Struktur minimum

```txt
┌───────────────────────────────────────────┐
│ Selamat datang di ruang belajar           │
│                                           │
│ Guru kamu belum menerbitkan materi baru.  │
│ Setelah materi tersedia, kamu bisa mulai  │
│ belajar dan mengerjakan quiz di sini.     │
│                                           │
│ [Lihat Pengumuman] [Muat Ulang]           │
└───────────────────────────────────────────┘
```

### 87.2 Rule

- jangan menyalahkan siswa

- jangan kosong tanpa konteks

- arahkan ke langkah yang masih mungkin dilakukan

---

## 88. Appendix AJ — Screen Contract: Role Mismatch Error

Ini harus sangat jelas, karena ini salah satu masalah besar yang sudah terbukti terjadi di codebase lama.

### 88.1 Portal guru, akun siswa

```txt
┌───────────────────────────────────────────┐
│ Akun ini terdaftar sebagai siswa.         │
│                                           │
│ Gunakan portal siswa untuk masuk ke       │
│ ruang belajar, atau ganti akun jika       │
│ kamu ingin masuk sebagai guru.            │
│                                           │
│ [Masuk sebagai Siswa] [Ganti Akun]        │
└───────────────────────────────────────────┘
```

### 88.2 Portal siswa, akun guru

```txt
┌───────────────────────────────────────────┐
│ Akun ini terdaftar sebagai guru.          │
│                                           │
│ Gunakan portal guru untuk mengelola       │
│ materi, kuis, dan siswa.                  │
│                                           │
│ [Masuk ke Portal Guru] [Ganti Akun]       │
└───────────────────────────────────────────┘
```

### 88.3 Jangan lakukan

- jangan redirect diam-diam

- jangan hanya tampilkan “forbidden” mentah

- jangan tampilkan pesan teknis internal

---

## 89. Appendix AK — Screen Contract: Halaman Gagal Upload atau Gagal Proses

### 89.1 Upload gagal

```txt
┌───────────────────────────────────────────┐
│ Upload gagal                              │
│                                           │
│ File terlalu besar atau format tidak      │
│ didukung. Gunakan PDF/DOCX maksimal 10MB. │
│                                           │
│ [Pilih File Lain]                         │
└───────────────────────────────────────────┘
```

### 89.2 Generation gagal

```txt
┌───────────────────────────────────────────┐
│ Draft belum bisa dibuat                   │
│                                           │
│ Sistem tidak berhasil mengubah dokumen    │
│ ini menjadi draft materi/quiz/soal.       │
│                                           │
│ [Coba Lagi] [Lihat Detail Error]          │
└───────────────────────────────────────────┘
```

### 89.3 Rule

- selalu beri jalan keluar

- jangan berakhir pada dead-end message

---

## 90. Appendix AL — 7 Strategi UI/UX yang Dipakai Produk Besar

Bagian ini dibuat agar agent di bawah tidak sekadar bikin layout “rapi”, tetapi mengikuti pola produk modern yang terbukti.

### Strategi 1 — Skeleton > Spinner > Konten

Sudah dijelaskan di Appendix R2.

### Strategi 2 — Count First, Data Later

Contoh di dashboard guru:

```txt
Langsung tampilkan:
- total kursus
- total siswa
- total draft review

List detail kursus/siswa/draft menyusul setelah skeleton muncul.
```

### Strategi 3 — Progressive Disclosure

Jangan tampilkan semua aksi sekaligus.

Contoh:

- landing page: cukup jelaskan pipeline besar

- review draft: detail baru terlihat saat tab dipilih

- analytics: ringkasan dulu, detail menyusul

### Strategi 4 — Summary Before Table

Sebelum guru melihat tabel panjang, beri ringkasan singkat:

- berapa siswa aktif

- siapa belum mengerjakan

- topik mana paling lemah

### Strategi 5 — One Main Action per Screen

Setiap layar utama harus punya satu aksi paling dominan.

Contoh:

- upload screen -> `Unggah dan Proses`

- review screen -> `Approve`

- dashboard guru kosong -> `Upload Dokumen Pertama`

### Strategi 6 — State Visibility

Jangan sembunyikan state penting sistem.

Guru harus tahu:

- file sudah masuk atau belum

- generation gagal atau belum

- draft sudah siap atau belum

### Strategi 7 — Formal Closure for High-Stakes Flows

Flow penting seperti ujian, publish, approve, dan upload tidak boleh berhenti dengan perubahan kecil yang ambigu.

Harus ada layar atau state penutup yang formal dan meyakinkan.

---

## 91. Appendix AM — Layar Formal untuk Alur Bernilai Tinggi

### 91.1 Setelah publish materi

```txt
┌───────────────────────────────────────────┐
│ ✅ Materi berhasil diterbitkan            │
│                                           │
│ Materi sekarang sudah tersedia untuk      │
│ siswa yang terhubung ke kursus ini.       │
│                                           │
│ [Lihat Materi] [Kembali ke Draft]         │
└───────────────────────────────────────────┘
```

### 91.2 Setelah approve quiz

```txt
┌───────────────────────────────────────────┐
│ ✅ Quiz siap dipakai                       │
│                                           │
│ Guru masih bisa kembali mengedit sebelum  │
│ diterbitkan ke siswa.                     │
│                                           │
│ [Lihat Quiz] [Terbitkan Sekarang]         │
└───────────────────────────────────────────┘
```

### 91.3 Setelah dokumen berhasil diproses

```txt
┌───────────────────────────────────────────┐
│ ✅ Dokumen berhasil diproses              │
│                                           │
│ Draft materi, quiz, dan soal sudah        │
│ siap untuk ditinjau.                      │
│                                           │
│ [Review Draft] [Upload Dokumen Lain]      │
└───────────────────────────────────────────┘
```

---

## 92. Appendix AN — Checklist UI/UX yang Wajib Dipindah ke TODO

Hal-hal berikut tidak boleh tinggal di `DESIGN.md` saja. Harus diterjemahkan ke tugas nyata.

- layar upload guru

- status proses dokumen

- review draft AI

- dashboard guru kosong

- dashboard siswa kosong

- role mismatch error

- layar ujian selesai

- skeleton loading untuk dashboard dan list utama

Jika ini belum ada di TODO, agent-agent di bawah akan mudah miss.
