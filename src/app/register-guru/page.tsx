"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Lock, User, GraduationCap } from "lucide-react";
import { EASE_CURVE } from "@/lib/constants";

export default function RegisterGuruPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      nama: form.get("nama") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
      role: "GURU" as const,
    };

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-4 py-20 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">
            Daftar sebagai Guru
          </h1>
        </div>
        <p className="text-on-surface-variant text-sm mb-8">
          Buat akun guru untuk mengelola materi, membuat kuis, dan memantau progress siswa.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-on-surface-variant/50" />
              <input
                name="nama"
                required
                maxLength={100}
                className="w-full pl-10.5 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40 text-sm"
                placeholder="Nama lengkap"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-on-surface-variant/50" />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-10.5 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40 text-sm"
                placeholder="kamu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-on-surface-variant/50" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full pl-10.5 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40 text-sm"
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3.5 py-2.5 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-heading"
          >
            {loading ? "Mendaftar..." : "Daftar sebagai Guru"}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Sudah punya akun?{" "}
          <Link href="/masuk-guru" className="text-primary font-medium hover:underline">
            Masuk
          </Link>
        </p>

        <p className="text-center text-xs text-on-surface-variant/60 mt-4">
          Siswa?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Daftar sebagai Siswa
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
