"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { EASE_CURVE } from "@/lib/constants";
import { apiFetch } from "@/lib/api-helpers";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);

    const res = await apiFetch("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword: password }),
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/masuk"), 3000);
    } else {
      setError(res.error || "Gagal mereset password.");
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
        <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">Token Tidak Valid</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Link reset password tidak valid. Silakan minta link baru.
        </p>
        <Link
          href="/lupa-password"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
        >
          Minta Link Baru
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-4"
      >
        <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
        <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">Password Berhasil Direset</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Password baru Anda telah disimpan. Mengarahkan ke halaman login...
        </p>
        <Link
          href="/masuk"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Masuk Sekarang
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
        <Lock className="w-7 h-7" />
      </div>
      <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">Reset Password</h1>
      <p className="text-sm text-on-surface-variant mb-6">
        Masukkan password baru untuk akun Anda.
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-on-surface mb-1.5">
            Password Baru
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
              className="w-full px-4 py-3 pr-12 rounded-full bg-white/80 border border-border-precision text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-on-surface mb-1.5">
            Konfirmasi Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password"
            required
            className="w-full px-4 py-3 rounded-full bg-white/80 border border-border-precision text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-full text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Lock className="w-4 h-4" />
              </motion.div>
              Mereset...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Simpan Password Baru
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-3">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE }}
          className="bg-glass rounded-card p-8 shadow-glass-lg"
        >
          <Link
            href="/masuk"
            className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Masuk
          </Link>

          <Suspense
            fallback={
              <div className="py-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"
                />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}