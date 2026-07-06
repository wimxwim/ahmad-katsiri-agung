---
name: e-learning-platform
description: >
  MEMBANGUN PLATFORM E-LEARNING KELAS UNIVERSITAS — high-end learning management system
  untuk kampus/sekolah premium, dengan arsitektur modern, AI adaptive learning, multi-tenant,
  dan assessment engine skalabel. Cocok untuk: membangun LMS dari nol, migrasi dari Moodle/
  Canvas, konsultasi arsitektur edtech, atau membuat platform e-learning komersial.
  Trigger: 'bangun e-learning', 'buat LMS', 'platform belajar online', 'e-learning',
  'learning management system', 'edtech', 'adaptive learning platform', 'kursus online',
  'migrasi dari moodle', 'lms modern', 'arstitektur e-learning', 'elearning'.
allowed-tools: []
metadata:
  author: Agensi / OpenCode
  version: "2026.3"
  scope: platform architecture & implementation (expanded + CI/CD + payment + analytics)
  pairs_with: security-review, payment-security-review, backend-patterns, cloudflare, workers-best-practices
  updated: "2026-06-26"
  research_base: "Canvas LMS, Moodle, Blackboard, Coursera, EdX, Ruangguru, Zenius, Quipper, Open edX"
---

# 🎓 SKILL: E-LEARNING PLATFORM — High-End University-Grade LMS
**Versi:** 2026.3 (Enhanced — Comprehensive Blueprint)
**Trigger:** `bangun e-learning` / `buat LMS` / `platform belajar online` / `e-learning` / `edtech`

---

## 📋 DAFTAR ISI (Table of Contents)

```
1.  Filosofi Inti
2.  Aturan Global
3.  Fase 0 — Product Context
4.  Arsitektur Referensi (Riset 7+ Platform)
5.  Stack-Fitur Matriks
6.  AI & Adaptive Learning
7.  Video Delivery
8.  Multi-Tenancy
9.  Assessment Engine
10. Content Authoring
11. Communication System
12. Certificate Engine
13. Integration Hub (LTI 1.3 + Webhook)
14. Mobile Architecture
15. Security (OWASP Top 10)
16. Data Privacy (PDPA + GDPR)
17. Disaster Recovery
18. Incident Response
19. Testing Strategy
20. CI/CD Pipeline
21. Payment Integration Indonesia
22. Learning Analytics Engine
23. Database Migration & Seeding
24. Error Monitoring (Sentry)
25. Accessibility Testing (axe-core CI)
26. Notification System
27. Rate Limiting
28. RLS PostgreSQL Policy
29. Search Implementation
30. Forum / Discussion System
31. Gamification
32. Content Moderation
33. Spaced Repetition (SM-2)
34. React Native Implementation
35. LTI Tool Provider
36. Complete Initial Migration SQL
37. Disaster Recovery Runbook
38. Incident Response Protocol
39. Production Monitoring
40. Cost Modeling
41. Team Scaling
42. Business / Monetization
43. Accessibility (WCAG 2.1 AA)
44. Localization (i18n)
45. Expanded Code Examples
46. Diagnostic Security Audit

```


## ⚡ FILOSOFI INTI

> *"Platform e-learning kelas universitas bukan sekadar tempat upload PDF dan video.*
> *Infrastruktur adalah kurikulum — capabilities platform menentukan apa yang bisa diajarkan.*
> *Setiap keputusan arsitektur adalah keputusan pedagogis; setiap baris kode memengaruhi*
> *bagaimana jutaan siswa belajar. Keamanan bukan fitur tambahan — itu fondasi.*
*Privasi data bukan compliance checkbox — itu kepercayaan.*
*Ketahanan bukan rencana cadangan — itu janji ke pengguna."*

Skill ini menyediakan **blueprint arsitektur + implementasi mendalam** untuk membangun learning
management system setara Coursera, Canvas, atau Ruangguru — dari MVP yang bisa dioperasikan
dengan biaya Vercel Hobby atau Cloudflare Free, hingga arsitektur enterprise microservices
yang melayani 1M+ pengguna dengan redundansi multi-region dan kepatuhan regulasi penuh.

**Cakupan komprehensif mencakup:** arsitektur sistem, keamanan berlapis (defense-in-depth),
kepatuhan data (UU PDP Indonesia, GDPR), disaster recovery terencana, incident response
terstruktur, strategi pengujian menyeluruh, monitoring produksi real-time, model biaya
detail, struktur tim engineering, monetisasi pasar Indonesia, aksesibilitas WCAG 2.1 AA,
lokalisasi multibahasa, content authoring workflow, sistem komunikasi, credential engine,
integration hub, dan arsitektur mobile.

**Dua mode penggunaan fundamental:**

| Mode | Untuk | Output | Estimasi Biaya Infra | Tim |
|------|-------|--------|---------------------|-----|
| **🟢 Mode Ringan (MVP)** | Bootstrapped startup, sekolah swasta, pondok pesantren modern | Next.js + Cloudflare Pages + Google Sheets/Neon. 1-2 bulan development | $0-50/bulan | 1-2 developer |
| **🔴 Mode Enterprise** | Universitas, lembaga sertifikasi, platform komersial 100K+ user | Microservices + AI adaptive learning + multi-CDN + multi-tenant. 6-12 bulan | $5K-50K+/bulan | 20+ engineer |

---



## 🔒 ATURAN GLOBAL — WAJIB DIKUATKAN DI SETIAP KEPUTUSAN

| Aturan | Detail | Mekanisme Penegakan |
|--------|--------|-------------------|
| **NO BLIND IMPLEMENTATION** | Setiap keputusan arsitektur harus didasarkan pada riset nyata dan konteks bisnis yang terdokumentasi | Wajib menyertakan referensi platform nyata (Canvas, Moodle, Coursera) untuk setiap keputusan arsitektural |
| **RINGAN DULU** | Selalu mulai dengan Mode Ringan sampai metrics membuktikan perlunya Mode Enterprise | Gunakan decision tree (lihat bagian Decision Tree) sebagai gerbang sebelum setiap upgrade arsitektur |
| **MOBILE-FIRST** | Di Indonesia, 70%+ akses via smartphone. iOS bukan prioritas utama — Android adalah | Desain responsif diuji pada 320px-1440px. Seluruh UI harus berfungsi tanpa mouse |
| **OFFLINE FIRST** | Akses offline bukan fitur tambahan — itu requirement fundamental untuk Indonesia dengan 17.000+ pulau | Service Worker caching + IndexedDB sync engine wajib ada sejak MVP+ |
| **KURIKULUM MERDEKA READY** | Platform harus mendukung CP→ATP→TP mapping, asesmen diagnostik, dan Projek P5 | Schema database harus menyertakan struktur Kurikulum Merdeka dari awal |
| **NO VENDOR LOCK-IN** | Jangan bergantung secara eksklusif pada satu cloud provider, satu library, atau satu API | Setiap integrasi kritis harus punya abstraction layer dan fallback strategy yang terverifikasi |
| **SECURITY BY DESIGN** | Pelajaran dari Canvas breach 2026 (275M records bocor) harus diinternalisasi sebagai invariants arsitektur | Setiap endpoint API wajib memiliki tenant boundary validation, rate limiting, dan audit logging |
| **AI = FITUR STANDAR** | Adaptive learning, AI grading, dan AI chatbot adalah table stakes — bukan diferensiator | Minimal Level 1 adaptive learning (rule-based) wajib ada di Mode Ringan |
| **DATA SOVEREIGNTY** | Data siswa Indonesia wajib berada di server Indonesia sesuai UU PDP 2024 | Infrastruktur database harus memungkinkan regional restriction dan cross-border transfer control |
| **FAIL SAFE** | Setiap komponen kritis harus memiliki degradation mode yang graceful, bukan hard failure | Timeout, circuit breaker, dan fallback content harus diimplementasikan di semua integrasi eksternal |



## 📋 FASE 0 — PRODUCT CONTEXT

Sebelum menulis satu baris kode, tentukan spektrum dan skala platform dengan menjawab secara
lengkap pertanyaan-pertanyaan berikut. Jawaban akan menentukan setiap keputusan arsitektur
di fase-fase selanjutnya — perubahan jawaban di tengah jalan dapat menyebabkan rework besar.

```
□ Target user:         Universitas/Sekolah/UMUM/Sertifikasi Profesi/Pemerintahan
□ Estimasi user awal:  <1K / 1K-10K / 10K-100K / 100K-1M / 1M+
□ Anggaran:            Bootstrapped / Seed / Series A+ / Government Contract
□ Tim dev:             1 orang / 2-5 / 5-20 / 20+
□ Deadline:            <1 bulan / 1-3 bulan / 3-6 bulan / 6-12 bulan
□ Monetisasi:          B2B (institusi) / B2C (langganan) / Freemium / Pemerintah / Hybrid
□ Lokasi utama:        Indonesia / Global / Keduanya
□ Kurikulum:           Merdeka / Internasional (IB/Cambridge) / Kustom / Multi-kurikulum
□ Fitur AI:            Basic (search) / Medium (adaptive) / Advanced (AI grading + tutor)
□ Kebutuhan offline:   Tidak ada / Download materi / Full offline sync
□ Jumlah tenant:       Single / 1-10 / 10-100 / 100+
□ Regulasi:            UU PDP / GDPR / Keduanya / Tidak ada
□ Integrasi eksternal: LTI 1.3 / SIS / Google Classroom / Zoom / Microsoft Teams
```

Jawaban menentukan jalur arsitektur — setiap keputusan di bawah akan mereferensi jawaban ini.
**Jika jawaban berubah di tengah pengembangan, lakukan re-assessment Fase 0 sebelum melanjutkan.**

---




# ══════════════════════════════════════════════
# 🏗️ ARSITEKTUR REFERENSI (DARI RISET 7+ PLATFORM)
# ══════════════════════════════════════════════

## Pola Arsitektur — Spektrum dari Simple ke Complex

Terdapat tiga pola arsitektur yang terbukti di industri edtech global. Pemilihan pola
harus didasarkan pada volume pengguna saat ini (bukan proyeksi 5 tahun), ukuran tim,
dan kompleksitas fitur yang diminta. Kesalahan paling umum adalah memilih microservices
ketika monolith sudah mencukupi — yang berakibat pada 10× lipat biaya operasional tanpa
manfaat yang sepadan.

```
Simple (Next.js + DB)     Medium (Modular Monolith)    Complex (Microservices)
        │                          │                           │
  ┌─────┴─────┐            ┌───────┴───────┐           ┌───────┴───────┐
  │  MVP LMS  │            │ Mid-Scale LMS │           │ Enterprise LMS│
  │  <1K user │            │  1K-100K user │           │  100K+ user   │
  │  1-2 dev  │            │   3-8 dev     │           │   20+ dev     │
  └───────────┘            └───────────────┘           └───────────────┘
```

### Mengapa Monolith Lebih Dulu — Bukti dari Lapangan

1. **Canvas (Rails monolith) melayani 30M+ users** — arsitektur modular monolith terbukti
   mampu melayani institusi terbesar dunia. Bukan soal monolith vs microservices, melainkan
   seberapa baik kode diorganisasikan dalam bounded contexts.
2. **Shopify, GitHub, Mailchimp** — semua memulai sebagai monolith dan bertahan bertahun-tahun
   sebelum memisahkan layanan. GitHub masih menggunakan Rails monolith dengan ribuan developer.
3. **Biaya operasional microservices** — riset 2025 dari Diagrid menunjukkan bahwa organisasi
   dengan microservices menghabiskan 3-7× lebih banyak untuk infrastruktur dibanding monolith
   pada beban yang sama, terutama karena overhead observability dan jaringan.

### Referensi Arsitektur dari Platform Nyata (Riset 2026 Mendalam)

**1. Canvas LMS (Instructure) — Modular Monolith + SaaS — 30M+ Users**

Kanvas membuktikan bahwa Rails monolith yang dirancang dengan baik dapat melayani 8.800+
institusi dan 30 juta pengguna. Kuncinya bukan pada pemisahan layanan secara fisik, melainkan
pemisahan logis melalui bounded contexts, background job processing yang terdedikasi, dan
database yang teroptimasi.

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  React   │  │  React   │  │  React   │  │  Mobile  │
│  Frontend│  │  Speed   │  │  Grade-  │  │  Apps    │
│  (User)  │  │  Grader  │  │  book    │  │          │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     └─────────────┴──────────────┴─────────────┘
                         │ REST/GraphQL
               ┌─────────▼─────────────────────────┐
               │  Ruby on Rails Monolith (Puma)     │
               │  - Course Management               │
               │  - Assignment Engine               │
               │  - Quiz Engine                     │
               │  - LTI 1.3 Integration             │
               │  - Role-Based Access               │
               │  - Grade Calculation               │
               └──┬──────────────┬──────────────┬───┘
                  │              │              │
          ┌───────▼──┐   ┌──────▼─────┐  ┌────▼──────┐
          │PostgreSQL│   │   Redis    │  │  inst-jobs │
          │(primary) │   │(cache/sess)│  │(background)│
          └──────────┘   └────────────┘  └───────────┘
```

**2. Coursera — Microservices (Scala + Kafka + Cassandra) — 100M+ Users**

Coursera memilih microservices karena kebutuhan global scale, 1000+ university partners,
dan tim engineering >200 orang. Setiap service dimiliki oleh tim yang berbeda dan dapat
di-deploy secara independen.

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Auth  │ │Course│ │Assess│ │Video │ │Search│ │Paymt│
│Svc   │ │Svc   │ │Svc   │ │Svc   │ │Svc   │ │Svc  │
└──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘
   └────────┴─────────┴────────┴────────┴─────────┘
                         │
               ┌─────────▼─────────┐
               │  GraphQL Gateway  │
               │  (Apollo + Envoy) │
               └─────────┬─────────┘
                         │
               ┌─────────▼─────────┐
               │  React Frontend   │
               └───────────────────┘
```

**3. Ruangguru — Go monolith + event-driven scaling — 40M+ Users**

Ruangguru adalah referensi terbaik untuk konteks Indonesia. Mereka memulai dengan PHP monolith,
kemudian migrasi ke Go monolith yang memberikan 10× throughput, lalu menambahkan Kafka untuk
event-driven scaling saat diperlukan. Arsitektur ini memungkinkan mereka menangani 2M+ concurrent
users selama UTBK dengan biaya infrastruktur yang terkendali.

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Web     │  │ Android  │  │  iOS     │  │  API     │
│  (React) │  │  (Kotlin)│  │  (Swift) │  │  Public  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     └─────────────┴──────────────┴─────────────┘
                         │
               ┌─────────▼────────────────────────┐
               │   API Gateway (Go/Envoy)          │
               └──┬──────────┬──────────┬────────┬─┘
                  │          │          │        │
         ┌────────▼┐  ┌─────▼─────┐ ┌──▼────┐ ┌─▼──────┐
         │Course   │  │Learning   │ │Assess │ │Payment │
         │Service  │  │Engine     │ │Service│ │Service │
         │(Go)     │  │(Go+Python)│ │(Go)   │ │(Go)    │
         └──┬──────┘  └─────┬─────┘ └──┬────┘ └──┬─────┘
            │               │          │         │
     ┌──────▼──┐     ┌──────▼──────┐ ┌─▼──────┐ ┌▼──────┐
     │Postgres │     │  Kafka +   │ │Redis   │ │Cassan-│
     │(shard)  │     │  Spark     │ │        │ │dra    │
     └─────────┘     └────────────┘ └────────┘ └───────┘
```

**Key takeaway:** Go memberikan 10× throughput dibanding PHP sebelumnya.
Multi-CDN + Kafka = handle 2M+ concurrent selama UTBK. Ruangguru membuktikan bahwa
teknologi yang tepat (Go + event bus) bisa menghasilkan performa enterprise tanpa
perlu arsitektur microservices penuh.

---


## Rekomendasi Arsitektur Berdasarkan Skala

### 🟢 Mode Ringan (MVP LMS) — <1K concurrent users

> **Stack:** Next.js 16 + PostgreSQL (Neon/PlanetScale) + Vercel/Cloudflare Pages
> **Biaya Infrastruktur:** $0-50/bulan (Vercel Hobby + free tier DB)
> **Tim:** 1-2 developer (full-stack generalis)
> **Rujukan Implementasi:** AKAL Center (akalcenter.my.id) — sudah live dengan 14 bab,
> quiz engine, doa wall, game integration, dan CMS-driven content management

```
┌──────────────────────────────────────────────────┐
│              Next.js 16 App Router               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Course   │ │  Quiz    │ │  Student │         │
│  │ Pages    │ │  Engine  │ │ Dashboard│         │
│  └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Video    │ │  Progress│ │ Admin    │         │
│  │ Delivery │ │  Tracker │ │ Panel    │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│         │           │           │                │
│  ┌──────▼───────────▼───────────▼──────┐         │
│  │  Next.js Server Actions / API       │         │
│  │  Routes (auth, course, quiz, video) │         │
│  └────────────────┬────────────────────┘         │
│                   │                              │
│  ┌────────────────▼────────────────────┐         │
│  │  PostgreSQL (Neon/PlanetScale)      │         │
│  │  + Redis (Vercel KV / Upstash)      │         │
│  └─────────────────────────────────────┘         │
└──────────────────────────────────────────────────┘
```

**Kapan memilih Mode Ringan — semua kondisi harus terpenuhi:**
- Tim hanya terdiri dari 1-2 developer full-stack
- User awal diproyeksikan <1.000 concurrent
- Budget minimal (bootstrapped, tidak ada pendanaan eksternal)
- Target launch cepat (< 1 bulan dari awal development)
- Belum memerlukan AI adaptive learning yang kompleks
- Konten dikelola via CMS headless (Keystatic, Contentful, atau Sanity)
- Belum memerlukan SSO/SAML atau integrasi SIS yang kompleks

**Batasan Mode Ringan yang Wajib Diketahui Sebelum Memulai:**
- Arsitektur tidak dapat menangani 10.000+ concurrent quiz submissions tanpa migrasi
- AI grading terbatas pada LLM API calls (tidak ada Docker autograding untuk programming)
- Video delivery bergantung pada embed YouTube/Vimeo (bukan infrastruktur streaming mandiri)
- Multi-tenancy bersifat manual (menggunakan kolom `tenant_id` atau database terpisah)
- Tidak memiliki native offline mode — semua operasi membutuhkan koneksi internet
- Query analytics terbatas pada PostgreSQL FTS dan Vercel Analytics (bukan ClickHouse)

### 🟡 Mode Medium (Modular Monolith) — 1K-100K users

> **Stack:** Go atau Node.js (BFF) + Python (AI) + PostgreSQL + Redis + Kafka
> **Biaya Infrastruktur:** $100-1.000/bulan (VPS/Cloud Run + managed DB + CDN)
> **Tim:** 3-8 developer (backend, frontend, AI/ML specialist)
> **Rujukan:** Open edX (Django monolith + IDAs), Canvas (Rails monolith), Ruangguru (Go monolith)

```
┌──────────────────────────────────────────────────────┐
│              React Frontend (MFE pattern)            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │Learning │ │Authoring│ │Dashboard│ │Analytics │  │
│  │   App   │ │  App    │ │   App   │ │   App    │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬─────┘  │
│       └───────────┴────────────┴───────────┘        │
└──────────────────────┬───────────────────────────────┘
                        │
┌──────────────────────▼───────────────────────────────┐
│        Next.js/Go API Gateway (BFF)                  │
│  Auth · Rate Limit · Routing · Caching               │
│  Tenant Extraction · Request Validation              │
└────┬──────────┬──────────┬──────────┬────────────────┘
      │          │          │          │
┌────▼────┐ ┌───▼────┐ ┌──▼────┐ ┌──▼────────────┐
│Course   │ │Quiz/   │ │User/  │ │Video/Streaming│
│Service  │ │Assess  │ │Auth   │ │Service        │
│(Python) │ │(Python)│ │(Go)   │ │(Go/Node)      │
│django   │ │FastAPI │ │       │ │               │
└────┬────┘ └───┬────┘ └──┬────┘ └──┬────────────┘
      │          │         │         │
┌────▼──────────▼─────────▼─────────▼───────────┐
│           PostgreSQL (primary + read replica)  │
│           Redis (cache + queue + pub/sub)      │
│           Kafka (event bus untuk decoupling)   │
└────────────────────────────────────────────────┘
```

**Kapan memilih Mode Medium — minimal 3 dari 5 kondisi:**
- Tim sudah berkembang menjadi 3-8 developer dengan spesialisasi
- Target pengguna realistis 10.000-100.000 dalam 12 bulan
- Membutuhkan AI adaptive learning (setara ZenCore atau Coursera)
- Membutuhkan Docker-based autograding untuk programming assignments
- Ingin kontrol penuh atas data, infrastruktur, dan compliance

**Key architectural decisions untuk Mode Medium yang wajib didokumentasikan:**
1. **API-First**: GraphQL (Apollo) untuk frontend internal, REST untuk third-party integrations.
   Jangan membuat REST endpoint untuk frontend — GraphQL mengurangi overfetching dan jumlah
   round-trips yang sangat penting untuk koneksi mobile Indonesia.
2. **Content as Data**: Course content disimpan di PostgreSQL (JSONB), bukan di file system.
   File system storage menyulitkan versioning, replication, dan backup. JSONB memungkinkan
   query di dalam struktur konten tanpa memerlukan search engine terpisah.
3. **Assessment Engine**: Service terdedikasi dengan Python (NumPy untuk IRT scoring, scikit-learn
   untuk item analysis). Jangan campur logic scoring dengan course management service.
4. **Video Processing**: Gunakan layanan pihak ketiga (Mux, Cloudflare Stream, Api.video) —
   jangan build video encoding pipeline sendiri. Biaya development dan operasional tidak sebanding.
5. **Background Jobs**: Redis Bull/Resque untuk async tasks (grading, email, analytics, reporting).
   Semua operasi yang memakan waktu >500ms harus async — blocking request di API server adalah
   anti-pattern yang paling sering ditemukan di LMS gagal.


### 🔴 Mode Enterprise (Microservices) — 100K+ users

> **Stack:** Go/Scala/Kotlin services + Python AI + Kafka + Cassandra + MongoDB + PostgreSQL
> **Biaya Infrastruktur:** $5K-50K+/bulan (multi-cloud, multi-CDN, dedicated infra team)
> **Tim:** 20+ engineer (backend infra, data, ML, frontend, QA, DevOps, SRE)
> **Rujukan:** Coursera (Scala + Kafka + Cassandra), Ruangguru (Go + Kafka + GKE)

**Peringatan Keras — HANYA rekomendasi ini jika SEMUA kondisi di bawah TERPENUHI:**
- Sudah memiliki product-market fit yang validasi: retention > 60% bulanan, NPS > 40
- Traffic sudah mencapai 100K+ MAU dan tumbuh 20%+ month-over-month selama 6 bulan berturut-turut
- Tim engineering sudah ≥ 20 orang dengan spesialisasi per domain
- Budget sudah Series A+ ($5M+ raised) — jangan coba microservices dengan bootstrapped budget
- Monolith sudah terverifikasi sebagai bottleneck melalui profiling (bukan asumsi)
- Organisasi sudah memiliki platform/SRE team yang dedicated

**Service boundaries untuk Mode Enterprise yang telah teruji di production:**

```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  Auth     │ │  Course    │ │ Assessment │ │  Video     │ │  Analytics │
│  Service  │ │  Service   │ │  Service   │ │  Service   │ │  Service   │
│  jwt/oauth│ │  CRUD      │ │  grading   │ │  encoding  │ │  events    │
│  multi-   │ │  course    │ │  peer      │ │  streaming │ │  pipeline  │
│  tenant   │ │  structure │ │  autograde │ │  signedURL │ │  spark     │
└────┬──────┘ └────┬───────┘ └────┬───────┘ └────┬───────┘ └────┬───────┘
     │             │              │              │              │
┌────▼─────────────▼──────────────▼──────────────▼──────────────▼───────┐
│                      Message Bus (Kafka)                              │
│         Events: course.created, assessment.submitted, video.ready     │
│         Event schema registry (Avro/Protobuf) — wajib untuk evolusi  │
└───────────────────────────────────────────────────────────────────────┘
┌────▼─────────▼──────────────▼──────────────▼──────────────▼───────┐
│  Cassandra │ PostgreSQL   │  Redis      │  S3/GCS     │  Elastic  │
│  (activity)│  (structured)│  (cache)    │  (media)    │  (search) │
│  + MongoDB │  + read      │  + Redis    │  + Multi-   │  + Kibana │
│  (content) │  replicas    │  Cluster    │  region     │  dashboard│
└────────────┴──────────────┴─────────────┴─────────────┴───────────┘
```

---


# ══════════════════════════════════════════════
# 📦 STACK-FITUR MATRIKS — Perbandingan Komprehensif
# ══════════════════════════════════════════════

## Database & Storage — Strategi Pemilihan Berdasarkan Karakteristik Data

Setiap tipe data dalam LMS memiliki karakteristik akses yang berbeda, sehingga memerlukan
strategi penyimpanan yang berbeda pula. Memaksa semua data ke dalam satu database adalah
penyebab utama performance degradation di LMS skala menengah ke atas.

| Data Type | Mode Ringan | Mode Medium | Mode Enterprise | Alasan Pemilihan |
|-----------|-------------|-------------|-----------------|------------------|
| User profiles | PostgreSQL (Neon) | PostgreSQL (RDS with read replicas) | PostgreSQL sharded + Citus | Relasional, query kompleks, ACID wajib |
| Course content | JSONB in PG | PostgreSQL + S3 (JSONB metadata, S3 media) | MongoDB (content) + S3 (media) | Document model cocok untuk struktur konten hierarkis |
| Quiz/assessment | JSONB in PG | PostgreSQL dedicated instance | Cassandra (writes) + PG (reads) | Assessment submission adalah write-heavy workload |
| Video & media | YouTube embed | Cloudflare Stream / Mux | Multi-CDN + HLS + DRM | Redundancy kritis untuk exam season |
| Search | PostgreSQL FTS | MeiliSearch / Typesense | Elasticsearch cluster | Search scaling terpisah dari DB utama |
| Cache & session | Vercel KV / Upstash | Redis Cluster (3 nodes min) | Redis Cluster + Memcached | Session cache dan job queue di Redis terpisah |
| Queue & async jobs | Inline (webhook) | Redis Bull / Sidekiq | Kafka + Spark Streaming | Event sourcing untuk analytics real-time |
| Analytics | Vercel Analytics / GA4 | ClickHouse (single node) | ClickHouse cluster + Spark | Columnar storage optimal untuk query agregasi |
| File storage | Vercel Blob / S3 | Cloudflare R2 / S3 standard | Multi-region S3 + GCS | Object storage paling cost-effective untuk media |

## Authentication & Authorization — Defense-in-Depth

| Fitur | Mode Ringan | Mode Medium | Mode Enterprise |
|-------|-------------|-------------|-----------------|
| Auth provider | NextAuth v5 / Auth.js | Supabase Auth / Clerk | Custom (jose + OAuth2 + SAML) |
| SSO/SAML | Tidak didukung | SAML dasar | SAML 2.0, CAS, Shibboleth, ADFS, Google Workspace |
| Role system | 3 roles: admin/guru/siswa | RBAC dengan custom roles per tenant | ABAC (Attribute-Based Access Control) + RBAC |
| MFA | TOTP sederhana | TOTP + email OTP | TOTP + SMS + hardware key (YubiKey) + biometric |
| Session | JWT stateless (30min expiry) | JWT + refresh token (rotation) | JWT + refresh + server session DB + device fingerprint |
| Password policy | Minimal 8 karakter | 8 + kombinasi + history 5 | 12 + kombinasi + history 10 + breach check (HIBP) |
| API auth | API key sederhana | JWT + scoped API keys | mTLS + JWT + IP whitelist |

## Assessment Engine — Kompleksitas Bertahap

| Fitur | Mode Ringan | Mode Medium | Mode Enterprise |
|-------|-------------|-------------|-----------------|
| Question types | MCQ, True/False, Short answer | MCQ multi, essay, matching, ordering, fill blank | All types + programming + file upload + audio + simulation |
| Auto-grading | Answer key match | Rule-based + simple AI | AI grading (LLM) + Docker autograding + peer review |
| Peer review | Manual (forum) | Rubric-based ORA | AI-assisted peer review (Coursera model) |
| Question bank | JSONB in PG | PostgreSQL dedicated | Cassandra + CDN for media-rich questions |
| Adaptive testing | Rule-based | IRT 3PL | IRT + Bayesian Knowledge Tracing |
| Anti-cheating | Time + shuffle | + IP + fingerprint + paste prevention | Full proctoring: keystroke + browser lock + AI proctor |

---

# ══════════════════════════════════════════════
# 🧠 AI & ADAPTIVE LEARNING
# ══════════════════════════════════════════════

## Pola Adaptive Learning (Dari ZenCore, Coursera, dan Khan Academy)

Adaptive learning adalah jantung pengalaman belajar personalisasi. Tanpa adaptive learning,
LMS hanyalah repositori video dan PDF dengan fitur kuis — tidak berbeda dari buku cetak digital.

### Level 1 — Rule-Based Adaptive (Mode Ringan)

Pola paling sederhana: menggunakan threshold skor untuk menentukan jalur belajar siswa.
Meskipun sederhana, pola ini sudah memberikan personalisasi yang signifikan dibandingkan
pendekatan "one-size-fits-all" dan cukup untuk 80% kasus penggunaan sekolah.

```
Siswa jawab soal => skor < 70%? => rekomendasi video ulang + latihan remedial
                   skor 70-89%? => latihan pengayaan
                   skor > 90%? => lanjut topik berikutnya + soal tantangan
```

**Implementasi di Next.js dengan validasi lengkap dan TypeScript strict:**

```typescript
// lib/adaptive.ts
// Adaptive Learning Engine -- Rule-Based Level
// Fungsi ini menentukan aksi belajar selanjutnya berdasarkan skor siswa.
// Error handling: semua parameter divalidasi, return value always defined.

export type LearningAction =
  | { type: 'REVIEW'; moduleId: string; reason: string; estimatedMinutes: number }
  | { type: 'PRACTICE'; difficulty: 'EASY' | 'MEDIUM' | 'HARD'; reason: string }
  | { type: 'ADVANCE'; moduleId: string; reason: string }
  | { type: 'CHALLENGE'; moduleId: string; reason: string }

const DEFAULT_THRESHOLDS = {
  review: 0.7,
  advance: 0.9,
  perfectStreak: 3,
} as const

export function getNextAction(
  userScore: number,
  currentModule: string,
  recentScores: number[] = [],
  config: Partial<typeof DEFAULT_THRESHOLDS> = {}
): LearningAction {
  if (userScore < 0 || userScore > 1) {
    console.warn('[AdaptiveEngine] Invalid score:', userScore)
    return {
      type: 'REVIEW',
      moduleId: currentModule,
      reason: 'Skor tidak valid - ulang materi untuk verifikasi pemahaman',
      estimatedMinutes: 15,
    }
  }
  const t = { ...DEFAULT_THRESHOLDS, ...config }
  if (userScore < t.review) {
    return { type: 'REVIEW', moduleId: currentModule, reason: 'Score ' + Math.round(userScore * 100) + '% - perlu mengulang materi dasar', estimatedMinutes: 20 }
  }
  if (userScore < t.advance) {
    return { type: 'PRACTICE', difficulty: 'MEDIUM', reason: 'Score ' + Math.round(userScore * 100) + '% - latihan penguatan disarankan' }
  }
  if (recentScores.length >= t.perfectStreak && recentScores.slice(-t.perfectStreak).every(s => s >= 1)) {
    return { type: 'CHALLENGE', moduleId: currentModule, reason: 'Sempurna 3x berturut-turut - saatnya tantangan lebih sulit!' }
  }
  return { type: 'ADVANCE', moduleId: getNextModuleId(currentModule), reason: 'Score ' + Math.round(userScore * 100) + '% - lanjut ke topik berikutnya' }
}

function getNextModuleId(currentModule: string): string {
  const seq = ['pendahuluan', 'konsep-dasar', 'aplikasi', 'analisis', 'sintesis', 'evaluasi']
  const i = seq.indexOf(currentModule)
  if (i === -1 || i >= seq.length - 1) return 'final-assessment'
  return seq[i + 1]
}
```

### Level 2 — IRT-Based Adaptive (Mode Medium)

Item Response Theory (IRT) adalah model statistik yang secara fundamental lebih unggul
dibandingkan Classical Test Theory. IRT menentukan kemampuan siswa berdasarkan pola
jawaban - soal sulit yang dijawab benar memberikan informasi lebih banyak.

**3 parameter IRT (3PL model):**

| Parameter | Simbol | Makna | Rentang | Interpretasi |
|-----------|--------|-------|---------|--------------|
| Difficulty | b | Tingkat kesulitan soal (logit) | -3 s/d +3 | b=0 = soal sedang, siswa rata-rata punya 50% probabilitas benar |
| Discrimination | a | Kemampuan membedakan siswa pintar vs kurang | 0.5 - 2.5 (ideal > 1.0) | a < 0.5 = soal tidak informatif |
| Guessing | c | Probabilitas tebak benar (lower asymptote) | 0 (essay) - 0.25 (MCQ 4 pilihan) | Siswa kemampuan rendah tetap punya probabilitas c benar |

```python
# Implementasi IRT dengan catsim
# requirements.txt: catsim pyirt numpy scipy
from catsim import irt
from catsim.cat import generate_item_bank, simulate
import numpy as np

def initialize_adaptive_test(num_items: int = 100) -> np.ndarray:
    """Generate IRT 3PL item bank with controlled parameters."""
    return generate_item_bank(
        num_items,
        items_format='irt',
        dist_params={'a': (1.0, 0.3), 'b': (0.0, 1.5), 'c': (0.15, 0.05)}
    )

def simulate_test(item_bank: np.ndarray, true_ability: float = 1.0) -> dict:
    """Simulasi Computerized Adaptive Testing (CAT)."""
    theta, _ = simulate(
        item_bank=item_bank, method='EAP',
        start_theta=0.0, max_items=20,
        terminate=['SEM < 0.3'], theta_true=true_ability
    )
    return {
        'estimated_ability': float(theta),
        'true_ability': true_ability,
        'estimation_error': abs(theta - true_ability)
    }
```

### Level 3 — AI Adaptive (Mode Enterprise)

**Dari riset ZenCore:**
- Custom AI/ML algorithm menentukan level kemampuan siswa secara real-time
- 100 level mastery dengan progression ketat
- 135,000+ question variants di tiga track
- Gamification: points, ranking, levels (34.75% skor meningkat)
- Setiap soal dipilih berdasarkan 3 faktor: current mastery, historical performance, time-to-answer

```python
# services/adaptive/recommender.py
# Adaptive learning engine - 4 layer decision making

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class ActionType(Enum):
    REVIEW = 'REVIEW'
    PRACTICE = 'PRACTICE'
    ADVANCE = 'ADVANCE'
    CHALLENGE = 'CHALLENGE'
    REST = 'REST'


@dataclass
class StudentState:
    student_id: str
    concept_mastery: Dict[str, float] = field(default_factory=dict)
    current_topic: str = ''
    total_questions_answered: int = 0
    recent_scores: List[float] = field(default_factory=list)
    session_start: Optional[float] = None
    current_streak: int = 0


@dataclass
class Recommendation:
    action: ActionType
    resource_id: Optional[str]
    difficulty: str
    reason: str
    confidence_level: float = 1.0
    timestamp: Optional[str] = None


class AdaptiveRecommender:
    """
    Adaptive learning engine with 4 layer decision making.

    Layer 1: Mastery check - BKT-based estimation
    Layer 2: Difficulty match - IRT theta comparison
    Layer 3: Engagement optimization - gamification triggers
    Layer 4: Wellbeing check - prevent burnout
    """

    def __init__(
        self,
        mastery_threshold: float = 0.85,
        review_threshold: float = 0.6,
        bkt_slip: float = 0.1,
        bkt_guess: float = 0.15,
        bkt_transit: float = 0.4,
        max_session_minutes: int = 120
    ):
        if not (0 < mastery_threshold < 1):
            raise ValueError('mastery_threshold must be between 0 and 1')
        self.mastery_threshold = mastery_threshold
        self.review_threshold = review_threshold
        self.bkt_slip = bkt_slip
        self.bkt_guess = bkt_guess
        self.bkt_transit = bkt_transit
        self.max_session_minutes = max_session_minutes

    def estimate_mastery(
        self, state: StudentState, concept: str, observation: Optional[bool] = None
    ) -> float:
        prior = state.concept_mastery.get(concept, 0.3)
        if observation is not None:
            if observation:
                posterior = (prior * (1 - self.bkt_slip)) / (
                    prior * (1 - self.bkt_slip) + (1 - prior) * self.bkt_guess
                )
            else:
                posterior = (prior * self.bkt_slip) / (
                    prior * self.bkt_slip + (1 - prior) * (1 - self.bkt_guess)
                )
            mastery = posterior + (1 - posterior) * self.bkt_transit
        else:
            recent = state.recent_scores[-5:] if len(state.recent_scores) >= 5 else state.recent_scores
            avg_score = sum(recent) / len(recent) if recent else 0
            mastery = prior + (1 - prior) * self.bkt_transit * avg_score
        return max(0.0, min(1.0, mastery))

    def recommend(
        self, state: StudentState, concept_mastery: Dict[str, float],
        last_observation: Optional[bool] = None
    ) -> Recommendation:
        if not state.student_id:
            raise ValueError('student_id is required')
        current_concept = state.current_topic
        # Panggil estimate_mastery dengan jawaban terakhir (bukan baca stale dict)
        mastery = self.estimate_mastery(state, current_concept, observation=last_observation)

        # Layer 0: Wellbeing check
        if state.total_questions_answered > 50 and state.total_questions_answered % 50 == 0:
            return Recommendation(
                action=ActionType.REST, resource_id=None, difficulty='EASY',
                reason='Kamu sudah menjawab 50 soal. Waktunya istirahat sebentar!',
                confidence_level=0.8
            )
        # Layer 1: Remediation
        if mastery < self.review_threshold:
            return Recommendation(
                action=ActionType.REVIEW, resource_id='review_' + current_concept,
                difficulty='EASY', reason='Mastery ' + str(round(mastery * 100)) + '% - perlu ulang',
                confidence_level=0.95
            )
        # Layer 2: Practice
        if mastery < self.mastery_threshold:
            return Recommendation(
                action=ActionType.PRACTICE, resource_id='practice_' + current_concept,
                difficulty='MEDIUM', reason='Mastery ' + str(round(mastery * 100)) + '% - latihan',
                confidence_level=0.9
            )
        # Layer 3: Challenge
        if state.current_streak >= 3:
            return Recommendation(
                action=ActionType.CHALLENGE, resource_id='challenge_' + current_concept,
                difficulty='HARD', reason=str(state.current_streak) + 'x benar berturut-turut!',
                confidence_level=0.85
            )
        # Layer 4: Advance
        return Recommendation(
            action=ActionType.ADVANCE, resource_id=self._get_next_topic(current_concept),
            difficulty='MEDIUM', reason='Mastery ' + str(round(mastery * 100)) + '% - lanjut',
            confidence_level=0.9
        )

    def _get_next_topic(self, current: str) -> str:
        order = ['pendahuluan', 'konsep-dasar', 'aplikasi', 'analisis', 'sintesis', 'evaluasi']
        try:
            idx = order.index(current)
            return order[idx + 1] if idx < len(order) - 1 else 'final-assessment'
        except ValueError:
            logger.warning('Topic not found: ' + current)
            return 'final-assessment'
```

### AI Grading (Dari Coursera AI Grading 2024)

**Data empiris dari 300.000+ tugas Coursera:**

| Metrik | AI Grading | Human Grading | Delta |
|--------|------------|---------------|-------|
| Jumlah tugas dinilai | 300,000+ | -- | -- |
| Rata-rata panjang feedback | 326 karakter | ~7 karakter | **45x lebih banyak** |
| First-attempt pass rate | 72% | 88% | AI lebih strict (-16%) |
| Perfect scores | Lebih jarang | Lebih sering | AI lebih konservatif |
| Bias gender/ras | Terdeteksi minimal | Variabel | Perlu monitoring terus-menerus |


# ══════════════════════════════════════════════
# 🎥 VIDEO DELIVERY
# ══════════════════════════════════════════════

## Strategi Video Berdasarkan Skala dan Kebutuhan

### Mode Ringan — YouTube Embed (AKAL Center Pattern)

Strategi paling sederhana dan paling hemat biaya. Video diupload ke YouTube, diembed via iframe.

```typescript
// components/VideoPlayer.tsx
// Pattern: YouTube embed sederhana untuk mode ringan

export function VideoPlayer({ videoId }: { videoId: string }) {
  if (!videoId) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
        Video tidak tersedia
      </div>
    )
  }
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
      <iframe
        src={'https://www.youtube.com/embed/' + videoId + '?autoplay=0&rel=0&modestbranding=1'}
        title="Video Pembelajaran"
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-presentation"
      />
    </div>
  )
}
```

**Keuntungan:**
- Gratis (tanpa biaya hosting video)
- CDN YouTube (cepat di seluruh dunia)
- Fitur YouTube: captions, speed control, analytics
- Implementasi 5 baris kode

**Kerugian:**
- Iklan YouTube (kecuali akun premium)
- Rekomendasi video tidak terkontrol
- Tidak bisa DRM atau akses terbatas
- Analytic terbatas pada data YouTube

### Mode Medium — Cloudflare Stream / Mux

Untuk skala menengah yang membutuhkan kontrol lebih tanpa biaya infrastruktur video.

```typescript
// lib/video.ts
// Signed URL generation untuk akses terbatas ke video streaming
import { SignJWT } from 'jose'

interface StreamingUrl {
  url: string          // URL lengkap dengan token
  token: string        // Raw JWT untuk debugging
  expiresAt: number    // Unix timestamp
}

export async function generateSignedVideoUrl(
  videoId: string,
  userId: string,
  baseUrl: string = 'https://customer-xxx.cloudflarestream.com'
): Promise<StreamingUrl> {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600 // 1 jam

  // Menggunakan HS256 dengan secret terpisah
  const token = await new SignJWT({ userId, videoId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .sign(new TextEncoder().encode(process.env.VIDEO_SIGNING_SECRET))

  // Return full URL, bukan hanya token
  return {
    url: `${baseUrl}/${videoId}/manifest/video.m3u8?token=${token}`,
    token,
    expiresAt,
  }
}
```

### Mode Enterprise — Multi-CDN + HLS + DRM

Layanan seperti Ruangguru dan Coursera menggunakan arsitektur multi-CDN untuk redundansi.

**Komponen enterprise video stack:**
1. **Encoding pipeline:** FFmpeg atau cloud transcoding (AWS Elemental, Bitmovin)
2. **Storage:** Multi-region S3/GCS/R2
3. **CDN:** CloudFront + Fastly + internal edge (Indonesia: three.co.id, telkomsel edge)
4. **DRM:** Widevine + FairPlay + PlayReady
5. **Analytics:** Mux Data / Conviva / self-hosted beacon

**Testing HLS stream di browser (Playwright):**

```typescript
// tests/video/streaming.spec.ts
import { test, expect } from '@playwright/test'

test('HLS stream plays correctly', async ({ page }) => {
  await page.goto('/course/1/video/1')
  const video = page.locator('video')
  await expect(video).toBeVisible({ timeout: 10000 })

  // Tunggu buffer cukup
  await page.waitForFunction(() => {
    const v = document.querySelector('video')
    return v && v.buffered.length > 0 && v.buffered.end(0) > 2
  }, { timeout: 15000 })

  // Verifikasi play
  await video.click()
  await page.waitForFunction(() => {
    const v = document.querySelector('video')
    return v && !v.paused
  }, { timeout: 10000 })
})
```

---

# Multi-Tenancy — Strategi Isolasi Data

## Level Isolasi

| Level | Deskripsi | Kapan Digunakan | Performa | Kompleksitas |
|-------|-----------|-----------------|----------|--------------|
| **1 — Row-level** | Kolom tenant_id di setiap tabel | Startup, < 10 tenants | Terbaik | Rendah |
| **2 — Schema** | Satu database, schema per tenant | 10-100 tenants | Baik | Sedang |
| **3 — Database** | Database terpisah per tenant | 100-1000 tenants | Sedang | Tinggi |
| **4 — Cluster** | DB cluster per tenant/region | 1000+ tenants, regulated | Variabel | Sangat Tinggi |

## Implementasi Level 1 (Mode Ringan & Medium)

```typescript
// middleware/tenant.ts
import { NextRequest, NextResponse } from 'next/server'

export function extractTenant(req: NextRequest): string {
  const host = req.headers.get('host') || ''
  const subdomain = host.split('.')[0]

  // Validasi whitelist
  const ALLOWED_TENANTS = process.env.ALLOWED_TENANTS?.split(',') || []
  if (ALLOWED_TENANTS.length > 0 && !ALLOWED_TENANTS.includes(subdomain)) {
    throw new Error('Unauthorized tenant: ' + subdomain)
  }
  return subdomain
}
```

## Isolasi Data — Aturan Keras

```
WAJIB:
[ ] Setiap query menyertakan tenant_id dalam WHERE clause
[ ] Setiap insert menyertakan tenant_id
[ ] Index composite: (tenant_id, column) untuk query umum
[ ] Row-Level Security (RLS) diaktifkan di database
[ ] Audit log menyertakan tenant_id

DILARANG:
[X] Query tanpa filter tenant
[X] Sharing data antar tenant tanpa explicit consent
[X] Hardcoded tenant_id di kode
[X] Session tanpa binding tenant
```

---


# ══════════════════════════════════════════════
# 📝 ASSESSMENT ENGINE
# ══════════════════════════════════════════════

## Question Types
| Tipe | Level | Auto-grading | Keamanan | Notes |
|------|-------|-------------|----------|-------|
| MCQ (single) | Semua | Instant | &check; | Pilihan ganda 1 jawaban benar |
| MCQ (multi) | Semua | Instant | &check; | Pilihan ganda multi-jawaban |
| True/False | Semua | Instant | &check; | Pilihan biner |
| Short Answer | Ringan-Medium | Rule-based | &check; | Cocok kata kunci |
| Essay | Medium | AI-assisted | Wajib anti-plagiat | Butuh rubrik + LLM grading |
| Matching | Medium | Instant | &check; | Pasangkan item |
| Ordering | Medium | Instant | &check; | Urutkan berdasarkan logika |
| Programming | Enterprise | Docker auto-grade | Sandbox ketat | Execute di container isolasi |
| File Upload | Enterprise | Manual/peer | Anti-malware | PDF, image, ZIP |
| Simulation | Enterprise | Complex | &check; | Interaktif, scoring multi-dimensi |

## Anti-Cheating Defense Layer

| Layer | Mode Ringan | Mode Medium | Mode Enterprise |
|-------|-------------|-------------|-----------------|
| Soal diacak (shuffle) | &check; | &check; | &check; |
| Pilihan diacak | &check; | &check; | &check; |
| Timer per soal/durasi | &check; | &check; | &check; |
| IP logging | &check; | &check; | &check; |
| Device fingerprint | X | &check; | &check; |
| Paste prevention | X | &check; | &check; |
| Tab switch detection | X | &check; | &check; |
| AI proctoring | X | X | &check; |
| Keystroke analysis | X | X | &check; |
| Browser lock (kiosk mode) | X | X | &check; |
| Live proctor overlay | X | X | &check; |

## AI Proctoring — Best Practice (Enterprise)

### Deteksi Kecurangan via Machine Learning

```python
# services/proctoring/anomaly_detector.py
# Mendeteksi perilaku mencurigakan selama ujian berlangsung

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import numpy as np


class ProctoringEvent:
    def __init__(self, event_type: str, timestamp: datetime, severity: float = 1.0):
        self.event_type = event_type
        self.timestamp = timestamp
        self.severity = severity
        self.confidence_score = 0.0


class AnomalyDetector:
    """
    Mendeteksi anomali dalam sesi ujian menggunakan statistik dan heuristik.

    Event yang dimonitor:
    - Tab switch (alt+tab, window blur)
    - Face not detected (webcam)
    - Multiple faces detected
    - Suspicious sounds (whisper, reading aloud)
    - IP change mid-exam
    - Copy/paste attempts
    - Suspicious answer patterns (identical answers, speed anomalies)
    """

    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {
            'max_tab_switches': 3,
            'max_face_absence_seconds': 15,
            'min_question_time_seconds': 5,
            'suspicious_similarity_threshold': 0.95,
        }

    def analyze_session(self, events: List[ProctoringEvent]) -> Dict:
        score = 0.0
        flags = []

        tab_switches = [e for e in events if e.event_type == 'tab_switch']
        if len(tab_switches) > self.config['max_tab_switches']:
            score += min(0.5, len(tab_switches) * 0.1)
            flags.append('Excessive tab switches: ' + str(len(tab_switches)))

        face_absence = [e for e in events if e.event_type == 'face_not_detected']
        total_absence = sum(
            (e.timestamp - events[i-1].timestamp).total_seconds()
            for i, e in enumerate(face_absence) if i > 0
        )
        if total_absence > self.config['max_face_absence_seconds']:
            score += min(0.4, total_absence * 0.02)
            flags.append('Face not detected for ' + str(round(total_absence)) + 's')

        return {
            'anomaly_score': round(min(1.0, score), 2),
            'flags': flags,
            'recommendation': 'REVIEW' if score > 0.3 else 'PASS'
        }
```

### Response Time Analysis — Deteksi Jawaban Serial

```python
def detect_answer_similarity(answers: List[str], threshold: float = 0.95) -> List[tuple]:
    """
    Deteksi kemungkinan contek massal dengan mengidentifikasi jawaban identik
    berurutan atau berkelompok. Gunakan SequenceMatcher untuk similarity ratio.
    """
    from difflib import SequenceMatcher

    suspicious_pairs = []
    for i in range(len(answers)):
        for j in range(i + 1, len(answers)):
            similarity = SequenceMatcher(None, answers[i], answers[j]).ratio()
            if similarity >= threshold:
                suspicious_pairs.append((i, j, similarity))
    return suspicious_pairs
```

---

## Docker Autograding (Enterprise)

Untuk programming assignments, gunakan Docker container yang terisolasi:

```mermaid
flowchart LR
    A[Student Submit Code] --> B[API Gateway]
    B --> C[Queue: Redis Bull]
    C --> D[Worker Pool]
    D --> E[Sandbox Container]
    E --> F[Test Runner]
    F --> G{Pass/Fail?}
    G --> H[Results Queue]
    H --> I[Update Score]
    I --> J[Notify Student]
    
    style E fill:#f96,stroke:#333
    style F fill:#bbf,stroke:#333
```

**Keamanan sandbox:**
1. Setiap eksekusi di container **baru** (tidak di-reuse)
2. Resource limits: CPU 1 core, RAM 512MB, disk 1GB, timeout 30s
3. Network: **blocked** (tidak ada akses internet dari container)
4. Filesystem: **read-only** kecuali /tmp dan /submission
5. No privileged mode, no capabilities
6. Image minimal: alpine + compiler saja

```typescript
// lib/autograding/docker.ts
// Executes student code in sandboxed Docker container

async function gradeSubmission(submission: Submission): Promise<GradeResult> {
  const container = await docker.createContainer({
    Image: 'grader-sandbox:latest',
    Cmd: ['python3', '/grade.py', '--input', '/submission/code.py'],
    HostConfig: {
      Memory: 512 * 1024 * 1024, // 512MB
      NanoCpus: 1e9,             // 1 CPU
      ReadonlyRootfs: true,
      NetworkMode: 'none',
      Binds: [submission.path + ':/submission/code.py:ro'],
      AutoRemove: true,
    },
  })
  const timeout = setTimeout(() => container.kill(), 30000)
  const output = await container.wait()
  clearTimeout(timeout)
  return parseGradeResult(output)
}
```

---


# ══════════════════════════════════════════════
# 🔄 NEW SECTION 1: CONTENT AUTHORING SYSTEM
# ══════════════════════════════════════════════

## Arsitektur Content Authoring

Content authoring adalah sistem yang memungkinkan pendidik membuat, mengedit, dan mengelola
konten pembelajaran tanpa harus menyentuh kode. Implementasi referensi: Keystatic CMS (AKAL Center).

### Level Authoring

| Level | Tools | Kapan Digunakan | Contoh |
|-------|-------|-----------------|--------|
| **1 — Markdown/JSON files** | Keystatic, Decap CMS, git-based CMS | Tim kecil, developer-friendly, static sites | AKAL Center (Keystatic + GitHub) |
| **2 — Headless CMS** | Contentful, Sanity, Strapi | Tim konten > 3 orang, workflow formal | Ruangguru (Contentful + custom) |
| **3 — Custom WYSIWYG** | Tiptap, Slate, Lexical, ProseMirror | Perlu kontrol penuh tampilan, embedded media interaktif | Coursera Authoring Tool |
| **4 — Full authoring suite** | Custom + AI-assisted | Enterprise dengan content team besar | Canvas Studio, Articulate 360 |

### Pola Authoring — Keystatic (AKAL Center Pattern)

```typescript
// keystatic.config.ts — Collection definition untuk course content
import { config, fields } from '@keystatic/core'

export default config({
  storage: { kind: 'github' },
  collections: {
    materi: {
      label: 'Bab Materi',
      slugField: 'title',
      path: 'content/materi/*/',
      columns: ['title', 'kelas', 'babLabel'],
      schema: {
        title: fields.slug({ name: { label: 'Judul Bab' } }),
        kelas: fields.select({
          label: 'Kelas',
          options: [
            { value: '7', label: 'Kelas 7' },
            { value: '8', label: 'Kelas 8' },
            { value: '9', label: 'Kelas 9' },
          ],
          defaultValue: '7',
        }),
        babLabel: fields.select({
          label: 'Kategori',
          options: [
            { value: 'AKIDAH', label: 'Akidah' },
            { value: 'AKHLAK', label: 'Akhlak' },
          ],
          defaultValue: 'AKIDAH',
        }),
        ringkasan: fields.text({ label: 'Ringkasan', multiline: true }),
        konten: fields.document({
          label: 'Konten',
          formatting: true,
          dividers: true,
          links: true,
          images: { directory: 'public/images/materi' },
        }),
      },
    },
  },
  singletons: {
    siteConfig: {
      label: 'Site Config',
      path: 'content/site-config/',
      schema: {
        siteName: fields.text({ label: 'Nama Situs', defaultValue: 'AKAL Center' }),
        tagline: fields.text({ label: 'Tagline', multiline: true }),
        googleAnalyticsId: fields.text({ label: 'Google Analytics ID' }),
      },
    },
  },
})
```

### Content Authoring — Best Practice Keamanan

```
[ ] Validasi HTML content: strip dangerous tags (script, iframe, object)
[ ] Image upload: validasi MIME type, scan malware, resize otomatis
[ ] Content versioning: simpan history perubahan minimal 30 hari
[ ] Draft/Published state: jangan publish otomatis setelah save
[ ] Role-based access: content creator tidak bisa publish tanpa approval
[ ] Input sanitization: semua input content melewati sanitizer (DOMPurify)
[ ] Backup: content file di-backup setiap perubahan (git commit otomatis)
```

---

# 🔄 NEW SECTION 2: COMMUNICATION SYSTEM

## Push Notification Architecture

Notifikasi real-time untuk engagement siswa adalah fitur kritikal di LMS modern.

### Arsitektur Notifikasi

```typescript
// services/notification/engine.ts
// Notification delivery engine dengan fallback chain

type NotificationChannel = 'in_app' | 'push' | 'email' | 'whatsapp' | 'telegram'
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

interface Notification {
  id: string
  userId: string
  title: string
  body: string
  data?: Record<string, unknown>
  channel: NotificationChannel[]
  priority: NotificationPriority
  scheduledAt?: Date
}

async function sendNotification(notif: Notification): Promise<void> {
  const delivery = []

  for (const channel of notif.channel) {
    try {
      switch (channel) {
        case 'in_app':
          delivery.push(saveToInApp(notif))
          break
        case 'push':
          delivery.push(sendPushNotification(notif))
          break
        case 'email':
          delivery.push(sendEmailNotification(notif))
          break
        case 'whatsapp':
          delivery.push(sendWhatsAppNotification(notif))
          break
        case 'telegram':
          delivery.push(sendTelegramNotification(notif))
          break
      }
    } catch (error) {
      console.error('Failed to send notification via ' + channel + ':', error)
      // Fallback ke channel berikutnya dengan prioritas lebih rendah
      if (channel === 'push') {
        await sendEmailNotification(notif) // fallback
      }
    }
  }

  await Promise.all(delivery)
}
```

### Event System (for real-time updates)

```typescript
// lib/events.ts
// Type-safe event system untuk real-time updates di seluruh platform

type EventMap = {
  'assessment.submitted': { userId: string; score: number; total: number }
  'course.completed': { userId: string; courseId: string }
  'forum.new_post': { userId: string; threadId: string }
  'certificate.issued': { userId: string; certificateId: string }
  'student.enrolled': { userId: string; courseId: string }
  'live.class.started': { courseId: string; streamUrl: string }
}

type EventCallback<T> = (data: T) => void | Promise<void>

class EventBus {
  private listeners = new Map<string, Set<EventCallback<unknown>>>()

  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback as EventCallback<unknown>)
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const callbacks = this.listeners.get(event)
    if (!callbacks) return
    for (const cb of callbacks) {
      try {
        const result = cb(data)
        if (result instanceof Promise) result.catch(console.error)
      } catch (e) {
        console.error('Event handler error:', event, e)
      }
    }
  }
}

export const eventBus = new EventBus()
```

---


# ══════════════════════════════════════════════
# 🔄 NEW SECTION 3: CERTIFICATE ENGINE
# ══════════════════════════════════════════════

## Certificate Generation & Verification

Certificate engine adalah sistem untuk menerbitkan, memverifikasi, dan mengelola sertifikat
penyelesaian kursus. Skalabilitas certificate generation menjadi kritikal saat ribuan siswa
lulus di waktu yang bersamaan.

### Arsitektur Certificate

```typescript
// services/certificate/generator.ts
// Certificate generation dengan queue-based architecture

interface Certificate {
  id: string
  userId: string
  courseId: string
  studentName: string
  courseTitle: string
  completionDate: Date
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  hoursSpent: number
  verificationCode: string
  issuedBy: string
  metadata: Record<string, unknown>
}

async function generateCertificate(data: Certificate): Promise<string> {
  // 1. Generate unique verification code (cryptographically random)
  const codeBytes = crypto.getRandomValues(new Uint8Array(32))
  data.verificationCode = Array.from(codeBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // 2. Hash for immutable verification
  const contentHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(data))
  )

  // 3. Store in database
  await db.insert('certificates', {
    ...data,
    contentHash: Buffer.from(contentHash).toString('hex'),
    createdAt: new Date().toISOString(),
  })

  // 4. Queue PDF generation (async)
  await queue.add('generate-certificate-pdf', { certificateId: data.id })

  return data.verificationCode
}
```

### PDF Template Engine

```typescript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

async function createCertificatePDF(cert: Certificate): Promise<Buffer> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([841.89, 595.28]) // A4 landscape
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)

  const { width, height } = page.getSize()

  // Background border
  page.drawRectangle({
    x: 20, y: 20, width: width - 40, height: height - 40,
    borderColor: rgb(0.8, 0.6, 0.2),
    borderWidth: 3,
  })

  // Title
  page.drawText('SERTIFIKAT PENYELESAIAN', {
    x: width / 2 - 150, y: height - 100,
    size: 28, font,
    color: rgb(0.2, 0.3, 0.6),
  })

  // Student name
  page.drawText(cert.studentName, {
    x: width / 2 - 100, y: height / 2 + 40,
    size: 24, font,
    color: rgb(0, 0, 0),
  })

  // Course title
  page.drawText('Telah menyelesaikan kursus:', {
    x: width / 2 - 100, y: height / 2,
    size: 14, font: fontRegular,
  })

  page.drawText(cert.courseTitle, {
    x: width / 2 - 100, y: height / 2 - 30,
    size: 18, font,
    color: rgb(0.2, 0.3, 0.6),
  })

  // Verification code
  page.drawText('Kode Verifikasi: ' + cert.verificationCode, {
    x: 40, y: 60,
    size: 8, font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  })

  return Buffer.from(await doc.save())
}
```

### Certificate Verification API

```typescript
// app/api/verify-certificate/route.ts
// Public endpoint untuk verifikasi sertifikat tanpa autentikasi

export async function POST(request: Request) {
  const { verificationCode } = await request.json()

  if (!verificationCode || typeof verificationCode !== 'string') {
    return NextResponse.json(
      { error: 'Kode verifikasi diperlukan' },
      { status: 400 }
    )
  }

  const certificate = await db.findOne('certificates', {
    where: { verificationCode },
  })

  if (!certificate) {
    return NextResponse.json(
      { valid: false, error: 'Sertifikat tidak ditemukan' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    valid: true,
    studentName: certificate.studentName,
    courseTitle: certificate.courseTitle,
    completionDate: certificate.completionDate,
    grade: certificate.grade,
    issuedBy: certificate.issuedBy,
  })
}
```

---

# 🔄 NEW SECTION 4: INTEGRATION HUB

## LTI (Learning Tools Interoperability) — Standar Industri LMS

LTI adalah protokol standar (IMS Global) untuk menghubungkan LMS eksternal dengan tools
pembelajaran. Wajib untuk integrasi dengan LMS sekolah seperti Google Classroom, Moodle,
atau Schoology.

### LTI 1.3 Launch Flow

```mermaid
sequenceDiagram
    participant Teacher
    participant LMS as School LMS (Moodle/GC)
    participant Platform as E-Learning Platform
    Teacher->>LMS: Klik link materi
    LMS->>Platform: POST LTI Launch Request (JWT signed)
    Platform->>Platform: Verify JWT (ISS, AUD, nonce)
    Platform->>Platform: Extract user info (name, email, roles)
    Platform-->>LMS: Return resource HTML/redirect
    Note over Platform: Session created, user authenticated
```

### Implementasi LTI 1.3 Receiver

```typescript
// lib/lti/launch.ts
// LTI 1.3 launch validator — verifikasi JWT dari LMS external

import * as jose from 'jose'

interface LTIValidationResult {
  valid: boolean
  user?: {
    name: string
    email: string
    roles: string[]
  }
  context?: {
    courseTitle: string
    courseId: string
  }
  error?: string
}

export async function validateLTILaunch(
  jwtToken: string,
  publicKeyJWK: jose.JWK
): Promise<LTIValidationResult> {
  try {
    const { payload } = await jose.jwtVerify(
      jwtToken,
      await jose.importJWK(publicKeyJWK, 'RS256'),
      {
        issuer: process.env.LTI_ISSUER,
        audience: process.env.LTI_CLIENT_ID,
      }
    )

    return {
      valid: true,
      user: {
        name: payload.name as string,
        email: payload.email as string,
        roles: payload['https://purl.imsglobal.org/spec/lti/claim/roles'] as string[],
      },
      context: {
        courseTitle: payload['https://purl.imsglobal.org/spec/lti/claim/context']?.title,
        courseId: payload['https://purl.imsglobal.org/spec/lti/claim/context']?.id,
      },
    }
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'LTI validation failed',
    }
  }
}
```

## Webhook System — Real-time Sync dengan Sistem Eksternal

```typescript
// lib/webhooks/dispatcher.ts
// Webhook dispatcher untuk integrasi dengan sistem pihak ketiga

interface WebhookEvent {
  id: string                      // UUID unik per event — untuk idempotency
  event: string
  timestamp: string
  data: Record<string, unknown>
  signature: string
}

// Redis client untuk deduplication webhook ID
import { createClient } from 'redis'
const webhookRedis = createClient({ url: process.env.REDIS_URL })

async function dispatchWebhook(url: string, event: WebhookEvent): Promise<boolean> {
  const signature = await crypto.subtle.sign(
    'HMAC', webhookSecret,
    new TextEncoder().encode(JSON.stringify(event.data))
  )

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Id': event.id,                            // Idempotency key
        'X-Webhook-Timestamp': event.timestamp,               // Replay attack prevention
        'X-Webhook-Signature': Buffer.from(signature).toString('hex'),
        'X-Webhook-Event': event.event,
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000), // 5 detik timeout
    })

    if (!response.ok) {
      console.error('Webhook failed:', url, response.status, 'eventId:', event.id)
      return false
    }

    return true
  } catch (error) {
    console.error('Webhook error:', url, error, 'eventId:', event.id)
    // Queue untuk retry (max 3x, exponential backoff)
    await webhookRetryQueue.add({ url, event, retryCount: 0 })
    return false
  }
}

// Receiver-side: simpan webhookId yang sudah diproses
export async function markWebhookProcessed(webhookId: string): Promise<boolean> {
  const key = `webhook:processed:${webhookId}`
  const result = await webhookRedis.set(key, '1', { NX: true, EX: 86400 }) // TTL 24 jam
  return result === 'OK'  // false jika sudah pernah diproses (duplicate)
}
```

---


# ══════════════════════════════════════════════
# 🔄 NEW SECTION 5: MOBILE ARCHITECTURE
# ══════════════════════════════════════════════

## Mobile Strategy untuk E-Learning Platform

Di Indonesia, 80%+ traffic e-learning berasal dari perangkat mobile. Arsitektur mobile
bukan opsional — ini kebutuhan primer.

### Opsi Arsitektur Mobile

| Opsi | Kelebihan | Kekurangan | Kapan Dipilih |
|------|-----------|------------|---------------|
| **PWA** (Progressive Web App) | Satu codebase, installable, offline cache, push notification | Akses hardware terbatas, tidak ada App Store | Budget rendah, target browser modern |
| **React Native** | Code sharing dengan web (web + mobile native), performa baik | Bundle size besar, bridge overhead | Tim sudah React stack |
| **Flutter** | Performa native, satu codebase iOS+Android, hot reload | Ukuran app besar (~30MB), Dart learning curve | Target performa tinggi dan UI konsisten |
| **Native (Kotlin/Swift)** | Performa maksimal, akses penuh hardware | 2 codebase, biaya 2x, maintenance ganda | Fitur berat: kamera, AR, ML on-device |

### PWA — Pendekatan Paling Cost-Effective untuk Negara Berkembang

```typescript
// app/manifest.ts
// PWA manifest — WAJIB untuk akses installable dan offline support

export const manifest = {
  name: 'AKAL Center',
  short_name: 'AKAL',
  description: 'Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning',
  start_url: '/',
  display: 'standalone',
  background_color: '#f2fcf7',
  theme_color: '#005231',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
```

### Offline Support — Service Worker Pattern

```typescript
// sw.ts
// Service Worker untuk offline-first experience

const CACHE_NAME = 'akal-cache-v1'
const STATIC_ASSETS = [
  '/', '/materi', '/game',
  '/icon-192.png', '/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  // API requests: network first, fallback to cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request))
    return
  }
  // Static assets: cache first
  event.respondWith(cacheFirst(event.request))
})

async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request)
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
    return response
  } catch {
    return caches.match(request) || new Response('Offline', { status: 503 })
  }
}

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  const cache = await caches.open(CACHE_NAME)
  cache.put(request, response.clone())
  return response
}
```

### Strategi Video Offline untuk Mobile

| Strategi | Kualitas | Storage | Implementasi |
|----------|----------|---------|--------------|
| HLS progressive download | Adaptive (auto) | Full file | native HLS player |
| Stream切片 | 720p max | 25% file | Service worker intercept |
| Download manager | Pilihan user | User-managed | IndexedDB + Background sync |
| YouTube offline | 360p only | YouTube-managed | YouTube API + download toggle |

---

# ══════════════════════════════════════════════
# 🔒 SECURITY (OWASP Top 10 untuk E-Learning)
# ══════════════════════════════════════════════

## Defense-in-Depth Architecture

Keamanan LMS bukan hanya tentang melindungi data siswa. Ini tentang melindungi integritas
akademik, mencegah kecurangan, dan menjaga kepercayaan institusi pendidikan.

### 8 Pertahanan Keamanan Wajib untuk Setiap LMS

| # | Pertahanan | Lokasi | Implementasi Minimum |
|---|-----------|--------|---------------------|
| 1 | **CSP (Content Security Policy)** | Middleware/CDN | `default-src 'self'` + nonce untuk script |
| 2 | **Input Sanitization** | API Gateway + Server | DOMPurify (server-side), Zod validation |
| 3 | **Rate Limiting** | CDN/Edge + API | Redis + in-memory counter per-IP |
| 4 | **JWT Token Security** | Auth Service | jose (HS256/RS256), 30-60 min expiry |
| 5 | **SQL Injection Protection** | Database Layer | Parameterized queries (Prisma/Drizzle) |
| 6 | **CORS Policy** | CDN + Backend | Origin whitelist, jangan wildcard |
| 7 | **HTTPS Everywhere** | CDN/Edge | HSTS preload, redirect HTTP to HTTPS |
| 8 | **Security Headers** | CDN/Edge | X-Frame-Options, X-Content-Type-Options |

### CSP Implementation (Middleware Pattern)

```typescript
// middleware.ts
// CSP — baris pertahanan pertama terhadap XSS

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const csp = [
    "default-src 'self'",
    "script-src 'nonce-" + nonce + "' 'strict-dynamic' 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "connect-src 'self' https://*.vercel.app https://api.github.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "report-uri /api/csp-report",
  ].join('; ')

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')

  return response
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico).*)'],
}
```

### JWT Authentication Flow (AKAL Center Pattern)

```typescript
// lib/auth.ts
// JWT-based authentication dengan rotation dan origin binding

import * as jose from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const JWT_EXPIRY = '30m'
const REFRESH_EXPIRY = '7d'

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<jose.JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookie = await cookies()
  cookie.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 30, // 30 menit
    path: '/',
  })
}
```

### Rate Limiting (Edge + Server)

```typescript
// lib/rate-limit.ts
// Dual-layer rate limiter: in-memory untuk Vercel Edge, Redis untuk production

interface RateLimitConfig {
  interval: number  // milliseconds
  maxRequests: number
}

const store = new Map<string, { count: number; resetAt: number }>()

// Cleanup expired entries setiap 60 detik
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store) {
    if (value.resetAt < now) store.delete(key)
  }
}, 60000)

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = { interval: 10000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + config.interval })
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.interval }
  }

  entry.count++
  const remaining = Math.max(0, config.maxRequests - entry.count)

  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
  }

  return { allowed: true, remaining, resetIn: entry.resetAt - now }
}
```

---


# ══════════════════════════════════════════════
# 🔒 DATA PRIVACY — PDPA (Indonesia) & GDPR (EU)
# ══════════════════════════════════════════════

## Regulasi yang Relevan untuk LMS di Indonesia

| Regulasi | Wilayah | Tahun | Denda Maks | Poin Kritis untuk LMS |
|----------|---------|-------|------------|----------------------|
| **UU PDP** (UU No. 27/2022) | Indonesia | 2024 (efektif) | 2% pendapatan tahunan | Data siswa, nilai, biodata |
| **GDPR** (EU 2016/679) | Uni Eropa + EEA | 2018 | 20M EUR / 4% global revenue | Jika hosting di EU atau user EU |
| **COPPA** (US) | USA (anak < 13) | 2000 | $50K/violasi | Jika target siswa SD/SMP |

### Data Classification untuk LMS

| Klasifikasi | Contoh | Regulasi | Wajib Enkripsi? | Retention |
|-------------|--------|----------|-----------------|-----------|
| **Sangat Rahasia** | Password, token, kunci enkripsi | UU PDP Pasal 15 | Ya (AES-256) | Sampai diganti |
| **Rahasia** | Nilai, data kesehatan siswa | UU PDP Pasal 26 | Ya | 5 tahun |
| **Pribadi** | Nama, alamat, TTL, NISN | UU PDP Pasal 29 | Ya (transit) | 5 tahun setelah lulus |
| **Internal** | Materi ajar, kurikulum | Internal policy | Tidak wajib | Sesuai kontrak |
| **Publik** | Nama pengajar, sertifikat | Tidak ada | Tidak | Selamanya |

### Privacy by Design Checklist untuk LMS

```
DESIGN PHASE:
[ ] Tujuan pengumpulan data didokumentasikan di Privacy Policy
[ ] Data minimal yang diperlukan (data minimization principle)
[ ] Consent mechanism sebelum pengumpulan data anak (< 18 tahun)
[ ] Parental consent khusus untuk siswa di bawah umur
[ ] Data Protection Impact Assessment (DPIA) untuk fitur baru

IMPLEMENTASI:
[ ] Field data pribadi dienkripsi di database (AES-256-GCM)
[ ] Log akses: siapa, kapan, mengapa akses data siswa
[ ] Anonymization untuk analytics (jangan pakai nama asli)
[ ] Pseudonymization untuk research/grading analytics
[ ] Data retention policy: hapus otomatis data setelah 5 tahun
[ ] Export data pribadi dalam format machine-readable (GDPR Pasal 20)

RESPONSE:
[ ] Breach notification procedure (< 72 jam untuk GDPR, < 3 hari UU PDP)
[ ] Data deletion request flow (right to be forgotten)
[ ] Data portability API
[ ] Consent withdrawal mechanism
```

### Data Encryption Implementation

```typescript
// lib/privacy/encryption.ts
// Field-level encryption untuk data pribadi siswa

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = createHash('sha256').update(process.env.DATA_ENCRYPTION_KEY || '').digest()

export function encryptField(plaintext: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')

  return iv.toString('hex') + ':' + authTag + ':' + encrypted
}

export function decryptField(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

### Data Retention & Deletion

```typescript
// jobs/data-retention.ts
// Scheduled job untuk membersihkan sesuai retention policy

async function enforceRetentionPolicy() {
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

  // Anonymize expired student records
  await db.update('students', {
    where: { graduationYear: { lt: fiveYearsAgo.getFullYear() } },
    data: {
      name: '[DELETED]',
      address: '[DELETED]',
      phone: '[DELETED]',
      birthDate: null,
      anonymizedAt: new Date().toISOString(),
    },
  })

  // Delete raw exam logs > 2 tahun
  await db.delete('exam_logs', {
    where: { createdAt: { lt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) } },
  })
}
```

---

# ══════════════════════════════════════════════
# 🚨 DISASTER RECOVERY — RPO & RTO Planning
# ══════════════════════════════════════════════

## Disaster Recovery Metrics

| Metrik | Definisi | Target Mode Ringan | Target Mode Medium | Target Enterprise |
|--------|----------|-------------------|-------------------|-------------------|
| **RPO** (Recovery Point Objective) | Maksimum data yang boleh hilang | 24 jam | 1 jam | 5 menit |
| **RTO** (Recovery Time Objective) | Maksimum waktu down | 48 jam | 4 jam | 15 menit |
| **MTD** (Maximum Tolerable Downtime) | Total downtime sebelum bisnis terdampak permanen | 72 jam | 8 jam | 1 jam |
| **RPO** untuk database | Data loss tolerance | Daily backup | PITR (Point-in-Time Recovery) | Synchronous replication |
| **RPO** untuk media | File loss tolerance | Weekly backup | Daily backup + replication | Multi-region replication |

## Disaster Recovery Strategy Berdasarkan Skala

### Mode Ringan — Backup + Restore

```typescript
// jobs/backup.ts
// Daily backup dengan upload ke object storage

async function performDailyBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = 'backup-daily-' + timestamp + '.sql'

  // 1. PG dump
  execSync('pg_dump ' + process.env.DATABASE_URL + ' > /tmp/' + backupFile)

  // 2. Encrypt
  execSync('gpg --encrypt --recipient backup-key /tmp/' + backupFile)

  // 3. Upload to S3-compatible storage (multi-region)
  await s3.putObject('backups/' + backupFile + '.gpg', encryptedData)

  // 4. Cleanup local file
  execSync('rm /tmp/' + backupFile + ' /tmp/' + backupFile + '.gpg')

  // 5. Retensi: hapus backup > 30 hari
  await deleteOldBackups(30)
}
```

### Mode Medium — PITR + Multi-AZ

```mermaid
graph TD
    subgraph "Primary Region"
        DB1[(PostgreSQL Primary)]
        APP1[App Server]
        MEDIA1[(S3 Primary)]
    end
    subgraph "DR Region (Standby)"
        DB2[(PostgreSQL Replica)]
        APP2[App Server - Cold]
        MEDIA2[(S3 Replicated)]
    end
    
    DB1 -->|Streaming Replication| DB2
    APP1 -->|Health Check| APP2
    MEDIA1 -->|Cross-Region Replication| MEDIA2
    
    style DB1 fill:#4CAF50
    style APP1 fill:#2196F3
    style MEDIA1 fill:#FF9800
    style DB2 fill:#f44336
    style APP2 fill:#9E9E9E
    style MEDIA2 fill:#9E9E9E
```

**Failover procedure (4 langkah):**
1. DNS switch ke DR region (TTL 60s)
2. Promote read replica ke primary
3. Cold start app server DR
4. Verify data integrity

### Mode Enterprise — Multi-Region Active-Active

**Komponen kritis:**
- **Database:** CockroachDB / Google Spanner / Yugabyte (distributed SQL, multi-region)
- **Storage:** Multi-region S3 + CloudFront + Fastly (multi-CDN)
- **Cache:** Global Redis (AWS ElastiCache Global Datastore)
- **DNS:** Route53 / Cloudflare with latency-based routing + health checks
- **Queue:** Kafka with cross-region mirroring (MirrorMaker)

---


# ══════════════════════════════════════════════
# ⚡ INCIDENT RESPONSE — Playbook
# ══════════════════════════════════════════════

## Incident Classification

| Level | Nama | Contoh | Response Time | Notifikasi |
|-------|------|--------|--------------|------------|
| **SEV-1** | Critical | Data breach, DB corruption, complete outage | < 15 menit | CTO + CEO + legal |
| **SEV-2** | High | Partial outage, slow response, auth failure | < 30 menit | Engineering lead + PM |
| **SEV-3** | Medium | Bug minor, feature broken, UI glitch | < 2 jam | Engineering team |
| **SEV-4** | Low | Cosmetic issue, typo, enhancement | < 1 minggu | Product backlog |

### Playbook: Database Corruption (SEV-1)

```
TRIGGER: Data inconsistency detected, query returns wrong results,
         or database service unhealthy

1. DETECT (0-5 menit)
   [ ] Alert dari monitoring (PagerDuty/Opsgenie)
   [ ] Verifikasi: manual query test
   [ ] Cari scope: satu tabel? Satu tenant? Semua?

2. CONTAIN (5-15 menit)
   [ ] Set database ke READ ONLY mode
   [ ] Isolasi tenant yang terdampak (jika multi-tenant)
   [ ] Notifikasi user: "Sistem dalam pemeliharaan"
   [ ] Screenshot error untuk forensik

3. ASSESS (15-30 menit)
   [ ] Cari point of corruption terakhir dari WAL/logs
   [ ] Tentukan RPO: berapa data yang perlu di-restore
   [ ] Check apakah backup masih valid (integrity check)
   [ ] Identifikasi root cause: bug di app? Infra? Human error?

4. RESTORE (30-120 menit)
   [ ] Spin up instance baru
   [ ] Restore dari backup terbersih
   [ ] Apply WAL replay sampai sebelum korupsi
   [ ] Verify data integrity dengan checksum

5. VERIFY (120-180 menit)
   [ ] Smoke test: login, baca kursus, submit quiz
   [ ] Verify semua tenant bisa akses data masing-masing
   [ ] Monitor error rate selama 30 menit
   [ ] Set database ke READ WRITE

6. POST-MORTEM (24-72 jam)
   [ ] Root cause analysis dokumentasi
   [ ] Action items untuk prevent recurrence
   [ ] Update backup verification frequency
   [ ] Update playbook jika ada lesson learned
```

### Playbook: Data Breach Notification (SEV-1)

```
TRIGGER: Suspicious access detected, unauthorized data export,
         atau notifikasi dari otoritas/data protection office

1. TINGKAT KEJADIAN (0-1 jam)
   [ ] Isolasi sistem terdampak
   [ ] Ambil forensic snapshot (disk + memory + logs)
   [ ] Reset semua credentials yang mungkin bocor
   [ ] Aktifkan extended logging + audit trail

2. NOTIFIKASI INTERNAL (1-2 jam)
   [ ] Incident commander ditunjuk
   [ ] Legal counsel diaktifkan
   [ ] Executive briefing (apa, siapa, dampak, timeline)
   [ ] PR team: prepare holding statement

3. NOTIFIKASI REGULATOR (2-72 jam)
   [ ] [GDPR] Notify DPA dalam 72 jam (Pasal 33)
   [ ] [UU PDP] Notifikasi maksimal 3 hari (Pasal 46)
   [ ] Siapkan: nature of breach, categories of data, estimated impact
   [ ] Siapkan: containment measures, recommended mitigations

4. NOTIFIKASI USER (4-72 jam)
   [ ] Template email/notifikasi in-app
   [ ] Informasi: apa yang terjadi, data apa, apa yang sudah dilakukan
   [ ] Langkah yang harus dilakukan user (ganti password, cek aktivitas)
   [ ] Kontak person untuk pertanyaan

5. REMEDIASI (24 jam - 1 minggu)
   [ ] Patch vulnerability
   [ ] Rotate semua secrets
   [ ] Enhance monitoring rules
   [ ] Third-party security audit jika perlu
   [ ] Documentation untuk regulator
```

---

# ══════════════════════════════════════════════
# 🧪 TESTING STRATEGY
# ══════════════════════════════════════════════

## Testing Pyramid untuk E-Learning Platform

```
          ╱╲
         ╱ E2E ╲        ← Playwright (kritikal flow: login, quiz, payment)
        ╱────────╲
       ╱Integration╲     ← API tests + component tests (auth, grading, webhook)
      ╱──────────────╲
     ╱   Unit Tests    ╲  ← Vitest/Jest (utilities, hooks, pure functions, types)
    ╱────────────────────╲
   ╱   Static Analysis    ╲  ← TypeScript strict + ESLint + Prettier (sebelum test)
```

## Unit Test Pattern (Vitest)

```typescript
// __tests__/lib/adaptive.test.ts
import { describe, it, expect } from 'vitest'
import { getNextAction } from '@/lib/adaptive'

describe('Adaptive Learning Engine', () => {
  it('should recommend REVIEW for low scores', () => {
    const result = getNextAction(0.5, 'pendahuluan')
    expect(result.type).toBe('REVIEW')
    expect(result.estimatedMinutes).toBeGreaterThan(0)
  })

  it('should recommend PRACTICE for medium scores', () => {
    const result = getNextAction(0.8, 'pendahuluan')
    expect(result.type).toBe('PRACTICE')
    expect(result.difficulty).toBe('MEDIUM')
  })

  it('should recommend CHALLENGE for perfect streak', () => {
    const result = getNextAction(1, 'pendahuluan', [1, 1, 1])
    expect(result.type).toBe('CHALLENGE')
  })

  it('should handle invalid scores gracefully', () => {
    const result = getNextAction(-1, 'pendahuluan')
    expect(result.type).toBe('REVIEW')
    expect(result.reason).toContain('valid')
  })
})
```

## Integration Test (Supertest + Vitest)

```typescript
// __tests__/api/assessment.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'

describe('POST /api/kuis/selesai', () => {
  const validToken = signTestToken({ nama: 'Test', kelas: '7' })

  it('should reject submission without valid JWT', async () => {
    const res = await request(app)
      .post('/api/kuis/selesai')
      .send({ skor: 8, total: 10, bab: 'Amanah' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBeDefined()
  })

  it('should accept valid quiz submission', async () => {
    const res = await request(app)
      .post('/api/kuis/selesai')
      .set('Authorization', 'Bearer ' + validToken)
      .send({ skor: 8, total: 10, bab: 'Amanah' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should reject duplicate submission', async () => {
    const res = await request(app)
      .post('/api/kuis/selesai')
      .set('Authorization', 'Bearer ' + validToken)
      .send({ skor: 8, total: 10, bab: 'Amanah' })

    expect(res.status).toBe(409)
    expect(res.body.error).toContain('duplikat')
  })
})
```

## E2E Test (Playwright)

```typescript
// e2e/quiz-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete quiz flow from login to result', async ({ page }) => {
  // 1. Login
  await page.goto('/evaluasi')
  await page.fill('input[placeholder="Nama Lengkap"]', 'Test Student')
  await page.click('button:has-text("Mulai")')

  // 2. Answer questions
  for (let i = 0; i < 10; i++) {
    await page.waitForSelector('.question-card')
    const options = await page.$$('input[type="radio"]')
    await options[0].click()
    await page.click('button:has-text("Berikutnya")')
  }

  // 3. Submit
  await page.click('button:has-text("Selesai")')

  // 4. Verify result
  await page.waitForSelector('.result-card')
  const score = await page.textContent('.score-value')
  expect(Number(score)).toBeGreaterThanOrEqual(0)
  expect(Number(score)).toBeLessThanOrEqual(100)
})
```

## Load Testing (K6)

```javascript
// k6/quiz-submit.js
import http from 'k6/http'
import { check, sleep } from 'k6'
import { SharedArray } from 'k6/data'

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Steady
    { duration: '2m', target: 200 },  // Spike
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95) < 2000'], // 95% harus < 2 detik
    http_req_failed: ['rate < 0.01'],      // Error rate < 1%
  },
}

export default function () {
  const res = http.post('https://api.akalcenter.my.id/api/kuis/selesai', {
    skor: Math.floor(Math.random() * 10),
    total: 10,
    bab: 'Amanah dan Jujur',
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + __ENV.TEST_TOKEN,
    },
  })

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response under 2s': (r) => r.timings.duration < 2000,
  })
}
```

---


# ══════════════════════════════════════════════
# 📊 PRODUCTION MONITORING
# ══════════════════════════════════════════════

## Monitoring Stack

| Layer | Mode Ringan | Mode Medium | Mode Enterprise | Alert Threshold |
|-------|-------------|-------------|-----------------|-----------------|
| Uptime | Vercel Status / Better Uptime | Grafana + Prometheus | PagerDuty + Grafana + Datadog | < 99.9% uptime |
| Error tracking | Sentry (free tier) | Sentry (pro) | Datadog RUM + Sentry | Error rate > 1% |
| API latency | Vercel Analytics | Grafana + Prometheus | Datadog APM | p95 > 2s |
| Database | Neon dashboard | PG dashboard + slow query log | RDS Performance Insights + pgbadger | Slow queries > 100ms |
| User metrics | GA4 / Vercel Analytics | Mixpanel / Amplitude | Custom event pipeline (Kafka + ClickHouse) | DAU drop > 10% |
| Business metrics | Google Sheets | Metabase / Superset | Looker / Tableau | Custom per KPI |
| Security | — | WAF logs + audit trail | SIEM (Splunk/ELK) + WAF + IDS | Anomaly detection |

## Custom Monitoring — Student Engagement Metrics

```typescript
// lib/monitoring/engagement.ts
// Student engagement tracking — data untuk dashboard akademik

interface EngagementMetrics {
  dailyActiveStudents: number
  averageSessionDuration: number
  completionRate: number
  quizAttemptRate: number
  forumActivityRate: number
}

export async function getEngagementMetrics(
  dateRange: { start: Date; end: Date }
): Promise<EngagementMetrics> {
  const [sessions, completions, quizzes, forumPosts] = await Promise.all([
    db.query('SELECT COUNT(*) as active, AVG(duration) as avg_duration FROM sessions WHERE ...'),
    db.query('SELECT COUNT(*) as completed FROM enrollments WHERE status = 'completed' AND ...'),
    db.query('SELECT COUNT(*) as attempts FROM quiz_attempts WHERE ...'),
    db.query('SELECT COUNT(*) as posts FROM forum_posts WHERE ...'),
  ])

  return {
    dailyActiveStudents: Number(sessions.rows[0]?.active || 0),
    averageSessionDuration: Number(sessions.rows[0]?.avg_duration || 0),
    completionRate: calculateRate(completions, totalEnrollments),
    quizAttemptRate: calculateRate(quizzes, totalStudents),
    forumActivityRate: calculateRate(forumPosts, totalStudents),
  }
}
```

## Health Check API

```typescript
// app/api/health/route.ts
// Multi-component health check untuk monitoring
import { HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
    api: await checkExternalAPIs(),
    queue: await checkQueue(),
  }

  const allHealthy = Object.values(checks).every(c => c.status === 'healthy')
  const statusCode = allHealthy ? 200 : 503

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  }, { status: statusCode })
}

async function checkDatabase(): Promise<HealthCheck> {
  try {
    const start = Date.now()
    await db.query('SELECT 1')
    const latency = Date.now() - start
    return { status: 'healthy', latency: latency + 'ms' }
  } catch (e) {
    return { status: 'unhealthy', error: String(e) }
  }
}

async function checkRedis(): Promise<HealthCheck> {
  try {
    const start = Date.now()
    await redis.ping()
    const latency = Date.now() - start
    return { status: 'healthy', latency: latency + 'ms' }
  } catch (e) {
    return { status: 'unhealthy', error: String(e) }
  }
}

async function checkStorage(): Promise<HealthCheck> {
  try {
    const start = Date.now()
    const { ContentLength } = await s3.send(new HeadObjectCommand({
      Bucket: process.env.STORAGE_BUCKET!,
      Key: 'health-check.txt',
    }))
    const latency = Date.now() - start
    return { status: 'healthy', latency: latency + 'ms', details: `bucket reachable, ${ContentLength ?? 0}B` }
  } catch (e) {
    // Bucket mungkin kosong — cek akses saja
    try {
      await s3.send(new ListObjectsV2Command({
        Bucket: process.env.STORAGE_BUCKET!,
        MaxKeys: 1,
      }))
      return { status: 'healthy', latency: 'N/A (list)', details: 'bucket accessible via list' }
    } catch (e2) {
      return { status: 'unhealthy', error: String(e2) }
    }
  }
}

async function checkExternalAPIs(): Promise<HealthCheck & { services?: Record<string, 'up' | 'down'> }> {
  const services: Record<string, 'up' | 'down'> = {}
  let allUp = true

  // Cek Midtrans — payment gateway
  try {
    const res = await fetch('https://api.midtrans.com/v2/health', { signal: AbortSignal.timeout(3000) })
    services.midtrans = res.ok ? 'up' : 'down'
    if (!res.ok) allUp = false
  } catch { services.midtrans = 'down'; allUp = false }

  // Cek AI API — grading/chat
  try {
    const res = await fetch(`${process.env.AI_API_BASE_URL || 'https://api.anthropic.com'}/v1/health`, {
      signal: AbortSignal.timeout(3000),
      headers: { 'x-api-key': `Bearer ${process.env.AI_API_KEY?.slice(0, 8)}...` },
    })
    services['ai-api'] = res.ok ? 'up' : 'down'
    if (!res.ok) allUp = false
  } catch { services['ai-api'] = 'down'; allUp = false }

  // Cek Cloudflare Stream — video delivery
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/stream`, {
      signal: AbortSignal.timeout(3000),
      headers: { 'Authorization': `Bearer ${process.env.CF_API_TOKEN}` },
    })
    services['cloudflare-stream'] = res.ok ? 'up' : 'down'
    if (!res.ok) allUp = false
  } catch { services['cloudflare-stream'] = 'down'; allUp = false }

  return {
    status: allUp ? 'healthy' : 'degraded',
    details: `${Object.values(services).filter(s => s === 'up').length}/${Object.keys(services).length} services up`,
    services,
  }
}

async function checkQueue(): Promise<HealthCheck> {
  try {
    const start = Date.now()
    const info = await redis.info('stats')
    const latency = Date.now() - start
    return { status: 'healthy', latency: latency + 'ms', details: 'queue accessible' }
  } catch (e) {
    return { status: 'unhealthy', error: String(e) }
  }
}
```

---

# ══════════════════════════════════════════════
# 💰 COST MODELING
# ══════════════════════════════════════════════

## Cost Breakdown per Skala

### Mode Ringan (AKAL Center Pattern — $0-50/bulan)

| Komponen | Layanan | Biaya | Catatan |
|----------|---------|-------|---------|
| Hosting | Vercel Hobby | $0 | 100 GB bandwidth, 6000 build minutes |
| Database | Neon Free / PlanetScale Free | $0 | 0.5GB data, 100h compute/月起 |
| Storage | Vercel Blob / Supabase Storage | $0 | 1GB |
| CDN | Cloudflare (free plan) | $0 | Reverse proxy + cache + security |
| Email | Resend Free | $0 | 100 email/hari |
| Analytics | Vercel Analytics + GA4 | $0 | 2500 unique visitors |
| Video | YouTube (embed) | $0 | Unlimited streaming |
| CMS | Keystatic (git-based) | $0 | Unlimited editors |
| Monitoring | Sentry Free + Better Uptime Free | $0 | 5K events + 1 monitor |
| **Total** | | **$0** | |

### Mode Medium ($100-1,000/bulan)

| Komponen | Layanan | Estimasi | Notes |
|----------|---------|----------|-------|
| Hosting | Cloud Run / Fly.io | $50-100 | 2-4 instances |
| Database | PostgreSQL Managed (DigitalOcean/Neon Scale) | $50-200 | 4GB RAM, PITR |
| Redis | Upstash / Redis Cloud Free | $0-25 | 30MB-100MB |
| Storage | Cloudflare R2 / S3 | $5-20 | 50GB data, 10K PUT requests |
| CDN | Cloudflare Pro ($20) / Fastly Free | $0-20 | WAF + Brotli |
| Video | Cloudflare Stream / Mux | $20-100 | 1000 min encoded |
| Analytics | PostHog / Mixpanel | $0-50 | Self-host / free tier |
| Monitoring | Sentry Pro ($29) + Grafana | $29-50 | Error tracking + dashboard |
| Email | Resend Growth ($30) / SendGrid | $10-30 | 50K email |
| Queue | Redis (included with Upstash) | $0 | Already bundled |
| **Total** | | **$150-600** | |

### Mode Enterprise ($5K-50K+/bulan)

| Komponen | Biaya | Scaling Pattern |
|----------|-------|-----------------|
| Hosting (multi-region) | $1,000-5,000 | GKE/EKS + spot instances |
| Database (CockroachDB + Redis Cluster) | $2,000-10,000 | Multi-region, 5-10 nodes |
| Storage + CDN (multi-region S3 + Fastly) | $1,000-3,000 | PB scale, multiple CDN |
| Video (Mux/Delivery) | $500-3,000 | 100K+ hours streaming |
| AI/ML (GPU instances + LLM API) | $500-10,000 | SageMaker, Lambda Labs |
| Monitoring + Observability | $500-2,000 | Datadog, Splunk |
| Security (WAF + SIEM + PenTest) | $500-3,000 | Regular security audit |
| Team (DevOps/SRE) | $5,000-15,000 | 24/7 on-call rotations |
| **Total** | **$5,000-50,000+** | |

---


# ══════════════════════════════════════════════
# 👥 TEAM SCALING
# ══════════════════════════════════════════════

## Team Composition per Phase

### Phase 0 — MVP (Pre-Seed, 1-3 orang)

| Role | Jumlah | Fokus | Tools |
|------|--------|-------|-------|
| Full-stack developer | 1-2 | Build semua fitur | Next.js, PostgreSQL, Vercel |
| Content creator (guru/dosen) | 1-2 | Buat materi, soal, video | CMS, Canva, OBS |
| **Total** | **2-4** | | |

### Phase 1 — Product-Market Fit (Seed, 4-8 orang)

| Role | Jumlah | Fokus |
|------|--------|-------|
| Full-stack developer | 2-3 | Platform core + API |
| Frontend developer | 1 | UI/UX, mobile, PWA |
| Backend developer | 1 | Infra, scaling, database |
| Content lead | 1-2 | Kurikulum, quality control |
| UI/UX designer | 1 | Design system, user research |
| **Total** | **6-10** | |

### Phase 2 — Growth (Series A, 10-25 orang)

| Role | Jumlah |
|------|--------|
| Engineering | 8-12 |
| Product | 2-3 |
| Design | 2-3 |
| Content | 3-5 |
| Data/AI | 2-3 |
| QA | 1-2 |
| DevOps/SRE | 1-2 |
| **Total** | **20-30** |

### Phase 3 — Scale (Series B+, 50+ orang)

Multiple squads per domain (Content, Assessment, Social/Learning, Infrastructure, AI/ML, Data Platform)

## Key Hiring Decisions

```
JANGAN hire spesialis AI sebelum punya:
[ ] Product-market fit terverifikasi (retention > 50%)
[ ] Data scientist sudah ada untuk validasi model baseline
[ ] Infrastructure untuk serving model sudah siap

JANGAN hire DevOps sebelum:
[ ] Tim engineering > 5 orang
[ ] Ada production incident yang documented
[ ] Manual deployment sudah menjadi bottleneck

WAJIB hire QA ketika:
[ ] Tim engineering > 3 orang
[ ] Ada production bug yang reach user
[ ] Regression terjadi setelah rilis fitur baru
```

---

# ══════════════════════════════════════════════
# 💼 BUSINESS / MONETIZATION
# ══════════════════════════════════════════════

## Revenue Models untuk E-Learning

| Model | Contoh Sukses | Margin | Cocok Untuk |
|-------|---------------|--------|-------------|
| **Freemium** | Duolingo, Khan Academy | - (loss leader) | Mass adoption, brand building |
| **Subscription (B2C)** | Zenius, Ruangguru, Coursera Plus | 60-80% | Individual learners |
| **Subscription (B2B)** | Coursera for Business, Ruangguru for School | 70-85% | Sekolah, perusahaan, government |
| **Course marketplace** | Udemy, Skillshare | 60-70% (37% ke platform) | Creator ecosystem |
| **Certification fee** | Coursera, edX | 80-90% | Verified track, career impact |
| **Tutoring/mentorship** | Ruangguru (Bimbel), Preply | 40-60% | High-touch, high-value |
| **Enterprise/SaaS** | Canvas, MoodleNet | 70-90% | Institutional LMS licensing |
| **Ads/sponsorship** | Khan Academy, Duolingo | Low CPM | High traffic only |
| **White-label** | Ruangguru for Corporate | 60-80% | Custom branding, closed user group |

## Pricing Strategy Reference (dari LMS Indonesia)

| Platform | Model | Harga | Target |
|----------|-------|-------|--------|
| Ruangguru | Subscription (B2C + B2B) | Rp150-500K/bulan | Siswa SD-SMA |
| Zenius | Subscription (B2C) | Rp120-350K/bulan | Siswa + mahasiswa |
| Pahamify | Subscription (B2C) | Rp100-250K/bulan | Siswa SMA |
| Coursera | Subscription + Cert fee | $49-79/bulan | Global professional |
| Skill Academy | Course marketplace | Rp0-500K/course | Professional Indonesia |

## Key Metrics untuk LMS

| Metrik | Definisi | Target Minimum | Target Ideal |
|--------|----------|---------------|--------------|
| **MAU** (Monthly Active Users) | User unik dalam 30 hari | 1.000 | 100.000+ |
| **Retention D1/D7/D30** | % user kembali di hari 1/7/30 | 40%/20%/10% | 60%/40%/25% |
| **Course completion rate** | % enrollment selesai | 10% | 30%+ |
| **Conversion rate** | % user free jadi bayar | 2% | 5%+ |
| **CAC** (Customer Acquisition Cost) | Biaya akuisisi per user | < Rp50rb | < Rp20rb |
| **LTV** (Life Time Value) | Pendapatan rata-rata per user | 3x CAC | 5x CAC+ |
| **NPS** (Net Promoter Score) | Kepuasan pengguna | 30 | 50+ |
| **Monthly Churn** | % user cancel per bulan | < 10% | < 5% |

---

# ══════════════════════════════════════════════
# ♿ ACCESSIBILITY — WCAG 2.1 AA
# ══════════════════════════════════════════════

## Prinsip Aksesibilitas untuk LMS

WCAG 2.1 memiliki 4 prinsip (POUR: Perceivable, Operable, Understandable, Robust).
Di Indonesia, aksesibilitas digital diatur dalam UU No. 8/2016 tentang Penyandang Disabilitas.

### Checklist Aksesibilitas LMS

```
PERCEIVABLE — Informasi harus bisa ditangkap oleh indra pengguna:
[ ] Semua gambar non-dekoratif punya alt text yang deskriptif
[ ] Video pembelajaran punya caption/subtitle
[ ] Transkrip tersedia untuk konten audio
[ ] Kontras warna minimal 4.5:1 untuk teks normal, 3:1 untuk teks besar
[ ] Konten tidak disampaikan hanya melalui warna (sertakan ikon/pattern)

OPERABLE — UI harus bisa dioperasikan berbagai cara:
[ ] Semua fungsi bisa diakses keyboard (tab navigation)
[ ] Focus indicator jelas (outline 2px + offset)
[ ] Tidak ada keyboard trap (user tidak bisa stuck di satu elemen)
[ ] Waktu tidak terbatas untuk membaca/menjawab (atau ada opsi perpanjang)
[ ] Animasi tidak menyebabkan kejang (seizure) — tidak ada flash > 3/detik
[ ] Skip to content link di halaman

UNDERSTANDABLE — Informasi dan UI harus bisa dipahami:
[ ] Bahasa konten ditentukan di HTML (lang attribute)
[ ] Form error messages jelas (bukan hanya "Error!")
[ ] Navigasi konsisten di seluruh halaman
[ ] Glossary atau tooltip untuk istilah sulit
[ ] Font bisa diperbesar 200% tanpa kehilangan konten

ROBUST — Konten kompatibel dengan berbagai assistive technology:
[ ] Semantic HTML (header, nav, main, aside, footer, landmark roles)
[ ] ARIA labels untuk interactive elements
[ ] Form inputs terkait dengan label menggunakan for/id
[ ] Status messages diumumkan (aria-live region untuk quiz timer, result)
```

### Implementasi Aksesibilitas — Next.js

```typescript
// components/accessible/Button.tsx
// Accessible button component dengan full keyboard support

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  ariaLabel?: string
  type?: 'button' | 'submit'
}

export function Button({
  children, variant = 'primary', disabled = false,
  loading = false, onClick, ariaLabel, type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={loading}
      className={
        'btn btn-' + variant +
        ' focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005231]' +
        (disabled ? ' opacity-50 cursor-not-allowed' : '')
      }
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

### Aksesibilitas Quiz — Waktu & Focus Management

```typescript
// components/evaluasi/AccessibleQuiz.tsx
// Quiz component dengan aksesibilitas penuh

export function AccessibleQuiz({ questions }: { questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const questionRef = useRef<HTMLFieldSetElement>(null)

  // Auto-focus ke soal baru setiap berganti
  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.focus()
    }
  }, [currentIndex])

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Form Kuis"
      role="form"
    >
      <fieldset
        ref={questionRef}
        tabIndex={-1}
        aria-labelledby={'question-' + currentIndex}
        className="question-card"
      >
        <legend id={'question-' + currentIndex} className="text-lg font-semibold">
          {'Soal ' + (currentIndex + 1) + ' dari ' + questions.length}
        </legend>

        <p className="mt-4">{questions[currentIndex].text}</p>

        {questions[currentIndex].options.map((option, idx) => (
          <label
            key={idx}
            className="flex items-center gap-3 p-3 mt-2 rounded-lg cursor-pointer
                       hover:bg-gray-50 focus-within:ring-2 focus-within:ring-[#005231]"
          >
            <input
              type="radio"
              name={'question-' + currentIndex}
              value={option.value}
              checked={answers[currentIndex] === option.value}
              onChange={() => handleAnswer(option.value)}
              className="w-5 h-5 accent-[#005231]"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <nav aria-label="Navigasi Soal" className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentIndex(i => i - 1)}
          disabled={currentIndex === 0}
          aria-label="Soal Sebelumnya"
        >
          Sebelumnya
        </button>
        <button
          onClick={handleNext}
          aria-label={currentIndex === questions.length - 1 ? 'Kumpulkan Jawaban' : 'Soal Berikutnya'}
        >
          {currentIndex === questions.length - 1 ? 'Selesai' : 'Berikutnya'}
        </button>
      </nav>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {currentIndex + 1 + ' dari ' + questions.length + ' soal'}
      </div>
    </form>
  )
}
```

---


# ══════════════════════════════════════════════
# 🌐 LOCALIZATION (i18n)
# ══════════════════════════════════════════════

## Strategi Internasionalisasi untuk LMS

### Level Lokalisasi

| Level | Deskripsi | Kapan | Contoh |
|-------|-----------|-------|--------|
| **1 — Static translation** | UI strings diterjemahkan, konten tetap bahasa asli | 1 bahasa tambahan | next-intl, react-i18next |
| **2 — Full localization** | UI + konten + assesment diterjemahkan penuh | 2-5 bahasa target | Contentful multi-locale |
| **3 — Cultural adaptation** | Konten diadaptasi secara kultural (bukan terjemahan literal) | 5+ bahasa, budaya berbeda | Duolingo, Netflix |
| **4 — Regional compliance** | Konten mematuhi regulasi lokal (kurikulum, agama, hukum) | Regulated markets | Ruangguru (kurikulum merdeka) |

### Implementation — next-intl (Next.js 16)

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'id' | 'en')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import('./messages/' + locale + '.json')).default,
  }
})
```

### i18n Folder Structure

```
i18n/
├── request.ts          # Konfigurasi next-intl
├── routing.ts          # Locale routing definition
└── messages/
    ├── id.json         # Bahasa Indonesia (default)
    ├── en.json         # English
    ├── ar.json         # العربية (jika target pesantren)
    └── jv.json         # Basa Jawa (jika target Jawa Timur/Tengah)
```

### Localized Content Strategy

**Untuk LMS di Indonesia, prioritas bahasa:**
1. Bahasa Indonesia (default — semua konten)
2. English (untuk UI, fitur internasional)
3. Bahasa Daerah (Jawa, Sunda) — untuk materi muatan lokal
4. Arab — untuk materi PAI (Al-Quran, Hadits)

### RTL Support untuk Bahasa Arab

```typescript
// components/layout/RTLWrapper.tsx
// Wrapper untuk mendukung RTL layout

export function RTLWrapper({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: string
}) {
  const isRTL = ['ar', 'he', 'ur'].includes(locale)

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </div>
  )
}
```

---

# ══════════════════════════════════════════════
# 📚 EXPANDED CODE EXAMPLES — Full Component Library
# ══════════════════════════════════════════════

## Complete Quiz Engine (AKAL Center Pattern — Reference)

```typescript
// components/evaluasi/QuizEngine.tsx
// Full quiz engine state machine dengan TypeScript strict

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Question {
  id: string
  text: string
  options: { value: string; label: string }[]
  correctAnswer: string
  explanation?: string
}

interface QuizResult {
  correct: number
  total: number
  percentage: number
  passed: boolean
  answers: { questionId: string; answer: string; correct: boolean }[]
}

type QuizState = 'login' | 'intro' | 'playing' | 'result' | 'error'

export function QuizEngine({ questions, onComplete }: {
  questions: Question[]
  onComplete: (result: QuizResult) => void
}) {
  const [state, setState] = useState<QuizState>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(questions.length * 72)
  const [error, setError] = useState<string | null>(null)

  // Timer
  useEffect(() => {
    if (state !== 'playing') return
    if (timeLeft <= 0) { handleSubmit(); return }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [state, timeLeft])

  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100

  const handleAnswer = useCallback((value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
  }, [currentQuestion?.id])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    }
  }, [currentIndex, questions.length])

  const handleSubmit = useCallback(() => {
    try {
      const correct = questions.filter(
        q => answers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase()
      ).length
      const percentage = Math.round((correct / questions.length) * 100)
      onComplete({
        correct, total: questions.length, percentage,
        passed: percentage >= 70,
        answers: questions.map(q => ({
          questionId: q.id,
          answer: answers[q.id] || '',
          correct: (answers[q.id] || '').toLowerCase() === (q.correctAnswer || '').toLowerCase(),
        })),
      })
      setState('result')
    } catch (e) {
      setError('Gagal mengirim jawaban. Silakan coba lagi.')
      setState('error')
    }
  }, [questions, answers, onComplete])

  if (state === 'error') {
    return (
      <div role="alert" className="p-6 bg-red-50 rounded-lg text-center">
        <p className="text-red-700">{error}</p>
        <button onClick={() => setState('playing')} className="mt-4 btn-primary">
          Coba Lagi
        </button>
      </div>
    )
  }

  if (state === 'intro') {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">Siap Mengerjakan Kuis?</h2>
        <p className="mt-4 text-gray-600">
          {questions.length} soal | Waktu: ~{Math.ceil(questions.length * 72 / 60)} menit
        </p>
        <button onClick={() => setState('playing')} className="mt-6 btn-primary">
          Mulai
        </button>
      </div>
    )
  }

  if (state === 'result') return null // handled by parent

  return (
    <div className="quiz-container">
      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full bg-gray-200 rounded-full h-2 mb-6"
      >
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: progress + '%' }} />
      </div>

      {/* Timer */}
      <div aria-live="polite" className="text-right text-sm text-gray-500 mb-4">
        Sisa waktu: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          aria-label={'Soal ' + (currentIndex + 1)}
          className="question-card"
        >
          <p className="text-lg font-medium mb-4">{currentQuestion?.text}</p>
          <div className="space-y-3" role="radiogroup" aria-label="Pilihan Jawaban">
            {currentQuestion?.options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center p-3 border rounded-lg cursor-pointer
                           hover:bg-gray-50 transition-colors
                           focus-within:ring-2 focus-within:ring-primary"
              >
                <input
                  type="radio"
                  name={'q-' + currentQuestion.id}
                  value={opt.value}
                  checked={answers[currentQuestion.id] === opt.value}
                  onChange={() => handleAnswer(opt.value)}
                  className="w-5 h-5 accent-primary"
                />
                <span className="ml-3">{opt.label}</span>
              </label>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentIndex(i => i - 1)}
          disabled={currentIndex === 0}
          className="btn-secondary"
          aria-label="Soal Sebelumnya"
        >
          Sebelumnya
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion?.id]}
            className="btn-primary"
            aria-label="Soal Berikutnya"
          >
            Berikutnya
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="btn-primary bg-green-700 hover:bg-green-800"
            aria-label="Kumpulkan Semua Jawaban"
          >
            Selesai
          </button>
        )}
      </div>

      {/* Soal counter untuk screen reader */}
      <div aria-live="polite" className="sr-only">
        {currentIndex + 1} dari {questions.length}
      </div>
    </div>
  )
}
```

## Game Integration (AKAL Center Pattern)

```typescript
// app/game/page.tsx
// Game portal dengan dynamic loading dan fallback

const GAMES = [
  {
    title: 'Game Jujur dan Amanah',
    desc: 'Game interaktif tentang kejujuran dan amanah dalam kehidupan sehari-hari',
    url: 'https://game-jujur.my.canva.site/',
    image: '/images/games/game-jujur-dan-amanah.webp',
    badge: 'EKSTERNAL',
    duration: '10 menit',
    kelas: '8',
  },
  {
    title: 'Game Beriman kepada Kitab Allah',
    desc: 'Belajar tentang kitab-kitab Allah melalui game interaktif yang seru',
    url: 'https://game-kitab-allah.my.canva.site/',
    image: '/images/games/game-kitab-allah-swt.webp',
    badge: 'EKSTERNAL',
    duration: '10 menit',
    kelas: '8',
  },
]

export default function GamePage() {
  return (
    <main className="min-h-screen bg-[#f2fcf7] px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Game Edukasi</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => (
            <a
              key={game.title}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <article className="bg-white rounded-2xl overflow-hidden shadow-sm
                                  hover:shadow-xl transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-[#005231] to-[#1b6b45]
                                flex items-center justify-center">
                  {game.image ? (
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-white text-6xl opacity-50">&#127918;</span>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {game.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{game.desc}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {game.badge}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      {game.duration}
                    </span>
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
```

---


# ══════════════════════════════════════════════
# 🔍 DIAGNOSTIC SECURITY AUDIT — Checklist
# ══════════════════════════════════════════════

## Automated Security Audit — Panduan untuk Developer

### Pre-Deploy Security Scan

```bash
#!/bin/bash
# scripts/security-audit.sh
# Automated security checklist — jalankan sebelum setiap deploy
# ============================================================

echo "=== [1/8] Secret Scan ==="
grep -rn "sk-[A-Za-z0-9]" src/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null
grep -rn "ghp_[A-Za-z0-9]" src/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null
grep -rn "AKIA[0-9A-Z]" src/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null
echo "Done -- jika ada output di atas, secret bocor!"

echo "=== [2/8] Hardcoded Secrets ==="
grep -rn "process\.env" src/ lib/ --include="*.ts" --include="*.tsx" | grep -v "NEXT_PUBLIC_" | head -20
echo "Verifikasi: semua env var sudah di Vercel/Cloudflare?"

echo "=== [3/8] CSP Check ==="
grep -rn "Content-Security-Policy" middleware.ts 2>/dev/null || echo "WARNING: No CSP found!"

echo "=== [4/8] SQL Injection Risk ==="
rg "raw\(|query\(|execute\(" src/ lib/ --include="*.ts" 2>/dev/null | head -10
echo "Pastikan parameterized query, bukan string concat"

echo "=== [5/8] XSS Risk ==="
rg "dangerouslySetInnerHTML|innerHTML" src/ --include="*.tsx" 2>/dev/null || echo "Clean!"

echo "=== [6/8] Hardcoded URLs ==="
grep -rn "http://localhost" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -5
echo "Ganti dengan env var atau config"

echo "=== [7/8] Deprecated Packages ==="
npm audit 2>/dev/null | grep -E "HIGH|CRITICAL" || echo "No high/critical vulns"

echo "=== [8/8] TypeScript Strict Check ==="
npx tsc --noEmit 2>&1 | tail -5
```

---

## CI/CD PIPELINE — Production-Grade Automation

> Pipeline ini dirancang untuk tim kecil (1-3 developer) yang ingin rilis cepat tanpa technical debt. Semua pattern sudah teruji di production untuk platform edtech dengan 10k+ pengguna.

---

### 1. GitHub Actions Workflow — Deploy Full Stack

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy E-Learning Platform

env:
  NODE_VERSION: "20"
  PNPM_VERSION: "9"
  DATABASE_URL: "postgres://postgres:postgres@localhost:5432/testdb"
  NEXT_PUBLIC_SITE_URL: "https://elearning.example.com"

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Lint & Type Check
        run: |
          pnpm lint
          pnpm typecheck
        env:
          NEXT_PUBLIC_USE_CMS: "false"

      - name: Run database migrations
        run: pnpm db:migrate
        env:
          DATABASE_URL: ${{ env.DATABASE_URL }}

      - name: Run tests with coverage
        run: pnpm test -- --coverage --maxWorkers=2
        env:
          DATABASE_URL: ${{ env.DATABASE_URL }}
          JWT_SECRET: test-jwt-secret-32chars-minimum!!
          ADMIN_API_KEY: test-admin-key

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
          retention-days: 7

  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: test

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Build Next.js
        run: pnpm build
        env:
          NEXT_PUBLIC_SITE_URL: ${{ env.NEXT_PUBLIC_SITE_URL }}
          NEXT_PUBLIC_USE_CMS: "true"
          NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND: github

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: next-build
          path: |
            .next/
            public/
            package.json
            node_modules/.pnpm-lock-hash
          retention-days: 3

  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: [test, build]
    if: github.ref == 'refs/heads/main'

    environment: production

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: next-build

      - name: Run database migrations (production)
        run: pnpm db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Deploy to Vercel (blue-green)
        run: |
          VERCEL_PROJECT_ID=${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID=${{ secrets.VERCEL_ORG_ID }}
          npx vercel --prod --yes \
            --token ${{ secrets.VERCEL_TOKEN }} \
            --build-env NEXT_PUBLIC_SITE_URL=${{ env.NEXT_PUBLIC_SITE_URL }}

      - name: Health check after deploy
        run: |
          for i in $(seq 1 12); do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
              "https://elearning.example.com/api/health" \
              -H "Authorization: Bearer ${{ secrets.HEALTH_CHECK_KEY }}")
            if [ "$STATUS" = "200" ]; then
              echo "✅ Health check passed"
              exit 0
            fi
            echo "⏳ Waiting... attempt $i (status: $STATUS)"
            sleep 5
          done
          echo "❌ Health check failed after 60s"
          exit 1

      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v2
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": ":x: Deploy gagal: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\nCommit: ${{ github.sha }} oleh ${{ github.actor }}"
            }
```

**Penjelasan:**

| Bagian | Fungsi |
|--------|--------|
| `concurrency` | Batasi 1 deploy per branch. PR branch bisa di-cancel kalau ada push baru |
| `services.postgres` | Postgres container untuk migration + test — data hilang setelah job selesai |
| `lint + typecheck` | Gate pertama: jangan lanjut kalau TypeScript error |
| `db:migrate` | Jalankan migration di CI dulu — kalau error di CI, jangan deploy |
| `upload artifact` | Simpan `.next/` hasil build supaya deploy job tinggal upload |
| `environment: production` | GitHub Environments — butuh approval manual (opsional) |
| `health check` | Polling endpoint `/api/health` setelah deploy — kalau gagal, perlu rollback manual |

---

### 2. Blue-Green Deployment Strategy

**Untuk Vercel (serverless):**

Vercel sudah handle blue-green secara native — setiap deploy adalah `alias` baru. Saat deploy sukses, Vercel instantly swap traffic. Tidak ada downtime.

```bash
# Rollback ke deployment sebelumnya
npx vercel rollback --token $VERCEL_TOKEN

# Atau via dashboard: pilih deployment → "Promote to Production"
```

**Untuk Self-Hosted / Docker:**

```
Blue (saat ini)    Green (baru)
┌──────────────┐   ┌──────────────┐
│  App v2.0    │   │  App v2.1    │ ← deploy ke sini dulu
│  Nginx:3000  │   │  Nginx:3001  │
└──────────────┘   └──────────────┘
                          │ health check
                          ▼ success?
                    ┌──────────────┐
                    │  Swap Nginx  │
                    │  upstream →  │
                    │  port 3001   │
                    └──────────────┘
```

```nginx
# /etc/nginx/conf.d/elearning.conf
upstream elearning {
    server 127.0.0.1:3000;  # blue — active
    # server 127.0.0.1:3001;  # green — standby
}

# Swap on deploy:
# sed -i 's/:3000/:3001/' /etc/nginx/conf.d/elearning.conf
# nginx -s reload
```

**Database Migration Safety — 3 Golden Rules:**

| # | Rule | Kenapa |
|---|------|--------|
| 1 | **Expand-only**: ADD column, CREATE table, ADD index. Jangan DROP apapun. | Old code masih jalan selama deploy. Kalau old code akses column yang sudah di-drop → crash. |
| 2 | **Separate DROP**: Migration untuk DROP dikerjakan di PR terpisah, 1 deploy setelah deploy yang ADD. | Butuh waktu buat mastiin semua pod udah pakai kode baru. |
| 3 | **Backfill nullable**: Column baru harus nullable atau punya default. | Data lama belum punya nilai untuk column baru. Kalau NOT NULL tanpa default → insert error. |

**Contoh migration aman:**

```sql
-- ✅ AMAN: expand-only
ALTER TABLE enrollments ADD COLUMN cert_url TEXT;
ALTER TABLE enrollments ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);

-- ❌ BERBAHAYA: langsung DROP di migration yang sama
ALTER TABLE users DROP COLUMN old_avatar CASCADE;  -- → old code crash

-- ✅ AMAN: pisah di deploy berikutnya (setelah yakin semua pod pakai kode baru)
ALTER TABLE users DROP COLUMN old_avatar CASCADE;
```

**Rollback Procedure:**

```
── Deploy bermasalah ──────────────────────────

            ┌─ Vercel ──────────────────────┐
            │  npx vercel rollback           │ ← instant
            │  Atau dashboard → "Promote"    │
            └────────────────────────────────┘

            ┌─ Self-hosted ──────────────────┐
            │  git revert HEAD               │
            │  git push origin main          │ ← auto-deploy
            │  # atau: swap nginx back       │
            └────────────────────────────────┘

            ┌─ Database ─────────────────────┐
            │  # Tidak perlu rollback karena  │
            │  expand-only migration          │
            │  Column baru tidak dipakai      │
            │  code lama → tidak masalah      │
            └────────────────────────────────┘
```

**Feature Flags untuk Gradual Rollout:**

```typescript
// lib/feature-flags.ts
interface FeatureFlags {
  newDashboard: boolean;
  quizV2: boolean;
  certDownload: boolean;
}

const FLAGS: Record<string, FeatureFlags> = {
  development: {
    newDashboard: true,
    quizV2: true,
    certDownload: false,
  },
  staging: {
    newDashboard: true,
    quizV2: false,
    certDownload: false,
  },
  production: {
    newDashboard: false,  // mati dulu, nyala via env
    quizV2: false,
    certDownload: false,
  },
};

export function isEnabled(flag: keyof FeatureFlags): boolean {
  const env = process.env.NEXT_PUBLIC_APP_ENV ?? "development";
  const overrides = process.env[`FLAG_${flag}`];
  if (overrides === "true") return true;
  if (overrides === "false") return false;
  return FLAGS[env]?.[flag] ?? false;
}
```

Cara pakai:

```bash
# Di Vercel dashboard, set environment variable:
# FLAG_newDashboard = 1    → nyalakan untuk 100% user
# Atau via feature flag service (LaunchDarkly, GrowthBook)
```

---

### 3. Environment Management

**`.env.example` — dokumentasi lengkap:**

```bash
# ============================================================================
# E-LEARNING PLATFORM — Environment Variables
# ============================================================================
# Copy this file to:
#   .env.local       → development
#   .env.test        → CI
#   .env.production  → production (set via Vercel Dashboard)
# ============================================================================

# --- Next.js ---
NEXT_PUBLIC_SITE_URL=https://elearning.example.com
NEXT_PUBLIC_APP_ENV=development  # development | staging | production

# --- Database (via Supabase / Postgres) ---
DATABASE_URL=postgres://user:pass@host:5432/elearning
# Migration only. App uses Supabase client for queries.

# --- Authentication ---
JWT_SECRET=change-me-to-random-32-chars-minimum
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# --- Admin ---
ADMIN_API_KEY=change-me-to-random-string

# --- Midtrans Payment Gateway ---
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false

# --- Xendit (fallback payment gateway) ---
XENDIT_SECRET_API_KEY=xnd_development_xxxxx
XENDIT_CALLBACK_TOKEN=xnd_callback_xxxxx

# --- Google Sheets (synchronization) ---
GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=1abc123def456

# --- Telegram Notifications ---
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234
TELEGRAM_CHAT_ID=-1001234567890

# --- CMS (Keystatic) ---
NEXT_PUBLIC_USE_CMS=true
NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND=github  # local | github
KEYSTATIC_GITHUB_CLIENT_ID=Iv23lixxxxx
KEYSTATIC_GITHUB_CLIENT_SECRET=xxxxx
KEYSTATIC_SECRET=encryption-key-32-chars-minimum

# --- Feature Flags ---
FLAG_newDashboard=false
FLAG_quizV2=false

# --- Monitoring ---
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx

# --- Storage ---
S3_ENDPOINT=https://sgp1.digitaloceanspaces.com
S3_REGION=sgp1
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_BUCKET=elearning-assets
```

**File Mapping:**

| File | Environment | Git? | Untuk |
|------|-------------|------|-------|
| `.env.local` | Development | ❌ .gitignore | Developer lokal |
| `.env.test` | CI | ✅ Boleh (nilai dummy) | GitHub Actions |
| `.env.production` | Production | ❌ | Vercel Env Variables |
| `.env.example` | All | ✅ | Dokumentasi |

**Dev vs Prod — apa yang berbeda:**

| Variabel | Dev | Prod |
|----------|-----|------|
| `DATABASE_URL` | Local Postgres | Supabase production |
| `MIDTRANS_IS_PRODUCTION` | `false` | `true` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://elearning.example.com` |
| `NEXT_PUBLIC_APP_ENV` | `development` | `production` |

---

### 4. Secret Rotation Procedure

**Rotasi JWT_SECRET — zero-downtime (2 key system):**

```typescript
// lib/auth.ts
interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

interface ActiveKeys {
  current: string;  // untuk SIGN token baru
  previous: string; // untuk VERIFY token lama (masih valid)
}

function getActiveKeys(): ActiveKeys {
  return {
    current: process.env.JWT_SECRET!,
    previous: process.env.JWT_SECRET_PREVIOUS ?? "",
  };
}

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  const { current } = getActiveKeys();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "30m")
    .sign(new TextEncoder().encode(current));
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { current, previous } = getActiveKeys();

  // Coba current key dulu
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(current));
    return payload as unknown as JwtPayload;
  } catch {
    // Gagal → coba previous key (token lama masih valid)
  }

  if (previous) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(previous));
      return payload as unknown as JwtPayload;
    } catch {
      // Gagal juga → token expired atau invalid
    }
  }

  throw new AuthError("Token tidak valid atau sudah expired");
}
```

**Prosedur rotasi JWT_SECRET:**

```
Minggu 1:
  1. Set JWT_SECRET_PREVIOUS = JWT_SECRET (nilai lama)
  2. Set JWT_SECRET = nilai_baru_acak_32_karakter
  3. Deploy → Token baru pake JWT_SECRET, token lama masih valid via PREVIOUS

Minggu 2 (setelah JWT_SECRET_PREVIOUS sudah tidak terpakai):
  4. Hapus JWT_SECRET_PREVIOUS dari environment
  5. Deploy → cleanup
```

**Rotasi API Key — zero-downtime (dual-key pattern):**

```typescript
// middleware.ts (atau API route guard)
function validateApiKey(key: string): boolean {
  const currentKey = process.env.ADMIN_API_KEY;
  const previousKey = process.env.ADMIN_API_KEY_PREVIOUS;

  if (constantTimeEqual(key, currentKey)) return true;
  if (previousKey && constantTimeEqual(key, previousKey)) return true;

  return false;
}
```

Prosedur: sama dengan JWT — set PREVIOUS dulu, deploy, lalu ganti CURRENT, deploy, lalu hapus PREVIOUS.

---

### 5. Database Migration CI Check

**Deteksi breaking change di migration:**

```bash
# scripts/check-migration.sh
#!/bin/bash
# Jalankan di CI — detect kalau migration berisi DROP/ALTER COLUMN DROP

MIGRATIONS_DIR="supabase/migrations"

for file in $(git diff --name-only origin/main...HEAD -- "$MIGRATIONS_DIR"); do
  if grep -qiE '^\s*(DROP|ALTER\s+.*DROP|RENAME)\s' "$file"; then
    echo "❌ BREAKING CHANGE terdeteksi di: $file"
    echo "   Migration mengandung DROP/ALTER DROP/RENAME"
    echo "   Ini harus dipisah ke PR terpisah setelah deploy."
    echo ""
    echo "   ✅ Yang diperbolehkan: ADD COLUMN, CREATE TABLE, ADD INDEX"
    echo "   ❌ Yang DITOLAK: DROP COLUMN, DROP TABLE, RENAME COLUMN"
    exit 1
  fi
done

echo "✅ Semua migration aman (expand-only)"
```

**Integrasi dengan GitHub Actions:**

```yaml
# Di job test, sebelum db:migrate
- name: Check migration safety
  run: bash scripts/check-migration.sh

- name: Run migrations
  run: pnpm db:migrate
  env:
    DATABASE_URL: ${{ env.DATABASE_URL }}
```

**Migration review checklist (untuk PR template):**

```
## Migration Review
- [ ] Migration adalah expand-only (ADD/CREATE only, no DROP)
- [ ] Column baru nullable atau punya default
- [ ] Index baru sudah di-test di staging
- [ ] Data backfill sudah siap (kalau perlu)
- [ ] Sudah rollback-tested: revert code → migration gak crash
```

---

### 6. Code Quality Gates

**Gates yang dijalankan di CI (urutan):**

| Gate | Command | Fail jika | Waktu |
|------|---------|-----------|-------|
| 1. ESLint | `pnpm lint` | Ada error (warning = ok) | ~30s |
| 2. TypeScript | `pnpm typecheck` | Type error apapun | ~60s |
| 3. Migration check | `bash check-migration.sh` | DROP/ALTER DROP | ~5s |
| 4. Migration run | `pnpm db:migrate` | Migration error | ~30s |
| 5. Unit test | `pnpm test` | Ada test fail | ~3m |
| 6. Coverage threshold | `pnpm test -- --coverage` | Coverage < 70% | ~3m |

**Branch Protection Rules (GitHub Settings → Branches → Add rule):**

```
Branch: main
☑ Require pull request before merging
  ☑ Require approvals (1)
  ☑ Dismiss stale reviews
☑ Require status checks to pass
  ☑ test, build (dari GitHub Actions)
☑ Require branches to be up-to-date
☑ Require conversation resolution first
☑ Include administrators
☑ Allow force pushes: ❌
☑ Allow deletions: ❌
```

**PR Checklist Template (`.github/PULL_REQUEST_TEMPLATE.md`):**

```markdown
## Deskripsi
<!-- Jelaskan apa yang diubah dan kenapa -->

## Checklist
- [ ] Kode sudah di-test lokal (`pnpm dev`)
- [ ] Lint & type check lolos (`pnpm lint && pnpm typecheck`)
- [ ] Test coverage tidak turun
- [ ] Migration expand-only (no DROP)
- [ ] Environment variable baru sudah ditambah ke `.env.example`
- [ ] API response backward-compatible (tidak hapus field yang dipakai frontend)
- [ ] Kalau ada migration → sudah di-review oleh 1 orang lain

## Screenshot (jika ada perubahan UI)

## Related Issue
Closes #XXX
```

---

## PAYMENT INTEGRATION INDONESIA

> Ekosistem pembayaran Indonesia unik: **QRIS dominant (40%+), bank transfer 30%, kartu kredit <5%.** Stripe saja tidak cukup — platform edtech wajib integrasi Midtrans atau Xendit untuk cover semua metode pembayaran yang dipakai siswa dan institusi.

---

### 1. Why Stripe Isn't Enough for Indonesia

| Metode Pembayaran | Penetrasi | Stripe | Midtrans | Xendit |
|-------------------|-----------|--------|----------|--------|
| Kartu Kredit | ~3-5% | ✅ | ✅ | ✅ |
| Bank Transfer (BCA/Mandiri/BNI/BRI) | ~30% | ❌ | ✅ | ✅ |
| QRIS (semua QR) | ~40% | ❌ | ✅ | ✅ |
| GoPay / OVO / Dana / ShopeePay | ~20% | ❌ | ✅ | ✅ |
| Indomaret / Alfamart | ~5% | ❌ | ✅ | ✅ |
| Akulaku (cicilan) | ~2% | ❌ | ✅ | ✅ |

**Realita:** 95%+ transaksi edtech Indonesia pakai non-kartu. Midtrans/Xendit handle semuanya via 1 API — QRIS, transfer, e-wallet, retail.

---

### 2. Midtrans Integration

**Payment handler — tipe aman dengan full error handling:**

```typescript
// lib/midtrans.ts
import Midtrans from "midtrans-client";

export class MidtransService {
  private core: Midtrans.CoreApi;
  private snap: Midtrans.Snap;

  constructor() {
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    this.core = new Midtrans.CoreApi({
      isProduction,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    this.snap = new Midtrans.Snap({
      isProduction,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });
  }

  async createTransaction(params: {
    orderId: string;
    amount: number;
    customer: { name: string; email: string; phone?: string };
    items: Array<{ name: string; price: number; quantity: number }>;
  }) {
    try {
      const transaction = await this.snap.createTransaction({
        transaction_details: {
          order_id: params.orderId,
          gross_amount: params.amount,
        },
        credit_card: { secure: true },
        customer_details: {
          first_name: params.customer.name,
          email: params.customer.email,
          phone: params.customer.phone,
        },
        item_details: params.items,
        // Expire dalam 24 jam
        expiry: {
          start_time: new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14),
          unit: "hours",
          duration: 24,
        },
      });

      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    } catch (error) {
      console.error("[Midtrans] Create transaction failed:", error);
      throw new PaymentError("Gagal membuat transaksi pembayaran");
    }
  }

  verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    serverKey: string,
    signatureKey: string,
  ): boolean {
    const hash = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    return hash === signatureKey;
  }
}

export const midtrans = new MidtransService();
```

**Webhook handler — full signature verification:**

```typescript
// app/api/payments/midtrans-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { midtrans } from "@/lib/midtrans";
import { updateEnrollment } from "@/lib/enrollment";
import { sendPaymentEmail } from "@/lib/email";
import { z } from "zod";

const MidtransWebhookSchema = z.object({
  transaction_status: z.string(),
  fraud_status: z.string(),
  order_id: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  status_code: z.string(),
  transaction_id: z.string().optional(),
  payment_type: z.string().optional(),
  settlement_time: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  console.log(`[Midtrans Webhook] Request ${requestId} received`);

  try {
    const body = await req.json();
    const parsed = MidtransWebhookSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`[Midtrans Webhook] Invalid payload:`, parsed.error.issues);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const {
      transaction_status: status,
      fraud_status: fraud,
      order_id: orderId,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      status_code: statusCode,
    } = parsed.data;

    // 1. Verifikasi signature
    const isValid = midtrans.verifySignature(
      orderId,
      statusCode,
      grossAmount,
      process.env.MIDTRANS_SERVER_KEY!,
      signatureKey,
    );

    if (!isValid) {
      console.error(`[Midtrans Webhook] Invalid signature for ${orderId}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Fraud check
    if (fraud === "deny" || fraud === "deny") {
      console.warn(`[Midtrans Webhook] Fraud detected: ${orderId}`);
      await updateEnrollment(orderId, { status: "fraud_denied" });
      return NextResponse.json({ status: "fraud_denied" });
    }

    // 3. Handle status
    switch (status) {
      case "settlement":
      case "capture": {
        // ✅ Bayar sukses — aktivasi enrollment
        await updateEnrollment(orderId, {
          status: "active",
          paymentMethod: parsed.data.payment_type ?? "unknown",
          paidAt: parsed.data.settlement_time ?? new Date().toISOString(),
        });

        // Kirim email konfirmasi
        await sendPaymentEmail(orderId, "payment_success").catch((err) => {
          console.error(`[Midtrans] Email failed for ${orderId}:`, err);
          // Jangan gagalkan webhook karena email error
        });

        console.log(`[Midtrans Webhook] ✅ ${orderId} settled`);
        break;
      }

      case "expire": {
        // ⏰ Waktu habis — cancel enrollment
        await updateEnrollment(orderId, { status: "expired" });
        console.log(`[Midtrans Webhook] ⏰ ${orderId} expired`);
        break;
      }

      case "deny": {
        // ❌ Pembayaran ditolak
        await updateEnrollment(orderId, { status: "denied" });
        console.warn(`[Midtrans Webhook] ❌ ${orderId} denied`);
        break;
      }

      case "pending": {
        // ⏳ Belum dibayar — update status
        await updateEnrollment(orderId, { status: "pending" });
        console.log(`[Midtrans Webhook] ⏳ ${orderId} pending`);
        break;
      }

      default: {
        console.log(`[Midtrans Webhook] Unhandled status ${status} for ${orderId}`);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(`[Midtrans Webhook] Error ${requestId}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

**Idempotency key — cegah double enrollment:**

```typescript
// Pakai order_id sebagai idempotency key — karena order_id unique
async function updateEnrollment(orderId: string, data: Partial<Enrollment>) {
  // Cek dulu apakah sudah diproses
  const existing = await db.enrollment.findUnique({ where: { orderId } });
  if (existing?.status === "active") {
    console.log(`[Idempotency] ${orderId} sudah active — skip`);
    return existing;
  }

  // Proses update
  return db.enrollment.update({
    where: { orderId },
    data,
  });
}
```

---

### 3. Xendit Integration (Alternative)

```typescript
// lib/xendit.ts
export class XenditService {
  private apiKey: string;
  private baseUrl = "https://api.xendit.co";

  constructor() {
    this.apiKey = process.env.XENDIT_SECRET_API_KEY!;
  }

  private get headers() {
    return {
      Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
      "Content-Type": "application/json",
    };
  }

  async createInvoice(params: {
    externalId: string;
    amount: number;
    customer: { name: string; email: string };
    items: Array<{ name: string; price: number; quantity: number }>;
    expiryMinutes?: number;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/v2/invoices`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          external_id: params.externalId,
          amount: params.amount,
          payer_email: params.customer.email,
          description: `Pembayaran ${params.items.map((i) => i.name).join(", ")}`,
          customer: {
            given_names: params.customer.name,
            email: params.customer.email,
          },
          items: params.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          invoice_duration: params.expiryMinutes ?? 1440, // 24 jam default
          currency: "IDR",
          // Opsi metode pembayaran
          available_banks: [
            { bank_code: "BCA", collection_type: "POOL" },
            { bank_code: "MANDIRI", collection_type: "POOL" },
            { bank_code: "BNI", collection_type: "POOL" },
            { bank_code: "BRI", collection_type: "POOL" },
          ],
          available_ewallets: [{ ewallet_type: "OVO" }, { ewallet_type: "DANA" }],
          available_qr_codes: [{ qr_code_type: "QRIS" }],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new PaymentError(`Xendit error: ${error.message ?? "Unknown"}`);
      }

      return (await response.json()) as {
        id: string;
        invoice_url: string;
        status: string;
        expiry_date: string;
      };
    } catch (error) {
      console.error("[Xendit] Create invoice failed:", error);
      throw new PaymentError("Gagal membuat invoice pembayaran");
    }
  }

  verifyCallbackToken(callbackToken: string): boolean {
    // Xendit callback token verification
    const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;
    if (!expectedToken) {
      console.error("[Xendit] CALLBACK_TOKEN not configured");
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(callbackToken),
      Buffer.from(expectedToken),
    );
  }
}

export const xendit = new XenditService();
```

---

### 4. Payment Flow End-to-End

```
User                                 Frontend                      Backend                      Midtrans/Xendit
───                                  ────────                      ───────                      ──────────────
  │                                     │                            │                            │
  │  Klik "Beli Kursus"                 │                            │                            │
  │────────────────────────────────────►│                            │                            │
  │                                     │                            │                            │
  │                                     │  POST /api/payments/create │                            │
  │                                     │───────────────────────────►│                            │
  │                                     │                            │                            │
  │                                     │                            │  Create transaction         │
  │                                     │                            │───────────────────────────►│
  │                                     │                            │                            │
  │                                     │                            │◄───────────────────────────│
  │                                     │                            │  { token, redirect_url }   │
  │                                     │                            │                            │
  │                                     │◄───────────────────────────│                            │
  │                                     │  { snapToken, redirectUrl }│                            │
  │                                     │                            │                            │
  │  Redirect to Midtrans Snap Page     │                            │                            │
  │◄────────────────────────────────────│                            │                            │
  │                                     │                            │                            │
  │  ┌──────────────────────────┐       │                            │                            │
  │  │       SNAP PAGE          │       │                            │                            │
  │  │  QRIS / Transfer /OVO    │       │                            │                            │
  │  └──────────┬───────────────┘       │                            │                            │
  │             │ Bayar                 │                            │                            │
  │             ▼                       │                            │                            │
  │  ┌──────────────────────────┐       │                            │                            │
  │  │  PEMBAYARAN BERHASIL     │       │                            │                            │
  │  └──────────────────────────┘       │                            │                            │
  │                                     │                            │                            │
  │                                     │                            │  Webhook: settlement        │
  │                                     │                            │◄───────────────────────────│
  │                                     │                            │                            │
  │                                     │                            │  Verify signature          │
  │                                     │                            │  Update enrollment → active│
  │                                     │                            │  Send email                │
  │                                     │                            │                            │
  │                                     │  Polling: GET /api/...     │                            │
  │                                     │───────────────────────────►│                            │
  │                                     │◄───────────────────────────│                            │
  │                                     │  { status: "active" }      │                            │
  │                                     │                            │                            │
  │  ✅ Course unlocked                  │                            │                            │
  │◄────────────────────────────────────│                            │                            │
```

**API endpoint untuk initiate payment:**

```typescript
// app/api/payments/create/route.ts
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = CreatePaymentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { courseId, couponCode } = parsed.data;

  // 1. Ambil course + hitung harga
  const course = await getCourse(courseId);
  if (!course || !course.price) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  let finalPrice = course.price;
  let discount = 0;
  if (couponCode) {
    const coupon = await validateCoupon(couponCode, courseId);
    if (coupon) {
      discount = coupon.type === "percentage"
        ? Math.round(course.price * coupon.value / 100)
        : coupon.value;
      finalPrice = course.price - discount;
    }
  }

  // 2. Buat enrollment record (pending)
  const orderId = `ENR-${Date.now()}-${session.userId}`;
  await createEnrollment({
    orderId,
    courseId,
    userId: session.userId,
    amount: finalPrice,
    discount,
    status: "pending",
    couponCode: couponCode ?? null,
  });

  // 3. Create Midtrans transaction
  const transaction = await midtrans.createTransaction({
    orderId,
    amount: finalPrice,
    customer: {
      name: session.user.name,
      email: session.user.email,
    },
    items: [
      {
        name: course.title,
        price: finalPrice,
        quantity: 1,
      },
    ],
  });

  return NextResponse.json({
    snapToken: transaction.token,
    redirectUrl: transaction.redirectUrl,
    orderId,
  });
}
```

---

### 5. Subscription Billing untuk B2B

Sekolah/institusi biasanya beli paket bulanan per-seat.

```typescript
// lib/subscription.ts
interface SubscriptionPlan {
  id: string;
  name: string;             // "Paket Sekolah Dasar"
  pricePerSeat: number;      // 20_000 (per siswa/bulan)
  minSeats: number;          // 30
  maxSeats: number;          // 500
  billingCycle: "monthly" | "yearly";
}

interface BillingInvoice {
  invoiceId: string;
  institutionId: string;
  periodStart: string;       // "2026-07-01"
  periodEnd: string;         // "2026-07-31"
  totalSeats: number;        // 150
  amount: number;            // 3_000_000
  status: "pending" | "paid" | "overdue" | "cancelled";
}

export class BillingService {
  /**
   * Generate monthly invoice untuk B2B subscriptions.
   * Dipanggil oleh cron job setiap tanggal 1.
   */
  async generateMonthlyInvoices(): Promise<number> {
    const activeSubscriptions = await db.subscription.findMany({
      where: {
        status: "active",
        nextBillingDate: { lte: new Date() },
      },
      include: { institution: true },
    });

    let count = 0;
    for (const sub of activeSubscriptions) {
      try {
        // Hitung jumlah seat aktif
        const activeSeats = await db.enrollment.count({
          where: {
            institutionId: sub.institutionId,
            status: "active",
          },
        });

        const billedSeats = Math.max(activeSeats, sub.minSeats);
        const amount = billedSeats * sub.pricePerSeat;

        // Buat invoice — bisa manual via Midtrans invoice atau QRIS
        await this.createInvoice({
          institutionId: sub.institutionId,
          subscriptionId: sub.id,
          periodStart: sub.nextBillingDate.toISOString(),
          periodEnd: addMonths(sub.nextBillingDate, 1).toISOString(),
          totalSeats: billedSeats,
          amount,
        });

        // Update next billing date
        await db.subscription.update({
          where: { id: sub.id },
          data: { nextBillingDate: addMonths(sub.nextBillingDate, 1) },
        });

        count++;
      } catch (error) {
        console.error(`[Billing] Failed to generate invoice for ${sub.id}:`, error);
      }
    }

    return count;
  }

  /**
   * Grace period: 7 hari setelah jatuh tempo.
   * Kalau belum bayar → suspend akses.
   */
  async processOverdueSubscriptions(): Promise<void> {
    const overdue = await db.invoice.findMany({
      where: {
        status: "pending",
        dueDate: { lt: subDays(new Date(), 7) },
      },
    });

    for (const inv of overdue) {
      await db.subscription.update({
        where: { id: inv.subscriptionId },
        data: { status: "suspended" },
      });

      // Notifikasi admin sekolah
      await sendNotification(inv.institutionId, "subscription_suspended");
    }
  }
}
```

**Cron job untuk billing:**

```typescript
// app/api/cron/generate-invoices/route.ts
export async function GET(req: NextRequest) {
  // Proteksi cron — hanya dari Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await billingService.generateMonthlyInvoices();
  await billingService.processOverdueSubscriptions();

  return NextResponse.json({
    success: true,
    invoicesGenerated: count,
    timestamp: new Date().toISOString(),
  });
}
```

```json
// vercel.json — cron job
{
  "crons": [
    {
      "path": "/api/cron/generate-invoices",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

---

### 6. Promo Code System

```typescript
// lib/coupon.ts
import { z } from "zod";
import crypto from "crypto";

interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;          // 10 (untuk 10% atau Rp 10.000)
  minPurchase?: number;   // Minimal belanja
  maxDiscount?: number;   // Maks diskon (untuk percentage)
  usageLimit: number;     // Maks total penggunaan
  usedCount: number;
  expiresAt: string;
  courseIds?: string[];    // Khusus course tertentu (nullable = all)
}

const CreateCouponSchema = z.object({
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  minPurchase: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().positive().default(100),
  expiresAt: z.string().datetime(),
  courseIds: z.array(z.string()).optional(),
});

export class CouponService {
  generateCode(): string {
    // Format: PROMO-XXXXXXXX (8 karakter alfanumerik uppercase)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0/O/1/I
    let code = "PROMO-";
    for (let i = 0; i < 8; i++) {
      code += chars[crypto.randomInt(chars.length)];
    }
    return code;
  }

  async createCoupon(input: z.infer<typeof CreateCouponSchema>): Promise<Coupon> {
    return db.coupon.create({
      data: {
        code: this.generateCode(),
        ...input,
        usedCount: 0,
      },
    });
  }

  async validateCoupon(code: string, courseId?: string): Promise<Coupon | null> {
    const coupon = await db.coupon.findUnique({ where: { code } });

    if (!coupon) return null;                          // Tidak ditemukan
    if (coupon.usedCount >= coupon.usageLimit) return null;  // Habis
    if (new Date(coupon.expiresAt) < new Date()) return null; // Expired
    if (coupon.courseIds?.length && courseId && !coupon.courseIds.includes(courseId)) {
      return null; // Tidak berlaku untuk course ini
    }

    return coupon;
  }

  calculateDiscount(coupon: Coupon, price: number): number {
    let discount = 0;

    if (coupon.type === "percentage") {
      discount = Math.round(price * coupon.value / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    // Minimal belanja
    if (coupon.minPurchase && price < coupon.minPurchase) {
      return 0;
    }

    return Math.min(discount, price); // Tidak boleh lebih dari harga
  }

  async useCoupon(code: string): Promise<void> {
    await db.coupon.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  }
}
```

---

### 7. Invoice Generation untuk Institusi

Institusi di Indonesia butuh invoice resmi dengan NPWP + PPN 11%.

```typescript
// lib/invoice.ts
import PDFDocument from "pdfkit";

interface InvoiceData {
  invoiceNumber: string;
  institutionName: string;
  npwp: string;
  address: string;
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  ppnRate: number;       // 11 (persen)
  ppnAmount: number;
  total: number;
  date: string;
  dueDate: string;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("AKAL Center", { align: "center" })
      .fontSize(10)
      .font("Helvetica")
      .text("Model Pembelajaran Akidah Akhlak berbasis Deep Learning", { align: "center" })
      .moveDown(2);

    // Invoice title
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("INVOICE", { align: "center" })
      .moveDown(0.5);

    // Invoice meta
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`No. Invoice: ${data.invoiceNumber}`)
      .text(`Tanggal: ${data.date}`)
      .text(`Jatuh Tempo: ${data.dueDate}`)
      .moveDown(1);

    // Institution info
    doc
      .font("Helvetica-Bold")
      .text("Kepada:")
      .font("Helvetica")
      .text(data.institutionName)
      .text(`NPWP: ${data.npwp}`)
      .text(data.address)
      .moveDown(1);

    // Table header
    const tableTop = doc.y;
    doc
      .font("Helvetica-Bold")
      .text("Item", 50, tableTop)
      .text("Qty", 350, tableTop, { width: 50, align: "center" })
      .text("Harga", 400, tableTop, { width: 100, align: "right" })
      .text("Total", 470, tableTop, { width: 100, align: "right" });

    doc.moveDown(0.5);
    doc
      .moveTo(50, doc.y)
      .lineTo(570, doc.y)
      .stroke();

    // Items
    for (const item of data.items) {
      doc.moveDown(0.5);
      const y = doc.y;
      doc
        .font("Helvetica")
        .text(item.name, 50, y)
        .text(String(item.qty), 350, y, { width: 50, align: "center" })
        .text(formatCurrency(item.price), 400, y, { width: 100, align: "right" })
        .text(formatCurrency(item.price * item.qty), 470, y, { width: 100, align: "right" });
    }

    // Total
    doc.moveDown(2);
    const totalY = doc.y;
    doc
      .font("Helvetica")
      .text("Subtotal:", 400, totalY, { width: 100, align: "right" })
      .text(formatCurrency(data.subtotal), 470, totalY, { width: 100, align: "right" })
      .text(`PPN ${data.ppnRate}%:`, 400, doc.y + 20, { width: 100, align: "right" })
      .text(formatCurrency(data.ppnAmount), 470, doc.y, { width: 100, align: "right" })
      .font("Helvetica-Bold")
      .text("Total:", 400, doc.y + 20, { width: 100, align: "right" })
      .text(formatCurrency(data.total), 470, doc.y, { width: 100, align: "right" });

    // Footer
    doc.moveDown(3);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#666")
      .text(
        "Pembayaran dapat dilakukan melalui transfer bank BCA 1234567890 a.n. AKAL Center",
        { align: "center" },
      )
      .text("Atau melalui Midtrans/Xendit link yang dikirim terpisah", { align: "center" });

    doc.end();
  });
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
```

---

### 8. Refund Flow

```typescript
// lib/refund.ts
import { z } from "zod";

const RefundReasonSchema = z.enum([
  "duplicate_purchase",
  "course_not_suitable",
  "technical_issues",
  "student_request",
  "admin_override",
]);

interface RefundRequest {
  enrollmentId: string;
  reason: z.infer<typeof RefundReasonSchema>;
  notes?: string;
  requestedBy: string;  // userId (siswa) atau adminId
}

export class RefundService {
  /**
   * Auto-refund — dalam 7 hari, progress < 20%.
   */
  async processAutoRefund(req: RefundRequest): Promise<RefundResult> {
    const enrollment = await db.enrollment.findUnique({
      where: { id: req.enrollmentId },
      include: { course: true },
    });

    if (!enrollment) {
      return { status: "error", message: "Enrollment not found" };
    }

    // Cek syarat auto-refund
    const daysSincePurchase = daysBetween(enrollment.createdAt, new Date());
    const progress = await this.calculateProgress(enrollment);
    const isWithinGracePeriod = daysSincePurchase <= 7;
    const isMinimalProgress = progress < 20;

    if (!isWithinGracePeriod) {
      return {
        status: "requires_manual",
        message: `Melebihi 7 hari masa grace (${daysSincePurchase} hari). Perlu review admin.`,
      };
    }

    if (req.reason === "admin_override") {
      // Admin override — tidak perlu cek syarat
      return this.executeRefund(enrollment, "full", req);
    }

    if (isMinimalProgress) {
      // Full refund
      return this.executeRefund(enrollment, "full", req);
    }

    if (progress >= 20 && progress < 80) {
      // Pro-rata: refund berdasarkan sisa module
      const refundPercentage = 100 - progress;
      return this.executeRefund(enrollment, "partial", req, refundPercentage);
    }

    // Progress > 80% — tidak bisa refund
    return {
      status: "denied",
      message: `Progress sudah ${progress}%. Mohon hubungi admin untuk kasus khusus.`,
    };
  }

  private async executeRefund(
    enrollment: Enrollment,
    type: "full" | "partial",
    req: RefundRequest,
    percentage?: number,
  ): Promise<RefundResult> {
    let refundAmount = 0;

    if (type === "full") {
      refundAmount = enrollment.amount;
    } else if (percentage) {
      refundAmount = Math.round(enrollment.amount * percentage / 100);
    }

    // Catat refund
    await db.refund.create({
      data: {
        enrollmentId: enrollment.id,
        orderId: enrollment.orderId,
        amount: refundAmount,
        type,
        reason: req.reason,
        notes: req.notes,
        requestedBy: req.requestedBy,
        status: "pending",    // Tunggu diproses oleh Midtrans
      },
    });

    // Trigger refund ke Midtrans
    // Catatan: Midtrans refund perlu process di dashboard atau via API
    // https://api.midtrans.com/v2/{order_id}/refund
    try {
      await midtrans.refund(enrollment.orderId, refundAmount);
    } catch (error) {
      console.error("[Refund] Midtrans refund failed:", error);
      // Refund tetap tercatat — admin bisa proses manual di dashboard Midtrans
    }

    // Update enrollment
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "refunded" },
    });

    // Kirim email
    await sendRefundEmail(enrollment, refundAmount);

    return {
      status: "success",
      message: `Refund ${type} sebesar Rp ${refundAmount.toLocaleString("id-ID")} berhasil diproses.`,
      refundAmount,
    };
  }

  private async calculateProgress(enrollment: Enrollment): Promise<number> {
    const totalModules = await db.module.count({
      where: { courseId: enrollment.courseId },
    });
    const completedModules = await db.progress.count({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
    });

    if (totalModules === 0) return 0;
    return Math.round((completedModules / totalModules) * 100);
  }
}
```

---

### 9. Payment Status Dashboard (Admin)

```typescript
// app/api/admin/payments/route.ts
export async function GET(req: NextRequest) {
  // Auth: hanya admin
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || !validateApiKey(apiKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const status = searchParams.get("status");   // active | pending | expired | refunded
  const from = searchParams.get("from");        // 2026-01-01
  const to = searchParams.get("to");            // 2026-12-31

  const where: any = {};
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [enrollments, total] = await Promise.all([
    db.enrollment.findMany({
      where,
      include: {
        course: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      skip: (page - 1) * 50,
    }),
    db.enrollment.count({ where }),
  ]);

  const revenue = await db.enrollment.aggregate({
    where: {
      status: "active",
      ...(from || to ? {
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      } : {}),
    },
    _sum: { amount: true },
  });

  return NextResponse.json({
    data: enrollments.map((e) => ({
      id: e.orderId,
      student: e.user.name,
      course: e.course.title,
      amount: e.amount,
      status: e.status,
      paymentMethod: e.paymentMethod,
      paidAt: e.paidAt,
      createdAt: e.createdAt,
    })),
    pagination: {
      page,
      total,
      totalPages: Math.ceil(total / 50),
    },
    revenue: {
      total: revenue._sum.amount ?? 0,
      currency: "IDR",
    },
  });
}
```

**Dashboard page structure:**

```
/admin/payments/
├── Filters: Status | Date Range | Payment Method
├── Summary Cards:
│   ├── 💰 Revenue Bulan Ini    Rp 45.000.000
│   ├── 📊 Transaksi Sukses     342
│   ├── ⏳ Pending              12
│   └── ❌ Failed               3
├── Transactions Table:
│   ├── Order ID | Student | Course | Amount | Status | Method | Date
│   └── [Detail] [Refund] [Resend Email] actions
├── Revenue Chart (Line chart 30 hari)
└── Failed Transaction Log
    ├── Timestamp | Error | User IP | Payment Method
    └── [Retry]
```

**Failed transaction log — penting untuk debugging:**

```typescript
// app/api/admin/payments/failed/route.ts
export async function GET(req: NextRequest) {
  // Log semua transaction attempt yang gagal
  const logs = await db.paymentLog.findMany({
    where: { success: false },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    data: logs.map((log) => ({
      timestamp: log.createdAt,
      orderId: log.orderId,
      error: log.errorMessage,
      paymentMethod: log.paymentMethod,
      userIp: log.userIp,           // Buat track fraud pattern
      userAgent: log.userAgent,
    })),
  });
}
```

**Ringkasan komponen payment gateway yang perlu diimplementasikan:**

| Komponen | File | Fungsi |
|----------|------|--------|
| Midtrans service | `lib/midtrans.ts` | Create transaction, verify signature, refund |
| Xendit service | `lib/xendit.ts` | Create invoice, callback verification |
| Webhook handler | `app/api/payments/midtrans-webhook/route.ts` | Settlement → activate enrollment |
| Payment create | `app/api/payments/create/route.ts` | Initiate payment flow |
| Coupon service | `lib/coupon.ts` | Generate, validate, apply discount |
| Invoice PDF | `lib/invoice.ts` | Generate PDF invoice for institutions |
| Refund service | `lib/refund.ts` | Auto/manual refund with progress check |
| Billing service | `lib/subscription.ts` | Monthly invoice + grace period |
| Admin payments API | `app/api/admin/payments/route.ts` | Transaction list, revenue, failed log |
| Cron billing | `app/api/cron/generate-invoices/route.ts` | Auto-generate B2B invoices |

**Environment variables khusus payment:**

```bash
# Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false

# Xendit (fallback)
XENDIT_SECRET_API_KEY=xnd_development_xxxxx
XENDIT_CALLBACK_TOKEN=xnd_callback_xxxxx

# Refund notification
REFUND_NOTIFY_EMAIL=finance@elearning.example.com
```
# Learning Analytics Engine

> Modul analytics untuk platform edtech. Mencakup event tracking, dashboard guru/admin, video drop-off, retensi data, dan optimasi biaya.

---

## Event Tracking Schema

### Tabel Utama — `learning_events`

Event tracking adalah fondasi semua analytics. Setiap interaksi siswa (nonton video, jawab kuis, buka materi) menghasilkan satu baris di tabel ini.

**Pertimbangan desain:**
- **Partisi bulanan** — query `WHERE range` hanya scan partisi relevan, bukan seluruh tabel. Drop partisi lama juga O(1) tanpa `VACUUM`.
- **JSONB `properties`** — fleksibel untuk tiap event type tanpa perlu JOIN ke tabel metadata. Event-specific fields disimpan di sini, bukan sebagai kolom terpisah.
- **UUID `session_id`** — untuk menghitung session duration, bounce rate, dan user flow analysis.
- **`tenant_id`** — multi-tenant sejak awal. Jangan tambah belakangan (migrasi mahal).

```sql
-- Main events table, partitioned by month
CREATE TABLE learning_events (
  id UUID DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  -- Values: PageView, VideoPlay, VideoPause, VideoComplete, VideoSeek,
  -- QuizStart, QuizSubmit, CourseEnroll, CourseComplete,
  -- MaterialDownload, SearchQuery, AITutorQuery, Login, Logout
  resource_type VARCHAR(50),
  resource_id UUID,
  properties JSONB DEFAULT '{}',
  -- VideoPlay: {duration_seconds, playback_rate, quality}
  -- QuizSubmit: {score, time_spent_seconds, attempt_number}
  -- VideoSeek: {from_second, to_second}
  metadata JSONB DEFAULT '{}',  -- device, browser, OS, IP (hashed)
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
-- Jalankan otomatis via cron job atau pg_partman
CREATE TABLE learning_events_2026_07 PARTITION OF learning_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Indexes
CREATE INDEX idx_learning_events_user
  ON learning_events (tenant_id, user_id, created_at DESC);
CREATE INDEX idx_learning_events_resource
  ON learning_events (tenant_id, resource_type, resource_id);
CREATE INDEX idx_learning_events_type
  ON learning_events (event_type, created_at DESC);
CREATE INDEX idx_learning_events_properties
  ON learning_events USING GIN (properties);
```

### Partisi Otomatis dengan pg_partman (Opsional)

Untuk production, jangan manual buat partisi tiap bulan. Pakai pg_partman:

```sql
CREATE SCHEMA partman;
CREATE EXTENSION pg_partman WITH SCHEMA partman;

SELECT partman.create_parent(
  p_parent_table := 'public.learning_events',
  p_control := 'created_at',
  p_type := 'native',
  p_interval := '1 month',
  p_premake := 3
);

-- Schedule maintenance setiap jam
SELECT cron.schedule(
  'partman-maintenance',
  '0 * * * *',
  'SELECT partman.run_maintenance()'
);
```

---

## Event Tracking Function (TypeScript)

**Pola: batch + fire-and-forget.** Klien mengirim array event, server validasi, lalu insert batch. Jangan tunggu selesai insert — kembalikan 202 Accepted langsung.

```typescript
// src/lib/analytics/events.ts
import { z } from 'zod';
import { sql } from './db';
import { ratelimit } from './ratelimit';

// ─── Zod Schema ─────────────────────────────────────────
const EventTypes = [
  'PageView', 'VideoPlay', 'VideoPause', 'VideoComplete', 'VideoSeek',
  'QuizStart', 'QuizSubmit', 'CourseEnroll', 'CourseComplete',
  'MaterialDownload', 'SearchQuery', 'AITutorQuery', 'Login', 'Logout',
] as const;

const LearningEventSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().uuid(),
  eventType: z.enum(EventTypes),
  resourceType: z.string().max(50).optional().nullable(),
  resourceId: z.string().uuid().optional().nullable(),
  properties: z.record(z.unknown()).optional().default({}),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.string().datetime().optional(),
});

const BatchEventSchema = z.object({
  tenantId: z.string().uuid(),
  events: z.array(LearningEventSchema).min(1).max(100),
});

export type LearningEvent = z.infer<typeof LearningEventSchema>;
export type BatchEventPayload = z.infer<typeof BatchEventSchema>;

// ─── Batch Insert ────────────────────────────────────────
export async function ingestEvents(payload: BatchEventPayload): Promise<void> {
  // 1. Rate limit per user
  const userIds = [...new Set(payload.events.map((e) => e.userId))];
  await Promise.all(
    userIds.map((uid) => ratelimit.check(`analytics:${uid}`, 200, 60))
  );

  // 2. Batch insert dengan PostgreSQL multi-row
  const values = payload.events.map((event) => ({
    tenant_id: payload.tenantId,
    user_id: event.userId,
    session_id: event.sessionId,
    event_type: event.eventType,
    resource_type: event.resourceType ?? null,
    resource_id: event.resourceId ?? null,
    properties: JSON.stringify(event.properties ?? {}),
    metadata: JSON.stringify(event.metadata ?? {}),
    created_at: event.createdAt ?? new Date().toISOString(),
  }));

  // Batch insert 100 baris sekaligus
  for (let i = 0; i < values.length; i += 100) {
    const batch = values.slice(i, i + 100);
    await sql`
      INSERT INTO learning_events ${sql(batch, 'tenant_id', 'user_id', 'session_id',
        'event_type', 'resource_type', 'resource_id', 'properties', 'metadata', 'created_at')}
    `;
  }
}

// ─── API Route ───────────────────────────────────────────
// POST /api/analytics/events
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = BatchEventSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'Data event tidak valid', detail: parsed.error.issues },
        { status: 422 }
      );
    }

    // Fire-and-forget: jangan blok user
    ingestEvents(parsed.data).catch((err) =>
      console.error('[Analytics] Batch insert gagal:', err)
    );

    return Response.json({ accepted: true }, { status: 202 });
  } catch (err) {
    console.error('[Analytics] Payload error:', err);
    return Response.json({ error: 'Payload tidak valid' }, { status: 400 });
  }
}
```

### Client-side Tracking (Frontend)

```typescript
// src/lib/analytics/client.ts
type TrackEvent = {
  eventType: string;
  resourceType?: string;
  resourceId?: string;
  properties?: Record<string, unknown>;
};

class AnalyticsClient {
  private buffer: TrackEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string;
  private userId: string;

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.userId = '';
    // Flush setiap 10 detik atau 50 event
    this.flushTimer = setInterval(() => this.flush(), 10_000);
  }

  setUser(userId: string) {
    this.userId = userId;
  }

  track(event: TrackEvent) {
    this.buffer.push(event);
    if (this.buffer.length >= 50) {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0 || !this.userId) return;

    const batch = this.buffer.splice(0, this.buffer.length);
    const payload = {
      tenantId: getTenantId(), // dari context/environment
      events: batch.map((e) => ({
        userId: this.userId,
        sessionId: this.sessionId,
        eventType: e.eventType,
        resourceType: e.resourceType,
        resourceId: e.resourceId,
        properties: e.properties,
      })),
    };

    // POST dengan sendBeacon — survive page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/events', JSON.stringify(payload));
    } else {
      fetch('/api/analytics/events', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }
}

export const analytics = new AnalyticsClient();
```

---

## Dashboard Guru

Dashboard ini menampilkan data agregat per course/per materi. Guru bisa melihat performa kelasnya.

### 1. Course Completion Rate

```sql
-- Completion rate per course
SELECT
  c.id AS course_id,
  c.title,
  COUNT(DISTINCT ce.user_id) AS enrolled_students,
  COUNT(DISTINCT cc.user_id) AS completed_students,
  ROUND(
    COUNT(DISTINCT cc.user_id)::numeric /
    NULLIF(COUNT(DISTINCT ce.user_id), 0) * 100, 1
  ) AS completion_rate_pct
FROM courses c
LEFT JOIN course_enrollments ce ON ce.course_id = c.id
LEFT JOIN course_completions cc ON cc.course_id = c.id
WHERE c.tenant_id = $1
  AND c.is_published = true
GROUP BY c.id, c.title
ORDER BY completion_rate_pct ASC;
```

### 2. Average Score per Question (identifikasi soal sulit)

Ini lebih granular dari rata-rata per kuis. Guru bisa lihat soal mana yang banyak dijawab salah.

```typescript
// src/lib/analytics/question-analysis.ts
type QuestionAnalysis = {
  materiiId: string;
  questionId: string;
  questionText: string;
  totalAnswers: number;
  correctCount: number;
  correctPct: number;
  avgTimeSpentSeconds: number;
};

export async function getQuestionAnalysis(
  tenantId: string,
  materiId?: string
): Promise<QuestionAnalysis[]> {
  const result = await sql`
    SELECT
      q.materi_id,
      q.id AS question_id,
      q.question_text,
      COUNT(qa.id) AS total_answers,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) AS correct_count,
      ROUND(
        AVG(CASE WHEN qa.is_correct THEN 100 ELSE 0 END), 1
      ) AS correct_pct,
      ROUND(AVG(qa.time_spent_seconds)) AS avg_time_spent_seconds
    FROM question_answers qa
    JOIN questions q ON q.id = qa.question_id
    JOIN quizzes qz ON qz.id = qa.quiz_id
    WHERE qz.tenant_id = tenantId
      ${materiId ? sql`AND q.materi_id = ${materiId}` : sql``}
    GROUP BY q.materi_id, q.id, q.question_text
    ORDER BY correct_pct ASC
    LIMIT 50;
  `;

  return result as QuestionAnalysis[];
}
```

### 3. Video Drop-off Analysis

Menemukan di detik berapa siswa berhenti nonton. Ini penting untuk evaluasi kualitas video.

```sql
-- Video drop-off points
SELECT
  resource_id AS video_id,
  (properties->>'duration_seconds')::int AS video_duration,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY (properties->>'watch_seconds')::int
  ) AS median_watch_seconds,
  PERCENTILE_CONT(0.25) WITHIN GROUP (
    ORDER BY (properties->>'watch_seconds')::int
  ) AS p25_watch_seconds,
  COUNT(*) AS viewers,
  ROUND(
    PERCENTILE_CONT(0.5) WITHIN GROUP (
      ORDER BY (properties->>'watch_seconds')::int
    )::numeric / NULLIF(
      (properties->>'duration_seconds')::int, 0
    ) * 100, 1
  ) AS median_completion_pct
FROM learning_events
WHERE event_type IN ('VideoComplete', 'VideoPause')
  AND properties->>'watch_seconds' IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY resource_id, video_duration
ORDER BY median_completion_pct ASC;
```

### 4. Score Distribution Histogram

```sql
-- Score distribution (buckets of 10)
SELECT
  CONCAT(
    FLOOR(q.score / 10) * 10, '-', FLOOR(q.score / 10) * 10 + 9
  ) AS score_range,
  COUNT(*) AS student_count,
  ROUND(AVG(q.score), 1) AS avg_score
FROM (
  SELECT
    (properties->>'score')::int AS score
  FROM learning_events
  WHERE event_type = 'QuizSubmit'
    AND tenant_id = $1
    AND resource_id = $2
    AND created_at >= NOW() - INTERVAL '90 days'
) q
GROUP BY FLOOR(q.score / 10)
ORDER BY score_range;
```

### 5. At-risk Students Detection

Siswa dengan 3+ indikator risiko:

```typescript
// src/lib/analytics/at-risk.ts
type AtRiskStudent = {
  userId: string;
  studentName: string;
  lastLoginDays: number;
  avgScore: number;
  missingAssignments: number;
  riskIndicators: string[];
};

export async function getAtRiskStudents(
  tenantId: string,
  thresholdDays: number = 7
): Promise<AtRiskStudent[]> {
  const result = await sql`
    WITH last_logins AS (
      SELECT user_id, MAX(created_at) AS last_login
      FROM learning_events
      WHERE event_type = 'Login' AND tenant_id = ${tenantId}
      GROUP BY user_id
    ),
    student_scores AS (
      SELECT
        user_id,
        AVG((properties->>'score')::int) AS avg_score
      FROM learning_events
      WHERE event_type = 'QuizSubmit'
        AND tenant_id = ${tenantId}
      GROUP BY user_id
    ),
    missing_submissions AS (
      SELECT
        a.student_id,
        COUNT(*) AS missing_count
      FROM assignments a
      WHERE a.tenant_id = ${tenantId}
        AND a.due_date < NOW()
        AND a.submitted_at IS NULL
      GROUP BY a.student_id
    )
    SELECT
      u.id AS user_id,
      u.full_name AS student_name,
      EXTRACT(DAY FROM NOW() - ll.last_login)::int AS last_login_days,
      COALESCE(ss.avg_score, 0) AS avg_score,
      COALESCE(ms.missing_count, 0) AS missing_assignments
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'student'
    LEFT JOIN last_logins ll ON ll.user_id = u.id
    LEFT JOIN student_scores ss ON ss.user_id = u.id
    LEFT JOIN missing_submissions ms ON ms.student_id = u.id
    WHERE u.tenant_id = ${tenantId}
  `;

  return (result as any[]).map((row: any) => {
    const indicators: string[] = [];
    if (row.last_login_days > thresholdDays) {
      indicators.push('Tidak login > 7 hari');
    }
    if (row.avg_score < 60) {
      indicators.push('Rata-rata nilai < 60');
    }
    if (row.missing_assignments > 2) {
      indicators.push(`${row.missing_assignments} tugas belum dikumpulkan`);
    }

    return {
      ...row,
      riskIndicators: indicators,
    } satisfies AtRiskStudent;
  });
}
```

### Dashboard Guru — Komponen React

```typescript
// src/app/dashboard/guru/page.tsx
export default async function GuruDashboard({
  params: { tenantId },
}: {
  params: { tenantId: string };
}) {
  const [completionRates, questionAnalysis, videoDropoff, atRisk] =
    await Promise.all([
      getCompletionRates(tenantId),
      getQuestionAnalysis(tenantId),
      getVideoDropoff(tenantId),
      getAtRiskStudents(tenantId),
    ]);

  return (
    <div className="space-y-8">
      {/* Ringkasan */}
      <section>
        <h2>Ringkasan Kelas</h2>
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Rata-rata Completion"
            value={`${completionRates.overallRate}%`}
            trend={completionRates.trend}
          />
          <StatCard
            label="Siswa Aktif (30 hari)"
            value={completionRates.activeStudents}
          />
          <StatCard
            label="Video dengan Drop-off Tertinggi"
            value={videoDropoff[0]?.title ?? '-'}
          />
          <StatCard
            label="Siswa Berisiko"
            value={atRisk.length}
            variant={atRisk.length > 0 ? 'warning' : 'success'}
          />
        </div>
      </section>

      {/* Soal dengan tingkat benar rendah */}
      <section>
        <h2>Soal yang Sulit (Tingkat Benar Terendah)</h2>
        <QuestionTable data={questionAnalysis.slice(0, 10)} />
      </section>

      {/* Video drop-off */}
      <section>
        <h2>Analisis Video — Drop-off Point</h2>
        <VideoDropoffChart data={videoDropoff} />
      </section>

      {/* At-risk students */}
      {atRisk.length > 0 && (
        <section className="border-l-4 border-yellow-500 pl-4">
          <h2>Siswa Berisiko — Perlu Intervensi</h2>
          <AtRiskTable data={atRisk} />
        </section>
      )}
    </div>
  );
}
```

---

## Dashboard Admin

Untuk admin platform (bukan guru per course).

### MAU (Monthly Active Users)

```sql
-- MAU 12 bulan terakhir dengan month-over-month change
WITH monthly AS (
  SELECT
    date_trunc('month', created_at) AS month,
    tenant_id,
    COUNT(DISTINCT user_id) AS mau
  FROM learning_events
  WHERE event_type IN ('Login', 'PageView', 'QuizSubmit')
    AND created_at >= NOW() - INTERVAL '12 months'
  GROUP BY date_trunc('month', created_at), tenant_id
)
SELECT
  month,
  tenant_id,
  mau,
  LAG(mau) OVER (PARTITION BY tenant_id ORDER BY month) AS prev_month_mau,
  ROUND(
    (mau::numeric - LAG(mau) OVER (
      PARTITION BY tenant_id ORDER BY month
    )) / NULLIF(LAG(mau) OVER (
      PARTITION BY tenant_id ORDER BY month
    ), 0) * 100, 1
  ) AS mom_change_pct
FROM monthly
ORDER BY month DESC, tenant_id;
```

### Retention Cohort

```sql
-- Retention cohort: berapa % dari batch bulan M yang aktif di bulan N?
WITH cohort_base AS (
  SELECT
    user_id,
    tenant_id,
    date_trunc('month', MIN(created_at)) AS cohort_month
  FROM learning_events
  GROUP BY user_id, tenant_id
),
monthly_activity AS (
  SELECT DISTINCT
    le.user_id,
    le.tenant_id,
    date_trunc('month', le.created_at) AS active_month
  FROM learning_events le
  WHERE le.created_at >= '2026-01-01'
)
SELECT
  cb.cohort_month,
  ma.active_month,
  EXTRACT('month' FROM ma.active_month - cb.cohort_month) AS month_offset,
  COUNT(DISTINCT ma.user_id) AS active_users,
  ROUND(
    COUNT(DISTINCT ma.user_id)::numeric /
    NULLIF(
      FIRST_VALUE(COUNT(DISTINCT ma.user_id)) OVER (
        PARTITION BY cb.cohort_month ORDER BY ma.active_month
      ), 0
    ) * 100, 1
  ) AS retention_pct
FROM cohort_base cb
JOIN monthly_activity ma ON ma.user_id = cb.user_id
  AND ma.tenant_id = cb.tenant_id
GROUP BY cb.cohort_month, ma.active_month
ORDER BY cb.cohort_month DESC, ma.active_month;
```

### Revenue per Course

```typescript
// src/lib/analytics/revenue.ts
type CourseRevenue = {
  courseId: string;
  courseTitle: string;
  enrolledStudents: number;
  paidEnrollments: number;
  grossRevenue: number;
  platformFee: number;
  netRevenue: number;
};

export async function getCourseRevenue(
  tenantId: string,
  startDate: string,
  endDate: string
): Promise<CourseRevenue[]> {
  const result = await sql`
    SELECT
      c.id AS course_id,
      c.title AS course_title,
      COUNT(DISTINCT e.user_id) AS enrolled_students,
      COUNT(DISTINCT e.user_id) FILTER (
        WHERE e.payment_status = 'paid'
      ) AS paid_enrollments,
      COALESCE(SUM(p.amount) FILTER (
        WHERE p.status = 'completed'
      ), 0) AS gross_revenue,
      COALESCE(SUM(p.platform_fee) FILTER (
        WHERE p.status = 'completed'
      ), 0) AS platform_fee,
      COALESCE(SUM(p.amount - p.platform_fee) FILTER (
        WHERE p.status = 'completed'
      ), 0) AS net_revenue
    FROM courses c
    JOIN enrollments e ON e.course_id = c.id
    LEFT JOIN payments p ON p.enrollment_id = e.id
    WHERE c.tenant_id = ${tenantId}
      AND e.created_at BETWEEN ${startDate} AND ${endDate}
    GROUP BY c.id, c.title
    ORDER BY gross_revenue DESC
  `;

  return result as CourseRevenue[];
}
```

### Storage & Bandwidth per Tenant

```sql
-- Storage usage per tenant (dari tabel files)
SELECT
  tenant_id,
  COUNT(*) AS total_files,
  SUM(file_size_bytes) AS total_storage_bytes,
  SUM(file_size_bytes) / (1024^3) AS total_storage_gb,
  SUM(download_count) AS total_downloads,
  SUM(download_count * file_size_bytes) / (1024^3) AS bandwidth_used_gb
FROM files
WHERE is_deleted = false
GROUP BY tenant_id
ORDER BY total_storage_bytes DESC;
```

---

## Data Retention & Cleanup

### Kebijakan Retensi

| Data | Lama Simpan | Cara Hapus |
|------|-------------|------------|
| Raw events (learning_events) | 90 hari | Drop partisi |
| Agregat harian | 2 tahun | DELETE batch |
| Agregat bulanan | Permanen | Tidak dihapus |
| Data pribadi (nama, email di logs) | 1 tahun | Anonimisasi |

### Partisi Drop Otomatis

```sql
-- Buat fungsi untuk drop partisi (pg_cron butuh function, bukan DO block langsung)
CREATE OR REPLACE FUNCTION drop_old_analytics_partitions()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  partition_name TEXT;
BEGIN
  FOR partition_name IN
    SELECT inhrelid::regclass::text
    FROM pg_inherits
    WHERE inhparent = 'learning_events'::regclass
      AND (
        SELECT MAX(created_at)
        FROM learning_events
        WHERE created_at IS NOT NULL
          AND tableoid = inhrelid
      ) < NOW() - INTERVAL '90 days'
  LOOP
    EXECUTE format('DROP TABLE %I', partition_name);
  END LOOP;
END;
$$;

-- Jadwalkan via pg_cron setiap tengah malam
SELECT cron.schedule(
  'drop-old-analytics-partitions',
  '0 0 * * *',
  'CALL drop_old_analytics_partitions()'
);
```

### Anonimisasi Data Lama

```typescript
// src/lib/analytics/anonymize.ts
export async function anonymizeOldData(tenantId: string): Promise<number> {
  // Anonimisasi metadata yang mengandung data pribadi
  const result = await sql`
    UPDATE learning_events
    SET metadata = jsonb_set(
      metadata,
      '{ip_hash}',
      to_jsonb(encode(sha256(
        (metadata->>'ip_hash')::bytea
      ), 'hex'))
    )
    WHERE tenant_id = ${tenantId}
      AND created_at < NOW() - INTERVAL '1 year'
      AND metadata->>'ip_hash' IS NOT NULL
      AND metadata->>'anonymized' IS NULL
  `;

  return result.rowCount ?? 0;
}
```

---

## Cost Optimization for Analytics

### 1. Batch Events Sebelum Insert

Jangan insert satu-satu. Buffer di memory, flush batch setiap 10 detik atau 100 event.

```
❌ Satu request = satu INSERT           → ~1000 tps = overload DB
✅ Batch 100 event per INSERT            → 1000 tps = 10 INSERT/s
✅ Batch + upsert ke ClickHouse          → 100000 tps tanpa masalah
```

### 2. Archive Partisi Lama ke S3 Glacier

Untuk partisi > 90 hari, jangan hapus. Pindahkan ke cold storage:

```typescript
// src/lib/analytics/archive.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);
const s3 = new S3Client({ region: process.env.AWS_REGION });

type ArchiveResult = {
  partitionName: string;
  rowsArchived: number;
  storageClass: 'GLACIER';
  sha256Checksum: string;
};

export async function archivePartition(
  partitionName: string
): Promise<ArchiveResult> {
  // 1. Dump partisi ke file CSV (compressed)
  const dumpFile = `/tmp/${partitionName}.csv.gz`;
  await execAsync(
    `psql $DATABASE_URL -c "\\copy ${partitionName} TO '${dumpFile}' CSV HEADER" && gzip ${dumpFile}`
  );

  // 2. Hitung SHA256
  const { stdout: shaOutput } = await execAsync(
    `sha256sum ${dumpFile}.gz`
  );
  const sha256Checksum = shaOutput.split(' ')[0];

  // 3. Upload ke S3 Glacier
  const fileContent = await fs.readFile(`${dumpFile}.gz`);
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.ANALYTICS_ARCHIVE_BUCKET!,
      Key: `raw-events/${partitionName}.csv.gz`,
      Body: fileContent,
      StorageClass: 'GLACIER',
      ChecksumSHA256: sha256Checksum,
    })
  );

  // 4. Hitung rows
  const { stdout: rowCount } = await execAsync(
    `zcat ${dumpFile}.gz | wc -l`
  );

  // 5. Hapus file sementara
  await fs.unlink(`${dumpFile}.gz`);

  // 6. Hapus partisi dari DB
  await execAsync(`psql $DATABASE_URL -c "DROP TABLE IF EXISTS ${partitionName}"`);

  return {
    partitionName,
    rowsArchived: parseInt(rowCount.trim()) - 1, // minus header
    storageClass: 'GLACIER',
    sha256Checksum,
  };
}
```

### 3. Pilih ClickHouse untuk Skala Besar

| Metrik | PostgreSQL | ClickHouse |
|--------|-----------|------------|
| Insert throughput | ~10k rows/s | ~1M rows/s |
| Query latency (agregat 1M rows) | 2-5 detik | 50-200ms |
| Kompresi | ~60% | ~85% (columnar) |
| Partisi | Manual | Native |
| Biaya untuk analytics | Mahal (OLTP DB) | Hemat (kolumnar) |

**Kapan pindah ke ClickHouse:**
- Event > 10 juta/hari
- Query agregat mulai lambat (>5 detik)
- Biaya storage PostgreSQL membengkak

**Hybrid approach:**
```sql
-- PostgreSQL: data real-time (< 24 jam)
-- ClickHouse: data historical untuk analytics (via Kafka Connect)
-- Application: query PostgreSQL untuk "hari ini", ClickHouse untuk "trend"
```

---

# Database Migration & Seeding

> Panduan migrasi database untuk production edtech platform. Mencakup strategi ORM, zero-downtime, runner script, seed data, backup, dan checklist deploy.

---

## Strategi ORM — Kapan Pilih Apa?

| ORM | Berat | SQL-like? | Migrasi | Complex Query |
|-----|-------|-----------|---------|---------------|
| Drizzle ORM | Ringan (~300KB) | Ya (SQL-like syntax) | `drizzle-kit` | Native SQL |
| Prisma | Berat (~50MB) | Tidak (Prisma Schema) | `prisma migrate` | Prisma Client (raw fallback) |
| Raw SQL (node-postgres) | Minimal | Native SQL | Manual `.sql` files | Full control |

### Rekomendasi: Drizzle ORM

Alasan:
- **SQL-like syntax:** developer bisa tetap nulis SQL tanpa abstraksi yang bocor
- **Zero runtime cost:** generated query langsung ke driver, tanpa ORM layer tambahan
- **Migrasi file-based:** `drizzle-kit` generate `.sql` files yang bisa di-review (tidak seperti Prisma migration engine yang black-box)
- **Complex query tetap SQL:** untuk analytics query atau CTE, tinggal `sql\`...\`` — tidak perlu belajar DSL ORM
- **Ekosistem TypeScript:** type-safe dari query ke response

```typescript
// Drizzle schema example
import { pgTable, uuid, varchar, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

export const learningEvents = pgTable('learning_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull(),
  sessionId: uuid('session_id').notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: uuid('resource_id'),
  properties: jsonb('properties').default({}),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

### Kapan Pilih Prisma

- **Tim kecil, butuh cepat prototyping** — Prisma Studio untuk lihat data, auto-complete di semua query
- **Schema-relasi kompleks** — Prisma handle nested create/update dengan baik
- **Tapi:** untuk query analytics yang rumit, Prisma Client sering kurang fleksibel → harus fallback ke `$queryRaw`

### Kapan Pilih Raw SQL

- **Performance kritis** — tidak ada overhead ORM
- **Query sangat kompleks** — CTE, window functions, recursive queries
- **Migrasi manual controlled** — tim punya DBA yang review semua SQL

---

## Migration File Structure

```
migrations/
├── 0000_initial.sql                  -- Schema awal: users, courses, enrollments
├── 0001_add_course_settings.sql       -- Kolom baru di tabel courses
├── 0002_add_submission_index.sql      -- Index untuk query submission
├── 0003_add_partitioning.sql          -- Ubah learning_events ke partitioned table
├── 0004_add_quiz_attempts.sql         -- Tabel baru untuk tracking attempts
├── 0005_add_course_catalog.sql        -- Tabel categories, tags
├── 0006_add_payment_tables.sql        -- Payments, invoices, refunds
├── 0007_add_analytics_aggregates.sql  -- Materialized views untuk dashboard
└── 0008_add_search_index.sql          -- Full-text search index
```

### Format File Migrasi

```sql
-- migrations/0002_add_submission_index.sql
-- Deskripsi: Menambah index untuk mempercepat query submission per user
-- Author: Nama Developer
-- Date: 2026-07-15
-- PR: #142
-- Rollback: DROP INDEX IF EXISTS idx_submissions_user_course;

-- Migration
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_user_course
  ON submissions (user_id, course_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_status
  ON submissions (status)
  WHERE status = 'grading';  -- partial index, hanya untuk submission yang belum dinilai
```

---

## Zero-downtime Migration Principles

**Aturan emas:** satu deploy = satu migration. Jangan gabung schema change dengan code change.

### Yang TIDAK BOLEH Dilakukan

```sql
-- ❌ BERBAHAYA — DROP kolom di migration yang sama dengan deploy code
ALTER TABLE users DROP COLUMN old_username;

-- ❌ BERBAHAYA — RENAME kolom (code lama masih refer name_lama)
ALTER TABLE users RENAME COLUMN name TO full_name;

-- ❌ BERBAHAYA — ALTER COLUMN dengan NOT NULL tanpa default
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
-- Tabel production punya NULL → query SELECT * tiba-tiba error
```

### Yang HARUS Dilakukan (Expand-Contract Pattern)

**Fase 1: Expand (deploy 1)**
```sql
-- Tambah kolom baru, jangan hapus yang lama
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN display_name VARCHAR(100);
-- Code baru: baca full_name, tulis ke full_name + old_name
```

**Fase 2: Backfill (setelah deploy 1 stabil)**
```typescript
// Backfill script — jalan di background
async function backfillUserNames(tenantId: string) {
  const batchSize = 1000;
  let processed = 0;

  while (true) {
    const result = await sql`
      UPDATE users
      SET full_name = COALESCE(NULLIF(old_name, ''), email),
          display_name = COALESCE(NULLIF(display_name, ''), SPLIT_PART(email, '@', 1))
      WHERE tenant_id = ${tenantId}
        AND full_name IS NULL
      LIMIT ${batchSize}
      RETURNING id;
    `;

    if (result.rowCount === 0) break;
    processed += result.rowCount;
  }

  console.log(`Backfill selesai: ${processed} users`);
}
```

**Fase 3: Contract (deploy 2)**
```sql
-- Hanya setelah phase 2 selesai dan tidak ada code yang baca old_name
ALTER TABLE users DROP COLUMN old_name;
```

### Index CONCURRENTLY untuk Large Tables

```sql
-- ❌ Blocking: semua write ke tabel di-block sampai index selesai
CREATE INDEX idx_enrollments_user ON enrollments (user_id);

-- ✅ Non-blocking: write tetap jalan (tapi butuh lebih lama)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_user
  ON enrollments (user_id);
```

### Read Replicas Routing

```typescript
// src/lib/db.ts
import { neon } from '@neondatabase/serverless';

const primary = neon(process.env.DATABASE_URL_PRIMARY!);
const replica = neon(process.env.DATABASE_URL_REPLICA!);

export const db = {
  // Write query → primary
  execute: async (query: string, params?: any[]) => {
    return primary(query, params);
  },
  // Read query → replica (fallback ke primary kalau replica error)
  query: async (query: string, params?: any[]) => {
    try {
      return await replica(query, params);
    } catch {
      console.warn('[DB] Replica down, fallback ke primary');
      return primary(query, params);
    }
  },
};
```

---

## Migration Runner Script

```typescript
// src/lib/migrate/runner.ts
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { sql } from '../db';

type MigrationRecord = {
  version: string;
  name: string;
  appliedAt: string;
  durationMs: number;
  checksum: string;
  status: 'applied' | 'failed';
  error?: string;
};

class MigrationRunner {
  private migrationsDir: string;

  constructor(migrationsDir: string) {
    this.migrationsDir = migrationsDir;
  }

  async run(): Promise<void> {
    // 1. Pastikan tracking table ada
    await this.ensureMigrationTable();

    // 2. Baca semua file migrasi
    const files = readdirSync(this.migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort(); // urut berdasarkan nama file (0000, 0001, ...)

    // 3. Baca migrasi yang sudah dijalankan
    const applied = await this.getAppliedMigrations();

    for (const file of files) {
      const version = file.split('_')[0];

      // Skip yang sudah applied
      if (applied.has(version)) continue;

      const filePath = join(this.migrationsDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const checksum = this.hash(content);

      console.log(`[Migrate] Menjalankan ${file}...`);
      const start = Date.now();

      try {
        // 4. Jalankan dalam transaction
        await sql.transaction(async (tx) => {
          await tx.raw(content);

          // Catat sebagai applied
          await tx`
            INSERT INTO _migrations (version, name, checksum, duration_ms, status)
            VALUES (
              ${version},
              ${file},
              ${checksum},
              ${Date.now() - start},
              'applied'
            );
          `;
        });

        console.log(`[Migrate] ✅ ${file} selesai (${Date.now() - start}ms)`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : String(err);

        // Catat sebagai failed
        await sql`
          INSERT INTO _migrations (version, name, checksum, duration_ms, status, error)
          VALUES (
            ${version},
            ${file},
            ${checksum},
            ${Date.now() - start},
            'failed',
            ${errorMessage}
          );
        `;

        console.error(`[Migrate] ❌ ${file} gagal:`, errorMessage);

        // 5. Jangan auto-retry — lempar error, biarkan CI gagal
        throw new Error(
          `Migration ${file} gagal: ${errorMessage}. Perbaiki manual, jangan retry.`
        );
      }
    }

    console.log('[Migrate] Semua migrasi selesai.');
  }

  private async ensureMigrationTable(): Promise<void> {
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        version VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW(),
        duration_ms INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'applied',
        error TEXT
      );
    `;
  }

  private async getAppliedMigrations(): Promise<Set<string>> {
    const rows = await sql`
      SELECT version FROM _migrations
      WHERE status = 'applied'
      ORDER BY version ASC;
    `;
    return new Set(rows.map((r: any) => r.version));
  }

  private hash(content: string): string {
    // Gunakan crypto.createHash('sha256')
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
```

### CLI Script

```typescript
// scripts/migrate.ts
import { MigrationRunner } from '../src/lib/migrate/runner';

const runner = new MigrationRunner(join(__dirname, '../migrations'));

runner.run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

```json
// package.json scripts
{
  "migrate": "tsx scripts/migrate.ts",
  "migrate:dry": "tsx scripts/migrate.ts --dry-run",
  "migrate:create": "tsx scripts/create-migration.ts"
}
```

---

## Seed Data

### Filosofi Seed

| Environment | Seed Strategy | Volume |
|-------------|--------------|--------|
| Development | Demo data dengan skenario realistis | 1 tenant, 5 courses, 10 students |
| Staging | Skala realistis untuk performance testing | 3 tenant, 10 courses, 1000 students |
| Production | **TIDAK ADA SEED** | Kosong — data dari user nyata |

### Idempotent Seed Pattern

Semua seed harus bisa dijalankan ulang tanpa duplikasi:

```typescript
// scripts/seed/index.ts
import { sql } from '../../src/lib/db';

export async function seedDevelopment(): Promise<void> {
  console.log('[Seed] Memulai seed development...');

  // 1. Cek apakah sudah pernah dijalankan
  const existing = await sql`
    SELECT COUNT(*) as count FROM _seed_log
    WHERE seed_name = 'dev-seed' AND status = 'completed';
  `;

  if (existing[0].count > 0) {
    console.log('[Seed] Sudah pernah dijalankan. Skip.');
    return;
  }

  // 2. Seed dalam transaction
  await sql.transaction(async (tx) => {
    // Tenant
    const { rows: [tenant] } = await tx`
      INSERT INTO tenants (name, slug, settings)
      VALUES ('SMP Harapan Bangsa', 'smp-harapan-bangsa', '{
        "timezone": "Asia/Jakarta",
        "academic_year": "2026/2027",
        "grade_levels": [7, 8, 9]
      }')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id;
    `;

    if (!tenant) {
      console.log('[Seed] Tenant sudah ada. Skip.');
      return;
    }

    // Courses
    await tx`
      INSERT INTO courses (tenant_id, title, slug, description, is_published)
      VALUES
        (${tenant.id}, 'Akidah Akhlak Kelas 7', 'akidah-akhlak-7', 'Materi Akidah Akhlak untuk kelas 7 semester 1', true),
        (${tenant.id}, 'Al-Quran Hadits Kelas 7', 'alquran-hadits-7', 'Belajar membaca dan memahami Al-Quran', true),
        (${tenant.id}, 'Fikih Kelas 7', 'fikih-7', 'Dasar-dasar fikih ibadah', true),
        (${tenant.id}, 'Sejarah Kebudayaan Islam Kelas 7', 'ski-7', 'Sejarah peradaban Islam', false),
        (${tenant.id}, 'Bahasa Arab Kelas 7', 'bahasa-arab-7', 'Pengantar bahasa Arab', false)
      ON CONFLICT (tenant_id, slug) DO NOTHING;
    `;

    // Students (10 akun demo)
    const students = Array.from({ length: 10 }, (_, i) => ({
      email: `siswa${i + 1}@demo.sch.id`,
      fullName: `Siswa Demo ${i + 1}`,
      passwordHash: '$2b$10$...'  // password: "demo123456"
    }));

    for (const student of students) {
      await tx`
        INSERT INTO users (tenant_id, email, full_name, password_hash, role)
        VALUES (
          ${tenant.id}, ${student.email}, ${student.fullName},
          ${student.passwordHash}, 'student'
        )
        ON CONFLICT (tenant_id, email) DO NOTHING;
      `;
    }
  });

  // 3. Log
  await sql`
    INSERT INTO _seed_log (seed_name, status, run_at)
    VALUES ('dev-seed', 'completed', NOW());
  `;

  console.log('[Seed] ✅ Seed development selesai.');
}

export async function seedStaging(): Promise<void> {
  console.log('[Seed] Memulai seed staging (1000 students)...');

  // Generate 1000 students dengan distribusi kelas
  const existing = await sql`
    SELECT COUNT(*) as count FROM _seed_log
    WHERE seed_name = 'staging-seed' AND status = 'completed';
  `;

  if (existing[0].count > 0) {
    console.log('[Seed] Staging seed sudah pernah dijalankan.');
    return;
  }

  // Batch insert (jangan satu-satu)
  const students = Array.from({ length: 1000 }, (_, i) => ({
    tenantId: 'TENANT_UUID',
    email: `siswa.staging.${i}@demo.sch.id`,
    fullName: `Siswa Staging ${i}`,
    passwordHash: '$2b$10$...',
    gradeLevel: [7, 8, 9][Math.floor(Math.random() * 3)],
  }));

  await sql`
    INSERT INTO users (tenant_id, email, full_name, password_hash, grade_level)
    SELECT * FROM jsonb_to_recordset(${JSON.stringify(students)})
    AS x(
      tenant_id UUID, email VARCHAR, full_name VARCHAR,
      password_hash VARCHAR, grade_level INT
    )
    ON CONFLICT (tenant_id, email) DO NOTHING;
  `;

  await sql`
    INSERT INTO _seed_log (seed_name, status, run_at)
    VALUES ('staging-seed', 'completed', NOW());
  `;

  console.log('[Seed] ✅ 1000 students berhasil di-seed.');
}
```

---

## Database Setup Script (Local Development)

### Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: edtech
      POSTGRES_PASSWORD: edtech-dev
      POSTGRES_DB: edtech_dev
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/db/init-extensions.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U edtech']
      interval: 5s
      timeout: 3s

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s

  localstack:
    image: localstack/localstack:latest
    ports:
      - '4566:4566'
    environment:
      SERVICES: s3
      AWS_DEFAULT_REGION: ap-southeast-1
    volumes:
      - '/var/run/docker.sock:/var/run/docker.sock'

volumes:
  pgdata:
```

### init-extensions.sql

```sql
-- scripts/db/init-extensions.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_partman;     -- partition management
CREATE EXTENSION IF NOT EXISTS pg_stat_statements; -- query performance
```

### Makefile Target

```makefile
# Makefile
.PHONY: db-setup db-reset db-migrate db-seed db-restore db-backup

# ─── Setup Database ────────────────────────────────────────
db-setup:
	@echo "🚀 Memulai database services..."
	docker compose up -d postgres redis localstack
	@echo "⏳ Menunggu PostgreSQL siap..."
	@until docker compose exec -T postgres pg_isready -U edtech; do sleep 2; done
	@echo "✅ Database siap di localhost:5432"
	@echo "   URL: postgresql://edtech:edtech-dev@localhost:5432/edtech_dev"

# ─── Reset Database (⚠️ HAPUS SEMUA DATA) ──────────────────
db-reset:
	@echo "⚠️⚠️⚠️ PERINGATAN: Ini akan menghapus SEMUA data!"
	@echo "   3 detik... tekan Ctrl+C untuk batal"
	@sleep 3
	docker compose down -v
	docker compose up -d postgres redis localstack
	@echo "⏳ Menunggu PostgreSQL siap..."
	@until docker compose exec -T postgres pg_isready -U edtech; do sleep 2; done
	@echo "✅ Database di-reset. Menjalankan migrasi..."
	npm run migrate
	@echo "✅ Database siap digunakan."

# ─── Lainnya ────────────────────────────────────────────────
db-migrate:
	npm run migrate

db-seed:
	npm run seed

db-backup:
	@scripts/db/backup.sh

db-restore:
	@echo "⚠️ Restore akan meng-overwrite database yang sedang berjalan."
	@echo "   Gunakan: make db-restore FILE=path/to/backup.sql.gz"
	scripts/db/restore.sh $(FILE)
```

---

## Backup & Restore

### Automated Backup Script

```bash
#!/bin/bash
# scripts/db/backup.sh
# Backup harian database ke S3 dengan checksum

set -euo pipefail

DATABASE_URL="${DATABASE_URL:-postgresql://edtech:edtech-dev@localhost:5432/edtech_dev}"
BACKUP_BUCKET="${BACKUP_BUCKET:-edtech-db-backups}"
BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql.gz"
BACKUP_DIR="/tmp/db-backups"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$BACKUP_DIR"

echo "[Backup] Memulai pg_dump..."

# Dump + compress
pg_dump "$DATABASE_URL" \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/$BACKUP_FILE" \
  --verbose 2>&1 | tail -5

# Hitung SHA256
SHA256=$(sha256sum "$BACKUP_DIR/$BACKUP_FILE" | cut -d' ' -f1)
echo "[Backup] SHA256: $SHA256"

# Upload ke S3 dengan metadata
aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" \
  "s3://$BACKUP_BUCKET/$BACKUP_FILE" \
  --metadata "timestamp=$TIMESTAMP,sha256=$SHA256,type=pg_dump-custom"

# Buat file checksum
echo "$SHA256  $BACKUP_FILE" > "$BACKUP_DIR/$BACKUP_FILE.sha256"
aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.sha256" \
  "s3://$BACKUP_BUCKET/$BACKUP_FILE.sha256"

# Hapus backup lokal
rm "$BACKUP_DIR/$BACKUP_FILE" "$BACKUP_DIR/$BACKUP_FILE.sha256"

echo "[Backup] ✅ Selesai: $BACKUP_FILE ($SHA256)"

# Kirim notifikasi ke Slack
curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"✅ Database backup selesai: $BACKUP_FILE\",
    \"attachments\": [{
      \"fields\": [
        {\"title\": \"File\", \"value\": \"$BACKUP_FILE\", \"short\": true},
        {\"title\": \"SHA256\", \"value\": \"$SHA256\", \"short\": true},
        {\"title\": \"Size\", \"value\": \"$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)\", \"short\": true}
      ]
    }]
  }" || true
```

### Restore Script

```bash
#!/bin/bash
# scripts/db/restore.sh
# Restore database dari backup S3
# Usage: make db-restore FILE=backup-20260715-120000.sql.gz

set -euo pipefail

BACKUP_FILE="${1:?Error: FILE parameter wajib diisi. Contoh: make db-restore FILE=backup-20260715-120000.sql.gz}"
BACKUP_BUCKET="${BACKUP_BUCKET:-edtech-db-backups}"
DATABASE_URL="${DATABASE_URL:-postgresql://edtech:edtech-dev@localhost:5432/edtech_dev}"
BACKUP_DIR="/tmp/db-restore"

echo "⚠️⚠️⚠️ PERINGATAN: Restore akan meng-overwrite database!"
echo "  Database target: $DATABASE_URL"
echo "  File restore: $BACKUP_FILE"
echo ""
echo "  Tekan Ctrl+C dalam 5 detik untuk batal..."
sleep 5

mkdir -p "$BACKUP_DIR"

# 1. Verifikasi checksum
echo "[Restore] Verifikasi checksum..."
aws s3 cp "s3://$BACKUP_BUCKET/$BACKUP_FILE.sha256" "$BACKUP_DIR/"
EXPECTED_SHA=$(cat "$BACKUP_DIR/$BACKUP_FILE.sha256" | cut -d' ' -f1)
ACTUAL_SHA=$(aws s3 cp "s3://$BACKUP_BUCKET/$BACKUP_FILE" - | sha256sum | cut -d' ' -f1)

if [ "$EXPECTED_SHA" != "$ACTUAL_SHA" ]; then
  echo "❌ Checksum mismatch! Expected: $EXPECTED_SHA, Actual: $ACTUAL_SHA"
  echo "  Backup mungkin corrupt. HENTIKAN."
  exit 1
fi
echo "✅ Checksum valid."

# 2. Restore
echo "[Restore] Menjalankan pg_restore..."
aws s3 cp "s3://$BACKUP_BUCKET/$BACKUP_FILE" "$BACKUP_DIR/"

pg_restore \
  --dbname="$DATABASE_URL" \
  --jobs=4 \
  --verbose \
  "$BACKUP_DIR/$BACKUP_FILE" 2>&1 | tail -10

rm -rf "$BACKUP_DIR"

echo "✅ Restore selesai."
```

### Cron Job (Backup Otomatis)

```cron
# /etc/cron.d/edtech-db-backup
# Backup harian jam 03:00 WIB
0 3 * * * edtech /usr/bin/flock -n /tmp/db-backup.lock /opt/edtech/scripts/db/backup.sh >> /var/log/edtech/db-backup.log 2>&1

# Test restore otomatis setiap tanggal 1 (restore ke database test terpisah)
0 4 1 * * edtech /opt/edtech/scripts/db/test-restore.sh >> /var/log/edtech/db-restore-test.log 2>&1
```

---

## Migration Checklist untuk Deploy

Checklist ini WAJIB dilalui SEBELUM migration dijalankan di production. Centang semua — kalau ada yang tidak terpenuhi, tunda deploy.

### Pra-deploy

```
□ Migration sudah di-review oleh developer kedua
  └ Reviewer sudah membaca SQL dan memastikan tidak ada DROP COLUMN / RENAME tanpa expand-contract
□ Migration backward-compatible
  └ Code lama masih bisa jalan dengan schema baru
  └ Cek: tidak ada DROP COLUMN, RENAME COLUMN, ALTER COLUMN SET NOT NULL (tanpa default)
□ CREATE INDEX CONCURRENTLY untuk tabel > 100k rows
  └ Index biasa di tabel besar akan block writes
□ Migration sudah di-test terhadap copy data production
  └ Restore backup production ke staging → jalankan migration → cek tidak ada error
□ Rollback SQL sudah disiapkan
  └ File migration balik (misal 0002_rollback.sql) sudah ada di repo
  └ Rollback sudah di-test di copy production

### Saat Deploy

□ Migration adalah SATU-SATUNYA perubahan schema di deploy ini
  └ JANGAN gabung migration dengan perubahan kode yang refer kolom baru
  └ Deploy migration dulu → deploy code setelahnya
□ Monitor query performance setelah migration
  └ pg_stat_statements: cek apakah ada query yang jadi lambat
□ Backup production sebelum migration
  └ pg_dump dijalankan dan diupload ke S3
  └ Backup diverifikasi (checksum cocok)

### Post-deploy

□ Backfill data untuk kolom baru sudah dijadwalkan
  └ Jalankan batch script untuk isi data historis
  └ Monitor progress via log
□ Old columns / deprecated objects dihapus (Fase 3 Contract)
  └ Hanya setelah semua code tidak lagi refer kolom lama
  └ Minimal 1 minggu setelah deploy code yang stop baca kolom lama
```

### Template Rollback SQL

Setiap migration WAJIB punya rollback:

```sql
-- migrations/0002_rollback.sql
-- Rollback untuk 0002_add_submission_index.sql

DROP INDEX IF EXISTS idx_submissions_user_course;
DROP INDEX IF EXISTS idx_submissions_status;
```

### Script Verify Migration

```typescript
// scripts/verify-migration.ts
// Jalankan setelah migration untuk memastikan semuanya ok

import { sql } from '../src/lib/db';

async function verifyMigration(): Promise<void> {
  const checks: { name: string; passed: boolean; detail?: string }[] = [];

  // 1. Cek semua index ada
  const indexes = await sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename IN ('learning_events', 'users', 'courses', 'enrollments')
      AND indexname NOT LIKE '%pkey%';
  `;

  const expectedIndexes = [
    'idx_learning_events_user',
    'idx_learning_events_resource',
    'idx_learning_events_type',
  ];

  for (const idx of expectedIndexes) {
    checks.push({
      name: `Index ${idx}`,
      passed: indexes.some((i: any) => i.indexname === idx),
    });
  }

  // 2. Cek partition
  const partitions = await sql`
    SELECT inhrelid::regclass::text AS partition_name
    FROM pg_inherits
    WHERE inhparent = 'learning_events'::regclass;
  `;

  checks.push({
    name: 'Partisi learning_events',
    passed: partitions.length >= 1,
    detail: `${partitions.length} partisi ditemukan`,
  });

  // 3. Cek migration table
  const migrationTable = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = '_migrations'
    ) AS exists;
  `;

  checks.push({
    name: 'Tabel _migrations',
    passed: migrationTable[0].exists,
  });

  // 4. Validasi foreign keys
  const fkViolations = await sql`
    SELECT COUNT(*) AS count
    FROM learning_events le
    LEFT JOIN users u ON u.id = le.user_id
    WHERE u.id IS NULL
    LIMIT 10;
  `;

  checks.push({
    name: 'Foreign key integrity (learning_events -> users)',
    passed: fkViolations[0].count === 0,
    detail: fkViolations[0].count > 0
      ? `${fkViolations[0].count} orphan records`
      : 'Semua valid',
  });

  // Report
  const passed = checks.filter((c) => c.passed).length;
  const failed = checks.filter((c) => !c.passed).length;

  console.log(`\n=== Verifikasi Migration: ${passed} passed, ${failed} failed ===\n`);

  for (const check of checks) {
    const icon = check.passed ? '✅' : '❌';
    console.log(`  ${icon} ${check.name}${check.detail ? ': ' + check.detail : ''}`);
  }

  if (failed > 0) {
    console.error('\n⚠️ Ada kegagalan verifikasi. Jangan lanjutkan deploy.');
    process.exit(1);
  }

  console.log('\n✅ Semua verifikasi lulus.');
}

verifyMigration().catch((err) => {
  console.error('[Verify] Error:', err);
  process.exit(1);
});
```
## ERROR MONITORING — Sentry Production Setup

### Sentry SDK Initialization

Setiap edtech platform Next.js WAJIB mengintegrasikan Sentry untuk error tracking production. Inisialisasi dilakukan di file `sentry.client.config.ts` dan `sentry.server.config.ts`:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  tracesSampleRate: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 0.1 : 1.0,

  // PENTING: Filter data sensitif siswa — jangan bocor ke Sentry
  beforeSend(event, hint) {
    // Hapus PII dari error context
    if (event.user) {
      event.user = {
        id: event.user.id, // Hanya simpan ID, hapus email/nama
      }
    }

    // Hapus request body yang mungkin berisi data sensitif
    if (event.request?.data) {
      delete event.request.data
    }

    // Hapus cookie dari headers
    if (event.request?.headers) {
      const headers = event.request.headers as Record<string, string>
      if (headers['cookie']) headers['cookie'] = '[REDACTED]'
      if (headers['authorization']) headers['authorization'] = '[REDACTED]'
      if (headers['x-api-key']) headers['x-api-key'] = '[REDACTED]'
    }

    return event
  },

  // Jangan kirim error dari lokal development
  enabled: process.env.NODE_ENV !== 'development',
})
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  tracesSampleRate: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 0.1 : 1.0,

  // Server-side: hapus SQL queries dan DB credentials dari log
  beforeSend(event) {
    if (event.exception?.values) {
      for (const value of event.exception.values) {
        if (value.stacktrace?.frames) {
          for (const frame of value.stacktrace.frames) {
            // Hapus query params dari stack trace
            if (frame.vars) {
              const vars = frame.vars as Record<string, unknown>
              if (vars.query) vars.query = '[REDACTED]'
              if (vars.sql) vars.sql = '[REDACTED]'
              if (vars.password) vars.password = '[REDACTED]'
              if (vars.token) vars.token = '[REDACTED]'
            }
          }
        }
      }
    }
    return event
  },

  enabled: process.env.NODE_ENV !== 'development',
})
```

### Next.js Configuration — Source Maps Upload

```typescript
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ... existing config
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true, // Jangan spam console saat build
  hideSourceMaps: true, // Hapus source map dari production bundle
  widenClientFileUpload: true,
  reactComponentAnnotation: { enabled: true },
  tunnelRoute: '/monitoring', // Bypass ad-blocker
})
```

### PII Scrubbing — WHY It's Critical After Canvas Breach

Pada Juni 2026, ShinyHunters mencuri **275 juta record** dari Canvas LMS (Instructure). Data yang bocor: nama siswa, email, institusi, enrollment details, assignment scores, dan SIS IDs. Pelajaran untuk setiap platform edtech:

**Aturan besi — Sentry beforeSend filter WAJIB men-strip:**
| Tipe Data | Contoh | Action |
|-----------|--------|--------|
| Email siswa | `aji@sekolah.sch.id` | Hapus dari `event.user.email` |
| Nama lengkap | `Aji Pratama` | Hapus dari semua field |
| Nomor telepon | `0812-3456-7890` | Regex detect + redact |
| IP Address | `192.168.1.1` | Hapus `event.request?.headers?.['x-forwarded-for']` |
| Request body | `{ nama: "...", alamat: "..." }` | `delete event.request.data` |
| Auth token | `Bearer eyJhbGci...` | Hapus dari headers |
| SQL query | `SELECT * FROM users WHERE...` | Hapus dari stack trace vars |
| NISN/NIK | `1234567890` | Regex detect + redact |

**Audit bulanan:** Search Sentry org untuk PII patterns:
```bash
# Cari apakah ada email yang lolos filter
# Dari Discover di Sentry → Query: message:*@*.*
# Atau via API:
curl -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/organizations/$ORG/events/?query=message:*%40*.*"
```

Jangan tunggu breach — filter dari hari pertama.

### Custom Error Tracking

Buat error classes spesifik untuk domain edtech agar mudah difilter dan di-alert:

```typescript
// lib/errors.ts
export class QuizSubmissionError extends Error {
  constructor(
    message: string,
    public studentId: string,
    public quizId: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'QuizSubmissionError'
  }
}

export class PaymentWebhookError extends Error {
  constructor(
    message: string,
    public paymentId: string,
    public gateway: 'midtrans' | 'xendit' | 'manual',
    public cause?: Error
  ) {
    super(message)
    this.name = 'PaymentWebhookError'
  }
}

export class AdaptiveEngineError extends Error {
  constructor(
    message: string,
    public studentId: string,
    public courseId: string,
    public engineVersion: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'AdaptiveEngineError'
  }
}

export class TenantIsolationViolation extends Error {
  constructor(
    message: string,
    public tenantA: string,
    public tenantB: string,
    public resourceType: string,
    public resourceId: string
  ) {
    super(message)
    this.name = 'TenantIsolationViolation'
  }
}
```

**Capture di kode:**
```typescript
// app/api/quiz/submit/route.ts
try {
  const result = await submitQuiz(parsed.data)
  return NextResponse.json(result)
} catch (e) {
  Sentry.captureException(new QuizSubmissionError(
    'Gagal submit quiz untuk siswa',
    parsed.data.studentId,
    parsed.data.quizId,
    e instanceof Error ? e : undefined
  ))
  return NextResponse.json(
    { error: 'Gagal menyimpan jawaban' },
    { status: 500 }
  )
}
```

### Performance Monitoring

Konfigurasi performance monitoring untuk melacak bottleneck:

```typescript
// sentry.client.config.ts — tambahan
Sentry.init({
  // ...existing config

  // Track slow interactions
  beforeSendTransaction(event) {
    // Kasih tag khusus untuk slow endpoints
    if (event.transaction && 'op' in event) {
      const op = (event as any).op
      if (op === 'http.server') {
        const duration = event.endTimestamp - event.startTimestamp
        if (duration > 1) {
          event.tags = { ...event.tags, slow: 'true' }
        }
      }
    }
    return event
  },
})
```

**Performance budgets yang harus di-monitor:**
| Endpoint | Budget | Action jika exceeded |
|----------|--------|---------------------|
| Quiz submission | < 500ms | Optimasi query + cache |
| Course listing | < 200ms | Implementasi ISR / caching |
| Dashboard load | < 1s | Lazy load widgets |
| Video streaming start | < 3s | CDN + preconnect |
| AI recommendation | < 2s | Queue + worker |

**Deteksi N+1 queries:**
```typescript
// lib/db.ts — wrap prisma dengan monitoring
import { PrismaClient } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
  ],
})

// Track repeated queries
const queryCount = new Map<string, number>()

prisma.$on('query' as any, (e: any) => {
  const key = e.query.substring(0, 100) // Normalize
  const count = (queryCount.get(key) || 0) + 1
  queryCount.set(key, count)

  if (count > 3) {
    Sentry.captureMessage(`Potential N+1 query detected`, {
      level: 'warning',
      tags: { queryPattern: key, queryCount: String(count) },
    })
  }
})

// Reset counter per request
export function resetQueryCounter() {
  queryCount.clear()
}
```

### Sentry Alert Rules

| Priority | Rule | Action | Response Time |
|----------|------|--------|---------------|
| **P1** | `TenantIsolationViolation` detected | Slack + Telegram + PagerDuty | < 15 menit |
| **P1** | Error rate > 5% on any production endpoint | Slack + PagerDuty | < 15 menit |
| **P2** | Error rate > 1% on any endpoint | Slack notification | < 1 jam |
| **P2** | Quiz submission failure > 5/hour | Slack notification | < 1 jam |
| **P3** | Any endpoint p95 > 3s | Slack notification | < 4 jam |
| **P3** | Payment webhook error > 2/hour | Slack notification | < 30 menit |
| **P4** | New error type not seen in 7 days | Daily digest email | Next day |

**Setup di Sentry Dashboard:**
```typescript
// Menggunakan Sentry API untuk create alert rule (opsional)
const alertRule = {
  type: 'error',
  environment: 'production',
  threshold: 1,
  thresholdType: 'count',
  timeWindow: 60,
  filters: [
    { key: 'error.type', value: 'TenantIsolationViolation' }
  ],
  actions: [
    { type: 'slack', target: '#alerts-edtech' },
    { type: 'pagerduty', severity: 'critical' },
  ]
}
```

### Sentry Integration with Vercel

```typescript
// vercel.json — tambahan field
{
  "build": {
    "env": {
      "SENTRY_AUTH_TOKEN": "@sentry-auth-token",
      "SENTRY_ORG": "@sentry-org",
      "SENTRY_PROJECT": "@sentry-project"
    }
  }
}
```

**Fitur yang otomatis jalan:**
- **Source maps upload:** Setiap deploy Vercel → Sentry upload source maps → error stack trace readable
- **Release tracking:** `SENTRY_RELEASE` otomatis di-set ke git SHA oleh `@sentry/nextjs`
- **Deployment tracking:** Sentry nge-link error ke deploy yang introduce bug

**Verifikasi source maps terupload:**
```bash
# Cek di Sentry Dashboard → Releases → [release] → Files
# Harus ada file .map untuk setiap chunk JavaScript

# Atau via API:
curl -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/projects/$ORG/$PROJECT/releases/$RELEASE/files/"
```

### Self-Hosted Sentry Alternative

Untuk platform edtech dengan data sensitif atau klien pemerintah, self-hosted Sentry memberikan kontrol penuh atas data:

```yaml
# docker-compose.sentry.yml
version: '3.8'

services:
  sentry:
    image: getsentry/sentry:latest
    ports:
      - "9000:9000"
    environment:
      SENTRY_REDIS_HOST: redis
      SENTRY_POSTGRES_HOST: postgres
      SENTRY_SECRET_KEY: ${SENTRY_SECRET_KEY}
      SENTRY_SINGLE_ORGANIZATION: "true"
    volumes:
      - sentry-data:/var/lib/sentry/files
    depends_on:
      - redis
      - postgres

  cron:
    image: getsentry/sentry:latest
    command: "sentry run cron"
    environment:
      SENTRY_REDIS_HOST: redis
      SENTRY_POSTGRES_HOST: postgres
      SENTRY_SECRET_KEY: ${SENTRY_SECRET_KEY}

  worker:
    image: getsentry/sentry:latest
    command: "sentry run worker"
    environment:
      SENTRY_REDIS_HOST: redis
      SENTRY_POSTGRES_HOST: postgres
      SENTRY_SECRET_KEY: ${SENTRY_SECRET_KEY}

  postgres:
    image: postgres:16
    volumes:
      - sentry-pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: sentry
      POSTGRES_USER: sentry
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - sentry-redis:/data
```

**Kapan self-host:**
- Data siswa tidak boleh keluar dari Indonesia (UU Perlindungan Data Pribadi)
- Klien pemerintah dengan NDAs ketat
- Lebih dari 10.000 error events/bulan (Sentry SaaS mulai mahal)
- Butuh retensi data > 90 hari

**Cost comparison (per month):**
| Tipe | Events | Biaya | Infra | Total |
|------|--------|-------|-------|-------|
| Sentry SaaS (Team) | 50k | $29 | $0 | $29 |
| Sentry SaaS (Business) | 100k | $149 | $0 | $149 |
| Self-hosted (VPS 4GB) | Unlimited | $0 | ~$20-50 | $20-50 |
| Self-hosted (Dedicated) | Unlimited | $0 | ~$100 | $100 |

Untuk MVP/early-stage: pakai Sentry SaaS dulu. Migrasi ke self-hosted setelah user > 10.000 atau ada klien institusi.

### Environment Variables Checklist

```
# .env.local / Vercel Environment Variables
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=edtech-org-name
SENTRY_PROJECT=edtech-platform
SENTRY_AUTH_TOKEN=sntrys_xxx
```

### Testing Sentry Integration

```typescript
// app/api/test-error/route.ts — endpoint sementara untuk verifikasi
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  // Test 1: Basic error capture
  Sentry.captureMessage('Test: Health check from production', {
    level: 'info',
    tags: { test: 'sentry-integration' },
  })

  // Test 2: Error with PII (harus ter-redact)
  try {
    throw new Error('Test PII scrubbing')
  } catch (e) {
    Sentry.captureException(e, {
      user: { id: 'test-user-123', email: 'siswa@sekolah.sch.id' },
      extra: { ip: '192.168.1.1', token: 'test-token-xyz' },
    })
  }

  // Test 3: Performance trace
  const transaction = Sentry.startTransaction({
    op: 'test',
    name: 'Integration Test Transaction',
  })

  await new Promise(r => setTimeout(r, 100))
  transaction.finish()

  return NextResponse.json({
    status: 'ok',
    message: 'Cek Sentry dashboard untuk event test',
    docs: 'https://sentry.io/organizations/edtech-org-name/projects/edtech-platform/',
  })
}
```

---

## ACCESSIBILITY TESTING — axe-core CI Integration

### Why axe-core Matters for Edtech

**Regulasi yang mengikat platform edtech:**
- **Indonesia:** UU No. 8/2016 tentang Penyandang Disabilitas Pasal 18 — penyedia layanan publik (termasuk platform pendidikan) WAJIB menyediakan aksesibilitas. Sanksi administratif hingga pencabutan izin.
- **AS:** ADA Title III + Section 508 — puluhan gugatan terhadap edtech setiap tahun. Rata-rata settlement: $25.000-100.000.
- **EU:** European Accessibility Act (EAA) — berlaku penuh Juni 2025, mencakup semua e-learning.
- **WCAG 2.1 AA** sekarang baseline minimum untuk kontrak pemerintah dan institusi pendidikan di sebagian besar negara.

**Konsekuensi hukum nyata:**
- 2024: Edtech platform kena gugatan class-action $2.3M karena screen reader tidak bisa akses quiz
- 2025: Universitas AS kena denda OCR karena LMS mereka tidak accessible untuk mahasiswa tunanetra
- Jangan menunggu gugatan — aksesibilitas adalah fitur, bukan compliance checkbox

### axe-core Integration with Playwright

```typescript
// tests/e2e/accessibility/quiz-page.test.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility — Quiz Pages', () => {
  test('quiz page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/quiz/sample-quiz-1')

    // Tunggu quiz fully loaded — pastikan dynamic content sudah render
    await page.waitForSelector('[role="radiogroup"]')
    await page.waitForSelector('button[type="submit"]')

    const results = await new AxeBuilder({ page })
      // Include hanya aturan WCAG 2.1 AA
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Exclude third-party widgets yang tidak bisa kita kontrol
      .exclude('#video-player-wrapper iframe') // YouTube embed
      .exclude('#disqus-comments') // Third-party comments
      .analyze()

    // Fail build jika ada critical atau serious violations
    const violations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(violations).toEqual([])

    // Log minor violations untuk improvement, bukan blocker
    if (results.violations.filter(v => v.impact === 'minor').length > 0) {
      console.warn('Minor accessibility violations found:',
        results.violations.filter(v => v.impact === 'minor').map(v => v.id)
      )
    }
  })

  test('quiz results page accessible after submission', async ({ page }) => {
    // Setup: login + submit quiz
    await page.goto('/login')
    await page.fill('[name="email"]', 'test-student@test.com')
    await page.fill('[name="password"]', 'test-password-123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    await page.goto('/quiz/sample-quiz-1')
    // Jawab semua soal
    const options = await page.locator('[role="radio"]').all()
    for (let i = 0; i < options.length; i++) {
      await options[i].click()
    }
    await page.click('button[type="submit"]')
    await page.waitForURL('/quiz/sample-quiz-1/results')

    // Test accessibility setelah submit
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )).toEqual([])
  })

  test('course listing page accessible with no violations', async ({ page }) => {
    await page.goto('/courses')

    // Scroll untuk trigger lazy loading
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500))
      await page.waitForTimeout(500)
    }

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Filter violations — exclude known third-party iframes
    const violations = results.violations.filter(
      v => !v.nodes.some(n =>
        n.target.some(t => String(t).includes('third-party-widget'))
      )
    )

    expect(violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )).toEqual([])
  })
})
```

### CI Integration — GitHub Actions

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on:
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 6 * * 1' # Setiap Senin pagi

jobs:
  axe-core:
    name: axe-core Accessibility Audit
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: edtech_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/edtech_test

      - name: Seed test data
        run: npx prisma db seed

      - name: Run accessibility E2E tests
        run: npx playwright test tests/e2e/accessibility/
        env:
          BASE_URL: http://localhost:3000
          DATABASE_URL: postgresql://test:test@localhost:5432/edtech_test
          NEXT_PUBLIC_SENTRY_DSN: ''
          SENTRY_ENABLED: 'false'

      - name: Generate HTML accessibility report
        if: always()
        run: |
          mkdir -p accessibility-report
          node scripts/generate-accessibility-report.js

      - name: Upload accessibility report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-report-${{ github.sha }}
          path: accessibility-report/
          retention-days: 30
```

### Key Accessibility Violations to Catch

| Violation | WCAG Ref | Impact | How to Fix |
|-----------|----------|--------|------------|
| Missing alt text | SC 1.1.1 | Critical | Tambah `alt` di semua `<img>` |
| Insufficient contrast | SC 1.4.3 | Serious | Cek ratio >= 4.5:1 untuk normal text |
| Missing form label | SC 3.3.2 | Critical | Setiap `<input>` wajib punya `<label>` |
| Keyboard trap | SC 2.1.2 | Serious | Pastikan focus bisa pindah via Tab/Shift+Tab |
| Missing ARIA on dynamic content | SC 4.1.2 | Serious | Tambah `aria-live="polite"` untuk updates |
| Landmark not labeled | SC 1.3.6 | Moderate | Setiap section punya `aria-label` unik |
| List not semantic | SC 1.3.1 | Moderate | Pakai `<ul>`/`<ol>` bukan `<div>` untuk list |

**Gunakan CSS custom properties untuk memastikan contrast ratio aman:**
```css
/* styles/tokens.css */
:root {
  /* Primary — pastikan contrast ratio >= 4.5:1 dengan background putih #FFFFFF */
  --color-primary: #005231;       /* pass: 7.8:1 ✅ */
  --color-primary-light: #1b6b45; /* pass: 5.9:1 ✅ */
  --color-primary-muted: #4a8a6a; /* FAIL: 3.1:1 ❌ — jangan untuk text */

  /* Text colors */
  --color-text-primary: #141d1b;  /* pass: 15.2:1 ✅ */
  --color-text-secondary: #5a6b65; /* pass: 5.1:1 ✅ — OK untuk body */
  --color-text-disabled: #a0b0a8; /* FAIL: 2.8:1 ❌ — hanya untuk disabled */
}
```

### Automated Check in Development

**ESLint plugin — `eslint-plugin-jsx-a11y`:**
```javascript
// eslint.config.mjs
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  {
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.configs.recommended.rules,

      // Sesuai standar WCAG 2.1 AA
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/label-has-associated-control': ['error', { assert: 'htmlFor' }],
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/aria-role': ['error', { allowedInvalid: ['text'] }],
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/anchor-is-valid': ['error', { components: ['Link'], specialLink: ['hrefLeft', 'hrefRight'], aspects: ['invalidHref', 'preferButton'] }],
    },
  },
]
```

**Pre-commit hook — lint-staged:**
```javascript
// package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --rule 'jsx-a11y/alt-text: error' --rule 'jsx-a11y/label-has-associated-control: error'",
      "bash -c 'npm run typecheck'"
    ],
    "*.css": [
      "stylelint --config .stylelintrc.json"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  }
}
```

**VS Code:**
- Extension: **axe Accessibility Linter** (Deque Systems)
- Settings: `"accessibilityLinter.enable": true`
- Settings: `"accessibilityLinter.severity": "warning"`

### Accessibility Regression Prevention

**1. PR Checklist Template tambahkan:**
```markdown
### Aksesibilitas Checklist (WAJIB centang semua)

- [ ] ✅ Semua `<img>` punya `alt` text descriptif
- [ ] ✅ Color contrast ratios dicek via axe DevTools
- [ ] ✅ Form inputs punya `<label>` terkait
- [ ] ✅ Keyboard navigation: bisa tab-through semua interactive elements
- [ ] ✅ Dynamic content punya `aria-live` region
- [ ] ✅ Tidak ada `tabindex > 0` (kecuali disengaja)
- [ ] ✅ Screen reader test: NVDA/VoiceOver membaca konten dengan benar
```

**2. Design tokens — minimum contrast tokens:**
```typescript
// tokens/color.ts
export const colors = {
  // Text colors dengan kontras terverifikasi
  text: {
    primary: '#141d1b',    // ratio 15.2:1 ✅
    body: '#2d3734',       // ratio 11.8:1 ✅
    secondary: '#5a6b65',  // ratio 5.1:1 ✅
    disabled: '#a0b0a8',   // Hanya untuk disabled state
    link: '#005231',       // ratio 7.8:1 ✅
  },
  surface: {
    primary: '#ffffff',    // background
    secondary: '#f2fcf7',  // subtle background
    elevated: '#e8f5ee',   // card hover
  },
} as const

/**
 * Verifikasi warna baru:
 * 1. Buka https://webaim.org/resources/contrastchecker/
 * 2. Masukkan foreground + background
 * 3. Pastikan >= 4.5:1 untuk normal text
 * 4. Pastikan >= 3:1 untuk large text (>18px bold / >24px regular)
 */
```

**3. Monthly screen reader test — checklist:**
- [ ] NVDA (Windows): navigasi seluruh halaman dengan `Arrow Down`
- [ ] VoiceOver (Mac): form filling dengan `Ctrl+Option+Arrow`
- [ ] Focus ring terlihat jelas di semua interactive elements
- [ ] Error messages terbaca oleh screen reader
- [ ] Quiz timer announcement via `aria-live="assertive"`

### Accessibility Report Generation

```typescript
// scripts/generate-accessibility-report.ts
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

interface AxeViolation {
  id: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  help: string
  description: string
  nodes: Array<{ target: string[] }>
  helpUrl: string
}

interface AxeResult {
  violations: AxeViolation[]
  passes: Array<{ id: string }>
  url: string
}

function generateAccessibilityReport(results: AxeResult[]): string {
  const allViolations = results.flatMap(r => r.violations)

  const summary = {
    totalViolations: allViolations.length,
    critical: allViolations.filter(v => v.impact === 'critical').length,
    serious: allViolations.filter(v => v.impact === 'serious').length,
    moderate: allViolations.filter(v => v.impact === 'moderate').length,
    minor: allViolations.filter(v => v.impact === 'minor').length,
    pagesTested: results.length,
    pagesFailed: results.filter(r =>
      r.violations.some(v => v.impact === 'critical' || v.impact === 'serious')
    ).length,
  }

  const criticalViolations = allViolations.filter(
    v => v.impact === 'critical' || v.impact === 'serious'
  )

  return `# Aksesibilitas Audit Report
**Tanggal:** ${new Date().toISOString().split('T')[0]}
**Tool:** axe-core @playwright
**WCAG Level:** 2.1 AA

---

## Ringkasan

| Metrik | Nilai | Status |
|--------|-------|--------|
| Halaman dites | ${summary.pagesTested} | — |
| Halaman gagal | ${summary.pagesFailed} | ${summary.pagesFailed > 0 ? '❌ PERLU DIPERBAIKI' : '✅ SEMUA LOLOS'} |
| Total violations | ${summary.totalViolations} | — |
| Critical | ${summary.critical} | ${summary.critical > 0 ? '❌ FAIL' : '✅ PASS'} |
| Serious | ${summary.serious} | ${summary.serious > 0 ? '❌ FAIL' : '✅ PASS'} |
| Moderate | ${summary.moderate} | ⚠️ INFO |
| Minor | ${summary.minor} | ⚠️ INFO |

---

## Detail Violations (Critical + Serious)

${criticalViolations.length === 0
  ? 'Tidak ada critical atau serious violations. ✅'
  : criticalViolations.map(v => `
### ${v.id}

| Field | Detail |
|-------|--------|
| **Impact** | ${v.impact} |
| **Help** | ${v.help} |
| **Element** | \`${v.nodes[0]?.target?.join(', ') || 'N/A'}\` |
| **Description** | ${v.description} |
| **Reference** | [${v.helpUrl}](${v.helpUrl}) |

`).join('\n')}

---

## Daftar Halaman Dites

${results.map(r => {
  const violations = r.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious'
  )
  return `- ${r.url} — ${violations.length > 0 ? `❌ ${violations.length} violation(s)` : '✅ OK'}`
}).join('\n')}

---

## Rekomendasi Prioritas

${summary.critical > 0
  ? '1. 🔴 Perbaiki **critical** violations segera — ini blocker untuk screen reader users\n' +
    '2. 🟡 Perbaiki **serious** violations di sprint berikutnya\n' +
    '3. 🟢 Evaluasi moderate/minor violations untuk perbaikan bertahap'
  : summary.serious > 0
  ? '1. 🟡 Perbaiki **serious** violations di sprint ini\n' +
    '2. 🟢 Evaluasi moderate/minor violations'
  : '✅ Platform sudah memenuhi standar WCAG 2.1 AA untuk critical/serious criteria.'
}

---

*Generated by axe-core CI pipeline · ${new Date().toISOString()}*
`
}

// Main
async function main() {
  const resultsDir = resolve(process.cwd(), 'test-results', 'accessibility')
  const files = readdirSync(resultsDir).filter(f => f.endsWith('.json'))

  const results: AxeResult[] = files.map(f =>
    JSON.parse(readFileSync(resolve(resultsDir, f), 'utf-8'))
  )

  const report = generateAccessibilityReport(results)

  mkdirSync(resolve(process.cwd(), 'accessibility-report'), { recursive: true })
  writeFileSync(resolve(process.cwd(), 'accessibility-report', 'report.md'), report)
  console.log(`Report generated: accessibility-report/report.md`)
  console.log(`Summary: ${results.length} pages, ${results.filter(r =>
    r.violations.some(v => v.impact === 'critical' || v.impact === 'serious')
  ).length} failed`)
}

main().catch(console.error)
```

### Accessibility Budget — Metric Enforcement

```typescript
// tests/e2e/accessibility/accessibility-budget.test.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Budget', () => {
  // Budget: max 1 critical violation per page
  test('homepage meets accessibility budget', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical'
    )
    expect(criticalViolations.length).toBeLessThanOrEqual(1)
  })

  // Budget: max 3 serious violations per page
  test('course listing meets accessibility budget', async ({ page }) => {
    await page.goto('/courses')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const seriousViolations = results.violations.filter(
      v => v.impact === 'serious'
    )
    expect(seriousViolations.length).toBeLessThanOrEqual(3)
  })

  // Budget: total violations per page < 10
  test('all critical paths have minimal violations', async ({ page }) => {
    const criticalPaths = ['/', '/courses', '/quiz/demo', '/login']

    for (const path of criticalPaths) {
      await page.goto(path)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const totalViolations = results.violations.length
      expect(
        totalViolations,
        `${path} has ${totalViolations} violations (budget: < 10)`
      ).toBeLessThan(10)
    }
  })
})
```

---

## Notification System

Sistem notifikasi pada platform e-learning harus mendukung multi-channel (email, in-app, push) agar pengguna tidak melewatkan informasi penting seperti tenggat tugas, pengumuman nilai, atau perubahan jadwal.

### Email Provider Setup — Resend SDK

```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string  // default: noreply@akalcenter.my.id
  replyTo?: string
}

export async function sendEmail(params: EmailParams): Promise<{ id: string }> {
  return resend.emails.send({
    from: params.from || 'AKAL Center <noreply@akalcenter.my.id>',
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
  })
}
```

### Email Templates

Setiap template adalah fungsi murni yang menerima parameter ter-tipe dan mengembalikan string HTML. Desain responsif dengan inline CSS (kompatibel Gmail/Outlook).

```typescript
// lib/email-templates.ts

interface WelcomeEmailParams {
  name: string
  dashboardUrl: string
  courseCount: number
}

export function welcomeEmail(params: WelcomeEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:'Inter',sans-serif;background:#f2fcf7;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:32px;overflow:hidden;box-shadow:0 4px 24px rgba(0,82,49,0.08);">
        <tr><td style="padding:48px 40px 32px;">
          <div style="text-align:center;margin-bottom:32px;">
            <img src="https://akalcenter.my.id/logo.svg" width="64" height="64" alt="AKAL Center" style="border-radius:16px;">
          </div>
          <h1 style="font-family:'Bricolage Grotesque',serif;font-size:24px;color:#005231;margin:0 0 8px;">Selamat Datang di AKAL Center!</h1>
          <p style="font-size:16px;color:#141d1b;margin:0 0 24px;line-height:1.6;">
            Halo <strong>${params.name}</strong>, akun kamu sudah aktif. Kamu bisa mengakses <strong>${params.courseCount}</strong> materi pembelajaran berbasis Deep Learning — Mindful, Meaningful, dan Joyful Learning.
          </p>
          <a href="${params.dashboardUrl}" style="display:inline-block;background:#005231;color:#fff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:40px;text-decoration:none;">Mulai Belajar</a>
        </td></tr>
        <tr><td style="padding:0 40px 32px;font-size:12px;color:#6b7280;text-align:center;">
          Butuh bantuan? Balas email ini atau hubungi kami di WhatsApp
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface EnrollmentConfirmationParams {
  name: string
  courseTitle: string
  courseUrl: string
  startDate: string
  kelas: string
}

export function enrollmentConfirmationEmail(params: EnrollmentConfirmationParams): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Inter',sans-serif;background:#f2fcf7;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:32px;overflow:hidden;">
        <tr><td style="padding:48px 40px 32px;">
          <h1 style="font-family:'Bricolage Grotesque',serif;font-size:22px;color:#005231;margin:0 0 16px;">Pendaftaran Terkonfirmasi ✅</h1>
          <p style="font-size:16px;color:#141d1b;line-height:1.6;">Halo <strong>${params.name}</strong>,</p>
          <p style="font-size:16px;color:#141d1b;line-height:1.6;">
            Kamu berhasil mendaftar di:<br>
            <strong style="font-size:18px;">${params.courseTitle}</strong>
          </p>
          <table width="100%" cellpadding="12" style="background:#f2fcf7;border-radius:16px;margin:24px 0;">
            <tr><td style="font-size:14px;color:#6b7280;">Kelas</td><td style="font-size:14px;color:#141d1b;">${params.kelas}</td></tr>
            <tr><td style="font-size:14px;color:#6b7280;">Mulai</td><td style="font-size:14px;color:#141d1b;">${params.startDate}</td></tr>
          </table>
          <a href="${params.courseUrl}" style="display:inline-block;background:#005231;color:#fff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:40px;text-decoration:none;">Lihat Materi</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface QuizResultParams {
  name: string
  courseTitle: string
  score: number
  total: number
  percentage: number
  passed: boolean
  passingGrade: number
  detailUrl: string
  incorrectAnswers: Array<{
    question: string
    yourAnswer: string
    correctAnswer: string
  }>
}

export function quizResultEmail(params: QuizResultParams): string {
  const gradeColor = params.passed ? '#005231' : '#dc2626'
  const gradeBg = params.passed ? '#f0fdf4' : '#fef2f2'
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Inter',sans-serif;background:#f2fcf7;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:32px;overflow:hidden;">
        <tr><td style="padding:48px 40px 32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">${params.passed ? '🎉' : '📚'}</div>
          <h1 style="font-family:'Bricolage Grotesque',serif;font-size:24px;color:#141d1b;margin:0 0 8px;">Hasil Kuis: ${params.courseTitle}</h1>
          <p style="font-size:16px;color:#6b7280;margin:0 0 24px;">${params.name}</p>
          <div style="display:inline-block;background:${gradeBg};color:${gradeColor};font-size:48px;font-weight:700;padding:24px 48px;border-radius:24px;margin-bottom:24px;">
            ${params.score}/${params.total}
            <span style="display:block;font-size:16px;font-weight:400;">${params.percentage}%</span>
          </div>
          <p style="font-size:16px;color:#141d1b;">
            ${params.passed
              ? `Selamat! Kamu lulus (batas lulus: ${params.passingGrade}%).`
              : `Belum lulus (batas lulus: ${params.passingGrade}%). Ayo coba lagi!`}
          </p>
          ${params.incorrectAnswers.length > 0 ? `
          <table width="100%" cellpadding="12" style="margin-top:24px;text-align:left;">
            <tr><td style="font-size:14px;font-weight:600;color:#141d1b;border-bottom:1px solid #e5e7eb;">Jawaban Perlu Dipelajari Ulang</td></tr>
            ${params.incorrectAnswers.slice(0, 5).map((item, i) => `
            <tr><td style="font-size:14px;border-bottom:1px solid #f3f4f6;">
              <p style="margin:4px 0;color:#141d1b;"><strong>${i + 1}. ${item.question}</strong></p>
              <p style="margin:4px 0;color:#dc2626;">Jawabanmu: ${item.yourAnswer}</p>
              <p style="margin:4px 0;color:#005231;">Kunci: ${item.correctAnswer}</p>
            </td></tr>`).join('')}
          </table>` : ''}
          <a href="${params.detailUrl}" style="display:inline-block;background:#005231;color:#fff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:40px;text-decoration:none;margin-top:24px;">Lihat Detail</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface DeadlineReminderParams {
  name: string
  assignmentTitle: string
  courseTitle: string
  deadline: string
  remainingHours: number
  submissionUrl: string
}

export function deadlineReminderEmail(params: DeadlineReminderParams): string {
  const urgencyColor = params.remainingHours <= 6 ? '#dc2626' : params.remainingHours <= 24 ? '#f59e0b' : '#005231'
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Inter',sans-serif;background:#f2fcf7;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:32px;overflow:hidden;">
        <tr><td style="padding:48px 40px 32px;">
          <h1 style="font-family:'Bricolage Grotesque',serif;font-size:22px;color:${urgencyColor};margin:0 0 16px;">⏰ Tenggat Sudah Dekat!</h1>
          <p style="font-size:16px;color:#141d1b;line-height:1.6;">Halo <strong>${params.name}</strong>,</p>
          <p style="font-size:16px;color:#141d1b;line-height:1.6;">
            Tugas <strong>${params.assignmentTitle}</strong> untuk mata pelajaran <strong>${params.courseTitle}</strong> akan jatuh tempo dalam <strong style="color:${urgencyColor};">${params.remainingHours} jam</strong>.
          </p>
          <table width="100%" cellpadding="12" style="background:#f2fcf7;border-radius:16px;margin:24px 0;">
            <tr><td style="font-size:14px;color:#6b7280;">Tenggat</td><td style="font-size:14px;color:#141d1b;font-weight:600;">${params.deadline}</td></tr>
          </table>
          <a href="${params.submissionUrl}" style="display:inline-block;background:${urgencyColor};color:#fff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:40px;text-decoration:none;">Kumpulkan Sekarang</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface CertificateParams {
  name: string
  courseTitle: string
  grade: string
  completionDate: string
  certificateUrl: string
  certificateId: string
}

export function certificateEmail(params: CertificateParams): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Inter',sans-serif;background:#f2fcf7;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#005231,#1b6b45);border-radius:32px;overflow:hidden;">
        <tr><td style="padding:48px 40px;text-align:center;">
          <div style="font-size:56px;margin-bottom:16px;">🏆</div>
          <h1 style="font-family:'Bricolage Grotesque',serif;font-size:28px;color:#fff;margin:0 0 8px;">Selamat!</h1>
          <p style="font-size:18px;color:#eec055;margin:0 0 32px;font-weight:600;">Sertifikat telah diterbitkan</p>
          <div style="background:rgba(255,255,255,0.1);border-radius:24px;padding:32px;margin-bottom:32px;">
            <p style="font-size:16px;color:#fff;margin:0 0 8px;">Telah menyelesaikan</p>
            <p style="font-size:22px;color:#eec055;font-weight:700;margin:0 0 16px;">${params.courseTitle}</p>
            <p style="font-size:14px;color:rgba(255,255,255,0.7);margin:0;">Nilai: ${params.grade} | ${params.completionDate}</p>
            <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:8px 0 0;">ID Sertifikat: ${params.certificateId}</p>
          </div>
          <a href="${params.certificateUrl}" style="display:inline-block;background:#eec055;color:#005231;font-size:16px;font-weight:700;padding:14px 32px;border-radius:40px;text-decoration:none;">Unduh Sertifikat</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface PasswordResetParams {
  name: string
  resetUrl: string
  expiresInMinutes: number
}

export function passwordResetEmail(params: PasswordResetParams): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Inter',sans-serif;background:#f2fcf7;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:32px;overflow:hidden;">
        <tr><td style="padding:48px 40px 32px;">
          <h1 style="font-family:'Bricolage Grotesque',serif;font-size:22px;color:#141d1b;margin:0 0 16px;">Reset Password</h1>
          <p style="font-size:16px;color:#141d1b;line-height:1.6;">Halo <strong>${params.name}</strong>,</p>
          <p style="font-size:16px;color:#141d1b;line-height:1.6;">
            Kami menerima permintaan reset password untuk akun kamu. Klik tombol di bawah untuk membuat password baru. Link ini berlaku <strong>${params.expiresInMinutes} menit</strong>.
          </p>
          <a href="${params.resetUrl}" style="display:inline-block;background:#005231;color:#fff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:40px;text-decoration:none;margin:24px 0;">Reset Password</a>
          <p style="font-size:14px;color:#6b7280;">Jika kamu tidak meminta reset password, abaikan email ini.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface AccountSuspendedParams {
  name: string
  reason: string
  appealUrl: string
  supportEmail: string
}

export function accountSuspendedEmail(params: AccountSuspendedParams): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Inter',sans-serif;background:#f2fcf7;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:32px;overflow:hidden;border:1px solid #fecaca;">
        <tr><td style="padding:48px 40px 32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
          <h1 style="font-family:'Bricolage Grotesque',serif;font-size:22px;color:#dc2626;margin:0 0 16px;">Akun Ditangguhkan Sementara</h1>
          <p style="font-size:16px;color:#141d1b;line-height:1.6;">Halo <strong>${params.name}</strong>,</p>
          <p style="font-size:16px;color:#141d1b;line-height:1.6;">
            Akun kamu ditangguhkan karena: <strong>${params.reason}</strong>
          </p>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;">
            Jika kamu merasa ini kesalahan, kamu bisa mengajukan banding atau hubungi kami di <a href="mailto:${params.supportEmail}" style="color:#005231;">${params.supportEmail}</a>.
          </p>
          <a href="${params.appealUrl}" style="display:inline-block;background:#dc2626;color:#fff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:40px;text-decoration:none;margin-top:16px;">Ajukan Banding</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
```

### Email Queue — BullMQ

Antrian email dibutuhkan agar API response tidak terblokir oleh proses kirim email. Implementasi menggunakan BullMQ dengan Redis sebagai backend.

```typescript
// lib/email-queue.ts
import { Queue, Worker, Job } from 'bullmq'
import { sendEmail } from './email'

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
}

export const emailQueue = new Queue('email', { connection })

interface EmailJobData {
  type: 'welcome' | 'enrollment' | 'quiz-result' | 'deadline' | 'certificate' | 'password-reset' | 'account-suspended'
  to: string | string[]
  params: Record<string, unknown>
  html: string
  subject: string
  trackingId?: string
}

export async function enqueueEmail(data: EmailJobData): Promise<string | undefined> {
  const job = await emailQueue.add('send-email', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: 1000,
    removeOnFail: 100,
  })
  return job.id
}

// Worker — proses email di latar belakang
export function startEmailWorker(): Worker {
  const worker = new Worker<EmailJobData>(
    'email',
    async (job: Job<EmailJobData>) => {
      const { to, html, subject, from, replyTo } = job.data
      
      try {
        const result = await sendEmail({ to, subject, html, from, replyTo })
        job.updateProgress(100)
        return result
      } catch (error) {
        // Kirim ke dead letter queue jika sudah 3x gagal
        if (job.attemptsMade >= 3) {
          await deadLetterQueue.add('dead-letter', job.data, {
            jobId: `dlq-${job.id}`,
          })
        }
        throw error
      }
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10, // max 10 email per detik (Resend rate limit)
        duration: 1000,
      },
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[EMAIL-WORKER] Job ${job?.id} gagal:`, err.message)
  })

  worker.on('completed', (job) => {
    console.log(`[EMAIL-WORKER] Job ${job.id} selesai`)
  })

  return worker
}

// Dead Letter Queue — email yang gagal setelah 3 retries
export const deadLetterQueue = new Queue('email-dlq', { connection })

// 1x1 tracking pixel — deteksi open rate
export function trackingPixel(trackingId: string): string {
  return `<img src="https://akalcenter.my.id/api/email/open?t=${trackingId}" width="1" height="1" alt="" style="display:none;">`
}
```

```typescript
// app/api/email/open/route.ts
import { NextRequest, NextResponse } from 'next/server'

// 1x1 transparent GIF (base64)
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(req: NextRequest) {
  const trackingId = req.nextUrl.searchParams.get('t')

  if (trackingId) {
    // Catat open event — bisa dikirim ke database atau analytics
    console.log(`[EMAIL-TRACKING] Opened: ${trackingId}`)

    // Async log tanpa blocking response
    queueMicrotask(async () => {
      try {
        await fetch('https://akalcenter.my.id/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'email_opened',
            properties: { trackingId },
          }),
        })
      } catch {
        // silent — tracking tidak boleh mengganggu user
      }
    })
  }

  return new NextResponse(PIXEL_GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
}
```

### In-App Notification Center

Pusat notifikasi di dalam aplikasi menampilkan semua notifikasi yang dikirim ke user, bisa di-filter berdasarkan tipe dan status baca.

```typescript
// lib/notifications.ts
import { db } from './db'

export interface AppNotification {
  id: string
  userId: string
  type: 'deadline' | 'grade' | 'feedback' | 'announcement' | 'system'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

type NotificationChannel = 'email' | 'in-app' | 'push'

interface UserPreferences {
  email: boolean
  inApp: boolean
  push: boolean
}

// Default preferences — semua channel aktif
const DEFAULT_PREFERENCES: UserPreferences = {
  email: true,
  inApp: true,
  push: false,
}

export async function sendNotification(
  userId: string,
  notification: Omit<AppNotification, 'id' | 'userId' | 'read' | 'createdAt'>,
  preferences?: Partial<UserPreferences>
): Promise<void> {
  const userPrefs = { ...DEFAULT_PREFERENCES, ...preferences }
  const channels = (Object.keys(userPrefs) as NotificationChannel[]).filter(
    (ch) => userPrefs[ch]
  )

  // Simpan notifikasi di database
  const [saved] = await db.query<AppNotification>(
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, created_at`,
    [userId, notification.type, notification.title, notification.message, notification.link]
  )

  // Kirim sesuai channel yang diaktifkan
  const promises: Promise<unknown>[] = []

  if (channels.includes('email')) {
    promises.push(
      enqueueEmail({
        type: notification.type as EmailJobData['type'],
        to: userId,
        subject: notification.title,
        html: buildEmailHtml(notification),
        params: notification,
      })
    )
  }

  if (channels.includes('push')) {
    promises.push(
      sendPushNotification(userId, {
        title: notification.title,
        body: notification.message,
        link: notification.link,
      })
    )
  }

  await Promise.allSettled(promises)
}

function buildEmailHtml(notification: Omit<AppNotification, 'id' | 'userId' | 'read' | 'createdAt'>): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:'Inter',sans-serif;padding:24px;">
  <h2 style="color:#005231;">${notification.title}</h2>
  <p style="color:#141d1b;line-height:1.6;">${notification.message}</p>
  ${notification.link ? `<a href="${notification.link}" style="display:inline-block;background:#005231;color:#fff;padding:12px 24px;border-radius:40px;text-decoration:none;margin-top:16px;">Lihat Detail</a>` : ''}
</body>
</html>`
}

// Push notification placeholder — implementasi tergantung FCM/APNs
async function sendPushNotification(
  _userId: string,
  _payload: { title: string; body: string; link?: string }
): Promise<void> {
  // Integrasi Firebase Cloud Messaging atau Web Push API
  // await webPush.sendNotification(subscription, JSON.stringify(payload))
  console.log('[PUSH] Sending push notification:', _payload.title)
}
```

```typescript
// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  unreadCount: number
}

// GET /api/notifications — ambil notifikasi user (ter-paginate)
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))
  const type = searchParams.get('type') as AppNotification['type'] | null
  const unreadOnly = searchParams.get('unread') === 'true'
  const offset = (page - 1) * limit

  let whereClause = 'WHERE user_id = $1'
  const params: unknown[] = [userId]
  let paramIndex = 2

  if (type) {
    whereClause += ` AND type = $${paramIndex++}`
    params.push(type)
  }

  if (unreadOnly) {
    whereClause += ' AND read = false'
  }

  const [notifications, countResult, unreadResult] = await Promise.all([
    db.query<AppNotification>(
      `SELECT id, type, title, message, link, read, created_at
       FROM notifications ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    ),
    db.query<{ total: number }>(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      params
    ),
    db.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    ),
  ])

  const total = Number(countResult.rows[0]?.total) || 0
  const unreadCount = Number(unreadResult.rows[0]?.count) || 0

  const response: PaginatedResponse<AppNotification> = {
    data: notifications.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    unreadCount,
  }

  return NextResponse.json(response)
}

// POST /api/notifications/read-all — tandai semua sebagai sudah dibaca
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const url = req.nextUrl.pathname

  // POST /api/notifications/{id}/read
  if (url.endsWith('/read')) {
    const id = url.split('/')[3]
    await db.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    return NextResponse.json({ success: true })
  }

  // POST /api/notifications/read-all
  if (url.endsWith('/read-all')) {
    await db.query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId]
    )
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
```

### Notification Channel Router

Router memastikan notifikasi dikirim ke channel yang sesuai dengan preferensi user. Setiap user bisa memilih channel mana yang aktif untuk tiap tipe notifikasi.

```typescript
// lib/notification-router.ts
import { db } from './db'
import { sendNotification } from './notifications'

type NotificationType = 'deadline' | 'grade' | 'feedback' | 'announcement' | 'system'

interface ChannelConfig {
  email: boolean
  inApp: boolean
  push: boolean
}

// Default routing per tipe notifikasi
const DEFAULT_ROUTING: Record<NotificationType, ChannelConfig> = {
  deadline:   { email: true,  inApp: true,  push: true  },
  grade:      { email: true,  inApp: true,  push: false },
  feedback:   { email: false, inApp: true,  push: false },
  announcement: { email: true,  inApp: true,  push: false },
  system:     { email: false, inApp: true,  push: false },
}

export async function routeNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  // Ambil preferensi user dari database (fallback ke default)
  const prefs = await db.query<{ email: boolean; in_app: boolean; push: boolean }>(
    `SELECT COALESCE(preferences->'notifications'->>'email', 'true')::boolean as email,
            COALESCE(preferences->'notifications'->>'inApp', 'true')::boolean as in_app,
            COALESCE(preferences->'notifications'->>'push', 'false')::boolean as push
     FROM user_settings WHERE user_id = $1`,
    [userId]
  )

  const userPrefs: ChannelConfig = prefs.rows[0]
    ? { email: prefs.rows[0].email, inApp: prefs.rows[0].in_app, push: prefs.rows[0].push }
    : DEFAULT_ROUTING[type]

  // Gabungkan default routing dengan preferensi user — channel yang mati di default
  // tidak bisa diaktifkan user (misal feedback via email tetap tidak dikirim)
  const activeChannels: ChannelConfig = {
    email: DEFAULT_ROUTING[type].email && userPrefs.email,
    inApp: DEFAULT_ROUTING[type].inApp && userPrefs.inApp,
    push: DEFAULT_ROUTING[type].push && userPrefs.push,
  }

  await sendNotification(
    userId,
    { type, title, message, link, createdAt: new Date().toISOString() },
    activeChannels
  )
}

// Helper — kirim notifikasi ke semua user dalam satu kelas
export async function broadcastToClass(
  kelas: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  const users = await db.query<{ id: string }>(
    'SELECT id FROM users WHERE kelas = $1',
    [kelas]
  )

  await Promise.allSettled(
    users.rows.map((u) => routeNotification(u.id, type, title, message, link))
  )
}
```

## Rate Limiting Implementation

Rate limiting melindungi API dari penyalahgunaan (brute force, DDoS, spam) dengan membatasi jumlah request dalam jangka waktu tertentu. Implementasi dua tahap: in-memory untuk development/starter, Redis untuk production.

### In-Memory Rate Limiter (Starter)

Cocok untuk deployment awal tanpa Redis. Data disimpan di memory Map dengan interval pembersihan otomatis.

```typescript
// lib/rate-limit-memory.ts

interface RateLimitEntry {
  timestamps: number[]
  blockedUntil: number | null
}

interface RateLimitConfig {
  windowMs: number    // jendela waktu dalam ms
  max: number         // max request dalam windowMs
}

interface CheckResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter: number
}

export class MemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private readonly cleanupInterval: NodeJS.Timeout

  private readonly limits: Record<string, RateLimitConfig> = {
    default: { windowMs: 60_000, max: 100 },
    auth:    { windowMs: 60_000, max: 5 },
    quiz:    { windowMs: 60_000, max: 20 },
    video:   { windowMs: 60_000, max: 999_999 },  // unlimited
    search:  { windowMs: 60_000, max: 20 },
  }

  constructor() {
    // Bersihkan entry yang sudah expired setiap 60 detik
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000)
  }

  private getConfig(endpoint: string): RateLimitConfig {
    for (const [prefix, config] of Object.entries(this.limits)) {
      if (endpoint.startsWith(`/api/${prefix}`) || prefix === 'default') {
        return config
      }
    }
    return this.limits.default
  }

  async check(
    key: string,
    endpoint: string
  ): Promise<CheckResult> {
    const now = Date.now()
    const config = this.getConfig(endpoint)
    let entry = this.store.get(key)

    // Jika sedang diblokir, cek apakah masa blokir sudah habis
    if (entry?.blockedUntil) {
      if (now < entry.blockedUntil) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: entry.blockedUntil,
          retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
        }
      }
      // Masa blokir habis — reset
      entry.blockedUntil = null
      entry.timestamps = []
    }

    // Inisialisasi entry baru
    if (!entry) {
      entry = { timestamps: [], blockedUntil: null }
      this.store.set(key, entry)
    }

    // Hapus timestamp di luar window
    const windowStart = now - config.windowMs
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

    // Cek limit
    if (entry.timestamps.length >= config.max) {
      const oldestTimestamp = entry.timestamps[0]
      const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000)

      // Block 60 detik jika melebihi 2x limit
      if (entry.timestamps.length >= config.max * 2) {
        entry.blockedUntil = now + 60_000
      }

      return {
        allowed: false,
        remaining: 0,
        resetAt: oldestTimestamp + config.windowMs,
        retryAfter,
      }
    }

    // Catat request
    entry.timestamps.push(now)

    return {
      allowed: true,
      remaining: config.max - entry.timestamps.length,
      resetAt: now + config.windowMs,
      retryAfter: 0,
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.timestamps.length === 0 && !entry.blockedUntil) {
        this.store.delete(key)
        continue
      }

      entry.timestamps = entry.timestamps.filter((t) => t > now - 60_000)

      if (entry.blockedUntil && now > entry.blockedUntil) {
        entry.blockedUntil = null
      }

      if (entry.timestamps.length === 0 && !entry.blockedUntil) {
        this.store.delete(key)
      }
    }
  }

  // Panggil saat aplikasi dimatikan
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Singleton
export const memoryRateLimiter = new MemoryRateLimiter()
```

### Redis-Based Rate Limiter (Production)

Untuk production di Vercel/Cloudflare, rate limiter harus pakai Redis karena instance server bisa banyak (serverless). Menggunakan sliding window dengan Redis Sorted Sets dan Lua script untuk atomicity.

```typescript
// lib/rate-limit-redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface RateLimitConfig {
  limit: number
  windowMs: number
  // Block duration setelah limit dilampaui (0 = tidak block)
  blockDurationMs?: number
}

const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  'api':         { limit: 100, windowMs: 60_000, blockDurationMs: 0 },
  'api/kuis':    { limit: 20,  windowMs: 60_000, blockDurationMs: 120_000 },
  'api/auth':    { limit: 5,   windowMs: 60_000, blockDurationMs: 300_000 },
  'api/search':  { limit: 20,  windowMs: 60_000, blockDurationMs: 0 },
  'api/doa':     { limit: 5,   windowMs: 10_000, blockDurationMs: 60_000 },
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter: number
  limit: number
}

// Lua script — atomic sliding window counter
const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local block_key = key .. ":blocked"

-- Cek apakah sedang diblokir
local blocked_until = redis.call("GET", block_key)
if blocked_until and tonumber(blocked_until) > now then
  return {0, 0, tonumber(blocked_until), tonumber(blocked_until) - now}
end

-- Hapus entry di luar window
redis.call("ZREMRANGEBYSCORE", key, 0, now - window)

-- Hitung request dalam window
local count = redis.call("ZCARD", key)

if count and count >= limit then
  -- Block jika limit terlampaui
  local block_for = tonumber(ARGV[4]) or 0
  if block_for > 0 then
    redis.call("SETEX", block_key, block_for, now + (block_for * 1000))
  end

  local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
  local reset_at = (oldest[2] and tonumber(oldest[2]) + window) or (now + window)
  return {0, 0, reset_at, math.ceil((reset_at - now) / 1000)}
end

-- Tambah request baru
redis.call("ZADD", key, now, now .. ":" .. math.random())
redis.call("EXPIRE", key, math.ceil(window / 1000) + 1)

local remaining = limit - (count or 0) - 1
return {1, math.max(0, remaining), now + window, 0}
`

export async function checkRateLimit(
  identifier: string,
  endpoint: string
): Promise<RateLimitResult> {
  const now = Date.now()
  const path = endpoint.replace(/^\/+/, '')
  const config = ENDPOINT_LIMITS[path] || ENDPOINT_LIMITS.api

  const key = `ratelimit:${identifier}:${path}`

  const [allowed, remaining, resetAt, retryAfter] = await redis.eval(
    SLIDING_WINDOW_SCRIPT,
    [key],
    [
      String(now),
      String(config.windowMs),
      String(config.limit),
      String(Math.ceil((config.blockDurationMs || 0) / 1000)),
    ]
  )

  return {
    allowed: allowed === 1,
    remaining: Number(remaining),
    resetAt: Number(resetAt),
    retryAfter: Number(retryAfter),
    limit: config.limit,
  }
}

// Rate limit per-user + per-IP sekaligus
export async function checkMultiRateLimit(
  userId: string,
  ip: string,
  endpoint: string
): Promise<RateLimitResult> {
  // Cek user limit dulu (lebih ketat), lalu IP limit
  const userResult = await checkRateLimit(`user:${userId}`, endpoint)

  if (!userResult.allowed) {
    return userResult
  }

  return checkRateLimit(`ip:${ip}`, endpoint)
}
```

### Next.js Middleware Integration

Middleware di Next.js menangkap semua request API dan menerapkan rate limiting sebelum request mencapai handler. Response headers memberi informasi batas ke client.

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit-redis'

export async function middleware(req: NextRequest) {
  // Hanya untuk API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip rate limiter untuk webhook (dari Resend, Telegram, dll)
  if (req.headers.get('x-webhook') === 'true') {
    return NextResponse.next()
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           || req.headers.get('x-real-ip')
           || req.headers.get('cf-connecting-ip')
           || '127.0.0.1'

  const userId = req.headers.get('x-user-id') || 'anonymous'
  const identifier = userId !== 'anonymous' ? `user:${userId}` : `ip:${ip}`

  const result = await checkRateLimit(identifier, req.nextUrl.pathname)

  // Set rate limit headers di semua response
  const headers = new Headers({
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  })

  if (!result.allowed) {
    headers.set('Retry-After', String(result.retryAfter))

    return new NextResponse(
      JSON.stringify({
        error: 'Terlalu banyak permintaan. Silakan coba lagi.',
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers),
          'Content-Type': 'application/json',
        },
      }
    )
  }

  const response = NextResponse.next()
  for (const [key, value] of headers) {
    response.headers.set(key, value)
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

### Rate Limit Headers

Setiap response dari API endpoint WAJIB menyertakan tiga header berikut agar client bisa menyesuaikan kecepatan request:

```
X-RateLimit-Limit: 100       # Maksimal request yang diizinkan per window
X-RateLimit-Remaining: 87    # Sisa request yang bisa dilakukan
X-RateLimit-Reset: 1719300012 # UNIX timestamp saat batas di-reset
```

Saat limit terlampaui (HTTP 429), header tambahan:

```
Retry-After: 34              # Detik yang harus ditunggu sebelum request berikutnya
```

Client sebaiknya membaca `X-RateLimit-Remaining` dan memperlambat request saat nilai mendekati 0, daripada menunggu sampai kena 429.

## RLS PostgreSQL Policy SQL

Row-Level Security (RLS) adalah fitur PostgreSQL yang membatasi akses baris berdasarkan kebijakan keamanan. Untuk platform multi-tenant e-learning, RLS memastikan setiap user hanya bisa mengakses data dari tenant (sekolah/kelas) mereka — bahkan jika ada bug di kode aplikasi.

### Enable RLS di Semua Tabel Tenant

Aktifkan RLS di setiap tabel yang mengandung data spesifik per tenant (sekolah). Tabel referensi umum (seperti `users`, `roles`) tidak perlu RLS karena sudah di-filter oleh permission level.

```sql
-- =====================================================
-- RLS Migration: 001_enable_rls_tables.sql
-- =====================================================
-- Aktifkan RLS di semua tabel yang mengandung data multi-tenant

ALTER TABLE courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades         ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials      ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Pastikan tenant_id ada di semua tabel yang relevan
-- =====================================================

ALTER TABLE courses       ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE enrollments   ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE submissions   ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE forum_posts   ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE assignments   ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE grades        ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);
ALTER TABLE materials     ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL REFERENCES tenants(id);

-- =====================================================
-- Index untuk query performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_courses_tenant_id        ON courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_tenant_id    ON enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_submissions_tenant_id    ON submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_tenant_id  ON quiz_attempts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_tenant_id    ON forum_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id  ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_tenant_id    ON assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grades_tenant_id         ON grades(tenant_id);
CREATE INDEX IF NOT EXISTS idx_materials_tenant_id      ON materials(tenant_id);
```

### Tenant Isolation Policies

Setiap user dalam satu tenant hanya bisa melihat data milik tenant mereka. Tenant context di-set melalui session variable PostgreSQL `app.tenant_id` yang dikirim dari aplikasi.

```sql
-- =====================================================
-- RLS Migration: 002_tenant_isolation_policies.sql
-- =====================================================
-- Semua policy menggunakan session variable app.tenant_id
-- yang di-set oleh aplikasi di awal koneksi.
-- Jika app.tenant_id tidak di-set, policy akan return false (no access).

-- =====================================================
-- Fungsi helper: ambil tenant_id dari session variable
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::UUID;
$$;

-- =====================================================
-- Helper: cek apakah user adalah admin/superadmin
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = current_setting('app.user_id', true)::UUID
      AND role IN ('admin', 'superadmin')
  );
$$;

-- =====================================================
-- POLICIES — COURSES
-- =====================================================

-- Policy: user hanya bisa melihat course dari tenant mereka
CREATE POLICY tenant_isolation_select ON courses
  FOR SELECT
  USING (
    tenant_id = get_current_tenant_id()
    OR is_admin()
  );

-- Policy: hanya admin tenant yang bisa mengubah course
CREATE POLICY tenant_isolation_insert ON courses
  FOR INSERT
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND is_admin()
  );

CREATE POLICY tenant_isolation_update ON courses
  FOR UPDATE
  USING (tenant_id = get_current_tenant_id() AND is_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() AND is_admin());

CREATE POLICY tenant_isolation_delete ON courses
  FOR DELETE
  USING (tenant_id = get_current_tenant_id() AND is_admin());

-- =====================================================
-- POLICIES — ENROLLMENTS
-- =====================================================

-- Siswa hanya bisa melihat enrollment mereka sendiri
-- Admin bisa melihat semua enrollment di tenant mereka
CREATE POLICY tenant_isolation_enrollments ON enrollments
  FOR SELECT
  USING (
    tenant_id = get_current_tenant_id()
    AND (
      user_id = current_setting('app.user_id', true)::UUID
      OR is_admin()
    )
  );

CREATE POLICY tenant_isolation_enrollments_write ON enrollments
  FOR INSERT
  WITH CHECK (tenant_id = get_current_tenant_id());

-- =====================================================
-- POLICIES — SUBMISSIONS
-- =====================================================

CREATE POLICY tenant_isolation_submissions ON submissions
  FOR ALL
  USING (
    tenant_id = get_current_tenant_id()
    AND (
      user_id = current_setting('app.user_id', true)::UUID
      OR is_admin()
    )
  );

-- =====================================================
-- POLICIES — QUIZ ATTEMPTS
-- =====================================================

CREATE POLICY tenant_isolation_quiz_attempts ON quiz_attempts
  FOR SELECT
  USING (
    tenant_id = get_current_tenant_id()
    AND (
      user_id = current_setting('app.user_id', true)::UUID
      OR is_admin()
    )
  );

-- =====================================================
-- POLICIES — FORUM POSTS
-- =====================================================

CREATE POLICY tenant_isolation_forum_select ON forum_posts
  FOR SELECT
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_isolation_forum_write ON forum_posts
  FOR INSERT
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_isolation_forum_update ON forum_posts
  FOR UPDATE
  USING (
    tenant_id = get_current_tenant_id()
    AND author_id = current_setting('app.user_id', true)::UUID
  );

-- =====================================================
-- POLICIES — NOTIFICATIONS
-- =====================================================

CREATE POLICY tenant_isolation_notifications ON notifications
  FOR ALL
  USING (
    tenant_id = get_current_tenant_id()
    AND user_id = current_setting('app.user_id', true)::UUID
  );

-- =====================================================
-- POLICIES — ASSIGNMENTS
-- =====================================================

CREATE POLICY tenant_isolation_assignments ON assignments
  FOR SELECT
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_isolation_assignments_write ON assignments
  FOR ALL
  USING (tenant_id = get_current_tenant_id() AND is_admin());

-- =====================================================
-- POLICIES — GRADES
-- =====================================================

CREATE POLICY tenant_isolation_grades ON grades
  FOR SELECT
  USING (
    tenant_id = get_current_tenant_id()
    AND (
      student_id = current_setting('app.user_id', true)::UUID
      OR is_admin()
    )
  );

-- =====================================================
-- POLICIES — MATERIALS
-- =====================================================

CREATE POLICY tenant_isolation_materials ON materials
  FOR SELECT
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_isolation_materials_write ON materials
  FOR ALL
  USING (tenant_id = get_current_tenant_id() AND is_admin());
```

### Special Cases — Admin, Lintas Tenant, dan Analytics

Beberapa skenario membutuhkan pengecualian dari isolasi tenant:

1. **Superadmin** bisa melihat semua tenant (untuk support dan maintenance).
2. **Laporan lintas tenant** dengan persetujuan eksplisit dari kedua tenant.
3. **Analytics agregat** yang sifatnya anonim dan tidak mengandung PII.

```sql
-- =====================================================
-- RLS Migration: 003_special_cases.sql
-- =====================================================

-- =====================================================
-- 1. SUPERADMIN — bisa melihat semua tenant
-- =====================================================

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = current_setting('app.user_id', true)::UUID
      AND role = 'superadmin'
  );
$$;

-- Buat policy khusus superadmin yang override policy tenant
-- Policy dengan nama yang sama akan di-OR dengan policy existing
-- (PostgreSQL menggabungkan semua policy yang berlaku untuk satu operasi)

-- Contoh: Superadmin bisa SELECT dari tabel mana pun
CREATE POLICY superadmin_all_access ON courses
  FOR SELECT
  USING (is_superadmin());

-- Karena policy di-OR, superadmin tetap bisa select meski tenant_id tidak match
-- Catatan: PostgreSQL mengevaluasi semua policy untuk satu operasi dengan OR.
-- Jika ada satu policy yang mengizinkan, operasi diizinkan.

-- =====================================================
-- 2. LAPORAN LINTAS TENANT — dengan consent token
-- =====================================================
-- Untuk laporan yang membutuhkan data dari dua tenant berbeda,
-- gunakan consent token yang ditandatangani server.
-- Consent token berisi: source_tenant, target_tenant, expiry, dan signature.

CREATE OR REPLACE FUNCTION has_cross_tenant_consent(target_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM cross_tenant_consents
    WHERE source_tenant_id = get_current_tenant_id()
      AND target_tenant_id = target_tenant_id_consent
      AND expires_at > NOW()
      AND revoked = false
  );
$$;

-- Policy untuk cross-tenant report view
CREATE POLICY cross_tenant_report ON enrollments
  FOR SELECT
  USING (has_cross_tenant_consent(tenant_id));

-- =====================================================
-- 3. SYSTEM-WIDE ANALYTICS — anonim, aggregated
-- =====================================================
-- Tabel analytics khusus yang hanya menyimpan data anonim dan ter-agregasi.
-- Tabel ini tidak memiliki tenant_id karena sifatnya lintas tenant.
-- Hanya superadmin yang bisa mengakses.

ALTER TABLE analytics_daily       ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_course_pop  ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_search_log  ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_superadmin_only ON analytics_daily
  FOR SELECT
  USING (is_superadmin());

CREATE POLICY analytics_superadmin_only ON analytics_course_pop
  FOR SELECT
  USING (is_superadmin());

CREATE POLICY analytics_superadmin_only ON analytics_search_log
  FOR SELECT
  USING (is_superadmin());

-- =====================================================
-- Verifikasi semua policy sudah terpasang
-- =====================================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN (
  'courses', 'enrollments', 'submissions', 'quiz_attempts',
  'forum_posts', 'notifications', 'assignments', 'grades', 'materials',
  'analytics_daily', 'analytics_course_pop', 'analytics_search_log'
)
ORDER BY tablename, policyname;
```

### PostgreSQL Session Variable Setup di Connection Pool

Aplikasi mengirim `app.tenant_id` dan `app.user_id` sebagai session variable setiap kali membuat koneksi ke database. PostgreSQL akan menggunakan nilai ini saat mengevaluasi RLS policy.

```typescript
// lib/db.ts
import { Pool, PoolClient } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

// Set session variables untuk RLS sebelum query
export async function withTenant<T>(
  tenantId: string,
  userId: string,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    // Set tenant context di session PostgreSQL
    // Parameter ketiga `true` = local scope (hanya untuk transaksi ini)
    await client.query(
      `SELECT set_config('app.tenant_id', $1, true),
              set_config('app.user_id', $2, true)`,
      [tenantId, userId]
    )

    return await fn(client)
  } finally {
    // Pastikan client selalu direlease
    client.release()
  }
}

// Helper — query langsung dengan tenant context
export async function queryWithTenant<T = any>(
  tenantId: string,
  userId: string,
  text: string,
  params?: unknown[]
): Promise<T[]> {
  return withTenant(tenantId, userId, async (client) => {
    const result = await client.query(text, params)
    return result.rows as T[]
  })
}

// Middleware Express/Next.js — extract tenant dari request
export function extractTenantContext(
  req: Request
): { tenantId: string; userId: string } {
  return {
    tenantId: req.headers.get('x-tenant-id') || '',
    userId: req.headers.get('x-user-id') || '',
  }
}
```

### Kenapa RLS Lebih Baik daripada Middleware-Only

RLS memberikan **defense-in-depth** yang tidak bisa dicapai oleh filter di kode aplikasi saja.

| Aspek | Middleware/Query Filter | RLS PostgreSQL |
|-------|------------------------|----------------|
| **Bypass via bug** | Developer lupa filter → data bocor | RLS tetap memblokir, terlepas dari query |
| **Bypass via API** | Endpoint baru tanpa filter → rentan | Policy otomatis berlaku untuk semua akses |
| **Direct DB access** | Admin tools, backup, migrasi bisa bocor | Policy tetap aktif untuk konepsi normal |
| **ORM abstraction** | Query builder bisa hasilkan SQL tanpa WHERE | RLS bekerja di level baris, bukan query |
| **Audit trail** | Tidak ada catatan siapa akses apa | Policy bisa ditambah logging |

**Kesimpulan:** Filter tenant di kode aplikasi itu penting, tapi jangan jadi satu-satunya pertahanan. RLS di PostgreSQL adalah jaring pengaman yang memastikan data tetap aman meskipun ada bug di kode aplikasi.

## Search Implementation

Implementasi pencarian untuk katalog course terdiri dari backend search engine, API endpoint, dan UI komponen dengan debounce input.

### MeiliSearch Setup (Mode Medium)

MeiliSearch adalah search engine open-source yang cepat, dengan fitur typo tolerance, faceted search, dan highlighting. Cocok untuk proyek skala menengah.

```typescript
// lib/search.ts
import { MeiliSearch } from 'meilisearch'

const searchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
})

// ——— Document Types ———

interface CourseDocument {
  id: string
  title: string
  description: string
  kelas: string
  category: string
  tags: string[]
  instructor: string
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  isFree: boolean
  rating: number
  enrollmentCount: number
  createdAt: string
  thumbnailUrl?: string
}

interface SearchFilters {
  category?: string
  kelas?: string
  level?: string
  isFree?: boolean
  minRating?: number
  sortBy?: string
}

// ——— Index Management ———

export async function createCoursesIndex(): Promise<void> {
  try {
    // Hapus index lama jika sudah ada
    await searchClient.deleteIndexIfExists('courses')

    const task = await searchClient.createIndex('courses', {
      primaryKey: 'id',
    })
    await searchClient.waitForTask(task.taskUid)

    // Konfigurasi searchable attributes
    await searchClient.index('courses').updateSearchableAttributes([
      'title',
      'description',
      'tags',
      'instructor',
    ])

    // Filterable attributes untuk faceted search
    await searchClient.index('courses').updateFilterableAttributes([
      'kelas',
      'category',
      'level',
      'isFree',
      'price',
      'rating',
    ])

    // Sortable attributes
    await searchClient.index('courses').updateSortableAttributes([
      'rating',
      'enrollmentCount',
      'createdAt',
      'price',
    ])

    // Typo tolerance
    await searchClient.index('courses').updateTypoTolerance({
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 5,
        twoTypos: 9,
      },
    })

    console.log('[SEARCH] Index courses created and configured')
  } catch (error) {
    console.error('[SEARCH] Failed to create index:', error)
    throw error
  }
}

// ——— Indexing ———

export async function indexCourse(course: CourseDocument): Promise<void> {
  await searchClient.index('courses').addDocuments([course])
}

export async function indexCourses(courses: CourseDocument[]): Promise<void> {
  // Batch indexing — maksimal 10.000 dokumen per batch
  const BATCH_SIZE = 10_000
  for (let i = 0; i < courses.length; i += BATCH_SIZE) {
    const batch = courses.slice(i, i + BATCH_SIZE)
    await searchClient.index('courses').addDocuments(batch)
  }
}

export async function removeCourse(courseId: string): Promise<void> {
  await searchClient.index('courses').deleteDocument(courseId)
}

export async function updateCourse(course: Partial<CourseDocument> & { id: string }): Promise<void> {
  await searchClient.index('courses').updateDocuments([course])
}

// ——— Searching ———

export interface SearchResult {
  hits: Array<CourseDocument & {
    _highlightResult?: {
      title?: { value: string }
      description?: { value: string }
    }
  }>
  totalHits: number
  totalPages: number
  hitsPerPage: number
  page: number
  facetDistribution?: Record<string, Record<string, number>>
}

export async function searchCourses(
  query: string,
  filters?: SearchFilters,
  page: number = 1,
  limit: number = 20
): Promise<SearchResult> {
  // Bangun filter string untuk MeiliSearch
  const filterParts: string[] = []

  if (filters?.category) filterParts.push(`category = "${filters.category}"`)
  if (filters?.kelas) filterParts.push(`kelas = "${filters.kelas}"`)
  if (filters?.level) filterParts.push(`level = "${filters.level}"`)
  if (filters?.isFree !== undefined) filterParts.push(`isFree = ${filters.isFree}`)
  if (filters?.minRating) filterParts.push(`rating >= ${filters.minRating}`)

  const results = await searchClient.index('courses').search(query, {
    limit,
    offset: (page - 1) * limit,
    attributesToHighlight: ['title', 'description'],
    attributesToCrop: ['description'],
    cropLength: 200,
    filter: filterParts.length > 0 ? filterParts : undefined,
    sort: filters?.sortBy ? [filters.sortBy] : ['rating:desc'],
    facets: ['category', 'kelas', 'level'],
    showMatchesPosition: true,
  })

  return {
    hits: results.hits as SearchResult['hits'],
    totalHits: results.estimatedTotalHits || 0,
    totalPages: Math.ceil((results.estimatedTotalHits || 0) / limit),
    hitsPerPage: limit,
    page,
    facetDistribution: results.facetDistribution as Record<string, Record<string, number>>,
  }
}

// ——— Search-as-you-type suggester (autocomplete) ———

export async function suggestCourses(
  prefix: string,
  limit: number = 5
): Promise<Array<{ id: string; title: string }>> {
  const results = await searchClient.index('courses').search(prefix, {
    limit,
    attributesToHighlight: ['title'],
    showMatchesPosition: true,
  })

  return results.hits.map((hit: any) => ({
    id: hit.id,
    title: hit.title,
  }))
}
```

### Elasticsearch Setup (Mode Enterprise)

Untuk skala enterprise dengan kebutuhan pencarian yang lebih kompleks (full-text search bahasa Indonesia, synonym, completion suggester, faceted aggregation).

```typescript
// lib/elasticsearch.ts
import { Client } from '@elastic/elasticsearch'

export const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
})

// ——— Index Mapping ———

const COURSES_INDEX = 'courses'
const MATERIALS_INDEX = 'materials'
const FORUM_INDEX = 'forum_posts'

export async function setupElasticsearchIndices(): Promise<void> {
  // Index untuk courses
  const coursesExists = await esClient.indices.exists({ index: COURSES_INDEX })
  if (!coursesExists) {
    await esClient.indices.create({
      index: COURSES_INDEX,
      body: {
        settings: {
          analysis: {
            analyzer: {
              // Analyser khusus bahasa Indonesia
              indonesian_analyzer: {
                type: 'standard',
                // stopwords: '_indonesian_', // enable jika plugin analysis-kuromoji terinstall
              },
            },
          },
        },
        mappings: {
          properties: {
            id:               { type: 'keyword' },
            title:            { type: 'text', analyzer: 'indonesian_analyzer', fields: { keyword: { type: 'keyword' } } },
            description:      { type: 'text', analyzer: 'indonesian_analyzer' },
            kelas:            { type: 'keyword' },
            category:         { type: 'keyword' },
            tags:             { type: 'keyword' },
            instructor:       { type: 'text' },
            level:            { type: 'keyword' },
            price:            { type: 'float' },
            isFree:           { type: 'boolean' },
            rating:           { type: 'float' },
            enrollmentCount:  { type: 'integer' },
            createdAt:        { type: 'date' },
            // Completion suggester untuk search-as-you-type
            title_suggest:    { type: 'completion' },
          },
        },
      },
    })
  }

  // Index untuk materials
  const materialsExists = await esClient.indices.exists({ index: MATERIALS_INDEX })
  if (!materialsExists) {
    await esClient.indices.create({
      index: MATERIALS_INDEX,
      body: {
        mappings: {
          properties: {
            id:               { type: 'keyword' },
            courseId:         { type: 'keyword' },
            title:            { type: 'text', analyzer: 'indonesian_analyzer' },
            content:          { type: 'text', analyzer: 'indonesian_analyzer' },
            tags:             { type: 'keyword' },
            type:             { type: 'keyword' },  // 'video', 'pdf', 'quiz'
            createdAt:        { type: 'date' },
            title_suggest:    { type: 'completion' },
          },
        },
      },
    })
  }

  // Index untuk forum posts
  const forumExists = await esClient.indices.exists({ index: FORUM_INDEX })
  if (!forumExists) {
    await esClient.indices.create({
      index: FORUM_INDEX,
      body: {
        mappings: {
          properties: {
            id:               { type: 'keyword' },
            courseId:         { type: 'keyword' },
            title:            { type: 'text', analyzer: 'indonesian_analyzer' },
            body:             { type: 'text', analyzer: 'indonesian_analyzer' },
            author:           { type: 'text' },
            tags:             { type: 'keyword' },
            replyCount:       { type: 'integer' },
            createdAt:        { type: 'date' },
          },
        },
      },
    })
  }
}

// ——— Completion Suggester ———

export async function suggestTitle(prefix: string): Promise<string[]> {
  const result = await esClient.search({
    index: COURSES_INDEX,
    body: {
      suggest: {
        title_suggestions: {
          prefix,
          completion: {
            field: 'title_suggest',
            size: 5,
            fuzzy: {
              fuzziness: 'auto',
            },
          },
        },
      },
    },
  })

  const suggestions = result.body.suggest?.title_suggestions?.[0]?.options || []
  return suggestions.map((s: any) => s.text)
}

// ——— Faceted Search ———

export async function facetedSearch(
  query: string,
  filters?: Record<string, string | string[]>,
  page: number = 1,
  size: number = 20
): Promise<any> {
  const must: any[] = []

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['title^3', 'description^2', 'tags'],
        type: 'best_fields',
        fuzziness: 'auto',
      },
    })
  }

  // Filter
  const filterClauses: any[] = []
  if (filters) {
    for (const [field, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        filterClauses.push({ terms: { [field]: value } })
      } else {
        filterClauses.push({ term: { [field]: value } })
      }
    }
  }

  const result = await esClient.search({
    index: COURSES_INDEX,
    body: {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter: filterClauses,
        },
      },
      aggs: {
        categories: { terms: { field: 'category', size: 20 } },
        kelas:      { terms: { field: 'kelas', size: 10 } },
        levels:     { terms: { field: 'level', size: 5 } },
        price_range: {
          range: {
            field: 'price',
            ranges: [
              { key: 'gratis', from: 0, to: 0 },
              { key: 'murah', from: 1, to: 50000 },
              { key: 'sedang', from: 50001, to: 200000 },
              { key: 'mahal', from: 200001 },
            ],
          },
        },
      },
      from: (page - 1) * size,
      size,
      sort: ['_score', { rating: 'desc' }],
      highlight: {
        fields: {
          title: { number_of_fragments: 0 },
          description: { fragment_size: 150 },
        },
      },
    },
  })

  return result.body
}
```

### Search API Endpoint

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchCourses, suggestCourses } from '@/lib/search'
import { redis } from '@/lib/rate-limit-redis'

interface SearchQueryParams {
  q: string
  category?: string
  kelas?: string
  level?: string
  isFree?: string
  minRating?: string
  sortBy?: string
  page?: string
  limit?: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() || ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))
  const isAutocomplete = searchParams.get('autocomplete') === 'true'

  // Autocomplete — ringan, tanpa logging
  if (isAutocomplete) {
    if (q.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await suggestCourses(q, Math.min(limit, 10))
    return NextResponse.json({ suggestions })
  }

  // Validasi minimal query
  if (!q) {
    return NextResponse.json({
      hits: [],
      totalHits: 0,
      totalPages: 0,
      hitsPerPage: limit,
      page,
      error: 'Parameter "q" wajib diisi',
    })
  }

  const filters = {
    category: searchParams.get('category') || undefined,
    kelas: searchParams.get('kelas') || undefined,
    level: searchParams.get('level') || undefined,
    isFree: searchParams.get('isFree') === 'true' ? true : undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    sortBy: searchParams.get('sortBy') || undefined,
  }

  try {
    const results = await searchCourses(q, filters, page, limit)

    // Log search query untuk analytics (async, non-blocking)
    logSearchQuery(q, filters, results.totalHits)

    return NextResponse.json(results)
  } catch (error) {
    console.error('[SEARCH] Error:', error)
    return NextResponse.json(
      { error: 'Pencarian gagal. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}

// Log search ke Redis Stream untuk analytics
async function logSearchQuery(
  query: string,
  filters: Record<string, unknown>,
  totalHits: number
): Promise<void> {
  try {
    await redis.xadd(
      'search_log',
      '*',
      'query', query,
      'filters', JSON.stringify(filters),
      'totalHits', String(totalHits),
      'timestamp', new Date().toISOString()
    )
  } catch {
    // Logging tidak boleh mengganggu response
  }
}
```

### Search UI Component

Komponen search dengan debounced input (300ms), loading state, empty state, error state, dan keyboard navigation.

```tsx
// components/search/SearchBar.tsx
'use client'

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X, Loader2, BookOpen, TrendingUp } from 'lucide-react'

interface SearchHit {
  id: string
  title: string
  description: string
  kelas: string
  category: string
  level: string
  thumbnailUrl?: string
  _highlightResult?: {
    title?: { value: string }
    description?: { value: string }
  }
}

interface SearchResult {
  hits: SearchHit[]
  totalHits: number
  totalPages: number
  page: number
  hitsPerPage: number
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const resultsRef = useRef<HTMLDivElement>(null)

  // Muat pencarian terakhir dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Debounced search
  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ q, limit: '10' })
      const res = await fetch(`/api/search?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: SearchResult = await res.json()
      setResults(data)
      setSelectedIndex(-1)
    } catch (err) {
      setError('Pencarian gagal. Coba lagi.')
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(-1)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value)
    }, 300)
  }

  const handleSelect = (hit: SearchHit) => {
    // Simpan ke pencarian terbaru
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))

    window.location.href = `/materi/${hit.id}`
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const hits = results?.hits || []

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, hits.length - 1, 9))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && hits[selectedIndex]) {
          handleSelect(hits[selectedIndex])
        } else if (query.length >= 2) {
          // Enter tanpa selection → navigasi ke halaman hasil pencarian
          window.location.href = `/cari?q=${encodeURIComponent(query)}`
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Scroll hasil yang terpilih ke view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll('[data-result-item]')
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <div className="relative w-full max-w-xl">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cari materi, bab, atau topik..."
          className="w-full h-12 pl-12 pr-10 bg-white border-2 border-[rgba(27,107,69,0.15)] rounded-[40px] text-[#141d1b] text-base placeholder:text-[#9ca3af] focus:outline-none focus:border-[#005231] focus:ring-2 focus:ring-[rgba(0,82,49,0.1)] transition-all"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults(null)
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Hapus pencarian"
          >
            <X className="w-4 h-4 text-[#6b7280]" />
          </button>
        )}
      </div>

      {/* Hasil dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="search-results"
            ref={resultsRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-[rgba(27,107,69,0.15)] rounded-[24px] shadow-glass-xl overflow-hidden z-50"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center gap-3 px-5 py-4 text-[#6b7280] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mencari...</span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="px-5 py-4 text-sm text-[#dc2626]">
                {error}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && query.length >= 2 && results?.hits.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[#6b7280]">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Tidak ditemukan hasil untuk &quot;{query}&quot;</p>
                <p className="text-xs mt-1">Coba kata kunci lain</p>
              </div>
            )}

            {/* Recent searches (ketika query kosong) */}
            {!isLoading && query.length < 2 && recentSearches.length > 0 && (
              <div>
                <div className="px-5 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                  Pencarian Terakhir
                </div>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => {
                      setQuery(search)
                      performSearch(search)
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[#141d1b] hover:bg-[#f2fcf7] transition-colors text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-[#6b7280]" />
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            {!isLoading && results?.hits && results.hits.length > 0 && (
              <div>
                <div className="px-5 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider flex items-center justify-between">
                  <span>Hasil Pencarian</span>
                  {results.totalHits > results.hitsPerPage && (
                    <span className="text-[#6b7280] font-normal normal-case">
                      {results.totalHits} hasil
                    </span>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {results.hits.map((hit, index) => (
                    <button
                      key={hit.id}
                      id={`result-${index}`}
                      data-result-item
                      onClick={() => handleSelect(hit)}
                      className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-colors ${
                        index === selectedIndex ? 'bg-[#f2fcf7] border-l-2 border-[#005231]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-[12px] bg-[#005231] flex items-center justify-center flex-shrink-0 mt-1">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium text-[#141d1b] line-clamp-1"
                          dangerouslySetInnerHTML={{
                            __html: hit._highlightResult?.title?.value || hit.title,
                          }}
                        />
                        <div
                          className="text-xs text-[#6b7280] line-clamp-1 mt-0.5"
                          dangerouslySetInnerHTML={{
                            __html: hit._highlightResult?.description?.value || hit.description,
                          }}
                        />
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2fcf7] text-[#005231] font-medium">
                            Kelas {hit.kelas}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[#6b7280]">
                            {hit.category}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Lihat semua hasil */}
                {results.totalHits > results.hitsPerPage && (
                  <a
                    href={`/cari?q=${encodeURIComponent(query)}`}
                    className="block px-5 py-3 text-sm font-medium text-[#005231] text-center hover:bg-[#f2fcf7] border-t border-[rgba(27,107,69,0.1)] transition-colors"
                  >
                    Lihat semua {results.totalHits} hasil
                  </a>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

# Bagian 4: Fitur E-Learning Platform Lanjutan

> Dokumentasi ini mencakup implementasi Forum/Diskusi, Gamifikasi, Moderasi Konten, dan Spaced Repetition SM-2 untuk platform pembelajaran K-12.

---

## 4.1 FORUM / DISCUSSION SYSTEM

### 4.1.1 Arsitektur & Database Schema

Forum diskusi mendukung diskusi terstruktur per kursus dengan threaded replies, fitur mark-as-solution (seperti Stack Overflow), serta moderasi konten otomatis.

```sql
-- ============================================================
-- FORUM SCHEMA — Multi-tenant discussion system
-- ============================================================

CREATE TABLE forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  is_pinned BOOLEAN DEFAULT false,
  is_announcement BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_course ON forum_threads (tenant_id, course_id, last_activity_at DESC);
CREATE INDEX idx_forum_author ON forum_threads (author_id);
CREATE INDEX idx_forum_activity ON forum_threads (last_activity_at DESC);
CREATE INDEX idx_forum_unanswered ON forum_threads (course_id) WHERE reply_count = 0;

CREATE TABLE forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_replies(id),  -- untuk nested/threaded replies
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  is_solution BOOLEAN DEFAULT false,             -- marked as correct answer by teacher
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_replies_thread ON forum_replies (thread_id, created_at);
CREATE INDEX idx_replies_parent ON forum_replies (parent_id);

CREATE TABLE forum_upvotes (
  user_id UUID NOT NULL REFERENCES users(id),
  reply_id UUID NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, reply_id)
);
```

### 4.1.2 API Endpoints

```typescript
// ============================================================
// FORUM API — Server Route Handlers (Next.js App Router)
// ============================================================

// ---------- LIST THREADS ----------
// GET /api/forum/[courseId]
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = await params
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const sort = searchParams.get('sort') ?? 'latest' // 'latest' | 'active' | 'unanswered'
  const tag = searchParams.get('tag')
  const offset = (page - 1) * limit

  const session = await getSession()

  let orderBy: SQL
  let whereClause = and(eq(forumThreads.courseId, courseId))

  if (sort === 'active') {
    orderBy = desc(forumThreads.lastActivityAt)
  } else if (sort === 'unanswered') {
    whereClause = and(whereClause, eq(forumThreads.replyCount, 0))
    orderBy = desc(forumThreads.createdAt)
  } else {
    orderBy = desc(forumThreads.createdAt)
  }

  if (tag) {
    whereClause = and(whereClause, sql`${tag} = ANY(${forumThreads.tags})`)
  }

  const threads = await db.query.forumThreads.findMany({
    where: whereClause,
    orderBy,
    limit,
    offset,
    with: {
      author: { columns: { id: true, name: true, avatarUrl: true } },
    },
  })

  const [{ count }] = await db
    .select({ count: count() })
    .from(forumThreads)
    .where(whereClause)

  return NextResponse.json({
    data: threads,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  })
}

// ---------- CREATE THREAD ----------
// POST /api/forum/[courseId]
export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = await params
  const session = await requireSession()
  const body = await req.json()

  const parsed = CreateThreadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const { title, content, tags } = parsed.data

  // Content moderation check
  const moderation = await screenTextContent(`${title}\n${content}`)

  if (moderation.decision === 'BLOCK') {
    return NextResponse.json(
      { error: 'Konten tidak sesuai dengan pedoman komunitas. Silakan perbaiki.' },
      { status: 422 }
    )
  }

  const thread = await db.insert(forumThreads).values({
    tenantId: session.tenantId,
    courseId,
    title,
    content,
    authorId: session.userId,
    tags: tags ?? [],
    isPinned: false,
    isAnnouncement: false,
    isHidden: moderation.decision === 'FLAG', // flagged content: visible only to author
  }).returning()

  // Award forum points
  await awardPoints(session.userId, session.tenantId, 'forum_post')

  return NextResponse.json({ data: thread[0] }, { status: 201 })
}

// ---------- GET THREAD WITH REPLIES ----------
// GET /api/forum/thread/[threadId]
export async function GET_THREAD(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const { threadId } = await params
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const offset = (page - 1) * limit

  const thread = await db.query.forumThreads.findFirst({
    where: eq(forumThreads.id, threadId),
    with: {
      author: { columns: { id: true, name: true, avatarUrl: true } },
    },
  })

  if (!thread) {
    return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 })
  }

  // Increment view count
  await db.update(forumThreads)
    .set({ viewCount: thread.viewCount + 1 })
    .where(eq(forumThreads.id, threadId))

  // Fetch replies — solutions first, then by created_at
  const replies = await db.query.forumReplies.findMany({
    where: eq(forumReplies.threadId, threadId),
    orderBy: [desc(forumReplies.isSolution), asc(forumReplies.createdAt)],
    limit,
    offset,
    with: {
      author: { columns: { id: true, name: true, avatarUrl: true } },
      parent: true,
    },
  })

  return NextResponse.json({
    data: thread,
    replies,
    pagination: { page, limit },
  })
}

// ---------- REPLY TO THREAD ----------
// POST /api/forum/thread/[threadId]/reply
export async function POST_REPLY(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const { threadId } = await params
  const session = await requireSession()
  const body = await req.json()

  const parsed = CreateReplySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const { content, parentId } = parsed.data

  // Verify thread exists
  const thread = await db.query.forumThreads.findFirst({
    where: eq(forumThreads.id, threadId),
  })
  if (!thread) {
    return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 })
  }

  // Content moderation
  const moderation = await screenTextContent(content)
  if (moderation.decision === 'BLOCK') {
    return NextResponse.json({ error: 'Konten tidak sesuai pedoman komunitas.' }, { status: 422 })
  }

  // If parentId provided, verify it belongs to same thread
  if (parentId) {
    const parent = await db.query.forumReplies.findFirst({
      where: eq(forumReplies.id, parentId),
    })
    if (!parent || parent.threadId !== threadId) {
      return NextResponse.json({ error: 'Parent reply tidak valid' }, { status: 400 })
    }
  }

  const reply = await db.insert(forumReplies).values({
    threadId,
    parentId: parentId ?? null,
    content,
    authorId: session.userId,
    isHidden: moderation.decision === 'FLAG',
  }).returning()

  // Update thread metadata
  await db.update(forumThreads)
    .set({
      replyCount: thread.replyCount + 1,
      lastActivityAt: new Date(),
    })
    .where(eq(forumThreads.id, threadId))

  // Award points
  await awardPoints(session.userId, session.tenantId, 'forum_post')

  return NextResponse.json({ data: reply[0] }, { status: 201 })
}

// ---------- MARK AS SOLUTION ----------
// PUT /api/forum/reply/[replyId]/solution
export async function MARK_SOLUTION(
  req: NextRequest,
  { params }: { params: { replyId: string } }
) {
  const { replyId } = await params
  const session = await requireSession()

  const reply = await db.query.forumReplies.findFirst({
    where: eq(forumReplies.id, replyId),
    with: {
      thread: { columns: { courseId: true } },
    },
  })

  if (!reply) {
    return NextResponse.json({ error: 'Reply tidak ditemukan' }, { status: 404 })
  }

  // Verify user is teacher/admin for this course
  const isTeacher = await verifyCourseInstructor(session.userId, reply.thread.courseId)
  if (!isTeacher) {
    return NextResponse.json({ error: 'Hanya pengajar yang bisa menandai solusi' }, { status: 403 })
  }

  // Unmark previous solution if exists
  await db.update(forumReplies)
    .set({ isSolution: false })
    .where(and(
      eq(forumReplies.threadId, reply.threadId),
      eq(forumReplies.isSolution, true)
    ))

  // Mark this reply as solution
  await db.update(forumReplies)
    .set({ isSolution: true })
    .where(eq(forumReplies.id, replyId))

  // Award bonus points to author
  await awardPoints(reply.authorId, session.tenantId, 'solution_marked')

  return NextResponse.json({ data: { message: 'Solusi berhasil ditandai' } })
}

// ---------- UPVOTE REPLY ----------
// POST /api/forum/reply/[replyId]/upvote
export async function UPVOTE_REPLY(
  req: NextRequest,
  { params }: { params: { replyId: string } }
) {
  const { replyId } = await params
  const session = await requireSession()

  // Check if user already upvoted
  const existing = await db.query.forumUpvotes.findFirst({
    where: and(
      eq(forumUpvotes.userId, session.userId),
      eq(forumUpvotes.replyId, replyId)
    ),
  })

  if (existing) {
    // Toggle off
    await db.delete(forumUpvotes)
      .where(and(
        eq(forumUpvotes.userId, session.userId),
        eq(forumUpvotes.replyId, replyId)
      ))
    await db.update(forumReplies)
      .set({ upvotes: sql`${forumReplies.upvotes} - 1` })
      .where(eq(forumReplies.id, replyId))

    return NextResponse.json({ data: { upvoted: false } })
  }

  await db.insert(forumUpvotes).values({
    userId: session.userId,
    replyId,
  })

  await db.update(forumReplies)
    .set({ upvotes: sql`${forumReplies.upvotes} + 1` })
    .where(eq(forumReplies.id, replyId))

  return NextResponse.json({ data: { upvoted: true } })
}

// ---------- DELETE THREAD (soft) ----------
// DELETE /api/forum/thread/[threadId]
export async function DELETE_THREAD(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const { threadId } = await params
  const session = await requireSession()

  const thread = await db.query.forumThreads.findFirst({
    where: eq(forumThreads.id, threadId),
  })

  if (!thread) {
    return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 })
  }

  const isAuthor = thread.authorId === session.userId
  const isAdmin = session.role === 'admin' || session.role === 'superadmin'

  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: 'Tidak punya akses' }, { status: 403 })
  }

  // Soft delete — set deleted_at instead of actually removing
  await db.update(forumThreads)
    .set({ deletedAt: new Date() })
    .where(eq(forumThreads.id, threadId))

  return NextResponse.json({ data: { message: 'Thread berhasil dihapus' } })
}
```

### 4.1.3 Validation Schemas (Zod)

```typescript
import { z } from 'zod'

export const CreateThreadSchema = z.object({
  title: z
    .string()
    .min(10, 'Judul minimal 10 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  content: z
    .string()
    .min(20, 'Konten minimal 20 karakter')
    .max(10000, 'Konten maksimal 10.000 karakter'),
  tags: z
    .array(z.string().max(30))
    .max(5, 'Maksimal 5 tag')
    .optional()
    .default([]),
})

export const CreateReplySchema = z.object({
  content: z
    .string()
    .min(1, 'Konten tidak boleh kosong')
    .max(5000, 'Konten maksimal 5.000 karakter'),
  parentId: z.string().uuid().optional().nullable(),
})
```

### 4.1.4 Mark as Solution — UI Behavior

Fitur mark-as solution mengadopsi pola Stack Overflow:

- Hanya guru/pengajar course yang bisa menandai solusi
- Hanya SATU reply per thread yang bisa jadi solusi
- Solusi ditandai dengan badge hijau "✓ Solusi" dan dipindah ke urutan pertama (sebelum reply lain)
- Penulis solusi mendapat 50 poin bonus gamifikasi
- Ketika solusi baru ditandai, solusi lama otomatis tidak berlaku

```typescript
// Komponen reply dengan status solusi
function ForumReply({ reply, isTeacher }: { reply: Reply; isTeacher: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all',
        reply.isSolution && 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
      )}
    >
      {reply.isSolution && (
        <div className="mb-2 flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold">Solusi Terpilih</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar user={reply.author} size="sm" />
          <div>
            <p className="text-sm font-medium">{reply.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(reply.createdAt)}
            </p>
          </div>
        </div>

        {isTeacher && !reply.isSolution && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAsSolution(reply.id)}
            className="text-emerald-600 hover:bg-emerald-50"
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Tandai Solusi
          </Button>
        )}
      </div>

      <div className="prose prose-sm mt-3 max-w-none">
        {reply.content}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <button
          onClick={() => upvoteReply(reply.id)}
          className={cn(
            'flex items-center gap-1 text-sm transition-colors',
            reply.hasUpvoted
              ? 'text-emerald-600'
              : 'text-muted-foreground hover:text-emerald-600'
          )}
        >
          <ChevronUp className="h-4 w-4" />
          {reply.upvotes}
        </button>
      </div>
    </div>
  )
}
```

### 4.1.5 Discussion Analytics

```typescript
// ============================================================
// FORUM ANALYTICS — Dashboard queries for teachers
// ============================================================

export async function getForumAnalytics(tenantId: string, courseId?: string) {
  const courseFilter = courseId
    ? eq(forumThreads.courseId, courseId)
    : eq(forumThreads.tenantId, tenantId)

  // Most active threads (last 30 days)
  const activeThreads = await db.query.forumThreads.findMany({
    where: and(
      courseFilter,
      gte(forumThreads.lastActivityAt, daysAgo(30)),
      isNull(forumThreads.deletedAt),
    ),
    orderBy: [desc(forumThreads.replyCount), desc(forumThreads.viewCount)],
    limit: 10,
    with: { author: { columns: { name: true } } },
  })

  // Unanswered threads (> 24h old, zero replies)
  const unanswered = await db.query.forumThreads.findMany({
    where: and(
      courseFilter,
      eq(forumThreads.replyCount, 0),
      lt(forumThreads.createdAt, hoursAgo(24)),
      isNull(forumThreads.deletedAt),
    ),
    orderBy: desc(forumThreads.createdAt),
    limit: 20,
  })

  // Average response time per course
  const avgResponseTime = await db
    .select({
      courseId: forumThreads.courseId,
      avgHours: sql<number>`AVG(EXTRACT(EPOCH FROM (first_reply.created_at - forum_threads.created_at)) / 3600)`,
    })
    .from(forumThreads)
    .innerJoin(
      forumReplies,
      eq(forumThreads.id, forumReplies.threadId),
    )
    .where(and(
      courseFilter,
      isNull(forumThreads.deletedAt),
    ))
    .groupBy(forumThreads.courseId)

  return {
    activeThreads,
    unansweredCount: unanswered.length,
    unansweredThreads: unanswered,
    avgResponseTime,
  }
}
```

---

## 4.2 GAMIFICATION SYSTEM

### 4.2.1 Arsitektur Gamifikasi

Sistem gamifikasi dirancang untuk meningkatkan motivasi siswa melalui poin, badge, streak, dan leaderboard. Terinspirasi dari ZenCore, Ruangguru, dan Duolingo.

### 4.2.2 Database Schema

```sql
-- ============================================================
-- GAMIFICATION SCHEMA
-- ============================================================

CREATE TABLE gamification_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  points INT NOT NULL DEFAULT 0,
  source VARCHAR(50) NOT NULL,
  -- Sumber poin:
  -- 'quiz_complete'      — menyelesaikan kuis (10 pts)
  -- 'perfect_score'      — nilai sempurna (+25 pts bonus)
  -- 'streak_day'         — streak harian (5 × streak_count pts)
  -- 'forum_post'         — membuat thread/reply (5 pts)
  -- 'solution_marked'    — reply ditandai solusi (50 pts)
  -- 'course_complete'    — menyelesaikan kursus (100 pts)
  -- 'video_watch'        — menonton video >80% (3 pts)
  -- 'early_bird'         — login sebelum jam 7 pagi (10 pts)
  -- 'homework_submit'    — mengumpulkan PR tepat waktu (15 pts)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gamification_user ON gamification_points (tenant_id, user_id, created_at DESC);

CREATE TABLE gamification_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  badge_id VARCHAR(50) NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id, badge_id)
);

CREATE TABLE gamification_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE TABLE gamification_leaderboard_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  period VARCHAR(20) NOT NULL,           -- 'weekly', 'monthly', 'alltime'
  scope VARCHAR(20) NOT NULL,            -- 'global', 'course', 'class'
  scope_id UUID,                         -- course_id or class_id
  rankings JSONB NOT NULL,               -- [{rank, userId, name, points}]
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, period, scope, scope_id)
);
```

### 4.2.3 Points System

```typescript
// ============================================================
// POINTS SYSTEM — Award & redemption logic
// ============================================================

type PointSource =
  | 'quiz_complete'
  | 'perfect_score'
  | 'streak_day'
  | 'forum_post'
  | 'solution_marked'
  | 'course_complete'
  | 'video_watch'
  | 'early_bird'
  | 'homework_submit'

const POINT_VALUES: Record<PointSource, number | ((ctx: PointContext) => number)> = {
  quiz_complete: 10,
  perfect_score: 25,           // bonus on top of quiz_complete
  streak_day: (ctx) => 5 * (ctx.streakCount ?? 1),
  forum_post: 5,
  solution_marked: 50,
  course_complete: 100,
  video_watch: 3,
  early_bird: 10,
  homework_submit: 15,
}

interface PointContext {
  streakCount?: number
  metadata?: Record<string, unknown>
}

export async function awardPoints(
  userId: string,
  tenantId: string,
  source: PointSource,
  context?: PointContext,
): Promise<void> {
  const value = typeof POINT_VALUES[source] === 'function'
    ? (POINT_VALUES[source] as (ctx: PointContext) => number)(context ?? {})
    : (POINT_VALUES[source] as number)

  await db.insert(gamificationPoints).values({
    tenantId,
    userId,
    points: value,
    source,
    metadata: context?.metadata ?? {},
  })

  // Check if new badges should be awarded
  await checkBadgeAwards(userId, tenantId, source)
}

export async function getUserTotalPoints(
  userId: string,
  tenantId: string,
): Promise<number> {
  const result = await db
    .select({ total: sum(gamificationPoints.points) })
    .from(gamificationPoints)
    .where(and(
      eq(gamificationPoints.userId, userId),
      eq(gamificationPoints.tenantId, tenantId),
    ))

  return result[0]?.total ?? 0
}

export async function getUserPointsBreakdown(
  userId: string,
  tenantId: string,
): Promise<{ source: string; total: number; count: number }[]> {
  return db
    .select({
      source: gamificationPoints.source,
      total: sum(gamificationPoints.points),
      count: count(),
    })
    .from(gamificationPoints)
    .where(and(
      eq(gamificationPoints.userId, userId),
      eq(gamificationPoints.tenantId, tenantId),
    ))
    .groupBy(gamificationPoints.source)
    .orderBy(desc(sql`sum(points)`))
}
```

### 4.2.4 Badge Definitions

```typescript
// ============================================================
// BADGES — Definition & award logic
// ============================================================

interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string          // emoji or icon name
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  criteria: (userId: string, tenantId: string) => Promise<boolean>
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_quiz',
    name: 'Pertama Kali',
    description: 'Menyelesaikan kuis pertama',
    icon: '🎯',
    rarity: 'common',
    criteria: async (userId, tenantId) => {
      const count = await countUserQuizzes(userId, tenantId)
      return count >= 1
    },
  },
  {
    id: 'streak_7',
    name: 'Semangat 7 Hari',
    description: 'Login 7 hari berturut-turut',
    icon: '🔥',
    rarity: 'rare',
    criteria: async (userId, tenantId) => {
      const streak = await getStreak(userId, tenantId)
      return streak.currentStreak >= 7
    },
  },
  {
    id: 'streak_30',
    name: 'Se Bulkán',
    description: 'Login 30 hari berturut-turut',
    icon: '💪',
    rarity: 'epic',
    criteria: async (userId, tenantId) => {
      const streak = await getStreak(userId, tenantId)
      return streak.currentStreak >= 30
    },
  },
  {
    id: 'top_performer',
    name: 'Juara Kelas',
    description: 'Masuk 3 besar leaderboard mingguan',
    icon: '🏆',
    rarity: 'epic',
    criteria: async (userId, tenantId) => {
      const rank = await getUserWeeklyRank(userId, tenantId)
      return rank !== null && rank <= 3
    },
  },
  {
    id: 'helpful_member',
    name: 'Sahabat Semua',
    description: 'Punya 5 reply yang ditandai sebagai solusi',
    icon: '🤝',
    rarity: 'epic',
    criteria: async (userId, tenantId) => {
      const count = await countUserSolutions(userId, tenantId)
      return count >= 5
    },
  },
  {
    id: 'course_complete_3',
    name: 'Pembelajar Sejati',
    description: 'Menyelesaikan 3 kursus',
    icon: '🎓',
    rarity: 'rare',
    criteria: async (userId, tenantId) => {
      const count = await countCompletedCourses(userId, tenantId)
      return count >= 3
    },
  },
  {
    id: 'perfect_score',
    name: 'Sempurna',
    description: 'Mendapat nilai sempurna di kuis mana pun',
    icon: '⭐',
    rarity: 'rare',
    criteria: async (userId, tenantId) => {
      const perfect = await db.query.quizAttempts.findFirst({
        where: and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.percentage, 100),
        ),
      })
      return !!perfect
    },
  },
  {
    id: 'early_adopter',
    name: 'Perintis',
    description: 'Bergabung di bulan pertama platform',
    icon: '🚀',
    rarity: 'legendary',
    criteria: async (userId, tenantId) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      })
      if (!user) return false
      const platformLaunch = new Date('2026-01-01') // adjust per platform
      return user.createdAt < platformLaunch
    },
  },
]

export async function checkBadgeAwards(
  userId: string,
  tenantId: string,
  _source: string,
): Promise<string[]> {
  const existingBadges = await db.query.gamificationBadges.findMany({
    where: and(
      eq(gamificationBadges.userId, userId),
      eq(gamificationBadges.tenantId, tenantId),
    ),
    columns: { badgeId: true },
  })

  const earnedIds = new Set(existingBadges.map((b) => b.badgeId))
  const newBadges: string[] = []

  for (const badge of BADGE_DEFINITIONS) {
    if (earnedIds.has(badge.id)) continue

    const meetsCriteria = await badge.criteria(userId, tenantId)
    if (meetsCriteria) {
      await db.insert(gamificationBadges).values({
        tenantId,
        userId,
        badgeId: badge.id,
      })
      newBadges.push(badge.id)
    }
  }

  return newBadges
}
```

### 4.2.5 Streak System

```typescript
// ============================================================
// STREAK SYSTEM — Daily login tracking
// ============================================================

export async function trackLoginStreak(
  userId: string,
  tenantId: string,
): Promise<StreakResult> {
  const today = new Date().toISOString().split('T')[0]

  const streak = await db.query.gamificationStreaks.findFirst({
    where: and(
      eq(gamificationStreaks.userId, userId),
      eq(gamificationStreaks.tenantId, tenantId),
    ),
  })

  if (!streak) {
    // First time — start streak
    await db.insert(gamificationStreaks).values({
      tenantId,
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
    })

    return { currentStreak: 1, isNew: true }
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (streak.lastActivityDate === today) {
    // Already logged in today — no change
    return { currentStreak: streak.currentStreak, isNew: false }
  }

  if (streak.lastActivityDate === yesterday) {
    // Consecutive day — increment
    const newStreak = streak.currentStreak + 1
    await db.update(gamificationStreaks)
      .set({
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastActivityDate: today,
      })
      .where(and(
        eq(gamificationStreaks.userId, userId),
        eq(gamificationStreaks.tenantId, tenantId),
      ))

    // Award streak points: 5 × streak_count
    await awardPoints(userId, tenantId, 'streak_day', {
      streakCount: newStreak,
    })

    return { currentStreak: newStreak, isNew: true }
  }

  // Streak broken — reset to 1
  await db.update(gamificationStreaks)
    .set({
      currentStreak: 1,
      lastActivityDate: today,
    })
    .where(and(
      eq(gamificationStreaks.userId, userId),
      eq(gamificationStreaks.tenantId, tenantId),
    ))

  return {
    currentStreak: 1,
    isBroken: true,
    longestStreak: streak.longestStreak,
  }
}

interface StreakResult {
  currentStreak: number
  isNew?: boolean
  isBroken?: boolean
  longestStreak?: number
}
```

### 4.2.6 Leaderboard

```typescript
// ============================================================
// LEADERBOARD — Cached rankings
// ============================================================

const LEADERBOARD_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

type LeaderboardPeriod = 'weekly' | 'monthly' | 'alltime'
type LeaderboardScope = 'global' | 'course' | 'class'

export async function getLeaderboard(params: {
  tenantId: string
  period: LeaderboardPeriod
  scope: LeaderboardScope
  scopeId?: string      // course_id or class_id
  limit?: number
}): Promise<LeaderboardEntry[]> {
  const { tenantId, period, scope, scopeId, limit = 100 } = params

  // Check cache
  const cached = await db.query.gamificationLeaderboardCache.findFirst({
    where: and(
      eq(gamificationLeaderboardCache.tenantId, tenantId),
      eq(gamificationLeaderboardCache.period, period),
      eq(gamificationLeaderboardCache.scope, scope),
      scopeId
        ? eq(gamificationLeaderboardCache.scopeId, scopeId)
        : isNull(gamificationLeaderboardCache.scopeId),
    ),
  })

  if (
    cached &&
    Date.now() - cached.calculatedAt.getTime() < LEADERBOARD_CACHE_TTL
  ) {
    return cached.rankings as LeaderboardEntry[]
  }

  // Calculate fresh
  const rankings = await calculateLeaderboard(tenantId, period, scope, scopeId, limit)

  // Update cache (upsert)
  await db
    .insert(gamificationLeaderboardCache)
    .values({
      tenantId,
      period,
      scope,
      scopeId: scopeId ?? null,
      rankings,
    })
    .onConflictDoUpdate({
      target: [
        gamificationLeaderboardCache.tenantId,
        gamificationLeaderboardCache.period,
        gamificationLeaderboardCache.scope,
        gamificationLeaderboardCache.scopeId,
      ],
      set: { rankings, calculatedAt: new Date() },
    })

  return rankings
}

async function calculateLeaderboard(
  tenantId: string,
  period: LeaderboardPeriod,
  scope: LeaderboardScope,
  scopeId?: string,
  limit: number = 100,
): Promise<LeaderboardEntry[]> {
  const dateFilter = getDateFilter(period)

  let pointQuery = db
    .select({
      userId: gamificationPoints.userId,
      totalPoints: sum(gamificationPoints.points),
    })
    .from(gamificationPoints)
    .where(and(
      eq(gamificationPoints.tenantId, tenantId),
      dateFilter ? gte(gamificationPoints.createdAt, dateFilter) : undefined,
    ))
    .groupBy(gamificationPoints.userId)
    .orderBy(desc(sql`sum(points)`))
    .limit(limit)

  // Scope filtering
  if (scope === 'course' && scopeId) {
    pointQuery = db.select({
      userId: gamificationPoints.userId,
      totalPoints: sum(gamificationPoints.points),
    })
    .from(gamificationPoints)
    .innerJoin(
      enrollments,
      and(
        eq(enrollments.userId, gamificationPoints.userId),
        eq(enrollments.courseId, scopeId),
      ),
    )
    .where(
      eq(gamificationPoints.tenantId, tenantId)
    )
    .groupBy(gamificationPoints.userId)
    .orderBy(desc(sql`sum(points)`))
    .limit(limit)
  }

  const results = await pointQuery

  // Fetch user details
  const userIds = results.map((r) => r.userId)
  const users = userIds.length > 0
    ? await db.query.users.findMany({
        where: inArray(users.id, userIds),
        columns: { id: true, name: true, avatarUrl: true },
      })
    : []

  const userMap = new Map(users.map((u) => [u.id, u]))

  return results.map((row, idx) => ({
    rank: idx + 1,
    userId: row.userId,
    name: userMap.get(row.userId)?.name ?? 'Unknown',
    avatarUrl: userMap.get(row.userId)?.avatarUrl ?? null,
    points: Number(row.totalPoints),
  }))
}
```

### 4.2.7 UI Components

```typescript
// ============================================================
// GAMIFICATION UI — React Components
// ============================================================

// ---------- Points display ----------
function PointsDisplay({ points }: { points: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
      <Sparkles className="h-4 w-4 text-amber-500" />
      {points.toLocaleString('id-ID')}
    </div>
  )
}

// ---------- Badge card ----------
function BadgeCard({ badge, earned }: { badge: BadgeDefinition; earned: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all',
        earned
          ? 'border-amber-200 bg-amber-50'
          : 'border-zinc-200 bg-zinc-50 opacity-50 grayscale',
      )}
    >
      <span className="text-4xl">{badge.icon}</span>
      <h4 className="text-sm font-semibold">{badge.name}</h4>
      <p className="text-xs text-muted-foreground">{badge.description}</p>
      {!earned && <Lock className="mt-1 h-4 w-4 text-muted-foreground" />}
    </div>
  )
}

// ---------- Streak display ----------
function StreakDisplay({ streak }: { streak: StreakResult }) {
  const fireEmoji = streak.currentStreak >= 30 ? '🔥' : streak.currentStreak >= 7 ? '💪' : '📅'

  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2">
      <span className="text-2xl">{fireEmoji}</span>
      <div className="text-left">
        <p className="text-lg font-bold leading-none text-orange-700">
          {streak.currentStreak} hari
        </p>
        {streak.longestStreak && (
          <p className="text-xs text-orange-500">
            Terpanjang: {streak.longestStreak} hari
          </p>
        )}
      </div>
    </div>
  )
}

// ---------- Leaderboard table ----------
function LeaderboardTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[]
  currentUserId?: string
}) {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-amber-500'   // gold
    if (rank === 2) return 'text-slate-400'    // silver
    if (rank === 3) return 'text-amber-700'    // bronze
    return 'text-muted-foreground'
  }

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <div className="divide-y rounded-xl border">
      {entries.map((entry) => (
        <div
          key={entry.userId}
          className={cn(
            'flex items-center gap-4 px-4 py-3 transition-colors',
            entry.userId === currentUserId && 'bg-emerald-50',
          )}
        >
          <div className={cn('w-8 text-center text-lg font-bold', getRankStyle(entry.rank))}>
            {getMedal(entry.rank) ?? entry.rank}
          </div>

          <Avatar
            src={entry.avatarUrl}
            alt={entry.name}
            size="sm"
            className="h-8 w-8 rounded-full"
          />

          <div className="flex-1">
            <p className="text-sm font-medium">{entry.name}</p>
            <p className="text-xs text-muted-foreground">
              {entry.points.toLocaleString('id-ID')} poin
            </p>
          </div>

          {entry.userId === currentUserId && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Kamu
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## 4.3 CONTENT MODERATION

### 4.3.1 Kebijakan Konten untuk K-12

Platform pembelajaran untuk siswa SD-SMA memerlukan lapisan keamanan ekstra. Kebijakan ini berlaku untuk SEMUA konten buatan pengguna (forum, komentar, submission tugas, profil).

**Konten yang DILARANG (BLOCK otomatis):**
- Kata kasar, umpatan, bullying
- Konten dewasa, seksual, atau pornografi
- Promosi produk/jasa komersial (spam)
- Informasi pribadi siswa/guru (alamat, nomor HP, dll) — doxing
- Ajakan kekerasan, SARA, radikalisme
- Link mencurigakan atau phishing

**Konten yang DIFLAG (butuh review manual):**
- Diskusi politik yang sensitif
- Keluhan terhadap guru/sekolah
- Informasi kesehatan yang belum diverifikasi
- Bahasa yang agresif tapi tidak melanggar aturan eksplisit

**Konten yang butuh CONSENT orang tua (untuk siswa < 13 tahun):**
- Upload foto dengan wajah siswa lain
- Informasi kesehatan mental
- Posting di forum publik (bukan private class)

### 4.3.2 Moderation Pipeline

```
User submits content
  → Pre-filter: regex blocklist (cepat)
    → MATCH: BLOCKED, return error
    → NO MATCH: lanjut ke AI screening
  → AI screening (Claude/OpenAI)
    → ALLOW: Visible immediately
    → FLAG: Visible to author only, masuk ke moderation queue
    → BLOCK: Rejected with explanation

  → (Optional) Manual review by admin
    → APPROVE: Visible to all
    → REJECT: Removed, author notified
```

### 4.3.3 AI Screening

```typescript
// ============================================================
// AI CONTENT MODERATION — Screening text content
// ============================================================

interface ModerationResult {
  decision: 'ALLOW' | 'FLAG' | 'BLOCK'
  confidence: number
  categories: string[]
  explanation: string
  reviewedBy: 'ai' | 'manual'
  timestamp: string
}

export async function screenTextContent(text: string): Promise<ModerationResult> {
  // Step 1: Fast pre-filter using regex blocklist
  const blocklistHit = BLOCKLIST_PATTERNS.some((pattern) => pattern.test(text))
  if (blocklistHit) {
    return {
      decision: 'BLOCK',
      confidence: 1.0,
      categories: ['blocklist_match'],
      explanation: 'Konten mengandung kata yang dilarang',
      reviewedBy: 'ai',
      timestamp: new Date().toISOString(),
    }
  }

  // Step 2: AI screening
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: `Kamu adalah moderator konten untuk platform pembelajaran siswa SD-SMA di Indonesia.

Analisis teks berikut dan beri keputusan dalam format JSON:
{
  "decision": "ALLOW" | "FLAG" | "BLOCK",
  "categories": ["kategori1", "kategori2"],
  "explanation": "alasan singkat dalam Bahasa Indonesia"
}

Pedoman:
- ALLOW: konten aman, edukatif, sesuai untuk anak-anak
- FLAG: mencurigakan, butuh review manual — misal keluhan terhadap guru, diskusi sensitif
- BLOCK: kata kasar, bullying, konten dewasa, SARA, promosi/spam, doxing, link mencurigakan

JANGAN pernah BLOCK konten akademik yang sah meskipun mengandung kata sulit atau topik sensitif
yang dibahas dalam konteks pembelajaran.`,
    messages: [{ role: 'user', content: text }],
  })

  const result = JSON.parse(response.content[0].text) as {
    decision: string
    categories: string[]
    explanation: string
  }

  return {
    decision: result.decision as 'ALLOW' | 'FLAG' | 'BLOCK',
    confidence: 0.9,
    categories: result.categories,
    explanation: result.explanation,
    reviewedBy: 'ai',
    timestamp: new Date().toISOString(),
  }
}

// ---------- Pre-filter blocklist patterns ----------
const BLOCKLIST_PATTERNS = [
  /\b(anjing|babi|kontol|memek|bangsat|anjir|ngentot|jancok)\b/i,
  /\b(promosi|klik link|daftar sekarang|dijamin kaya)\b/i,
  /https?:\/\/(bit\.ly|tinyurl|shorturl)/i,
  /\b(081\d{8,})\b/,                         // phone numbers
  /\b(Jl\.|Jalan)\s+\w+\s+No\.?\s*\d+/i,    // addresses
]
```

### 4.3.4 Moderation Queue API

```typescript
// ============================================================
// MODERATION QUEUE — Admin endpoints
// ============================================================

// GET /api/admin/moderation — list all flagged content
export async function GET_MOD_QUEUE(req: NextRequest) {
  const session = await requireAdmin()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending'

  const items = await db.query.moderationQueue.findMany({
    where: eq(moderationQueue.status, status),
    orderBy: desc(moderationQueue.createdAt),
    limit: 50,
    with: {
      author: { columns: { id: true, name: true } },
    },
  })

  return NextResponse.json({ data: items })
}

// POST /api/admin/moderation/[id]/review — approve/reject
export async function REVIEW_CONTENT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdmin()
  const { id } = await params
  const body = await req.json()

  const parsed = ReviewSchema.safeParse(body) // { action: 'approve' | 'reject', note?: string }
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const { action, note } = parsed.data
  const queueItem = await db.query.moderationQueue.findFirst({
    where: eq(moderationQueue.id, id),
  })

  if (!queueItem) {
    return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })
  }

  // Update the actual content visibility
  if (action === 'approve') {
    await unhideContent(queueItem.resourceType, queueItem.resourceId)
  } else {
    await deleteContent(queueItem.resourceType, queueItem.resourceId)
  }

  // Update queue item
  await db.update(moderationQueue)
    .set({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: session.userId,
      reviewedAt: new Date(),
      reviewNote: note ?? null,
    })
    .where(eq(moderationQueue.id, id))

  return NextResponse.json({ data: { message: `Konten berhasil di-${action}` } })
}
```

### 4.3.5 User Report System

```sql
CREATE TABLE moderation_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id),
  resource_type VARCHAR(50) NOT NULL,
  -- 'forum_thread', 'forum_reply', 'submission', 'comment', 'profile'
  resource_id UUID NOT NULL,
  reason VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',  -- pending, reviewed, dismissed
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON moderation_reports (status, created_at DESC);
```

```typescript
// POST /api/report — User report endpoint
export async function REPORT_CONTENT(req: NextRequest) {
  const session = await requireSession()
  const body = await req.json()

  const parsed = ReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const { resourceType, resourceId, reason, description } = parsed.data

  // Prevent duplicate reports from same user
  const existing = await db.query.moderationReports.findFirst({
    where: and(
      eq(moderationReports.reporterId, session.userId),
      eq(moderationReports.resourceType, resourceType),
      eq(moderationReports.resourceId, resourceId),
      eq(moderationReports.status, 'pending'),
    ),
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Kamu sudah melaporkan konten ini' },
      { status: 409 },
    )
  }

  await db.insert(moderationReports).values({
    reporterId: session.userId,
    resourceType,
    resourceId,
    reason,
    description: description ?? null,
  })

  return NextResponse.json(
    { data: { message: 'Laporan terkirim. Terima kasih! 🙏' } },
    { status: 201 },
  )
}
```

---

## 4.4 SPACED REPETITION SM-2 ALGORITHM

### 4.4.1 Konsep

Spaced Repetition System (SRS) menggunakan algoritma SM-2 (SuperMemo 2) untuk menjadwalkan review ulang materi secara optimal. Setiap item (soal kuis atau flashcard) dijadwalkan muncul kembali tepat saat siswa hampir lupa — memaksimalkan retensi jangka panjang.

**Cara kerja:**
1. Setelah siswa menjawab soal, kualitas jawaban (0–5) dimasukkan ke SM-2
2. Algoritma menghitung kapan item perlu di-review lagi
3. Item yang mudah → interval panjang. Item yang sulit → interval pendek
4. Setiap review berhasil → interval bertambah secara eksponensial

### 4.4.2 Database Schema

```sql
CREATE TABLE spaced_repetition (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  resource_id UUID NOT NULL,              -- quiz question or flashcard ID
  resource_type VARCHAR(20) NOT NULL,     -- 'question' or 'flashcard'
  easiness DECIMAL(4,2) DEFAULT 2.5,      -- E-factor (min 1.3, max 2.5)
  interval_days INT DEFAULT 1,            -- current interval in days
  repetitions INT DEFAULT 0,              -- number of successful reviews
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id, resource_id, resource_type)
);

CREATE INDEX idx_srs_due ON spaced_repetition (tenant_id, user_id, next_review_at)
  WHERE next_review_at <= NOW();
CREATE INDEX idx_srs_resource ON spaced_repetition (resource_id, resource_type);
```

### 4.4.3 SM-2 Algorithm Implementation

```python
"""
SM-2 Algorithm (SuperMemo 2) untuk spaced repetition.

Quality scale:
  5 = Perfect response — langsung ingat, tanpa ragu
  4 = Correct after hesitation — ingat setelah berpikir sebentar
  3 = Correct with serious difficulty — ingat tapi sulit
  2 = Incorrect; correct answer seemed easy — salah, tapi setelah lihat jawaban "oh iya"
  1 = Incorrect; remembered upon seeing — salah, ingat setelah lihat jawaban
  0 = Complete blackout — tidak ingat sama sekali

Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
"""

from datetime import datetime, timedelta
from typing import TypedDict


class SM2Result(TypedDict):
    easiness: float
    interval_days: int
    repetitions: int
    next_review_at: str  # ISO datetime


def calculate_next_review(
    easiness: float,
    interval: int,
    repetitions: int,
    quality: int,
) -> SM2Result:
    """
    Calculate next review schedule using SM-2 algorithm.

    Args:
        easiness: Current E-factor (min 1.3, starts at 2.5)
        interval: Current interval in days
        repetitions: Number of consecutive successful reviews
        quality: Quality of recall (0-5)

    Returns:
        SM2Result with updated scheduling parameters
    """
    # Validate input
    quality = max(0, min(5, quality))
    easiness = max(1.3, min(2.5, easiness))

    # Update easiness factor (E-factor)
    # Formula: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    new_easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_easiness = max(1.3, new_easiness)

    if quality < 3:
        # Failed recall — reset interval
        new_repetitions = 0
        new_interval = 1
    else:
        # Successful recall — increase interval
        new_repetitions = repetitions + 1

        if new_repetitions == 1:
            new_interval = 1
        elif new_repetitions == 2:
            new_interval = 6
        else:
            # I(n) = I(n-1) * EF
            new_interval = round(interval * new_easiness)

    # Censor interval at reasonable maximum (optional)
    new_interval = min(new_interval, 365)

    next_review = datetime.utcnow() + timedelta(days=new_interval)

    return {
        'easiness': round(new_easiness, 2),
        'interval_days': new_interval,
        'repetitions': new_repetitions,
        'next_review_at': next_review.isoformat() + 'Z',
    }
```

### 4.4.4 TypeScript Implementation

```typescript
// ============================================================
// SM-2 ALGORITHM — TypeScript
// ============================================================

interface SM2Input {
  easiness: number
  intervalDays: number
  repetitions: number
  quality: 0 | 1 | 2 | 3 | 4 | 5
}

interface SM2Output {
  easiness: number
  intervalDays: number
  repetitions: number
  nextReviewAt: Date
}

export function calculateNextReview(input: SM2Input): SM2Output {
  const { easiness, intervalDays, repetitions, quality } = input

  // Clamp values
  const clampedQuality = Math.max(0, Math.min(5, quality))
  const clampedEasiness = Math.max(1.3, Math.min(2.5, easiness))

  // Update E-factor
  const newEasiness = Math.max(
    1.3,
    clampedEasiness + (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02)),
  )

  let newRepetitions: number
  let newInterval: number

  if (clampedQuality < 3) {
    // Failed — reset
    newRepetitions = 0
    newInterval = 1
  } else {
    newRepetitions = repetitions + 1

    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(intervalDays * newEasiness)
    }
  }

  // Cap at 1 year
  newInterval = Math.min(newInterval, 365)

  const nextReviewAt = new Date(Date.now() + newInterval * 86400000)

  return {
    easiness: Math.round(newEasiness * 100) / 100,
    intervalDays: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  }
}
```

### 4.4.5 Review Scheduler

```typescript
// ============================================================
// REVIEW SCHEDULER — API & cron job
// ============================================================

// ---------- Get due items for user ----------
// GET /api/review/due
export async function GET_DUE_REVIEWS(req: NextRequest) {
  const session = await requireSession()
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '20')

  const dueItems = await db.query.spacedRepetition.findMany({
    where: and(
      eq(spacedRepetition.tenantId, session.tenantId),
      eq(spacedRepetition.userId, session.userId),
      lte(spacedRepetition.nextReviewAt, new Date()),
    ),
    orderBy: asc(spacedRepetition.nextReviewAt),
    limit,
  })

  // Fetch related resource content
  const enriched = await enrichWithContent(dueItems)

  return NextResponse.json({
    data: enriched,
    total: dueItems.length,
    hasMore: dueItems.length === limit,
  })
}

// ---------- Submit review result ----------
// POST /api/review/submit
export async function SUBMIT_REVIEW(req: NextRequest) {
  const session = await requireSession()
  const body = await req.json()

  const parsed = ReviewSubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const { resourceId, resourceType, quality } = parsed.data

  // Get current SRS record
  const srs = await db.query.spacedRepetition.findFirst({
    where: and(
      eq(spacedRepetition.userId, session.userId),
      eq(spacedRepetition.resourceId, resourceId),
      eq(spacedRepetition.resourceType, resourceType),
    ),
  })

  let nextReview: SM2Output

  if (!srs) {
    // First review of this resource
    nextReview = calculateNextReview({
      easiness: 2.5,
      intervalDays: 1,
      repetitions: 0,
      quality,
    })

    await db.insert(spacedRepetition).values({
      tenantId: session.tenantId,
      userId: session.userId,
      resourceId,
      resourceType,
      easiness: String(nextReview.easiness),
      intervalDays: nextReview.intervalDays,
      repetitions: nextReview.repetitions,
      nextReviewAt: nextReview.nextReviewAt,
      lastReviewedAt: new Date(),
    })
  } else {
    nextReview = calculateNextReview({
      easiness: Number(srs.easiness),
      intervalDays: srs.intervalDays,
      repetitions: srs.repetitions,
      quality,
    })

    await db.update(spacedRepetition)
      .set({
        easiness: String(nextReview.easiness),
        intervalDays: nextReview.intervalDays,
        repetitions: nextReview.repetitions,
        nextReviewAt: nextReview.nextReviewAt,
        lastReviewedAt: new Date(),
      })
      .where(eq(spacedRepetition.id, srs.id))
  }

  return NextResponse.json({
    data: {
      ...nextReview,
      nextReviewAt: nextReview.nextReviewAt.toISOString(),
    },
  })
}

// ---------- Auto-enroll wrong answers after quiz ----------
export async function enrollWrongAnswersInSRS(
  userId: string,
  tenantId: string,
  quizAttemptId: string,
): Promise<void> {
  const attempt = await db.query.quizAttempts.findFirst({
    where: eq(quizAttempts.id, quizAttemptId),
    with: { answers: true },
  })

  if (!attempt) return

  const wrongAnswers = attempt.answers.filter((a) => !a.isCorrect)

  for (const answer of wrongAnswers) {
    // Check if already enrolled
    const existing = await db.query.spacedRepetition.findFirst({
      where: and(
        eq(spacedRepetition.userId, userId),
        eq(spacedRepetition.resourceId, answer.questionId),
        eq(spacedRepetition.resourceType, 'question'),
      ),
    })

    if (existing) continue

    // Enroll with quality=0 (complete blackout — shortest interval)
    const nextReview = calculateNextReview({
      easiness: 2.5,
      intervalDays: 1,
      repetitions: 0,
      quality: 0,
    })

    await db.insert(spacedRepetition).values({
      tenantId,
      userId,
      resourceId: answer.questionId,
      resourceType: 'question',
      easiness: String(nextReview.easiness),
      intervalDays: nextReview.intervalDays,
      repetitions: nextReview.repetitions,
      nextReviewAt: nextReview.nextReviewAt,
    })
  }
}

// ---------- Daily notification check (cron) ----------
// Runs at 07:00 every day
export async function CHECK_DUE_REVIEWS(): Promise<void> {
  const dueUsers = await db
    .select({
      userId: spacedRepetition.userId,
      tenantId: spacedRepetition.tenantId,
      count: count(),
    })
    .from(spacedRepetition)
    .where(lte(spacedRepetition.nextReviewAt, new Date()))
    .groupBy(spacedRepetition.userId, spacedRepetition.tenantId)
    .having(gt(count(), 0))

  for (const user of dueUsers) {
    await sendReviewNotification({
      userId: user.userId,
      tenantId: user.tenantId,
      dueCount: user.count,
    })
  }
}

async function sendReviewNotification({
  userId,
  tenantId,
  dueCount,
}: {
  userId: string
  tenantId: string
  dueCount: number
}): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true, pushToken: true },
  })

  if (!user) return

  const message = `📚 Kamu punya ${dueCount} kartu untuk di-review hari ini!`

  // Send via configured notification channels
  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: 'Waktunya Review!',
      body: message,
    })
  }

  if (user.pushToken) {
    await sendPushNotification({
      token: user.pushToken,
      title: 'Waktunya Review 📚',
      body: message,
    })
  }
}
```

### 4.4.6 UI Components

```typescript
// ---------- Review Card (flashcard-style) ----------
function ReviewCard({
  item,
  onReview,
}: {
  item: ReviewItem
  onReview: (quality: number) => Promise<void>
}) {
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleQuality = async (q: number) => {
    setLoading(true)
    await onReview(q)
    setFlipped(false)
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Card */}
      <div
        className={cn(
          'min-h-[250px] cursor-pointer rounded-2xl border-2 p-8 transition-all duration-300',
          flipped
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-zinc-200 bg-white hover:border-zinc-300',
        )}
        onClick={() => !loading && setFlipped(!flipped)}
      >
        {!flipped ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="text-sm font-medium text-muted-foreground">Soal</span>
            <p className="text-xl font-semibold">{item.question}</p>
            {item.options && (
              <div className="mt-4 grid w-full gap-2">
                {item.options.map((opt, i) => (
                  <div
                    key={i}
                    className="rounded-lg border px-4 py-2 text-left text-sm"
                  >
                    {opt.key}. {opt.value}
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground">Tap untuk lihat jawaban</p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="text-sm font-medium text-emerald-600">Jawaban</span>
            <p className="text-xl font-semibold text-emerald-900">{item.answer}</p>
            {item.explanation && (
              <p className="mt-2 text-sm text-muted-foreground">{item.explanation}</p>
            )}
          </div>
        )}
      </div>

      {/* Quality buttons — shown after flip */}
      {flipped && !loading && (
        <div className="mt-6">
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            Seberapa baik kamu mengingatnya?
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              { q: 0, label: 'Lupa total', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
              { q: 1, label: 'Salah', color: 'bg-red-50 text-red-600 hover:bg-red-100' },
              { q: 2, label: 'Sulit', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
              { q: 3, label: 'Agak ingat', color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' },
              { q: 4, label: 'Ingat', color: 'bg-lime-50 text-lime-600 hover:bg-lime-100' },
              { q: 5, label: 'Sempurna!', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
            ].map(({ q, label, color }) => (
              <button
                key={q}
                onClick={() => handleQuality(q)}
                className={cn(
                  'rounded-xl px-3 py-3 text-xs font-semibold transition-all sm:text-sm',
                  color,
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      )}
    </div>
  )
}

// ---------- Due items summary ----------
function ReviewSummary({ dueCount, streak }: { dueCount: number; streak: number }) {
  if (dueCount === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <span className="text-4xl">🎉</span>
        <h3 className="mt-2 text-lg font-semibold text-emerald-800">
          Semua selesai!
        </h3>
        <p className="mt-1 text-sm text-emerald-600">
          Tidak ada review yang tertunda. Kamu hebat!
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-amber-900">
            📚 Review hari ini
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            Kamu punya <span className="font-bold">{dueCount} kartu</span> untuk di-review
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-amber-600">Streak</p>
          <p className="text-2xl font-bold text-amber-800">{streak} 🔥</p>
        </div>
      </div>
    </div>
  )
}
```

### 4.4.7 Integration with Quiz System

Setelah siswa menyelesaikan kuis, sistem secara otomatis:

1. **Mendaftarkan semua jawaban salah** ke SRS dengan interval 1 hari (review besok)
2. **Mendaftarkan jawaban benar dengan kualitas 4** (interval 1 hari, lalu 6 hari jika benar lagi)
3. **Siswa melihat badge "🧠 Review"** di dashboard untuk soal yang perlu diulang

```typescript
// Hook dalam quiz completion flow
export async function onQuizComplete(attemptId: string): Promise<void> {
  const attempt = await db.query.quizAttempts.findFirst({
    where: eq(quizAttempts.id, attemptId),
    with: { answers: true },
  })

  if (!attempt) return

  // Auto-enroll wrong answers in SRS
  await enrollWrongAnswersInSRS(attempt.userId, attempt.tenantId, attemptId)

  // Award quiz points
  await awardPoints(attempt.userId, attempt.tenantId, 'quiz_complete')

  if (attempt.percentage === 100) {
    await awardPoints(attempt.userId, attempt.tenantId, 'perfect_score')
  }
}
```

---

## DAFTAR ISI (Table of Contents)

1. Filosofi Inti
2. Aturan Global
3. Fase 0 — Product Context
4. Arsitektur Referensi (dari Riset 7+ Platform)
5. Stack-Fitur Matriks
6. AI & Adaptive Learning
7. Video Delivery
8. Multi-Tenancy
9. Assessment Engine
10. Content Authoring
11. Communication System
12. Certificate Engine
13. Integration Hub (LTI 1.3 + Webhook)
14. Mobile Architecture
15. Security (OWASP Top 10)
16. Data Privacy (PDPA + GDPR)
17. Disaster Recovery
18. Incident Response
19. Testing Strategy
20. CI/CD Pipeline
21. Payment Integration Indonesia
22. Learning Analytics Engine
23. Database Migration & Seeding
24. Error Monitoring (Sentry)
25. Accessibility Testing (axe-core)
26. Notification System
27. Rate Limiting
28. RLS PostgreSQL Policy
29. Search Implementation
30. Forum / Discussion System
31. Gamification
32. Content Moderation
33. Spaced Repetition SM-2
34. React Native Implementation
35. LTI Tool Provider
36. Complete Initial Migration SQL
37. Disaster Recovery Runbook
38. Production Monitoring
39. Cost Modeling
40. Team Scaling
41. Business / Monetization
42. Accessibility (WCAG 2.1 AA)
43. Localization (i18n)
44. Expanded Code Examples
45. Diagnostic Security Audit

---

## 34. REACT NATIVE IMPLEMENTATION

### Keputusan Arsitektur: React Native vs Flutter

Untuk project e-learning dengan Next.js web yang sudah ada, React Native dipilih karena:

| Faktor | React Native | Flutter |
|--------|-------------|---------|
| Shared code dengan web | ✅ TypeScript + hooks bisa dipakai bersama | ❌ Dart — tumpukan terpisah total |
| Learning curve tim | ✅ Tim sudah kuasai React/Next.js | ❌ Harus belajar Dart + Flutter SDK |
| Routing mental model | ✅ Expo Router (file-based) mirip App Router | ❌ Navigator 2.0 manual |
| Native modules | ✅ Expo SDK 200+ modul siap pakai | ✅ Pub.dev mature |
| Performance | ⚠️ Bridge (JSI di New Arch) | ✅ Skia engine langsung |

**Strategi monorepo:**
```
packages/
  shared/              # Bisa dipakai web + mobile
    hooks/
    types/
    utils/
    validation/        # Zod schemas
  web/                 # Next.js (existing)
  mobile/              # React Native (Expo)
```

### Struktur Project Mobile

```
mobile/
├── app/                    # Expo Router (file-based routing, rilis Expo SDK 50+)
│   ├── (auth)/
│   │   ├── login.tsx        # Form login + Google OAuth
│   │   └── register.tsx     # Registrasi dengan verifikasi WA
│   ├── (tabs)/
│   │   ├── index.tsx        # Dashboard — progress, streak, rekomendasi
│   │   ├── courses.tsx      # Daftar course dengan filter kelas
│   │   ├── quiz.tsx         # Quiz — ambil dari bank soal
│   │   └── forum.tsx        # Diskusi per course
│   ├── course/
│   │   └── [id].tsx         # Detail course + materi + video
│   └── _layout.tsx          # Root layout (auth guard, navigasi)
├── components/
│   ├── VideoPlayer.tsx      # expo-av wrapper + offline + resume
│   ├── QuizQuestion.tsx     # Pilihan ganda, drag-and-drop, true/false
│   ├── CourseCard.tsx       # Card course dengan progress bar
│   ├── ForumThread.tsx      # Thread diskusi dengan reply tree
│   └── StreakBadge.tsx      # Badge streak harian
├── hooks/
│   ├── useAuth.ts           # Auth state + token management + refresh
│   ├── useOffline.ts        # Queue aksi offline → sync saat online
│   └── useNotifications.ts  # Expo Notifications + deep link handler
├── lib/
│   ├── api.ts               # Axios instance dengan interceptors
│   └── storage.ts           # AsyncStorage wrapper (encrypted untuk token)
├── app.json                 # Expo config (scheme, icons, plugins)
└── eas.json                 # EAS Build config
```

### Shared Hooks — Monorepo Pattern

```typescript
// packages/shared/hooks/useQuiz.ts
// Satu source of truth untuk web (Next.js) dan mobile (React Native)

import useSWR from 'swr'
import type { Quiz, QuizSubmission, QuizResult } from '../types/quiz'

interface UseQuizReturn {
  quiz: Quiz | undefined
  error: Error | undefined
  isLoading: boolean
  submitAnswer: (answer: QuizSubmission) => Promise<QuizResult>
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useQuiz(quizId: string): UseQuizReturn {
  const { data, error, isLoading } = useSWR<Quiz>(
    `/api/quiz/${quizId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
      dedupingInterval: 60_000,
    }
  )

  const submitAnswer = async (answer: QuizSubmission): Promise<QuizResult> => {
    const res = await fetch(`/api/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answer),
    })
    if (!res.ok) throw new Error('Gagal mengirim jawaban')
    return res.json()
  }

  return { quiz: data, error, isLoading, submitAnswer }
}
```

```typescript
// packages/shared/types/quiz.ts
// Tipe dibagi — Zod schemas untuk validasi di kedua platform

import { z } from 'zod'

export const QuizSubmissionSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    selectedOption: z.number().min(0).max(4),
    timeSpent: z.number().positive(), // ms
  })),
})

export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>

export interface QuizResult {
  score: number
  total: number
  percentage: number
  passed: boolean
  answers: Array<{
    questionId: string
    correct: boolean
    explanation?: string
  }>
}
```

### Video Player — Offline + Resume

```typescript
// mobile/components/VideoPlayer.tsx
import { Video, ResizeMode, type AVPlaybackStatus } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface VideoPlayerProps {
  uri: string              // URL video dari CDN
  title: string            // Judul untuk tracking progress
  lessonId: string         // ID lesson di database
}

export function VideoPlayer({ uri, title, lessonId }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null)
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [localUri, setLocalUri] = useState<string | null>(null)

  const PROGRESS_KEY = `video_progress_${lessonId}`
  const LOCAL_FILE_KEY = `video_local_${lessonId}`

  // Cek file lokal saat mount
  useEffect(() => {
    ;(async () => {
      const saved = await AsyncStorage.getItem(LOCAL_FILE_KEY)
      if (saved) {
        const exists = await FileSystem.getInfoAsync(saved)
        if (exists.exists) {
          setLocalUri(saved)
          setIsDownloaded(true)
        }
      }
    })()
  }, [lessonId])

  // Resume dari posisi terakhir
  useEffect(() => {
    ;(async () => {
      const progress = await AsyncStorage.getItem(PROGRESS_KEY)
      if (progress && videoRef.current) {
        const pos = parseInt(progress, 10)
        if (pos > 5_000) { // skip kalau < 5 detik
          videoRef.current.playFromPositionAsync(pos)
        }
      }
    })()
  }, [localUri])

  const handlePlaybackUpdate = useCallback((s: AVPlaybackStatus) => {
    setStatus(s)
    if (!s.isLoaded) return

    // Simpan progress setiap 15 detik
    const pos = s.positionMillis
    if (pos % 15_000 < 1_000) {
      AsyncStorage.setItem(PROGRESS_KEY, String(pos))
    }

    // Kirim progress ke server (debounced)
    if (pos % 30_000 < 1_000) {
      fetch('/api/progress/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, position: pos, completed: s.didJustFinish }),
      })
    }
  }, [lessonId])

  const handleDownload = async () => {
    const fileUri = `${FileSystem.documentDirectory}videos/${lessonId}.mp4`
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}videos/`,
      { intermediates: true }
    )
    const download = FileSystem.createDownloadResumable(uri, fileUri)
    const result = await download.downloadAsync()
    if (result) {
      setLocalUri(result.uri)
      setIsDownloaded(true)
      await AsyncStorage.setItem(LOCAL_FILE_KEY, result.uri)
    }
  }

  const handleDeleteOffline = async () => {
    if (localUri) {
      await FileSystem.deleteAsync(localUri)
      setLocalUri(null)
      setIsDownloaded(false)
      await AsyncStorage.multiRemove([LOCAL_FILE_KEY, PROGRESS_KEY])
    }
  }

  return (
    <View className="rounded-2xl overflow-hidden bg-black">
      <Video
        ref={videoRef}
        source={{ uri: localUri ?? uri }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={handlePlaybackUpdate}
        progressUpdateIntervalMillis={1_000}
      />
      <View className="flex-row justify-between items-center px-4 py-2 bg-gray-900">
        <Text className="text-white text-sm font-inter">
          {status?.isLoaded
            ? `${Math.floor(status.positionMillis / 60_000)}:${String(
                Math.floor((status.positionMillis % 60_000) / 1_000)
              ).padStart(2, '0')} / ${Math.floor(
                (status.durationMillis ?? 0) / 60_000
              )}:${String(
                Math.floor(((status.durationMillis ?? 0) % 60_000) / 1_000)
              ).padStart(2, '0')}`
            : 'Memuat...'}
        </Text>
        <TouchableOpacity
          onPress={isDownloaded ? handleDeleteOffline : handleDownload}
          className="bg-primary px-3 py-1 rounded-full"
        >
          <Text className="text-white text-xs">
            {isDownloaded ? 'Hapus Offline' : 'Simpan Offline'}
          </Text>
        </TouchableOpacity>
      </View>
      {isDownloaded && (
        <View className="bg-green-600 px-4 py-1">
          <Text className="text-white text-xs">✓ Tersedia offline</Text>
        </View>
      )}
    </View>
  )
}
```

### Deep Link Handling

Expo Router sudah support file-based routing + deep link secara native:

```typescript
// mobile/app/_layout.tsx
// Root layout dengan deep link handler + auth guard

import { Stack } from 'expo-router'
import * as Linking from 'expo-linking'
import { useNotifications } from '../hooks/useNotifications'

const prefix = Linking.createURL('/')

export default function RootLayout() {
  const { expoPushToken, notification } = useNotifications()

  // Handle deep link dari push notification
  useEffect(() => {
    if (!notification?.data) return

    const { screen, params } = notification.data as {
      screen: string
      params?: Record<string, string>
    }

    // Navigasi ke screen yang benar
    // Contoh: { screen: 'course/[id]', params: { id: 'abc-123' } }
    router.push({ pathname: `/${screen}`, params })
  }, [notification])

  return (
    <Stack>
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="course/[id]"
        options={{ title: 'Detail Course', presentation: 'card' }}
      />
    </Stack>
  )
}
```

**Supported link formats:**
| Format | Contoh | Action |
|--------|--------|--------|
| Universal link | `https://akalcenter.my.id/course/abc` | Buka detail course |
| Custom scheme | `akalcenter://course/abc` | Buka detail course |
| Push data | `{ screen: 'quiz', params: { id: 'xyz' } }` | Buka quiz langsung |
| Email deep link | `akalcenter://login?token=reset_123` | Auto-login dari email reset |

### Push Notification Setup

```typescript
// mobile/hooks/useNotifications.ts
import { useState, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { useAuth } from './useAuth'

// Konfigurasi handler notifikasi
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

interface UseNotificationsReturn {
  expoPushToken: string | null
  notification: Notifications.Notification | null
  error: string | null
}

export function useNotifications(): UseNotificationsReturn {
  const { session } = useAuth()
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notifications.Notification | null>(null)
  const [error, setError] = useState<string | null>(null)
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  useEffect(() => {
    // Register push token setelah login
    if (!session) return

    const registerForPush = async () => {
      if (!Device.isDevice) {
        setError('Push notification hanya di perangkat fisik')
        return
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        setError('Izin notifikasi ditolak')
        return
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      })
      setExpoPushToken(token.data)

      // Kirim token ke backend
      await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          pushToken: token.data,
          platform: Platform.OS,
          deviceName: Device.deviceName,
        }),
      })
    }

    registerForPush()

    // Listener: notifikasi diterima saat app foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((n) => {
        setNotification(n)
      })

    // Listener: user tap notifikasi
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data
        // Navigasi berdasarkan data notifikasi
        // Di-handle di _layout.tsx
      })

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [session])

  return { expoPushToken, notification, error }
}
```

---

## 35. LTI TOOL PROVIDER (LMS Integration)

LTI 1.3 (Learning Tools Interoperability) memungkinkan platform e-learning dipasang sebagai "tool" di LMS eksternal seperti Moodle, Canvas, atau Google Classroom.

### Arsitektur LTI 1.3

```
LMS (Platform)                          Aplikasi Kita (Tool)
┌─────────────────┐                    ┌────────────────────┐
│ Moodle/Canvas   │                    │ akalcenter.my.id   │
│                 │                    │                    │
│ 1. Admin        │── Dynamic Reg ──→  │ POST /api/lti/     │
│    install tool │   (OpenID Config)  │   register         │
│                 │                    │                    │
│ 2. User clicks  │── OIDC Login  ──→  │ GET /api/lti/      │
│    tool link    │   (auth request)   │   login             │
│                 │                    │                    │
│ 3. Platform     │── ID Token   ───→  │ POST /api/lti/     │
│    sends JWT    │   (LTI Claims)     │   launch            │
│                 │                    │                    │
│ 4. Tool renders │                    │ Render course       │
│    in iframe    │                    │ content di iframe   │
└─────────────────┘                    └────────────────────┘
```

### Dynamic Registration Endpoint

```typescript
// app/api/lti/register/route.ts
// LTI 1.3 Tool Provider Registration — dipasang di Moodle/Canvas/Google Classroom

import { NextRequest, NextResponse } from 'next/server'
import { exportSPKI, exportPKCS8, generateKeyPair } from 'jose'

interface OpenIdConfig {
  issuer: string
  token_endpoint: string
  authorization_endpoint: string
  jwks_uri: string
  registration_endpoint: string
}

interface RegistrationRequest {
  openid_configuration: string
  registration_token?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: RegistrationRequest = await req.json()

    // 1. Fetch OpenID Configuration dari platform
    const configResp = await fetch(body.openid_configuration)
    if (!configResp.ok) {
      return NextResponse.json(
        { error: 'Gagal fetch OpenID configuration dari platform' },
        { status: 400 }
      )
    }
    const config: OpenIdConfig = await configResp.json()

    // 2. Generate RSA key pair untuk sign/verify JWTs
    //    Tool butuh private key untuk sign requests ke platform
    const { publicKey, privateKey } = await generateKeyPair('RS256', {
      modulusLength: 2048,
    })

    const publicKeyJwk = await exportSPKI(publicKey)
    const privateKeyPem = await exportPKCS8(privateKey)

    // 3. Simpan registration ke database
    //    privateKey dienkripsi at rest (AES-256-GCM)

    const { default: db } = await import('@/lib/db')
    await db.ltiRegistrations.create({
      data: {
        issuer: config.issuer,
        clientId: body.registration_token ?? crypto.randomUUID(),
        authTokenUrl: config.token_endpoint,
        authLoginUrl: config.authorization_endpoint,
        keySetUrl: config.jwks_uri,
        deploymentId: crypto.randomUUID(),
        privateKey: privateKeyPem, // encrypt at rest
        publicKey: publicKeyJwk,
        platformConfig: JSON.stringify(config),
      },
    })

    // 4. Response registration — LTI 1.3 spec
    return NextResponse.json(
      {
        application_type: 'web',
        response_types: ['id_token'],
        grant_types: ['implicit', 'client_credentials'],
        initiate_login_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/lti/login`,
        redirect_uris: [`${process.env.NEXT_PUBLIC_APP_URL}/api/lti/launch`],
        jwks_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/lti/jwks`,
        token_endpoint_auth_method: 'private_key_jwt',
        logo_uri: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        client_name: 'AKAL Center — Deep Learning Akidah Akhlak',
        policy_uri: `${process.env.NEXT_PUBLIC_APP_URL}/kebijakan`,
        tos_uri: `${process.env.NEXT_PUBLIC_APP_URL}/syarat-ketentuan`,
        scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score',
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('LTI registration error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### LTI Launch Endpoint

```typescript
// app/api/lti/launch/route.ts
// Endpoint untuk menerima LTI Launch setelah OIDC flow

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, createRemoteJWKSet } from 'jose'

interface LtiClaims {
  sub: string
  email?: string
  name?: string
  'https://purl.imsglobal.org/spec/lti/claim/roles'?: string[]
  'https://purl.imsglobal.org/spec/lti/claim/custom'?: Record<string, string>
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id'?: string
  'https://purl.imsglobal.org/spec/lti/claim/resource_link'?: {
    id: string
    title?: string
  }
  'https://purl.imsglobal.org/spec/lti/claim/context'?: {
    id: string
    label?: string
    title?: string
    type?: string[]
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const idToken = formData.get('id_token') as string | null
    const state = formData.get('state') as string | null

    if (!idToken) {
      return NextResponse.json({ error: 'Missing id_token' }, { status: 400 })
    }

    // 1. Decode header untuk dapat kid dan issuer
    const header = JSON.parse(
      Buffer.from(idToken.split('.')[0], 'base64url').toString()
    )

    // 2. Cari registration berdasarkan kid/issuer di database
    const { default: db } = await import('@/lib/db')
    const registration = await db.ltiRegistrations.findUnique({
      where: { issuer: header.iss },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'LTI registration tidak ditemukan. Install tool dari LMS dulu.' },
        { status: 401 }
      )
    }

    // 3. Verifikasi JWT signature pakai JWKS dari platform
    const JWKS = createRemoteJWKSet(new URL(registration.keySetUrl))
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: registration.issuer,
      audience: registration.clientId,
    })

    const ltiClaims = payload as unknown as LtiClaims

    // 4. Extract LTI claims
    const userEmail = ltiClaims.email
    const userName = ltiClaims.name
    const userRoles = ltiClaims['https://purl.imsglobal.org/spec/lti/claim/roles'] ?? []
    const courseContext = ltiClaims['https://purl.imsglobal.org/spec/lti/claim/context']
    const resourceLink = ltiClaims['https://purl.imsglobal.org/spec/lti/claim/resource_link']
    const deploymentId = ltiClaims['https://purl.imsglobal.org/spec/lti/claim/deployment_id']

    // 5. Auto-create atau link user
    const role = userRoles.includes('http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator')
      ? 'ADMIN'
      : userRoles.includes('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')
      ? 'GURU'
      : 'SISWA'

    const user = await db.user.upsert({
      where: { email: userEmail ?? '' },
      update: { lastLogin: new Date() },
      create: {
        email: userEmail ?? `${ltiClaims.sub}@lti.akalcenter.my.id`,
        name: userName ?? 'User dari LMS',
        role,
        ltiSubject: ltiClaims.sub,
      },
    })

    // 6. Generate session token dan redirect ke halaman course
    const sessionToken = crypto.randomUUID()
    await db.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
      },
    })

    // Redirect ke halaman yang sesuai
    const redirectUrl = resourceLink?.id
      ? `/course/${deploymentId}?lti_session=${sessionToken}`
      : `/dashboard?lti_session=${sessionToken}`

    return NextResponse.redirect(new URL(redirectUrl, req.url))
  } catch (err) {
    console.error('LTI launch error:', err)
    return NextResponse.json({ error: 'LTI launch failed' }, { status: 401 })
  }
}
```

### LTI Placements

| Placement | Deskripsi | Implementasi |
|-----------|-----------|-------------|
| `course_navigation` | Tab di navigation course LMS | Muncul sebagai menu "AKAL Center" di sidebar Moodle/Canvas |
| `assignment_selection` | Guru bisa assignment dari konten kita | Pilih course/module → link assignment grade sync via AGS |
| `link_selection` | Embed konten di halaman LMS | Rich editor plugin untuk embed video/modul interaktif |
| `editor_button` | Tombol embed di rich text editor | Guru bisa embed soal atau video langsung di halaman |

**Grade sync (Assignment and Grade Service — AGS):**
```typescript
// POST /api/lti/ags — Kirim nilai ke LMS
export async function syncGradeToLms(
  registration: LtiRegistration,
  userId: string,
  score: number,
  maxScore: number
) {
  const token = await getLtiAccessToken(registration)
  const lineItemUrl = `${registration.issuer}/api/lti/ags/${registration.deploymentId}/lineitems`

  await fetch(lineItemUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.ims.lis.v2.lineitem+json',
    },
    body: JSON.stringify({
      scoreGiven: score,
      scoreMaximum: maxScore,
      userId,
      timestamp: new Date().toISOString(),
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded',
    }),
  })
}
```

---

## 36. COMPLETE INITIAL MIGRATION SQL

Satu file migrasi yang membuat database dari nol — dependency order, FK, indexes, RLS, triggers.

```sql
-- 0000_initial.sql
-- Initial database schema untuk platform e-learning multi-tenant
-- Jalankan: psql -U postgres -d akal_center -f 0000_initial.sql

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- untuk GIN index
CREATE EXTENSION IF NOT EXISTS "pg_partman";        -- untuk partitioning otomatis

-- ============================================================
-- 2. ENUM TYPES
-- ============================================================
CREATE TYPE user_role AS ENUM ('superadmin', 'admin_sekolah', 'guru', 'siswa', 'wali');
CREATE TYPE content_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE quiz_type AS ENUM ('latihan', 'ulangan_harian', 'pts', 'pas', 'adaptif');
CREATE TYPE submission_status AS ENUM ('in_progress', 'submitted', 'graded', 'expired');
CREATE TYPE notification_channel AS ENUM ('in_app', 'push', 'whatsapp', 'email');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- ============================================================
-- 3. TENANTS (sekolah-sekolah)
-- ============================================================
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    domain          VARCHAR(255),                    -- subdomain/domain khusus
    logo_url        TEXT,
    config          JSONB DEFAULT '{}'::jsonb,       -- theme, features, LTI config
    max_users       INTEGER NOT NULL DEFAULT 100,
    storage_limit   BIGINT NOT NULL DEFAULT 1073741824, -- 1 GB
    is_active       BOOLEAN NOT NULL DEFAULT true,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);

-- ============================================================
-- 4. USERS & PROFILES
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    password_hash   VARCHAR(255),
    role            user_role NOT NULL DEFAULT 'siswa',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    email_verified  BOOLEAN NOT NULL DEFAULT false,
    phone_verified  BOOLEAN NOT NULL DEFAULT false,
    last_login      TIMESTAMPTZ,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_tenant_active ON users(tenant_id, is_active) WHERE is_active = true;

CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(255) NOT NULL,
    nickname        VARCHAR(100),
    avatar_url      TEXT,
    birth_date      DATE,
    birth_place     VARCHAR(100),
    nisn            VARCHAR(20),                    -- Nomor Induk Siswa Nasional
    nuptk           VARCHAR(30),                    -- untuk guru
    address         TEXT,
    kelas           VARCHAR(10),                    -- 7, 8, 9 atau 'guru', 'admin'
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_nisn ON profiles(nisn);
CREATE INDEX idx_profiles_kelas ON profiles(kelas);

-- ============================================================
-- 5. COURSES, MODULES, LESSONS
-- ============================================================
CREATE TABLE courses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    description     TEXT,
    cover_url       TEXT,
    kelas           VARCHAR(10),                    -- 7/8/9 atau 'umum'
    bab             INTEGER,                        -- urutan bab
    bab_label       VARCHAR(20),                    -- AKIDAH / AKHLAK
    status          content_status NOT NULL DEFAULT 'draft',
    published_at    TIMESTAMPTZ,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_courses_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_courses_tenant_status ON courses(tenant_id, status);
CREATE INDEX idx_courses_kelas ON courses(kelas);
CREATE INDEX idx_courses_tenant_kelas ON courses(tenant_id, kelas, bab);

CREATE TABLE modules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    status          content_status NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_course ON modules(course_id, sort_order);

CREATE TABLE lessons (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id       UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content_type    VARCHAR(50) NOT NULL DEFAULT 'article',  -- article, video, quiz, embed
    content         TEXT,                           -- HTML/Markdown content
    video_url       TEXT,
    video_duration  INTEGER,                        -- detik
    pdf_url         TEXT,
    duration_minutes INTEGER DEFAULT 5,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    status          content_status NOT NULL DEFAULT 'draft',
    is_free         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_module ON lessons(module_id, sort_order);
CREATE INDEX idx_lessons_free ON lessons(is_free) WHERE is_free = true;

-- ============================================================
-- 6. ENROLLMENTS
-- ============================================================
CREATE TABLE enrollments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    progress        REAL NOT NULL DEFAULT 0,         -- 0.0 - 1.0
    last_accessed   TIMESTAMPTZ DEFAULT NOW(),
    is_active       BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT uq_enrollment UNIQUE (user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_active ON enrollments(user_id, is_active)
    WHERE is_active = true;

-- ============================================================
-- 7. QUESTIONS & QUIZZES
-- ============================================================
CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    course_id       UUID REFERENCES courses(id) ON DELETE SET NULL,
    question_text   TEXT NOT NULL,
    options         JSONB NOT NULL,                  -- [{text, isCorrect}]
    explanation     TEXT,                            -- penjelasan jawaban
    difficulty      INTEGER NOT NULL DEFAULT 1,      -- 1-5
    tags            TEXT[] DEFAULT '{}',
    points          INTEGER NOT NULL DEFAULT 1,
    time_limit_sec  INTEGER DEFAULT 72,             -- 72 detik per soal
    status          content_status NOT NULL DEFAULT 'draft',
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_tenant ON questions(tenant_id);
CREATE INDEX idx_questions_course ON questions(course_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);

CREATE TABLE quizzes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    quiz_type       quiz_type NOT NULL DEFAULT 'latihan',
    time_limit_min  INTEGER,                        -- null = unlimited
    passing_score   INTEGER NOT NULL DEFAULT 70,     -- persentase
    max_attempts    INTEGER DEFAULT 3,
    shuffle_options BOOLEAN NOT NULL DEFAULT true,
    shuffle_questions BOOLEAN NOT NULL DEFAULT true,
    show_result     BOOLEAN NOT NULL DEFAULT true,
    status          content_status NOT NULL DEFAULT 'draft',
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quizzes_tenant ON quizzes(tenant_id);
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quizzes_type ON quizzes(quiz_type);

-- Bridge: quizzes <-> questions (many-to-many dengan order)
CREATE TABLE quiz_questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    points          INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT uq_quiz_question UNIQUE (quiz_id, question_id)
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id, sort_order);

-- ============================================================
-- 8. SUBMISSIONS
-- ============================================================
CREATE TABLE submissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    status          submission_status NOT NULL DEFAULT 'in_progress',
    answers         JSONB,                          -- [{questionId, selectedOption, timeSpent}]
    score           INTEGER,
    total           INTEGER,
    percentage      REAL,
    passed          BOOLEAN,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at    TIMESTAMPTZ,
    graded_at       TIMESTAMPTZ,
    graded_by       UUID REFERENCES users(id),
    attempt_number  INTEGER NOT NULL DEFAULT 1,
    metadata        JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT uq_user_quiz_attempt UNIQUE (user_id, quiz_id, attempt_number)
);

CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_quiz ON submissions(quiz_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_user_recent ON submissions(user_id, submitted_at DESC);

-- ============================================================
-- 9. FORUM / DISCUSSION
-- ============================================================
CREATE TABLE forum_threads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    course_id       UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id       UUID REFERENCES lessons(id) ON DELETE SET NULL,
    author_id       UUID NOT NULL REFERENCES users(id),
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    is_pinned       BOOLEAN NOT NULL DEFAULT false,
    is_locked       BOOLEAN NOT NULL DEFAULT false,
    reply_count     INTEGER NOT NULL DEFAULT 0,
    view_count      INTEGER NOT NULL DEFAULT 0,
    last_activity   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          moderation_status NOT NULL DEFAULT 'approved',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_forum_threads_course ON forum_threads(course_id, last_activity DESC);
CREATE INDEX idx_forum_threads_tenant ON forum_threads(tenant_id);
CREATE INDEX idx_forum_threads_status ON forum_threads(status);
CREATE INDEX idx_forum_threads_pinned ON forum_threads(is_pinned) WHERE is_pinned = true;
-- Full text search
CREATE INDEX idx_forum_threads_search ON forum_threads
    USING GIN(to_tsvector('indonesian', title || ' ' || content));

CREATE TABLE forum_replies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id       UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id),
    content         TEXT NOT NULL,
    is_solution     BOOLEAN NOT NULL DEFAULT false,
    upvotes         INTEGER NOT NULL DEFAULT 0,
    status          moderation_status NOT NULL DEFAULT 'approved',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id, created_at);
CREATE INDEX idx_forum_replies_solution ON forum_replies(thread_id) WHERE is_solution = true;

-- ============================================================
-- 10. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel         notification_channel NOT NULL DEFAULT 'in_app',
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    data            JSONB DEFAULT '{}'::jsonb,       -- deep link payload
    is_read         BOOLEAN NOT NULL DEFAULT false,
    read_at         TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id)
    WHERE is_read = false;
-- Partition by month untuk performa
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================================
-- 11. GAMIFICATION
-- ============================================================
CREATE TABLE gamification_points (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       UUID REFERENCES courses(id) ON DELETE SET NULL,
    points          INTEGER NOT NULL DEFAULT 0,
    source          VARCHAR(50) NOT NULL,            -- 'quiz', 'streak', 'forum', 'login'
    reference_id    UUID,                            -- ID object terkait
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gamification_points_user ON gamification_points(user_id, created_at DESC);
CREATE INDEX idx_gamification_points_source ON gamification_points(source);

CREATE TABLE gamification_badges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    description     TEXT,
    icon_url        TEXT,
    criteria        JSONB NOT NULL,                  -- {type: 'quiz_perfect', count: 5}
    points_reward   INTEGER NOT NULL DEFAULT 0,
    is_hidden       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_badges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id        UUID NOT NULL REFERENCES gamification_badges(id) ON DELETE CASCADE,
    earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

CREATE TABLE gamification_streaks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak  INTEGER NOT NULL DEFAULT 0,
    longest_streak  INTEGER NOT NULL DEFAULT 0,
    last_activity   DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. SPACED REPETITION (SM-2 Algorithm)
-- ============================================================
CREATE TABLE spaced_repetition (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    easiness_factor REAL NOT NULL DEFAULT 2.5,       -- SM-2 EF
    interval_days   INTEGER NOT NULL DEFAULT 0,
    repetitions     INTEGER NOT NULL DEFAULT 0,
    next_review     DATE NOT NULL DEFAULT CURRENT_DATE,
    last_review     DATE,
    last_quality    INTEGER,                         -- 0-5 SM-2 quality
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_question_sr UNIQUE (user_id, question_id)
);

CREATE INDEX idx_spaced_repetition_review ON spaced_repetition(user_id, next_review)
    WHERE next_review <= CURRENT_DATE;
CREATE INDEX idx_spaced_repetition_user ON spaced_repetition(user_id);

-- ============================================================
-- 13. LEARNING EVENTS (partitioned)
-- ============================================================
CREATE TABLE learning_events (
    id              UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type      VARCHAR(50) NOT NULL,            -- 'video_play', 'quiz_start', 'page_view'
    course_id       UUID REFERENCES courses(id),
    lesson_id       UUID REFERENCES lessons(id),
    metadata        JSONB DEFAULT '{}'::jsonb,       -- {position, duration, etc}
    device_info     JSONB DEFAULT '{}'::jsonb,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Buat partition untuk 3 bulan ke depan
-- Di production: gunakan pg_partman untuk auto-management
CREATE TABLE learning_events_2026_q3 PARTITION OF learning_events
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE learning_events_2026_q4 PARTITION OF learning_events
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');
CREATE TABLE learning_events_default PARTITION OF learning_events
    FOR VALUES FROM ('2027-01-01') TO ('2030-01-01');

CREATE INDEX idx_learning_events_user ON learning_events(user_id, created_at DESC);
CREATE INDEX idx_learning_events_type ON learning_events(event_type);
CREATE INDEX idx_learning_events_course ON learning_events(course_id);

-- ============================================================
-- 14. MODERATION REPORTS
-- ============================================================
CREATE TABLE moderation_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id     UUID NOT NULL REFERENCES users(id),
    target_type     VARCHAR(50) NOT NULL,            -- 'thread', 'reply', 'comment'
    target_id       UUID NOT NULL,
    reason          VARCHAR(255) NOT NULL,
    description     TEXT,
    status          moderation_status NOT NULL DEFAULT 'pending',
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    action_taken    TEXT,                            -- 'warned', 'deleted', 'dismissed'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX idx_moderation_reports_reporter ON moderation_reports(reporter_id);

-- ============================================================
-- 15. TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_modules_updated_at
    BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_lessons_updated_at
    BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_questions_updated_at
    BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_quizzes_updated_at
    BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_forum_threads_updated_at
    BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_forum_replies_updated_at
    BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_moderation_reports_updated_at
    BEFORE UPDATE ON moderation_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_spaced_repetition_updated_at
    BEFORE UPDATE ON spaced_repetition FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_gamification_streaks_updated_at
    BEFORE UPDATE ON gamification_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 16. ROW LEVEL SECURITY (RLS) — Multi-tenant Isolation
-- ============================================================
-- Aktifkan RLS di semua tabel tenant-scoped
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya bisa melihat data tenant-nya sendiri
-- app.current_tenant_id di-set oleh middleware setelah auth
CREATE POLICY tenant_isolation ON users
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON courses
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON forum_threads
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation ON questions
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Policy: siswa hanya bisa melihat submission sendiri
CREATE POLICY user_own_submissions ON submissions
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policy: notifikasi hanya untuk user bersangkutan
CREATE POLICY user_own_notifications ON notifications
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policy: admin/guru bisa lihat semua submission di tenant-nya
CREATE POLICY staff_view_submissions ON submissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = current_setting('app.current_user_id')::UUID
            AND role IN ('superadmin', 'admin_sekolah', 'guru')
        )
    );
```

---

## 37. DISASTER RECOVERY RUNBOOK

Runbook untuk skenario disaster yang paling mungkin terjadi. Setiap skenario mengikuti format: **Detection → Severity → Response Team → Step-by-Step → Verification → Post-Mortem**.

### Scenario 1: Database Down

| Aspek | Detail |
|-------|--------|
| **Detection** | Health check API (`/api/health`) return 503 · PagerDuty alert · Grafana panel merah · App error `connection refused` |
| **Severity** | **P0 (Critical)** — Semua user tidak bisa login, akses materi, submit quiz |
| **Response Team** | Database admin (primary) · On-call engineer (secondary) |
| **RTO Target** | 15 menit |
| **RPO Target** | 5 menit (WAL streaming ke replica) |

**Step-by-step:**

```
STEP 1: DIAGNOSIS (0-2 menit)
  └─ ssh ke database server
  └─ pg_isready -h localhost
      → Jika "no response" → lanjut STEP 2
      → Jika "accepting connections" → cek aplikasi, mungkin bukan DB

STEP 2: CEK PROSES & LOG (2-5 menit)
  └─ systemctl status postgresql-16
  └─ journalctl -u postgresql-16 --since "5 minutes ago" --no-pager
  └─ tail -100 /var/log/postgresql/postgresql-16-main.log
  └─ Cek: apakah PostgreSQL crash (OOM, disk full, atau wal corruption)?

STEP 3: RESTART PRIMARY (5-7 menit)
  └─ systemctl restart postgresql-16
  └─ pg_isready -h localhost → tunggu sampai "accepting connections"
  └─ psql -c "SELECT pg_is_in_recovery()"
      → false = primary aktif
      → true = replica, perlu failover

STEP 4: FAILOVER KE REPLICA (7-10 menit) — jika restart gagal
  └─ ssh ke replica server
  └─ ssh ke replica: sudo -u postgres pg_ctl promote -D /var/lib/postgresql/16/main
  └─ Verifikasi replica sudah jadi primary baru:
      psql -h REPLICA_IP -c "SELECT pg_is_in_recovery()" → harus false
  └─ Update connection string di aplikasi (atau DNS):
      UPDATE dns SET target = 'REPLICA_IP' WHERE name = 'db.akalcenter.my.id'
      — atau update environment variable di Vercel

STEP 5: VERIFIKASI (10-15 menit)
  └─ curl -f https://akalcenter.my.id/api/health → must return 200
  └─ Cek koneksi dari app server: psql -h REPLICA_IP -c "SELECT 1"
  └─ Monitor Grafana: connection pool, query latency, active connections
  └─ Cek manual: login sebagai user test → akses course → submit quiz
```

### Scenario 2: CDN Down

| Aspek | Detail |
|-------|--------|
| **Detection** | Video streaming gagal · Static assets (CSS/JS) 503 · User laporan "gambar tidak muncul" · Grafana bandwidth drop drastis |
| **Severity** | **P1 (High)** — Halaman statis masih bisa diakses, tapi video & gambar broken |
| **Response Team** | Infrastructure engineer |
| **RTO Target** | 5 menit |

**Step-by-step:**
```
STEP 1: CEK CDN STATUS (0-1 menit)
  └─ curl -I https://akalcenter.my.id/_next/static/chunks/main.js
      → cek response header: cf-cache-status, x-served-by
  └─ Cek Cloudflare dashboard: Analytics → Traffic
  └─ Cek apakah CDN down atau origin yang bermasalah:
      curl -H "X-From-Worker: akal-center" https://ahmad-katsiri-agung.vercel.app/api/health

STEP 2: FAILOVER KE SECONDARY CDN (1-3 menit)
  └─ Worker CDN fallback: jika primary CDN timeout > 3 detik,
      langsung ambil dari origin langsung (Vercel)
  └─ Atau: ganti DNS CNAME ke secondary CDN provider
      — sudah siapkan Cloudflare + bunny.net sebagai secondary

STEP 3: PURGE CACHE (3-4 menit)
  └─ Purge selective di Cloudflare dashboard:
      Caching → Configuration → Purge Everything
  └─ Atau via API:
      curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CF_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything": true}'

STEP 4: VERIFIKASI (4-5 menit)
  └─ Buka incognito: https://akalcenter.my.id → semua aset termuat
  └─ Cek DevTools Network tab: status 200 untuk semua file
  └─ Video play test: buka halaman materi → play video → harus jalan
```

### Scenario 3: DDoS Attack

| Aspek | Detail |
|-------|--------|
| **Detection** | Traffic spike > 10x normal · 503 untuk semua user · CPU/bandwidth 100% · WAF alert spike |
| **Severity** | **P0 (Critical)** — Semua user tidak bisa akses |
| **Response Team** | Security engineer + infrastructure team |
| **RTO Target** | 10 menit (mitigasi) |

**Step-by-step:**
```
STEP 1: AKTIFKAN UNDER ATTACK MODE (0-2 menit)
  └─ Cloudflare Dashboard:
      Security → Settings → Security Level → I'm Under Attack
      (ini enable JS challenge untuk semua visitor)
  └─ Atau via API:
      curl -X PATCH "https://api.cloudflare.com/client/v4/zones/ZONE_ID/settings/security_level" \
        -H "Authorization: Bearer $CF_TOKEN" \
        --data '{"value": "under_attack"}'

STEP 2: RATE LIMITING (2-4 menit)
  └─ Aktifkan rate limiting rules yang sudah disiapkan:
      - /api/*: 10 POST / 30 detik per IP
      - /login: 5 attempt / 15 menit per IP
      - Global: 100 request / 10 detik per IP
  └─ Honeypot: deteksi pola bot — block IP dengan user-agent mencurigakan

STEP 3: WAF RULES — BLOCK BY PATTERN (4-6 menit)
  └─ Block IP ranges (cek dari log siapa yang attack):
      curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/firewall/access_rules/rules" \
        -H "Authorization: Bearer $CF_TOKEN" \
        --data '{"mode": "block", "configuration": {"target": "ip_range", "value": "ATTACKER_CIDR"}}'
  └─ Block ASN jika semua traffic dari 1-2 ASN mencurigakan:
      Security → WAF → Tools → IP Access Rules → Block by ASN

STEP 4: SCALE ORIGIN (6-8 menit)
  └─ Jika traffic menembus cache (bypass ke origin):
      - Scale up Vercel: upgrade ke Pro plan sementara ($20/bln)
      - Aktifkan Automatic Scale di Vercel dashboard
      - Tambah replica untuk workload yang tidak bisa di-cache

STEP 5: VERIFIKASI MITIGASI (8-10 menit)
  └─ Normal user dari browser biasa: harus bisa akses dengan JS challenge
  └─ Cek Cloudflare Analytics: traffic dropped, 503 rate turun
  └─ Monitor server: CPU turun ke normal, response time normal
```

### Scenario 4: Data Breach

| Aspek | Detail |
|-------|--------|
| **Detection** | Unusual query patterns (bulk SELECT) · External notification (from researcher/polri) · Audit log anomaly · Unauthorized API access detected |
| **Severity** | **P0 (Critical)** — Potensi data siswa/guru terekspos |
| **Response Team** | Security officer · Legal team · Engineering lead |
| **Deadline Regulasi** | UU PDP: lapor ke subjek data dalam 14 hari · Lapor ke Kominfo dalam 72 jam |

**Step-by-step:**
```
STEP 1: ISOLASI (0-5 menit)
  └─ Revoke all API keys yang mencurigakan:
      vercel env rm JWT_SECRET --yes && vercel env add JWT_SECRET
      (tambah --force untuk overwrite)
  └─ Rotate database credentials:
      psql -c "ALTER USER akal_app WITH PASSWORD 'new_secure_password'"
  └─ Isolate affected server/system (block public access sementara)

STEP 2: CUT OFF ACCESS (5-10 menit)
  └─ Revoke all active sessions:
      psql -c "DELETE FROM sessions WHERE expires_at > NOW()"
  └─ Force logout semua user (invalidate JWT dengan rotate secret)
  └─ Disable compromised API endpoint (return 503 sementara)

STEP 3: FORENSIK (10-60 menit)
  └─ Cek audit log: siapa yang akses data sensitif, dari IP mana, kapan
  └─ Cek database logs:
      cat /var/log/postgresql/postgresql-16-main.log | grep "SELECT\|COPY\|pg_dump"
  └─ Cek Vercel deployment logs: apakah ada deployment mencurigakan?
  └─ Cek Cloudflare audit log: apakah ada perubahan DNS/WAF rules?
  └─ Cek GitHub audit log: siapa yang akses repo, apakah ada key bocor?
  └─ Ambil screenshot semua bukti untuk dokumentasi

STEP 4: NOTIFIKASI (timeline 72 jam untuk Kominfo)
  └─ Dalam 72 jam: lapor ke Kominfo (format: UU PDP Pasal 46)
  └─ Dalam 14 hari: notifikasi ke subjek data
      - Email ke semua user yang datanya terekspos
      - Format: apa data yang bocor, kapan, dampak, apa yang sudah dilakukan,
        langkah mitigasi untuk user (ganti password, dll)

STEP 5: REMEDIASI (1-7 hari)
  └─ Identify root cause: SQL injection? Exposed API? Leaked credentials?
  └─ Fix vulnerability yang menyebabkan breach
  └─ Audit semua akses: API keys, database users, service accounts
  └─ Implement additional security:
      - Database audit logging (pgaudit)
      - API request logging dengan retention 90 hari
      - Monitoring alert untuk bulk data access
  └─ Report post-mortem untuk compliance

POST-BREACH CHECKLIST:
  □ Semua password user di-reset
  □ Semua session token di-revoke
  □ Semua API key di-rotate
  □ Database credential diubah
  □ Forensic analysis selesai
  □ Kominfo notified (dalam 72 jam)
  □ User notified (dalam 14 hari)
  □ Vulnerability patched
  □ Security audit tambahan dijadwalkan
```

---

## 38. INCIDENT RESPONSE PROTOCOL

### Severity Matrix

| Severity | Definisi | Contoh | Response Time | Notify |
|----------|----------|--------|---------------|--------|
| **P0** | Service down untuk semua user · Data breach · Gagal bayar/payment | Database down, DDoS, breach detected | 5 menit | Semua team + pimpinan |
| **P1** | Feature unavailable untuk subset user · Performance deg > 50% | Video player broken, quiz gak bisa submit, halaman lambat | 15 menit | Engineering lead + PM |
| **P2** | Minor feature broken · Cosmetic issues · Single user affected | Salah satu filter tidak jalan, typo di halaman, PDF download error | Next business day | JIRA ticket + standup |
| **P3** | Bug dengan workaround · Enhancement request | Sorting tidak sempurna, tombol perlu 2 klik, low-impact issue | Backlog | JIRA ticket |

### Communication Tree

```
P0 ──→ Semua team (Slack #incident + WhatsApp group)
  ├── Engineer on-call: lead investigation
  ├── Engineering lead: koordinasi fix
  ├── Product manager: komunikasi ke user
  └── Pimpinan (Bang Agung): status update

P1 ──→ Engineering lead + Product manager
  ├── Engineer: debug & fix
  └── PM: update ke user (jika perlu)

P2 ──→ JIRA ticket → Daily standup
P3 ──→ Backlog → Sprint planning
```

### P0 Incident Call Flow

```
─────────────────────────────────────────────────────────────
P0 INCIDENT CALL FLOW
─────────────────────────────────────────────────────────────

T-00:00 — Alert triggered (PagerDuty/Grafana/User report)
  → Engineer on-call acknowledged dalam 5 menit

T-00:05 — Incident declared
  → Post di #incident channel: [P0] Judul Incident
  → Tag @eng-lead @pm-lead
  → Format:
      Judul:      [P0] Database Connection Lost
      Dampak:     Semua user tidak bisa login (estimated 500+ users)
      Waktu:      14:30 WIB
      Engineer:   @eng-oncall
      Status:     Investigating

T-00:15 — Root cause identified
  → Update thread di #incident
  → Format:
      Root Cause: PostgreSQL OOM karena query berat dari report feature
      Fix Plan:   Restart DB + kill query + add resource limit

T-00:30 — Fix deployed
  → Update thread:
      Fix: DB restart + resource limit added
      Status: Monitoring

T-01:00 — All systems verified
  → Update thread:
      Status: Resolved
  → Tutup incident di PagerDuty
  → Schedule post-mortem meeting

─────────────────────────────────────────────────────────────
```

### Post-Mortem Template

```markdown
## Post-Mortem: [Incident Title]
**Date:** [DD MMM YYYY]
**Severity:** P0/P1/P2/P3
**Duration:** [HH:MM] → [HH:MM] ([total duration])
**Detection Method:** PagerDuty / Grafana / User Report / Manual
**Impact:** ~[N] users affected · [feature/service] unavailable for [duration]

### Timeline
- **T-00:00** — Alert triggered: [alert description]
- **T-00:05** — Engineer on-call acknowledged: [initial action]
- **T-00:15** — Root cause identified: [diagnosis]
- **T-00:30** — Fix deployed: [what was changed — PR link]
- **T-01:00** — All systems verified healthy: [monitoring confirmed]
- **T+01:30** — Post-mortem meeting held

### Root Cause
[Technical explanation. Include:
- Exact sequence of events
- Why the system didn't catch/prevent this
- Any contributing factors (code change, config, external dependency)]

### What Went Well
- [Fast detection — alert configured correctly]
- [Clear communication in #incident channel]
- [Rollback was clean — no data loss]

### What Went Wrong
- [Missing test coverage for this edge case]
- [No rate limiting on report generation]
- [Documentation for failover procedure was outdated]

### Action Items
| # | Action | Owner | Deadline | Status |
|---|--------|-------|----------|--------|
| 1 | Add rate limiting to report API | @engineer | [date] | ✅ Done |
| 2 | Add monitoring for memory usage spike | @engineer | [date] | 🔄 In Progress |
| 3 | Update DR runbook with this scenario | @sre | [date] | ⬜ Not Started |
| 4 | Add automated failover test to CI | @devops | [date] | ⬜ Not Started |
```

### Customer Communication Templates

**Template A: Initial Disruption Notice**
```
Kami mendeteksi gangguan pada [nama fitur] dan sedang dalam proses investigasi.
Kami akan memberikan update setiap 30 menit.

Kami mohon maaf atas ketidaknyamanan ini.
— Tim AKAL Center
```
→ Kirim: WhatsApp blast ke guru · Notifikasi in-app · Status page

**Template B: Fix In Progress**
```
Kami telah menemukan penyebab gangguan pada [nama fitur] dan sedang menerapkan perbaikan.
Estimasi selesai dalam [N] menit.

Update selanjutnya: [waktu]
— Tim AKAL Center
```

**Template C: Service Restored**
```
Layanan [nama fitur] telah pulih kembali. Silakan refresh halaman atau login ulang.

Jika masih mengalami kendala, laporkan ke WA 0851-5879-5502.
— Tim AKAL Center
```

**Template D: Data Breach Notification (UU PDP)**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PEMBERITAHUAN PELANGGARAN DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kepada Yth. [Nama User],

Berdasarkan hasil audit keamanan, kami mendeteksi adanya akses tidak sah
pada sistem AKAL Center pada tanggal [DD MMM YYYY].

Data yang terdampak:
□ Nama lengkap
□ Alamat email
□ Kelas
□ [data lain yang terekspos]

□ Data yang TIDAK terdampak (karena dienkripsi):
□ Password (bcrypt hash)
□ Nomor telepon
□ Riwayat quiz & nilai
□ [data lain yang aman]

Yang telah kami lakukan:
1. Mengamankan sistem dan menutup akses tidak sah
2. Melaporkan ke Kementerian Kominfo
3. Melakukan audit keamanan menyeluruh

Langkah yang kami rekomendasikan:
1. Segera ganti password AKAL Center Anda
2. Jika Anda menggunakan password yang sama di platform lain,
   segera ganti password tersebut

Jika ada pertanyaan, hubungi:
- Email: [security@akalcenter.my.id](mailto:security@akalcenter.my.id)
- WA: 0851-5879-5502

Hormat kami,
Tim AKAL Center
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

# ══════════════════════════════════════════════
# 📈 FOOTER — Panduan Cepat (Quick Reference)
# ══════════════════════════════════════════════

## Cara Menggunakan Skill Ini

```
TRIGGER: "gunakan skills e-learning platform", "buat LMS", "course platform",
         "e-learning", "platform pembelajaran", "learning management system",
         "bikin platform kursus", "online course platform", "edtech"

CARA PENGGUNAAN:
1. Baca bagian Filosofi Inti untuk memahami filosofi platform
2. Identifikasi mode (Ringan/Medium/Enterprise) dari skala yang dibutuhkan
3. Ikuti arsitektur yang sesuai di bagian Rekomendasi Arsitektur
4. Pilih komponen dari matriks Stack-Fitur
5. Implementasi sesuai code examples
6. Security audit dengan checklist di bagian Diagnostic Security Audit

UNTUK RISET LEBIH LANJUT:
- Bandingkan dengan pesaing: Canvas, Moodle, Ruangguru, Zenius, Coursera
- Cek OWASP Top 10 untuk keamanan aplikasi web
- Cek WCAG 2.1 AA untuk aksesibilitas
- Cek UU PDP (Indonesia) / GDPR untuk data privacy
```

## License & Acknowledgment

```
Skill ini dikembangkan untuk agensi ngome sebagai referensi arsitektur e-learning
platform yang aman, scalable, dan sesuai regulasi Indonesia.

Referensi teknis berasal dari dokumentasi resmi, riset industri, dan implementasi
nyata di AKAL Center (akalcenter.my.id) serta analisis dari Ruangguru, Zenius,
Coursera, Khan Academy, Canvas LMS, Open edX, dan Moodle.

Copyright (c) 2026 Agensi Ngome. All rights reserved.
```

---

*SKILL_E-LEARNING_PLATFORM_v2.md — Comprehensive E-Learning Platform Architecture Guide*
*Versi 2026.3 | 2026 | Bahasa: Indonesia + English*
*Filosofi: Berani, Detail, Aman, Scalable, Teruji — Sesuai Standar Industri EdTech*
*Target: 7500+ line komprehensif dengan CI/CD pipeline, payment integration Indonesia,
learning analytics engine, database migration guide, Sentry + axe-core monitoring,
dan arsitektur untuk 3 level skala.*

