# AKAL CENTER — Rencana Migrasi (Dari Single-Guru ke Multi-Tenant)

**Prinsip:** Evolusi, bukan revolusi. Repo existing tetap jalan. Database baru ditambahkan di samping.  
**Target VPS:** Biznet Gio NEO Lite (2 vCPU, 4GB RAM, 60GB SSD)  
**Hosting Fallback:** Vercel Hobby (staging/development)

---

## 0. FASE 0: PRE-MIGRATION (EKSEKUSI SEKARANG — TANPA TUNGGU VPS)

### 0.1 Quick Wins (Bisa Dikerjakan Hari Ini di Repo Existing)

| # | Item | File | Estimasi |
|---|------|------|----------|
| 1 | Halaman `/peserta-didik` | `src/app/peserta-didik/page.tsx` | 30-60 menit |
| 2 | CMS Navbar filter (< 8 items) | `keystatic.config.ts` | 30 menit |
| 3 | Akun GitHub Bang Agung | GitHub invite collaborator | 5 menit |

### 0.2 PRD Documentation

| # | Item | File |
|---|------|------|
| 1 | ✅ Ringkasan Eksekutif | `prd/01-ringkasan-eksekutif.md` |
| 2 | ✅ Audit Kondisi Saat Ini | `prd/02-audit-kondisi-saat-ini.md` |
| 3 | ✅ Arsitektur Target | `prd/03-arsitektur-target.md` |
| 4 | ✅ Matriks Fitur Per Role | `prd/04-matriks-fitur-per-role.md` |
| 5 | ✅ Spesifikasi Mesin Analitik | `prd/05-spesifikasi-mesin-analitik.md` |
| 6 | ✅ Model Data | `prd/06-model-data.md` |
| 7 | ✅ Rencana Migrasi | `prd/07-rencana-migrasi.md` (dokumen ini) |

---

## 1. FASE 1: VPS PROVISIONING + DOCKER (Minggu 1)

### 1.1 Beli & Setup VPS
```bash
# 1. Order Biznet Gio NEO Lite: https://www.biznetgio.com/product/neo-lite
# 2. Catat IP, root password
# 3. SSH ke VPS
ssh root@[VPS_IP]
```

### 1.2 Hardening Dasar
```bash
# Nonaktifkan root SSH, ganti port, key-based auth, UFW
adduser deploy
usermod -aG sudo deploy
# /etc/ssh/sshd_config: PermitRootLogin no, Port 2222, PasswordAuthentication no
ufw default deny incoming
ufw allow 2222/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 1.3 Whitelist Cloudflare IP Range
```bash
# Hanya izinkan akses dari IP Cloudflare ke port 80/443
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  ufw allow from $ip to any port 80,443 proto tcp
done
```

### 1.4 Install Docker & Docker Compose
```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
newgrp docker
```

### 1.5 Deploy Infrastruktur via Docker Compose
```bash
mkdir -p /opt/akal-center/infra
# Copy docker-compose.yml, Caddyfile, .env.production
docker compose -f /opt/akal-center/infra/docker-compose.yml up -d
```

---

## 2. FASE 2: DATABASE + PRISMA SETUP (Minggu 1-2)

### 2.1 Install Prisma di Repo Existing
```bash
cd ~/agensi/proyek/akal-center
pnpm add prisma @prisma/client @prisma/extension-uuid-v7
pnpm prisma init
```

### 2.2 Setup Neon Postgres
1. Buka https://console.neon.tech
2. Buat project `akal-center`
3. Copy connection string ke `.env`:
```
DATABASE_URL="postgresql://..."
```

### 2.3 Buat Schema (dari PRD 06)
Copy `prd/06-model-data.md` schema ke `prisma/schema.prisma`

### 2.4 Migration
```bash
pnpm prisma migrate dev --name init_core_schema
pnpm prisma generate
```

### 2.5 Buat Singleton Prisma Client
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

### 2.6 Setup PgBouncer (di VPS)
```ini
# infra/pgbouncer/pgbouncer.ini
[databases]
akal_center = host=postgres port=5432 dbname=akal_center

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

---

## 3. FASE 3: AUTH + MULTI-TENANCY (Minggu 2-3)

### 3.1 Ganti `@default(uuid())` dengan UUID v7
Semua model pakai UUID v7 via Prisma middleware

### 3.2 Registrasi & RBAC
```typescript
// src/app/api/auth/register/route.ts
// Only allow creating GURU or SISWA role
// Hash password with bcrypt (cost 12) — upgrade to argon2id later

// src/lib/auth.ts
export async function hashPassword(password: string): Promise<string> { ... }
export async function verifyPassword(password: string, hash: string): Promise<boolean> { ... }

// src/lib/token.ts — Extend existing JWT with role
export async function signToken(payload: { userId: string; role: Role; sekolahId?: string }) { ... }
export async function verifyToken(token: string) { ... }
```

### 3.3 Middleware RBAC
```typescript
// src/interfaces/http/middleware/requireRole.ts
export function requireRole(...roles: Role[]) {
  return async (req: NextRequest) => {
    const token = await verifyToken(req.cookies.get('akal_sesi')?.value);
    if (!roles.includes(token.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Set current_user_id untuk RLS
    req.headers.set('app.current_user_id', token.userId);
    return null; // allow
  };
}
```

### 3.4 Generalisasi dari "Ahmad Katsiri Agung"
```bash
# Cari semua hardcode
grep -r "Ahmad Katsiri" --include="*.tsx" --include="*.ts" src/

# Ganti dengan dinamis:
# Sebelum: <h1>Ahmad Katsiri Agung</h1>
# Sesudah: <h1>{guru?.nama || "Ahmad Katsiri Agung"}</h1>
```

---

## 4. FASE 4: GOOGLE DRIVE PER GURU (Minggu 3-4)

### 4.1 Setup Google Cloud Project
1. Buka https://console.cloud.google.com
2. Enable Google Drive API
3. Buat OAuth 2.0 Client ID (Web application)
4. Set redirect URI: `https://akalcenter.my.id/api/guru/drive/callback`
5. Simpan CLIENT_ID dan CLIENT_SECRET di .env

### 4.2 Storage Adapter Pattern
```typescript
// src/infrastructure/storage/IStorageAdapter.ts
export interface IStorageAdapter {
  upload(file: Buffer, metadata: { nama: string; tipe: string }): Promise<StorageResult>;
  delete(fileId: string): Promise<void>;
  getLink(fileId: string): string;
}

// src/infrastructure/storage/GDriveAdapter.ts
export class GDriveAdapter implements IStorageAdapter {
  constructor(private refreshToken: string) {}
  async upload(file: Buffer, meta: any): Promise<StorageResult> { ... }
  async delete(fileId: string): Promise<void> { ... }
  getLink(fileId: string): string { return `https://drive.google.com/file/d/${fileId}/view`; }
}

// src/infrastructure/storage/StorageFactory.ts
export async function getStorageAdapter(guruId: string): Promise<IStorageAdapter> {
  const auth = await db.googleDriveAuth.findUnique({ where: { guruId } });
  if (auth?.status === 'AKTIF') {
    const decrypted = decrypt(auth.refreshTokenEncrypted, ENCRYPTION_SECRET);
    return new GDriveAdapter(decrypted);
  }
  return new LocalAdapter('./uploads');
}
```

### 4.3 OAuth2 Flow
```typescript
// src/app/api/guru/drive/connect/route.ts (GET)
// Generate Google OAuth URL, redirect

// src/app/api/guru/drive/callback/route.ts (GET)
// Exchange code for refresh_token
// Encrypt: crypto.aes256gcm(refreshToken, ENCRYPTION_SECRET)
// Save to GoogleDriveAuth table
```

### 4.4 Encrypt Refresh Token
```typescript
// src/lib/crypto.ts
import crypto from 'crypto';

export function encrypt(text: string, secret: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(secret, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(ciphertext: string, secret: string): string {
  const buf = Buffer.from(ciphertext, 'base64');
  const iv = buf.subarray(0, 16);
  const tag = buf.subarray(16, 32);
  const encrypted = buf.subarray(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(secret, 'hex'), iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

---

## 5. FASE 5: QUIZ ENGINE v2 + EVENT SOURCING (Minggu 4-6)

### 5.1 Quiz Submit API (v2)
```typescript
// src/app/api/v1/quiz/submit/route.ts (POST)
export async function POST(req: NextRequest) {
  const { quizSessionId, jawaban } = await req.json();
  const token = await verifyToken(req);
  
  // IDEMPOTENCY CHECK
  const idempotencyKey = req.headers.get('X-Idempotency-Key');
  if (idempotencyKey) {
    const existing = await redis.get(`idempotency:${idempotencyKey}`);
    if (existing) return NextResponse.json(JSON.parse(existing));
  }

  // 1. Write to EventStore
  const event = await db.eventStore.create({
    data: {
      streamId: `siswa:${token.userId}`,
      version: await getNextVersion(`siswa:${token.userId}`),
      eventType: 'JAWABAN_SUBMITTED',
      payload: { quizSessionId, jawaban },
      previousHash: await getPreviousHash(`siswa:${token.userId}`),
    },
  });

  // 2. Push to Redis Queue (async processing)
  await redis.lpush('queue:analytics', event.id);

  // 3. LEGACY: Parallel write to Google Sheets (graceful degradation)
  try {
    await legacyWriteToGoogleSheet(token, jawaban);
  } catch (e) {
    console.error('Google Sheets write failed (non-critical):', e);
  }

  // 4. Cache response for idempotency
  const response = { eventId: event.id, status: 'accepted' };
  if (idempotencyKey) {
    await redis.setex(`idempotency:${idempotencyKey}`, 86400, JSON.stringify(response));
  }

  return NextResponse.json(response);
}
```

### 5.2 Worker (Event Processor)
```typescript
// worker.ts
import { db } from './src/lib/db';
import { updateBKT, slipForward } from './src/domain/analytics/calculateBKT';
import { updateElo } from './src/domain/analytics/calculateElo';
import { calculateRiskScore } from './src/domain/analytics/calculateRiskScore';

async function workerLoop() {
  while (true) {
    // BRPOP with JITTER (4-8 menit)
    const result = await redis.brpop('queue:analytics', 0);
    if (!result) continue;

    const eventId = result[1];
    const event = await db.eventStore.findUnique({ where: { id: eventId } });
    if (!event || event.eventType !== 'JAWABAN_SUBMITTED') continue;

    const { quizSessionId, jawaban } = event.payload as any;

    for (const j of jawaban) {
      // 1. Write read model
      await db.jawabanLog.create({ data: { ... } });

      // 2. BKT
      const mastery = await db.skillMastery.findUnique({ where: { ... } });
      const prevP = mastery?.pL || 0.1;
      const newP = updateBKT(prevP, j.isBenar, { pT: 0.3, pG: 0.2, pS: 0.1 });
      await db.skillMastery.upsert({ ... });

      // 3. Elo
      const soal = await db.soal.findUnique({ where: { id: j.soalId } });
      const { newRatingSiswa, newRatingSoal } = updateElo(
        studentRating, soal.eloRating, j.isBenar
      );
      await db.soal.update({ ... });

      // 4. Risk Score
      const metrics = await gatherRiskMetrics(event.siswaId);
      const risk = calculateRiskScore(metrics);
      await db.riskSnapshot.create({ data: { ... } });

      // 5. Remedial (if P(L) < 0.6)
      if (newP < 0.6) {
        await db.remedialRecommendation.upsert({ where: { ... }, create: { ... } });
      }
    }

    // Emit completion event
    await db.eventStore.create({
      data: {
        streamId: `siswa:${event.siswaId}`,
        version: await getNextVersion(`siswa:${event.siswaId}`),
        eventType: 'ANALYTICS_UPDATED',
        payload: { parentEventId: eventId },
        previousHash: await getPreviousHash(`siswa:${event.siswaId}`),
      },
    });

    // JITTER: random delay 0-2 detik antar processing
    await new Promise(r => setTimeout(r, Math.random() * 2000));
  }
}

workerLoop();
```

### 5.3 Hash Chain untuk EventStore
```typescript
async function getPreviousHash(streamId: string): Promise<string> {
  const lastEvent = await db.eventStore.findFirst({
    where: { streamId },
    orderBy: { version: 'desc' },
  });
  if (!lastEvent) return '0'.repeat(64); // Genesis hash

  const payload = JSON.stringify(lastEvent.payload);
  const combined = lastEvent.previousHash + payload + lastEvent.version;
  return crypto.createHash('sha256').update(combined).digest('hex');
}
```

---

## 6. FASE 6: ANALYTICS UI (Minggu 6-8)

### 6.1 Dashboard Guru — Radar Chart
```typescript
// src/components/dashboard/guru/RadarChart.tsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// Data dari: SELECT AVG(p_l) FROM skill_mastery GROUP BY skill_id WHERE kursus_id = ?
```

### 6.2 Risk Score Table
```typescript
// src/components/dashboard/guru/RiskTable.tsx
// Data dari: SELECT * FROM risk_snapshot WHERE kursus_id = ? ORDER BY snapshot_date DESC LIMIT 1 PER SISWA
// Warna baris: hijau (aman), kuning (pantau), oranye (berisiko), merah (kritis)
```

### 6.3 1-Klik Remedial
```typescript
// Tombol "Kirim Jalur Remedial" → POST /api/v1/guru/remedial/send
// Update remedial_recommendation.status → 'disarankan'
// Kirim notifikasi Telegram + update di dashboard siswa
```

---

## 7. FASE 7: SERTIFIKAT + AI + QRIS (Minggu 8-12)

### 7.1 Sertifikat PDF + QR Anti-Palsu
```typescript
// Package: puppeteer (backend render)
// Template HTML → PDF
// QR Code: SHA-256 hash = crypto.createHash('sha256').update(nomorSertifikat + siswaId + secret).digest('hex')
// Verifikasi: GET /api/verify/[nomor] → cek hash di DB → return valid/invalid
```

### 7.2 AI Tutor (Semantic Cache)
```typescript
// Flow: Siswa tanya → Cek Redis cache:semantic:{skillId} → Cosine similarity > 0.88? → Return cached
// Jika tidak: Kirim ke LLM (Gemini/GPT) → Cache response → Return
// Nonaktif jika sedang di halaman quiz (cek pathname)
```

### 7.3 AI Grading Essay
```typescript
// POST /api/v1/guru/grade/ai-suggest
// Kirim teks jawaban + rubrik ke LLM
// LLM return JSON: { nilai: 80, feedback: "..." }
// Guru approve/edit → audit trail
```

### 7.4 QRIS Payment (Xendit/Midtrans)
```typescript
// POST /api/webhooks/payment — dipanggil gateway
// WAJIB verifikasi signature header
// Update transaksi.status → SUCCESS
// Auto-enroll siswa ke kursus
```

---

## 8. OPTIMASI AKHIR (Minggu 10-12)

### 8.1 Memory Tuning
- [x] jemalloc di Dockerfile (dari sesi 27)
- [ ] PgBouncer connection pooling
- [ ] materialized view untuk dashboard berat
- [ ] Redis maxmemory-policy allkeys-lru
- [ ] V8 flags: --max-old-space-size=1536 --optimize-for-size

### 8.2 Security Hardening
- [ ] Ganti bcrypt → argon2id
- [ ] CSRF Double Submit Cookie
- [ ] Git history scan (trufflehog)
- [ ] OWASP ZAP scan
- [ ] Account lockout setelah 5x gagal login
- [ ] 2FA untuk admin

### 8.3 Monitoring
- [ ] Netdata (resource real-time)
- [ ] UptimeRobot (uptime eksternal)
- [ ] Synthetic monitor (login + submit quiz tiap 15 menit)
- [ ] Pino structured logging + correlation ID
- [ ] Telegram alert: RAM > 85%, error rate spike, siswa risk > 0.6

### 8.4 Backup & DR
- [ ] Backup harian terenkripsi ke Cloudflare R2
- [ ] Restore test bulanan
- [ ] Disaster recovery drill (bangun ulang dari backup)

---

## 9. CHECKLIST GO-LIVE

- [ ] VPS jalan, semua service Docker Compose UP
- [ ] Domain akalcenter.my.id pointing ke VPS
- [ ] SSL Full Strict via Cloudflare + Caddy
- [ ] Database Postgres + Prisma migration sukses
- [ ] Auth (register + login) jalan
- [ ] Multi-guru: guru kedua berhasil daftar + buat kursus
- [ ] Google Drive: guru connect + upload + siswa download
- [ ] Quiz: siswa kerjakan quiz → jawaban_log terisi
- [ ] Worker: BKT + Risk Score terhitung
- [ ] Dashboard guru: radar chart + risk table muncul
- [ ] Sertifikat PDF + QR verifikasi berfungsi
- [ ] QRIS payment end-to-end berhasil
- [ ] Backup terenkripsi di R2
- [ ] Monitoring alert Telegram aktif
- [ ] Security audit (OWASP ZAP) lolos
- [ ] Beta test 2 minggu dengan guru nyata

---

## 10. DOKUMENTASI REFERENSI

| Dokumen | Lokasi |
|---------|--------|
| Ringkasan Eksekutif | `prd/01-ringkasan-eksekutif.md` |
| Audit Kondisi Saat Ini | `prd/02-audit-kondisi-saat-ini.md` |
| Arsitektur Target | `prd/03-arsitektur-target.md` |
| Matriks Fitur Per Role | `prd/04-matriks-fitur-per-role.md` |
| Spesifikasi Mesin Analitik | `prd/05-spesifikasi-mesin-analitik.md` |
| Model Data | `prd/06-model-data.md` |
| Rencana Migrasi | `prd/07-rencana-migrasi.md` (dokumen ini) |
| Full Audit Checklist | `Downloads/AKAL_CENTER_FULL_AUDIT_TODO.md` (205 items) |
| Rencana Pengembangan | `Downloads/AKAL_Center_Rencana_Pengembangan_Kelas_Dunia.md` |
