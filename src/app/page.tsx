"use client";

import Link from "next/link";
import { WA_NUMBER } from "@/lib/constants";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  FileStack,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Upload,
  ChevronDown,
  FileText,
  Lock,
  Zap,
  Globe,
  Users,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 64, filter: "blur(12px)" },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const pipeline = [
  {
    step: "01",
    title: "Upload Dokumen",
    desc: "Guru mengunggah PDF, DOCX, atau bahan ajar ke ruang kerja mereka.",
    icon: Upload,
  },
  {
    step: "02",
    title: "AI Membuat Draft",
    desc: "Sistem mengekstrak isi dokumen lalu membuat draft materi, quiz, dan soal sekaligus.",
    icon: Bot,
  },
  {
    step: "03",
    title: "Guru Review & Publish",
    desc: "Semua hasil AI tetap butuh persetujuan guru. Tidak ada auto-publish yang berisiko.",
    icon: FileStack,
  },
  {
    step: "04",
    title: "Siswa Belajar & Dinilai",
    desc: "Materi yang lolos review diterbitkan ke ruang siswa, lengkap dengan evaluasi dan progres.",
    icon: BookOpen,
  },
  {
    step: "05",
    title: "Analitik untuk Guru",
    desc: "Hasil belajar siswa masuk ke dasbor analitik sehingga guru tahu skill mana yang perlu diulang.",
    icon: LayoutDashboard,
  },
];

const faqs = [
  {
    q: "Apakah AKAL Center gratis untuk guru?",
    a: "Untuk pilot multi-guru, Anda bisa mulai tanpa biaya. Pembayaran hanya untuk paket lanjut dengan kuota AI lebih besar dan multi-sekolah. Hubungi kami lewat WhatsApp untuk diskusi.",
  },
  {
    q: "Apakah siswa perlu bayar?",
    a: "Tidak. Siswa mendaftar gratis dengan email. Akses kursus ditentukan oleh guru masing-masing.",
  },
  {
    q: "Bagaimana keamanan file upload?",
    a: "Semua file diverifikasi MIME dan magic bytes. Tidak ada file yang dieksekusi di server. Konten hanya dipakai sebagai teks untuk generator AI.",
  },
  {
    q: "Apakah hasil AI langsung tayang ke siswa?",
    a: "Tidak. Semua hasil AI adalah draft. Guru wajib review dan klik publish sebelum materi sampai ke siswa.",
  },
  {
    q: "Bisa dipakai banyak guru di satu sekolah?",
    a: "Ya. Setiap guru punya ruang kerja terpisah, data siswa terisolasi per kursus, dan admin sekolah mendapat laporan agregat.",
  },
];

const valuePillars = [
  {
    title: "Tegas",
    label: "PILAR 01",
    desc: "Pemisahan portal yang jelas: publik, guru, dan siswa. Tidak ada lagi kebingungan login atau akses yang tercampur.",
    icon: ShieldCheck,
    span: "lg:col-span-1",
  },
  {
    title: "Dokumen Jadi Pembelajaran",
    label: "PILAR 02",
    desc: "Upload PDF atau DOCX, AI membantu mengubah isinya menjadi draft materi, quiz, dan soal yang siap ditinjau.",
    icon: FileText,
    span: "lg:col-span-1",
  },
  {
    title: "Guru Pusat",
    label: "PILAR 03",
    desc: "Semua hasil AI adalah draft. Guru memegang keputusan akhir: review, edit, lalu publish. Tidak ada auto-publish yang berisiko.",
    icon: Users,
    span: "lg:col-span-2",
  },
  {
    title: "Aman",
    label: "PILAR 04",
    desc: "File upload diverifikasi, konten tidak tepercaya disanitasi. Setiap peran hanya masuk ke dashboard yang tepat.",
    icon: Lock,
    span: "lg:col-span-1",
  },
  {
    title: "Multi-Guru",
    label: "PILAR 05",
    desc: "Setiap guru punya ruang kerja terpisah, data siswa terisolasi per kursus. Admin sekolah mendapat laporan agregat.",
    icon: LayoutDashboard,
    span: "lg:col-span-1",
  },
  {
    title: "Modern 2026",
    label: "PILAR 06",
    desc: "Arsitektur cloud-ready: serverless, database terkelola, penyimpanan media global. Siap tumbuh saat skala bertambah tanpa rombak dari nol.",
    icon: Zap,
    span: "lg:col-span-2",
  },
];

const tigaDunia = [
  { title: "Dunia Publik", desc: "Landing, katalog kursus, tools Quran. Semua bisa diakses tanpa login.", icon: Globe },
  { title: "Dunia Guru", desc: "Upload dokumen, kelola draft AI, pantau progres siswa, atur kursus dari satu dashboard.", icon: ShieldCheck },
  { title: "Dunia Siswa", desc: "Akses materi, kerjakan quiz, lihat progres belajar. Masuk dari perangkat apa pun.", icon: GraduationCap },
];

export default function Home() {
  return (
    <main className="bg-surface">
      {/* ═══════════════════════════════════════════════ */}
      {/* HERO — ASYMMETRIC: LEFT TEXT, RIGHT VISUAL       */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border-precision bg-glass px-4 py-2 text-xs font-bold tracking-badge text-primary">
                AKAL CENTER 2026
              </span>

              <h1 className="mt-8 font-heading text-4xl font-bold leading-hero tracking-tight text-on-surface sm:text-5xl lg:text-7xl">
                Platform guru-siswa yang mengubah dokumen jadi pembelajaran
                <span className="shimmer-text"> siap pakai</span>.
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-relaxed text-on-surface-variant sm:text-base lg:text-lg">
                Bukan lagi website materi satu guru. Ini fondasi baru untuk multi-guru: upload dokumen,
                hasilkan draft materi, quiz, dan soal dengan AI, lalu kelola semuanya dari ruang kerja yang lebih rapi.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/masuk"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Masuk
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <Link
                  href="/daftar"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border-precision bg-glass px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  Daftar Gratis
                </Link>
                <Link
                  href="/fitur"
                  className="inline-flex items-center gap-2 rounded-2xl text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
                >
                  Lihat Fitur
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <div className="rounded-[40px] border border-border-precision bg-white p-4 shadow-glass-xl">
                <div className="rounded-card border border-border-precision bg-[#052b19] p-5 text-white sm:p-6">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-badge text-white/60">Killer Feature</p>
                      <p className="mt-1 font-heading text-xl font-semibold">AI Document Generator</p>
                    </div>
                    <Sparkles className="h-6 w-6 text-[#eec055]" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {pipeline.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.step} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#eec055]">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold tracking-badge text-white/50">STEP {item.step}</p>
                              <p className="mt-1 font-heading text-lg font-semibold">{item.title}</p>
                              <p className="mt-1 text-sm leading-relaxed text-white/70">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-5 text-xs leading-relaxed text-white/55">
                    Semua hasil AI tetap menjadi <strong className="text-white">draft</strong>. Guru tetap memegang keputusan akhir sebelum materi dipakai siswa.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* VALUE PILLARS — BENTO GRID (2-COL ASYMMETRIC)   */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            custom={0}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border-precision bg-glass px-4 py-2 text-xs font-bold tracking-badge text-primary">
              MENGAPA BERBEDA
            </span>
            <h2 className="mt-6 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl lg:text-5xl">
              Bukan LMS generik. Bukan lagi alur lama yang tercampur.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base lg:text-lg">
              AKAL Center versi baru memisahkan dengan tegas ruang publik, ruang guru, dan ruang siswa.
              Setiap pilar dirancang agar pipeline terasa, navigasi jelas, dan tidak ada lagi login yang terasa seperti masuk ke tempat yang salah.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:gap-6">
            {valuePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  custom={i + 1}
                  className={`rounded-2xl border border-border-precision bg-white p-6 shadow-glass-lg transition-colors hover:border-primary/25 sm:p-8 ${pillar.span}`}
                >
                  <span className="text-xs font-bold tracking-badge text-primary/60">{pillar.label}</span>
                  <div className="mt-4 flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-on-surface">{pillar.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{pillar.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* TIGA DUNIA — 2-COL ZIG-ZAG                      */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              custom={0}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border-precision bg-glass px-4 py-2 text-xs font-bold tracking-badge text-primary">
                TIGA DUNIA
              </span>
              <h2 className="mt-6 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                Publik. Guru. Siswa.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-on-surface-variant sm:text-base">
                Setiap dunia punya jalur masuk, dashboard, dan pengalaman yang berbeda. Tidak ada lagi kebingungan: siapa Anda menentukan apa yang Anda lihat.
              </p>
              <div className="mt-8 space-y-4">
                {tigaDunia.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-100px" }}
                      custom={i + 1}
                      className="flex items-start gap-4 rounded-2xl border border-border-precision bg-glass p-4"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-heading text-base font-semibold text-on-surface">{item.title}</p>
                        <p className="mt-1 text-sm text-on-surface-variant">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              custom={2}
            >
              <div className="rounded-[40px] border border-border-precision bg-white p-4 shadow-glass-xl">
                <div className="relative overflow-hidden rounded-card border border-border-precision bg-gradient-to-br from-primary to-[#003d24] p-8 text-white">
                  <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/5 blur-3xl" />
                  <div className="relative space-y-6">
                    {[
                      { label: "PUBLIK", count: "Katalog + Quran", color: "bg-white/10" },
                      { label: "GURU", count: "Upload + Draft + Analitik", color: "bg-[#eec055]/20" },
                      { label: "SISWA", count: "Belajar + Quiz + Progres", color: "bg-white/10" },
                    ].map((d) => (
                      <div key={d.label} className={`rounded-2xl ${d.color} p-4 backdrop-blur-sm`}>
                        <p className="text-xs font-bold tracking-badge text-white/60">{d.label}</p>
                        <p className="mt-1 font-heading text-lg font-semibold">{d.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* WORKFLOW PIPELINE — STAGGERED CARDS              */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            custom={0}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border-precision bg-glass px-4 py-2 text-xs font-bold tracking-badge text-primary">
              BAGAIMANA CARA KERJANYA
            </span>
            <h2 className="mt-6 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
              Dari dokumen ke pembelajaran dalam 5 langkah
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {pipeline.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  custom={i + 1}
                  className="rounded-2xl border border-border-precision bg-white p-6 shadow-glass-lg"
                >
                  <span className="text-xs font-bold tracking-badge text-primary/60">{item.step}</span>
                  <div className="mt-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-lg font-semibold text-on-surface">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* KILLER FEATURE — DOUBLE-BEZEL ARCHITECTURE      */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            custom={0}
            className="mb-10"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border-precision bg-glass px-4 py-2 text-xs font-bold tracking-badge text-primary">
              KILLER FEATURE
            </span>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            custom={1}
          >
            <div className="rounded-[40px] border border-border-precision bg-white p-4 shadow-glass-xl">
              <div className="rounded-card border border-border-precision bg-gradient-to-br from-primary to-[#003d24] p-6 text-white sm:p-10 lg:p-14">
                <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-[#eec055]" />
                      <p className="text-xs font-bold tracking-badge text-white/60">AI DOCUMENT GENERATOR</p>
                    </div>
                    <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                      Upload dokumen, dapatkan draft pembelajaran instan
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
                      Guru mengunggah PDF atau DOCX, sistem mengekstrak teks lalu AI membuat draft materi, quiz, dan soal sekaligus. Semua hasil tetap draft — guru wajib review sebelum publish.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href="/daftar"
                        className="group inline-flex items-center gap-2 rounded-2xl bg-[#eec055] px-6 py-3.5 text-sm font-semibold text-[#003d24] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Mulai Upload
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#003d24]/15 transition-transform group-hover:translate-x-0.5">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {pipeline.slice(0, 3).map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.step} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#eec055]">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold tracking-badge text-white/50">STEP {item.step}</p>
                              <p className="mt-1 font-heading text-base font-semibold">{item.title}</p>
                              <p className="mt-1 text-sm text-white/70">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* TRUST + SECURITY — 2-COL ASYMMETRIC             */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              custom={0}
              className="rounded-2xl border border-border-precision bg-white p-6 shadow-glass-lg sm:p-10"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border-precision bg-glass px-4 py-2 text-xs font-bold tracking-badge text-primary">
                DIPERCAYA
              </span>
              <h2 className="mt-6 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                Dipercaya oleh Guru PAI di Indonesia
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-on-surface-variant sm:text-base">
                Platform ini dibangun bersama dan didukung oleh para akademisi pendidikan Islam untuk menghadirkan pembelajaran yang lebih terstruktur dan modern.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-border-precision bg-glass px-5 py-2.5 text-sm font-semibold text-on-surface">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Didukung Akademisi Pendidikan Islam
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border-precision bg-glass px-5 py-2.5 text-sm font-semibold text-on-surface">
                  <Lock className="h-4 w-4 text-primary" />
                  Security by Default
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              custom={1}
              className="flex flex-col gap-4"
            >
              <div className="rounded-2xl border border-border-precision bg-white p-6 shadow-glass">
                <p className="font-heading text-xl font-semibold text-on-surface">Security by default</p>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  File upload diperlakukan sebagai konten tidak tepercaya, hasil AI selalu draft, dan setiap peran hanya masuk ke dashboard yang tepat.
                </p>
              </div>
              <div className="rounded-2xl border border-border-precision bg-white p-6 shadow-glass">
                <p className="font-heading text-xl font-semibold text-on-surface">Siap tumbuh bersama</p>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Fase sekarang tetap hemat dengan arsitektur cloud. Saat guru dan siswa sudah banyak, infrastruktur bisa diskalakan tanpa rombak produk dari nol.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* PRICING + FAQ — DARK DOUBLE-BEZEL                */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            custom={0}
          >
            <div className="rounded-[40px] border border-border-precision bg-white p-4 shadow-glass-xl">
              <div className="rounded-card border border-border-precision bg-gradient-to-br from-primary to-[#003d24] p-6 text-white sm:p-10 lg:p-14">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-badge text-white/80">
                      HARGA & PEMBAYARAN
                    </span>
                    <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                      Mulai gratis. Bayar hanya saat Anda siap.
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                      Pembayaran online belum tersedia. Untuk paket lanjut, multi-guru, atau multi-sekolah,
                      kami diskusikan dulu lewat WhatsApp. Tidak ada tagihan tersembunyi, tidak ada auto-charge.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                        <p className="text-xs font-bold tracking-wider text-white/60">GRATIS</p>
                        <p className="mt-2 font-heading text-xl font-semibold">1 guru, 1 kelas</p>
                        <p className="mt-2 text-sm text-white/70">
                          Upload sampai 5 dokumen per bulan. Cocok untuk guru yang baru coba-coba.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                        <p className="text-xs font-bold tracking-wider text-white/60">SEKOLAH</p>
                        <p className="mt-2 font-heading text-xl font-semibold">Multi-guru, multi-kelas</p>
                        <p className="mt-2 text-sm text-white/70">
                          Kuota AI lebih besar, admin sekolah, dan laporan agregat. Harga via WA.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href="/daftar"
                        className="group inline-flex items-center gap-2 rounded-2xl bg-[#eec055] px-6 py-3.5 text-sm font-semibold text-[#003d24] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Coba Gratis
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#003d24]/15 transition-transform group-hover:translate-x-0.5">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                      <a
                        href={`https://wa.me/${WA_NUMBER}?text=Halo%2C%20saya%20tertarik%20dengan%20AKAL%20Center%20untuk%20sekolah`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Diskusi via WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="rounded-card border border-white/15 bg-white/5 p-5 lg:p-6">
                    <p className="text-xs font-bold tracking-badge text-white/60">FAQ SINGKAT</p>
                    <div className="mt-4 space-y-3">
                      {faqs.slice(0, 3).map((item) => (
                        <details
                          key={item.q}
                          className="group rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <summary className="flex cursor-pointer items-start justify-between gap-3 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
                            <span>{item.q}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                          </summary>
                          <p className="mt-2 text-sm leading-relaxed text-white/75">{item.a}</p>
                        </details>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-white/55">
                      Pertanyaan lebih lengkap? Lihat semua FAQ di bawah atau hubungi kami.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FAQ FULL — 2-COL GRID                           */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            custom={0}
            className="rounded-2xl border border-border-precision bg-white p-6 shadow-glass-lg sm:p-10"
          >
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-border-precision bg-glass px-4 py-2 text-xs font-bold tracking-badge text-primary">
                  FAQ PRODUK
                </span>
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-on-surface">
                  Pertanyaan yang sering diajukan
                </h2>
              </div>
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:underline sm:self-auto"
              >
                <MessageCircle className="h-4 w-4" />
                Tanya langsung via WA
              </a>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {faqs.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-border-precision bg-glass px-4 py-3"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-3 text-sm font-semibold text-on-surface [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.a}</p>
                </details>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* BOTTOM CTA — DOUBLE-BEZEL + BUTTON-IN-BUTTON     */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            custom={0}
          >
            <div className="rounded-[40px] border border-border-precision bg-white p-4 shadow-glass-xl">
              <div className="rounded-card border border-border-precision bg-gradient-to-br from-primary to-[#003d24] p-8 text-center sm:p-14 lg:p-20">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold tracking-badge text-white/80">
                  MULAI SEKARANG
                </span>
                <h2 className="mt-6 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Siap mengubah cara Anda mengajar?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  Daftar gratis, upload dokumen pertama Anda, dan lihat bagaimana AI membantu menyiapkan materi pembelajaran dalam hitungan menit.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/daftar"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-[#eec055] px-8 py-4 text-sm font-semibold text-[#003d24] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Coba Gratis Sekarang
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#003d24]/15 transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                  <a
                    href={`https://wa.me/${WA_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Tanya dulu
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}