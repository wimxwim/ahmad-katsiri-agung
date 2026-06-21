"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

type Mode = "pilih" | "murid" | "guru";

export function FormMasuk() {
  const [mode, setMode] = useState<Mode>("pilih");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>, mode: "murid" | "guru") {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("_mode", mode);
    try {
      const res = await fetch("/api/masuk", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.redirect) {
        window.location.href = result.redirect;
      }
    } catch (err) {
      setError("Gagal: " + (err instanceof Error ? err.message : "Terjadi kesalahan"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-0 sm:p-6">
      <div className="w-full max-w-5xl bg-white rounded-none md:rounded-[32px] overflow-hidden shadow-glass-lg flex flex-col md:grid md:grid-cols-[1.05fr_0.95fr] min-h-screen md:min-h-[560px]">
        {/* LEFT PANEL — Brand & Info */}
        <aside className="relative bg-gradient-to-br from-primary to-[#003d24] text-white px-6 py-6 md:px-11 md:py-12 flex flex-col justify-between overflow-hidden md:min-h-0">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 80% 15%, #fff 0 2px, transparent 3px)`,
              backgroundSize: "34px 34px",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-11 h-11 rounded-[13px] bg-[#eec055] text-[#003d24] grid place-items-center font-heading font-extrabold text-xl">
                ع
              </span>
              <span className="font-heading text-xl font-bold tracking-tight">
                AKAL Center
              </span>
            </div>
            <h1 className="font-heading text-xl md:text-[30px] leading-tight mb-2">
              Belajar Pendidikan Agama Islam jadi mudah & menyenangkan.
            </h1>
            <p className="text-white/80 text-[13px] md:text-[15px] max-w-[36ch]">
              Platform belajar PAI untuk SMP/MTs — materi, latihan, dan perangkat ajar dalam satu tempat.
            </p>
          </div>
          <ul className="relative z-10 space-y-3 mt-6 hidden md:block">
            {[
              "Materi PAI lengkap per bab",
              "Video pembelajaran & PPT",
              "Game edukasi interaktif",
              "Kuis dinilai otomatis — hasil langsung ke guru",
              "Hafalan hadits",
              "Perangkat ajar guru: ATP, Prosem, Prota, PDF",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
                <span className="w-5 h-5 rounded-full bg-white/20 text-white grid place-items-center text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="relative z-10 text-xs text-white/60 mt-6 hidden md:block">
            Bisa dibuka lewat HP maupun komputer.
          </p>
          {/* Chips untuk mobile */}
          <div className="relative z-10 flex flex-wrap gap-2 mt-4 md:hidden">
            {["📘 Materi", "🎬 Video", "🎮 Game", "📝 Kuis", "📿 Hafalan"].map((chip) => (
              <span
                key={chip}
                className="text-[11px] font-semibold text-white bg-white/15 border border-white/20 px-3 py-1.5 rounded-full"
              >
                {chip}
              </span>
            ))}
          </div>
        </aside>

        {/* RIGHT PANEL — Form */}
        <main className="px-6 py-6 md:px-11 md:py-12 flex flex-col justify-center">
          {mode === "pilih" && (
            <div>
              <h2 className="font-heading text-xl md:text-2xl text-on-surface mb-1">
                Selamat datang 👋
              </h2>
              <p className="text-[13px] md:text-sm text-on-surface-variant mb-6 md:mb-8">
                Pilih cara kamu masuk ke AKAL Center.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setMode("murid")}
                  className="group flex items-center gap-4 w-full text-left border border-border-precision bg-white rounded-[18px] p-[18px] transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-glass cursor-pointer"
                >
                  <span className="w-[50px] h-[50px] rounded-[14px] bg-surface grid place-items-center text-[26px] shrink-0">
                    🧑‍🎓
                  </span>
                  <span className="flex-1">
                    <b className="block text-[16px] text-on-surface">Masuk sebagai Murid</b>
                    <span className="text-[13px] text-on-surface-variant">Materi, PPT, video, kuis & game</span>
                  </span>
                  <span className="text-primary/40 text-xl group-hover:text-primary transition-colors">›</span>
                </button>
                <Link
                  href="/masuk-guru"
                  className="group flex items-center gap-4 w-full text-left border border-border-precision bg-white rounded-[18px] p-[18px] transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-glass"
                >
                  <span className="w-[50px] h-[50px] rounded-[14px] bg-surface grid place-items-center text-[26px] shrink-0">
                    🧑‍🏫
                  </span>
                  <span className="flex-1">
                    <b className="block text-[16px] text-on-surface">Masuk sebagai Guru</b>
                    <span className="text-[13px] text-on-surface-variant">Akses penuh + rekap nilai</span>
                  </span>
                  <span className="text-primary/40 text-xl group-hover:text-primary transition-colors">›</span>
                </Link>
              </div>
            </div>
          )}

          {mode === "murid" && (
            <div>
              <span className="inline-block text-[11px] font-bold tracking-wider text-primary bg-primary/5 px-3 py-1.5 rounded-full mb-4">
                MURID
              </span>
              <h2 className="font-heading text-2xl text-on-surface mb-1">
                Isi data kamu dulu
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Tanpa daftar akun — cukup isi di bawah ini.
              </p>
              <form onSubmit={(e) => handleLogin(e, "murid")} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                    Nama lengkap
                  </label>
                  <input
                    name="nama"
                    required
                    placeholder="Nama kamu"
                    className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                      Kelas
                    </label>
                    <input
                      name="kelas"
                      required
                      placeholder="mis. 8A"
                      className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                      No. Absen
                    </label>
                    <input
                      name="noAbsen"
                      required
                      inputMode="numeric"
                      placeholder="mis. 14"
                      className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                      NIS <span className="font-normal text-on-surface-variant">(opsional)</span>
                    </label>
                    <input
                      name="nis"
                      placeholder="—"
                      className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                      Asal Sekolah <span className="font-normal text-on-surface-variant">(opsional)</span>
                    </label>
                    <input
                      name="sekolah"
                      placeholder="—"
                      className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant bg-surface/80 rounded-[10px] px-3 py-2.5">
                  🔒 Data ini hanya dikirim ke gurumu untuk penilaian. Tidak disimpan sebagai akun.
                </p>
                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-[15px] bg-primary text-on-primary rounded-[13px] font-semibold text-[16px] cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                >
                  Masuk ke ruang murid →
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("pilih"); setError(""); }}
                  className="w-full text-center text-[13px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  ← Ganti pilihan
                </button>
              </form>
            </div>
          )}

          {mode === "guru" && (
            <div>
              <span className="inline-block text-[11px] font-bold tracking-wider text-primary bg-primary/5 px-3 py-1.5 rounded-full mb-4">
                GURU
              </span>
              <h2 className="font-heading text-2xl text-on-surface mb-1">
                Masuk sebagai Guru
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Khusus pengajar — butuh kata sandi.
              </p>
              <form onSubmit={(e) => handleLogin(e, "guru")} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                    Nama guru
                  </label>
                  <input
                    name="nama"
                    required
                    placeholder="Nama Bapak/Ibu guru"
                    className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                    Kata sandi guru
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-[13px] pr-11 border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                      aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
                )}
                <p className="text-xs text-on-surface-variant/60 italic">Petunjuk: tanyakan kata sandi ke admin.</p>
                <button
                  type="submit"
                  className="w-full py-[15px] bg-primary text-on-primary rounded-[13px] font-semibold text-[16px] cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                >
                  Masuk (akses penuh) →
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("pilih"); setError(""); }}
                  className="w-full text-center text-[13px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  ← Ganti pilihan
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
