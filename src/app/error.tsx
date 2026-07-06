"use client";

import { useEffect } from "react";

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
    <div className="min-h-[70vh] flex items-center justify-center px-3">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-bold leading-none text-red-200 select-none">
          !
        </div>
        <h1 className="text-2xl font-bold mt-4 mb-2 text-on-surface">
          Terjadi Kesalahan
        </h1>
        <p className="text-on-surface/60 mb-4">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
        </p>
        {error.digest && (
          <p className="text-xs text-on-surface/40 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[32px] bg-primary text-on-primary font-medium transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
