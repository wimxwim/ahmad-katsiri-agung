# SUB-AGENT 1: Audit Frontend/UX
**Toolcalls:** 61 · **Durasi:** 10m 51s · **Model:** GPT 5.5
**Prompt:** Lakukan audit read-only terhadap frontend/UX/konten proyek /home/ngome/agensi/proyek/akal-center. Fokus pada src/app pages, src/components, content JSON, navigation, homepage, materi, evaluasi, game, diskusi/refleksi, dashboard guru. Cari gap kenyamanan user, missing states, copywriting, mobile UX, accessibility, SEO page-level, fitur kecil yang berdampak. Jangan edit file. Return temuan berbasis file path/line jika bisa, prioritas severity, dan rekomendasi 2026 khusus e-learning Indonesia. Thoroughness: very thorough.

---

## Ringkasan Eksekutif
Project sudah kuat secara visual dan konsisten dengan brand AKAL Center: desain premium, mobile-first cukup baik, konten PAI lengkap, materi/kuis/game/refleksi/diskusi sudah saling terhubung. Namun ada beberapa gap UX yang berdampak langsung pada siswa/guru:
1. Kuis punya beberapa bug UX/logika kritis: intro menampilkan 0 soal, jawaban terakhir berisiko tidak tersimpan, percobaan ulang tidak tersubmit ulang.
2. Navigasi tidak konsisten antara CMS, desktop, dan mobile: beberapa menu CMS tidak muncul karena hardcoded/sliced.
3. Banyak halaman/fitur masih berbasis mock/placeholder, terutama kursus dan dashboard guru.
4. Diskusi/refleksi publik berpotensi menampilkan data siswa tanpa kontrol moderasi/privasi yang jelas.
5. Accessibility form dan navigasi perlu ditingkatkan: filter button tanpa aria-pressed, beberapa input tanpa label eksplisit, bottom sheet tanpa role dialog/focus trap.
6. SEO page-level masih tipis untuk e-learning: metadata ada, tetapi belum cukup kaya untuk halaman dinamis/long-tail Indonesia, dynamic diskusi/kursus tidak punya metadata server-side.
7. Proxy/auth gate kemungkinan memblokir hampir semua halaman publik jika aktif, karena hanya /login, /masuk, /api, asset yang public.

---

## Temuan Prioritas

### Critical

**1. Kuis intro menampilkan jumlah soal 0**
- File: /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizEngine.tsx
- Line: 45, 105-107, 263, 270
- Bukti:
- shuffledSoal awalnya [].
- const totalSoal = shuffledSoal.length;
- Di state "intro", teks menggunakan {totalSoal} sebelum startQuiz() mengisi shuffledSoal.
- Dampak UX:
- Siswa melihat "Uji pemahamanmu dengan 0 soal pilihan ganda."
- Box statistik juga menampilkan 0 Total Soal.
- Menurunkan trust sebelum mulai kuis.
- Rekomendasi:
- Untuk state intro gunakan bab.soal.length, bukan shuffledSoal.length.
- Gunakan totalSoalAktif = quizState === "intro" ? bab.soal.length : shuffledSoal.length.

**2. Jawaban terakhir kuis berisiko tidak ikut tersimpan sebelum hasil dihitung/dikirim**
- File: /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizEngine.tsx
- Line: 183-194, 197-203, 209-213
- Bukti:
- handleNext() melakukan setJawaban(...), lalu langsung setQuizState("result").
- hitungSkor() membaca state jawaban.
- submitHasil() dipanggil via effect saat quizState === "result".
- Karena update state React async, jawaban soal terakhir bisa belum masuk saat skor dihitung/submitted.
- Dampak UX:
- Siswa merasa memilih benar, tetapi skor akhir bisa kurang 1.
- Guru mendapat rekap nilai yang salah.
- Ini fatal untuk evaluasi pembelajaran.
- Rekomendasi:
- Hitung jawaban final dalam variabel lokal sebelum setQuizState("result").
- Atau simpan jawaban terakhir dengan functional update lalu panggil perhitungan dari object final, bukan state lama.

**3. Percobaan ulang kuis tidak akan submit hasil lagi**
- File: /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizEngine.tsx
- Line: 51, 117-120, 163-175, 386-391, 466-471
- Bukti:
- submittedRef.current diset true saat submit pertama.
- startQuiz() reset jawaban, soal, index, timer, tapi tidak reset submittedRef.current.
- Dampak UX:
- Jika siswa mengulang kuis, hasil percobaan kedua tidak tercatat.
- Guru hanya melihat attempt pertama.
- Rekomendasi:
- Reset submittedRef.current = false di startQuiz().
- Untuk 2026 e-learning, sebaiknya simpan attempt ke-1, ke-2, best score, latest score.

**4. Proxy/auth gate kemungkinan membuat halaman publik tidak bisa diakses tanpa login**
- File: /home/ngome/agensi/proyek/akal-center/src/proxy.ts
- Line: 9-18, 23-41, 45-47
- Bukti:
- publicPaths hanya berisi /keystatic, /login, /masuk, /masuk-guru, /api/, /_next/, /images/, /pdf/.
- Matcher menangkap hampir semua path.
- Halaman seperti /, /materi, /game, /tentang, /quran tidak ada di publicPaths.
- Dampak UX/SEO:
- Jika proxy aktif di production, user baru dan Googlebot bisa diarahkan ke /login.
- SEO halaman publik bisa hilang.
- Homepage marketing menjadi tidak terbuka.
- Rekomendasi:
- Pisahkan halaman publik dan privat.
- Public: /, /materi, /materi/*, /evaluasi, /game, /video, /hafalan, /quran, /tentang, /diskusi jika memang publik.
- Private: /dashboard-guru, area khusus siswa, API sensitif.

### High

**5. Navigasi desktop mengambil CMS tetapi memotong item ke 8, sehingga menu CMS hilang diam-diam**
- File:
- /home/ngome/agensi/proyek/akal-center/src/components/layout/Navbar.tsx
- /home/ngome/agensi/proyek/akal-center/content/navigation/index.json
- Line:
- Navbar: 28-33
- Content nav: 2-39
- Bukti:
- CMS punya 9 navbar item: Beranda, Pendidik, Materi, Kuis, Video, Game, Hafalan, Diskusi, Qur'an.
- Navbar melakukan .slice(0, 8).
- Item ke-9 Qur'an tidak muncul di desktop.
- Dampak UX:
- Admin CMS merasa sudah menambah menu, tapi menu tidak muncul.
- Siswa desktop sulit menemukan Qur'an.
- Rekomendasi:
- Tambah overflow menu "Lainnya" untuk desktop.
- Atau filter berdasarkan priority/visibility dari CMS, bukan slice hardcoded.
- Tampilkan warning di CMS jika navbar > 8 item.

**6. Bottom tab mobile hardcoded dan tidak memakai content/navigation/index.json**
- File:
- /home/ngome/agensi/proyek/akal-center/src/components/layout/BottomTabBar.tsx
- /home/ngome/agensi/proyek/akal-center/content/navigation/index.json
- Line:
- BottomTabBar: 24-30, 63-68
- CMS bottomTabs: 40-76
- Bukti:
- CMS bottomTabs punya Beranda, Materi, Kuis, Refleksi, Game, Qur'an, Tentang.
- Component mobile hanya hardcode Beranda, Materi, Kuis, Game + sheet hardcode Kursus, Qur'an, Refleksi, Diskusi, Tentang.
- Dampak UX:
- CMS navigation tidak benar-benar mengontrol mobile.
- Hafalan dan Video tidak muncul di mobile sheet meskipun ada di footer/navbar.
- Rekomendasi:
- Gunakan CMS bottomTabs untuk mobile.
- Batasi 4 primary tabs + overflow otomatis dari item sisanya.
- Untuk siswa Indonesia, "Materi", "Kuis", "Game", "Refleksi" adalah tab utama yang lebih pedagogis daripada hanya "Game" sebagai featured permanen.

**7. /peserta-didik masih terasa portal placeholder/marketing, bukan dashboard siswa aktif**
- File: /home/ngome/agensi/proyek/akal-center/src/app/peserta-didik/page.tsx
- Line: 67-71, 133-169
- Bukti:
- "Dashboard Progress", "Badge & Pencapaian", "Forum Diskusi" ditampilkan sebagai SEGERA HADIR.
- Padahal Forum Diskusi sudah ada di /diskusi.
- Progress materi sudah ada via localStorage di /materi.
- Dampak UX:
- CTA homepage "GABUNG SEKARANG" mengarah ke halaman yang sebagian besar hanya daftar link.
- User berharap dashboard personal, tetapi mendapat katalog.
- Rekomendasi:
- Ganti "Forum Diskusi" dari coming soon menjadi link aktif ke /diskusi.
- Tarik progress localStorage dari aggung_progress dan tampilkan "Lanjutkan bab terakhir".
- Tambahkan CTA "Masuk sebagai siswa" jika belum login.
- Tambahkan "Rekomendasi belajar hari ini": Materi → Kuis → Refleksi.

**8. Dashboard guru menggunakan data mock tetapi tampil seperti data nyata**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/kursus/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/siswa/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/nilai/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/data/mock.ts
- Line:
- Dashboard overview: 6, 9-13, 56-95
- Kursus: 6, 19-23
- Siswa: 4, 9-11
- Nilai: 6, 13-16, 39-44
- Mock data: 8-80
- Dampak UX:
- Guru bisa mengira data siswa/nilai/kursus adalah real.
- Risiko keputusan pembelajaran salah.
- Rekomendasi:
- Tambahkan badge jelas: "Data contoh / demo" jika belum tersambung API.
- Untuk production, sembunyikan halaman mock dari guru non-admin atau ubah ke empty state nyata.
- Prioritas 2026: guru butuh "rekap nilai dari Google Sheets/API real" lebih daripada dashboard mock.

**9. "Buat Kursus Baru" memanggil API yang tidak tampak dalam daftar app route dan belum ada affordance kegagalan ramah**
- File: /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/buat/page.tsx
- Line: 25-35
- Bukti:
- Fetch ke /api/v1/kursus.
- Dari daftar file yang ditemukan, route /src/app/api/v1/kursus tidak terlihat.
- Dampak UX:
- Guru bisa mengisi form lalu gagal "Gagal membuat kursus".
- Tidak ada penjelasan apakah fitur belum aktif.
- Rekomendasi:
- Jika belum tersedia, ubah menjadi "Segera hadir" atau hubungkan ke workflow CMS.
- Tambahkan microcopy: "Fitur pembuatan kursus masih tahap demo; materi utama dikelola lewat CMS."

**10. Halaman kursus publik berbasis mock dan enrollment hanya simulasi client-side**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/kursus/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/kursus/[slug]/page.tsx
- Line:
- Kursus list: 6, 16-22, 71-111
- Detail: 7, 13-21, 144-175
- Bukti:
- Data dari mockKursus.
- handleEnroll() hanya timeout 800ms lalu setEnrolled(true).
- Dampak UX:
- User merasa sudah daftar, tapi status hilang saat reload.
- "Sertifikat digital" disebut di line 134, tetapi fitur tidak terlihat.
- Rekomendasi:
- Kalau belum real, posisikan sebagai "Katalog jalur belajar", bukan "Kursus" dengan enrollment.
- CTA "Mulai Belajar" langsung ke /materi?kelas=7 lebih jujur.
- Jika enrollment ingin dipertahankan, simpan minimal di localStorage dan jelaskan "tersimpan di perangkat ini".

**11. Diskusi dan refleksi publik berisiko menampilkan data siswa tanpa moderasi/privasi yang eksplisit**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/diskusi/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiForm.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiList.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiForm.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiHistori.tsx
- Line:
- Diskusi page: 27-35
- Diskusi form: 68-98
- Diskusi list: 70-97
- Refleksi form: 21-33, 82-133
- Refleksi histori: 82-121
- Dampak UX/privasi:
- Siswa SMP/MTs bisa menulis pengalaman pribadi atau data teman.
- Histori refleksi tampil publik.
- Tidak ada pengingat "jangan tulis nama lengkap/rahasia pribadi".
- Rekomendasi:
- Tambahkan safety microcopy sebelum submit:
- "Jangan tulis nama lengkap teman, alamat, nomor HP, atau masalah pribadi yang sensitif."
- "Tulisan akan terlihat oleh pengunjung lain setelah disetujui guru."
- Tambahkan status moderasi: pending/approved.
- Untuk e-learning Indonesia 2026, refleksi sebaiknya default privat ke guru, bukan feed publik.

**12. Halaman pendidik copywriting terlalu marketing/global dan kurang sesuai konteks guru PAI Indonesia**
- File: /home/ngome/agensi/proyek/akal-center/src/app/pendidik/page.tsx
- Line: 44-47, 55-56, 73-74, 139-143
- Contoh:
- "Platform futuristik... tanpa hambatan visual."
- "standar pendidikan global terkini."
- "Bergabunglah dengan ribuan pendidik..."
- Dampak UX:
- Untuk guru SMP/MTs Indonesia, copy terasa overclaim dan kurang spesifik.
- "Ribuan pendidik" kemungkinan tidak terbukti.
- Rekomendasi:
- Ubah tone menjadi konkret:
- "Unduh perangkat ajar, kelola soal, dan lihat rekap kuis siswa."
- "Dirancang untuk pembelajaran Akidah Akhlak SMP/MTs berbasis Kurikulum Merdeka."
- Hindari klaim besar tanpa bukti.
- Tambahkan CTA praktis: "Unduh PROTA/PROSEM/ATP", "Lihat Rekap Kuis", "Impor Soal".

### Medium

**13. Form "Ruang Doa" tidak punya label eksplisit untuk input dan textarea**
- File: /home/ngome/agensi/proyek/akal-center/src/components/beranda/RuangDoa.tsx
- Line: 92-111
- Bukti:
- Input dan textarea hanya mengandalkan placeholder.
- Dampak accessibility:
- Screen reader kurang jelas.
- Placeholder hilang saat user mengetik.
- Rekomendasi:
- Tambahkan <label htmlFor> atau aria-label.
- Contoh label: "Nama pengirim", "Isi doa atau ucapan".

**14. QuizLogin label tidak terhubung ke input karena tidak ada htmlFor/id**
- File: /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizLogin.tsx
- Line: 141-160
- Bukti:
- Label "Nama Lengkap" dan "Tanggal Lahir" tidak memakai htmlFor.
- Input tidak punya id.
- Dampak accessibility/mobile:
- Tap label tidak fokus input.
- Screen reader tidak mengasosiasikan label.
- Rekomendasi:
- Tambah id="quiz-nama" dan htmlFor="quiz-nama".
- Tambah id="quiz-tanggal-lahir".

**15. Tanggal lahir siswa menggunakan type="text", rawan format salah**
- File: /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizLogin.tsx
- Line: 152-160
- Dampak UX:
- Siswa bisa input 12/3/12, 12 Maret, typo nama bulan, dsb.
- Error "Data tidak ditemukan" bisa membingungkan.
- Rekomendasi:
- Gunakan type="date" jika backend mendukung format ISO.
- Jika tetap text, beri contoh format sangat jelas dan helper: "Format: DD MMMM YYYY, contoh 12 Maret 2012".
- Tambahkan normalisasi bulan Indonesia di API.

**16. Filter kelas di materi/evaluasi tidak punya aria-pressed**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/materi/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/evaluasi/page.tsx
- Line:
- Materi: 76-103
- Evaluasi: 138-165
- Dampak accessibility:
- Screen reader tidak tahu filter aktif.
- Rekomendasi:
- Tambahkan aria-pressed={filterKelas === k}.
- Gunakan role="tablist"/role="tab" jika ingin pola tab.

**17. Bottom sheet mobile belum memenuhi pola dialog aksesibel**
- File: /home/ngome/agensi/proyek/akal-center/src/components/layout/BottomTabBar.tsx
- Line: 72-169
- Bukti:
- Overlay/panel tidak punya role="dialog", aria-modal, aria-labelledby.
- Escape didukung, tetapi focus trap dan focus return belum terlihat.
- Dampak accessibility:
- Keyboard/screen reader user bisa "keluar" dari dialog.
- Rekomendasi:
- Tambahkan role="dialog" aria-modal="true".
- Fokuskan tombol close saat sheet dibuka.
- Return focus ke tombol "Lainnya" saat ditutup.

**18. Tombol close/logout/menu icon beberapa tidak punya aria-label**
- File:
- /home/ngome/agensi/proyek/akal-center/src/components/layout/Navbar.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/layout.tsx
- Line:
- Navbar logout: 95-108
- Dashboard close/menu: 51-56, 109-114
- Dampak:
- Tombol ✕ logout bisa ambigu untuk screen reader.
- Menu hamburger/close dashboard tidak punya label.
- Rekomendasi:
- Tambah aria-label="Keluar dari akun" pada logout.
- Tambah aria-label="Buka menu dashboard" dan aria-label="Tutup menu dashboard".

**19. Tabel dashboard guru belum punya caption/scope**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/siswa/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/pendidik/page.tsx
- Line:
- Siswa table: 35-56
- Rekap table: 467-510
- Dampak accessibility:
- Screen reader sulit memahami konteks tabel.
- Rekomendasi:
- Tambahkan <caption className="sr-only">Daftar siswa...</caption>.
- Tambahkan scope="col" pada <th>.

**20. Materi detail menampilkan tombol download walaupun file mungkin tidak tersedia**
- File: /home/ngome/agensi/proyek/akal-center/src/components/materi/MateriDetailClient.tsx
- Line: 234-248
- Bukti:
- Jika materi.pdfUrl tidak ada, fallback ke /pdf/${materi.slug}.pdf.
- Jika pptUrl tidak ada, fallback ke /pdf/${materi.slug}-ppt.pdf.
- Dampak UX:
- User bisa klik dan dapat 404.
- Guru/siswa kecewa saat modul/slide belum ada.
- Rekomendasi:
- Tampilkan tombol hanya jika file tersedia di CMS.
- Jika belum tersedia, tampilkan disabled state "Modul PDF segera tersedia".
- Tambahkan ukuran file dan tipe file: "PDF · 1.2 MB".

**21. Materi detail punya konten panjang tetapi belum ada daftar isi/jump link mobile**
- File: /home/ngome/agensi/proyek/akal-center/src/components/materi/MateriDetailClient.tsx
- Line: 113-123, 207-337
- Dampak UX:
- Siswa mobile harus scroll panjang.
- Sulit kembali ke dalil, poin pembelajaran, game terkait.
- Rekomendasi:
- Tambahkan sticky mini TOC di bawah hero:
- Ringkasan
- Dalil
- Poin Pembelajaran
- Kuis
- Game
- Tambahkan estimated reading progress bar.

**22. Materi kurang mengarahkan alur belajar lengkap**
- File: /home/ngome/agensi/proyek/akal-center/src/components/materi/MateriDetailClient.tsx
- Line: 160-168, 260-279, 309-335
- Dampak UX:
- Ada CTA hafalan/game/saran, tetapi tidak ada CTA "Kerjakan Kuis Bab Ini" jika soalUrl bukan kuis online.
- Rekomendasi:
- Setelah konten/dalil, tambahkan learning path:
1. Baca materi
2. Hafalkan dalil
3. Mainkan game
4. Kerjakan kuis
5. Tulis refleksi
- Link kuis bisa ke /evaluasi dengan preselect slug jika routing nanti mendukung.

**23. Game eksternal belum memberi peringatan akan membuka situs baru/Canva**
- File: /home/ngome/agensi/proyek/akal-center/src/app/game/page.tsx
- Line: 131-183
- Bukti:
- Semua game berupa <motion.a target="_blank">.
- Badge hanya "EKSTERNAL".
- Dampak UX:
- Siswa mobile mungkin bingung karena pindah tab/app.
- Canva site bisa berat di koneksi sekolah.
- Rekomendasi:
- Tambah microcopy: "Game dibuka di tab baru via Canva. Pastikan koneksi stabil."
- Tambah fallback: "Jika game tidak terbuka, coba refresh atau gunakan Chrome."
- Tambah durasi dan level kelas per game, bukan hanya ±10 menit.

**24. Game tidak punya filter kelas/topik**
- File: /home/ngome/agensi/proyek/akal-center/src/app/game/page.tsx
- Line: 96-184
- Dampak UX:
- 12 game tampil sekaligus.
- Siswa kelas 7 bisa membuka materi kelas 9.
- Rekomendasi:
- Tambah filter kelas 7/8/9 seperti materi dan evaluasi.
- CMS game JSON sebaiknya punya field kelas, bab, materiSlug.
- Tampilkan "Disarankan setelah membaca: materi terkait".

**25. Diskusi setelah submit tidak otomatis refresh list**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/diskusi/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiForm.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiList.tsx
- Line:
- Page: 33-39
- Form: 33-37
- List refresh manual: 50-52
- Dampak UX:
- User kirim diskusi, form sukses, tapi list belum tentu langsung memperlihatkan item baru.
- User harus menekan refresh manual.
- Rekomendasi:
- Angkat state ke parent atau kirim callback onSuccess untuk refetch.
- Atau gunakan optimistic insert.

**26. Balasan diskusi tidak otomatis muncul setelah submit**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/diskusi/[slug]/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/BalasForm.tsx
- Line:
- Detail: 38-54, 110, 123-147
- Form: 23-27
- Dampak UX:
- User mengirim balasan, sukses, tetapi balasan tidak langsung muncul.
- Rekomendasi:
- Tambah callback onSuccess.
- Optimistic append balasan.
- Atau refresh detail setelah submit.

**27. Refleksi setelah submit tidak otomatis refresh histori**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/refleksi/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiForm.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiHistori.tsx
- Line:
- Page: 33-39
- Form: 42-44
- Histori refresh manual: 52-62
- Dampak UX:
- Siswa mengirim refleksi tapi histori tidak langsung berubah.
- Rekomendasi:
- Sama seperti diskusi: parent state/callback onSuccess.
- Tambahkan "Refleksimu sedang menunggu moderasi" jika nantinya dimoderasi.

**28. Homepage CTA "GABUNG SEKARANG" mengarah ke portal siswa yang belum benar-benar join**
- File:
- /home/ngome/agensi/proyek/akal-center/src/components/beranda/DualCTACards.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/peserta-didik/page.tsx
- Line:
- CTA: 101-106
- Portal siswa: 73-172
- Dampak UX:
- "Gabung" biasanya berarti daftar/login/enroll.
- Tetapi halaman hanya kumpulan link dan coming soon.
- Rekomendasi:
- Ubah copy menjadi "Buka Portal Siswa" atau "Mulai Belajar".
- Jika ingin "Gabung", arahkan ke /masuk atau /register.

**29. Homepage "Materi Terpopuler" hardcoded dan copy tidak sesuai title materi**
- File: /home/ngome/agensi/proyek/akal-center/src/components/beranda/HeroSection.tsx
- Line: 76-91
- Bukti:
- Link ke /materi/amanah-dan-jujur.
- Teks: "Kejujuran dalam Digital".
- Dampak UX:
- User bisa merasa judul card dan halaman tujuan tidak sama.
- Rekomendasi:
- Ubah menjadi title asli "Amanah dan Jujur".
- Atau tambahkan subtitle: "Topik: Kejujuran dalam Dunia Digital".

**30. Ruang Doa menampilkan empty state dan error bersamaan jika fetch gagal**
- File: /home/ngome/agensi/proyek/akal-center/src/components/beranda/RuangDoa.tsx
- Line: 23-28, 123, 145-149
- Bukti:
- Jika fetch gagal, error diisi.
- doaList.length === 0 tetap menampilkan "Belum ada doa".
- Dampak UX:
- User melihat "Gagal memuat doa" dan "Belum ada doa" sekaligus.
- Rekomendasi:
- Empty state tampil hanya jika !error && doaList.length === 0.
- Tambah retry button "Coba muat ulang".

### Low / Polish

**31. Typo nama "Aggung" vs "Agung" tidak konsisten**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/layout.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizLogin.tsx
- /home/ngome/agensi/proyek/akal-center/src/data/mock.ts
- Line:
- Layout: 67-69
- QuizLogin: 87, 134
- Mock: 3
- Bukti:
- "Ahmad Katsiri Aggung" vs project context klien "Ahmad Katsiri Agung".
- Dampak:
- Profesionalitas dan SEO nama personal.
- Rekomendasi:
- Standarkan ke "Ahmad Katsiri Agung, S.Pd." jika memang itu ejaan benar.

**32. Penggunaan emoji dalam UI pendidikan perlu dikontrol untuk accessibility**
- File:
- /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizEngine.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiList.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiHistori.tsx
- Line:
- Quiz result: 217-220, 414
- Diskusi author: 94
- Refleksi labels: 102, 108, 114
- Dampak:
- Screen reader bisa membaca emoji secara verbose.
- Untuk siswa, masih ok, tapi perlu label yang jelas.
- Rekomendasi:
- Untuk emoji dekoratif, bungkus dengan aria-hidden.
- Jangan jadikan emoji satu-satunya pembeda status.

**33. Loading states masih generik "Memuat..."**
- File:
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiList.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiHistori.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/pendidik/page.tsx
- Line:
- Diskusi: 55-59
- Refleksi: 65-69
- Pendidik: 454-457
- Rekomendasi:
- Ganti menjadi kontekstual:
- "Memuat diskusi..."
- "Memuat histori refleksi..."
- "Memuat rekap kuis siswa..."
- Skeleton card lebih nyaman daripada spinner tunggal.

**34. Error states kurang actionable**
- File:
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiList.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiHistori.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizLogin.tsx
- Line:
- Diskusi: 62
- Refleksi: 72-74
- QuizLogin: 43-47, 163-165
- Dampak UX:
- User tahu gagal, tapi tidak tahu harus apa.
- Rekomendasi:
- Tambah retry button.
- Untuk siswa resmi: "Cek ejaan nama dan format tanggal lahir. Jika tetap gagal, pilih Mode Latihan atau hubungi guru."

**35. Sitemap memasukkan halaman yang mungkin seharusnya tidak di-index**
- File: /home/ngome/agensi/proyek/akal-center/src/app/sitemap.ts
- Line: 22-36
- Bukti:
- /refleksi, /diskusi, /peserta-didik, /pendidik masuk sitemap.
- Dampak SEO/privasi:
- Jika refleksi/diskusi berisi UGC siswa, perlu hati-hati.
- Jika halaman digated oleh proxy, sitemap mengarah ke halaman login.
- Rekomendasi:
- Index publik edukatif: homepage, materi, game, video, hafalan, quran, tentang.
- Pertimbangkan noindex untuk diskusi/refleksi jika konten UGC siswa.
- Dashboard dan halaman mock jangan masuk sitemap.

**36. Metadata halaman kursus/dashboard tidak ada karena page client tanpa layout metadata khusus**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/kursus/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/kursus/[slug]/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/layout.tsx
- Line:
- Kursus page starts as client: 1
- Detail starts as client: 1
- Dashboard layout starts as client: 1
- Dampak SEO:
- /kursus memakai default metadata root, kurang spesifik.
- Dynamic detail kursus tidak punya title/description unik.
- Rekomendasi:
- Tambahkan layout.tsx server untuk /kursus.
- Untuk /kursus/[slug], jika tetap perlu SEO, pindahkan data fetching ke server dan pakai generateMetadata.
- Dashboard guru sebaiknya noindex.

**37. Page-level metadata belum memakai OG image spesifik**
- File:
- /home/ngome/agensi/proyek/akal-center/src/app/materi/[slug]/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/game/layout.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/evaluasi/layout.tsx
- Line:
- Materi metadata: 20-35
- Game metadata: 3-8
- Dampak:
- Share WhatsApp/Telegram semua cenderung memakai default OG image.
- Rekomendasi:
- Materi detail: pakai image /images/materi/{slug}.png jika ada.
- Game: pakai collage game.
- Evaluasi: pakai OG "Kuis Akidah Akhlak Kelas 7-9".

---

## Rekomendasi 2026 Khusus E-learning Indonesia

**1. Tambahkan "Learning Path" yang jelas di setiap bab**
Untuk siswa SMP/MTs, alur ideal:
1. Baca ringkasan materi.
2. Pahami dalil.
3. Tonton video.
4. Mainkan game.
5. Kerjakan kuis.
6. Tulis refleksi.
7. Simpan progres.
Saat ini fitur ada, tetapi tersebar. Satukan menjadi "Langkah Belajar Bab Ini" di detail materi.
Prioritas file:
- /home/ngome/agensi/proyek/akal-center/src/components/materi/MateriDetailClient.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/materi/page.tsx

**2. Buat dashboard siswa ringan berbasis localStorage/session**
Tidak perlu database besar dulu. Untuk quick impact:
- "Lanjutkan materi terakhir"
- "Bab selesai"
- "Kuis terakhir"
- "Rekomendasi berikutnya"
- "Tulis refleksi hari ini"
Prioritas file:
- /home/ngome/agensi/proyek/akal-center/src/app/peserta-didik/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/materi/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizEngine.tsx

**3. Perbaiki kuis sebagai fitur inti**
Untuk e-learning Indonesia, kuis adalah fitur paling berdampak untuk guru. Prioritas:
- Fix 0 soal.
- Fix jawaban terakhir.
- Fix submit ulang.
- Tampilkan durasi jelas sebelum mulai.
- Tambahkan status penyimpanan:
- "Nilai sedang disimpan..."
- "Nilai berhasil tersimpan"
- "Nilai belum tersimpan, coba lagi"
- Tambahkan "Remedial": jika skor < 70, arahkan ke materi terkait.
Prioritas file:
- /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizEngine.tsx

**4. Jadikan refleksi privat/moderated**
Refleksi akhlak bisa sensitif. Rekomendasi:
- Default refleksi hanya terlihat oleh guru/admin.
- Jika ingin publik, tampilkan hanya anonymized dan approved.
- Tambahkan disclaimer ramah siswa:
- "Tulis dengan jujur, tapi jangan menulis rahasia pribadi atau nama teman."
Prioritas file:
- /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiForm.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiHistori.tsx

**5. Moderasi diskusi sebelum tampil**
Untuk SMP/MTs, forum publik perlu minimal:
- Status pending.
- Filter kata kasar.
- Warning jangan sebut nama teman.
- Guru bisa approve/hide.
Prioritas file:
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiForm.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiList.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/diskusi/[slug]/page.tsx

**6. Ubah copywriting menjadi lebih konkret dan rendah klaim**
Hindari:
- "futuristik"
- "standar global"
- "ribuan pendidik"
- "bank soal adaptif" jika belum adaptif
Gunakan:
- "Materi Akidah Akhlak SMP/MTs"
- "Kurikulum Merdeka"
- "Kuis otomatis tercatat"
- "Perangkat ajar siap unduh"
- "Belajar mandiri di HP"
Prioritas file:
- /home/ngome/agensi/proyek/akal-center/src/app/pendidik/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/beranda/DualCTACards.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/kursus/[slug]/page.tsx

**7. Optimalkan untuk HP kelas menengah dan koneksi sekolah**
Banyak siswa Indonesia akses dari HP Android + jaringan sekolah/rumah yang tidak stabil.
Rekomendasi:
- Tambah teks fallback saat game Canva lambat.
- Lazy load iframe video.
- Tampilkan ukuran file PDF/PPT.
- Skeleton loading untuk diskusi/refleksi.
- Hindari glass blur terlalu berat di mobile jika performa turun.
Prioritas file:
- /home/ngome/agensi/proyek/akal-center/src/app/game/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/components/materi/MateriDetailClient.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/globals.css

---

## Quick Wins Berdampak Besar

1. Fix kuis 0 soal.
- File: /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizEngine.tsx
- Effort: S
- Impact: sangat tinggi.

2. Reset submittedRef saat ulang kuis.
- File: /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizEngine.tsx
- Effort: S
- Impact: tinggi.

3. Tambahkan aria-pressed pada filter kelas.
- File: /home/ngome/agensi/proyek/akal-center/src/app/materi/page.tsx
- File: /home/ngome/agensi/proyek/akal-center/src/app/evaluasi/page.tsx
- Effort: S
- Impact: medium.

4. Ubah CTA "GABUNG SEKARANG" menjadi "Buka Portal Siswa" atau arahkan ke login.
- File: /home/ngome/agensi/proyek/akal-center/src/components/beranda/DualCTACards.tsx
- Effort: S
- Impact: medium-high.

5. Tambahkan disclaimer privasi di refleksi/diskusi.
- File: /home/ngome/agensi/proyek/akal-center/src/components/refleksi/RefleksiForm.tsx
- File: /home/ngome/agensi/proyek/akal-center/src/components/diskusi/DiskusiForm.tsx
- Effort: S
- Impact: high.

6. Tampilkan "Data demo" di dashboard guru mock.
- File: /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/page.tsx
- File: /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/kursus/page.tsx
- File: /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/siswa/page.tsx
- File: /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/nilai/page.tsx
- Effort: S
- Impact: high untuk trust guru.

7. Perbaiki typo "Aggung" menjadi "Agung".
- File: /home/ngome/agensi/proyek/akal-center/src/app/layout.tsx
- File: /home/ngome/agensi/proyek/akal-center/src/components/evaluasi/QuizLogin.tsx
- File: /home/ngome/agensi/proyek/akal-center/src/data/mock.ts
- Effort: S
- Impact: reputasi/SEO.

---

## Urutan Prioritas Eksekusi yang Disarankan

**Tahap 1 — Stabilkan fitur inti siswa**
1. Fix bug kuis: jumlah soal, jawaban terakhir, submit ulang.
2. Tambahkan status penyimpanan nilai.
3. Tambahkan "Remedial / Baca materi lagi" di hasil skor rendah.

**Tahap 2 — Benahi navigasi dan trust**
1. Sinkronkan navbar/bottom tabs dengan CMS.
2. Tambahkan overflow "Lainnya" desktop.
3. Perjelas halaman mock/demo.
4. Perbaiki CTA homepage.

**Tahap 3 — Privasi dan keamanan UX siswa**
1. Refleksi/diskusi: disclaimer data pribadi.
2. Moderasi/pending state.
3. Pertimbangkan noindex untuk UGC siswa.

**Tahap 4 — SEO dan aksesibilitas**
1. Metadata spesifik untuk kursus/game/evaluasi/materi.
2. OG image per materi.
3. Form label, aria-pressed, dialog role, table captions.
4. Review proxy public/private routes.

**Tahap 5 — E-learning experience 2026**
1. Learning path per bab.
2. Dashboard siswa ringan.
3. Filter game per kelas.
4. Progress + badges lokal.
5. Rekomendasi belajar berikutnya.

---

> *Dokumen ini adalah salinan verbatim dari output sub-agent GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli.*
