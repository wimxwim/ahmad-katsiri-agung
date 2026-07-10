"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, GraduationCap, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";
import { GoogleIcon } from "@/app/masuk/_components/GoogleIcon";

type Mode = "pilih" | "guru" | "siswa";

export function DaftarPicker() {
  const searchParams = useSearchParams();
  const initialPortal = (searchParams.get("portal") === "guru" ? "guru" : "siswa") as "guru" | "siswa";

  const [mode, setMode] = useState<Mode>("pilih");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("auto") === initialPortal) {
      setMode(initialPortal);
    }
  }, [searchParams, initialPortal]);

  function startGoogleRegister() {
    setRedirecting(true);
    const url = new URL("/api/v1/auth/google", window.location.origin);
    url.searchParams.set("portal", isGuru ? "guru" : "siswa");
    window.location.href = url.toString();
  }

  async function handleDaftar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const portal = mode === "guru" ? "guru" : "siswa";
    const role = mode === "guru" ? "GURU" : "SISWA";

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nama: fd.get("nama"),
          email: fd.get("email"),
          password: fd.get("password"),
          kelas: fd.get("kelas") || undefined,
          noAbsen: fd.get("noAbsen") || undefined,
          role,
          portal,
        }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.redirect) {
        window.location.href = result.redirect;
      } else {
        setError("Terjadi kesalahan");
      }
    } catch (err) {
      setError("Gagal: " + (err instanceof Error ? err.message : "Terjadi kesalahan"));
    } finally {
      setLoading(false);
    }
  }

  if (mode === "pilih") {
    return (
      <div className="grid gap-4">
        <button
          onClick={() => setMode("guru")}
          className="group text-left rounded-[24px] border border-border-precision bg-glass p-6 shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glass-lg"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <p className="font-heading text-xl font-semibold text-on-surface">Saya Guru</p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Untuk guru, asisten guru, owner, dan admin sekolah. Kelola materi, kelas, kuis, analitik, dan draft AI.
              </p>
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Daftar sebagai guru
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => setMode("siswa")}
          className="group text-left rounded-[24px] border border-border-precision bg-glass p-6 shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glass-lg"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <GraduationCap className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <p className="font-heading text-xl font-semibold text-on-surface">Saya Siswa</p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Untuk siswa yang ingin menyimpan progres, mengerjakan kuis, dan mengakses pembelajaran dari perangkat mana pun.
              </p>
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Daftar sebagai siswa
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <p className="px-1 text-xs text-on-surface-variant">
          Sudah punya akun? <Link href="/masuk" className="font-semibold text-primary hover:underline">Masuk di sini</Link>.
        </p>
      </div>
    );
  }

  const isGuru = mode === "guru";

  return (
    <form onSubmit={handleDaftar} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => { setMode("pilih"); setError(""); }}
          className="text-[12px] text-on-surface-variant hover:text-primary"
        >
          ← Ganti peran
        </button>
      </div>
      <span className="inline-block text-xs font-bold tracking-wider text-primary bg-primary/5 px-3 py-1.5 rounded-full">
        {isGuru ? "GURU / ASISTEN GURU" : "SISWA"}
      </span>
      <h2 className="font-heading text-2xl text-on-surface">
        {isGuru ? "Daftar akun guru" : "Buat akun siswa"}
      </h2>
      <p className="text-sm text-on-surface-variant -mt-3">
        {isGuru
          ? "Akun Anda akan berrole GURU. Owner/admin sekolah didaftarkan lewat sekolah masing-masing."
          : "Pakai email aktif. Progres belajar Anda akan tersimpan otomatis."}
      </p>

      <div>
        <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Nama lengkap</label>
        <input
          name="nama"
          required
          minLength={2}
          maxLength={100}
          placeholder="Nama Anda"
          className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="kamu@email.com"
          className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
          Kata Sandi <span className="font-normal text-on-surface-variant">(min. 8 karakter)</span>
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            maxLength={128}
            placeholder="••••••••"
            className="w-full px-4 py-[13px] pr-11 border border-border-precision rounded-xl text-[16px] bg-white outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isGuru && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
              Kelas <span className="font-normal text-on-surface-variant">(opsional)</span>
            </label>
            <input
              name="kelas"
              placeholder="mis. 8A"
              className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
              No. Absen <span className="font-normal text-on-surface-variant">(opsional)</span>
            </label>
            <input
              name="noAbsen"
              inputMode="numeric"
              placeholder="mis. 14"
              className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-[15px] bg-primary text-on-primary rounded-[13px] font-semibold text-[16px] transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Memproses..." : isGuru ? "Daftar sebagai Guru →" : "Daftar →"}
      </button>

      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-border-precision" />
        <span className="text-xs uppercase tracking-wider text-on-surface-variant/60">atau</span>
        <div className="flex-1 h-px bg-border-precision" />
      </div>
      <button
        type="button"
        onClick={startGoogleRegister}
        disabled={redirecting}
        className="w-full inline-flex items-center justify-center gap-2 py-[13px] border border-border-precision rounded-[13px] text-[14px] font-semibold text-on-surface hover:bg-surface transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {redirecting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-on-surface-variant/30 border-t-on-surface rounded-full animate-spin" />
            Sedang mengarahkan ke Google...
          </span>
        ) : (
          <>
            <GoogleIcon />
            Daftar dengan Google
          </>
        )}
      </button>
    </form>
  );
}
