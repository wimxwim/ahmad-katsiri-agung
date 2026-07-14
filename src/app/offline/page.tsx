export default function OfflinePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-surface flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        </svg>
      </div>
      <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">Kamu Sedang Offline</h1>
      <p className="text-on-surface-variant text-sm max-w-xs mb-8">
        Tidak ada koneksi internet. Beberapa halaman yang sudah kamu buka mungkin masih bisa diakses.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer"
      >
        Coba Lagi
      </button>
    </div>
  );
}