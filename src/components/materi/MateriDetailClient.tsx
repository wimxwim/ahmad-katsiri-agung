"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Sparkles,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  Gamepad2,
  MessageCircle,
  Quote,
} from "lucide-react";
import type { BabMateri } from "@/data/materi";

export function MateriDetailClient({ materi }: { materi: BabMateri }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("aggung_progress");
      const progress = raw ? JSON.parse(raw) : {};
      progress[materi.slug] = { title: materi.title, kelas: materi.kelas, readAt: Date.now() };
      localStorage.setItem("aggung_progress", JSON.stringify(progress));
    } catch {}
  }, [materi.slug, materi.title, materi.kelas]);

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-28 pb-24 sm:pb-32">
      <HeroSection materi={materi} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <SidebarLeft materi={materi} />
        <ContentArea materi={materi} />
        <SidebarRight materi={materi} />
      </div>
      <NavPills
        prevTitle={materi.prevTitle}
        prevSlug={materi.prevSlug}
        nextTitle={materi.nextTitle}
        nextSlug={materi.nextSlug}
      />
    </div>
  );
}

function HeroSection({ materi }: { materi: BabMateri }) {
  return (
    <div
      className="max-w-4xl mx-auto mb-16 sm:mb-24 text-center animate-fade-up"
    >
      <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider">
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          BAB {materi.bab}: {materi.babLabel}
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary-fixed-dim/20 text-tertiary text-xs font-semibold">
          <Clock className="w-4 h-4" aria-hidden="true" />
          {materi.waktuBaca}
        </span>
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-7xl tracking-tighter text-on-surface mb-4">
        {materi.title}
      </h1>
      <p className="text-sm sm:text-base md:text-xl text-on-surface-variant max-w-2xl mx-auto">
        {materi.pendahuluan}
      </p>
    </div>
  );
}

function SidebarLeft({ materi }: { materi: BabMateri }) {
  return (
    <aside className="hidden xl:block lg:col-span-2 sticky top-32 space-y-6">
      <div
        className="bg-glass backdrop-blur-2xl border border-border-precision p-5 rounded-2xl shadow-glass animate-fade-left"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-primary">Point Utama</span>
        </div>
        <p className="text-sm text-on-surface-variant">{materi.poinPenting[0]}</p>
      </div>

      <div
        className="bg-glass backdrop-blur-2xl border border-border-precision p-5 rounded-2xl shadow-glass opacity-70 hover:opacity-100 transition-opacity animate-fade-left"
        style={{ animationDelay: '0.4s' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-tertiary" aria-hidden="true" />
          <span className="text-sm font-semibold text-tertiary">Refleksi</span>
        </div>
        <p className="text-sm text-on-surface-variant">
          Sudahkah kita mengamalkan nilai-nilai ini hari ini?
        </p>
      </div>
    </aside>
  );
}

function ContentArea({ materi }: { materi: BabMateri }) {
  return (
    <div className="lg:col-span-8 xl:col-span-7">
      <div
        className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 lg:p-16 shadow-glass animate-fade-up"
        style={{ animationDelay: '0.1s' }}
      >
        <article className="space-y-8 sm:space-y-12">
          {materi.konten.map((section, i) => (
            <section key={i}>
              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-on-surface mb-4">
                {section.judul}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed">
                {section.isi}
              </p>
            </section>
          ))}

          {materi.dalil && (
            <div className="relative bg-gradient-to-b from-white to-primary/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 lg:p-16 overflow-hidden border-l-8 border-l-tertiary-fixed-dim shadow-inner">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                <Quote className="w-full h-full text-tertiary-fixed-dim" aria-hidden="true" />
              </div>

              <div className="flex items-center justify-between border-b border-border-precision pb-6 mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-tertiary-fixed-dim rounded-full" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-on-surface-variant">
                    Dalil Naqli
                  </span>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold">
                  {materi.dalil.surah}
                </span>
              </div>

              <div className="space-y-8 text-center">
              <div className="overflow-x-auto">
                <p
                  className="font-quran text-xl sm:text-2xl md:text-4xl lg:text-5xl leading-[2.2] text-on-surface"
                  dir="rtl"
                >
                  {materi.dalil.arab}
                </p>
              </div>

                <Quote className="w-6 h-6 mx-auto text-tertiary-fixed-dim" aria-hidden="true" />

                <p className="italic text-on-surface-variant max-w-xl mx-auto">
                  &ldquo;{materi.dalil.arti}&rdquo;
                </p>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/hafalan"
                  className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  Hafalkan Dalil Ini
                </Link>
              </div>
            </div>
          )}

          {materi.dimensi && materi.dimensi.length > 0 && (
            <section>
              <h3 className="flex items-center gap-3 font-heading text-xl sm:text-2xl md:text-3xl text-primary mb-6">
                <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                </span>
                Poin Pembelajaran
              </h3>

              <div className="grid gap-3 sm:gap-5">
                {materi.dimensi.map((d) => (
                  <div
                    key={d.nomor}
                    className="group p-5 sm:p-6 md:p-8 rounded-2xl border border-border-precision hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                  >
                    <div className="flex items-start gap-5">
                      <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20 shrink-0">
                        {d.nomor}
                      </span>
                      <div>
                        <h4 className="font-heading text-xl text-primary mb-1">{d.judul}</h4>
                        <p className="text-on-surface-variant leading-relaxed">{d.deskripsi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}

function SidebarRight({ materi }: { materi: BabMateri }) {
  return (
    <aside className="lg:col-span-4 xl:col-span-3 space-y-6 sticky top-32">
      <div
        className="bg-glass backdrop-blur-2xl border border-border-precision p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-glass-lg relative overflow-hidden animate-fade-right"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
          <Sparkles className="w-full h-full text-primary" aria-hidden="true" />
        </div>

        <h4 className="flex items-center gap-2 font-heading text-xl text-on-surface mb-6">
          <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
          Key Takeaways
        </h4>

        <ul className="space-y-5">
          {materi.poinPenting.map((poin, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              </span>
              <span className="text-base text-on-surface leading-relaxed">{poin}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t border-border-precision space-y-3">
          <a
            href={`/pdf/${materi.slug}.pdf`}
            className="flex items-center justify-center gap-3 w-full py-3.5 bg-primary text-on-primary rounded-2xl font-semibold hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-300"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Unduh Modul Ajar
          </a>
          <a
            href={`/pdf/${materi.slug}-ppt.pdf`}
            className="flex items-center justify-center gap-3 w-full py-3.5 border-2 border-primary/20 text-primary rounded-2xl font-semibold hover:bg-primary hover:text-on-primary hover:border-primary active:scale-[0.98] transition-all duration-300"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Unduh Slide PPT
          </a>
          {materi.soalUrl && (
            <a
              href={materi.soalUrl}
              className="flex items-center justify-center gap-3 w-full py-3.5 border-2 border-primary/20 text-primary rounded-2xl font-semibold hover:bg-primary hover:text-on-primary hover:border-primary active:scale-[0.98] transition-all duration-300"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Unduh Naskah Soal
            </a>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-border-precision space-y-3">
          <Link
            href="/dalil/al-isra-34"
            className="flex items-center justify-center gap-3 w-full py-3.5 bg-tertiary-container text-on-tertiary rounded-2xl font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Analisis Dalil QS. Al-Isra&apos;: 34
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-border-precision">
          <a
            href={`https://wa.me/6285158795502?text=${encodeURIComponent(`Assalamualaikum Kak Agung, saya ingin memberi saran/masukan untuk materi "${materi.title}":`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#25D366] text-white rounded-2xl font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            Kirim Saran & Masukan
          </a>
        </div>
      </div>

      {materi.videoUrl ? (
        <div
          className="bg-glass backdrop-blur-2xl border border-border-precision p-2 rounded-2xl sm:rounded-3xl shadow-glass overflow-hidden animate-fade-right"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="rounded-2xl overflow-hidden aspect-video">
            <iframe
              src={materi.videoUrl}
              title={`Video: ${materi.title}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div
          className="bg-glass backdrop-blur-2xl border border-border-precision p-4 rounded-2xl sm:rounded-3xl shadow-glass animate-fade-right"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-primary/10 via-surface to-primary/5 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-primary/30" aria-hidden="true" />
          </div>
        </div>
      )}

      {materi.gameUrl && (
        <a
          href={materi.gameUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-glass backdrop-blur-2xl border border-border-precision p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-glass group hover:bg-white hover:shadow-xl transition-all duration-500 animate-fade-right"
          style={{ animationDelay: '0.35s' }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="w-12 h-12 rounded-2xl bg-tertiary-fixed-dim/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6 text-tertiary" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-tertiary">
                GAME TERKAIT
              </p>
              <p className="font-heading text-base text-on-surface">Jujur dan Amanah</p>
            </div>
          </div>
          <p className="text-base text-on-surface-variant leading-relaxed mb-4">
            Game interaktif tentang kejujuran dan amanah — ayo mainkan!
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-tertiary group-hover:gap-3 transition-all">
            Mainkan Game
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </span>
        </a>
      )}
    </aside>
  );
}

function NavPills({
  prevTitle,
  prevSlug,
  nextTitle,
  nextSlug,
}: {
  prevTitle?: string;
  prevSlug?: string;
  nextTitle?: string;
  nextSlug?: string;
}) {
  return (
    <div
      className="max-w-4xl mx-auto mt-20 sm:mt-32 flex flex-col md:flex-row justify-between gap-4 sm:gap-6 animate-fade-up"
      style={{ animationDelay: '0.4s' }}
    >
      {prevSlug ? (
        <Link
          href={`/materi/${prevSlug}`}
          className="group flex items-center gap-5 px-5 sm:px-8 py-5 sm:py-6 rounded-[24px] sm:rounded-[40px] bg-glass backdrop-blur-2xl border border-border-precision shadow-glass hover:bg-white hover:shadow-xl transition-all duration-500"
        >
          <span className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500 shrink-0">
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-1">
              Sebelumnya
            </p>
            <p className="font-heading text-base sm:text-xl text-on-surface">{prevTitle}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextSlug ? (
        <Link
          href={`/materi/${nextSlug}`}
          className="group flex items-center gap-5 px-5 sm:px-8 py-5 sm:py-6 rounded-[24px] sm:rounded-[40px] bg-glass backdrop-blur-2xl border border-border-precision shadow-glass hover:bg-white hover:shadow-xl transition-all duration-500"
        >
          <div>
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-1">
              Selanjutnya
            </p>
            <p className="font-heading text-base sm:text-xl text-on-surface">{nextTitle}</p>
          </div>
          <span className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform shrink-0">
            <ChevronRight className="w-6 h-6" aria-hidden="true" />
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
