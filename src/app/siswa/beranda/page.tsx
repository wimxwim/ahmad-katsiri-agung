"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { getCached, setCache } from "@/lib/data-cache";
import { csrfHeaders } from "@/lib/csrf";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Megaphone,
  AlertTriangle,
  RefreshCw,
  Users,
  BarChart3,
  Clock,
  PartyPopper,
} from "lucide-react";
import { SkeletonDashboardSiswa } from "@/components/ui/SkeletonBlocks";
import { EmptyState } from "@/components/ui/EmptyState";
import { WaIcon } from "@/components/ui/WaIcon";

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

interface DashboardData {
  profil: { id: string; nama: string } | null;
  feed: FeedResponse;
  quiz: { data: QuizItem[]; totalAttempt: number };
  pengumuman: { data: PengumumanItem[] };
}

const CACHE_TTL = 30_000;

const INVITE_STORAGE_KEY = "akal_pending_invite";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_CURVE },
  },
};

export default function SiswaBerandaPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [totalAttempt, setTotalAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nama, setNama] = useState("Siswa");
  const userIdRef = useRef<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function consumeInvite() {
      try {
        const kode = localStorage.getItem(INVITE_STORAGE_KEY);
        if (!kode) return;
        localStorage.removeItem(INVITE_STORAGE_KEY);
        const res = await fetch("/api/v1/invite/kelas/consume", {
          method: "POST",
          headers: csrfHeaders(),
          credentials: "include",
          body: JSON.stringify({ kode }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.success && json.data?.nama) {
          setInviteMessage(`Berhasil masuk ke kelas ${json.data.nama}!`);
          fetchData();
        } else if (json.alreadyJoined) {
          setInviteMessage(`Kamu sudah tergabung di kelas ${json.data?.nama ?? ""}.`);
          fetchData();
        }
      } catch { /* non-critical */ }
    }
    consumeInvite();
    return () => { cancelled = true; };
  }, []);

  const fetchData = useCallback(async () => {
    const cacheKey = userIdRef.current ? `beranda:dashboard:${userIdRef.current}` : null;
    if (cacheKey) {
      const cached = getCached<DashboardData>(cacheKey);
      if (cached) {
        setFeed(cached.feed);
        setPengumuman(cached.pengumuman?.data ?? []);
        setQuizList(cached.quiz?.data ?? []);
        setTotalAttempt(cached.quiz?.totalAttempt ?? 0);
        if (cached.profil?.nama) setNama(cached.profil.nama);
        setLoading(false);
        return;
      }
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch("/api/v1/siswa/dashboard", { credentials: "include", headers: csrfHeaders() });
        if (!res.ok) {
          if (attempt < 2 && (res.status === 401 || res.status >= 500)) {
            await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
            continue;
          }
          setError("Terjadi kesalahan saat memuat data. Coba lagi.");
          setLoading(false);
          return;
        }
        const json = await res.json();
        const d = json.data as DashboardData;

        setCache(`beranda:dashboard:${d.profil?.id || userIdRef.current || "anon"}`, d, CACHE_TTL);
        if (d.profil?.id) userIdRef.current = d.profil.id;

        if (d.profil?.nama) setNama(d.profil.nama);
        if (d.feed) setFeed(d.feed);
        if (d.pengumuman?.data) setPengumuman(d.pengumuman.data);
        if (d.quiz?.data) setQuizList(d.quiz.data);
        setTotalAttempt(d.quiz?.totalAttempt ?? 0);
        setLoading(false);
        return;
      } catch {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        }
      }
    }

    setError("Terjadi kesalahan saat memuat data. Coba lagi.");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    function handleCacheInvalidated() {
      fetchData();
    }
    window.addEventListener("akal:cache-invalidated", handleCacheInvalidated);
    return () => window.removeEventListener("akal:cache-invalidated", handleCacheInvalidated);
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
            Yuk, mulai belajar!
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
            <a href="https://wa.me/6285158795502" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
              <WaIcon className="w-4 h-4 text-[#25D366]" />
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
    kuis: totalAttempt,
  };
  const progressPct =
    stats.materi > 0 ? Math.round((stats.selesai / stats.materi) * 100) : 0;

  const pendingQuiz = quizList.find((q) => !q.sudahDikerjakan);
  const completedQuiz = quizList.filter((q) => q.sudahDikerjakan);

  const statCards = [
    { label: "Materi", value: stats.materi, icon: BookOpen, color: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Selesai", value: stats.selesai, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Kuis", value: stats.kuis, icon: BarChart3, color: "text-tertiary", bg: "bg-tertiary/10" },
  ];

  return (
    <div className="space-y-5">
      {inviteMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_CURVE }}
          className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4"
        >
          <Users className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{inviteMessage}</p>
          <button
            onClick={() => setInviteMessage("")}
            className="ml-auto text-emerald-500 hover:text-emerald-700 text-lg leading-none"
          >
            &times;
          </button>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE }}
      >
        <h1 className="font-heading font-bold text-xl sm:text-2xl text-on-surface shimmer-text">
          Halo, {firstName}!
        </h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Lanjutkan belajarmu dan pantau progres di sini.
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.02 }}
        className="bg-glass border border-border-precision rounded-2xl p-4 shadow-glass mb-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="font-heading font-bold text-lg text-primary">
              {nama.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-on-surface truncate">{nama}</p>
            <p className="text-xs text-on-surface-variant">Siswa</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center">
              <p className="font-heading font-bold text-sm text-primary tabular-nums">{stats.kursus}</p>
              <p className="text-[10px] text-on-surface-variant">Kursus</p>
            </div>
            <div className="w-px h-8 bg-border-precision" />
            <div className="text-center">
              <p className="font-heading font-bold text-sm text-emerald-700 tabular-nums">{stats.selesai}</p>
              <p className="text-[10px] text-on-surface-variant">Selesai</p>
            </div>
            <div className="w-px h-8 bg-border-precision" />
            <div className="text-center">
              <p className="font-heading font-bold text-sm text-tertiary tabular-nums">{stats.kuis}</p>
              <p className="text-[10px] text-on-surface-variant">Kuis</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Celebration Banner — 100% progress */}
      {progressPct === 100 && stats.materi > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_CURVE, delay: 0.04 }}
          className="bg-gradient-to-r from-emerald-50 via-primary/5 to-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <PartyPopper className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-emerald-800 text-sm">
              🎉 Selamat! Semua materi selesai!
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Kamu sudah menyelesaikan semua {stats.materi} materi. Pertahankan terus semangat belajarnya!
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.03 }}
        className="grid grid-cols-3 gap-2.5"
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-glass border border-border-precision rounded-2xl p-3.5 shadow-glass"
          >
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", card.bg)}>
              <card.icon className={cn("w-4 h-4", card.color)} />
            </div>
            <p className="font-heading font-bold text-lg text-on-surface tabular-nums leading-none">
              {card.value}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">
              {card.label}
            </p>
          </div>
        ))}
      </motion.div>

      {feed?.continueLearning && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.05 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2 block">
            Lanjutkan Belajar
          </span>
          <Link
            href={`/siswa/materi/${feed.continueLearning.id}`}
            className="block bg-gradient-to-br from-primary to-[#003d24] text-white rounded-2xl p-5 shadow-glass-lg active:scale-[0.99] transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/15 text-[#eec055] grid place-items-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60">
                  {feed.continueLearning.kursusJudul || "\u2014"}
                </p>
                <p className="font-heading font-bold mt-1 truncate">
                  {feed.continueLearning.judul}
                </p>
                {feed.continueLearning.progress > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#eec055] transition-all duration-500"
                        style={{ width: `${feed.continueLearning.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/60 tabular-nums">
                      {feed.continueLearning.progress}% selesai
                    </p>
                  </div>
                )}
              </div>
              <ArrowRight className="w-5 h-5 shrink-0 mt-1" />
            </div>
          </Link>
        </motion.div>
      )}

      {pendingQuiz && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.08 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary mb-2 block">
            Perlu Dikerjakan
          </span>
          <Link
            href={`/siswa/cbt/${pendingQuiz.id}`}
            className="block bg-glass border border-border-precision rounded-2xl p-4 hover:border-primary/30 hover:shadow-glass-lg active:scale-[0.99] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary grid place-items-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-on-surface truncate">
                  {pendingQuiz.judul}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {pendingQuiz.totalSoal} soal &middot; {pendingQuiz.durasiMenit} menit
                  {pendingQuiz.modeEvaluasi !== "BELAJAR" && (
                    <span className="ml-2 text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {pendingQuiz.modeEvaluasi}
                    </span>
                  )}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 text-on-surface-variant/60" />
            </div>
          </Link>
        </motion.div>
      )}

      {completedQuiz.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Hasil Kuis Terbaru
            </span>
            <Link
              href="/siswa/progres"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {completedQuiz.slice(0, 3).map((q) => {
              const nilai = q.nilaiTerbaik ?? 0;
              const dapatNilai = q.modeEvaluasi !== "CBT" && q.nilaiTerbaik !== null;
              const color = !dapatNilai
                ? "text-on-surface-variant"
                : nilai >= 80
                  ? "text-emerald-700"
                  : nilai >= 60
                    ? "text-amber-700"
                    : "text-red-600";
              const bg = !dapatNilai
                ? "bg-surface"
                : nilai >= 80
                  ? "bg-emerald-50"
                  : nilai >= 60
                    ? "bg-amber-50"
                    : "bg-red-50";
              return (
                <motion.div key={q.id} variants={itemAnim}>
                  <Link
                    href={`/siswa/cbt/${q.id}`}
                    className="flex items-center gap-3 bg-glass border border-border-precision rounded-2xl p-3 shadow-glass hover:bg-white/80 hover:border-primary/25 active:scale-[0.99] transition-all duration-200"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                      <span className={cn("font-heading font-bold text-sm", color)}>
                        {dapatNilai ? nilai : "\u2014"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-on-surface truncate">
                        {q.judul}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {q.durasiMenit} menit
                        </span>
                        <span>{q.totalSoal} soal</span>
                        {q.modeEvaluasi !== "BELAJAR" && (
                          <span className="text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {q.modeEvaluasi}
                          </span>
                        )}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-on-surface-variant/30 shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            Progress Belajar
          </span>
          <Link
            href="/siswa/progres"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Detail
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-heading text-2xl font-bold text-primary tabular-nums">
                {stats.selesai}
                <span className="text-sm text-on-surface-variant font-normal ml-1">dari {stats.materi} materi</span>
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{progressPct}% perjalanan belajar</p>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-primary/10 flex items-center justify-center">
              <span className="font-heading font-bold text-lg text-primary tabular-nums">{progressPct}%</span>
            </div>
          </div>
          <div className="h-2 bg-black/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading font-semibold text-on-surface text-sm">
            Materi Terbaru
          </h2>
          <Link
            href="/siswa/materi"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Lihat Semua
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {feed?.data.slice(0, 5).map((m) => (
            <Link
              key={m.id}
              href={`/siswa/materi/${m.id}`}
              className="flex items-center gap-3 bg-glass rounded-2xl border border-border-precision p-3 shadow-glass hover:bg-white/80 hover:border-primary/25 active:scale-[0.99] transition-all duration-200"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  m.selesai
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-primary/10 text-primary",
                )}
              >
                {m.selesai ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-on-surface truncate">
                  {m.judul}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {m.kursusJudul || "\u2014"}
                </p>
                {m.progress > 0 && !m.selesai && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 max-w-[100px] h-1 bg-border-precision rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-primary tabular-nums">
                      {m.progress}%
                    </span>
                  </div>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-on-surface-variant/30 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {pengumuman.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-4 h-4 text-on-surface-variant" />
            <h2 className="font-heading font-semibold text-on-surface text-sm">Pengumuman</h2>
          </div>
          <div className="space-y-2">
            {pengumuman.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="bg-glass border border-border-precision rounded-2xl p-3"
              >
                <div className="flex items-start gap-2">
                  {p.isPinned && (
                    <span className="text-[10px] font-bold tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                      PINNED
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm">{p.judul}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                      {p.konten}
                    </p>
                    <p className="text-xs text-on-surface-variant/60 mt-1.5">
                      {p.guruNama || "Guru"} &middot;{" "}
                      {new Date(p.publishedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}