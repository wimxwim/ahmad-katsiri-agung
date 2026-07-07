"use client";

export default function DashboardSiswaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-16">
      <p className="text-red-600 mb-2">Terjadi kesalahan: {error.message}</p>
      <button onClick={reset} className="text-sm text-primary hover:underline">
        Coba Lagi
      </button>
    </div>
  );
}
