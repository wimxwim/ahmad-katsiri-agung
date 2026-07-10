export function FormMasukLeftPanel() {
  return (
    <aside className="relative bg-gradient-to-br from-primary to-[#003d24] text-white px-6 py-6 md:px-11 md:py-12 flex flex-col justify-between overflow-hidden md:min-h-0">
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 15%, #fff 0 2px, transparent 3px)`,
          backgroundSize: "34px 34px",
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-[13px] bg-[#eec055] text-[#003d24] grid place-items-center font-heading font-extrabold text-xl">
            ع
          </span>
          <span className="font-heading text-xl font-bold tracking-tight">AKAL Center</span>
        </div>
        <h1 className="font-heading text-xl md:text-[34px] leading-tight mb-2">
          Satu platform untuk guru, siswa, dan pembelajaran yang lebih terarah.
        </h1>
        <p className="text-white/80 text-[13px] md:text-[15px] max-w-[36ch]">
          Masuk ke ruang yang tepat: guru mengelola materi dan kuis, siswa belajar dan mengerjakan evaluasi dengan alur yang jelas.
        </p>
      </div>
      <ul className="relative z-10 space-y-3 mt-6 hidden md:block">
        {[
          "Materi PAI lengkap per bab",
          "Video pembelajaran & PPT",
          "Game edukasi interaktif",
          "Kuis dinilai otomatis — hasil langsung ke guru",
          "Hafalan hadits",
          "Perangkat ajar guru: ATP, Prosem, Prota, PDF",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
            <span className="w-5 h-5 rounded-full bg-white/20 text-white grid place-items-center text-[10px] shrink-0 mt-0.5">✓</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="relative z-10 text-xs text-white/60 mt-6 hidden md:block">
        Bisa dibuka lewat HP maupun komputer.
      </p>
      <div className="relative z-10 flex flex-wrap gap-2 mt-4 md:hidden">
        {["📘 Materi", "🎬 Video", "🎮 Game", "📝 Kuis", "📿 Hafalan"].map((chip) => (
          <span key={chip} className="text-[11px] font-semibold text-white bg-white/15 border border-white/20 px-3 py-1.5 rounded-full">
            {chip}
          </span>
        ))}
      </div>
    </aside>
  );
}
