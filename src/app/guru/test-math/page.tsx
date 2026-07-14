"use client";

import { MathRenderer, MathBlock, MathInline } from "@/components/ui/MathRenderer";

const soal = [
  {
    pertanyaan: "Jika $f(x) = 3x^2 + 2x - 5$, maka $f'(x) =$ ...",
    opsi: ["$6x + 2$", "$6x - 2$", "$3x + 2$", "$3x - 2$"],
    kunci: "A",
  },
  {
    pertanyaan: "Nilai dari $\\int_0^2 (3x^2 + 2x) \\,dx$ adalah ...",
    opsi: ["$8$", "$12$", "$16$", "$20$"],
    kunci: "B",
  },
  {
    pertanyaan: "Akar-akar persamaan kuadrat $$x^2 - 5x + 6 = 0$$ adalah ...",
    opsi: ["$x = 2$ atau $x = 3$", "$x = -2$ atau $x = -3$", "$x = 1$ atau $x = 6$", "$x = -1$ atau $x = -6$"],
    kunci: "A",
  },
  {
    pertanyaan: "Rumus luas lingkaran adalah $L = \\pi r^2$. Jika $r = 7$ cm, maka luasnya ...",
    opsi: ["$154$ cm$^2$", "$144$ cm$^2$", "$164$ cm$^2$", "$134$ cm$^2$"],
    kunci: "A",
  },
  {
    pertanyaan: "$$\\frac{d}{dx}\\left(\\sin x\\right) = $$ ...",
    opsi: ["$\\cos x$", "$-\\cos x$", "$\\sin x$", "$-\\sin x$"],
    kunci: "A",
  },
];

export default function TestMathPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="font-heading font-bold text-2xl mb-6">Test Math + RTL</h1>

      <div className="space-y-4 mb-8">
        <h2 className="font-semibold text-lg">RTL Arabic</h2>
        <div className="bg-glass rounded-2xl p-4">
          <p dir="rtl" className="font-amiri text-2xl leading-loose text-right mb-4">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-sm text-on-surface-variant">
            Font Amiri — RTL (Right-to-Left) — gunakan <code>dir="rtl"</code> + <code>font-amiri</code>
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="font-semibold text-lg">Inline Math</h2>
        <div className="bg-glass rounded-2xl p-4">
          <p className="text-sm">
            Persamaan kuadrat <MathInline latex="ax^2 + bx + c = 0" /> memiliki diskriminan{" "}
            <MathInline latex="D = b^2 - 4ac" />.
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="font-semibold text-lg">Display Math</h2>
        <div className="bg-glass rounded-2xl p-4">
          <MathBlock latex="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Soal Matematika</h2>
        {soal.map((s, i) => (
          <div key={i} className="bg-glass rounded-2xl p-5 space-y-3">
            <p className="font-semibold text-sm">
              {i + 1}. <MathRenderer text={s.pertanyaan} />
            </p>
            <div className="grid grid-cols-2 gap-2">
              {s.opsi.map((o, j) => (
                <div
                  key={j}
                  className={`px-3 py-2 rounded-xl border text-sm ${
                    String.fromCharCode(65 + j) === s.kunci
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-border-precision"
                  }`}
                >
                  <span className="font-semibold">{String.fromCharCode(65 + j)}.</span>{" "}
                  <MathRenderer text={o} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}