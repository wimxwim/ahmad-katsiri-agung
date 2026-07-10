import { Building2, BookOpen, BarChart3, Sparkles } from "lucide-react";

export default function AdminSekolahIndex() {
  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-[0.18em] text-primary">
          <Building2 className="w-3 h-3" />
          ADMIN SEKOLAH
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">
          Kelola sekolah Anda
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Pantau guru, kursus, dan progres siswa di sekolah Anda dari satu tempat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Daftar Guru</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Lihat dan kelola guru yang terdaftar di sekolah Anda.
          </p>
          <span className="inline-flex items-center mt-4 text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>

        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Laporan Belajar</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Ringkasan progres dan risiko belajar siswa per kelas.
          </p>
          <span className="inline-flex items-center mt-4 text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>

        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Kuota AI</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Pantau penggunaan AI generator dan atur kuota per sekolah.
          </p>
          <span className="inline-flex items-center mt-4 text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>
      </div>
    </div>
  );
}
