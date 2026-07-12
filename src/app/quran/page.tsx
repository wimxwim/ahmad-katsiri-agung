"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Book, Play, Pause, ArrowLeft, Loader2 } from "lucide-react";

interface Surah {
  nomor: number;
  nama: string;
  nama_latin: string;
  jumlah_ayat: number;
  tempat_turun: string;
  arti: string;
  audio: string;
}

interface Ayat {
  nomor: number;
  ar: string;
  tr: string;
  idn: string;
}

interface SurahDetail extends Surah {
  ayat: Ayat[];
  deskripsi: string;
}

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selected, setSelected] = useState<SurahDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [activeSurahNo, setActiveSurahNo] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://equran.id/api/surat")
      .then((r) => r.json())
      .then((data: Surah[]) => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setFetchError(true);
      });
  }, []);

  function retryFetch() {
    setLoading(true);
    setFetchError(false);
    fetch("https://equran.id/api/surat")
      .then((r) => r.json())
      .then((data: Surah[]) => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setFetchError(true);
      });
  }

  async function openSurah(nomor: number) {
    setDetailLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`https://equran.id/api/surat/${nomor}`);
      const data: SurahDetail = await res.json();
      setSelected(data);
      detailRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("[quran] openSurah failed:", error);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeSurah() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
      setAudioProgress(0);
      setAudioDuration(0);
      setActiveSurahNo(null);
    }
    setSelected(null);
  }

  function toggleAudio(url: string, nomor: number) {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
      setAudioProgress(0);
      setAudioDuration(0);
      setActiveSurahNo(null);
    } else {
      const audio = new Audio(url);
      audio.loop = false;

      audio.ontimeupdate = () => {
        setAudioProgress(audio.currentTime);
      };
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };
      audio.onended = () => {
        setPlaying(false);
        setAudioProgress(0);
        setAudioDuration(0);
        setActiveSurahNo(null);
        audioRef.current = null;
      };

      audio.play();
      audioRef.current = audio;
      setPlaying(true);
      setActiveSurahNo(nomor);
    }
  }

  function formatTime(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const filtered = surahs.filter(
    (s) =>
      s.nama_latin.toLowerCase().includes(search.toLowerCase()) ||
      s.arti.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="min-h-dvh pb-24 md:pb-16">
        {/* Hero */}
        <section className="relative pt-28 pb-16 sm:pb-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-6 border border-primary/20">
              <Book className="w-3.5 h-3.5" />
              AL-QUR'AN
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-6xl tracking-tighter text-on-surface mb-4">
              Al-Qur'an{" "}
              <span className="text-primary italic font-semibold">& Terjemahan</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-2xl mx-auto">
              Baca, pelajari, dan renungkan firman Allah SWT lengkap dengan
              terjemahan bahasa Indonesia dan audio.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4" ref={detailRef}>
          {detailLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {selected && !detailLoading && (
            <div className="mb-10 animate-fade-up">
              <button
                onClick={closeSurah}
                className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke daftar
              </button>

              <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-6 sm:p-10 shadow-glass">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-3xl sm:text-4xl font-quran text-primary font-bold" dir="rtl">
                      {selected.nama}
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl text-on-surface font-bold mb-1">
                    {selected.nama_latin}
                  </h2>
                  <p className="text-on-surface-variant text-sm mb-1">
                    {selected.arti}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xs text-on-surface-variant">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold capitalize">
                      {selected.tempat_turun === "mekah" ? "Makkiyah" : "Madaniyah"}
                    </span>
                    <span>{selected.jumlah_ayat} Ayat</span>
                  </div>

                  {selected.audio && (
                    <div className="mt-5 space-y-3">
                      <button
                        onClick={() => toggleAudio(selected.audio, selected.nomor)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-110 transition-all shadow-xl shadow-primary/20"
                      >
                        {playing ? (
                          <>
                            <Pause className="w-4 h-4" /> Berhenti
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" /> Putar Audio
                          </>
                        )}
                      </button>

                      {playing && (
                        <div className="max-w-xs mx-auto">
                          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
                            <span>{formatTime(audioProgress)}</span>
                            <span>{formatTime(audioDuration)}</span>
                          </div>
                          <div className="h-1.5 bg-border-precision rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-[width] duration-150 ease-linear"
                              style={{
                                width: audioDuration > 0
                                  ? `${(audioProgress / audioDuration) * 100}%`
                                  : "0%",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed mb-8 text-center max-w-3xl mx-auto">
                  {selected.deskripsi.replace(/<[^>]*>/g, "")}
                </p>

                <div className="border-t border-border-precision pt-8">
                  {selected.ayat.map((ayat) => (
                    <div
                      key={ayat.nomor}
                      id={`ayat-${ayat.nomor}`}
                      className="py-6 border-b border-border-precision/50 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {ayat.nomor}
                        </span>
                      </div>
                      <p
                        className="text-xl sm:text-2xl lg:text-3xl font-quran leading-[2] text-right mb-4"
                        dir="rtl"
                      >
                        {ayat.ar}
                      </p>
                      <p className="text-sm text-on-surface-variant italic mb-2">
                        {ayat.tr}
                      </p>
                      <p className="text-sm sm:text-base text-on-surface leading-relaxed">
                        {ayat.idn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!selected && !detailLoading && (
            <>
              {/* Search */}
              <div className="relative max-w-md mx-auto mb-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Cari surah..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-full bg-glass backdrop-blur-2xl border border-border-precision text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : fetchError ? (
                <div className="text-center py-16">
                  <p className="text-on-surface-variant mb-4">
                    Gagal memuat daftar surah. Periksa koneksi internet Anda.
                  </p>
                  <button
                    onClick={retryFetch}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:brightness-110 transition-all"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((surah) => (
                    <button
                      key={surah.nomor}
                      onClick={() => openSurah(surah.nomor)}
                      className="group text-left bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-card p-5 shadow-glass hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {surah.nomor}
                        </span>
                        <span
                          className="text-lg font-quran text-primary/80"
                          dir="rtl"
                        >
                          {surah.nama}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-on-surface text-base mb-0.5">
                        {surah.nama_latin}
                      </h3>
                      <p className="text-xs text-on-surface-variant mb-3">
                        {surah.arti}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-primary/5 text-primary/80 font-semibold capitalize">
                          {surah.tempat_turun === "mekah" ? "Makkiyah" : "Madaniyah"}
                        </span>
                        <span>{surah.jumlah_ayat} Ayat</span>
                        {activeSurahNo === surah.nomor && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Diputar
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <p className="text-center text-on-surface-variant py-10">
                  Surah tidak ditemukan
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
