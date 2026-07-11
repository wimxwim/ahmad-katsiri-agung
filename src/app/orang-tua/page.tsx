import { Heart, BookOpen, BarChart3, Sparkles } from "lucide-react";

export default function OrangTuaIndex() {
  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-badge text-primary">
          <Heart className="w-3 h-3" />
          ORANG TUA
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">
          Pantau progres anak Anda
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Lihat perkembangan belajar, hasil kuis, dan rekomendasi untuk mendukung anak di rumah.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Progres Anak</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Lihat ringkasan materi, kuis, dan skill yang sudah dikuasai.
          </p>
          <span className="inline-flex items-center mt-4 text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>

        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Hasil Kuis</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Rekap nilai, tren kemampuan, dan rekomendasi remedial.
          </p>
          <span className="inline-flex items-center mt-4 text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>

        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Pengumuman</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Pemberitahuan dari guru dan sekolah yang ditujukan untuk orang tua.
          </p>
          <span className="inline-flex items-center mt-4 text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>
      </div>
    </div>
  );
}
