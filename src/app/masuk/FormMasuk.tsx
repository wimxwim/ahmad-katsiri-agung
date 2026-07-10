"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

type Mode = "pilih" | "murid" | "guru";
type TabMurid = "daftar" | "masuk";

type FormMasukProps = {
  redirectTo?: string;
  initialPortal?: "guru" | "siswa";
  initialTab?: TabMurid;
  errorCode?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  intent_mismatch: "Akun ini tidak cocok dengan portal yang dipilih. Gunakan portal sesuai peran Anda.",
  terlalu_banyak_percobaan: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  login_google_dibatalkan: "Login Google dibatalkan.",
  sesi_google_tidak_valid: "Sesi Google tidak valid. Coba lagi.",
  tidak_terhubung_google: "Tidak dapat terhubung ke Google. Coba lagi nanti.",
  email_google_belum_diverifikasi: "Email Google belum diverifikasi.",
  akun_google_tidak_cocok: "Akun Google ini tidak cocok dengan akun yang sudah ada.",
  login_google_gagal: "Login Google gagal. Coba lagi.",
  db_tidak_terhubung: "Database belum terhubung. Pastikan PostgreSQL sudah berjalan, lalu coba lagi.",
  auth: "Sesi autentikasi tidak valid.",
};

export function FormMasuk({
  redirectTo,
  initialPortal,
  initialTab = "masuk",
  errorCode,
}: FormMasukProps) {
  const [mode, setMode] = useState<Mode>(initialPortal === "guru" ? "guru" : initialPortal === "siswa" ? "murid" : "pilih");
  const [tabMurid, setTabMurid] = useState<TabMurid>(initialTab);
  const [error, setError] = useState(() => (errorCode ? ERROR_MESSAGES[errorCode] || `Error: ${errorCode}` : ""));
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [noPassword, setNoPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setMode(initialPortal === "guru" ? "guru" : initialPortal === "siswa" ? "murid" : "pilih");
    setTabMurid(initialTab);
    setError(errorCode ? ERROR_MESSAGES[errorCode] || `Error: ${errorCode}` : "");
    setNoPassword(false);
    setRedirecting(false);
  }, [initialPortal, initialTab, errorCode]);

  useEffect(() => {
    setNoPassword(false);
    setRedirecting(false);
  }, [mode, tabMurid]);

  function startGoogleLogin(portal: "guru" | "siswa") {
    setRedirecting(true);
    const url = new URL("/api/v1/auth/google", window.location.origin);
    url.searchParams.set("portal", portal);
    if (redirectTo) url.searchParams.set("returnTo", redirectTo);
    window.location.href = url.toString();
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, redirectTo, portalIntent: mode === "guru" ? "guru" : "siswa" }),
      });
      const result = await res.json();
      if (result.error) {
        const err = typeof result.error === "string" ? { message: result.error } : result.error;
        if (err.code === "INTENT_MISMATCH") {
          const params = new URLSearchParams(err.details || {});
          window.location.href = `/masuk/role-mismatch?${params.toString()}`;
          return;
        }
        if (err.code === "NO_PASSWORD_SET") {
          setNoPassword(true);
          setError(err.message || "Akun ini belum punya kata sandi. Masuk lewat Google dulu.");
          setLoading(false);
          return;
        }
        setError(err.message || err.code || "Terjadi kesalahan");
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

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: formData.get("nama"),
          email: formData.get("email"),
          password: formData.get("password"),
          kelas: formData.get("kelas") || undefined,
          noAbsen: formData.get("noAbsen") || undefined,
          portal: mode === "guru" ? "guru" : "siswa",
          role: mode === "guru" ? "GURU" : "SISWA",
          redirectTo,
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-0 sm:p-6">
      <div className="w-full max-w-6xl bg-white rounded-none md:rounded-[32px] overflow-hidden shadow-glass-lg flex flex-col md:grid md:grid-cols-[1.1fr_0.9fr] min-h-screen md:min-h-[640px]">
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
            <h1 className="font-heading text-xl md:text-[34px] leading-tight mb-2">
              Satu platform untuk guru, siswa, dan pembelajaran yang lebih terarah.
            </h1>
            <p className="text-white/80 text-[13px] md:text-[15px] max-w-[36ch]">
              Masuk ke ruang yang tepat: guru mengelola materi dan kuis, siswa belajar dan mengerjakan evaluasi dengan alur yang jelas.
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
                Pilih ruang masuk kamu
              </h2>
              <p className="text-[13px] md:text-sm text-on-surface-variant mb-6 md:mb-8">
                Kami pisahkan alur guru dan siswa supaya tidak tertukar lagi.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => { setMode("murid"); setTabMurid("masuk"); setError(""); }}
                  className="group flex items-center gap-4 w-full text-left border border-border-precision bg-white rounded-[18px] p-[18px] transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-glass cursor-pointer"
                >
                  <span className="w-[50px] h-[50px] rounded-[14px] bg-surface grid place-items-center text-[26px] shrink-0">
                    🧑‍🎓
                  </span>
                  <span className="flex-1">
                    <b className="block text-[16px] text-on-surface">Ruang Siswa</b>
                    <span className="text-[13px] text-on-surface-variant">Belajar materi, kerjakan kuis, dan pantau progres.</span>
                  </span>
                  <span className="text-primary/40 text-xl group-hover:text-primary transition-colors">›</span>
                </button>
                <button
                  onClick={() => { setMode("guru"); setError(""); }}
                  className="group flex items-center gap-4 w-full text-left border border-border-precision bg-white rounded-[18px] p-[18px] transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-glass cursor-pointer"
                >
                  <span className="w-[50px] h-[50px] rounded-[14px] bg-surface grid place-items-center text-[26px] shrink-0">
                    🧑‍🏫
                  </span>
                  <span className="flex-1">
                    <b className="block text-[16px] text-on-surface">Ruang Guru</b>
                    <span className="text-[13px] text-on-surface-variant">Kelola materi, kuis, siswa, dan analitik pembelajaran.</span>
                  </span>
                  <span className="text-primary/40 text-xl group-hover:text-primary transition-colors">›</span>
                </button>
                <Link
                  href="/daftar"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-primary/15 bg-primary/5 p-[18px] text-center text-[15px] font-semibold text-primary transition-all duration-200 hover:border-primary/40 hover:bg-primary/10"
                >
                  Buat akun baru
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {mode === "murid" && (
            <div>
              <span className="inline-block text-[11px] font-bold tracking-wider text-primary bg-primary/5 px-3 py-1.5 rounded-full mb-4">
                SISWA
              </span>
              <h2 className="font-heading text-2xl text-on-surface mb-1">
                {tabMurid === "daftar" ? "Buat akun baru" : "Masuk ke akun"}
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                {tabMurid === "daftar" ? "Daftar pakai email untuk menyimpan progres." : "Pakai email dan kata sandi yang sudah didaftarkan."}
              </p>

              {/* Tab switcher */}
              <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1">
                <button
                  onClick={() => { setTabMurid("masuk"); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    tabMurid === "masuk" ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => { setTabMurid("daftar"); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    tabMurid === "daftar" ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Daftar
                </button>
              </div>

              {tabMurid === "masuk" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="kamu@email.com"
                      className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-[13px] pr-11 border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
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
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}
                  {noPassword && (
                    <button
                      type="button"
                      onClick={() => startGoogleLogin("siswa")}
                      disabled={redirecting}
                      className="w-full inline-flex items-center justify-center gap-2 py-[13px] border border-border-precision rounded-[13px] text-[14px] font-semibold text-on-surface hover:bg-surface transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {redirecting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-on-surface-variant/30 border-t-on-surface rounded-full animate-spin" />
                          Sedang mengarahkan...
                        </span>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.32A9 9 0 0 0 9 18z"/>
                            <path fill="#FBBC05" d="M3.96 10.72A5.4 5.4 0 0 1 3.66 9c0-.6.1-1.18.3-1.72V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3.01-2.32z"/>
                            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
                          </svg>
                          Lanjutkan dengan Google
                        </>
                      )}
                    </button>
                  )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-[15px] bg-primary text-on-primary rounded-[13px] font-semibold text-[16px] cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Memproses..." : "Masuk →"}
                </button>
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-border-precision" />
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant/60">atau</span>
                  <div className="flex-1 h-px bg-border-precision" />
                </div>
                <button
                  type="button"
                  onClick={() => startGoogleLogin("siswa")}
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
                      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.32A9 9 0 0 0 9 18z"/>
                        <path fill="#FBBC05" d="M3.96 10.72A5.4 5.4 0 0 1 3.66 9c0-.6.1-1.18.3-1.72V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3.01-2.32z"/>
                        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
                      </svg>
                      Masuk dengan Google
                    </>
                  )}
                </button>
                <p className="text-center text-[13px] text-on-surface-variant">
                  Belum punya akun siswa?{" "}
                  <Link href="/daftar?portal=siswa&auto=siswa" className="font-semibold text-primary hover:underline">
                    Daftar di sini
                  </Link>
                </p>
                <p className="text-xs text-on-surface-variant bg-surface rounded-xl px-3 py-2.5">
                  Hanya akun siswa yang bisa masuk lewat alur ini. Jika akunmu guru, gunakan portal guru.
                </p>
                <button
                  type="button"
                  onClick={() => { setMode("pilih"); setError(""); }}
                    className="w-full text-center text-[13px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                  >
                    ← Kembali ke pemilihan portal
                  </button>
                </form>
              )}

              {tabMurid === "daftar" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                      Nama lengkap
                    </label>
                    <input
                      name="nama"
                      required
                      placeholder="Nama kamu"
                      className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="kamu@email.com"
                      className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
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
                        placeholder="••••••••"
                        className="w-full px-4 py-[13px] pr-11 border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                        Kelas <span className="font-normal text-on-surface-variant">(opsional)</span>
                      </label>
                      <input
                        name="kelas"
                        placeholder="mis. 8A"
                        className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
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
                        className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-[15px] bg-primary text-on-primary rounded-[13px] font-semibold text-[16px] cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Memproses..." : "Daftar →"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("pilih"); setError(""); }}
                    className="w-full text-center text-[13px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                  >
                    ← Kembali ke pemilihan portal
                  </button>
                </form>
              )}
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
                Gunakan email dan kata sandi yang sudah didaftarkan.
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="email@guru.com"
                    className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-[13px] pr-11 border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
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
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}
                {noPassword && (
                  <button
                    type="button"
                    onClick={() => startGoogleLogin("guru")}
                    disabled={redirecting}
                    className="w-full inline-flex items-center justify-center gap-2 py-[13px] border border-border-precision rounded-[13px] text-[14px] font-semibold text-on-surface hover:bg-surface transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {redirecting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-on-surface-variant/30 border-t-on-surface rounded-full animate-spin" />
                        Sedang mengarahkan...
                      </span>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.32A9 9 0 0 0 9 18z"/>
                          <path fill="#FBBC05" d="M3.96 10.72A5.4 5.4 0 0 1 3.66 9c0-.6.1-1.18.3-1.72V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3.01-2.32z"/>
                          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
                        </svg>
                        Lanjutkan dengan Google
                      </>
                    )}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-[15px] bg-primary text-on-primary rounded-[13px] font-semibold text-[16px] cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Memproses..." : "Masuk (akses penuh) →"}
                </button>
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-border-precision" />
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant/60">atau</span>
                  <div className="flex-1 h-px bg-border-precision" />
                </div>
                <button
                  type="button"
                  onClick={() => startGoogleLogin("guru")}
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
                      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.32A9 9 0 0 0 9 18z"/>
                        <path fill="#FBBC05" d="M3.96 10.72A5.4 5.4 0 0 1 3.66 9c0-.6.1-1.18.3-1.72V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3.01-2.32z"/>
                        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
                      </svg>
                      Masuk dengan Google
                    </>
                  )}
                </button>
                <p className="text-center text-[13px] text-on-surface-variant">
                  Belum punya akun guru?{" "}
                  <Link href="/daftar?portal=guru&auto=guru" className="font-semibold text-primary hover:underline">
                    Daftar sebagai guru
                  </Link>
                </p>
                <p className="text-xs text-on-surface-variant bg-surface rounded-xl px-3 py-2.5">
                  Hanya akun guru, owner, atau admin sekolah yang bisa masuk lewat alur ini.
                </p>
                <button
                  type="button"
                  onClick={() => { setMode("pilih"); setError(""); }}
                  className="w-full text-center text-[13px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  ← Kembali ke pemilihan portal
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
