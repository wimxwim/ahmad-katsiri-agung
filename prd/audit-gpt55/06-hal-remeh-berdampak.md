# AUDIT GPT 5.5 — Hal Remeh Tapi Berdampak

> **Sumber:** GPT 5.5 main session
> **Status:** Read-only audit, tidak ada file yang diubah

---

- Typo "Aggung" vs "Agung" di metadata dan UI menurunkan trust.
- CTA "GABUNG SEKARANG" mengarah ke portal yang belum benar-benar join.
- Dashboard guru mock tampil seperti data nyata.
- Navbar CMS dipotong `.slice(0, 8)`, menu Qur'an hilang.
- Bottom tab mobile hardcoded, tidak mengikuti CMS.
- Input form banyak yang belum punya label aksesibel.
- Filter kelas belum pakai aria-pressed.
- Game Canva membuka tab luar tanpa penjelasan koneksi/tab baru.
- Tombol PDF/PPT fallback bisa mengarah ke 404 kalau file belum ada.
- Error state "gagal" belum memberi instruksi yang membantu.
- Refleksi/diskusi setelah submit tidak otomatis refresh.

---

> *Dokumen ini adalah salinan verbatim dari hasil audit GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli GPT 5.5.*
