import { Check, Sparkles, FileText, GraduationCap, BarChart3, ShieldCheck } from "lucide-react";

export function FormMasukLeftPanel() {
  return (
    <aside className="relative bg-gradient-to-br from-primary to-[#003d24] text-white px-6 py-8 md:px-11 md:py-12 flex flex-col justify-between overflow-hidden md:min-h-0">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 15%, #fff 0 2px, transparent 3px)`,
          backgroundSize: "34px 34px",
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-button bg-[#eec055] text-[#003d24] grid place-items-center font-heading font-extrabold text-xl">
            ع
          </span>
          <span className="font-heading text-xl font-bold tracking-tight">
            AKAL Center
          </span>
        </div>
        <h1 className="font-heading text-lg md:text-[34px] leading-tight mb-2">
          Satu platform untuk guru, siswa, dan pembelajaran yang lebih terarah.
        </h1>
        <p className="text-white/80 text-sm md:text-base max-w-[36ch]">
          Masuk ke ruang yang tepat: guru mengelola materi dan kuis, siswa belajar
          dan mengerjakan evaluasi dengan alur yang jelas.
        </p>
      </div>
      <ul className="relative z-10 space-y-3 mt-6 hidden md:block">
        {[
          "AI ubah PDF/DOCX jadi materi, quiz, dan soal",
          "Semua hasil AI wajib direview guru sebelum publish",
          "Workspace guru: kelas, siswa, analitik pembelajaran",
          "Kuis dinilai otomatis &mdash; hasil langsung ke guru",
          "Setiap siswa punya ruang belajar sendiri",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
            <span className="w-5 h-5 rounded-full bg-white/20 text-white grid place-items-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <p className="relative z-10 text-xs text-white/60 mt-6 hidden md:block">
        Bisa dibuka lewat HP maupun komputer.
      </p>
      <div className="relative z-10 flex flex-wrap gap-2 mt-4 md:hidden">
        {[
          { icon: Sparkles, label: "AI Generator" },
          { icon: FileText, label: "Materi" },
          { icon: GraduationCap, label: "Kelas" },
          { icon: BarChart3, label: "Analitik" },
          { icon: ShieldCheck, label: "Draft Aman" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 border border-white/20 px-3 py-1.5 rounded-full"
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </aside>
  );
}