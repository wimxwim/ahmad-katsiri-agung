"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Users, Globe, ArrowRight, Loader2 } from "lucide-react";

interface LoginData {
  namaSiswa: string;
  kelas: string;
  status: "resmi" | "latihan";
  token?: string;
}

interface QuizLoginProps {
  onLogin: (data: LoginData) => void;
}

export function QuizLogin({ onLogin }: QuizLoginProps) {
  const [mode, setMode] = useState<"pilih" | "resmi" | "latihan">("pilih");
  const [nama, setNama] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleMasukSiswa(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim() || !tanggalLahir.trim()) {
      setError("Nama dan Tanggal Lahir harus diisi");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/siswa/cek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama.trim(), tanggalLahir: tanggalLahir.trim() }),
      });
      const data = await res.json();
      if (data.found) {
        onLogin({ namaSiswa: data.nama, kelas: data.kelas, status: "resmi", token: data.token });
      } else {
        setError(data.error || "Data tidak ditemukan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  function handleLatihan() {
    onLogin({ namaSiswa: nama.trim() || "Pengunjung", kelas: "-", status: "latihan" });
  }

  if (mode === "pilih") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center max-w-lg mx-auto"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Users className="w-10 h-10 text-primary" />
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl text-on-surface mb-3">
          Pilih Mode Kuis
        </h2>
        <p className="text-sm text-on-surface-variant mb-10">
          Silakan pilih status Anda untuk memulai kuis.
        </p>

        <div className="grid gap-5">
          <button
            onClick={() => setMode("resmi")}
            className="group text-left w-full bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-6 shadow-glass hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex items-center gap-5">
              <span className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 text-primary" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-lg font-semibold text-on-surface">
                  Siswa Pak Aggung
                </p>
                <p className="text-sm text-on-surface-variant">
                  Tercatat di Nilai Kelas
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => setMode("latihan")}
            className="group text-left w-full bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-6 shadow-glass hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex items-center gap-5">
              <span className="w-14 h-14 rounded-2xl bg-tertiary-fixed-dim/10 flex items-center justify-center shrink-0">
                <Globe className="w-7 h-7 text-tertiary" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-lg font-semibold text-on-surface">
                  Umum / Latihan
                </p>
                <p className="text-sm text-on-surface-variant">
                  Hanya Latihan Bebas
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-tertiary shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </motion.div>
    );
  }

  if (mode === "resmi") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-primary" />
        </div>

        <h2 className="font-heading text-xl sm:text-2xl text-on-surface mb-6">
          Masuk sebagai Siswa Pak Aggung
        </h2>

        <form
          onSubmit={handleMasukSiswa}
          className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-6 shadow-glass text-left"
        >
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama lengkap sesuai absen"
            className="w-full bg-white/50 border border-primary/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-5 transition-all"
          />

          <label className="block text-sm font-semibold text-on-surface mb-2">
            Tanggal Lahir
          </label>
          <input
            type="text"
            value={tanggalLahir}
            onChange={(e) => setTanggalLahir(e.target.value)}
            placeholder="Contoh: 12 Maret 2012"
            className="w-full bg-white/50 border border-primary/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6 transition-all"
          />

          {error && (
            <p className="text-xs text-red-500 mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3.5 rounded-xl font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memeriksa...
              </>
            ) : (
              <>
                Mulai Kuis
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode("pilih")}
            className="w-full text-center text-xs text-on-surface-variant hover:text-primary mt-4 transition-colors"
          >
            Kembali ke pilihan mode
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
      className="text-center max-w-md mx-auto"
    >
      <div className="w-16 h-16 rounded-3xl bg-tertiary-fixed-dim/10 flex items-center justify-center mx-auto mb-6">
        <Globe className="w-8 h-8 text-tertiary" />
      </div>

      <h2 className="font-heading text-xl sm:text-2xl text-on-surface mb-3">
        Mode Latihan Umum
      </h2>
      <p className="text-sm text-on-surface-variant mb-6">
        Masukkan nama panggilan (boleh dikosongkan).
      </p>

      <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-6 shadow-glass">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama panggilan"
          maxLength={50}
          className="w-full bg-white/50 border border-primary/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-5 transition-all"
        />

        <button
          onClick={handleLatihan}
          className="w-full inline-flex items-center justify-center gap-2 bg-tertiary-container text-on-tertiary px-6 py-3.5 rounded-xl font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
        >
          Mulai Latihan
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setMode("pilih")}
          className="w-full text-center text-xs text-on-surface-variant hover:text-primary mt-4 transition-colors"
        >
          Kembali ke pilihan mode
        </button>
      </div>
    </motion.div>
  );
}
