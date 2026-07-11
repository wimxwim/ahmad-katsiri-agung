"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  Brain,
  FileText,
  GraduationCap,
  LayoutDashboard,
  School,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  BarChart3,
  BookOpen,
  Shield,
  Globe,
  Workflow,
  PenTool,
} from "lucide-react";
import { EASE_CURVE, WA_NUMBER } from "@/lib/constants";

const guruFeatures = [
  {
    icon: Upload,
    title: "Upload & Extract",
    desc: "Upload PDF atau DOCX langsung ke workspace. Sistem mengekstrak teks dan struktur dokumen secara otomatis.",
  },
  {
    icon: Bot,
    title: "AI Draft Generator",
    desc: "Satu dokumen bisa menghasilkan draft materi, quiz, dan soal sekaligus. Semua masih status draft.",
  },
  {
    icon: PenTool,
    title: "Review & Publish",
    desc: "Tinjau, edit, dan publish konten setelah AI selesai membuat draft. Tidak ada auto-publish.",
  },
  {
    icon: BarChart3,
    title: "Analitik Kelas",
    desc: "Lihat progres siswa, nilai quiz, dan skill mana yang perlu diulang — semuanya dari dashboard guru.",
  },
  {
    icon: UserCheck,
    title: "Manajemen Siswa",
    desc: "Tambah, atur, dan kelompokkan siswa per kursus. Data terisolasi dan aman.",
  },
  {
    icon: Workflow,
    title: "Multi-Guru Workspace",
    desc: "Setiap guru punya ruang kerja sendiri. Kolaborasi tanpa campur aduk data.",
  },
];

const siswaFeatures = [
  {
    icon: BookOpen,
    title: "Belajar Mandiri",
    desc: "Akses materi yang sudah dipublikasikan guru kapan saja, dari perangkat mana pun.",
  },
  {
    icon: PenTool,
    title: "Quiz & Evaluasi",
    desc: "Kerjakan quiz dan soal yang dibuat guru. Skor langsung terlihat dan progres tersimpan.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Pribadi",
    desc: "Lihat mata pelajaran aktif, tugas yang harus dikerjakan, dan riwayat belajar.",
  },
];

const sekolahFeatures = [
  {
    icon: School,
    title: "Admin Sekolah",
    desc: "Dashboard khusus untuk melihat aktivitas seluruh guru dan siswa di sekolah.",
  },
  {
    icon: Shield,
    title: "Keamanan Data",
    desc: "Data siswa terisolasi per kursus. Tidak ada bocor antar kelas atau guru.",
  },
  {
    icon: Globe,
    title: "Multi-Sekolah",
    desc: "Fondasi arsitektur siap untuk yayasan yang mengelola lebih dari satu sekolah.",
  },
];

const pipelineSteps = [
  {
    step: "01",
    title: "Guru Upload Dokumen",
    desc: "PDF atau DOCX bahan ajar diunggah ke workspace guru. Sistem membaca MIME dan magic bytes untuk verifikasi keamanan.",
    icon: Upload,
  },
  {
    step: "02",
    title: "AI Ekstrak & Generate",
    desc: "Teks diekstrak dari dokumen, lalu AI menghasilkan draft materi, quiz, dan soal secara paralel.",
    icon: Bot,
  },
  {
    step: "03",
    title: "Draft Masuk ke Review",
    desc: "Semua hasil AI masuk sebagai draft. Guru melihat pratinjau sebelum memutuskan publish atau edit.",
    icon: FileText,
  },
  {
    step: "04",
    title: "Publish ke Siswa",
    desc: "Materi yang sudah di-review guru diterbitkan ke dashboard siswa. Quiz dan soal siap dikerjakan.",
    icon: GraduationCap,
  },
  {
    step: "05",
    title: "Analitik & Iterasi",
    desc: "Hasil belajar siswa masuk ke dashboard guru. Guru tahu mana yang perlu diperbaiki atau diulang.",
    icon: BarChart3,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: EASE_CURVE },
};

export default function FiturPage() {
  return (
    <main className="bg-surface pb-20">
      <section className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
          className="rounded-2xl border border-border-precision bg-white p-6 shadow-glass-lg sm:p-10 lg:p-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold tracking-badge text-primary">
            FITUR LENGKAP
          </span>
          <h1 className="mt-6 font-heading text-4xl font-bold leading-hero tracking-tight text-on-surface sm:text-5xl lg:text-7xl">
            Fitur AKAL Center
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base lg:text-lg">
            Platform yang memisahkan dengan tegas peran guru, siswa, dan sekolah. Dari upload dokumen
            sampai analitik hasil belajar — semuanya dirancang agar alurnya terasa, bukan sekadar fitur yang ditumpuk.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-3 sm:px-5 lg:px-8">
        <motion.div {...fadeUp} className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold tracking-badge text-primary">
            UNTUK GURU
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
            Ruang kerja yang memberdayakan guru
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
            Bukan sekadar bisa upload dan lihat nilai. Guru punya kendali penuh atas pipeline dari dokumen mentah sampai materi yang sampai ke siswa.
          </p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guruFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE_CURVE }}
                className="rounded-card border border-border-precision bg-glass p-5 shadow-glass backdrop-blur-2xl sm:p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-3 sm:px-5 lg:px-8">
        <motion.div {...fadeUp} className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold tracking-badge text-primary">
            UNTUK SISWA
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
            Belajar jadi lebih terarah
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
            Siswa masuk dari portal yang memang untuk mereka. Materi, quiz, dan progres semuanya di satu tempat yang rapi.
          </p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {siswaFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE_CURVE }}
                className={cn(
                  "rounded-card border border-border-precision bg-white p-5 shadow-glass sm:p-6",
                  i === 0 && "sm:col-span-2"
                )}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-3 sm:px-5 lg:px-8">
        <motion.div {...fadeUp} className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold tracking-badge text-primary">
            UNTUK SEKOLAH
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
            Fondasi untuk institusi
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
            Sekolah dan yayasan butuh visibilitas lintas guru. Dashboard admin dan arsitektur multi-tenant sudah siap sejak awal.
          </p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sekolahFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE_CURVE }}
                className={cn(
                  "rounded-card border border-border-precision bg-glass p-5 shadow-glass backdrop-blur-2xl sm:p-6",
                  i === 0 && "sm:col-span-2"
                )}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-3 sm:px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
          className="rounded-2xl border border-border-precision bg-[#052b19] p-6 text-white shadow-glass-xl sm:p-10 lg:p-14"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-badge text-white/80">
                KILLER FEATURE
              </span>
              <div className="mt-4 flex items-center gap-3">
                <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  AI Document Generator
                </h2>
                <Sparkles className="hidden h-7 w-7 text-[#eec055] sm:block" />
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                Fitur inti yang membedakan AKAL Center dari LMS biasa. Cukup upload PDF atau DOCX,
                AI menghasilkan draft materi, quiz, dan soal secara otomatis. Guru tetap memegang kendali penuh.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#eec055]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Keamanan Upload</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/65">
                      Validasi MIME + magic bytes. Tidak ada eksekusi file. Konten hanya diproses sebagai teks.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#eec055]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Multi-Output Sekaligus</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/65">
                      Satu dokumen langsung menghasilkan draft materi ajar, pertanyaan quiz, dan soal evaluasi dalam satu proses.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Brain className="mt-0.5 h-5 w-5 shrink-0 text-[#eec055]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Draft, Bukan Final</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/65">
                      Semua hasil AI adalah draft. Guru harus review dan klik publish sebelum konten terlihat siswa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold tracking-badge text-white/50">
                ALUR KERJA AI DOCUMENT GENERATOR
              </p>
              {pipelineSteps.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Number(item.step) * 0.08, ease: EASE_CURVE }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#eec055]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-bold tracking-badge text-white/50">
                          STEP {item.step}
                        </p>
                        <p className="mt-1 font-heading text-base font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-white/70">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-3 sm:px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
          className="rounded-2xl border border-border-precision bg-gradient-to-br from-primary to-[#003d24] p-6 text-white shadow-glass-xl sm:p-10 lg:p-14"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Siap mencoba AKAL Center?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                Mulai gratis tanpa kartu kredit. Daftar sebagai guru, upload dokumen pertama Anda,
                dan lihat sendiri bagaimana AI membantu menyiapkan materi, quiz, dan soal dalam hitungan menit.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Untuk paket sekolah dengan multi-guru dan admin dashboard, diskusikan kebutuhan Anda
                langsung dengan kami via WhatsApp.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/daftar"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#eec055] px-6 py-3.5 text-sm font-semibold text-[#003d24] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Coba Gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=Halo%2C%20saya%20tertarik%20dengan%20AKAL%20Center%20untuk%20sekolah`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <GraduationCap className="h-4 w-4" />
                  Diskusi via WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-card border border-white/15 bg-white/5 p-5 lg:p-6">
              <p className="text-xs font-bold tracking-badge text-white/60">APA YANG ANDA DAPATKAN</p>
              <div className="mt-4 space-y-3">
                {[
                  "1 guru, 1 kelas gratis",
                  "Upload 5 dokumen per bulan",
                  "AI generator materi, quiz, soal",
                  "Dashboard belajar untuk siswa",
                  "Analitik dasar progres siswa",
                  "Keamanan file upload terverifikasi",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#eec055]" />
                    <p className="text-sm text-white/80">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
