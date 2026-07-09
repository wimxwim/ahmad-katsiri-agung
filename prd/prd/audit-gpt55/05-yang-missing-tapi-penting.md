# AUDIT GPT 5.5 — Yang Missing Tapi Penting

> **Sumber:** GPT 5.5 main session
> **Status:** Read-only audit, tidak ada file yang diubah

---

## 1. Tahun ajaran, semester, kelas/rombel

Untuk sekolah Indonesia, ini wajib. Schema sekarang punya sekolah, users, kursus, tapi belum eksplisit mengikat data ke tahun ajaran/semester/rombel.

---

## 2. Import siswa dari Excel

Guru Indonesia lebih butuh import data siswa daripada fitur AI besar. Ini harus prioritas.

---

## 3. Export nilai Excel/PDF

Guru butuh rekap untuk administrasi. Dashboard cantik saja tidak cukup.

---

## 4. Audit perubahan nilai

Jika guru mengubah nilai manual, harus ada siapa/kapan/kenapa.

---

## 5. Consent dan privacy flow

Karena target SMP/MTs, harus ada consent wali/orang tua minimal untuk akun siswa resmi.

---

## 6. Moderasi diskusi/refleksi

Forum siswa tanpa moderasi bisa jadi masalah sosial, bullying, spam, atau kebocoran data.

---

## 7. Offline/resume quiz ringan

Tidak perlu offline exam kompleks dulu. Tapi perlu autosave jawaban, retry submit, idempotency key, dan pesan "nilai belum tersimpan".

---

## 8. Skill tagging soal

Tanpa mapping soal ke skill/topik, BKT/Risk Score/Remedial tidak punya akar masalah. Ini lebih penting daripada IRT 3PL.

---

## 9. Backup restore drill

Backup bukan cuma pg_dump. Harus ada restore test, offsite, encryption, retention.

---

## 10. Origin protection

Bukan hanya domain proxied. Origin IP harus tidak bisa diakses langsung.

---

> *Dokumen ini adalah salinan verbatim dari hasil audit GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli GPT 5.5.*
