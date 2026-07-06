"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockKursus, mockSiswa, mockNilai } from "@/data/mock";
import { ArrowLeft } from "lucide-react";

export default function KursusNilaiPage() {
  const params = useParams();
  const kursus = mockKursus.find((k) => k.id === params.id);
  const nilaiKursus = mockNilai.filter((n) => n.kursusId === params.id);

  if (!kursus) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Kursus tidak ditemukan</p>
        <Link href="/dashboard-guru/kursus" className="text-primary text-sm mt-2 inline-block hover:underline">
          Kembali
        </Link>
      </div>
    );
  }

  const quizzes = [...new Set(nilaiKursus.map((n) => n.judulQuiz))];
  const skorMap = new Map<string, Map<string, number>>();

  nilaiKursus.forEach((n) => {
    if (!skorMap.has(n.siswaId)) skorMap.set(n.siswaId, new Map());
    skorMap.get(n.siswaId)!.set(n.judulQuiz, n.skor);
  });

  const enrolledSiswa = mockSiswa.filter((s) =>
    nilaiKursus.some((n) => n.siswaId === s.id),
  );

  const getAvgColor = (avg: number) => {
    if (avg >= 85) return "text-emerald-600";
    if (avg >= 70) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div>
      <Link
        href={`/dashboard-guru/kursus/${kursus.id}`}
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Detail
      </Link>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">
            Nilai — {kursus.nama}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Gradebook untuk {enrolledSiswa.length} siswa · {quizzes.length} quiz
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-precision overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-border-precision bg-surface/50">
              <th className="text-left px-4 py-3 font-medium text-on-surface-variant sticky left-0 bg-surface/50 z-10">
                Nama Siswa
              </th>
              <th className="text-left px-3 py-3 font-medium text-on-surface-variant">
                Kelas
              </th>
              {quizzes.map((q) => (
                <th key={q} className="text-center px-3 py-3 font-medium text-on-surface-variant text-xs whitespace-nowrap">
                  {q}
                </th>
              ))}
              <th className="text-center px-4 py-3 font-medium text-on-surface-variant">
                Rata-rata
              </th>
            </tr>
          </thead>
          <tbody>
            {enrolledSiswa.map((s) => {
              const skorSiswa = skorMap.get(s.id) || new Map();
              const validSkor = [...skorSiswa.values()].filter((v) => v !== undefined);
              const avg = validSkor.length > 0
                ? Math.round(validSkor.reduce((a, b) => a + b, 0) / validSkor.length)
                : 0;

              return (
                <tr
                  key={s.id}
                  className="border-b border-border-precision/50 last:border-0 hover:bg-surface/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-on-surface sticky left-0 bg-white">
                    {s.nama}
                  </td>
                  <td className="px-3 py-3 text-on-surface-variant">{s.kelas}</td>
                  {quizzes.map((q) => {
                    const skor = skorSiswa.get(q);
                    return (
                      <td key={q} className="text-center px-3 py-3">
                        {skor !== undefined ? (
                          <span className={skor < 70 ? "text-red-600 font-medium" : "text-on-surface"}>
                            {skor}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/30">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center px-4 py-3">
                    <span className={`font-bold ${getAvgColor(avg)}`}>
                      {avg}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {nilaiKursus.length === 0 && (
        <div className="text-center py-20">
          <p className="text-on-surface-variant">Belum ada data nilai</p>
        </div>
      )}
    </div>
  );
}
