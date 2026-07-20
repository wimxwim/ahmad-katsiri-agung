import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
  bigint,
  pgEnum,
  index,
  unique,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { uuidv7 } from "@/lib/uuid";

export const roleEnum = pgEnum("role", [
  "OWNER",
  "ADMIN_SEKOLAH",
  "GURU",
  "ASISTEN_GURU",
  "SISWA",
  "ORANG_TUA",
]);

export const tipeSoalEnum = pgEnum("tipe_soal", ["PG", "ISIAN", "ESSAY"]);

export const lokasiStorageEnum = pgEnum("lokasi_storage", [
  "GDRIVE",
  "VPS_LOKAL",
  "IMAGEKIT",
]);

export const sekolah = pgTable("sekolah", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  nama: varchar("nama", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 255 }).notNull().unique(),
  paket: varchar("paket", { length: 20 }).notNull().default("FREE"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    role: roleEnum("role").notNull(),
    nama: varchar("nama", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash"),
    googleId: varchar("google_id", { length: 255 }).unique(),
    tanggalLahir: timestamp("tanggal_lahir", { withTimezone: true }),
    kelas: varchar("kelas", { length: 10 }),
    noAbsen: varchar("no_absen", { length: 5 }),
    nis: varchar("nis", { length: 30 }),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    parentId: uuid("parent_id").references((): AnyPgColumn => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    uploadCount: integer("upload_count").notNull().default(0),
    failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
  },
  (table) => [
    index("users_sekolah_id_idx").on(table.sekolahId),
    index("users_google_id_idx").on(table.googleId),
  ],
);

export const statusPublikasiEnum = pgEnum("status_publikasi", [
  "DRAFT",
  "PUBLIK",
  "PRIVAT",
  "KRABAT",
  "ARSIP",
]);

export const kursus = pgTable(
  "kursus",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    guruId: uuid("guru_id")
      .notNull()
      .references(() => users.id),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    judul: varchar("judul", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    keystaticSlug: varchar("keystatic_slug", { length: 255 }),
    deskripsi: text("deskripsi"),
    harga: integer("harga").notNull().default(0),
    isPublic: boolean("is_public").notNull().default(true),
    statusPublikasi: statusPublikasiEnum("status_publikasi").notNull().default("DRAFT"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    kodeInvite: varchar("kode_invite", { length: 8 }),
    inviteExpiresAt: timestamp("invite_expires_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    unique("kursus_slug_sekolah_unique").on(table.slug, table.sekolahId),
    // NOTE: PostgreSQL treats NULL as distinct in unique constraints. Two courses
    // with the same slug and sekolahId=NULL will both insert successfully. This is
    // acceptable since kursus can be created before a sekolah is assigned. When a
    // sekolah is set later, the constraint will enforce uniqueness within that sekolah.
    index("kursus_guru_id_idx").on(table.guruId),
    index("kursus_status_publikasi_idx").on(table.statusPublikasi),
  ],
);

export const skill = pgTable(
  "skill",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id, { onDelete: "cascade" }),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    nama: varchar("nama", { length: 255 }).notNull(),
    prasyaratSkillId: uuid("prasyarat_skill_id").references((): AnyPgColumn => skill.id),
    bloomLevel: integer("bloom_level").notNull().default(1),
    urutan: integer("urutan").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("skill_kursus_id_urutan_idx").on(table.kursusId, table.urutan),
    index("skill_sekolah_id_idx").on(table.sekolahId),
    index("skill_sekolah_kursus_idx").on(table.sekolahId, table.kursusId),
  ]
);

export const siswaKursus = pgTable(
  "siswa_kursus",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("AKTIF"),
    inviteTokenId: uuid("invite_token_id"),
    tanggalDaftar: timestamp("tanggal_daftar", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("siswa_kursus_unique").on(table.siswaId, table.kursusId),
    index("siswa_kursus_kursus_id_idx").on(table.kursusId),
    index("siswa_kursus_status_idx").on(table.status),
    index("siswa_kursus_invite_token_idx").on(table.inviteTokenId),
  ]
);

export const inviteTokens = pgTable(
  "invite_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    kursusId: uuid("kursus_id").notNull().references(() => kursus.id, { onDelete: "cascade" }),
    guruId: uuid("guru_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    jti: varchar("jti", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    kursusIdx: index("invite_tokens_kursus_idx").on(t.kursusId),
    guruIdx: index("invite_tokens_guru_idx").on(t.guruId),
  }),
);

export const soal = pgTable(
  "soal",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    teks: text("teks").notNull(),
    tipe: tipeSoalEnum("tipe").notNull(),
    pilihanGanda: jsonb("pilihan_ganda"),
    kunci: text("kunci").notNull(),
    bloomLevel: integer("bloom_level").notNull().default(1),
    irtA: real("irt_a").notNull().default(1.0),
    irtB: real("irt_b").notNull().default(0.0),
    irtC: real("irt_c").notNull().default(0.25),
    eloRating: real("elo_rating").notNull().default(1000),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("soal_skill_id_idx").on(table.skillId),
    index("soal_sekolah_id_idx").on(table.sekolahId),
    index("soal_sekolah_skill_idx").on(table.sekolahId, table.skillId),
  ]
);

export const quizSession = pgTable(
  "quiz_session",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    judul: varchar("judul", { length: 255 }).notNull(),
    durasiMenit: integer("durasi_menit").notNull().default(30),
    soalIds: jsonb("soal_ids").notNull().$type<string[]>(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("quiz_session_kursus_id_idx").on(table.kursusId),
    index("quiz_session_sekolah_id_idx").on(table.sekolahId),
    index("quiz_session_is_active_idx").on(table.isActive),
    index("quiz_session_sekolah_active_idx").on(table.sekolahId, table.isActive),
  ]
);

export const jawabanLog = pgTable(
  "jawaban_log",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    soalId: uuid("soal_id")
      .notNull()
      .references(() => soal.id, { onDelete: "cascade" }),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    jawabanSiswa: text("jawaban_siswa").notNull(),
    isBenar: boolean("is_benar").notNull(),
    waktuJawabDetik: integer("waktu_jawab_detik").notNull(),
    quizSessionId: uuid("quiz_session_id").references(() => quizSession.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("jawaban_log_siswa_created_idx").on(table.siswaId, table.createdAt),
    index("jawaban_log_soal_id_idx").on(table.soalId),
    index("jawaban_log_sekolah_id_idx").on(table.sekolahId),
    index("jawaban_log_sekolah_siswa_idx").on(table.sekolahId, table.siswaId, table.createdAt),
  ]
);

export const studentAbility = pgTable("student_ability", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  siswaId: uuid("siswa_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kursusId: uuid("kursus_id")
    .notNull()
    .references(() => kursus.id, { onDelete: "cascade" }),
  theta: real("theta").notNull().default(0.0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [unique("student_ability_unique").on(table.siswaId, table.kursusId)]);

export const skillMastery = pgTable(
  "skill_mastery",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    pL: real("p_l").notNull().default(0.1),
    memoryStrength: real("memory_strength").notNull().default(1.0),
    lastPracticedAt: timestamp("last_practiced_at", { withTimezone: true }),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    repetitionNum: integer("repetition_num").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("skill_mastery_unique").on(table.siswaId, table.skillId),
    index("skill_mastery_siswa_idx").on(table.siswaId),
    index("skill_mastery_next_review_idx").on(table.nextReviewAt),
    index("skill_mastery_sekolah_id_idx").on(table.sekolahId),
  ]
);

export const riskSnapshot = pgTable(
  "risk_snapshot",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id, { onDelete: "cascade" }),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    riskScore: real("risk_score").notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    komponen: jsonb("komponen").notNull(),
    snapshotDate: timestamp("snapshot_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("risk_snapshot_siswa_date_idx").on(table.siswaId, table.snapshotDate),
    index("risk_snapshot_kursus_status_idx").on(table.kursusId, table.status),
    index("risk_snapshot_sekolah_id_idx").on(table.sekolahId),
  ]
);

export const remedialRecommendation = pgTable(
  "remedial_recommendation",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    prioritasScore: real("prioritas_score").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("tersedia"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("remedial_unique").on(table.siswaId, table.skillId),
    index("remedial_recommendation_sekolah_id_idx").on(table.sekolahId),
  ]
);

export const sertifikat = pgTable(
  "sertifikat",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id, { onDelete: "cascade" }),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    nomorSertifikat: varchar("nomor_sertifikat", { length: 255 }).notNull().unique(),
    qrSecretHash: text("qr_secret_hash").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sertifikat_siswa_idx").on(table.siswaId),
    index("sertifikat_sekolah_id_idx").on(table.sekolahId),
  ]
);

export const transaksi = pgTable(
  "transaksi",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id),
    jumlah: integer("jumlah").notNull(),
    metodePembayaran: varchar("metode_pembayaran", { length: 50 }),
    paymentGatewayRef: varchar("payment_gateway_ref", { length: 255 }).unique(),
    status: varchar("status", { length: 20 }).notNull().default("PENDING"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("transaksi_status_idx").on(t.status),
    index("transaksi_siswa_idx").on(t.siswaId),
    index("transaksi_kursus_id_idx").on(t.kursusId),
  ]
);

export const fileMateri = pgTable(
  "file_materi",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    skillId: uuid("skill_id").references(() => skill.id),
    kursusId: uuid("kursus_id").references(() => kursus.id),
    namaFile: varchar("nama_file", { length: 255 }).notNull(),
    tipeMime: varchar("tipe_mime", { length: 255 }).notNull(),
    ukuranBytes: bigint("ukuran_bytes", { mode: "number" }).notNull(),
    lokasi: lokasiStorageEnum("lokasi").notNull(),
    driveFileId: varchar("drive_file_id", { length: 255 }),
    imagekitFileId: varchar("imagekit_file_id", { length: 255 }),
    linkAkses: text("link_akses").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("uploaded"),
    extractionText: text("extraction_text"),
    kategori: varchar("kategori", { length: 20 }).notNull().default("materi"),
    guruId: uuid("guru_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("file_materi_skill_id_idx").on(t.skillId),
    index("file_materi_guru_id_idx").on(t.guruId),
    index("file_materi_kursus_id_idx").on(t.kursusId),
    index("file_materi_status_idx").on(t.status),
    index("file_materi_kategori_idx").on(t.kategori),
  ]
);

export const featureFlag = pgTable("feature_flag", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  enabled: boolean("enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const eventStore = pgTable("event_store", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  streamId: varchar("stream_id", { length: 255 }).notNull(),
  version: integer("version").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull(),
  previousHash: varchar("previous_hash", { length: 64 }).notNull(),
  signature: varchar("signature", { length: 512 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  streamIdx: index("event_store_stream_idx").on(t.streamId, t.version),
  eventTypeIdx: index("event_store_event_type_idx").on(t.eventType, t.createdAt),
}));

export const googleDriveAuth = pgTable("google_drive_auth", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  guruId: uuid("guru_id").notNull().unique().references(() => users.id),
  refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
  googleEmail: varchar("google_email", { length: 255 }),
  driveFolderId: varchar("drive_folder_id", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("AKTIF"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const teacherReadinessSnapshot = pgTable("teacher_readiness_snapshot", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  guruId: uuid("guru_id").notNull().references(() => users.id),
  triScore: real("tri_score").notNull(),
  komponen: jsonb("komponen").notNull(),
  snapshotDate: timestamp("snapshot_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  guruDateIdx: index("tri_guru_date_idx").on(t.guruId, t.snapshotDate),
}));

export const pengumuman = pgTable("pengumuman", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  judul: varchar("judul", { length: 255 }).notNull(),
  konten: text("konten").notNull(),
  target: varchar("target", { length: 20 }).notNull().default("SEMUA"),
  guruId: uuid("guru_id").notNull().references(() => users.id),
  sekolahId: uuid("sekolah_id").references(() => sekolah.id),
  kursusId: uuid("kursus_id").references(() => kursus.id),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  targetIdx: index("pengumuman_target_idx").on(t.target, t.publishedAt),
  guruIdx: index("pengumuman_guru_idx").on(t.guruId),
  sekolahIdx: index("pengumuman_sekolah_idx").on(t.sekolahId),
}));

export const sekolahRelations = relations(sekolah, ({ many }) => ({
  users: many(users),
  kursus: many(kursus),
  kelas: many(kelas),
}));

export const kelas = pgTable(
  "kelas",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    nama: varchar("nama", { length: 50 }).notNull(),
    tingkat: integer("tingkat").notNull(),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    kursusId: uuid("kursus_id").references(() => kursus.id),
    guruId: uuid("guru_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    kodeInvite: varchar("kode_invite", { length: 8 }),
    inviteExpiresAt: timestamp("invite_expires_at", { withTimezone: true }),
  },
  (table) => [
    index("kelas_guru_id_idx").on(table.guruId),
    index("kelas_sekolah_id_idx").on(table.sekolahId),
    unique("kelas_nama_guru_unique").on(table.nama, table.guruId),
  ],
);

export const siswaKelas = pgTable(
  "siswa_kelas",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kelasId: uuid("kelas_id")
      .notNull()
      .references(() => kelas.id, { onDelete: "cascade" }),
    tanggalMasuk: timestamp("tanggal_masuk", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("siswa_kelas_unique").on(table.siswaId, table.kelasId)]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  sekolah: one(sekolah, {
    fields: [users.sekolahId],
    references: [sekolah.id],
  }),
  parent: one(users, {
    fields: [users.parentId],
    references: [users.id],
    relationName: "parentChild",
  }),
  children: many(users, { relationName: "parentChild" }),
  kursusDibuat: many(kursus, { relationName: "guruKursus" }),
  kelasDiajar: many(kelas, { relationName: "guruKelas" }),
  enrollments: many(siswaKursus),
  jawabanLogs: many(jawabanLog),
  skillMasteries: many(skillMastery),
  riskSnapshots: many(riskSnapshot),
  studentAbility: many(studentAbility),
  driveAuth: one(googleDriveAuth),
  pengumuman: many(pengumuman, { relationName: "guruPengumuman" }),
}));

export const kelasRelations = relations(kelas, ({ one, many }) => ({
  sekolah: one(sekolah, { fields: [kelas.sekolahId], references: [sekolah.id] }),
  kursus: one(kursus, { fields: [kelas.kursusId], references: [kursus.id] }),
  guru: one(users, {
    fields: [kelas.guruId],
    references: [users.id],
    relationName: "guruKelas",
  }),
  siswaKelas: many(siswaKelas),
}));

export const siswaKelasRelations = relations(siswaKelas, ({ one }) => ({
  siswa: one(users, { fields: [siswaKelas.siswaId], references: [users.id] }),
  kelas: one(kelas, { fields: [siswaKelas.kelasId], references: [kelas.id] }),
}));

export const kursusRelations = relations(kursus, ({ one, many }) => ({
  guru: one(users, {
    fields: [kursus.guruId],
    references: [users.id],
    relationName: "guruKursus",
  }),
  sekolah: one(sekolah, {
    fields: [kursus.sekolahId],
    references: [sekolah.id],
  }),
  skills: many(skill),
  enrollments: many(siswaKursus),
  sertifikats: many(sertifikat),
  transaksis: many(transaksi),
  quizSessions: many(quizSession),
  pengumuman: many(pengumuman),
}));

export const pengumumanRelations = relations(pengumuman, ({ one }) => ({
  guru: one(users, {
    fields: [pengumuman.guruId],
    references: [users.id],
    relationName: "guruPengumuman",
  }),
  sekolah: one(sekolah, {
    fields: [pengumuman.sekolahId],
    references: [sekolah.id],
  }),
  kursus: one(kursus, {
    fields: [pengumuman.kursusId],
    references: [kursus.id],
  }),
}));

export const skillRelations = relations(skill, ({ one, many }) => ({
  kursus: one(kursus, {
    fields: [skill.kursusId],
    references: [kursus.id],
  }),
  prasyaratSkill: one(skill, {
    fields: [skill.prasyaratSkillId],
    references: [skill.id],
    relationName: "skillPrerequisite",
  }),
  soals: many(soal),
  masteries: many(skillMastery),
  remedialRecs: many(remedialRecommendation),
}));

export const siswaKursusRelations = relations(siswaKursus, ({ one }) => ({
  siswa: one(users, {
    fields: [siswaKursus.siswaId],
    references: [users.id],
  }),
  kursus: one(kursus, {
    fields: [siswaKursus.kursusId],
    references: [kursus.id],
  }),
}));

export const soalRelations = relations(soal, ({ one, many }) => ({
  skill: one(skill, {
    fields: [soal.skillId],
    references: [skill.id],
  }),
  jawabanLogs: many(jawabanLog),
}));

export const quizSessionRelations = relations(quizSession, ({ one, many }) => ({
  kursus: one(kursus, {
    fields: [quizSession.kursusId],
    references: [kursus.id],
  }),
  jawabanLogs: many(jawabanLog),
}));

export const jawabanLogRelations = relations(jawabanLog, ({ one }) => ({
  siswa: one(users, {
    fields: [jawabanLog.siswaId],
    references: [users.id],
  }),
  soal: one(soal, {
    fields: [jawabanLog.soalId],
    references: [soal.id],
  }),
  quizSession: one(quizSession, {
    fields: [jawabanLog.quizSessionId],
    references: [quizSession.id],
  }),
}));

export const studentAbilityRelations = relations(studentAbility, ({ one }) => ({
  siswa: one(users, {
    fields: [studentAbility.siswaId],
    references: [users.id],
  }),
  kursus: one(kursus, {
    fields: [studentAbility.kursusId],
    references: [kursus.id],
  }),
}));

export const skillMasteryRelations = relations(skillMastery, ({ one }) => ({
  siswa: one(users, {
    fields: [skillMastery.siswaId],
    references: [users.id],
  }),
  skill: one(skill, {
    fields: [skillMastery.skillId],
    references: [skill.id],
  }),
}));

export const riskSnapshotRelations = relations(riskSnapshot, ({ one }) => ({
  siswa: one(users, {
    fields: [riskSnapshot.siswaId],
    references: [users.id],
  }),
  kursus: one(kursus, {
    fields: [riskSnapshot.kursusId],
    references: [kursus.id],
  }),
}));

export const remedialRecommendationRelations = relations(
  remedialRecommendation,
  ({ one }) => ({
    siswa: one(users, {
      fields: [remedialRecommendation.siswaId],
      references: [users.id],
    }),
    skill: one(skill, {
      fields: [remedialRecommendation.skillId],
      references: [skill.id],
    }),
  })
);

export const sertifikatRelations = relations(sertifikat, ({ one }) => ({
  siswa: one(users, {
    fields: [sertifikat.siswaId],
    references: [users.id],
  }),
  kursus: one(kursus, {
    fields: [sertifikat.kursusId],
    references: [kursus.id],
  }),
}));

export const transaksiRelations = relations(transaksi, ({ one }) => ({
  kursus: one(kursus, {
    fields: [transaksi.kursusId],
    references: [kursus.id],
  }),
  siswa: one(users, {
    fields: [transaksi.siswaId],
    references: [users.id],
  }),
}));

export const fileMateriRelations = relations(fileMateri, ({ one, many }) => ({
  skill: one(skill, {
    fields: [fileMateri.skillId],
    references: [skill.id],
  }),
  guru: one(users, {
    fields: [fileMateri.guruId],
    references: [users.id],
  }),
  kursus: one(kursus, { fields: [fileMateri.kursusId], references: [kursus.id] }),
  generations: many(aiGeneration),
}));

export const aiGenerationStatusEnum = pgEnum("ai_generation_status", [
  "queued",
  "extracting",
  "extracted",
  "generating",
  "ready",
  "approved",
  "rejected",
  "failed",
]);

export const aiOutputStatusEnum = pgEnum("ai_output_status", [
  "not_generated",
  "draft",
  "approved",
  "rejected",
  "edited",
]);

export const aiGeneration = pgTable("ai_generation", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  fileMateriId: uuid("file_materi_id").references(() => fileMateri.id),
  guruId: uuid("guru_id").notNull().references(() => users.id),
  kursusId: uuid("kursus_id").references(() => kursus.id),
  sourceFileName: varchar("source_file_name", { length: 255 }).notNull(),
  status: aiGenerationStatusEnum("status").notNull().default("queued"),
  materiStatus: aiOutputStatusEnum("materi_status").notNull().default("not_generated"),
  quizStatus: aiOutputStatusEnum("quiz_status").notNull().default("not_generated"),
  soalStatus: aiOutputStatusEnum("soal_status").notNull().default("not_generated"),
  materiJudul: text("materi_judul"),
  materiKonten: text("materi_konten"),
  materiEditedKonten: text("materi_edited_konten"),
  materiApprovedAt: timestamp("materi_approved_at", { withTimezone: true }),
  quizJudul: text("quiz_judul"),
  quizSoal: jsonb("quiz_soal").$type<{ pertanyaan: string; tipe: "PG" | "ISIAN" | "ESSAY"; opsi?: Record<string, string>; kunci: string }[]>(),
  quizEditedSoal: jsonb("quiz_edited_soal").$type<{ pertanyaan: string; tipe: "PG" | "ISIAN" | "ESSAY"; opsi?: Record<string, string>; kunci: string }[]>(),
  quizApprovedAt: timestamp("quiz_approved_at", { withTimezone: true }),
  soalItems: jsonb("soal_items").$type<{ pertanyaan: string; tipe: "PG" | "ISIAN" | "ESSAY"; opsi?: Record<string, string>; kunci: string }[]>(),
  soalEditedItems: jsonb("soal_edited_items").$type<{ pertanyaan: string; tipe: "PG" | "ISIAN" | "ESSAY"; opsi?: Record<string, string>; kunci: string }[]>(),
  soalApprovedAt: timestamp("soal_approved_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  publishedMateriId: uuid("published_materi_id"),
  publishedQuizId: uuid("published_quiz_id"),
  publishedSoalId: uuid("published_soal_id"),
  tokenInput: integer("token_input"),
  tokenOutput: integer("token_output"),
  modelName: varchar("model_name", { length: 100 }),
  errorMessage: text("error_message"),
  attemptCount: integer("attempt_count").notNull().default(0),
  leaseUntil: timestamp("lease_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (t) => ({
  guruIdx: index("ai_generation_guru_idx").on(t.guruId),
  statusIdx: index("ai_generation_status_idx").on(t.status),
  fileIdx: index("ai_generation_file_idx").on(t.fileMateriId),
  kursusIdx: index("ai_generation_kursus_id_idx").on(t.kursusId),
}));

export const aiGenerationRelations = relations(aiGeneration, ({ one, many }) => ({
  file: one(fileMateri, { fields: [aiGeneration.fileMateriId], references: [fileMateri.id] }),
  guru: one(users, { fields: [aiGeneration.guruId], references: [users.id] }),
  kursus: one(kursus, { fields: [aiGeneration.kursusId], references: [kursus.id] }),
  materiPublished: one(materiPublished, { fields: [aiGeneration.id], references: [materiPublished.aiGenerationId] }),
  quizPublished: one(quizPublished, { fields: [aiGeneration.id], references: [quizPublished.aiGenerationId] }),
  soalPublished: one(soalPublished, { fields: [aiGeneration.id], references: [soalPublished.aiGenerationId] }),
  attempts: many(generationAttempts),
}));

export const promptVersionEnum = pgEnum("prompt_version_enum", [
  "V1",
  "V2",
  "V3",
]);

export const promptVersion = pgTable(
  "prompt_version",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    version: promptVersionEnum("version").notNull(),
    tipe: varchar("tipe", { length: 20 }).notNull(), // 'materi', 'quiz', 'soal'
    systemPrompt: text("system_prompt").notNull(),
    userPromptTemplate: text("user_prompt_template").notNull(),
    modelName: varchar("model_name", { length: 100 }).notNull().default("narrarouter"),
    temperature: real("temperature").notNull().default(0.3),
    maxTokens: integer("max_tokens").notNull().default(4096),
    isActive: boolean("is_active").notNull().default(true),
    changelog: text("changelog"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    activeVersionIdx: index("prompt_version_active_idx").on(t.tipe, t.isActive),
  }),
);

export const promptVersionRelations = relations(promptVersion, () => ({}));

export const generationAttempts = pgTable(
  "generation_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    aiGenerationId: uuid("ai_generation_id")
      .notNull()
      .references(() => aiGeneration.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("started"), // started, success, failed
    outputType: varchar("output_type", { length: 20 }).notNull(), // 'materi', 'quiz', 'soal', 'all'
    tokenInput: integer("token_input"),
    tokenOutput: integer("token_output"),
    modelName: varchar("model_name", { length: 100 }),
    errorMessage: text("error_message"),
    durationMs: integer("duration_ms"),
    promptVersionId: uuid("prompt_version_id").references(() => promptVersion.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    genAttemptGenIdx: index("gen_attempt_ai_gen_idx").on(t.aiGenerationId, t.attemptNumber),
    genAttemptStatusIdx: index("gen_attempt_status_idx").on(t.status),
  }),
);

export const generationAttemptsRelations = relations(generationAttempts, ({ one }) => ({
  aiGeneration: one(aiGeneration, { fields: [generationAttempts.aiGenerationId], references: [aiGeneration.id] }),
  promptVersion: one(promptVersion, { fields: [generationAttempts.promptVersionId], references: [promptVersion.id] }),
}));

export const modeEvaluasiEnum = pgEnum("mode_evaluasi", [
  "BELAJAR",
  "ULANGAN",
  "CBT",
]);

export const materiPublished = pgTable(
  "materi_published",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    aiGenerationId: uuid("ai_generation_id").notNull().unique().references(() => aiGeneration.id),
    guruId: uuid("guru_id").notNull().references(() => users.id),
    kursusId: uuid("kursus_id").notNull().references(() => kursus.id),
    judul: text("judul").notNull(),
    konten: text("konten").notNull(),
    ringkasan: text("ringkasan"),
    urutan: integer("urutan").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    kursusIdx: index("materi_published_kursus_idx").on(t.kursusId, t.urutan),
    guruIdx: index("materi_published_guru_idx").on(t.guruId),
  }),
);

export const quizPublished = pgTable(
  "quiz_published",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    aiGenerationId: uuid("ai_generation_id").notNull().unique().references(() => aiGeneration.id),
    guruId: uuid("guru_id").notNull().references(() => users.id),
    kursusId: uuid("kursus_id").notNull().references(() => kursus.id),
    judul: text("judul").notNull(),
    modeEvaluasi: modeEvaluasiEnum("mode_evaluasi").notNull().default("BELAJAR"),
    durasiMenit: integer("durasi_menit").notNull().default(20),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    kursusIdx: index("quiz_published_kursus_idx").on(t.kursusId),
    guruIdx: index("quiz_published_guru_id_idx").on(t.guruId),
  }),
);

export const soalPublished = pgTable(
  "soal_published",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    aiGenerationId: uuid("ai_generation_id").notNull().references(() => aiGeneration.id),
    quizPublishedId: uuid("quiz_published_id").references(() => quizPublished.id, { onDelete: "cascade" }),
    urutan: integer("urutan").notNull().default(0),
    pertanyaan: text("pertanyaan").notNull(),
    tipe: tipeSoalEnum("tipe").notNull(),
    pilihanGanda: jsonb("pilihan_ganda"),
    kunci: text("kunci").notNull(),
    poin: integer("poin").notNull().default(1),
    skillId: uuid("skill_id").references(() => skill.id, { onDelete: "set null" }),
  },
  (t) => ({
    quizIdx: index("soal_published_quiz_idx").on(t.quizPublishedId, t.urutan),
    aiGenIdx: index("soal_published_ai_generation_id_idx").on(t.aiGenerationId),
    skillIdIdx: index("soal_published_skill_id_idx").on(t.skillId),
  }),
);

export const quizAttempt = pgTable(
  "quiz_attempt",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    quizPublishedId: uuid("quiz_published_id").notNull().references(() => quizPublished.id, { onDelete: "cascade" }),
    siswaId: uuid("siswa_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("SELESAI"),
    nilai: integer("nilai"),
    jumlahBenar: integer("jumlah_benar").notNull().default(0),
    jumlahSalah: integer("jumlah_salah").notNull().default(0),
    waktuMulai: timestamp("waktu_mulai", { withTimezone: true }).notNull().defaultNow(),
    waktuSelesai: timestamp("waktu_selesai", { withTimezone: true }),
    durasiDetik: integer("durasi_detik").notNull().default(0),
    jawaban: jsonb("jawaban").default(sql`'{}'::jsonb`),
  },
  (t) => ({
    siswaIdx: index("quiz_attempt_siswa_idx").on(t.siswaId, t.waktuMulai),
    quizIdx: index("quiz_attempt_quiz_idx").on(t.quizPublishedId),
    statusIdx: index("quiz_attempt_status_idx").on(t.status),
    nilaiIdx: index("quiz_attempt_nilai_idx").on(t.nilai),
    uniqueDone: uniqueIndex("quiz_attempt_siswa_quiz_done_unique").on(t.siswaId, t.quizPublishedId, t.status),
  }),
);

export const materiRead = pgTable(
  "materi_read",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    siswaId: uuid("siswa_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    materiPublishedId: uuid("materi_published_id").notNull().references(() => materiPublished.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
    selesai: boolean("selesai").notNull().default(false),
    progressPersen: integer("progress_persen").notNull().default(0),
  },
  (t) => ({
    siswaMateriUnique: unique("materi_read_siswa_materi_unique").on(t.siswaId, t.materiPublishedId),
    siswaIdx: index("materi_read_siswa_idx").on(t.siswaId, t.readAt),
    materiIdx: index("materi_read_materi_published_idx").on(t.materiPublishedId),
  }),
);

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  family: varchar("family", { length: 64 }).notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userFamilyIdx: index("refresh_tokens_user_family_idx").on(t.userId, t.family),
  tokenHashIdx: unique("refresh_tokens_token_hash_unique").on(t.tokenHash),
}));

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const materiPublishedRelations = relations(materiPublished, ({ one, many }) => ({
  aiGeneration: one(aiGeneration, { fields: [materiPublished.aiGenerationId], references: [aiGeneration.id] }),
  guru: one(users, { fields: [materiPublished.guruId], references: [users.id] }),
  kursus: one(kursus, { fields: [materiPublished.kursusId], references: [kursus.id] }),
  reads: many(materiRead),
}));

export const quizPublishedRelations = relations(quizPublished, ({ one, many }) => ({
  aiGeneration: one(aiGeneration, { fields: [quizPublished.aiGenerationId], references: [aiGeneration.id] }),
  guru: one(users, { fields: [quizPublished.guruId], references: [users.id] }),
  kursus: one(kursus, { fields: [quizPublished.kursusId], references: [kursus.id] }),
  soals: many(soalPublished),
  attempts: many(quizAttempt),
}));

export const soalPublishedRelations = relations(soalPublished, ({ one }) => ({
  quiz: one(quizPublished, { fields: [soalPublished.quizPublishedId], references: [quizPublished.id] }),
  aiGeneration: one(aiGeneration, { fields: [soalPublished.aiGenerationId], references: [aiGeneration.id] }),
}));

export const quizAttemptRelations = relations(quizAttempt, ({ one }) => ({
  quiz: one(quizPublished, { fields: [quizAttempt.quizPublishedId], references: [quizPublished.id] }),
  siswa: one(users, { fields: [quizAttempt.siswaId], references: [users.id] }),
}));

export const materiReadRelations = relations(materiRead, ({ one }) => ({
  siswa: one(users, { fields: [materiRead.siswaId], references: [users.id] }),
  materi: one(materiPublished, { fields: [materiRead.materiPublishedId], references: [materiPublished.id] }),
}));

export const googleDriveAuthRelations = relations(googleDriveAuth, ({ one }) => ({
  guru: one(users, {
    fields: [googleDriveAuth.guruId],
    references: [users.id],
  }),
}));

export const teacherReadinessSnapshotRelations = relations(teacherReadinessSnapshot, ({ one }) => ({
  guru: one(users, {
    fields: [teacherReadinessSnapshot.guruId],
    references: [users.id],
  }),
}));

export const tokenBalances = pgTable("token_balances", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  totalTopup: integer("total_topup").notNull().default(0),
  totalSpent: integer("total_spent").notNull().default(0),
  lastTopupAt: timestamp("last_topup_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }),
  tier: varchar("tier", { length: 20 }).notNull().default("free"),
  resetAt: timestamp("reset_at", { withTimezone: true }),
});

export const tokenBalancesRelations = relations(tokenBalances, ({ one }) => ({
  user: one(users, {
    fields: [tokenBalances.userId],
    references: [users.id],
  }),
}));

export const tokenTransactionTypeEnum = pgEnum("token_transaction_type", [
  "TOPUP",
  "GRANT",
  "DEDUCT",
  "REFUND",
  "DONATION",
]);

export const tokenTransactionStatusEnum = pgEnum("token_transaction_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export const tokenTransactions = pgTable(
  "token_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: tokenTransactionTypeEnum("type").notNull(),
    status: tokenTransactionStatusEnum("status").notNull().default("COMPLETED"),
    amount: integer("amount").notNull(),
    balanceBefore: integer("balance_before").notNull().default(0),
    balanceAfter: integer("balance_after").notNull().default(0),
    paymentMethod: varchar("payment_method", { length: 50 }),
    proofFileId: varchar("proof_file_id", { length: 255 }),
    proofLink: text("proof_link"),
    notes: text("notes"),
    referenceId: varchar("reference_id", { length: 255 }),
    chainHash: varchar("chain_hash", { length: 64 }),
    prevHash: varchar("prev_hash", { length: 64 }),
    nonce: varchar("nonce", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("token_transactions_user_id_idx").on(t.userId),
    index("token_transactions_type_idx").on(t.type),
    index("token_transactions_created_at_idx").on(t.createdAt),
    index("token_transactions_reference_idx").on(t.userId, t.type, t.referenceId),
  ],
);

export const tokenTransactionsRelations = relations(tokenTransactions, ({ one }) => ({
  user: one(users, {
    fields: [tokenTransactions.userId],
    references: [users.id],
  }),
}));

export const visibilityEnum = pgEnum("visibility", [
  "PRIVAT",
  "PUBLIK",
  "KRABAT",
  "ARSIP",
]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const krabatStatusEnum = pgEnum("krabat_status", [
  "PENDING",
  "ACTIVE",
  "REJECTED",
]);

export const materiSharing = pgTable("materi_sharing", {
  materiPublishedId: uuid("materi_published_id")
    .primaryKey()
    .references(() => materiPublished.id, { onDelete: "cascade" }),
  visibility: visibilityEnum("visibility").notNull().default("PRIVAT"),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default("PENDING"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const krabatConnections = pgTable(
  "krabat_connections",
  {
    id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
    guruId: uuid("guru_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    connectedGuruId: uuid("connected_guru_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: krabatStatusEnum("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    guruPairUnique: unique("krabat_connections_pair_unique").on(t.guruId, t.connectedGuruId),
    guruIdx: index("krabat_connections_guru_idx").on(t.guruId, t.status),
    connectedIdx: index("krabat_connections_connected_idx").on(t.connectedGuruId, t.status),
  }),
);

export const materiSharingRelations = relations(materiSharing, ({ one }) => ({
  materiPublished: one(materiPublished, {
    fields: [materiSharing.materiPublishedId],
    references: [materiPublished.id],
  }),
}));

export const krabatConnectionsRelations = relations(krabatConnections, ({ one }) => ({
  guru: one(users, {
    fields: [krabatConnections.guruId],
    references: [users.id],
  }),
  connectedGuru: one(users, {
    fields: [krabatConnections.connectedGuruId],
    references: [users.id],
  }),
}));

// ============================================================
// FASE BISNIS — Kuota, AI Tracking, Taksonomi, Payment, Onboarding
// ============================================================

export const quotas = pgTable("quotas", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  role: varchar("role", { length: 32 }).notNull(),
  resourceType: varchar("resource_type", { length: 64 }).notNull(),
  limitValue: integer("limit_value").notNull(),
  windowSeconds: integer("window_seconds").notNull().default(0),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quotaUsages = pgTable("quota_usages", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  quotaId: uuid("quota_id").notNull().references(() => quotas.id, { onDelete: "cascade" }),
  currentUsage: integer("current_usage").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: unique().on(t.userId, t.quotaId, t.windowStart),
}));

export const aiRequests = pgTable("ai_requests", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  model: varchar("model", { length: 64 }).notNull(),
  provider: varchar("provider", { length: 32 }).notNull().default("nararouter"),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  costIdrCents: bigint("cost_idr_cents", { mode: "number" }).notNull().default(0),
  requestType: varchar("request_type", { length: 32 }).notNull(),
  status: varchar("status", { length: 16 }).notNull().default("completed"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdDateIdx: index("idx_ai_requests_user_date").on(t.userId, t.createdAt),
  dateIdx: index("idx_ai_requests_date").on(t.createdAt),
}));

export const mataPelajaran = pgTable("mata_pelajaran", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  nama: varchar("nama", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  kategori: varchar("kategori", { length: 50 }).notNull().default("wajib"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jenjang = pgTable("jenjang", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  nama: varchar("nama", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  urutan: integer("urutan").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  paymentType: varchar("payment_type", { length: 30 }).notNull().default("qris_static"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  proofImageUrl: text("proof_image_url"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userStatusIdx: index("idx_payments_user_status").on(t.userId, t.status),
  statusIdx: index("idx_payments_status").on(t.status, t.createdAt),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const aiRequestsRelations = relations(aiRequests, ({ one }) => ({
  user: one(users, {
    fields: [aiRequests.userId],
    references: [users.id],
  }),
}));

export const quotaUsagesRelations = relations(quotaUsages, ({ one }) => ({
  user: one(users, {
    fields: [quotaUsages.userId],
    references: [users.id],
  }),
  quota: one(quotas, {
    fields: [quotaUsages.quotaId],
    references: [quotas.id],
  }),
}));

export const onboardingProgress = pgTable("onboarding_progress", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  emailVerified: boolean("email_verified").notNull().default(false),
  profileCompleted: boolean("profile_completed").notNull().default(false),
  tourCompleted: boolean("tour_completed").notNull().default(false),
  firstCourseCreated: boolean("first_course_created").notNull().default(false),
  firstMaterialUploaded: boolean("first_material_uploaded").notNull().default(false),
  firstAiGenerated: boolean("first_ai_generated").notNull().default(false),
  firstCoursePublished: boolean("first_course_published").notNull().default(false),
  currentStep: varchar("current_step", { length: 32 }).notNull().default("registration"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom().$defaultFn(() => uuidv7()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  tokenIdx: index("password_reset_tokens_token_idx").on(t.token),
  userIdIdx: index("password_reset_tokens_user_id_idx").on(t.userId),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));
