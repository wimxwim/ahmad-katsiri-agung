# AKAL CENTER — Arsitektur Target (Multi-Tenant Analytics Platform)

**Versi:** 2.0 Target  
**Infrastruktur:** VPS Biznet Gio NEO Lite (2 vCPU, 4GB RAM, 60GB SSD)  
**Hosting Cadangan:** Vercel Hobby (staging/development)

---

## 1. HELICOPTER VIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ☁️ CLOUDFLARE EDGE                            │
│  CDN Cache · Rate Limiting · DDoS Protection · SSL Termination       │
│  Domain: akalcenter.my.id (proxied)                                  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      🖥️ VPS BIZNET GIO (4GB RAM)                     │
│                                                                      │
│  ┌──────────┐   ┌──────────────┐   ┌──────────┐   ┌──────────┐     │
│  │  CADDY   │──▶│  NEXT.JS APP │──▶│ PGBOUNCER│──▶│POSTGRESQL│     │
│  │ :80/:443 │   │  (3 instance)│   │  :6432   │   │  :5432   │     │
│  └──────────┘   │  jemalloc    │   └──────────┘   └──────────┘     │
│                  │  --max-old-  │                                     │
│                  │   space=1536 │   ┌──────────┐                     │
│                  └──────┬───────┘   │  REDIS   │                     │
│                         │           │  :6379   │                     │
│                         ▼           └──────────┘                     │
│                  ┌──────────────┐        ▲                            │
│                  │    WORKER    │────────┘                            │
│                  │  (BullMQ)    │  Queue: analytics                   │
│                  │  jemalloc    │                                     │
│                  └──────────────┘                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ☁️ MANAGED CLOUD                               │
│                                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐             │
│  │ NEON POSTGRES│   │ UPSTASH REDIS│   │ GOOGLE DRIVE │             │
│  │ (Data Utama) │   │ (Session +   │   │ (File Guru)  │             │
│  │              │   │  Cache)      │   │              │             │
│  └──────────────┘   └──────────────┘   └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. LAPISAN ARSITEKTUR

### 2.1 Edge Layer (Cloudflare)

| Komponen | Fungsi | Konfigurasi |
|----------|--------|-------------|
| **CDN** | Cache aset statis, HTML, PDF | Cache Rules: static/immutable 1 tahun |
| **WAF** | Geo-blocking, Bot Fight, Rate Limiting | CN/RU/KP/IR → Managed Challenge |
| **SSL** | Full (Strict) ke Caddy | Caddy: `tls internal` |
| **Worker** | Reverse proxy, cache, security headers | Hapus CSP dari Worker (biarkan Next.js handle) |

### 2.2 VPS Layer (Docker Compose)

| Service | Image | RAM Limit | Port | Catatan |
|---------|-------|-----------|------|---------|
| **caddy** | caddy:2-alpine | 128M | 80, 443 | Auto-SSL, reverse proxy |
| **app** | custom (Next.js) | 1500M | 3000 (internal) | jemalloc, V8 flags |
| **worker** | custom (Node.js) | 512M | — | BullMQ processor |
| **postgres** | postgres:16-alpine | 400M | 5432 (internal) | Volume persisten |
| **pgbouncer** | edoburu/pgbouncer | 64M | 6432 | pool_mode=transaction |
| **redis** | redis:7-alpine | 150M | 6379 (internal) | maxmemory-policy allkeys-lru |

**Memory Budget VPS 4GB:**
```
App:      1500 MB (jemalloc optimized)
Worker:    512 MB
Postgres:  400 MB
Redis:     150 MB
PgBouncer:  64 MB
Caddy:     128 MB
OS/Docker: 500 MB
─────────────────────
TOTAL:    ~3254 MB (81% utilized)
HEADROOM:  ~746 MB
```

### 2.3 Managed Cloud Layer

| Service | Teknologi | Fungsi | Alasan Tidak di VPS |
|---------|-----------|--------|---------------------|
| **Neon Postgres** | Serverless PostgreSQL | Data utama (user, nilai, transaksi) | Auto-scale, branching, gratis tier |
| **Upstash Redis** | Serverless Redis | Session, cache, queue | Global low-latency, gratis tier |
| **Google Drive API** | OAuth2 per guru | Storage file materi | Unlimited, milik guru |
| **Resend** | Email API | Notifikasi email ke guru/siswa/ortu | 100 email/hari gratis |

---

## 3. ARSITEKTUR DATA

### 3.1 Dual Database Strategy

```
┌──────────────────────────────────────────────────────────────────┐
│                       KEYSTATIC (git-based)                       │
│  Content Types:                                                    │
│    ├── Materi (14 bab) — judul, konten, dalil, dimensi            │
│    ├── Soal (8 bank) — teks, pilihan, kunci                       │
│    ├── Game (12) — judul, deskripsi, URL Canva                    │
│    └── Hadits (6) — arab, arti, sumber                            │
│  Gunakan untuk: SEMUA KONTEN STATIS (jarang berubah)              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    NEON POSTGRES (Prisma ORM)                     │
│  Tables:                                                           │
│    ├── users (guru, siswa, admin, orang_tua)                      │
│    ├── sekolah                                                      │
│    ├── kursus (FK ke keystatic_slug)                               │
│    ├── skill (topik/sub-topik per kursus)                         │
│    ├── soal (metadata IRT, elo_rating)                             │
│    ├── jawaban_log (event sourcing — raw data)                     │
│    ├── skill_mastery (BKT probabilities)                           │
│    ├── student_ability (IRT theta)                                 │
│    ├── risk_snapshot                                                │
│    ├── teacher_readiness_snapshot                                  │
│    ├── remedial_recommendation                                     │
│    ├── sertifikat                                                   │
│    ├── transaksi (pembayaran)                                      │
│    ├── google_drive_auth                                           │
│    ├── event_store (hash-chain)                                    │
│    └── feature_flags                                               │
│  Gunakan untuk: DATA TRANSAKSIONAL & ANALITIK                     │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Event Sourcing Pattern

```
USER ACTION → API Route
                │
                ├─→ 1. Write to EventStore (immutable)
                │      event_type: JAWABAN_SUBMITTED
                │      payload: { siswaId, soalId, jawaban, timestamp }
                │      previous_hash: SHA256(prev_hash + payload + version)
                │
                ├─→ 2. Push to Redis Queue
                │      LPUSH queue:analytics { eventId }
                │
                └─→ 3. Worker (async)
                       BRPOP queue:analytics
                       ├─→ Write jawaban_log (read model)
                       ├─→ Calculate BKT → Update skill_mastery
                       ├─→ Calculate Elo → Update soal.elo_rating
                       ├─→ Calculate Risk Score → Update risk_snapshot
                       └─→ Emit ANALYTICS_UPDATED event
```

---

## 4. ARSITEKTUR APLIKASI (HEXAGONAL)

```
src/
├── domain/                          # Pure business logic (NO imports from infrastructure)
│   ├── analytics/
│   │   ├── calculateBKT.ts          # Bayesian Knowledge Tracing
│   │   ├── calculateElo.ts          # Elo Rating update
│   │   ├── calculateRiskScore.ts    # Weighted composite risk
│   │   ├── calculateTRI.ts          # Teacher Readiness Index
│   │   └── calculateSpacedRep.ts    # SM-2 algorithm
│   ├── quiz/
│   │   └── gradeQuiz.ts             # Correct/incorrect scoring
│   └── sertifikat/
│       └── generateQRHash.ts        # SHA-256 hash for QR
│
├── application/                     # Use cases (orchestrate domain + repositories)
│   ├── submitJawaban.ts             # Full quiz submission flow
│   ├── generateSertifikat.ts        # Certificate generation
│   └── recommendRemedial.ts         # Remedial prescription logic
│
├── infrastructure/                   # Adapters (Prisma, Redis, Google Drive)
│   ├── repositories/
│   │   ├── PrismaUserRepository.ts
│   │   ├── PrismaEventStore.ts
│   │   └── ...
│   ├── storage/
│   │   ├── IStorageAdapter.ts       # Interface
│   │   ├── LocalAdapter.ts          # VPS local fallback
│   │   ├── GDriveAdapter.ts         # Google Drive implementation
│   │   └── StorageFactory.ts        # getAdapter(guruId)
│   ├── cache/
│   │   └── SemanticCache.ts         # Redis cache for AI responses
│   └── logging/
│       └── logger.ts                # Pino structured logging
│
└── interfaces/                       # HTTP layer (Next.js API routes)
    ├── http/
    │   ├── middleware/
    │   │   ├── requireAuth.ts        # JWT verification
    │   │   ├── requireRole.ts        # RBAC check
    │   │   ├── rateLimiter.ts        # Redis INCR/EXPIRE
    │   │   └── idempotency.ts        # Idempotency-Key check
    │   └── routes/
    │       ├── auth/
    │       ├── kursus/
    │       ├── quiz/
    │       ├── analitik/
    │       └── sertifikat/
    └── notifications/
        └── telegram.ts               # Reuse existing Telegram integration
```

---

## 5. CLOUDFLARE + CADDY SSL

```
Browser → Cloudflare (Full Strict SSL) → Caddy (tls internal) → Next.js :3000

Caddyfile:
  akalcenter.my.id {
    reverse_proxy app:3000
    header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  }
```

Cloudflare SSL mode: **Full (Strict)** — Caddy tidak perlu validasi SSL ke internet karena Cloudflare sudah melakukannya.

---

## 6. MEMORY OPTIMIZATION (WARISAN wa-ngom)

### Dockerfile (app & worker)
```
FROM node:20-bullseye-slim
RUN apt-get update && apt-get install -y libjemalloc2 && rm -rf /var/lib/apt/lists/*
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2
ENV MALLOC_ARENA_MAX=2
ENV NODE_OPTIONS="--max-old-space-size=1536 --max-semi-space-size=16 --optimize-for-size --expose-gc"
```

### PgBouncer (pooling)
```
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

Tanpa PgBouncer, 150 siswa online bersamaan bisa menghabiskan koneksi Postgres → crash.

### Log Rotation (60GB SSD survival)
```
# Docker log driver
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

# Host logrotate
/var/log/app/*.log {
  daily
  rotate 3
  compress
  missingok
  notifempty
  size 10M
}
```

---

## 7. CAPACITY & SCALABILITY

| Metric | 1 VPS | 2 VPS (horizontal) |
|--------|-------|---------------------|
| Concurrent users | ~50 | ~150 |
| Quiz submissions/min | ~200 | ~600 |
| Postgres connections | 20 (pooled) | 40 |
| RAM headroom | ~750 MB | ~1.5 GB |
| SSD usage (initial) | ~10 GB | ~20 GB |

**Scaling triggers:**
- RAM > 85% sustained → tambah VPS atau optimasi query
- Postgres CPU > 70% sustained → pisah database ke VPS sendiri
- 500+ concurrent users → load balancer + multi-instance

---

## 8. MONITORING & ALERTING

| Monitoring | Tool | Alert |
|------------|------|-------|
| Uptime | UptimeRobot | Status page + Telegram |
| Resource | Netdata | RAM > 85%, Disk > 80% |
| API Health | `/api/monitor/ping` | 200 OK cek Redis + Postgres |
| Error rate | Pino JSON logs | Spike > 5% in 5 min |
| Synthetic | Cron script | Login + submit quiz tiap 15 menit |
| Business | Custom query | Siswa Risk > 0.6 → Telegram Guru |
