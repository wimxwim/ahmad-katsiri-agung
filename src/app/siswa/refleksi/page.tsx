import { BookOpen, Sparkles } from "lucide-react";

export default function RefleksiPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-on-surface mb-2">Refleksi Pembelajaran</h1>
        <p className="text-sm text-on-surface-variant">
          Tulis refleksi kamu setelah belajar. Apa yang sudah dipahami? Bagian mana yang masih sulit?
        </p>
      </div>

      <div className="bg-glass border border-border-precision rounded-2xl p-6 shadow-glass mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <textarea
            placeholder="Tulis refleksi kamu di sini... Apa yang sudah kamu pelajari hari ini?"
            className="w-full min-h-[150px] p-4 rounded-xl border border-border-precision bg-white text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/40 resize-y"
          />
        </div>
        <div className="flex justify-end">
          <button className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all">
            <Sparkles className="w-4 h-4" />
            Simpan Refleksi
          </button>
        </div>
      </div>

      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-on-surface-variant/20" />
        </div>
        <p className="text-sm text-on-surface-variant">Belum ada refleksi tersimpan. Mulai tulis refleksi pertama kamu!</p>
      </div>
    </div>
  );
}