# AKAL CENTER — Spesifikasi Mesin Analitik

**Diferensiasi Utama dari Kompetitor Lokal**  
**Landasan Ilmiah:** Psikometri + Psikologi Kognitif + Machine Learning Sederhana

---

## 1. RINGKASAN MODEL

| Model | Input | Output | Dipakai untuk |
|-------|-------|--------|---------------|
| **IRT 3PL** | Pola jawaban benar/salah per soal | `theta` (kemampuan), `a,b,c` (parameter soal) | Ukur kemampuan siswa secara matematis |
| **BKT** | Riwayat jawaban per skill | `P(L)` — probabilitas penguasaan | Lacak penguasaan dari waktu ke waktu |
| **Elo Rating** | Rating siswa vs rating soal | Rating baru keduanya | Adaptif kesulitan soal |
| **Spaced Repetition (SM-2)** | Quality score, interval terakhir | `next_review_at`, `memory_strength` | Jadwalkan review sebelum lupa |
| **Risk Score Engine** | 6 metrik perilaku | Skor 0-1 | Deteksi dini siswa lemah |
| **TRI** | 6 dimensi kesiapan guru | Skor 0-1 | Ukur efektivitas mengajar |
| **Remedial Engine** | Skill dengan `P(L) < 0.6` | Daftar materi prioritas | Resep belajar personal |

---

## 2. ITEM RESPONSE THEORY (IRT) — 3 Parameter Logistic

### Rumus

Probabilitas siswa dengan kemampuan `θ` menjawab benar soal `i`:

```
P_i(θ) = c_i + (1 - c_i) × 1 / (1 + e^(-a_i(θ - b_i)))
```

| Parameter | Nama | Makna |
|-----------|------|-------|
| `a_i` | Diskriminasi | Seberapa tajam soal membedakan siswa pandai vs lemah |
| `b_i` | Kesulitan | Titik di mana P=0.5 (setelah koreksi tebakan) |
| `c_i` | Tebakan | Probabilitas menjawab benar dengan menebak (0.25 untuk PG 4 opsi) |
| `θ` | Theta | Kemampuan laten siswa (biasanya -3 sampai +3) |

### Implementasi

```typescript
// src/domain/analytics/calculateIRT.ts
export function irt3PL(theta: number, a: number, b: number, c: number): number {
  const exponent = -a * (theta - b);
  return c + (1 - c) / (1 + Math.exp(exponent));
}

// Estimasi theta dengan Maximum Likelihood (dijalankan di Worker)
export function estimateTheta(
  responsePattern: { a: number; b: number; c: number; correct: boolean }[]
): number {
  // Newton-Raphson iterative estimation
  let theta = 0;
  for (let iter = 0; iter < 30; iter++) {
    let numerator = 0, denominator = 0;
    for (const r of responsePattern) {
      const p = irt3PL(theta, r.a, r.b, r.c);
      const q = 1 - p;
      const w = p * q;
      numerator += r.a * (r.correct ? q : -p) * (r.correct ? 1 / p : 1 / q);
      denominator += -r.a * r.a * w * (r.correct ? 1 / (p * p) : 1 / (q * q));
    }
    if (Math.abs(denominator) < 1e-10) break;
    theta -= numerator / denominator;
  }
  return theta;
}
```

### Kapan Mulai Bisa Dipakai?
- Minimal **100 jawaban per soal** untuk kalibrasi parameter `a,b,c` yang bermakna
- Sebelum itu: pakai default (a=1, b=0, c=0.25 untuk PG 4 opsi)

---

## 3. BAYESIAN KNOWLEDGE TRACING (BKT)

### Rumus

```
P(L_n) = P(L_{n-1} | evidence_n)
       = [P(L_{n-1}) × P(evidence | L)] / P(evidence)
```

Ada 4 parameter per skill:

| Parameter | Simbol | Makna | Default |
|-----------|--------|-------|---------|
| **pLearn** | `p(T)` | Probabilitas belajar skill dari unlearned → learned | 0.3 |
| **pGuess** | `p(G)` | Probabilitas menjawab benar meski belum menguasai | 0.2 |
| **pSlip** | `p(S)` | Probabilitas salah meski sudah menguasai | 0.1 |
| **pInit** | `p(L0)` | Probabilitas awal sudah menguasai sebelum belajar apapun | 0.1 |

### Implementasi

```typescript
// src/domain/analytics/calculateBKT.ts
export function updateBKT(
  prevP: number,       // P(L_{n-1})
  isCorrect: boolean,
  params: { pT: number; pG: number; pS: number }
): number {
  const { pT, pG, pS } = params;
  
  if (isCorrect) {
    const numerator = prevP * (1 - pS);
    const denominator = numerator + (1 - prevP) * pG;
    return numerator / denominator;
  } else {
    const numerator = prevP * pS;
    const denominator = numerator + (1 - prevP) * (1 - pG);
    return numerator / denominator;
  }
}

// Slip forward: probabilitas setelah belajar (antar sesi)
export function slipForward(prevP: number, pT: number): number {
  return prevP + (1 - prevP) * pT;
}
```

### Skenario Uji

```
Siswa selalu benar:  P(L) = 0.1 → 0.31 → 0.59 → 0.82 → 0.93 → 0.97
Siswa selalu salah:  P(L) = 0.1 → 0.012 → 0.0014 → ...
Siswa campuran:      P(L) fluktuasi sesuai pola jawaban
```

### Threshold
- `P(L) >= 0.8` → Skill **DIKUASAI**
- `0.6 <= P(L) < 0.8` → Skill **DALAM PROSES**
- `P(L) < 0.6` → Skill **BELUM DIKUASAI** → Trigger remedial

---

## 4. ELO RATING SYSTEM

### Rumus

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))

R_A' = R_A + K × (S_A - E_A)
```

| Simbol | Makna |
|--------|-------|
| `R_A` | Rating siswa setelah pertemuan terakhir |
| `R_B` | Rating soal (elo_rating di database) |
| `E_A` | Expected score (0-1, probabilitas siswa benar) |
| `S_A` | Actual score (1 = benar, 0 = salah) |
| `K` | K-factor = 32 (standar) |

### Implementasi

```typescript
// src/domain/analytics/calculateElo.ts
export function updateElo(
  ratingSiswa: number,
  ratingSoal: number,
  isCorrect: boolean,
  kFactor: number = 32
): { newRatingSiswa: number; newRatingSoal: number } {
  const expectedSiswa = 1 / (1 + Math.pow(10, (ratingSoal - ratingSiswa) / 400));
  const actualScore = isCorrect ? 1 : 0;
  
  const delta = kFactor * (actualScore - expectedSiswa);
  
  return {
    newRatingSiswa: ratingSiswa + delta,
    newRatingSoal: ratingSoal - delta,  // Soal naik/turun berlawanan
  };
}
```

### Interpretasi
- Rating siswa naik signifikan jika menjawab benar soal sulit
- Rating siswa turun sedikit jika salah di soal sulit (expected)
- Rating siswa turun drastis jika salah di soal mudah

---

## 5. SPACED REPETITION (SM-2 ALGORITHM)

### Rumus

```
EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))

IF q >= 3:
  IF n = 1: I = 1
  IF n = 2: I = 6
  IF n > 2: I = I_prev × EF

next_review = now + I (hari)
```

| Parameter | Makna |
|-----------|-------|
| `q` | Quality score (0-5): seberapa mudah siswa menjawab review |
| `EF` | Ease Factor (default 2.5, min 1.3) |
| `n` | Repetition number (ke-berapa kali review) |
| `I` | Interval (hari) |

### Implementasi

```typescript
// src/domain/analytics/calculateSpacedRep.ts
export function calculateNextReview(
  qualityScore: number,    // 0-5
  prevInterval: number,    // hari
  prevEF: number,          // ease factor
  repetitionNumber: number
): { nextInterval: number; newEF: number; nextDate: Date } {
  // Update Ease Factor
  let newEF = prevEF + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let nextInterval: number;
  if (qualityScore < 3) {
    // Gagal — reset
    nextInterval = 1;
  } else if (repetitionNumber === 1) {
    nextInterval = 1;
  } else if (repetitionNumber === 2) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(prevInterval * newEF);
  }

  // Cap max interval 180 hari
  if (nextInterval > 180) nextInterval = 180;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextInterval);

  return { nextInterval, newEF, nextDate };
}
```

---

## 6. RISK SCORE ENGINE

### Rumus Komposit

```
RawRisk = 0.25 × (1 - C)       // Completion rate
        + 0.25 × (1 - Q)       // Quiz performance
        + 0.15 × (1 - A)       // Attendance/kehadiran
        + 0.10 × L             // Login gap (days since last login)
        + 0.15 × (1 - T)       // Timeliness
        + 0.10 × (1 - P)       // Participation

Z = (RawRisk - 0.5) × 5        // Standardize to logit scale
Risk = 1 / (1 + e^(-Z))        // Sigmoid ke 0-1
```

| Metrik | Simbol | Makna | Range |
|--------|--------|-------|-------|
| Completion rate | C | Persentase materi yang sudah dikerjakan | 0-1 |
| Quiz performance | Q | Rata-rata skor quiz (dinormalisasi) | 0-1 |
| Attendance rate | A | Persentase kehadiran | 0-1 |
| Login gap | L | Hari sejak login terakhir (clamp max 30) | 0-1 |
| Timeliness | T | Persentase tugas dikumpulkan tepat waktu | 0-1 |
| Participation rate | P | Persentase forum/diskusi diikuti | 0-1 |

### Threshold

| Risk Score | Status | Aksi |
|-----------|--------|------|
| 0.0 – 0.3 | 🟢 Aman | Tidak ada |
| 0.3 – 0.5 | 🟡 Pantau | Notifikasi ringan ke guru |
| 0.5 – 0.7 | 🟠 Berisiko | Rekomendasi remedial + Telegram alert |
| 0.7 – 1.0 | 🔴 Kritis | Intervensi wajib (eskalasi ke guru + orang tua) |

### Implementasi

```typescript
// src/domain/analytics/calculateRiskScore.ts
export function calculateRiskScore(metrics: {
  completionRate: number;
  quizPerformance: number;
  attendanceRate: number;
  loginGap: number;       // days since last login, max 30
  timelinessRate: number;
  participationRate: number;
}): number {
  const L = Math.min(metrics.loginGap / 30, 1);
  
  const rawRisk =
    0.25 * (1 - metrics.completionRate) +
    0.25 * (1 - metrics.quizPerformance) +
    0.15 * (1 - metrics.attendanceRate) +
    0.10 * L +
    0.15 * (1 - metrics.timelinessRate) +
    0.10 * (1 - metrics.participationRate);
  
  const z = (rawRisk - 0.5) * 5;
  return 1 / (1 + Math.exp(-z));
}
```

---

## 7. TEACHER READINESS INDEX (TRI)

### Rumus

```
TRI = 0.15 × M    // Materi: kelengkapan modul per kursus
    + 0.15 × R    // Responsivitas: waktu rata-rata membalas forum
    + 0.15 × G    // Grading speed: waktu rata-rata koreksi tugas
    + 0.10 × V    // Variasi: jumlah tipe soal berbeda
    + 0.30 × E    // Efektivitas: rata-rata peningkatan P(L) siswa
    + 0.15 × K    // Konsistensi: variasi P(L) antar siswa (semakin kecil = semakin merata)
```

### Interpretasi

| TRI Score | Status | Pesan ke Guru |
|-----------|--------|---------------|
| 0.8 – 1.0 | 🌟 Expert | "Pendekatan Anda sangat efektif. Bagikan ke sesama guru!" |
| 0.6 – 0.8 | ✅ Baik | "Anda di jalur yang benar. Beberapa area bisa ditingkatkan." |
| 0.4 – 0.6 | ⚠️ Perlu Perhatian | "Kami lihat potensi pengembangan di area [kelemahan]. Ada saran?" |
| 0.0 – 0.4 | 🔴 Butuh Dukungan | "Mari kita bantu. Tim kami siap dampingi. Mulai dari [area terlemah]." |

**Framing suportif WAJIB** — TRI bukan alat menghakimi guru, tapi alat membantu guru berkembang.

---

## 8. REMEDIAL ENGINE

### Algoritma

```
1. Ambil semua skill siswa dengan P(L) < 0.6
2. Untuk setiap skill:
   a. Hitung prioritas = (1 - P(L)) × bloom_level / next_review_days
   b. Urutkan descending
3. Ambil top 3 skill dengan prioritas tertinggi
4. Cari materi terkait dengan bloom_level yang sesuai
5. Generate resep: "Fokus [X] menit di [sub-topik Y] via [format Z]"
```

### Format Z (berdasarkan VARK)
- **Visual:** Video, infografis
- **Auditori:** Audio, podcast
- **Read/Write:** PDF, bacaan
- **Kinestetik:** Game interaktif, simulasi

---

## 9. PIPELINE IMPLEMENTASI

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Siswa Submit │────▶│ EventStore    │────▶│ Redis Queue      │
│ Jawaban      │     │ JAWABAN_     │     │ queue:analytics  │
└─────────────┘     │ SUBMITTED     │     └────────┬────────┘
                    └──────────────┘              │
                                                  ▼
                    ┌──────────────────────────────────────────┐
                    │              WORKER (BullMQ)              │
                    │                                           │
                    │  1. Parse event                           │
                    │  2. Write jawaban_log (read model)        │
                    │  3. Calculate BKT → Update skill_mastery  │
                    │  4. Calculate Elo → Update soal.elo       │
                    │  5. Calculate Risk Score → risk_snapshot   │
                    │  6. If P(L) < 0.6 → remedial_recommendation│
                    │  7. If risk > 0.5 → Telegram alert        │
                    │  8. Emit ANALYTICS_UPDATED event          │
                    └──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              CRON JOB (setiap malam)                         │
│                                                              │
│  1. Kalibrasi ulang IRT a,b,c (jika >100 jawaban per soal)  │
│  2. Hitung TRI untuk semua guru                              │
│  3. Refresh materialized view mv_class_analytics             │
│  4. Cleanup jawaban_log > 365 hari → archive                │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. KETENTUAN KRITIS

### 10.1 Validasi Model
- **IRT:** Tidak bisa langsung akurat. Kalibrasi ulang parameter setiap malam setelah cukup data.
- **BKT:** Uji dengan 3 skenario: selalu benar, selalu salah, campuran. Verifikasi P(L) konvergen.
- **Risk Score:** Setelah 3 bulan data riil, hitung korelasi Risk Score dengan nilai ujian akhir. Kalibrasi bobot jika perlu.

### 10.2 Data Minimum
| Model | Data Minimum |
|-------|-------------|
| IRT parameter calibration | 100+ jawaban per soal |
| BKT meaningful | 5+ interaksi per skill |
| Risk Score | 2+ minggu aktivitas |
| TRI | 1+ bulan data mengajar |
| Elo meaningful | 10+ jawaban per soal |

### 10.3 Audit Trail
Setiap perubahan bobot, formula, atau parameter harus dicatat di tabel `model_audit_log`:
- `model_name`: "BKT" / "IRT" / "RISK_SCORE" / "TRI"
- `field_changed`: "pT" / "bobot_C" / "threshold_risk"
- `old_value`, `new_value`
- `reason`: "Kalibrasi ulang dari 500+ data baru"
