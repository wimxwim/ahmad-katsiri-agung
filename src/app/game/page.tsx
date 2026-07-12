import Link from "next/link";
import { Gamepad2, ArrowRight } from "lucide-react";

export default function GamePage() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 pb-24 sm:pb-32">
      <section className="max-w-2xl mx-auto text-center py-16 sm:py-24">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Gamepad2 className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Game Edukasi Segera Hadir
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-xl mx-auto mb-8">
          Game edukasi interaktif sedang dipersiapkan. Sementara itu,
          kamu bisa menjelajahi kursus dan materi pembelajaran yang sudah tersedia.
        </p>

        <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl shadow-glass p-6 sm:p-8 max-w-md mx-auto">
          <p className="text-sm text-on-surface-variant mb-6">
            Koleksi game edukasi seperti kuis interaktif, flashcard, dan
            puzzle akan hadir di platform ini. Nantikan update-nya!
          </p>

          <Link
            href="/kursus"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            Jelajahi Kursus
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}