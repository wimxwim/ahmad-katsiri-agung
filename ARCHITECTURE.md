# 🏗️ AKAL CENTER — Arsitektur Backend Komprehensif
> Berdasarkan 20 skill backend engineering global 2026
> Target: 2 GB RAM, 2 vCPU, 60 GB SSD, 810 user

---

## 🎯 CLARIFY (System Design Framework)

| Requirement | Value |
|-------------|-------|
| Daily Active Users | 400 siswa + 10 guru |
| Reads/writes ratio | 90% read, 10% write |
| Peak QPS | ~50 req/sec |
| AI generation | 10-50 per hari (batch malam) |
| Data retention | 7 tahun (sertifikat), 1 tahun (log) |
| Consistency | Strong (ACID PostgreSQL) |
| Availability | 99.5% (boleh downtime 3.6 jam/bulan) |
| Latency target | p99 < 500ms |

---

## 📐 HIGH-LEVEL ARCHITECTURE

```
                            ┌─────────────────────────────────────┐
                            │        Cloudflare (DNS Only)        │
                            │   akalcenter.my.id → VPS IP         │
                            └──────────────┬──────────────────────┘
                                           │
                            ┌──────────────▼──────────────────────┐
                            │         Nginx (Port 80/443)         │
                            │   SSL Termination (Let's Encrypt)   │
                            │   Rate Limiting (10 req/s)          │
                            │   Gzip, Caching Headers             │
                            └──────────────┬──────────────────────┘
                                           │
                            ┌──────────────▼──────────────────────┐
                            │      Next.js (PM2, 1 instance)      │
                            │   Port 3000                         │
                            │   max-memory-restart: 700M          │
                            └──────┬───────────────┬──────────────┘
                                   │               │
                    ┌──────────────▼───┐   ┌───────▼──────────────┐
                    │   PostgreSQL 16  │   │   Redis 7            │
                    │   Port 5432      │   │   Port 6379          │
                    │   Pool: 8        │   │   maxmemory: 60MB    │
                    │   shared: 512MB  │   │   Session + Cache    │
                    └──────────────────┘   └──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────────────┐
                    │            External Services                │
                    │   ImageKit (PDF Storage)                    │
                    │   NaraRouter (AI - DeepSeek/Mimo)           │
                    │   Resend (Email)                            │
                    │   Google OAuth (Login)                      │
                    └─────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE: PostgreSQL Schema Design

### Index Strategy (query-missing-indexes, query-composite-indexes)

```sql
-- Users: frequently searched by email
CREATE INDEX users_email_idx ON users (email);

-- AI Generation: filter by guru + status
CREATE INDEX ai_gen_guru_status_idx ON ai_generation (guru_id, status);

-- File Materi: filter by kursus + guru
CREATE INDEX file_materi_kursus_guru_idx ON file_materi (kursus_id, guru_id);

-- Jawaban Log: filter by siswa + kursus
CREATE INDEX jawaban_log_siswa_kursus_idx ON jawaban_log (siswa_id, kursus_id);

-- Event Store: hash chain verification
CREATE INDEX event_store_guru_idx ON event_store (guru_id, created_at);
```

### Connection Pool (conn-pooling)
```env
DATABASE_URL=postgresql://akal:password@localhost:5432/akalcenter
POOL_MAX=8
POOL_IDLE_TIMEOUT=30000
```

### RLS Strategy (security-rls-basics)
```sql
-- Enable RLS on multi-tenant tables
ALTER TABLE ai_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE jawaban_log ENABLE ROW LEVEL SECURITY;

-- Guru only sees own data
CREATE POLICY guru_owns_ai_gen ON ai_generation
  FOR ALL TO authenticated
  USING (guru_id = current_setting('app.current_user_id')::uuid);

-- Siswa only sees own jawaban
CREATE POLICY siswa_owns_jawaban ON jawaban_log
  FOR ALL TO authenticated
  USING (siswa_id = current_setting('app.current_user_id')::uuid);
```

---

## ⚡ CACHING: Multi-Layer Strategy

### Layer 1: Nginx Cache (static assets)
```nginx
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
location /public/ {
    expires 7d;
    add_header Cache-Control "public";
}
```

### Layer 2: Redis Cache (dynamic data)
```typescript
// Kursus catalog (TTL 5 menit)
async function getKursusCatalog() {
  const cacheKey = "kursus:catalog";
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const data = await db.query.kursus.findMany({ 
    where: eq(kursus.status, "published"),
    limit: 50 
  });
  await redis.setex(cacheKey, 300, JSON.stringify(data));
  return data;
}

// Invalidate on publish
async function publishKursus(id: string) {
  await db.update(kursus).set({ status: "published" }).where(eq(kursus.id, id));
  await redis.del("kursus:catalog");
}
```

### Layer 3: PostgreSQL Buffer (shared_buffers=512MB)
- Hot data (users, kursus) cached in memory
- Query plan cached via prepared statements

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Multi-Layer Defense (auth-flow-akal-center + security-review)

```
Layer 1: Middleware → JWT precheck + CSRF + CSP
Layer 2: Route Guard → requireGuru/requireSiswa
Layer 3: Database → RLS + ownership predicates
Layer 4: Audit → hash-chained event store
```

### Rate Limiting (sliding window)
```typescript
// Per IP: 60 req/menit
checkRateLimit(`ip:${ip}`, 60, 60_000)

// Per User: 120 req/menit
checkRateLimit(`user:${userId}`, 120, 60_000)

// AI Generation: 10/hari
checkRateLimit(`gen:${userId}`, 10, 86400_000)
```

### CSRF Protection
```typescript
// Double-submit cookie pattern
cookie __Host-psrf === header x-csrf-token

// Exempt: login, register, OAuth, webhook, health
```

---

## 🤖 AI PIPELINE: Event-Driven Batch Processing

### Arsitektur (orchestration-and-backfills)

```
┌─ UPLOAD (siang) ──────────────────────────────────────────┐
│  Guru upload PDF                                           │
│  → ImageKit (storage)                                      │
│  → Extract text (unpdf, 30 detik)                          │
│  → Save to file_materi.extraction_text                     │
│  → Create ai_generation record (status: queued)            │
│  → Response: 3 detik, 55 MB RAM                            │
└────────────────────────────────────────────────────────────┘

┌─ GENERATE (2 mode) ───────────────────────────────────────┐
│                                                            │
│  MODE 1: Tombol "Generate Sekarang"                        │
│  → POST /api/v1/guru/drafts/{id}/generate                  │
│  → Baca extraction_text dari DB                            │
│  → Concurrent limit: 1 (antri otomatis)                    │
│  → 3 AI calls sequential: materi → quiz → soal             │
│  → 90 detik/guru, 150 MB RAM                               │
│                                                            │
│  MODE 2: Cron jam 00:00 WIB                                │
│  → POST /api/v1/cron/generate (Authorization: Bearer)      │
│  → Query semua status=queued                               │
│  → Process 1 per 1 (sequential)                            │
│  → 10 guru = 15 menit, 150 MB RAM                          │
│                                                            │
│  AI Fallback chain:                                        │
│  deepseek-v4-flash → retry 2x → mimo-v2.5 → local fallback │
│  Retry: 503 backoff 1.5s/3s/6s                             │
└────────────────────────────────────────────────────────────┘
```

### Data Quality Contract (data-quality-and-contract-testing)

```typescript
// Validasi sebelum publish
interface DraftQualityCheck {
  materiMinLength: 100,    // Minimal 100 karakter
  quizMinItems: 5,         // Minimal 5 soal
  soalMinItems: 3,         // Minimal 3 soal
  noEmptyOpsi: true,       // Opsi PG tidak boleh kosong
  kunciJawabanValid: true, // Kunci harus A/B/C/D
}
```

---

## 📊 MONITORING & OBSERVABILITY

### Health Check (system-design)
```
GET /api/health → {
  status: "ok",
  uptime: 12345,
  services: {
    postgres: { status: "connected", latencyMs: 2 },
    redis: { status: "connected", latencyMs: 1 },
    imagekit: { status: "connected", latencyMs: 150 },
    ai: { status: "connected", latencyMs: 561 }
  }
}
```

### Structured Logging (backend-patterns)
```typescript
// JSON log format
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: "INFO",
  service: "ai-generator",
  generationId: "xxx",
  tokensIn: 365,
  tokensOut: 281,
  durationMs: 31900,
}));
```

### Alert Rules (incident-triage-and-pipeline-recovery)
```
DB connection > 80% pool → WARN
AI generation failed > 3x → ERROR
Disk usage > 80% → WARN
RAM usage > 85% → CRITICAL
Cron generate failed → ERROR
```

---

## 🛡️ SECURITY HARDENING

### Pre-Deployment Checklist (security-review)
- [x] No hardcoded secrets (all in .env.production)
- [x] JWT httpOnly cookies (SameSite=Lax)
- [x] CSRF on all mutations
- [x] Rate limiting per IP + per user
- [x] Input validation (Zod)
- [x] SQL parameterized (Drizzle ORM)
- [x] File upload validation (size, type, magic bytes)
- [x] Error messages generic (no stack traces)
- [x] HTTPS enforced (Let's Encrypt)
- [x] CSP headers configured
- [x] RLS on multi-tenant tables
- [x] Audit logging (hash-chained event store)

### Secrets Management
```
VPS filesystem (.env.production) ← 600 permissions
PostgreSQL password ← strong, rotated 90 hari
JWT_SECRET ← 64 char random
CRON_SECRET ← 32 char random
NaraRouter API key ← rotated via dashboard
```

---

## 🔄 DISASTER RECOVERY (data-platform-disaster-recovery)

### RTO/RPO
| Metric | Target |
|--------|--------|
| RTO (Recovery Time) | 2 jam |
| RPO (Recovery Point) | 24 jam (backup harian) |

### Backup Strategy
```
1. PostgreSQL: pg_dump setiap jam 2 pagi → /opt/backups/
2. Retensi: 7 hari lokal, 30 hari remote (rsync ke storage lain)
3. ImageKit: file PDF tidak di-backup (cloud storage, 99.9% SLA)
4. Konfigurasi: /opt/akal-center/ di-git (GitHub)
```

### Recovery Drill
```bash
# 1. Restore database
gunzip /opt/backups/akalcenter_20260711_020000.sql.gz
psql akalcenter < akalcenter_20260711_020000.sql

# 2. Restore app
git clone https://github.com/wimxwim/ahmad-katsiri-agung.git /opt/akal-center
cd /opt/akal-center
bash scripts/deploy-vps.sh

# 3. Verify
curl https://akalcenter.my.id/api/health
```

---

## 📈 SCALING PATH

### Vertical Scale (2 GB → 4 GB → 8 GB)
```
2 GB: 400 siswa + 10 guru → 71% RAM ✅
4 GB: 800 siswa + 20 guru → 2 PM2 instances
8 GB: 1500 siswa + 50 guru → 4 PM2 instances
```

### Horizontal Scale (future)
```
VPS 1 (App) + VPS 2 (DB) → ketika 2000+ user
VPS 1 (App) + VPS 2 (App) + VPS 3 (DB) → load balancer
```

### Bottleneck Analysis
| Bottleneck | Current | Limit | Fix |
|-----------|---------|-------|-----|
| RAM | 2 GB | 71% normal | Vertical scale |
| DB connections | 8 pool | 50 max PG | Increase pool |
| AI generation | 1 concurrent | 10/hari cron | Batch malam |
| Disk | 60 GB | 8 GB used | OK for years |
| Network | 1 Gbps | ~10 Mbps | OK |

---

## 🎯 DEPLOYMENT PIPELINE

```bash
# 1. Build & test locally
npm run build

# 2. Push to GitHub
git push origin main

# 3. Deploy to VPS
bash scripts/deploy-vps.sh

# 4. Verify
curl https://akalcenter.my.id/api/health
```

---

*Arsitektur ini dirancang berdasarkan 20 skill backend engineering global — tidak main-main.*