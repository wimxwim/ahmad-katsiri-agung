# TODO V2 Multi-Guru

Status: draft eksekusi awal
Basis: keputusan user + audit codebase nyata + environment terverifikasi parsial

## Aturan Dasar

- ORM final: `Drizzle`
- Hosting fase sekarang: `Vercel`
- Data teks: `Supabase`
- File/media/PDF: `ImageKit`
- Keystatic: `dibekukan untuk fitur baru`
- Payment online: `ditunda`, pakai WA manual
- AI prioritas: `generator PDF/DOCX -> materi + quiz + soal`
- Live lama boleh diganti total, tidak perlu dipertahankan UX lama

## Blocker Sebelum Implementasi Penuh

- [ ] Isi password asli untuk `DATABASE_URL` Supabase pooler
- [x] Ganti `AI_API_KEY` / `NARAROUTER_API_KEY` dengan key valid prefix `sk-nry-` (sudah valid di `.env.local`)
- [x] Putuskan route callback Google final: `/api/v1/auth/callback/google`

## Gelombang 1 — Arsitektur Ulang Auth & Routing

- [x] Hapus konsep login campuran lama (`/login`, `/masuk`, `/masuk-guru` saling tumpang tindih)
- [x] Tetapkan satu entry publik auth: `/masuk`
- [x] Tetapkan satu entry register publik: `/daftar`
- [x] Buat intent selector yang jelas: `Guru` / `Siswa`
- [x] Pastikan intent selector hanya memengaruhi UX, bukan sumber kebenaran role
- [x] Pastikan backend memvalidasi role akhir user dari DB
- [x] Jika user login dari portal guru tapi role siswa, tampilkan error intent mismatch
- [x] Jangan redirect user lintas portal secara diam-diam
- [x] Tentukan redirect final per role
- [x] Owner -> `/owner`
- [x] Admin sekolah -> `/admin-sekolah`
- [x] Guru -> `/guru`
- [x] Asisten guru -> `/guru`
- [x] Siswa -> `/siswa`
- [x] Orang tua -> `/orang-tua`
- [x] Refactor middleware supaya mendukung semua role final
- [x] Audit semua route dashboard lama (legacy `/dashboard-guru` & `/dashboard-siswa` di-redirect 308 ke role-home)

## Gelombang 2 — Landing Page Baru Total

- [x] Ganti landing page lama yang masih berorientasi single-guru PAI statis
- [x] Hero baru fokus SaaS multi-guru
- [x] CTA utama: `Coba Gratis`
- [x] CTA sekunder: `Lihat Demo` (link ke `/materi`)
- [x] Section value untuk guru
- [x] Section value untuk siswa
- [x] Section value untuk sekolah
- [x] Section killer feature AI generator dokumen
- [x] Section alur kerja: upload -> generate -> review -> publish -> analisis (5 step)
- [x] Section trust/security
- [x] Section pricing manual / CTA WA
- [x] Section FAQ produk baru (3 FAQ ringkas di pricing card + 5 FAQ lengkap)
- [x] Section footer baru (footer di layout tetap dipakai)
- [x] Hapus bahasa visual/teks yang terlalu mengikat ke Bang Agung sebagai satu-satunya guru
- [x] Pertahankan design language premium hijau-gold yang sudah ada

## Gelombang 3 — Freeze Keystatic & Bridge Konten Lama

- [x] Bekukan semua fitur baru agar tidak menulis ke `content/*`
- [x] Pertahankan pembacaan konten legacy dari Keystatic sebagai read-only
- [x] Tandai route `api/keystatic` sebagai legacy only (sudah di SKIP_CSRF_PATHS, hanya untuk akses admin)
- [x] Audit `src/lib/cms-config.ts` (tambah `CMS_LEGACY_READONLY` + docblock warning)
- [x] Audit `src/lib/cms-data.ts` (tambah docblock warning)
- [x] Audit `src/lib/cms.ts` (tambah docblock warning)
- [x] Audit `src/app/api/assets/[...path]/route.ts` (tambah docblock legacy)
- [x] Pastikan konten lama tetap bisa tampil selama transisi
- [x] Tambahkan penanda internal `CMS_LEGACY_READONLY`

## Gelombang 4 — Auth Baru (Email/Password + Google)

- [x] Adaptasi pola callback dari project `gotong-royong-pwa` (pakai `googleapis` OAuth2 + cookie state)
- [x] Buat route callback Google final di AKAL Center (`/api/v1/auth/callback/google`)
- [x] Buat helper server client untuk auth flow (pakai `pg`/Drizzle langsung + `googleapis` OAuth; tidak menambah dep baru)
- [x] Tentukan linkage Google identity ke tabel `users` (kolom `google_id` di migration 0004)
- [x] Buat login email/password final (`/api/v1/auth/login` + audit log + intent validation)
- [x] Buat login Google final (`/api/v1/auth/google` start + `/api/v1/auth/callback/google`)
- [x] Buat register guru (role GURU via `/api/v1/auth/register` dengan `role: GURU`, validasi intent portal)
- [x] Buat register siswa (sudah ada, ditambah audit + validasi intent portal)
- [x] Buat set-password flow setelah Google signup (`/api/v1/auth/set-password`)
- [x] Buat intent mismatch error handling (sudah ada di login + Google callback, 403 dengan pesan eksplisit)
- [x] Buat logout final yang konsisten (`/api/v1/auth/logout` + `lib/logout.ts` pakai endpoint baru, audit log)
- [x] Tambahkan audit log auth minimal (`lib/auth-audit.ts` + tulis ke `event_store` dengan hash chain)
- [x] Tambahkan rate limit auth ketat (5/15s login, 3/60s register, 10/60s google, 5/60s set-password, 30/60s logout)

## Gelombang 5 — Workspace Guru Multi-Tenant

- [x] Buat halaman `/guru` (sudah ada dari Gel.1 dengan sidebar + ringkasan)
- [x] Buat halaman `/guru/kursus` (sudah ada, query sudah disempitkan ke `guruId`)
- [x] Buat halaman `/guru/kelas` (CRUD lengkap dengan edit & soft-delete)
- [x] Buat halaman `/guru/siswa` (DB-murni via `/api/v1/guru/siswa`)
- [x] Buat halaman `/guru/upload` (UI drag-drop PDF/DOCX dengan validasi klien + Riwayat Upload + Progress bar + state extraction)
- [x] Buat halaman `/guru/drafts` + detail review `/guru/drafts/[id]` (tab interaktif + approve per output + edit form + regenerate per output)
- [x] Buat halaman `/guru/analytics` (statcards + 4-minggu trend dari event_store)
- [x] Refactor query `kursus` agar selalu scope ke `guruId` (`/api/v1/kursus` GET + `/api/v1/kursus/[id]` cek ownership)
- [x] Refactor daftar siswa guru dari DB murni (sudah dari Gel.1; tidak ada fallback legacy)
- [x] Tambahkan CSV import siswa (`/api/v1/guru/siswa/import` — bulk insert + auto-create kelas + relasi)
- [x] Tambahkan CRUD kelas (`/api/v1/guru/kelas` GET/POST + `/[id]` PATCH/DELETE + soft delete)
- [x] Tambahkan CRUD kursus (POST sudah ada; kursus adalah proxy untuk "kelas" di MVP)
- [x] Tambahkan relasi siswa-kursus/kelas (tabel `siswa_kelas` migration 0005)
- [x] Tambahkan halaman onboarding guru pertama kali (`/guru/onboarding` dengan localStorage progress tracking)
- [x] Tambahkan halaman profil guru/workspace settings (`/profil` dengan info akun + metode masuk + set-password inline)
- [x] Tambahkan status publish untuk kursus dan materi (`statusPublikasi` enum `DRAFT|PUBLIK|ARSIP` migration 0008 + `PATCH /api/v1/kursus/[id]/publish`)
- [x] Tambahkan daftar draft AI yang terfilter per guru (`/api/v1/guru/drafts` GET scope `guruId`)
- [x] Tambahkan daftar upload dokumen per guru (`/api/v1/guru/uploads` GET + section Riwayat Upload di `/guru/upload`)
- [x] Tambahkan status processing dokumen di workspace guru (`file_materi.status` + `ai_generation.status` 8 enum)
- [x] Tambahkan guard agar guru hanya melihat aset, draft, dan analytics miliknya (semua query scope `guruId` + middleware role check)

## Gelombang 5A — Role Home Tambahan

- [x] Buat halaman `/owner` (placeholder dengan 3 kartu: Sekolah, Pengguna, AI Cost)
- [x] Buat halaman `/admin-sekolah` (placeholder dengan 3 kartu: Daftar Guru, Laporan, Kuota AI)
- [x] Buat halaman `/orang-tua` (placeholder dengan 3 kartu: Progres Anak, Hasil Kuis, Pengumuman)
- [x] Pastikan role `OWNER` tidak nyasar ke dashboard guru biasa tanpa konteks (middleware `/owner` hanya `owner`)
- [x] Pastikan role `ADMIN_SEKOLAH` punya landing page sendiri walau fiturnya masih minimal (middleware `/admin-sekolah` `owner|admin_sekolah`)
- [x] Pastikan role `ORANG_TUA` tidak punya akses edit apa pun (middleware `/orang-tua` hanya `orang_tua` + tidak ada endpoint edit)

## Gelombang 6 — Storage Baru via ImageKit

- [x] Buat `ImageKitAdapter` (REST API langsung, signed upload HMAC-SHA1, no SDK dep)
- [x] Refactor `StorageFactory` yang sekarang fallback dummy (ImageKit primary, LocalAdapter fallback)
- [x] Upload PDF ke ImageKit (`/api/v1/guru/uploads` pakai folder `/akal/dokumen/guru-{id}`)
- [x] Upload DOCX ke ImageKit (sama route, magic bytes check)
- [x] Upload gambar materi ke ImageKit (adapter support semua tipe)
- [x] Upload gambar soal ke ImageKit (sama)
- [x] Simpan metadata file ke DB (`file_materi` + `imagekitFileId` + `kursusId` + `status` + `extractionText`)
- [x] Validasi MIME upload (whitelist `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- [x] Validasi magic bytes (PDF `%PDF`, DOC `D0CF11E0`, DOCX `PK..`)
- [x] Validasi ukuran file (10MB)
- [x] Audit keamanan upload (folder naming per guru, dual-check ext vs magic bytes, no executable archive)
- [x] Tambahkan struktur folder ImageKit per guru/per kursus/per tipe file
- [x] Tambahkan metadata original filename, mime, size, owner, source document
- [x] Tambahkan preview/download URL strategy untuk PDF (ImageKit URL langsung)
- [x] Tambahkan fallback behavior jika upload gagal (ImageKit adapter throw → 500 dengan pesan)

## Gelombang 7 — AI Generator Dokumen

- [x] Buat tabel upload dokumen (`file_materi` refactored)
- [x] Buat tabel extraction result (`file_materi.extractionText` + `status` enum)
- [x] Buat tabel generation jobs (`ai_generation` migration 0007)
- [x] Buat tabel generated materi (`ai_generation.materiJudul` + `materiKonten`)
- [x] Buat tabel generated quiz (`ai_generation.quizJudul` + `quizSoal` JSON)
- [x] Buat tabel generated soal (`ai_generation.soalItems` JSON)
- [x] Upload -> extract text pipeline (`lib/text-extractor.ts`)
- [x] Parse PDF text pipeline (`extractPdfText` — pdf-parse v2 API)
- [x] Parse DOCX text pipeline (`extractDocxText` — JSZip + XML)
- [x] Draft materi generation (3 prompt paralel via NaraRouter)
- [x] Draft quiz generation (5 soal PG)
- [x] Draft soal generation (5 soal campuran)
- [x] Review-before-publish oleh guru (`/guru/drafts/[id]` + `approve` endpoint)
- [x] Retry generation flow (`regenerate` endpoint download dari ImageKit lalu re-run)
- [x] Error handling generation flow (status `failed` + `errorMessage`)
- [x] Logging token/cost per job (`tokenInput` + `tokenOutput` + `modelName`)
- [x] Rate limiting AI per guru (3/60s generate, 2/60s regenerate)
- [x] Retry generation flow (`regenerate` endpoint download dari ImageKit lalu re-run + `regenerate-materi` khusus materi)
- [x] Error handling generation flow (status `failed` + `errorMessage` + `GenerationSchemaError` + `GenerationTimeoutError`)
- [x] Logging token/cost per job (`tokenInput` + `tokenOutput` + `modelName`)
- [x] Rate limiting AI per guru (3/60s generate, 2/60s regenerate + per-user rate limit `checkRateLimitPerUser` 20/60s)
- [x] Tambahkan queue/status detail: 8 state enum (`queued|extracting|extracted|generating|ready|approved|rejected|failed`) + per-output `ai_output_status` enum
- [x] Tambahkan sanitasi hasil AI sebelum disimpan (`lib/ai-sanitizer.ts` — `cleanText` strip HTML/script/javascript:/on-event/HTML entity + control char)
- [x] Tambahkan validasi struktur JSON output AI sebelum masuk DB (`parseMateriSafe`/`parseQuizSafe`/`parseSoalSafe` dengan zod schema)
- [ ] Tambahkan prompt versioning untuk generator (saat ini hardcoded; dipercepat di Gel.14)
- [x] Tambahkan audit trail approve/reject draft oleh guru (`gen.materi_approved`/`gen.materi_rejected`/`gen.quiz_approved`/`gen.soal_approved`/`gen.review_closed` di `event_store`)

## Gelombang 8 — Dashboard Siswa Baru

- [x] Buat halaman `/siswa` (beranda dengan continue-learning card + feed materi + pengumuman + skeleton + empty state)
- [x] Buat halaman `/siswa/materi` (listing materi dengan progress bar + skeleton + empty state)
- [x] Buat halaman `/siswa/quiz` (daftar kuis dengan status attempt + skeleton + empty state)
- [x] Buat halaman `/siswa/cbt` (timer, submit, result screen formal + skeleton + error state)
- [x] Buat halaman `/siswa/progres` (riwayat attempt + statcards + skeleton + empty state)
- [x] Buat halaman `/siswa/pengumuman` (card pengumuman + pin + skeleton + empty state)
- [x] Pastikan siswa hanya lihat data miliknya (enrollment check di materi/quiz/cbt API routes)
- [x] Pastikan siswa tidak bisa masuk ke alur guru (middleware guard per role prefix)
- [x] Tambahkan empty state jika guru belum publish materi (sudah di semua halaman siswa)
- [x] Tambahkan continue-learning card di beranda siswa (feed API mengembalikan continueLearning item)
- [x] Tambahkan riwayat quiz/attempt siswa (progres page menampilkan attempt history)
- [x] Tambahkan indikator progres sederhana yang mudah dipahami siswa (progress bar di materi + feed)
- [x] Tambahkan CTA jelas untuk mulai belajar vs lanjut belajar (link ke materi di feed card)

## Gelombang 8A — Mode Evaluasi

- [x] Pisahkan mode `BELAJAR`, `ULANGAN`, dan `CBT` di data model (`modeEvaluasiEnum` + field di quizPublished + quizAttempt)
- [~] Pastikan tampilan siswa berbeda untuk masing-masing mode (CBT hidden score via `tampilkanNilai`, sisanya belum optimal)
- [~] Pastikan guru bisa menentukan mode evaluasi saat publish quiz (enum ada di DB, tapi UI publish belum ada selector)
- [x] Siapkan route CBT tanpa memaksa offline-resilient penuh di fase pertama (halaman CBT dengan timer + submit end-to-end)
- [x] Buat layar `ujian selesai` yang formal dan tidak ambigu (halaman result dengan attemptId, nilai, jumlah benar/salah/waktu)
- [x] Tampilkan mata pelajaran, kelas, waktu pengerjaan, dan jumlah soal dijawab di layar selesai ujian (result screen menampilkan semua)
- [x] Tampilkan pesan `nilai diumumkan oleh guru` untuk mode ujian yang tidak boleh auto-show score (`tampilkanNilai` logic sudah di-fix)
- [~] Tampilkan instruksi `tunggu konfirmasi guru` jika konteks ujian sekolah memerlukannya (belum ada string eksplisit di UI, hanya hidden score)

## Gelombang 9 — Legacy Bridge

- [x] Pertahankan Google Sheets bridge sementara
- [x] Tandai `google-sheets.ts` sebagai legacy only
- [x] Putuskan endpoint mana yang tetap hidup sementara
- [ ] Tambahkan utility migrasi dari Sheets ke Supabase bila dibutuhkan (ditunda: belum ada kebutuhan mendesak, data Sheets kecil, migrasi manual saat cutover lebih aman)
- [x] Jangan hapus legacy sebelum flow baru stabil
- [x] Tambahkan peta migrasi field dari Google Sheets ke tabel Supabase baru (`prd/LEGACY-MIGRATION-MAP.md`)
- [ ] Tambahkan parallel write hanya pada flow yang benar-benar masih dipakai live (ditunda: flow baru belum 100% stabil, premature untuk menambah kompleksitas)
- [x] Tambahkan cutover checklist untuk mematikan Sheets per fitur satu per satu (di `prd/LEGACY-MIGRATION-MAP.md`)

## Gelombang 10 — Hardening Minimum

- [x] Audit semua route auth — ✅ Lolos: semua route punya role check + intent validation
- [x] Audit semua route upload — ✅ Lolos: magic bytes, MIME, size, ownership, rate limit
- [x] Audit semua route AI — ✅ Lolos: selalu draft, sanitasi Zod + cleanText, tidak ada auto-publish
- [x] Pastikan tidak ada file upload yang dieksekusi — ✅ Diverifikasi: no exec/spawn/eval pada file content
- [x] Pastikan AI hanya menerima teks ekstraksi, bukan file binary mentah — ✅ Diverifikasi: text-extractor memisahkan teks, hanya teks yang dikirim ke LLM
- [x] Pastikan hasil AI selalu draft, bukan auto-publish — ✅ Diverifikasi: `ai-generator.ts` simpan status `ready` + `draft`, publish hanya via `close-review` setelah approve manual
- [x] Pastikan role check konsisten di middleware + API — ✅ Dibuat `src/lib/route-guard.ts` (requireSession/requireRole/requireGuru/requireSiswa) untuk standardisasi pola
- [~] Tes login guru salah role — 🔲 Skenario terdokumentasi di `scripts/test-gelombang-10.sh`, jalan saat app hidup
- [~] Tes login siswa dari portal guru — 🔲 Sama
- [~] Tes login Google — 🔲 Sama
- [~] Tes upload PDF — 🔲 Sama
- [~] Tes upload DOCX — 🔲 Sama
- [~] Tes generate materi — 🔲 Sama
- [~] Tes generate quiz — 🔲 Sama
- [~] Tes generate soal — 🔲 Sama
- [~] Tes portal intent mismatch untuk Google login — 🔲 Sama
- [~] Tes user guru login dari HP/laptop lain — 🔲 Sama (melekat ke JWT, bukan device)
- [~] Tes role redirect final untuk `OWNER`, `ADMIN_SEKOLAH`, `ORANG_TUA` — 🔲 Ada di test script
- [x] Tambahkan health check untuk Supabase/ImageKit/AI endpoint — ✅ `/api/health` diperbarui: cek Postgres, Redis, Supabase, ImageKit, AI + latency per service
- [x] Tambahkan logging dasar untuk generation jobs dan upload jobs — ✅ `src/lib/job-logger.ts` (logJob/logError dengan jobType/jobId/userId/duration)
- [x] Tambahkan alerting minimum untuk job gagal berturut-turut — ✅ Logger deteksi 3x consecutive failure → console.error ALERT

## Gelombang 10A — Observability & Operasional Ringan

- [x] Tambahkan halaman atau endpoint health untuk service inti — ✅ `/api/health` diperbarui (Postgres, Redis, Supabase, ImageKit, AI)
- [x] Tambahkan log context dasar: userId, role, route, jobId — ✅ `src/lib/job-logger.ts` (jobType, jobId, userId, durationMs, error)
- [ ] Tambahkan panel admin ringan untuk melihat upload gagal dan generation gagal — 🔲 Ditunda (butuh UI)
- [ ] Tambahkan dokumentasi env final setelah semua integrasi stabil — 🔲 Ditunda (semua sudah di .env.local, tinggal dirapikan jadi .env.example final)

## Gelombang 11 — Frontend Rebuild yang Lebih Dalam

- [ ] Audit semua komponen beranda lama dan klasifikasikan: hapus, refactor, atau simpan sebagai legacy
- [ ] Ganti struktur public navbar agar cocok dengan SaaS platform baru
- [ ] Tambahkan halaman `/fitur`
- [ ] Tambahkan halaman `/harga`
- [ ] Refactor halaman `/tentang` agar tidak hanya terasa profil single-guru
- [ ] Hapus CTA publik yang masih mengarahkan ke alur lama yang kabur
- [ ] Tambahkan copy deck publik baru berdasarkan `DESIGN.md`
- [ ] Tambahkan FAQ section yang konsisten di halaman publik
- [ ] Tambahkan trust/security section yang benar-benar menjelaskan draft AI dan role separation
- [ ] Tambahkan section workflow document-to-learning yang visualnya jelas
- [ ] Tambahkan empty state visual untuk semua dashboard baru
- [ ] Tambahkan loading skeleton untuk route guru utama
- [ ] Tambahkan loading skeleton untuk route siswa utama
- [ ] Tambahkan responsive audit khusus tablet
- [ ] Tambahkan audit spacing mobile-first pada auth, dashboard guru, dashboard siswa
- [ ] Ganti pola loading berat: utamakan `skeleton > spinner > konten`
- [ ] Buat skeleton block untuk dashboard guru overview
- [ ] Buat skeleton block untuk dashboard siswa overview
- [ ] Buat skeleton block untuk daftar kursus guru
- [ ] Buat skeleton block untuk daftar draft AI
- [ ] Buat skeleton block untuk upload history guru
- [ ] Buat skeleton block untuk materi siswa
- [ ] Terapkan progressive reveal pada card yang punya gambar/thumbnail
- [ ] Pastikan summary cards bisa muncul lebih dulu daripada list panjang
- [ ] Tambahkan screen contract implementation untuk upload dokumen guru
- [ ] Tambahkan screen contract implementation untuk review draft AI
- [ ] Tambahkan screen contract implementation untuk dashboard guru kosong pertama kali
- [ ] Tambahkan screen contract implementation untuk dashboard siswa kosong pertama kali
- [ ] Tambahkan screen contract implementation untuk role mismatch error
- [ ] Tambahkan screen contract implementation untuk status proses dokumen

## Gelombang 12 — Auth UX Completion

- [ ] Tambahkan tombol Google login pada `/masuk` untuk portal siswa
- [ ] Tambahkan tombol Google login pada `/masuk` untuk portal guru
- [ ] Tambahkan CTA register guru langsung dari portal guru
- [ ] Tambahkan CTA register siswa langsung dari portal siswa
- [ ] Tambahkan halaman sukses setelah set-password bila perlu
- [ ] Tambahkan pesan error spesifik untuk akun tanpa password yang harus lanjut via Google
- [ ] Tambahkan fallback jika callback Google gagal
- [ ] Tambahkan state “akun ini terhubung ke Google” di profil user jika relevan
- [ ] Tambahkan audit ulang intent mismatch untuk semua kombinasi role

## Gelombang 13 — Route Migration Legacy ke Route Baru

- [ ] Buat route `/guru` sebagai home guru utama
- [ ] Buat route `/siswa` sebagai home siswa utama
- [ ] Putuskan apakah `/dashboard-guru` menjadi redirect permanen atau hanya bridge sementara
- [ ] Putuskan apakah `/dashboard-siswa` menjadi redirect permanen atau hanya bridge sementara
- [ ] Putuskan nasib `/pendidik`
- [ ] Putuskan nasib `/peserta-didik`
- [ ] Tambahkan peta route lama -> route baru di dokumentasi internal

## Gelombang 14 — Data Model Completion

- [ ] Tambahkan tabel `kelas` yang eksplisit jika diperlukan secara final
- [ ] Tambahkan relasi `murid_kelas` / model penghubung setara bila belum final di schema
- [ ] Tambahkan tabel draft AI yang membedakan draft materi, quiz, soal
- [ ] Tambahkan tabel generation attempts / retry history
- [ ] Tambahkan tabel upload source documents
- [ ] Tambahkan tabel prompt/version metadata untuk AI jobs
- [ ] Tambahkan status enum formal untuk publish lifecycle
- [ ] Tambahkan index untuk query dashboard guru yang akan sering dipakai

## Gelombang 15 — Security & Abuse Cases yang Sering Dilupakan

- [ ] Validasi file DOCX terhadap zip bomb / ukuran tak wajar
- [ ] Validasi file PDF terhadap ukuran halaman / text extraction runaway
- [ ] Batasi jumlah upload per guru per periode waktu
- [ ] Batasi jumlah generation job concurrent per guru
- [ ] Tambahkan timeout aman untuk extraction dan generation
- [ ] Pastikan user tidak bisa membaca draft milik guru lain
- [ ] Pastikan user tidak bisa menebak URL asset privat yang belum boleh diakses
- [ ] Pastikan generated content tidak menyisipkan HTML/JS berbahaya saat dirender
- [ ] Tambahkan sanitasi untuk rich text jika nanti dipakai

## Gelombang 16 — Guru Workflow Polishing

- [ ] Tambahkan dashboard “apa yang harus saya lakukan sekarang” untuk guru
- [ ] Tambahkan status badge pada kursus: draft/publik/arsip
- [ ] Tambahkan quick action: upload dokumen, review draft, buat kuis, undang siswa
- [ ] Tambahkan card “siswa belum mengerjakan”
- [ ] Tambahkan card “topik paling lemah”
- [ ] Tambahkan card “draft AI menunggu tinjauan”
- [ ] Tambahkan search dan filter pada daftar siswa guru
- [ ] Tambahkan search dan filter pada daftar draft AI guru
- [ ] Tambahkan search dan filter pada daftar kursus guru
- [ ] Tambahkan closure state setelah upload berhasil diproses
- [ ] Tambahkan closure state setelah materi dipublish
- [ ] Tambahkan closure state setelah quiz diapprove atau diterbitkan

## Gelombang 17 — Student Workflow Polishing

- [ ] Tambahkan continue card berdasarkan materi terakhir dibuka
- [ ] Tambahkan section “hari ini” untuk siswa
- [ ] Tambahkan section quiz berikutnya
- [ ] Tambahkan riwayat hasil quiz yang mudah dibaca
- [ ] Tambahkan badge progress yang tidak kekanak-kanakan
- [ ] Tambahkan pengumuman guru dalam bentuk card yang jelas
- [ ] Tambahkan fallback jika siswa belum tergabung kelas/kursus mana pun

## Gelombang 18 — Analytics & Remedial UX

- [ ] Buat summary analytics yang bicara bahasa guru, bukan bahasa statistik mentah
- [ ] Tambahkan visual weak topic yang mudah dipahami
- [ ] Tambahkan remedial recommendation card
- [ ] Tambahkan CTA “kirim remedial” atau “tinjau rekomendasi”
- [ ] Tambahkan halaman detail progres per siswa
- [ ] Tambahkan halaman detail progres per kursus
- [ ] Simpan TRI untuk owner/internal, tapi jangan ekspos ke guru dulu

## Gelombang 19 — Content & Legacy Content Governance

- [ ] Tag konten lama mana yang tetap publik
- [ ] Tag konten lama mana yang menjadi referensi internal saja
- [ ] Tentukan apakah materi legacy tetap muncul di public route atau dipindah ke mode arsip
- [ ] Pastikan konten DB-driven baru bisa coexist dengan legacy tanpa membingungkan siswa
- [ ] Tambahkan label visual untuk konten `legacy` vs `baru` bila perlu saat transisi internal

## Gelombang 20 — Dokumentasi untuk Agent Bawahan

- [ ] Pecah TODO ini per gelombang menjadi file turunan jika agent bawahan mulai banyak
- [ ] Buat checklist eksekusi per gelombang
- [ ] Buat daftar file mana yang boleh disentuh per gelombang
- [ ] Buat daftar file mana yang tidak boleh disentuh tanpa approval
- [ ] Tambahkan acceptance criteria ringkas per gelombang

## Gelombang 21 — Screen-by-Screen Acceptance Criteria

- [ ] Buat acceptance criteria untuk landing page hero
- [ ] Buat acceptance criteria untuk landing page workflow section
- [ ] Buat acceptance criteria untuk halaman masuk
- [ ] Buat acceptance criteria untuk halaman daftar
- [ ] Buat acceptance criteria untuk halaman upload dokumen guru
- [ ] Buat acceptance criteria untuk halaman review draft AI
- [ ] Buat acceptance criteria untuk dashboard guru kosong
- [ ] Buat acceptance criteria untuk dashboard siswa kosong
- [ ] Buat acceptance criteria untuk halaman ujian selesai

## Gelombang 22 — Loading & State Visibility

- [ ] Pastikan semua layar bernilai tinggi punya state `idle`, `loading`, `success`, `error`
- [ ] Pastikan upload flow punya state visual lengkap
- [ ] Pastikan AI generation flow punya state visual lengkap
- [ ] Pastikan publish flow punya state visual lengkap
- [ ] Pastikan siswa tahu kapan data quiz sudah terkirim dan kapan masih diproses

## Hasil yang Ditargetkan

- Landing page baru total
- Auth baru total
- Dashboard guru baru total
- Dashboard siswa baru total
- Multi-guru siap pilot
- AI generator dokumen hidup
- Keystatic tidak dipakai untuk fitur baru
- Live lama tidak lagi menjadi acuan UX utama
