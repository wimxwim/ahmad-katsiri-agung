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
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
]);

export const sekolah = pgTable("sekolah", {
  id: uuid("id").primaryKey().defaultRandom(),
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
    id: uuid("id").primaryKey().defaultRandom(),
    role: roleEnum("role").notNull(),
    nama: varchar("nama", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash"),
    tanggalLahir: timestamp("tanggal_lahir", { withTimezone: true }),
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
  },
  (table) => [index("users_sekolah_id_idx").on(table.sekolahId)]
);

export const kursus = pgTable(
  "kursus",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    guruId: uuid("guru_id")
      .notNull()
      .references(() => users.id),
    sekolahId: uuid("sekolah_id").references(() => sekolah.id),
    judul: varchar("judul", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    keystaticSlug: varchar("keystatic_slug", { length: 255 }),
    deskripsi: text("deskripsi"),
    harga: integer("harga").notNull().default(0),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("kursus_guru_id_idx").on(table.guruId)]
);

export const skill = pgTable(
  "skill",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id),
    nama: varchar("nama", { length: 255 }).notNull(),
    prasyaratSkillId: uuid("prasyarat_skill_id").references((): AnyPgColumn => skill.id),
    bloomLevel: integer("bloom_level").notNull().default(1),
    urutan: integer("urutan").notNull().default(0),
  },
  (table) => [index("skill_kursus_id_urutan_idx").on(table.kursusId, table.urutan)]
);

export const siswaKursus = pgTable(
  "siswa_kursus",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id),
    status: varchar("status", { length: 20 }).notNull().default("AKTIF"),
    tanggalDaftar: timestamp("tanggal_daftar", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("siswa_kursus_unique").on(table.siswaId, table.kursusId)]
);

export const soal = pgTable(
  "soal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id),
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
  (table) => [index("soal_skill_id_idx").on(table.skillId)]
);

export const quizSession = pgTable("quiz_session", {
  id: uuid("id").primaryKey().defaultRandom(),
  kursusId: uuid("kursus_id")
    .notNull()
    .references(() => kursus.id),
  judul: varchar("judul", { length: 255 }).notNull(),
  durasiMenit: integer("durasi_menit").notNull().default(30),
  soalIds: jsonb("soal_ids").notNull().$type<string[]>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jawabanLog = pgTable(
  "jawaban_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id),
    soalId: uuid("soal_id")
      .notNull()
      .references(() => soal.id),
    jawabanSiswa: text("jawaban_siswa").notNull(),
    isBenar: boolean("is_benar").notNull(),
    waktuJawabDetik: integer("waktu_jawab_detik").notNull(),
    quizSessionId: uuid("quiz_session_id").references(() => quizSession.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("jawaban_log_siswa_created_idx").on(table.siswaId, table.createdAt),
    index("jawaban_log_soal_id_idx").on(table.soalId),
  ]
);

export const studentAbility = pgTable("student_ability", {
  id: uuid("id").primaryKey().defaultRandom(),
  siswaId: uuid("siswa_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  kursusId: uuid("kursus_id")
    .notNull()
    .references(() => kursus.id),
  theta: real("theta").notNull().default(0.0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const skillMastery = pgTable(
  "skill_mastery",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id),
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
  ]
);

export const riskSnapshot = pgTable(
  "risk_snapshot",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id),
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
  ]
);

export const remedialRecommendation = pgTable(
  "remedial_recommendation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id),
    prioritasScore: real("prioritas_score").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("tersedia"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("remedial_unique").on(table.siswaId, table.skillId)]
);

export const sertifikat = pgTable(
  "sertifikat",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => users.id),
    kursusId: uuid("kursus_id")
      .notNull()
      .references(() => kursus.id),
    nomorSertifikat: varchar("nomor_sertifikat", { length: 255 }).notNull().unique(),
    qrSecretHash: text("qr_secret_hash").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("sertifikat_siswa_idx").on(table.siswaId)]
);

export const transaksi = pgTable("transaksi", {
  id: uuid("id").primaryKey().defaultRandom(),
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
});

export const fileMateri = pgTable("file_materi", {
  id: uuid("id").primaryKey().defaultRandom(),
  skillId: uuid("skill_id").references(() => skill.id),
  namaFile: varchar("nama_file", { length: 255 }).notNull(),
  tipeMime: varchar("tipe_mime", { length: 255 }).notNull(),
  ukuranBytes: bigint("ukuran_bytes", { mode: "number" }).notNull(),
  lokasi: lokasiStorageEnum("lokasi").notNull(),
  driveFileId: varchar("drive_file_id", { length: 255 }),
  linkAkses: text("link_akses").notNull(),
  guruId: uuid("guru_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const featureFlag = pgTable("feature_flag", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  enabled: boolean("enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sekolahRelations = relations(sekolah, ({ many }) => ({
  users: many(users),
  kursus: many(kursus),
}));

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
  enrollments: many(siswaKursus),
  jawabanLogs: many(jawabanLog),
  skillMasteries: many(skillMastery),
  riskSnapshots: many(riskSnapshot),
  studentAbility: one(studentAbility),
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
}));

export const fileMateriRelations = relations(fileMateri, ({ one }) => ({
  skill: one(skill, {
    fields: [fileMateri.skillId],
    references: [skill.id],
  }),
  guru: one(users, {
    fields: [fileMateri.guruId],
    references: [users.id],
  }),
}));
