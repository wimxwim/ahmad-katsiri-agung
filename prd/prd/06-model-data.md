# AKAL CENTER — Model Data (Database Schema)

**Database:** Neon PostgreSQL (Serverless)  
**ORM:** Prisma  
**Paradigma:** Event Sourcing + Read Model  
**Strategy:** Coexist dengan Keystatic (konten statis)

---

## 1. STRATEGI DUAL-DATABASE

| Data Type | Storage | Alasan |
|-----------|---------|--------|
| Konten materi (bab, deskripsi, dalil) | **Keystatic** (git-based) | Statis, jarang berubah, gratis |
| Metadata kursus (slug, harga, guru) | **Postgres** | Relasi, query dinamis |
| User, role, auth | **Postgres** | Transaksional |
| Quiz responses | **Postgres** | Event sourcing, analitik |
| Analitik (BKT, IRT, Risk) | **Postgres** | Query agregat kompleks |
| File materi (PDF, video) | **Google Drive per guru** | Unlimited storage |
| Session & cache | **Redis** | Low latency, TTL |

---

## 2. PRISMA SCHEMA

### 2.1 Core — Multi-Tenant Foundation

```prisma
enum Role {
  OWNER
  ADMIN_SEKOLAH
  GURU
  ASISTEN_GURU
  SISWA
  ORANG_TUA
}

enum LokasiStorage {
  GDRIVE
  VPS_LOKAL
}

model Sekolah {
  id        String   @id @default(uuid()) // UUID v7
  nama      String
  subdomain String   @unique
  paket     String   @default("FREE") // FREE, GURU_PRO, SEKOLAH
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users     User[]
  kursus    Kursus[]
}

model User {
  id            String    @id @default(uuid())
  role          Role
  nama          String
  email         String    @unique
  passwordHash  String?
  tanggalLahir  DateTime?
  sekolahId     String?
  sekolah       Sekolah?  @relation(fields: [sekolahId], references: [id])

  // Parent-child untuk Orang Tua
  parentId      String?
  parent        User?     @relation("ParentChild", fields: [parentId], references: [id])
  children      User[]    @relation("ParentChild")

  // Guru-specific
  kursusDibuat  Kursus[]  @relation("GuruKursus")
  driveAuth     GoogleDriveAuth?

  // Siswa-specific
  enrollments   SiswaKursus[]
  jawabanLogs   JawabanLog[]
  skillMasteries SkillMastery[]
  riskSnapshots RiskSnapshot[]
  studentAbility StudentAbility?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // Soft delete (UU PDP compliance)
}
```

### 2.2 Kursus & Materi (Bridge ke Keystatic)

```prisma
model Kursus {
  id             String   @id @default(uuid())
  guruId         String
  guru           User     @relation("GuruKursus", fields: [guruId], references: [id])
  sekolahId      String?
  sekolah        Sekolah? @relation(fields: [sekolahId], references: [id])
  judul          String
  slug           String   @unique
  keystaticSlug  String?  // Bridge ke content/materi/{slug}/index.json
  deskripsi      String?
  harga          Int      @default(0) // dalam Rupiah
  isPublic       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  skills         Skill[]
  enrollments    SiswaKursus[]
  sertifikats    Sertifikat[]
  transaksis     Transaksi[]
  quizSessions   QuizSession[]
  pengumumans    Pengumuman[]
}

model Skill {
  id              String   @id @default(uuid())
  kursusId        String
  kursus          Kursus   @relation(fields: [kursusId], references: [id])
  nama            String   // e.g. "Konsep Wudhu", "Tata Cara Tayamum"
  prasyaratSkillId String? // Self-relation untuk prerequisite
  prasyaratSkill  Skill?   @relation("SkillPrerequisite", fields: [prasyaratSkillId], references: [id])
  bloomLevel      Int      @default(1) // 1-6 (Remember → Create)
  urutan          Int      @default(0)

  soals           Soal[]
  masteries       SkillMastery[]
  remedialRecs    RemedialRecommendation[]

  @@index([kursusId, urutan])
}

model SiswaKursus {
  id            String   @id @default(uuid())
  siswaId       String
  siswa         User     @relation(fields: [siswaId], references: [id])
  kursusId      String
  kursus        Kursus   @relation(fields: [kursusId], references: [id])
  status        String   @default("AKTIF") // AKTIF, SELESAI, DROPOUT
  tanggalDaftar DateTime @default(now())

  @@unique([siswaId, kursusId])
}
```

### 2.3 Quiz & Evaluation

```prisma
enum TipeSoal {
  PG
  ISIAN
  ESSAY
}

model Soal {
  id          String   @id @default(uuid())
  skillId     String
  skill       Skill    @relation(fields: [skillId], references: [id])
  teks        String
  tipe        TipeSoal
  pilihanGanda Json?   // { "A": "...", "B": "...", "C": "...", "D": "..." }
  kunci       String   // "A" / "B" / "C" / "D" or text answer
  bloomLevel  Int      @default(1)

  // IRT parameters
  irtA        Float    @default(1.0)  // Discrimination (a)
  irtB        Float    @default(0.0)  // Difficulty (b)
  irtC        Float    @default(0.25) // Guessing (c)

  // Elo
  eloRating   Float    @default(1000)

  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  jawabanLogs JawabanLog[]

  @@index([skillId])
}

model QuizSession {
  id          String   @id @default(uuid())
  kursusId    String
  kursus      Kursus   @relation(fields: [kursusId], references: [id])
  judul       String
  durasiMenit Int      @default(30)
  soalIds     Json     // Array of soal UUIDs
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

### 2.4 Event Sourcing — Core Data

```prisma
model JawabanLog {
  id               String   @id @default(uuid())
  siswaId          String
  siswa            User     @relation(fields: [siswaId], references: [id])
  soalId           String
  soal             Soal     @relation(fields: [soalId], references: [id])
  jawabanSiswa     String
  isBenar          Boolean
  waktuJawabDetik  Int      // Seconds taken to answer
  quizSessionId    String?
  createdAt        DateTime @default(now())

  @@index([siswaId, createdAt])
  @@index([soalId])
}

model EventStore {
  id            String   @id @default(uuid())
  streamId      String   // e.g., "siswa:{uuid}" or "kursus:{uuid}"
  version       Int
  eventType     String   // JAWABAN_SUBMITTED, ANALYTICS_UPDATED, CONSENT_GRANTED, etc.
  payload       Json
  previousHash  String   // SHA-256 hash chain
  signature     String?  // HMAC for critical events
  createdAt     DateTime @default(now())

  @@index([streamId, version])
  @@index([eventType, createdAt])
}
```

### 2.5 Analytics — Read Models

```prisma
model StudentAbility {
  id        String   @id @default(uuid())
  siswaId   String   @unique
  siswa     User     @relation(fields: [siswaId], references: [id])
  kursusId  String
  theta     Float    @default(0.0)  // IRT ability estimate
  updatedAt DateTime @updatedAt
}

model SkillMastery {
  id              String   @id @default(uuid())
  siswaId         String
  siswa           User     @relation(fields: [siswaId], references: [id])
  skillId         String
  skill           Skill    @relation(fields: [skillId], references: [id])
  pL              Float    @default(0.1)  // BKT: P(L) — probability of mastery
  memoryStrength  Float    @default(1.0)  // SM-2 ease factor
  lastPracticedAt DateTime?
  nextReviewAt    DateTime?
  repetitionNum   Int      @default(0)
  updatedAt       DateTime @updatedAt

  @@unique([siswaId, skillId])
  @@index([siswaId])
  @@index([nextReviewAt])
}

model RiskSnapshot {
  id          String   @id @default(uuid())
  siswaId     String
  siswa       User     @relation(fields: [siswaId], references: [id])
  kursusId    String
  riskScore   Float    // 0-1
  status      String   // aman, pantau, berisiko, kritis
  komponen    Json     // { C, Q, A, L, T, P } breakdown
  snapshotDate DateTime @default(now())

  @@index([siswaId, snapshotDate])
  @@index([kursusId, status])
}

model RemedialRecommendation {
  id              String   @id @default(uuid())
  siswaId         String
  skillId         String
  skill           Skill    @relation(fields: [skillId], references: [id])
  prioritasScore  Float    // Calculated priority
  status          String   @default("tersedia") // tersedia, disarankan, dikerjakan, selesai
  createdAt       DateTime @default(now())

  @@unique([siswaId, skillId])
}

model TeacherReadinessSnapshot {
  id            String   @id @default(uuid())
  guruId        String
  triScore      Float    // 0-1
  komponen      Json     // { M, R, G, V, E, K } breakdown
  snapshotDate  DateTime @default(now())

  @@index([guruId, snapshotDate])
}
```

### 2.6 Sertifikat & Transaksi & Storage

```prisma
model Sertifikat {
  id              String   @id @default(uuid())
  siswaId         String
  kursusId        String
  kursus          Kursus   @relation(fields: [kursusId], references: [id])
  nomorSertifikat String   @unique
  qrSecretHash    String   // SHA-256 hash for verification
  issuedAt        DateTime @default(now())

  @@index([siswaId])
}

model Transaksi {
  id                  String   @id @default(uuid())
  siswaId             String
  kursusId            String
  kursus              Kursus   @relation(fields: [kursusId], references: [id])
  jumlah              Int      // Rupiah
  metodePembayaran    String?  // QRIS, TRANSFER
  paymentGatewayRef   String?  @unique
  status              String   @default("PENDING") // PENDING, SUCCESS, FAILED, EXPIRED
  paidAt              DateTime?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model GoogleDriveAuth {
  id                  String   @id @default(uuid())
  guruId              String   @unique
  guru                User     @relation(fields: [guruId], references: [id])
  refreshTokenEncrypted String // AES-256-GCM encrypted
  googleEmail         String?
  driveFolderId       String?  // "AKAL Center" folder ID
  status              String   @default("AKTIF") // AKTIF, TERPUTUS
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model FileMateri {
  id            String        @id @default(uuid())
  skillId       String?
  namaFile      String
  tipeMime      String
  ukuranBytes   BigInt
  lokasi        LokasiStorage
  driveFileId   String?       // Google Drive file ID (jika GDRIVE)
  linkAkses     String        // Public URL
  guruId        String?
  createdAt     DateTime      @default(now())
}

model FeatureFlag {
  id        String   @id @default(uuid())
  name      String   @unique  // e.g., "bkt_analytics", "ai_tutor", "remedial_engine"
  enabled   Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 3. MATERIALIZED VIEWS (Dashboard Performance)

```sql
-- Untuk dashboard guru: rata-rata penguasaan per skill per kelas
CREATE MATERIALIZED VIEW mv_class_analytics AS
SELECT
  k.guru_id,
  k.id AS kursus_id,
  s.id AS skill_id,
  s.nama AS skill_nama,
  COUNT(DISTINCT sm.siswa_id) AS total_siswa,
  AVG(sm.p_l) AS avg_penguasaan,
  COUNT(DISTINCT CASE WHEN sm.p_l < 0.6 THEN sm.siswa_id END) AS siswa_belum_kuasai
FROM skill_mastery sm
JOIN skill s ON sm.skill_id = s.id
JOIN kursus k ON s.kursus_id = k.id
GROUP BY k.guru_id, k.id, s.id, s.nama;

CREATE UNIQUE INDEX idx_mv_class_analytics ON mv_class_analytics (guru_id, kursus_id, skill_id);
```

Refresh setiap 15 menit via cron:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_class_analytics;
```

---

## 4. ROW-LEVEL SECURITY (Multi-Tenant Isolation)

```sql
-- Pastikan data hanya bisa diakses oleh guru/sekolah yang berhak
ALTER TABLE kursus ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE jawaban_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_snapshot ENABLE ROW LEVEL SECURITY;

-- Policy: guru hanya bisa lihat data kursusnya sendiri
CREATE POLICY guru_isolasi ON kursus
  USING (guru_id = current_setting('app.current_user_id')::uuid);

-- Policy: siswa hanya bisa lihat data sendiri
CREATE POLICY siswa_isolasi ON jawaban_log
  USING (siswa_id = current_setting('app.current_user_id')::uuid);
```

---

## 5. UUID v7 (Time-Ordered)

Gunakan UUID v7 (bukan UUID v4) untuk semua primary key — mencegah index fragmentation:

```typescript
// src/lib/uuid.ts
import { v7 as uuidv7 } from 'uuid';

// Prisma middleware untuk auto-generate UUID v7
prisma.$use(async (params, next) => {
  if (params.action === 'create' && params.model) {
    if (!params.args.data.id) {
      params.args.data.id = uuidv7();
    }
  }
  return next(params);
});
```

---

## 6. MIGRASI DARI EXISTING DATA

### 6.1 Dari Google Sheets → Postgres

```typescript
// src/app/api/migrate/sheets-to-db/route.ts (Admin-only)
export async function POST() {
  // 1. Baca semua baris dari Google Sheets tab "RekapNilai"
  const rows = await readRows('RekapNilai!A2:J');

  // 2. Untuk setiap baris, upsert ke Postgres
  for (const row of rows) {
    // Buat User (jika belum ada)
    const user = await prisma.user.upsert({
      where: { email: row.nama + '@akalcenter.local' },
      create: { nama: row.nama, role: 'SISWA', email: row.nama + '@akalcenter.local' },
      update: {},
    });

    // Insert JawabanLog (rekonstruksi dari data agregat)
    // Note: data Sheets cuma punya skor total, bukan per-jawaban
    await prisma.jawabanLog.create({
      data: {
        siswaId: user.id,
        soalId: 'MIGRATION_SYSTEM',
        jawabanSiswa: `[MIGRATION] Skor: ${row.skor}/${row.total}`,
        isBenar: row.skor / row.total >= 0.7,
        waktuJawabDetik: 0,
        createdAt: new Date(row.tanggal),
      },
    });
  }

  return Response.json({ migrated: rows.length });
}
```

### 6.2 Dari Keystatic → Postgres (Bridge)

Saat migrasi awal, jalankan script satu kali untuk sinkronisasi slug:

```typescript
// Upsert kursus dari Keystatic slugs
const keystaticSlugs = ['beriman-kepada-malaikat', 'amanah-dan-jujur', /* ... */];
for (const slug of keystaticSlugs) {
  await prisma.kursus.upsert({
    where: { slug },
    create: {
      judul: slug.replace(/-/g, ' '),
      slug,
      keystaticSlug: slug,
      guruId: ahmadKatsiriId, // Guru pertama
    },
    update: {},
  });
}
```

---

## 7. ENVIRONMENT VARIABLES

```env
# Neon Postgres
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/akal_center?sslmode=require"

# Upstash Redis
REDIS_URL="redis://default:pass@xxx.upstash.io:6379"

# Encryption (for Google Drive refresh tokens)
ENCRYPTION_SECRET="random-64-char-string"

# Existing (unchanged)
JWT_SECRET="akal-jwt-secret-2026-32chars!"
ADMIN_API_KEY="akal-admin-2026"
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."
TELEGRAM_CHAT_ID_2="..."
GOOGLE_SHEETS_CLIENT_EMAIL="..."
GOOGLE_SHEETS_PRIVATE_KEY="..."
GOOGLE_SHEET_ID="..."
```

---

## 8. BACKUP STRATEGY

```bash
#!/bin/bash
# infra/backup.sh — Cron harian

# 1. Dump database
pg_dump "$DATABASE_URL" | gzip > "/backups/akal_$(date +%Y%m%d).sql.gz"

# 2. Encrypt
openssl enc -aes-256-cbc -salt -pass pass:"$BACKUP_SECRET" \
  -in "/backups/akal_$(date +%Y%m%d).sql.gz" \
  -out "/backups/akal_$(date +%Y%m%d).sql.gz.enc"

# 3. Upload ke Cloudflare R2
aws s3 cp "/backups/akal_$(date +%Y%m%d).sql.gz.enc" \
  "s3://akal-backups/" \
  --endpoint-url "https://xxx.r2.cloudflarestorage.com"

# 4. Cleanup: keep 7 daily, 4 weekly, 3 monthly
find /backups/ -mtime +7 -name "*.enc" -delete
```

---

## 9. MIGRATION CHECKLIST

- [ ] Install Prisma: `pnpm add prisma @prisma/client`
- [ ] Init schema: `pnpm prisma init`
- [ ] Copy schema di atas ke `prisma/schema.prisma`
- [ ] Run migration: `pnpm prisma migrate dev --name init_core`
- [ ] Generate client: `pnpm prisma generate`
- [ ] Create `src/lib/db.ts` (singleton Prisma client)
- [ ] Migrate data from Google Sheets
- [ ] Bridge Keystatic slugs to Postgres
- [ ] Enable RLS
- [ ] Setup backup cron
