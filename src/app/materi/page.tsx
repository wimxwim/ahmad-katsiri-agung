"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, CheckCircle2, Search } from "lucide-react";
import { useCmsData } from "@/components/providers/CmsProvider";
import { ALL_MATERI as ALL_MATERI_HARD } from "@/data/materi";
import { GRADIENT_SLUGS } from "@/lib/constants";

const ALL_MATERI_FALLBACK = Object.values(ALL_MATERI_HARD)
  .sort((a, b) => a.kelas - b.kelas || a.bab - b.bab)
  .map((m) => ({
    slug: m.slug,
    title: m.title,
    kelas: m.kelas,
    bab: m.bab,
    ringkasan: m.ringkasan,
    subTopik: m.subTopik,
    icon: m.icon,
    isLegacy: m.isLegacy,
  }));

const KELAS = [7, 8, 9] as const;

export default function MateriPage() {
  const { materiList } = useCmsData();
  const ALL_MATERI = materiList ?? ALL_MATERI_FALLBACK;

  const [filterKelas, setFilterKelas] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aggung_progress");
      if (raw) {
        const data = JSON.parse(raw);
        const map: Record<string, boolean> = {};
        for (const key of Object.keys(data)) {
          map[key] = true;
        }
        setProgress(map);
      }
    } catch {
      console.error("Gagal membaca progress dari localStorage");
    }
  }, []);

  const totalRead = Object.keys(progress).length;

  const filtered = (filterKelas
    ? ALL_MATERI.filter((m) => m.kelas === filterKelas)
    : ALL_MATERI).filter((m) => {
      const q = search.toLowerCase();
      return !q || m.title.toLowerCase().includes(q) || m.ringkasan.toLowerCase().includes(q);
    });

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-16 pb-24 sm:pb-32">
      <div
        className="text-center mb-16 animate-fade-up"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Kurikulum Merdeka
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl lg:text-6xl tracking-tighter text-on-surface mb-4">
          Eksplorasi{" "}
          <span className="text-primary italic font-semibold">Materi Akidah Akhlak</span>
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-2xl mx-auto">
          Pelajari Akidah Akhlak dengan pendekatan Deep Learning untuk SMP
          Kelas 7, 8, dan 9.
        </p>
      </div>

      <div className="flex justify-center mb-16 overflow-x-auto px-4 -mx-4 scrollbar-none">
        <div className="inline-flex items-center p-1 md:p-1.5 rounded-full bg-glass backdrop-blur-md border border-border-precision shadow-glass shrink-0">
          <button
            onClick={() => setFilterKelas(null)}
            className={`px-4 md:px-8 py-2.5 md:py-3.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              filterKelas === null
                ? "bg-primary text-on-primary shadow-xl shadow-primary/20"
                : "text-on-surface-variant hover:bg-primary/5"
            }`}
          >
            <span className="hidden sm:inline">Semua Kelas</span>
            <span className="sm:hidden">Semua</span>
          </button>
          {KELAS.map((k) => (
            <button
              key={k}
              onClick={() => setFilterKelas(k)}
              className={`px-4 md:px-8 py-2.5 md:py-3.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                filterKelas === k
                  ? "bg-primary text-on-primary shadow-xl shadow-primary/20"
                  : "text-on-surface-variant hover:bg-primary/5"
              }`}
            >
              <span className="hidden sm:inline">Kelas {k}</span>
              <span className="sm:hidden">{k}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-on-surface-variant/40" />
          <input
            type="text"
            placeholder="Cari materi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40"
          />
        </div>
      </div>

      {totalRead > 0 && (
        <div className="mb-10 animate-fade-up">
          <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" />
              <span className="font-heading font-semibold text-on-surface">
                Progres Belajar
              </span>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-2.5 mb-2">
              <div
                className="bg-primary rounded-full h-2.5 transition-all duration-500"
                style={{ width: `${(totalRead / ALL_MATERI.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant">
              {totalRead} dari {ALL_MATERI.length} bab telah dibaca
            </p>
          </div>
        </div>
      )}

      <div
        key={filterKelas}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
      >
        {filtered.map((materi, i) => (
          <div
            key={materi.slug}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <Link
              href={`/materi/${materi.slug}`}
              className="group block h-full bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-6 lg:p-8 shadow-glass hover:shadow-2xl hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="aspect-[4/3] rounded-2xl bg-primary/5 border border-white/40 mb-6 overflow-hidden relative">
                {GRADIENT_SLUGS.has(materi.slug) ? (
                  <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center p-6">
                    <p className="font-heading text-xl sm:text-2xl text-white text-center leading-snug">
                      {materi.title}
                    </p>
                  </div>
                ) : (
                  <img
                    src={`/images/materi/${materi.slug}.png`}
                    alt={materi.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider">
                  KELAS {materi.kelas} — BAB {materi.bab}
                </span>
                {progress[materi.slug] && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold tracking-wider">
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                    SELESAI
                  </span>
                )}
                {materi.isLegacy && (
                  <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wider border border-amber-200/50">
                    MATERI LAMA
                  </span>
                )}
              </div>

              <h3 className="font-heading text-lg sm:text-xl lg:text-2xl text-text-primary mb-3 leading-tight">
                {materi.title}
              </h3>

              <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-6">
                {materi.ringkasan}
              </p>

              <div className="flex items-center justify-between pt-5 border-t border-primary/5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary/60" aria-hidden="true" />
                  <span className="text-xs text-on-surface-variant">
                    {materi.subTopik} Sub-topik
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Pelajari
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-on-surface-variant">Belum ada materi untuk kelas ini.</p>
        </div>
      )}
    </div>
  );
}
