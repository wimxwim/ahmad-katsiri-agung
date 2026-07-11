"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Megaphone,
  AlertTriangle,
  RefreshCw,
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

export default function SiswaBerandaPage() {
  const router = useRouter();
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nama, setNama] = useState("Siswa");

  useEffect(() => {
    fetch("/api/v1/account/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data?.nama) setNama(j.data.nama);
      })
      .catch(() => {});

    Promise.all([
      fetch("/api/v1/siswa/feed", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch("/api/v1/siswa/pengumuman", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch("/api/v1/siswa/quiz", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([feedData, pengum, quiz]) => {
        if (feedData) setFeed(feedData);
        if (pengum?.data) setPengumuman(pengum.data);
        if (quiz?.data) setQuizList(quiz.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Terjadi kesalahan saat memuat data. Coba lagi.");
        setLoading(false);
      });
  }, []);

  if (loading) return <SkeletonDashboardSiswa />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-heading text-xl text-on-surface mb-2">Gagal Memuat Data</h2>
        <p className="text-on-surface-variant mb-6 max-w-md text-sm">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  if (feed && feed.terdaftar === false) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <EmptyState
          icon={BookOpen}
          title="Kamu belum terdaftar di kelas"
          description="Kamu belum terdaftar di kelas mana pun. Hubungi gurumu untuk mendapatkan akses materi dan quiz."
        />
      </div>
    );
  }

  if (feed && feed.data.length === 0) {
    return (
      <div className="px-4">
        <EmptyState
          icon={BookOpen}
          title="Belum ada materi"
          description="Gurumu belum menerbitkan materi. Cek kembali nanti atau hubungi gurumu untuk info lebih lanjut."
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

  return (
    <div className="pb-20">
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
          className="block bg-gradient-to-br from-primary to-[#003d24] text-white rounded-2xl p-5 sm:p-6 shadow-glass-lg mb-6 hover:brightness-110 active:scale-[0.99] transition-all duration-200 cursor-pointer"
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
                {feed.continueLearning.kursusJudul}
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

      {(() => {
        const pendingQuiz = quizList.find((q) => !q.sudahDikerjakan);
        const todayMateri =
          feed?.data.filter((m) => {
            const pub = new Date(m.publishedAt);
            const now = new Date();
            return pub.toDateString() === now.toDateString();
          }) ?? [];
        const hasHariIni = pendingQuiz || todayMateri.length > 0;
        return hasHariIni ? (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-tertiary" />
              <h2 className="font-heading font-semibold text-on-surface">Hari Ini</h2>
            </div>
            <div className="space-y-2">
              {pendingQuiz && (
                <Link
                  href={`/siswa/cbt/${pendingQuiz.id}`}
                  className="block bg-glass border border-border-precision rounded-2xl p-4 hover:border-primary/30 hover:shadow-glass-lg active:scale-[0.99] transition-all duration-200 cursor-pointer"
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
                  className="block bg-glass border border-border-precision rounded-2xl p-4 hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer"
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
                        {m.kursusJudul}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null;
      })()}

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
                className="bg-glass border border-border-precision rounded-2xl p-4"
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
      <div className="space-y-3">
        {feed?.data.map((m) => (
          <Link
            key={m.id}
            href={`/siswa/materi/${m.id}`}
            className="block bg-glass border border-border-precision rounded-2xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-glass-lg active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <span
                className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
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
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-on-surface truncate">{m.judul}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {m.kursusJudul}
                </p>
                {m.ringkasan && (
                  <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">
                    {m.ringkasan}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  {m.progress > 0 && !m.selesai && (
                    <>
                      <div className="flex-1 max-w-[160px]">
                        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary tabular-nums">
                        {m.progress}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-on-surface-variant flex items-center gap-1 ml-auto">
                    {m.selesai ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai
                      </>
                    ) : m.lastReadAt ? (
                      <>
                        <Clock className="w-3 h-3" /> Dilanjutkan
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />{" "}
                        Baru
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/siswa/quiz"
          className="bg-glass border border-border-precision rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer"
        >
          <span className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary grid place-items-center">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-on-surface text-sm">Lihat Kuis</p>
            <p className="text-xs text-on-surface-variant">Uji pemahamanmu</p>
          </div>
        </Link>
        <Link
          href="/siswa/progres"
          className="bg-glass border border-border-precision rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer"
        >
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div>
            <p className="font-semibold text-on-surface text-sm">Lihat Progres</p>
            <p className="text-xs text-on-surface-variant">Riwayat quiz kamu</p>
          </div>
        </Link>
      </div>
    </div>
  );
}