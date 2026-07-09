"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-16">
      <p className="text-red-600 font-medium mb-2">Terjadi kesalahan</p>
      <p className="text-sm text-on-surface-variant mb-6">
        {error.message || "Gagal memuat halaman dashboard"}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
      >
        Coba Lagi
      </button>
    </div>
  );
}
