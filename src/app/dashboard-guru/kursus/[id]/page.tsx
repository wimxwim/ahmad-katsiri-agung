"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockKursus, mockSiswa, mockNilai } from "@/data/mock";
import { Users, FileText, ArrowLeft, BarChart3 } from "lucide-react";

export default function KursusDetailPage() {
  const params = useParams();
  const kursus = mockKursus.find((k) => k.id === params.id);
  const nilaiKursus = mockNilai.filter((n) => n.kursusId === params.id);
  const enrolledSiswaIds = new Set(nilaiKursus.map((n) => n.siswaId));
  const enrolledSiswa = mockSiswa.filter((s) => enrolledSiswaIds.has(s.id));
  const avgSkor = nilaiKursus.length > 0
    ? Math.round(nilaiKursus.reduce((a, b) => a + b.skor, 0) / nilaiKursus.length)
    : 0;

  if (!kursus) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Kursus tidak ditemukan</p>
        <Link href="/dashboard-guru/kursus" className="text-primary text-sm mt-2 inline-block hover:underline">
          Kembali ke daftar kursus
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard-guru/kursus"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">{kursus.nama}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{kursus.deskripsi}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard-guru/kursus/${kursus.id}/nilai`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary/5 text-primary text-sm font-semibold rounded-xl hover:bg-primary/10 transition-colors font-heading"
          >
            <BarChart3 className="w-4 h-4" />
            Lihat Nilai
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Siswa Terdaftar", value: enrolledSiswa.length, icon: Users },
          { label: "Quiz Selesai", value: nilaiKursus.length, icon: FileText },
          { label: "Rata-rata Skor", value: `${avgSkor}%`, icon: BarChart3 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-border-precision">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl font-bold text-on-surface font-heading">{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-heading font-bold text-lg text-on-surface mb-4">Siswa Terdaftar</h2>
      <div className="bg-white rounded-2xl border border-border-precision overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-precision bg-surface/50">
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">No</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Kelas</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">NIS</th>
                <th className="text-right px-4 py-3 font-medium text-on-surface-variant">Skor Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {enrolledSiswa.map((s, i) => {
                const skorSiswa = nilaiKursus.filter((n) => n.siswaId === s.id);
                const avg = skorSiswa.length > 0
                  ? Math.round(skorSiswa.reduce((a, b) => a + b.skor, 0) / skorSiswa.length)
                  : "-";
                return (
                  <tr key={s.id} className="border-b border-border-precision/50 last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">{s.nama}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{s.kelas}</td>
                    <td className="px-4 py-3 text-on-surface-variant font-mono text-xs">{s.nis}</td>
                    <td className="px-4 py-3 text-right">
                      {avg === "-" ? (
                        <span className="text-on-surface-variant/40">{avg}</span>
                      ) : (
                        <span className={typeof avg === "number" && avg < 70 ? "text-red-600 font-medium" : "text-emerald-600 font-medium"}>
                          {avg}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
