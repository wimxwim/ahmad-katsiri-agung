"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-3 py-10 sm:px-5">
      <div className="bg-glass border border-border-precision rounded-2xl p-8 sm:p-10 shadow-glass-lg max-w-md mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="font-heading text-xl font-bold text-on-surface mb-2">Gagal memuat halaman daftar</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Terjadi kesalahan. Coba lagi atau kembali ke beranda.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white text-on-surface-variant border border-border-precision px-6 py-3 rounded-full text-sm font-semibold hover:bg-surface active:scale-[0.98] transition-all"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}