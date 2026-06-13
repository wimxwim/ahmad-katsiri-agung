"use client";

"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  BookOpen,
  Play,
  ClipboardList,
  ArrowRight,
  Plus,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function PendidikPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 md:pt-32 pb-16 md:pb-32">
      <motion.header
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="max-w-4xl mx-auto text-center mb-32"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-8">
          PORTAL PENDIDIK V.2.6
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-8xl tracking-tighter text-on-surface leading-none mb-8">
          Pusat Instrumen Akademik.
        </h1>

        <p className="text-sm sm:text-base md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Platform futuristik yang dirancang untuk mempermudah manajemen
          pembelajaran. Minimalis, efisien, dan tanpa hambatan visual.
        </p>
      </motion.header>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 md:gap-8 mb-24 sm:mb-32">
        <FeatureCard
          colSpan="md:col-span-8"
          icon={BookOpen}
          badge="TERBARU: KURIKULUM MERDEKA"
          title="Modul Ajar"
          desc="Akses pustaka modul ajar digital yang telah dikurasi untuk standar pendidikan global terkini."
          cta="Eksplorasi Modul"
          delay={0.1}
        />

        <FeatureCard
          colSpan="md:col-span-4"
          icon={Play}
          title="Video"
          desc="Koleksi video pembelajaran Akidah Akhlak yang sinematik dan mudah dipahami."
          badge="120+ Materi Visual"
          delay={0.15}
        />

        <FeatureCard
          colSpan="md:col-span-4"
          icon={ClipboardList}
          title="Soal & Kisi-kisi"
          desc="Bank soal adaptif dengan klasifikasi level kognitif Bloom yang presisi."
          cta={Plus}
          delay={0.2}
        />

        <PerangkatSection />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 md:gap-12 border-t border-primary/10 pt-12 sm:pt-16 md:pt-24 mb-24 sm:mb-32">
        {[
          { value: "98%", label: "EFISIENSI WAKTU" },
          { value: "12K+", label: "GURU AKTIF" },
          { value: "240TB", label: "DATA TERARSIP" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center"
          >
            <p className="font-heading text-3xl sm:text-5xl md:text-7xl text-primary mb-2">
              {stat.value}
            </p>
            <p className="text-xs font-bold tracking-[0.1em] text-on-surface-variant">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </section>

      <section className="mb-24 sm:mb-32">
        <RekapSection />
      </section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative bg-primary-container rounded-[42px_18px_42px_18px] p-8 sm:p-12 md:p-20 overflow-hidden text-center"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-primary-fixed-dim/20 blur-[100px] rounded-full -ml-16 -mb-16 pointer-events-none" />

        <div className="relative">
          <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl text-white mb-6">
            Siap Memulai Transformasi?
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
            Bergabunglah dengan ribuan pendidik yang telah mendefinisikan ulang
            cara mereka mengajar dengan teknologi masa depan.
          </p>
          <div className="flex flex-col md:flex-row gap-5 justify-center">
            <Link
              href="/materi"
              className="inline-flex items-center gap-2 bg-primary-fixed-dim text-on-primary-fixed px-8 py-4 rounded-full font-semibold hover:scale-105 active:scale-[0.98] shadow-xl transition-transform duration-300"
            >
              Daftar Sekarang
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/tentang"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 backdrop-blur-sm active:scale-[0.98] transition-all duration-300"
            >
              Lihat Dokumentasi
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function FeatureCard({
  colSpan,
  icon: Icon,
  badge,
  title,
  desc,
  cta,
  delay,
}: {
  colSpan: string;
  icon: typeof BookOpen;
  badge?: string;
  title: string;
  desc: string;
  cta?: string | typeof Plus;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const }}
      className={`${colSpan} group bg-glass backdrop-blur-2xl border border-glass-stroke rounded-[42px_18px_42px_18px] p-6 sm:p-8 md:p-10 flex flex-col justify-between shadow-glass hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden`}
    >
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/5 blur-3xl rounded-full group-hover:opacity-100 opacity-50 transition-opacity pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          {typeof cta === "string" && (
            <div className="flex items-center gap-2 text-sm font-semibold text-primary md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {cta}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
        </div>

        {badge && (
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-3">
            {badge}
          </span>
        )}

        <h3 className="font-heading text-xl sm:text-2xl md:text-3xl text-on-surface mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
          {desc}
        </p>
      </div>

      {cta && typeof cta !== "string" && (
        <span className="self-end w-10 h-10 rounded-full bg-on-surface text-white flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5" aria-hidden="true" />
        </span>
      )}
    </motion.div>
  );
}

const PERANGKAT = [
  { kelas: 7, label: "PROTA", file: "/pdf/perangkat/prota-7.pdf" },
  { kelas: 9, label: "PROTA", file: "/pdf/perangkat/prota-9.pdf" },
  { kelas: 7, label: "PROSEM", file: "/pdf/perangkat/prosem-7.pdf" },
  { kelas: 8, label: "PROSEM", file: "/pdf/perangkat/prosem-8.pdf" },
  { kelas: 9, label: "PROSEM", file: "/pdf/perangkat/prosem-9.pdf" },
  { kelas: 7, label: "ATP", file: "/pdf/perangkat/atp-7.pdf" },
  { kelas: 8, label: "ATP", file: "/pdf/perangkat/atp-8.pdf" },
  { kelas: 9, label: "ATP", file: "/pdf/perangkat/atp-9.pdf" },
];

const KELAS_LIST = [7, 8, 9] as const;

function PerangkatSection() {
  const [kelas, setKelas] = useState<number>(7);

  const items = PERANGKAT.filter((p) => p.kelas === kelas);
  const adaProta8 = PERANGKAT.some((p) => p.kelas === 8 && p.label === "PROTA");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
      className="md:col-span-8 bg-glass backdrop-blur-2xl border border-glass-stroke rounded-[32px_16px_32px_16px] p-6 sm:p-8 md:p-10 shadow-glass"
    >
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
        <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-primary/5">
          <img
            src="/images/pendidik/mockup-perangkat.png"
            alt="Perangkat Ajar"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-heading text-xl sm:text-3xl md:text-4xl text-on-surface mb-3">
            Perangkat Ajar
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-lg">
            Program Tahunan, Program Semester, dan ATP — Kurikulum Merdeka.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto -mx-2 px-2">
        {KELAS_LIST.map((k) => (
          <button
            key={k}
            onClick={() => setKelas(k)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              kelas === k
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "bg-primary/5 text-on-surface-variant hover:bg-primary/10"
            }`}
          >
            Kelas {k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {["PROTA", "PROSEM", "ATP"].map((label) => {
          const item = items.find((p) => p.label === label);
          const tersedia = !!item;
          const kosongK8 = label === "PROTA" && kelas === 8;
          return (
            <div
              key={label}
              className={`border rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition-all duration-300 ${
                tersedia
                  ? "border-border-precision bg-white/40 hover:shadow-md hover:-translate-y-1"
                  : "border-dashed border-on-surface-variant/20 bg-transparent"
              }`}
            >
              <span
                className={`text-xs font-bold tracking-wider mb-3 ${
                  tersedia ? "text-primary" : "text-on-surface-variant/40"
                }`}
              >
                {label}
              </span>
              <span className={`text-[10px] uppercase tracking-wider mb-4 ${
                tersedia ? "text-on-surface-variant/60" : "text-on-surface-variant/30"
              }`}>
                {kelas === 7 ? "Kelas 7" : kelas === 8 ? "Kelas 8" : "Kelas 9"}
              </span>
              {tersedia ? (
                <a
                  href={item.file}
                  download
                  className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                  Unduh
                </a>
              ) : (
                <span className="text-[10px] text-on-surface-variant/30 italic">
                  {kosongK8 ? "Belum tersedia" : "—"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function RekapSection() {
  const [rekap, setRekap] = useState<
    { nama: string; kelas: string; status: string; skor: string; tanggal: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [keyError, setKeyError] = useState("");

  useEffect(() => {
    setLoading(false);
  }, []);

  async function fetchRekap(key: string) {
    setLoading(true);
    setKeyError("");
    try {
      const r = await fetch("/api/kuis/rekap", {
        headers: { "x-api-key": key },
      });
      if (r.status === 401) {
        setLocked(true);
        setKeyError("Kunci akses salah");
        setLoading(false);
        return;
      }
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        setKeyError(err.error || "Gagal memuat data");
        setLoading(false);
        return;
      }
      const data = await r.json();
      if (data.error) {
        setLocked(true);
        setKeyError(data.error === "Unauthorized" ? "Kunci akses salah" : data.error);
        setLoading(false);
        return;
      }
      setRekap(data.rekap || []);
      setLocked(false);
    } catch {
      setKeyError("Gagal terhubung ke server");
    }
    setLoading(false);
  }

  function handleSubmitKey(e: React.FormEvent) {
    e.preventDefault();
    fetchRekap(apiKey.trim());
  }

  if (locked) {
    return (
      <div>
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-on-surface mb-2">
            Rekap Nilai Siswa
          </h2>
          <p className="text-sm text-on-surface-variant">Masukkan kunci akses untuk melihat data</p>
        </div>
        <form
          onSubmit={handleSubmitKey}
          className="max-w-sm mx-auto bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-6 shadow-glass"
        >
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Kunci akses rekap nilai"
            className="w-full bg-white/50 border border-primary/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4 transition-all"
          />
          {keyError && (
            <p className="text-xs text-red-500 mb-4 text-center">{keyError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3.5 rounded-xl font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-40"
          >
            {loading ? "Memeriksa..." : "Lihat Rekap Nilai"}
          </button>
        </form>
      </div>
    );
  }

  const belum = rekap.filter((r) => r.status === "belum");
  const sudah = rekap.filter((r) => r.status === "sudah");

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-on-surface mb-2">
          Rekap Nilai Siswa
        </h2>
        <p className="text-sm text-on-surface-variant">
          {loading
            ? "Memuat data..."
            : `${sudah.length} dari ${rekap.length} siswa telah mengerjakan kuis`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-on-surface-variant">Memuat data...</p>
        </div>
      ) : rekap.length === 0 ? (
        <div className="text-center py-12 bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-10">
          <p className="text-sm text-on-surface-variant">
            Belum ada data. Pastikan Google Sheets sudah terhubung dan siswa sudah login.
          </p>
        </div>
      ) : (
        <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] overflow-hidden shadow-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-precision bg-primary/5">
                  <th className="text-left px-4 sm:px-6 py-4 font-semibold text-on-surface">Nama</th>
                  <th className="text-left px-4 sm:px-6 py-4 font-semibold text-on-surface">Kelas</th>
                  <th className="text-center px-4 sm:px-6 py-4 font-semibold text-on-surface">Status</th>
                  <th className="text-center px-4 sm:px-6 py-4 font-semibold text-on-surface">Skor</th>
                  <th className="text-right px-4 sm:px-6 py-4 font-semibold text-on-surface">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {rekap.map((row, i) => (
                  <tr
                    key={row.nama + i}
                    className="border-b border-border-precision/50 hover:bg-white/40 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 text-on-surface font-medium">{row.nama}</td>
                    <td className="px-4 sm:px-6 py-4 text-on-surface-variant">{row.kelas}</td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      {row.status === "sudah" ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          Sudah
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 text-xs font-semibold">
                          <XCircle className="w-4 h-4" />
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-semibold text-on-surface">
                      {row.skor}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right text-on-surface-variant text-xs">
                      {row.tanggal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && belum.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-xs text-on-surface-variant">
            {belum.length} siswa belum mengerjakan. Ingatkan via grup WhatsApp atau tatap muka.
          </p>
        </div>
      )}
    </div>
  );
}
