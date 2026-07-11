---
name: debug-ai-pipeline
description: "AI Document Pipeline Debugging & Stability Contract — metodologi investigasi 5 hari untuk menyelesaikan masalah upload dokumen gagal (DOMMatrix, NaraRouter 502/504 timeout, build Vercel gagal, schema invalid). Trigger: 'debug AI pipeline', 'upload gagal', 'draft error', 'AI timeout', 'NaraRouter error', 'DOMMatrix', 'schema invalid', 'debug pipeline', 'pipeline AI error'. SKILL TERBAIK — hasil investigasi 15+ sumber, 10+ test production, 5 commit fix."
allowed-tools: [bash, read, grep, glob, edit, webfetch, task]
metadata:
  author: AKAL Center / Agensi
  version: "2026.7.11"
  scope: project-specific
  priority: 1
  pairs_with: AGENTS.md, DESIGN.md, ai.ts, ai-generator.ts, ai-sanitizer.ts
  updated: "2026-07-11"
---

# 🔬 SKILL: DEBUG AI PIPELINE — AKAL Center Stability Contract

> **Skill ini adalah hasil investigasi 5 hari, 15+ sumber internet, 10+ test production, dan 5 commit fix. JANGAN diabaikan oleh AI agent manapun.**

---

## Filosofi Inti

> *"Pipeline AI tidak gagal di satu titik. Ia gagal di banyak titik yang berbeda. Debug dengan memisahkan layer, bukan menebak."*

---

## Arsitektur Pipeline AI (WAJIB dipahami sebelum debug)

```
Browser Guru → Upload Route → Auth + CSRF → ImageKit Upload
                                              ↓
                                         Ekstraksi PDF/DOCX (unpdf)
                                              ↓
                                         NaraRouter AI Chat (3x paralel)
                                         │  ├── Materi (light model)
                                         │  ├── Quiz (light model)
                                         │  └── Soal (light model)
                                         ↓
                                    Parse + Normalisasi Output
                                         ↓
                                    Simpan Draft ke Database
```

**File kritikal:**
| File | Peran |
|------|-------|
| `src/lib/ai.ts` | OpenAI-compatible client NaraRouter |
| `src/lib/ai-generator.ts` | Orkestrasi + fallback lokal |
| `src/lib/ai-sanitizer.ts` | Validasi + normalisasi output AI |
| `src/lib/text-extractor.ts` | Ekstraksi teks PDF/DOCX (unpdf) |
| `src/app/api/v1/guru/uploads/route.ts` | Route upload + trigger background |
| `src/app/api/health/route.ts` | Health check production |

---

## 5 Layer Kegagalan (Diagnosis Tree)

### Layer 1: Build Vercel Gagal

**Gejala:** Deployment `Error: Command "next build" exited with 1`

**Penyebab umum:**
- Import `@animateicons/react/lucide` tidak tersedia di Vercel (terdeteksi 11 Jul 2026)
- `Clock` diimport 2x dari `lucide-react`
- `BookOpen` diimport tapi tidak dipakai
- `KKM` diexport dari `constants.ts` tapi file belum dicommit

**Cara debug:**
```
npx vercel --prod --yes
```
Lihat build log untuk error TypeScript/Turbopack.

**Fix standar:**
- Ganti `@animateicons/react/lucide` → `lucide-react`
- Hapus import duplikat
- Commit file yang diubah (jangan deploy dirty tree)

---

### Layer 2: DOMMatrix is not defined

**Gejala:** `errorMessage: "DOMMatrix is not defined"` di draft

**Root cause:** `pdf-parse` butuh `DOMMatrix` (API browser), tidak tersedia di Node.js/Vercel.

**Fix yang sudah diterapkan:**
- Ganti `pdf-parse` → `unpdf` v1.6.2
- `unpdf` v1.5.1+ sudah ada polyfill DOMMatrix (issue #48, #33)

**Jika error muncul lagi:**
1. Cek `package.json` → `"unpdf": "^1.6.2"`
2. Cek apakah draft itu dari deployment lama (sebelum fix)
3. Upload baru setelah deploy terbaru

---

### Layer 3: NaraRouter 502/504 Timeout

**Gejala:**
- `NaraRouter error 502: <!DOCTYPE html>...` (Cloudflare error page)
- `Upstream timeout` (504)
- `The operation was aborted due to timeout`

**Root cause (terbukti 11 Jul 2026):**
`GET /v1/models` dari Vercel → **200 OK**
`POST /v1/chat/completions` dari Vercel → **504 timeout**

Dari lokal → kedua endpoint berhasil.

**Ini membuktikan:** Masalah di level network antara Vercel runtime dan NaraRouter POST endpoint, bukan API key, bukan base URL.

**Cara test isolasi:**
```
# Dari lokal (harus berhasil)
curl -X POST https://router.bynara.id/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4-pro","messages":[{"role":"user","content":"test"}],"max_tokens":10}'

# Dari Vercel (test endpoint)
curl -X POST https://akalcenter.my.id/api/readyz
```

**Jika readyz POST timeout → NaraRouter dari Vercel bermasalah.**
**Jika readyz POST berhasil → masalah di payload besar.**

**Fix yang sudah diterapkan:**
- **Local fallback generator** di `ai-generator.ts` — jika AI timeout, buat draft dari teks ekstraksi
- Timeout request 90s → 75s
- Retry 2 → 0
- 3 request paralel pakai light model (`getModelForTask("light")`)
- `chatWithFallback()` — heavy model gagal → fallback ke flash

---

### Layer 4: Schema Invalid (AI output tidak sesuai)

**Gejala:** `AI output schema invalid: soal`

**Root cause:** Model AI sering mengembalikan variasi yang tidak sesuai Zod schema:
- `"Pilihan Ganda"` bukan `"PG"`
- `"isian"` lowercase bukan `"ISIAN"`
- `"items"` / `"questions"` / `"data"` bukan `"soal"`
- Opsi dalam array, bukan object `{A, B, C, D}`
- Kunci berupa teks jawaban, bukan `"A"`/`"B"`/`"C"`/`"D"`

**Fix yang sudah diterapkan:**
- **Normalizer** di `ai-sanitizer.ts`:
  - `normalizeTipe()` — `"pilihan ganda"` → `"PG"`, `"isian"` → `"ISIAN"`, `"essay"` → `"ESSAY"`
  - `normalizeSoalPayload()` — `items`/`questions`/`data` → `soal`
  - `normalizeOpsi()` — array → object `{A, B, C, D}`
  - `normalizeKunci()` — teks jawaban → key opsi yang cocok
- **Partial save** — soal invalid tidak menggagalkan materi + quiz
- **Logging** — 2000 karakter pertama output soal dicatat di server log

---

### Layer 5: Health Check False Alarm

**Gejala:** `/api/health` → `ai: not_configured` padahal env ada

**Root cause:** Health check butuh `AI_BASE_URL` yang di-set, tapi kode AI punya fallback default.

**Fix yang sudah diterapkan:**
```typescript
const baseUrl = process.env.AI_BASE_URL || "https://router.bynara.id/v1";
const apiKey = process.env.AI_API_KEY || process.env.NARAROUTER_API_KEY;
```

---

## Stability Contract (JANGAN DILANGGAR)

### DO NOT CHANGE:
1. ❌ **JANGAN hapus local fallback** di `ai-generator.ts` sebelum pengganti production terbukti
2. ❌ **JANGAN hapus normalizer** di `ai-sanitizer.ts`
3. ❌ **JANGAN kembalikan all-or-nothing** — soal invalid tidak boleh gagalkan semua
4. ❌ **JANGAN wajibkan `AI_BASE_URL`** — env itu boleh kosong
5. ❌ **JANGAN impor `@animateicons/react/lucide`** — pakai `lucide-react`
6. ❌ **JANGAN deploy dari dirty tree** — commit hanya file yang disentuh
7. ❌ **JANGAN simpan API key di markdown** — repo public

### ALWAYS DO:
1. ✅ **Pertahankan fallback lokal** sebagai safety net
2. ✅ **Pertahankan normalizer** untuk toleransi output AI
3. ✅ **Pertahankan partial save** — materi + quiz tetap disimpan walau soal gagal
4. ✅ **Test `/api/readyz` POST** untuk isolasi NaraRouter dari Vercel
5. ✅ **Test upload PDF nyata** sebelum klaim fix berhasil
6. ✅ **Commit terpisah** — satu fix = satu commit
7. ✅ **Build lokal dulu** (`npm run build`) sebelum push

---

## Upgrade Path (Jika Ingin Meningkatkan)

### Upgrade 1: Durable AI Job Queue (Paling Aman)
```
Upload Route → Simpan file + enqueue job → Return sukses cepat
Worker/Queue → Ambil job → Ekstrak → AI → Simpan draft
```
Pilihan: Vercel Workflows, Cloudflare Queue + Worker, VPS worker.

### Upgrade 2: Vercel AI Gateway
```
Base URL: https://ai-gateway.vercel.sh/v1
Key: AI_GATEWAY_API_KEY
```
Keuntungan: observability, model routing, BYOK, lebih cocok dengan Vercel runtime.

### Upgrade 3: Kualitas Fallback Lokal
Template materi lebih pedagogis, quiz lebih realistis, soal lebih sesuai mapel.

### Upgrade 4: NaraRouter Support
Laporkan: `GET /v1/models` OK, `POST /v1/chat/completions` timeout dari Vercel.

**Urutan upgrade yang aman:**
1. Pertahankan fallback yang sudah terbukti.
2. Tambah queue/worker atau AI Gateway sebagai jalur utama baru.
3. Test upload PDF nyata 3-5x.
4. Baru boleh ubah fallback lama, jangan sebelumnya.

---

## Model AI (Bisa Diganti via Env Vercel)

```
AI_MODEL        → default: "deepseek-v4-pro"
AI_FLASH_MODEL  → default: "deepseek-v4-flash"
```

Untuk stabilitas, rekomendasi:
```
AI_MODEL=mimo-v2.5
AI_FLASH_MODEL=mimo-v2.5
```
atau:
```
AI_MODEL=deepseek-v4-flash
AI_FLASH_MODEL=deepseek-v4-flash
```

---

## Checklist Debug Cepat

```
□ /api/health → ai: connected?
□ /api/readyz POST → ok atau timeout?
□ Upload PDF baru → success?
□ Draft setelah 2-3 menit → status?
□ Error message → 502, 504, timeout, DOMMatrix, atau schema invalid?
□ Build Vercel → success atau error?
□ Env Vercel → AI_API_KEY, NARAROUTER_API_KEY, AI_MODEL?
```

---

*Skill ini dibuat dari investigasi 5 hari (7-11 Juli 2026) untuk AKAL Center. Commit terkait: 42b456b, 4eed512, d1b0f70, 4350ac8, cf77245, 3e3a0574a.*