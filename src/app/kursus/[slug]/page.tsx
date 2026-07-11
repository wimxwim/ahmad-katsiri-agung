"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { ArrowLeft, BookOpen, CheckCircle, ArrowRight, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  isPublic: boolean;
  harga: number;
  createdAt: string;
}

export default function KursusDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [kursus, setKursus] = useState<KursusItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    async function fetchKursus() {
      try {
        const res = await fetch(`/api/v1/kursus?slug=${params.slug}`);
        if (!res.ok) throw new Error("Gagal memuat data");
        const { data } = await res.json();
        setKursus((data && data[0]) || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }
    fetchKursus();
  }, [params.slug]);

  async function handleEnroll() {
    if (!kursus) return;
    setEnrolling(true);
    setError("");
    try {
      const res = await fetch("/api/v1/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kursusId: kursus.id }),
      });
      if (res.status === 401) {
        const returnUrl = encodeURIComponent(`/kursus/${params.slug}`);
        window.location.href = `/masuk?portal=siswa&redirect=${returnUrl}`;
        return;
      }
      if (res.status === 429) {
        setError("Terlalu banyak permintaan. Tunggu beberapa detik lalu coba lagi.");
        return;
      }
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error || j.message || "Gagal mendaftar");
        return;
      }
      setEnrolled(true);
    } catch (err) {
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 pt-24 sm:pt-28 pb-16">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-32 bg-primary/5 rounded" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/5" />
              <div className="h-8 w-64 bg-primary/5 rounded" />
              <div className="h-20 bg-primary/5 rounded-2xl" />
            </div>
            <div className="h-64 bg-primary/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !kursus) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={() => router.refresh()} className="text-sm text-primary hover:underline">Coba lagi</button>
      </div>
    );
  }

  if (!kursus) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        <p className="text-on-surface-variant text-lg">Kursus tidak ditemukan</p>
        <Link href="/kursus" className="text-primary text-sm mt-3 inline-block hover:underline">
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 pt-24 sm:pt-28 pb-16">
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
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium mb-2 inline-block ${
                  kursus.isPublic ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {kursus.isPublic ? "Publik" : "Privat"}
                </span>
                <h1 className="font-heading font-bold text-3xl text-on-surface mt-2">
                  {kursus.judul}
                </h1>
                <p className="text-on-surface-variant mt-3 leading-relaxed">
                  {kursus.deskripsi}
                </p>
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
                  <p className="font-heading font-bold text-2xl text-on-surface">{kursus.harga === 0 ? "GRATIS" : `Rp${kursus.harga.toLocaleString("id-ID")}`}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {kursus.harga === 0 ? "Akses penuh tanpa biaya" : "Pembayaran sekali untuk akses penuh"}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-5 text-sm text-on-surface-variant">
                  {[
                    "Materi pembelajaran",
                    "Quiz interaktif",
                    "Game edukasi",
                    "Sertifikat digital",
                    "Akses tanpa batas waktu",
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
                      href={`/siswa/materi?kursusId=${kursus.id}`}
                      className="block w-full py-2.5 px-4 bg-primary text-white text-center font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors font-heading"
                    >
                      Mulai Belajar
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-3 px-4 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-heading flex items-center justify-center gap-2"
                  >
                    {enrolling ? (
                      "Mendaftarkan..."
                    ) : (
                      <>
                        Daftar Sekarang <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {error && (
                  <p className="text-red-600 text-xs text-center mt-3">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
