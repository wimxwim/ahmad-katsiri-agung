# AUDIT GPT 5.5 — Bug UX Kritis

> **Sumber:** GPT 5.5 main session + frontend UX sub-agent (61 toolcalls)
> **Status:** Read-only audit, tidak ada file yang diubah

---

## 1. Kuis intro menampilkan 0 soal

**File:** `src/components/evaluasi/QuizEngine.tsx:45, 105-107, 263, 270`

`totalSoal` berasal dari `shuffledSoal.length`, tapi sebelum quiz mulai nilainya kosong. Siswa melihat "0 soal".

**Fix nanti:**
- Intro pakai `bab.soal.length`.

---

## 2. Jawaban terakhir kuis bisa tidak tersimpan

**File:** `src/components/evaluasi/QuizEngine.tsx:183-194, 197-213`

`setJawaban` async lalu langsung pindah ke result. Skor/submit bisa membaca state lama.

**Fix nanti:**
- Hitung jawaban final di variabel lokal.
- Submit berdasarkan object final, bukan state yang belum pasti update.

---

## 3. Ulang kuis tidak submit ulang

**File:** `src/components/evaluasi/QuizEngine.tsx:51, 117-120, 163-175`

`submittedRef.current` tidak di-reset di `startQuiz()`.

**Fix nanti:**
- Reset `submittedRef.current = false` saat mulai ulang.
- Idealnya simpan attempt number, best score, latest score.

---

> *Dokumen ini adalah salinan verbatim dari hasil audit GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli GPT 5.5.*
