"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { EASE_CURVE } from "@/lib/constants";
import { apiFetch } from "@/lib/api-helpers";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await apiFetch("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
    } else {
      setError(res.error || "Terjadi kesalahan. Coba lagi.");
    }
  };

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

          {!sent ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
                <Mail className="w-7 h-7" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">Lupa Password</h1>
              <p className="text-sm text-on-surface-variant mb-6">
                Masukkan email Anda. Kami akan mengirimkan link untuk mereset password.
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-on-surface mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
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
                        <Mail className="w-4 h-4" />
                      </motion.div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Kirim Link Reset
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">Cek Email Anda</h1>
              <p className="text-sm text-on-surface-variant mb-6">
                Kami telah mengirim link reset password ke <strong>{email}</strong>.
                Link berlaku selama 60 menit.
              </p>
              <Link
                href="/masuk"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Masuk
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}