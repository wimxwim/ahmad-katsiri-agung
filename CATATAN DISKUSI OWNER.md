CATATAN DISKUSI OWNER DAN SEMUA AGENT

---

## RINGKASAN DISKUSI MODEL BISNIS & EKOSISTEM AKAL CENTER
**Tanggal diskusi:** 10 Juli 2026
**Konteks:** Owner sudah punya 80 guru + 2.000 siswa PAI menunggu (basis dari repo lama `ahmad-katsiri-agung`, 27 sesi pengerjaan, LIVE). Payment sudah di-fix manual (WA/rekening pribadi owner, solo founder, belum pakai payment gateway). Sekarang siap-siap "meledak" — butuh persiapan sistem matang SEBELUM lonjakan user datang.

---

## 1. KEPUTUSAN INTI YANG SUDAH DISEPAKATI

### A. Guru & siswa GRATIS SELAMANYA — dibatasi KAPASITAS, bukan WAKTU
- Jangan pakai trial 14 hari / 3 bulan lalu dikunci — itu terasa "dijebak" (riset HBR "Making Freemium Work").
- Batasi jumlah kursus aktif, jumlah siswa per guru, atau jumlah AI request/bulan — bukan durasi pemakaian.
- Kalau guru sudah pakai 6 bulan gratis lalu tiba-tiba dikunci fitur, itu melanggar prinsip freemium yang benar (Hamari et al. 2020: orang mau bayar karena sudah rasakan nilai, bukan karena dipaksa).

### B. Guru BUKAN sumber pendapatan utama
Guru Indonesia (terutama honorer) rata-rata berpenghasilan rendah. Model recurring-payment-dari-guru akan mati sendiri. Sumber uang nyata harus dari pihak yang memang punya anggaran resmi:
1. **Sekolah/Yayasan** — dari dana BOS (Bantuan Operasional Sekolah), bukan kantong pribadi guru.
2. **Wakaf/Donatur pendidikan** — cocok secara budaya karena platform ini konten PAI (label "wakaf", bukan "biaya").
3. **Orang tua siswa** — untuk fitur opsional yang mereka rasakan manfaatnya langsung (misal laporan progress anak).

### C. Payment: QRIS statis, bukan transfer manual polos
Tetap solo founder, tetap masuk ke rekening pribadi owner, TAPI pakai QRIS statis (bukan minta transfer manual + cek mutasi satu-satu). Alasan:
- Kalau 80 guru bayar bareng di tanggal yang sama, cek mutasi manual tidak scalable untuk satu orang.
- QRIS terasa lebih "resmi" di mata sekolah/donatur dibanding transfer ke rekening pribadi biasa.
- Sudah lazim dipakai UMKM Indonesia 2024-2026, tidak asing untuk siapapun.

### D. Satu metrik yang WAJIB dikumpulkan sebelum bikin skema harga apapun
**Biaya AI riil per guru aktif per bulan** — dari data nyata 80 guru gelombang pertama, BUKAN simulasi/karangan di atas kertas. Semua proyeksi margin (78%, 40%, dst) yang muncul di diskusi awal adalah angka karangan sampai ada data nyata ini. Kumpulkan minimal 1 bulan data sebelum rancang paket harga final.

---

## 2. BAHAYA YANG SUDAH DIIDENTIFIKASI (role "lawan bisnis / heaters")

1. **Free rider AI abuse** — kalau kuota gratis tidak jelas batasnya, guru bisa generate ratusan request AI sehari tanpa kontrol, biaya NaraRouter bisa meledak sebelum sempat disadari. WAJIB pasang limit keras per akun gratis dari hari pertama.
2. **Transfer manual ke rekening pribadi solo founder** — bottleneck manusia (bukan bottleneck teknis) begitu banyak orang bayar bersamaan; juga risiko rekening pribadi diblokir bank karena pola transaksi mencurigakan (banyak masuk dari orang tak dikenal).
3. **Data terlantar kalau kuota gratis tiba-tiba diperketat** — kalau guru sudah invest waktu isi 200 siswa lalu dibatasi jadi 50, itu bikin guru marah dan pindah, cerita buruk menyebar ke guru lain.
4. **Ekspansi ke "semua mapel semua jenjang" sekaligus** — solo founder tidak bisa moderasi kualitas konten Matematika/IPA/dll kalau background owner PAI. Beban moderasi + dukungan guru bisa pecah ke banyak arah sebelum satupun kuat.
5. **Kehilangan identitas** — "AKAL Center" dikenal sebagai platform PAI karena itu produk jangkar (anchor product) yang sudah terbukti (80 guru menunggu). Ganti branding jadi "generik semua mapel" terlalu cepat akan menghilangkan alasan kepercayaan awal.

---

## 3. ARAH JANGKA PENDEK — PERSIAPAN SEBELUM "MELEDAK"

Karena lonjakan user diperkirakan datang cepat (80 guru + 2.000 siswa dari basis lama sudah menunggu), sistem HARUS siap dari sisi teknis maupun proses SEBELUM gelombang masuk, bukan sesudah:

### Checklist teknis wajib sebelum onboarding massal:
- [ ] Kuota gratis (jumlah kursus, siswa, AI request/bulan) sudah didefinisikan angka pastinya, bukan "nanti dipikir belakangan"
- [ ] Rate limiting / hard cap AI request per akun aktif dari hari pertama (cegah bahaya #1 di atas)
- [ ] QRIS statis sudah terpasang dan diuji sebelum guru pertama diminta bayar/donasi
- [ ] Dashboard sederhana untuk owner pantau: berapa guru aktif, berapa AI request terpakai, biaya AI harian (supaya tidak kaget di akhir bulan)
- [ ] Proses onboarding guru baru (dari daftar sampai bisa upload materi pertama) sudah dites end-to-end dengan minimal 1 guru nyata (Bang Agung), BUKAN cuma build hijau
- [ ] Kolom `mata_pelajaran` dan `jenjang` sudah ditambahkan ke database (perubahan kecil, technical debt rendah) — supaya pintu ke arah "semua mapel" sudah siap secara struktur, tanpa perlu buka pemasarannya dulu

### Urutan eksekusi:
```
MINGGU 1-2   : Bang Agung upload materi PAI pertama di platform baru
               → ukur dipakai berapa kali/minggu, kenapa
               → tanya sekolahnya: ada dana BOS untuk alat digital?
BULAN 1      : Onboarding gelombang pertama 80 guru PAI yang sudah menunggu
               → kuota gratis by kapasitas sudah aktif dari hari 1
               → QRIS statis siap untuk yang mau donasi/sponsor opsional
BULAN 2-3    : Ukur retensi nyata (berapa % guru balik tiap minggu)
               → kalau retensi kuat, baru mulai buka kolom mata_pelajaran+jenjang
BULAN 4+     : Rancang paket sekolah/yayasan dari DATA biaya AI riil,
               bukan simulasi
```

---

## 4. ARAH KE DEPAN (VISI JANGKA PANJANG) — "ALL ROLE SEMUA MAPEL GURU"

Ini arah masa depan yang harus dipikirkan sekarang secara ARSITEKTUR (supaya tidak perlu rombak besar nanti), tapi TIDAK dieksekusi/dipasarkan sekarang:

- **Prinsip:** buka PINTU TEKNIS duluan, baru buka PINTU PEMASARAN belakangan. Jangan kampanyekan "sekarang untuk semua mapel semua jenjang" sebelum PAI benar-benar solid dan terbukti retensinya.
- **Database sudah mendukung secara struktur** — tabel `kursus` di project baru sudah generic (tidak hardcode PAI), guru mapel apapun secara teknis bisa buat kursus hari ini. Yang perlu ditambah cuma kolom taksonomi resmi (mata pelajaran + jenjang SD/MI/SMP/MTs/SMA/SMK/MA) untuk kebutuhan katalog dan filter — perubahan kecil, bukan rombak arsitektur.
- **Cara masuknya guru mapel lain: organik, bukan kampanye.** Biarkan guru PAI yang puas cerita ke rekan guru mapel lain di sekolah yang sama — bukan owner buka pendaftaran umum untuk semua mapel sebelum ada permintaan nyata.
- **Risiko kalau dipaksa sekarang:** solo founder akan langsung dibandingkan dengan pemain besar yang sudah mapan di ranah "semua mapel semua jenjang" (modal besar, tim puluhan orang) — AKAL Center akan kalah di keluasan. Yang bisa dimenangkan hanya kedalaman + kepercayaan komunitas spesifik (mulai dari PAI).
- **Skala pasar nyata Indonesia** (data resmi, per Juni 2026): ±3 juta guru, ±300.000 sekolah (170rb SD, 40rb SMP, 26rb SMA), 84% di bawah Kemendikbud, 16% di bawah Kemenag (termasuk MI/MTs/MA). Kurikulum Merdeka beda struktur mapel per jenjang (SD tematik, SMP mapel terpisah, SMA/SMK ada peminatan Sains/Sosial/Bahasa/Vokasi) — jadi ekspansi "all role semua mapel guru" nanti bukan copy-paste PAI, tapi perlu adaptasi taksonomi per jenjang.
- **Kapan waktu yang tepat untuk mulai buka:** setelah retensi PAI gelombang pertama (80 guru) terbukti solid selama minimal 2-3 bulan DAN sudah ada minimal 1 permintaan nyata dari guru mapel lain (bukan asumsi pasar owner semata).

**Kesimpulan arah masa depan dalam satu kalimat:** Sistem harus dirancang sekarang supaya siap menampung "semua role semua mata pelajaran guru" tanpa migrasi besar nanti — tapi jalur masuknya harus tetap PAI dulu sampai kuat, baru pintu dibuka pelan-pelan mengikuti permintaan nyata, bukan dorongan asumsi pasar.

---

## 5. CATATAN TAMBAHAN UNTUK TIM PEMIKIR YANG MENERIMA FILE INI

- Semua angka biaya/margin yang pernah muncul di diskusi awal (Rp900.000 biaya operasional, margin 78%/40%, dst) adalah SIMULASI KARANGAN, bukan data nyata — jangan dipakai sebagai basis keputusan final.
- Satu-satunya sumber pendapatan yang sudah difix owner: pembayaran manual via WhatsApp/rekening pribadi (solo founder, payment gateway online belum diaktifkan, sesuai keputusan project D-006 di AGENTS.md — payment online ditunda).
- Rekomendasi rekening: pertimbangkan QRIS statis untuk mengurangi beban cek manual, tapi tetap dalam kendali owner (bukan gateway pihak ketiga otomatis, sesuai preferensi solo founder).
- Prioritas P0 sebelum bicara monetisasi lebih jauh: Bang Agung (guru pertama) harus benar-benar upload materi dan dipakai nyata dulu — database platform baru saat ini masih kosong.
