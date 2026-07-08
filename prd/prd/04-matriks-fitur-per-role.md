# AKAL CENTER — Matriks Fitur Per Role

**Role:** Owner → Admin Sekolah → Guru → Asisten Guru → Siswa → Orang Tua  
**Fase:** 1 (Fondasi) → 2 (Kecerdasan) → 3 (Skala)

---

## 1. HIERARKI ROLE (Diringkas dari Chamilo untuk Konteks Indonesia)

| Role | Setara Chamilo | Hak Akses |
|------|---------------|-----------|
| **Owner Platform** | Global Administrator | Full akses semua sekolah, billing, analytics global |
| **Admin Sekolah** | Portal Administrator | Kelola guru & siswa di 1 sekolah, lihat TRI semua guru |
| **Guru** | Teacher | Buat kursus, upload materi, quiz, nilai, remedial, lihat revenue |
| **Asisten Guru** | Course Assistant | Bantu guru nilai/jawab forum, tanpa akses revenue |
| **Siswa** | Learner | Akses materi, quiz, sertifikat, AI tutor |
| **Orang Tua** | *(Baru — tidak ada di Chamilo)* | View-only progress anak |

---

## 2. MATRIKS FITUR — FASE 1 (FONDASI)

### 🧑‍🏫 GURU

| Modul | Fitur | Prioritas | Detail Teknis |
|-------|-------|-----------|---------------|
| **Kursus** | Buat kursus | 🔴 | Form judul, deskripsi, harga; POST `/api/v1/guru/kursus` |
| | Edit kursus | 🔴 | Update metadata, visibilitas (publik/privat/tertutup) |
| | Hapus kursus | 🟡 | Soft delete, tidak hapus fisik |
| | Dashboard kursus | 🔴 | Grid semua kursus milik guru |
| **Materi** | Upload materi format apapun | 🔴 | PDF, DOCX, PPT, video, audio, HTML |
| | Susun learning path | 🔴 | Drag-and-drop urutan bab (@dnd-kit/core) |
| | Prasyarat materi | 🟡 | Siswa tidak bisa buka B jika A belum selesai |
| | Reuse materi dari kursus lain | 🟡 | Import/duplikat konten |
| | Tautan eksternal | 🟢 | Embed YouTube, link web |
| | Glosarium per kursus | 🟢 | CRUD istilah-definisi |
| **Quiz** | Buat soal per topik | 🔴 | PG, Isian, Essay, tagging ke skill |
| | Import soal massal | 🟡 | Upload CSV/Excel → parse → insert |
| | Bank soal searchable | 🟡 | Filter by skill, level Bloom |
| | Atur quiz session | 🔴 | Pilih soal, set durasi, jadwal |
| | Timer & anti-cheat dasar | 🔴 | Countdown, deteksi tab blur |
| **Nilai** | Gradebook (buku nilai) | 🔴 | Matriks: baris = siswa, kolom = quiz/topik |
| | Input nilai manual | 🟡 | Overwrite nilai auto-calculate |
| | Audit trail nilai | 🟡 | Setiap perubahan nilai tercatat |
| | Multi skala penilaian | 🟢 | Angka, huruf, persentase |
| **Pengumuman** | Broadcast ke siswa | 🟡 | Teks + lampiran file, kirim email via Resend |
| **Absensi** | Rekap kehadiran | 🟢 | Per pertemuan, manual input |
| **Sertifikat** | Generate sertifikat PDF | 🟡 | Custom template, QR anti-palsu |
| **Siswa** | Kelola siswa per kursus | 🔴 | Tambah/hapus manual atau massal |
| | Import CSV siswa | 🟡 | Auto-buat akun SISWA + enroll |
| | Atur hak akses per siswa | 🟢 | Siapa boleh lihat apa |

### 🎓 SISWA

| Modul | Fitur | Prioritas | Detail Teknis |
|-------|-------|-----------|---------------|
| **Katalog** | Cari & lihat kursus | 🔴 | Grid + filter + search |
| | Daftar/ikut kursus | 🔴 | Self-enroll atau kode undangan |
| **Belajar** | Akses materi | 🔴 | Video, dokumen, bacaan — akses ulang kapan saja |
| | Learning path dengan progress bar | 🔴 | Urutan materi dari guru, centang selesai |
| | Multi-device | 🔴 | Responsive (HP, tablet, laptop) |
| **Quiz** | Kerjakan quiz | 🔴 | PG, isian, essay — langsung dapat skor |
| | Submit tugas | 🟡 | Upload file (PDF/foto) via StorageAdapter |
| | Lihat nilai & riwayat | 🔴 | Gradebook pribadi |
| **Profil** | Profil pengguna | 🔴 | Foto, bio, data diri |
| | Riwayat belajar | 🟡 | Kursus selesai vs sedang berjalan |
| **Sertifikat** | Sertifikat digital | 🟡 | Otomatis terbit setelah selesai kursus |
| | Verifikasi QR code | 🟡 | Scan → cek keaslian di `/verify/[nomor]` |
| | Share ke LinkedIn/portofolio | 🟢 | Badge & sertifikat shareable |

### 👨‍💼 ADMIN SEKOLAH

| Modul | Fitur | Prioritas | Detail Teknis |
|-------|-------|-----------|---------------|
| **Dashboard** | Total guru, siswa, pendapatan | 🟡 | Ringkasan statistik |
| **Guru** | Lihat semua guru | 🟡 | Suspend/mute jika melanggar |
| | Lihat TRI semua guru | 🟡 | Teacher Readiness Index aggregat |
| **Siswa** | Lihat semua siswa per sekolah | 🟡 | Filter per kelas |

### 👨‍👩‍👧 ORANG TUA

| Modul | Fitur | Prioritas | Detail Teknis |
|-------|-------|-----------|---------------|
| **Dashboard** | Status anak (Hijau/Kuning/Merah) | 🔴 | Simple risk indicator tanpa jargon |
| | Tugas belum dikerjakan | 🔴 | List pending assignments |
| | Pesan dari guru | 🟡 | Notifikasi |
| **Konsultasi** | Consent management | 🔴 | Persetujuan pemrosesan data anak |

---

## 3. MATRIKS FITUR — FASE 2 (KECERDASAN)

### 🧑‍🏫 GURU

| Fitur | Detail |
|-------|--------|
| **Dashboard Analitik Kelas** | Radar chart penguasaan skill — rata-rata BKT per topik |
| **Risk Score Table** | Tabel siswa berwarna: hijau (aman), kuning (pantau), oranye (berisiko), merah (kritis) |
| **Detail Siswa** | Drill-down: kenapa risk score tinggi? (jarang login, jawaban lambat, skor turun) |
| **1-Klik Remedial** | Tombol "Kirim Jalur Remedial" → trigger notifikasi ke siswa |
| **AI Grading Essay** | AI koreksi jawaban essay → guru tinggal approve/edit |
| **AI Auto-Generate Soal** | Dari teks materi → 5 soal PG + kunci jawaban (LLM) |
| **Dashboard TRI** | Teacher Readiness Index pribadi: progress M,R,G,V,E,K |
| **Notifikasi Risk** | Telegram: "[PERINGATAN] Siswa X masuk zona Berisiko" |

### 🎓 SISWA

| Fitur | Detail |
|-------|--------|
| **Progress Adaptif** | Quiz adaptif — soal berikutnya tergantung theta IRT |
| **Jalur Remedial Personal** | Sistem rekomendasi: "Fokus 15 menit di sub-topik X" |
| **Spaced Repetition** | Notifikasi "Waktunya review materi Y" sebelum lupa |
| **AI Tutor 24 Jam** | Chatbot konteks materi (nonaktif saat quiz) |
| **Badge & Poin** | Gamifikasi: kumpulkan lencana, leaderboard kelas |
| **Growth Mindset Feedback** | Feedback kegagalan di-framing ulang oleh AI |

### 👨‍👩‍👧 ORANG TUA

| Fitur | Detail |
|-------|--------|
| **Notifikasi Proaktif** | "Anak Anda belum login 3 hari" / "Anak Anda dapat badge baru" |

---

## 4. MATRIKS FITUR — FASE 3 (SKALA)

### 🧑‍🏫 GURU

| Fitur | Detail |
|-------|--------|
| **White-label** | Domain sendiri (sekolah.sch.id) |
| **Video Conference** | Zoom/BigBlueButton terintegrasi |
| **Forum Diskusi** | Tanya-jawab per kursus |
| **Wiki Kolaboratif** | Dokumen bersama siswa |
| **Chat Real-time** | Chat dengan siswa |
| **Kalender Akademik** | Jadwal kelas, ujian, deadline |
| **Grup Siswa** | Bagi siswa ke kelompok kerja |
| **Jual Kursus** | Shopping cart + QRIS |
| **REST API** | Integrasi dengan sistem sekolah lain |

### 🎓 SISWA

| Fitur | Detail |
|-------|--------|
| **Portofolio Belajar Permanen** | Riwayat belajar bisa dilihat calon employer |
| **Forum Diskusi** | Tanya-jawab dengan guru & teman |
| **Wiki Kolaboratif** | Ikut menyusun dokumen bersama |
| **Chat** | Chat langsung dengan guru/teman |
| **Kalender Pribadi** | Semua jadwal dalam satu tampilan |
| **Catatan Pribadi** | Simpan notes belajar |
| **Grup Kelompok** | Ikut kerja kelompok |

---

## 5. PAKET HARGA (BERDASARKAN FITUR)

| Fitur | GRATIS | GURU PRO (Rp99K/bln) | SEKOLAH (Rp2.5JT/thn) |
|-------|--------|---------------------|----------------------|
| Kuota Kursus | 1 | Unlimited | Unlimited |
| Kuota Siswa | 50 | 500/kursus | Unlimited |
| Storage Materi | 500 MB VPS | Google Drive Guru (Unlimited) | Google Drive per Guru |
| Quiz & Gradebook | PG, rata-rata | Semua tipe + Import Excel | Semua + Audit Trail |
| AI Analitik | ❌ | ✅ Risk Score, BKT, Remedial | ✅ Semua AI + TRI |
| AI Grading | ❌ | 50x/bulan | Unlimited |
| Sertifikat QR | Watermark biasa | ✅ Hash Cryptography | ✅ Custom Logo Sekolah |
| Gamifikasi | ❌ | ✅ | ✅ |
| White-Label | akalcenter.my.id/guru-... | akalcenter.my.id/guru-... | sekolah.sch.id |
| Support | Komunitas | Prioritas 24 Jam | Dedicated Assistant |

---

## 6. FITUR YANG SUDAH ADA DI REPO (Versi 1.0)

| Fitur | Status | Implementasi |
|-------|--------|--------------|
| Materi 14 bab PAI | ✅ | Keystatic CMS + `materi.ts` |
| Quiz Engine (PG) | ✅ | `QuizEngine.tsx` → Google Sheets |
| Login Siswa/Guru | ✅ | `FormMasuk.tsx` + JWT |
| Rekap Nilai | ✅ | `/pendidik` + Google Sheets |
| Game Edukasi | ✅ | 6 card Canva eksternal |
| Ruang Doa | ✅ | `RuangDoa.tsx` → Sheets + Telegram |
| Video Gallery | ✅ | YouTube embed |
| Hafalan Dalil | ✅ | Flashcard |
| Sertifikat | ❌ | Belum ada |
| AI Tutor | ❌ | Belum ada |
| Spaced Repetition | ❌ | Belum ada |
| Google Drive Guru | ❌ | Belum ada, storage Vercel |
| Multi-Guru | ❌ | Single-guru (Ahmad Katsiri) |
| Payment (QRIS) | ❌ | Belum ada |
