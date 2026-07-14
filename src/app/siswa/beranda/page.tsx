"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { getCached, setCache } from "@/lib/data-cache";
import {
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Megaphone,
  AlertTriangle,
  RefreshCw,
  Library,
  Globe,
} from "lucide-react";
import { SkeletonDashboardSiswa } from "@/components/ui/SkeletonBlocks";
import { EmptyState } from "@/components/ui/EmptyState";

interface FeedItem {
  id: string;
  judul: string;
  ringkasan: string | null;
  kursusId: string;
  kursusJudul: string | null;
  progress: number;
  selesai: boolean;
  lastReadAt: string | null;
  publishedAt: string;
}

interface FeedResponse {
  data: FeedItem[];
  continueLearning: FeedItem | null;
  totalKursus: number;
  totalMateri: number;
  totalSelesai: number;
  terdaftar: boolean;
}

interface QuizItem {
  id: string;
  judul: string;
  modeEvaluasi: string;
  durasiMenit: number;
  totalSoal: number;
  sudahDikerjakan: boolean;
  nilaiTerbaik: number | null;
  publishedAt: string;
}

interface PengumumanItem {
  id: string;
  judul: string;
  konten: string;
  target: string;
  guruNama: string | null;
  isPinned: boolean;
  publishedAt: string;
}

const CACHE_TTL = 60_000;

export default function SiswaBerandaPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nama, setNama] = useState("Siswa");

  const fetchData = useCallback(async () => {
    const cachedFeed = getCached<FeedResponse>("beranda:feed");
    const cachedPengumuman = getCached<PengumumanItem[]>("beranda:pengumuman");
    const cachedQuiz = getCached<QuizItem[]>("beranda:quiz");
    const cachedNama = getCached<string>("beranda:nama");

    if (cachedFeed && cachedPengumuman && cachedQuiz) {
      setFeed(cachedFeed);
      setPengumuman(cachedPengumuman);
      setQuizList(cachedQuiz);
      if (cachedNama) setNama(cachedNama);
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.allSettled([
        fetch("/api/v1/account/me", { credentials: "include" }).then((r) =>
          r.ok ? r.json() : null
        ),
        fetch("/api/v1/siswa/feed", { credentials: "include" }).then((r) =>
          r.ok ? r.json() : null
        ),
        fetch("/api/v1/siswa/pengumuman", { credentials: "include" }).then((r) =>
          r.ok ? r.json() : null
        ),
        fetch("/api/v1/siswa/quiz", { credentials: "include" }).then((r) =>
          r.ok ? r.json() : null
        ),
      ]);

      const [meResult, feedResult, pengumResult, quizResult] = results;
      if (meResult.status === "fulfilled" && meResult.value?.data?.nama) {
        setNama(meResult.value.data.nama);
        setCache("beranda:nama", meResult.value.data.nama, CACHE_TTL);
      }
      if (feedResult.status === "fulfilled" && feedResult.value) {
        setFeed(feedResult.value);
        setCache("beranda:feed", feedResult.value, CACHE_TTL);
      }
      if (pengumResult.status === "fulfilled" && pengumResult.value?.data) {
        setPengumuman(pengumResult.value.data);
        setCache("beranda:pengumuman", pengumResult.value.data, CACHE_TTL);
      }
      if (quizResult.status === "fulfilled" && quizResult.value?.data) {
        setQuizList(quizResult.value.data);
        setCache("beranda:quiz", quizResult.value.data, CACHE_TTL);
      }
      const allFailed = results.every((r) => r.status === "rejected");
      if (allFailed) {
        setError("Terjadi kesalahan saat memuat data. Coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan saat memuat data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <SkeletonDashboardSiswa />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-heading text-xl text-on-surface mb-2">Gagal Memuat Data</h2>
        <p className="text-on-surface-variant mb-6 max-w-md text-sm">{error}</p>
        <button
          onClick={() => { setError(""); setLoading(true); fetchData(); }}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 min-h-[44px] rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  if (feed && feed.terdaftar === false) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE }}
          className="max-w-sm"
        >
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-on-surface mb-3">
            Yuk, mulai belajar! 📚
          </h2>
          <p className="text-on-surface-variant mb-2 leading-relaxed">
            Kamu belum terdaftar di kursus manapun.
          </p>
          <p className="text-sm text-on-surface-variant/70 mb-8">
            Cari kursus gratis di katalog atau tanya gurumu untuk dibantu.
          </p>
          <Link
            href="/kursus"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
          >
            <Sparkles className="w-5 h-5" />
            Cari Kursus Gratis
          </Link>
          <p className="text-xs text-on-surface-variant/50 mt-6">
            Butuh bantuan?{" "}
            <a href="https://wa.me/6285158795502" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Chat WhatsApp
            </a>
          </p>
        </motion.div>
      </div>
    );
  }

  if (feed && feed.data.length === 0) {
    return (
      <div>
        <EmptyState
          icon={BookOpen}
          title="Belum ada materi"
          description="Gurumu belum menerbitkan materi. Sambil menunggu, yuk coba kerjakan kuis yang sudah ada!"
          action={{ label: "Lihat Kuis Tersedia", href: "/siswa/quiz" }}
        />
      </div>
    );
  }

  const firstName = nama.split(" ")[0];
  const stats = {
    kursus: feed?.totalKursus ?? 0,
    materi: feed?.totalMateri ?? 0,
    selesai: feed?.totalSelesai ?? 0,
  };
  const progressPct =
    stats.materi > 0 ? Math.round((stats.selesai / stats.materi) * 100) : 0;

  const pendingQuiz = quizList.find((q) => !q.sudahDikerjakan);
  const todayMateri =
    feed?.data.filter((m) => {
      const pub = new Date(m.publishedAt);
      const now = new Date();
      return pub.toDateString() === now.toDateString();
    }) ?? [];
  const hasHariIni = pendingQuiz || todayMateri.length > 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE }}
        className="mb-6"
      >
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">
          Halo, {firstName}!
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Lanjutkan belajarmu dan pantau progresmu di sini.
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">KURSUS</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">
            {stats.kursus}
          </p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">MATERI</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">
            {stats.materi}
          </p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">SELESAI</p>
          <p className="font-heading text-2xl font-bold text-primary mt-1">
            {stats.selesai}
            <span className="text-sm text-on-surface-variant ml-1">({progressPct}%)</span>
          </p>
        </div>
      </div>

      {feed?.continueLearning && (
        <Link
          href={`/siswa/materi/${feed.continueLearning.id}`}
          className="block bg-gradient-to-br from-primary to-[#003d24] text-white rounded-2xl p-5 sm:p-6 shadow-glass-lg mb-6 hover:brightness-110 active:scale-[0.99] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 text-[#eec055] grid place-items-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold tracking-wider text-white/60">
                LANJUTKAN BELAJAR
              </p>
              <p className="font-heading text-lg font-bold mt-1 truncate">
                {feed.continueLearning.judul}
              </p>
              <p className="text-xs text-white/70 mt-1">
                {feed.continueLearning.kursusJudul || "—"}
              </p>
              {feed.continueLearning.progress > 0 && (
                <div className="mt-3 h-1.5 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#eec055] transition-all duration-500"
                    style={{ width: `${feed.continueLearning.progress}%` }}
                  />
                </div>
              )}
            </div>
            <ArrowRight className="w-5 h-5 shrink-0 mt-1" />
          </div>
        </Link>
      )}

      {hasHariIni && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-tertiary" />
              <h2 className="font-heading font-semibold text-on-surface">Hari Ini</h2>
            </div>
            <div className="space-y-2">
              {pendingQuiz && (
                <Link
                  href={`/siswa/cbt/${pendingQuiz.id}`}
                  className="block bg-glass border border-border-precision rounded-2xl p-3.5 hover:border-primary/30 hover:shadow-glass-lg active:scale-[0.99] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary grid place-items-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold tracking-wider text-on-surface-variant">
                        KUIS TERSEDIA
                      </p>
                      <p className="font-semibold text-on-surface truncate mt-0.5">
                        {pendingQuiz.judul}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {pendingQuiz.totalSoal} soal &middot; {pendingQuiz.durasiMenit} menit
                        {pendingQuiz.modeEvaluasi !== "BELAJAR" && (
                          <span className="ml-2 text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded text-xs font-bold">
                            {pendingQuiz.modeEvaluasi}
                          </span>
                        )}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 text-on-surface-variant/60" />
                  </div>
                </Link>
              )}
              {todayMateri.map((m) => (
                <Link
                  key={m.id}
                  href={`/siswa/materi/${m.id}`}
                  className="block bg-glass border border-border-precision rounded-2xl p-3.5 hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold tracking-wider text-on-surface-variant">
                        MATERI BARU
                      </p>
                      <p className="font-semibold text-on-surface truncate mt-0.5">
                        {m.judul}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
{m.kursusJudul || "—"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      {pengumuman.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-4 h-4 text-on-surface-variant" />
            <h2 className="font-heading font-semibold text-on-surface">Pengumuman</h2>
          </div>
          <div className="space-y-2">
            {pengumuman.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="bg-glass border border-border-precision rounded-2xl p-3.5"
              >
                <div className="flex items-start gap-3">
                  {p.isPinned && (
                    <span className="text-xs font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                      PINNED
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm">{p.judul}</p>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                      {p.konten}
                    </p>
                    <p className="text-xs text-on-surface-variant/60 mt-2">
                      {p.guruNama || "Guru"} &middot;{" "}
                      {new Date(p.publishedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="font-heading font-semibold text-lg text-on-surface mb-3">
        Materi untukmu
      </h2>
      <div className="flex flex-col gap-2">
        {feed?.data.map((m) => (
          <Link
            key={m.id}
            href={`/siswa/materi/${m.id}`}
            className="flex items-center gap-3 bg-glass rounded-2xl border border-border-precision p-3.5 shadow-glass hover:bg-white/80 active:scale-[0.99] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                m.selesai
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {m.selesai ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <BookOpen className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-on-surface truncate">
                {m.judul}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                {m.kursusJudul || "—"}
              </p>
              {m.ringkasan && (
                <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                  {m.ringkasan}
                </p>
              )}
              {m.progress > 0 && !m.selesai && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 max-w-[120px] h-1 bg-border-precision rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-primary tabular-nums">
                    {m.progress}%
                  </span>
                </div>
              )}
              <p className="text-[11px] text-on-surface-variant/60 mt-1">
                {m.selesai
                  ? "✓ Selesai"
                  : m.lastReadAt
                    ? "Sedang dipelajari"
                    : "Belum dibaca"}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 shrink-0" />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/siswa/quiz"
          className="bg-glass border border-border-precision rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          <span className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary grid place-items-center">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-on-surface text-xs">Lihat Kuis</p>
            <p className="text-[11px] text-on-surface-variant">Uji pemahaman</p>
          </div>
        </Link>
        <Link
          href="/siswa/progres"
          className="bg-glass border border-border-precision rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-on-surface text-xs">Lihat Progres</p>
            <p className="text-[11px] text-on-surface-variant">Riwayat quiz</p>
          </div>
        </Link>
        <Link
          href="/siswa/kursus"
          className="bg-glass border border-primary/20 rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Library className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-on-surface text-xs">Kursus Saya</p>
            <p className="text-[11px] text-on-surface-variant">Kursus yang diikuti</p>
          </div>
        </Link>
        <Link
          href="/kursus"
          className="bg-glass border border-border-precision rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
            <Globe className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-on-surface text-xs">Katalog Kursus</p>
            <p className="text-[11px] text-on-surface-variant">Jelajahi kursus baru</p>
          </div>
        </Link>
      </div>
    </div>
  );
}