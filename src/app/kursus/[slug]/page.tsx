"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { mockKursus } from "@/data/mock";
import { ArrowLeft, BookOpen, Users, FileText, CheckCircle, ArrowRight, GraduationCap } from "lucide-react";
import { useState } from "react";

export default function KursusDetailPage() {
  const params = useParams();
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const kursus = mockKursus.find((k) => k.id === params.slug);

  async function handleEnroll() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setEnrolled(true);
    setLoading(false);
  }

  if (!kursus) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 pt-32 pb-20 text-center">
        <p className="text-on-surface-variant text-lg">Kursus tidak ditemukan</p>
        <Link href="/kursus" className="text-primary text-sm mt-3 inline-block hover:underline">
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-24 sm:pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
      >
        <Link
          href="/kursus"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-start gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${kursus.coverColor}15` }}
              >
                <BookOpen className="w-8 h-8" style={{ color: kursus.coverColor }} />
              </div>
              <div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium mb-2 inline-block">
                  Kelas {kursus.kelas}
                </span>
                <h1 className="font-heading font-bold text-3xl text-on-surface mt-2">
                  {kursus.nama}
                </h1>
                <p className="text-on-surface-variant mt-3 leading-relaxed">
                  {kursus.deskripsi}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Siswa Terdaftar", value: kursus.jumlahSiswa, icon: Users },
                { label: "Materi", value: kursus.jumlahMateri, icon: FileText },
                { label: "Status", value: kursus.status, icon: CheckCircle },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl p-4 border border-border-precision text-center"
                >
                  <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-on-surface font-heading">{s.value}</p>
                  <p className="text-xs text-on-surface-variant">{s.label}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-heading font-bold text-lg text-on-surface mb-4">
                Yang Akan Dipelajari
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Konsep Aqidah Akhlak dalam Islam",
                  "Dalil-dalil dari Al-Qur'an dan Hadits",
                  "Penerapan dalam kehidupan sehari-hari",
                  "Quiz interaktif berbasis deep learning",
                  "Analisis kasus dan studi moral",
                  "Sertifikat setelah menyelesaikan kursus",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white rounded-xl p-4 border border-border-precision"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-sm text-on-surface">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="bg-white rounded-2xl border border-border-precision p-6">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-heading font-bold text-2xl text-on-surface">GRATIS</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Akses penuh tanpa biaya
                  </p>
                </div>

                <ul className="space-y-2.5 mb-5 text-sm text-on-surface-variant">
                  {[
                    "14 materi pembelajaran",
                    "Quiz interaktif",
                    "Game edukasi",
                    "Sertifikat digital",
                    "Akses selamanya",
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {enrolled ? (
                  <div className="text-center">
                    <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-heading font-bold text-emerald-700">
                        Terdaftar!
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Kamu sudah terdaftar di kursus ini
                      </p>
                    </div>
                    <Link
                      href="/materi"
                      className="block w-full py-2.5 px-4 bg-primary text-white text-center font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors font-heading"
                    >
                      Mulai Belajar
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-heading flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      "Mendaftarkan..."
                    ) : (
                      <>
                        Daftar Sekarang <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
