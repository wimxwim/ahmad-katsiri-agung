import Link from "next/link";
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
} from "lucide-react";

const pillars = [
  {
    title: "Untuk Guru",
    desc: "Upload PDF atau DOCX, ubah jadi materi, quiz, dan soal yang siap ditinjau sebelum dipakai di kelas.",
    icon: ShieldCheck,
  },
  {
    title: "Untuk Siswa",
    desc: "Masuk dari perangkat mana pun, belajar materi yang dipublikasikan guru, dan kerjakan evaluasi dengan alur yang jauh lebih rapi.",
    icon: GraduationCap,
  },
  {
    title: "Untuk Sekolah",
    desc: "Siapkan fondasi multi-guru sejak awal agar setiap guru punya ruang kerja, data, dan analitik yang terpisah dengan benar.",
    icon: LayoutDashboard,
  },
];

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

export default function Home() {
  return (
    <main className="bg-surface pb-20 pt-12 sm:pt-16">
      <section className="mx-auto max-w-[1280px] px-3 sm:px-5 lg:px-8">
        <div className="grid gap-8 rounded-[32px] border border-border-precision bg-white p-6 shadow-glass-lg md:grid-cols-[1.1fr_0.9fr] md:p-10 lg:p-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-primary">
              AKAL CENTER 2026
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[0.95] tracking-tight text-on-surface sm:text-5xl lg:text-7xl">
              Platform guru-siswa yang mengubah dokumen jadi pembelajaran yang siap dipakai.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base lg:text-lg">
              Bukan lagi website materi satu guru. Ini fondasi baru untuk multi-guru: upload dokumen,
              hasilkan draft materi, quiz, dan soal dengan AI, lalu kelola semuanya dari ruang kerja yang lebih rapi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/daftar"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Coba Gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/materi"
                className="inline-flex items-center gap-2 rounded-2xl border border-border-precision bg-glass px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Lihat Demo
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {pillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[24px] border border-border-precision bg-glass p-4 shadow-glass">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 font-heading text-lg font-semibold text-on-surface">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-border-precision bg-[#052b19] p-5 text-white shadow-glass-xl md:p-7">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Killer Feature</p>
                <p className="mt-1 font-heading text-xl font-semibold">AI Document Generator</p>
              </div>
              <Sparkles className="h-6 w-6 text-[#eec055]" />
            </div>

            <div className="mt-5 space-y-3">
              {pipeline.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#eec055]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold tracking-[0.18em] text-white/50">STEP {item.step}</p>
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
      </section>

      <section className="mx-auto mt-16 max-w-[1280px] px-3 sm:px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-border-precision bg-glass p-6 shadow-glass lg:p-8">
            <p className="text-xs font-bold tracking-[0.18em] text-primary">KENAPA BERBEDA</p>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-on-surface">
              Bukan LMS generik. Bukan lagi alur lama yang tercampur.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant sm:text-base">
              AKAL Center versi baru memisahkan dengan tegas ruang publik, ruang guru, dan ruang siswa.
              Tujuannya sederhana: pipeline terasa, navigasi jelas, dan tidak ada lagi login guru yang terasa seperti masuk ke tempat yang salah.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-border-precision bg-white p-5 shadow-glass">
              <p className="font-heading text-xl font-semibold text-on-surface">Security by default</p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                File upload diperlakukan sebagai konten tidak tepercaya, hasil AI selalu draft, dan setiap peran hanya masuk ke dashboard yang tepat.
              </p>
            </div>
            <div className="rounded-[28px] border border-border-precision bg-white p-5 shadow-glass">
              <p className="font-heading text-xl font-semibold text-on-surface">Siap tumbuh ke VPS</p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Fase sekarang tetap hemat: Vercel, Supabase, ImageKit. Saat guru dan siswa sudah banyak, arsitektur bisa dipindah ke VPS tanpa rombak produk dari nol.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-[1280px] px-3 sm:px-5 lg:px-8">
        <div className="rounded-[32px] border border-border-precision bg-gradient-to-br from-primary to-[#003d24] p-6 text-white shadow-glass-xl sm:p-10 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-white/80">
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
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#eec055] px-6 py-3.5 text-sm font-semibold text-[#003d24] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Coba Gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/628518795502?text=Halo%2C%20saya%20tertarik%20dengan%20AKAL%20Center%20untuk%20sekolah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Diskusi via WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-white/5 p-5 lg:p-6">
              <p className="text-xs font-bold tracking-[0.18em] text-white/60">FAQ SINGKAT</p>
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
      </section>

      <section className="mx-auto mt-16 max-w-[1280px] px-3 sm:px-5 lg:px-8">
        <div className="rounded-[32px] border border-border-precision bg-white p-6 shadow-glass-lg sm:p-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-primary">FAQ PRODUK</p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-on-surface">
                Pertanyaan yang sering diajukan
              </h2>
            </div>
            <a
              href="https://wa.me/628518795502"
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
        </div>
      </section>
    </main>
  );
}
