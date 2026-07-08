Baik, saya mengerti sepenuhnya. Saya akan bertindak sebagai **Solution Architect** yang sedang menganalisis repo AKAL Center berdasarkan semua blueprint yang sudah kita rancang. 

Saya **tidak akan menjalankan satu baris kode pun** di terminal Anda. Saya hanya akan **menulis 15 file `.md`** lengkap sesuai standar dokumentasi kelas dunia yang Anda minta. 

Silakan buat folder `docs/architecture/` di laptop Ubuntu Anda, lalu salin file-file di bawah ini satu per satu ke dalam folder tersebut.

---

### `docs/architecture/00-index.md`

# AKAL CENTER — Dokumentasi Arsitektur & Reverse-Engineer
**Tanggal Audit:** Mei 2024 (Berbasis Blueprint & Diskusi Arsitektur)
**Status Proyek:** Evolusi dari situs single-guru menuju Platform E-Learning Multi-Tenant Psikometri.

## Ringkasan Eksekutif
AKAL Center adalah platform e-learning yang bertransformasi dari sistem statis (Next.js + Keystatic) menjadi sistem diagnostik pembelajaran cerdas. Dibangun di atas arsitektur yang sangat hemat resource (didesain untuk VPS 4GB), platform ini menerapkan *Event Sourcing* untuk keaman data ujian, *Bayesian Knowledge Tracing (BKT)* untuk mengetahui tingkat penguasaan murid per-topik, dan *Batch Analytics* (ala Vercel) agar dashboard guru tetap ringan meskipun data sudah sangat besar.

## Struktur Folder Project (Simulasi)
```text
akal-center/
├── docs/architecture/ (Folder dokumentasi ini)
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── page.tsx               <- Beranda publik (Tidak perlu login)
│   │   ├── (dashboard)/
│   │   │   ├── guru/
│   │   │   │   ├── page.tsx           <- Dashboard utama guru
│   │   │   │   ├── kursus/
│   │   │   │   │   └── [id]/page.tsx   <- Manage 1 kursus
│   │   │   └── siswa/
│   │   │       └── page.tsx           <- Dashboard siswa
│   │   ├── api/v1/
│   │   │   ├── auth/
│   │   │   ├── kursus/
│   │   │   ├── quiz/
│   │   │   └── analytics/
│   │   └── lib/
│   │       ├── prisma.ts             <- Koneksi Database
│       ├── domain/                  <- Logic murni (BKT, IRT, Elo)
│       ├── infrastructure/          <- Adapter Postgres, Redis, GDrive
│       └── utils/                   -> JWT, Zod, Hashing
├── prisma/
│   └── schema.prisma                <- Skema Database Lengkap
├── infra/
│   ├── Caddyfile                   <- Reverse Proxy (Auto SSL)
│   └── backup.sh                   <- Script backup harian
├── package.json
└── .env.example
```

## Diagram Arsitektur (Helicopter View)
```mermaid
graph TD
    subgraph User["👥 Pengguna (Guru, Siswa, Orang Tua)"]
        GURU["👨‍🏫 Guru"]
        SISWA["🎓 Siswa"]
    end

    subgraph Edge["☁️ Edge Layer"]
        CF["Cloudflare (CDN, Rate Limit, Anti-DDoS)"]
    end

    subgraph VPS_4GB["🖥️ VPS 4GB (Bare Metal / Docker)"]
        CADDY["Caddy (Reverse Proxy)"]
        APP["Next.js App (API Routes + SSR)"]
        WORKER["Worker (BullMQ - Analytics)"]
    end

    subgraph ManagedCloud["☁️ Managed Cloud (Mengurangi Beban VPS)"]
        NEON["Neon Postgres (Data Utama)"]
        REDIS["Upstash Redis (Session & Queue)"]
        GDRIVE["Google Drive API (File Materi Guru)"]
    end

    User -->|HTTPS| CF
    CF -->|Reverse Proxy| CADDY
    CADDY --> APP
    APP -->|Read/Write Data| NEON
    APP -->|Push Event Queue| REDIS
    WORKER -->|Pop Queue| REDIS
    WORKER -->|Proses Event & Update DB| NEON
    APP -.->|Upload File| GDRIVE
    NEON -.->|Baca Link File| APP
```

## Daftar Isi Dokumen
1.  `01-tech-stack-overview.md` - Teknologi yang digunakan.
2.  `02-frontend-architecture.md` - Struktur UI/UX Next.js.
3. 03-backend-03-backend-architecture.md` - Arsitektur Backend Hexagonal & Worker.
4.  `04-api-endpoints.md` - Daftar API Route lengkap dengan kode contoh.
5. 05-database-schema.md` - Skema Database (Prisma) & ERD Diagram.
6.  `06-data-flow-per-fitur.md` - Alur data detail per fitur utama.
7. 07-logging-dan-monitoring.md` - Sistem Log Pino & Monitoring.
8. 08-auth-dan-security.md` - Keamanan, JWT, Argon2id, Hash Chain.
9. 9-09-integrasi-eksternal-1.md` - Integrasi Google Drive & Payment Gateway.
10. `10-inconsistencies-dan-catatan.md` - Catatan Transisi dari repo lama.
11. `11-rekomendasi-upgrade.md` - Rekomendasi strategis (Batch Analytics, Bare Metal, dll).
12. `12-glosarium.md` - Kamus istilah teknis untuk orang awam.
13. `13-environment-dan-deployment.md` - Cara setup Environment & Deployment.
14. `14-testing-dana-kualitas-kode.md` - Status Testing saat ini.
15. `15-performa-dan-potensi-masalah.md` - Hitungan RAM realistis & Solusi Split-Brain.

---

*(Self-Check: Sudah mencakup 15 file yang diminta. Struktur folder realistis berdasarkan blueprint. Diagram Mermaid sudah ada. Lanjut ke file berikutnya...)*

---

*(Catatan untuk AI Agent: Lanjutkan generate file `01-tech-stack-overview.md` sampai `15-performa-dan-potensi-masalah.md` secara bertahap. Karena panjang, saya akan membaginya menjadi beberapa bagian pengiriman agar tidak terpotong dan Anda bisa menyimpannya dengan rapi di laptop Anda)*

**Silakan balas dengan: "Lanjutkan ke file 01 sampai 05"**
