"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-body bg-surface">
        <main className="flex-1 flex items-center justify-center px-3 sm:px-5 lg:px-8">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[32px] bg-primary/10">
              <AlertTriangle className="h-10 w-10 text-primary" aria-hidden="true" />
            </div>
            <h1 className="mt-8 font-heading text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
              Terjadi Kesalahan
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Sistem mengalami kendala teknis. Tim kami sudah mendapat notifikasi
              otomatis dan sedang menanganinya.
            </p>
            {error.digest && (
              <p className="mt-3 text-xs text-on-surface-variant/60 font-mono">
                Ref: {error.digest}
              </p>
            )}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Coba Lagi
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-border-precision bg-glass px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-white/80"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}