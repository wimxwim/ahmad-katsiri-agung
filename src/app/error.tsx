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
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4">
      <div className="bg-glass border border-border-precision rounded-2xl p-8 sm:p-10 shadow-glass-lg max-w-md w-full text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="font-heading text-xl font-bold text-on-surface mb-2">Ada yang tidak beres</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Terjadi kesalahan saat memuat halaman. Coba lagi dalam beberapa saat.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          Coba lagi
        </button>
      </div>
    </div>
  );
}