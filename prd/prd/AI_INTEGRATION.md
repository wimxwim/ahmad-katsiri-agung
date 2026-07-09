# Rencana Integrasi AI — Qwen 3.7 Max via NaraRouter

> **Status:** BELUM DIKERJAKAN
> **Tanggal catat:** 6 Juli 2026
> **Estimasi pengerjaan:** ~2 jam (4 sesi)

---

## 1. Keputusan

| Item | Keputusan |
|------|-----------|
| Model AI | `qwen/qwen3.7-max` |
| Gateway | NaraRouter (`router.naraya.ai`) |
| Format API | OpenAI-compatible (`/v1/chat/completions`) |
| Library | `openai` npm (sudah ada di `package.json`) |
| Fitur | AI Tutor (siswa) + Asisten Guru (bareng) |

---

## 2. Arsitektur

```
Browser → Next.js API Route (/api/v1/ai/tutor)  → NaraRouter (server-side)
Browser → Next.js API Route (/api/v1/ai/asisten) → NaraRouter (server-side)
```

- **API key disimpan di `.env` server** — tidak bocor ke client
- Streaming respons via SSE untuk UX chat real-time
- Rate limit per-user di API route (jaga quota)

---

## 3. Yang Perlu Dari Klien

> **API key NaraRouter** (`sk-nara-xxx`)
>
> 1. Buka [`router.naraya.ai`](https://router.naraya.ai/)
> 2. Daftar / login
> 3. Isi saldo (minimal ~$5 untuk testing)
> 4. Generate API key
> 5. Copy key — nanti diinput ke `.env` saat implementasi

---

## 4. Sesi Pengerjaan

### Sesi 1: Infrastruktur (~30 menit)

| File | Aksi | Deskripsi |
|------|------|-----------|
| `.env` | Edit | Tambah `NARAROUTER_BASE_URL`, `NARAROUTER_API_KEY`, model alias |
| `src/lib/ai-client.ts` | **BARU** | Wrapper `openai` client → NaraRouter (ganti `baseURL`) |
| `src/app/api/v1/ai/tutor/route.ts` | **BARU** | API Route streaming chat: POST, sanitize input, forward ke NaraRouter, stream balik |
| `src/app/api/v1/ai/asisten/route.ts` | **BARU** | API Route non-streaming: POST, sanitize input, forward ke NaraRouter, return JSON |

### Sesi 2: Frontend AI Tutor (~45 menit)

| File | Aksi | Deskripsi |
|------|------|-----------|
| `src/app/ai-tutor/page.tsx` | **BARU** | Halaman chat full — header, input bar, daftar chat |
| `src/app/ai-tutor/layout.tsx` | **BARU** | Layout: Navbar + BottomTabBar (mobile) |
| `src/components/ai/ChatWindow.tsx` | **BARU** | Komponen reusable: chat bubble (user/ai), loading state (typing dots), error state, streaming text, scroll-to-bottom auto |
| `src/components/ai/ChatBubble.tsx` | **BARU** | Bubble individual: role icon, teks, timestamp |
| `src/components/ai/ChatInput.tsx` | **BARU** | Input form: textarea + send button, disabled saat loading |

### Sesi 3: Frontend Asisten Guru (~30 menit)

| File | Aksi | Deskripsi |
|------|------|-----------|
| `src/components/ai/AsistenModal.tsx` | **BARU** | Modal/panel di `/dashboard-guru`: pilih aksi (buat soal, analisis nilai, saran), input prompt, hasil di tampilkan |
| `src/app/dashboard-guru/page.tsx` | Edit | Tambah tombol "Asisten AI" di sidebar/header |
| `src/app/dashboard-guru/buat/page.tsx` | Edit | Tambah tombol "Generate Soal dengan AI" |

### Sesi 4: Polish + Build (~15 menit)

- Rate limit di `tutor/route.ts` dan `asisten/route.ts`
- Sanitasi input pakai `src/lib/sanitize.ts`
- Konteks materi dari `src/data/materi.ts` dikirim sebagai system prompt
- `NODE_OPTIONS="--max-old-space-size=4096" npx next build` — verifikasi zero errors

---

## 5. `.env` Variables

```bash
# NaraRouter — Qwen 3.7 Max
NARAROUTER_BASE_URL=https://router.bynara.id/v1
NARAROUTER_API_KEY=sk-nara-xxx          # ← input dari klien

# Model alias (bisa diganti kapan aja)
AI_TUTOR_MODEL=qwen/qwen3.7-max
AI_ASISTEN_MODEL=qwen/qwen3.7-max
```

---

## 6. System Prompt

### AI Tutor (Siswa)
```
Kamu adalah tutor PAI (Pendidikan Agama Islam) untuk siswa SMP/MTs di platform AKAL Center.
Kurikulum: Merdeka Belajar — Aqidah Akhlaq berbasis Deep Learning.

Aturan:
1. Jawab dengan bahasa Indonesia yang ramah dan mudah dipahami.
2. Sesuaikan penjelasan dengan level SMP.
3. Kalau ditanya di luar materi PAI, arahkan kembali ke topik pelajaran.
4. Gunakan dalil Al-Quran dan Hadits sebagai rujukan.
5. Maksimal 3 paragraf per jawaban, kecuali diminta lebih detail.
6. Akhiri dengan pertanyaan reflektif untuk siswa.

Materi bab yang sedang dipelajari:
[KONTEN DARI src/data/materi.ts — bab terkait]
```

### Asisten Guru
```
Kamu adalah asisten guru PAI SMP/MTs di platform AKAL Center.

Tugas:
- Buat soal PAI sesuai Kurikulum Merdeka (pilihan ganda 4 opsi + kunci jawaban)
- Analisis nilai kelas dan beri saran pengajaran
- Bantu susun RPP singkat

Format soal: nomor, pertanyaan, A/B/C/D, kunci jawaban, pembahasan singkat.
```

---

## 7. Cost Estimation

| Metrik | Nilai |
|--------|-------|
| Input price | $1.25 / 1M tokens |
| Output price | $7.50 / 1M tokens |
| Rata-rata token/chat (tutor) | ~200-500 token |
| Biaya per chat (tutor) | ~$0.0005–$0.001 |
| Biaya per generate soal (asisten) | ~$0.002–$0.005 |
| Estimasi 1000 chat/bulan | ~$2–$5 |

**Sangat murah.** Untuk 2.000 siswa, budget $10/bulan sudah cukup.

---

## 8. Design Notes

- Warna: `#005231` (primary hijau), shimmer gold accent
- Font: `font-inter` body, `font-bricolage` heading
- Animasi: `whileInView`, `viewport={{ once: true }}`, ease `[0.16, 1, 0.3, 1]`
- Glass: `bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass`
- Mobile-first: `px-3 sm:px-5 lg:px-8`
- Chat bubble: user = primary bg, AI = glass bg
- Typing indicator: 3 dots animasi
- Streaming: teks muncul incremental + auto-scroll

---

## 9. Keamanan

- API key **HANYA** di server (`process.env.NARAROUTER_API_KEY`), tidak pernah ke client
- Input user di-sanitize (`sanitizeText` dari `src/lib/sanitize.ts`)
- Rate limit: 30 request/menit per user di `/api/v1/ai/tutor`
- Max token per request dibatasi (`max_tokens: 1024` untuk tutor, `2048` untuk asisten)
- Tidak menyimpan history chat di database (stateless, client-side only untuk MVP)

---

## 10. Next Steps

1. **Klien siapkan API key NaraRouter** (`sk-nara-xxx`)
2. **Saya input key ke `.env`** → mulai implementasi
3. **4 sesi pengerjaan** → build verifikasi
4. **Deploy VPS** → test dengan user nyata

---

*Dokumen ini adalah catatan rencana. Belum ada kode yang ditulis.*
*Update terakhir: 6 Juli 2026*
