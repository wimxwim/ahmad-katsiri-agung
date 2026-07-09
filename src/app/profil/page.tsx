"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck, KeyRound } from "lucide-react";

interface MeResponse {
  id: string;
  nama: string;
  email: string;
  role: string;
  kelas?: string;
  noAbsen?: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  createdAt: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/v1/account/me", { credentials: "include" });
      if (!res.ok) {
        router.push("/masuk");
        return;
      }
      const { data } = await res.json();
      setMe(data);
      setLoading(false);
    } catch (error) {
      console.error("[profil] load failed:", error);
      setError("Gagal memuat profil");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPwSuccess("");
    if (newPassword.length < 8) {
      setError("Kata sandi minimal 8 karakter");
      return;
    }
    setPwBusy(true);
    try {
      const res = await fetch("/api/v1/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j.error || "Gagal menyimpan kata sandi");
      }
      setPwSuccess("Kata sandi berhasil disimpan. Sekarang Anda bisa login pakai email + kata sandi.");
      setNewPassword("");
      setShowPw(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setPwBusy(false);
    }
  }

  if (loading) {
    return <div className="bg-glass rounded-2xl p-8 h-40 animate-pulse" />;
  }
  if (!me) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        Tidak dapat memuat profil.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Profil & Pengaturan</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Kelola informasi akun dan cara Anda masuk ke AKAL Center.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-glass border border-border-precision rounded-2xl p-6 shadow-glass">
          <h2 className="font-heading font-semibold text-on-surface mb-4">Informasi Akun</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-on-surface-variant">Nama</dt>
              <dd className="font-medium text-on-surface">{me.nama}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Email</dt>
              <dd className="font-medium text-on-surface">{me.email}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Role</dt>
              <dd>
                <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider">
                  {me.role}
                </span>
              </dd>
            </div>
            {me.kelas && (
              <div>
                <dt className="text-on-surface-variant">Kelas</dt>
                <dd className="font-medium text-on-surface">{me.kelas}</dd>
              </div>
            )}
            <div>
              <dt className="text-on-surface-variant">Terdaftar sejak</dt>
              <dd className="font-medium text-on-surface">
                {new Date(me.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-glass border border-border-precision rounded-2xl p-6 shadow-glass">
          <h2 className="font-heading font-semibold text-on-surface mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Metode Masuk
          </h2>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-border-precision/40">
              <div className="flex items-center gap-3">
                <KeyRound className="w-4 h-4 text-on-surface-variant" />
                <div>
                  <p className="font-semibold text-on-surface text-sm">Email + Kata Sandi</p>
                  <p className="text-xs text-on-surface-variant">
                    {me.hasPassword ? "Aktif" : "Belum diatur — login hanya via Google"}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                me.hasPassword ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {me.hasPassword ? "AKTIF" : "BELUM"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-border-precision/40">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.32A9 9 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.96 10.72A5.4 5.4 0 0 1 3.66 9c0-.6.1-1.18.3-1.72V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3.01-2.32z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
                </svg>
                <div>
                  <p className="font-semibold text-on-surface text-sm">Google</p>
                  <p className="text-xs text-on-surface-variant">
                    {me.hasGoogle ? "Terhubung" : "Belum terhubung"}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                me.hasGoogle ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {me.hasGoogle ? "TERHUBUNG" : "BELUM"}
              </span>
            </div>
          </div>

          {!me.hasPassword && (
            <form onSubmit={handleSetPassword} className="space-y-3 pt-3 border-t border-border-precision/40">
              <p className="text-sm text-on-surface-variant">
                Atur kata sandi agar bisa login tanpa Google.
              </p>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  placeholder="Kata sandi baru (min. 8 karakter)"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  aria-label={showPw ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{pwSuccess}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={pwBusy}
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {pwBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {pwBusy ? "Menyimpan..." : "Simpan Kata Sandi"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
