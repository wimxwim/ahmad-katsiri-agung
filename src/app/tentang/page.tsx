"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { BookHeart, ArrowRight, Sparkles, GraduationCap, Users, FileText, Target, MessageCircle } from "lucide-react";
import { useCmsData } from "@/components/providers/CmsProvider";
import { EASE_CURVE, WA_NUMBER } from "@/lib/constants";

export default function TentangPage() {
  const { about } = useCmsData();

  const filosofi = about?.filosofi ?? "AKAL Center percaya bahwa pembelajaran Aqidah Akhlaq harus relevan dengan kehidupan digital siswa. Kami menerapkan model Deep Learning — sadar, bermakna, dan menyenangkan — untuk membentuk karakter Islami generasi muda.";
  const pendiriNama = about?.pendiriNama ?? "Ahmad Katsiri Agung, S.Pd.";
  const pendiriFoto = about?.pendiriFoto ?? "/images/tentang/ahmad-katsiri.jpg";
  const visi = about?.visi ?? "Menjadi platform pembelajaran PAI nomor satu di Indonesia yang membuat setiap siswa jatuh cinta pada pelajaran agama Islam.";
  const misiList = about?.misi ?? [];

  const platformHighlights = [
    {
      icon: Sparkles,
      title: "AI Document Generator",
      desc: "Ubah PDF, DOCX, atau catatan menjadi materi pembelajaran, quiz, dan soal otomatis. Guru cukup upload — AI mengerjakan sisanya.",
    },
    {
      icon: GraduationCap,
      title: "Multi-Guru & Multi-Kelas",
      desc: "Platform yang melayani banyak guru dan ribuan siswa sekaligus. Setiap guru punya workspace sendiri, setiap siswa punya ruang belajarnya.",
    },
    {
      icon: FileText,
      title: "Draft-Dulu, Baru Publik",
      desc: "Semua hasil generated AI masuk draft dulu. Guru review, edit, dan approve — tidak ada konten yang lolos tanpa verifikasi pengajar.",
    },
    {
      icon: Target,
      title: "Deep Learning Method",
      desc: "Mindful, Meaningful, Joyful — pendekatan yang mengajak siswa sadar, menghayati nilai, dan senang dalam setiap proses belajar.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 pb-16 md:pb-32">
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-12 sm:mb-20">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <BookHeart className="w-10 h-10 text-primary" aria-hidden="true" />
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-tighter text-on-surface leading-none mb-6">
            Tentang AKAL Center
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed max-w-xl mx-auto">
            Platform guru-siswa dengan AI document generator — ubah bahan ajar
            jadi materi, quiz, dan soal dalam hitungan menit.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_CURVE }}
            className="p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-2xl bg-glass backdrop-blur-2xl border border-glass-stroke shadow-glass"
          >
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-on-surface mb-4">
              Filosofi Kami
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              {filosofi}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_CURVE }}
            className="p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-2xl bg-glass backdrop-blur-2xl border border-glass-stroke shadow-glass"
          >
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-on-surface mb-8">
              Platform untuk Guru Zaman Now
            </h2>
            <div className="grid gap-6">
              {platformHighlights.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base sm:text-lg text-on-surface mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE_CURVE }}
            className="p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-2xl bg-glass backdrop-blur-2xl border border-glass-stroke shadow-glass"
          >
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-on-surface mb-4">
              Visi & Misi
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              {visi}
            </p>
            {misiList.length > 0 && (
              <ul className="space-y-2">
                {misiList.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <span className="text-primary mt-1 shrink-0">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25, ease: EASE_CURVE }}
            className="p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-2xl bg-glass backdrop-blur-2xl border border-glass-stroke shadow-glass"
          >
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-on-surface mb-6">
              Tim AKAL Center
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start mb-8 pb-8 border-b border-glass-stroke">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-primary/10 grid place-items-center relative">
                <Image
                  src={pendiriFoto}
                  alt={pendiriNama}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <GraduationCap className="hidden w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-heading text-base sm:text-lg text-on-surface mb-1">
                  {pendiriNama}
                </h3>
                <p className="text-xs sm:text-sm text-primary font-medium mb-2">
                  Founder & Penggagas Platform
                </p>
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  Pendidik PAI yang berdedikasi menghadirkan pengalaman belajar agama yang bermakna. AKAL Center lahir dari pengalaman langsung mengajar di kelas — melihat kebutuhan guru akan alat bantu digital yang praktis dan sesuai Kurikulum Merdeka.
                </p>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=Halo%20Pak%20Ahmad%2C%20saya%20ingin%20berdiskusi%20tentang%20AKAL%20Center`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-primary hover:underline"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  Hubungi via WhatsApp
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Users className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-heading text-base sm:text-lg text-on-surface mb-1">
                  Platform Developers
                </h3>
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  Tim pengembang yang membangun platform ini dari sisi teknis — arsitektur Next.js, integrasi AI, database Supabase, dan antarmuka guru-siswa. Platform ini dikembangkan secara bertahap dengan fokus pada stabilitas, keamanan data, dan kemudahan penggunaan.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE_CURVE }}
            className="p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-2xl bg-glass backdrop-blur-2xl border border-glass-stroke shadow-glass"
          >
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-on-surface mb-6">
              Verifikator & Mitra Akademik
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
              Konten dan media pembelajaran AKAL Center diverifikasi oleh akademisi berpengalaman untuk memastikan kualitas dan kesesuaian dengan standar pendidikan nasional.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="font-heading text-base sm:text-lg text-primary mb-3">
                  Verifikator Ahli Materi
                </h3>
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  Sabilil Muttaqin, M.Ed., Ph.D., Dr. Ekawati, M.A., Dr. Hamam Faizin, M.A., dan Nofi Maria Krisnawati, M.Pd.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base sm:text-lg text-primary mb-3">
                  Verifikator Ahli Media
                </h3>
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  Sabilil Muttaqin, M.Ed., Ph.D., dan Nofi Maria Krisnawati, M.Pd., Ph.D (Cand.)
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            Coba Gratis
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>

          <div className="mt-6 flex justify-center gap-6 text-xs text-on-surface-variant">
            <Link href="/kebijakan-privasi" className="hover:text-primary transition-colors underline underline-offset-2">
              Kebijakan Privasi
            </Link>
            <Link href="/syarat-layanan" className="hover:text-primary transition-colors underline underline-offset-2">
              Syarat Layanan
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
