import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-3">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-bold leading-none text-primary/20 select-none">
          404
        </div>
        <h1 className="text-2xl font-bold mt-4 mb-2 text-on-surface">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-on-surface/60 mb-8">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-on-primary font-medium transition-transform hover:scale-105 active:scale-95"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
