"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle2, ArrowRight, Sparkles, Megaphone } from "lucide-react";
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
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nama, setNama] = useState("Siswa");

  useEffect(() => {
    fetch("/api/v1/account/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.data?.nama) setNama(j.data.nama);
      })
      .catch(() => {});

    Promise.all([
      fetch("/api/v1/siswa/feed", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/siswa/pengumuman", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([feedData, pengum]) => {
        if (feedData) setFeed(feedData);
        if (pengum?.data) setPengumuman(pengum.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonDashboardSiswa />;

  if (feed && feed.data.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Belum ada materi"
        description="Gurumu belum menerbitkan materi. Cek kembali nanti atau hubungi gurumu untuk info lebih lanjut."
      />
    );
  }

  const firstName = nama.split(" ")[0];
  const stats = {
    kursus: feed?.totalKursus ?? 0,
    materi: feed?.totalMateri ?? 0,
    selesai: feed?.totalSelesai ?? 0,
  };
  const progressPct = stats.materi > 0 ? Math.round((stats.selesai / stats.materi) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">
          Halo, {firstName}!
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Lanjutkan belajarmu dan pantau progresmu di sini.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">KURSUS</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">{stats.kursus}</p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">MATERI</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">{stats.materi}</p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">SELESAI</p>
          <p className="font-heading text-2xl font-bold text-primary mt-1">
            {stats.selesai}
            <span className="text-sm text-on-surface-variant ml-1">({progressPct}%)</span>
          </p>
        </div>
      </div>

      {feed?.continueLearning && (
        <Link
          href={`/siswa/materi/${feed.continueLearning.id}`}
          className="block bg-gradient-to-br from-primary to-[#003d24] text-white rounded-2xl p-5 sm:p-6 shadow-glass-lg mb-6 hover:brightness-110 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 text-[#eec055] grid place-items-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-wider text-white/60">LANJUTKAN BELAJAR</p>
              <p className="font-heading text-lg font-bold mt-1 truncate">
                {feed.continueLearning.judul}
              </p>
              <p className="text-xs text-white/70 mt-1">{feed.continueLearning.kursusJudul}</p>
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
                    <span className="text-[10px] font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      PINNED
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm">{p.judul}</p>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                      {p.konten}
                    </p>
                    <p className="text-[10px] text-on-surface-variant/60 mt-2">
                      {p.guruNama || "Guru"} · {new Date(p.publishedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="font-heading font-semibold text-lg text-on-surface mb-3">Materi untukmu</h2>
        <div className="space-y-3">
          {feed?.data.map((m) => (
            <Link
              key={m.id}
              href={`/siswa/materi/${m.id}`}
              className="block bg-glass border border-border-precision rounded-2xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-glass-lg transition-all"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
                    m.selesai ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary"
                  }`}
                >
                  {m.selesai ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface truncate">{m.judul}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{m.kursusJudul}</p>
                  {m.ringkasan && (
                    <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{m.ringkasan}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {m.progress > 0 && (
                      <div className="flex-1 max-w-[200px]">
                        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                      {m.selesai ? (
                        <><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai</>
                      ) : m.lastReadAt ? (
                        <><Clock className="w-3 h-3" /> Dilanjutkan</>
                      ) : (
                        "Baru"
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
          className="bg-glass border border-border-precision rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-colors"
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
          className="bg-glass border border-border-precision rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-colors"
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
