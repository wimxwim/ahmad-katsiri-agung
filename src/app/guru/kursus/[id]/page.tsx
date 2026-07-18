"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, FileText, ArrowLeft, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface KursusDetail {
  id: string;
  judul: string;
  deskripsi: string | null;
  enrolledCount?: number;
  quizSelesaiCount?: number;
}
interface SiswaItem { siswaId: string; nama: string; skorRataRata: number }

export default function KursusDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [kursus, setKursus] = useState<KursusDetail | null>(null);
  const [siswa, setSiswa] = useState<SiswaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [kursusRes, nilaiRes] = await Promise.all([
          fetch(`/api/v1/kursus/${params.id}`, { credentials: "include" }),
          fetch(`/api/v1/kursus/${params.id}/nilai`, { credentials: "include" }),
        ]);
        if (kursusRes.status === 404) { setKursus(null); setLoading(false); return; }
        if (!kursusRes.ok) throw new Error("Gagal memuat kursus");
        const kursusData = await kursusRes.json();
        setKursus(kursusData.data);
        const nilaiData = await nilaiRes.json().catch(() => ({ data: [] }));
        const logEntries: { siswaId: string; nama: string; isBenar: boolean }[] = nilaiData.data || [];
        const siswaMap = new Map<string, { nama: string; benar: number; total: number }>();
        for (const entry of logEntries) {
          const key = entry.siswaId;
          const existing = siswaMap.get(key) || { nama: entry.nama, benar: 0, total: 0 };
          if (entry.isBenar) existing.benar++;
          existing.total++;
          siswaMap.set(key, existing);
        }
        const siswaList: SiswaItem[] = [];
        for (const [siswaId, v] of siswaMap) {
          siswaList.push({ siswaId, nama: v.nama, skorRataRata: v.total > 0 ? Math.round((v.benar / v.total) * 100) : 0 });
        }
        setSiswa(siswaList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-primary/5 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-glass rounded-2xl p-5 h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={() => router.refresh()} className="text-sm text-primary hover:underline active:scale-[0.98]">Coba lagi</button>
      </div>
    );
  }

  if (!kursus) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Kursus tidak ditemukan</p>
        <Link href="/guru/kursus" className="text-primary text-sm mt-2 inline-block hover:underline">
          Kembali ke daftar kursus
        </Link>
      </div>
    );
  }

  const avgSkor = siswa.length > 0
    ? Math.round(siswa.reduce((a, b) => a + b.skorRataRata, 0) / siswa.length)
    : 0;

  return (
    <div>
      <Link
        href="/guru/kursus"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">{kursus.judul}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{kursus.deskripsi || ""}</p>
        </div>
        <Link
          href={`/guru/kursus/${kursus.id}/nilai`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary/5 text-primary text-sm font-semibold rounded-xl hover:bg-primary/10 transition-colors font-heading"
        >
          <BarChart3 className="w-4 h-4" />
          Lihat Nilai
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Siswa Terdaftar" value={kursus.enrolledCount ?? siswa.length} icon={Users} color="#005231" />
        <StatCard label="Quiz Selesai" value={kursus.quizSelesaiCount != null ? Number(kursus.quizSelesaiCount) : "-"} icon={FileText} color="#005231" trend="Segera" />
        <StatCard label="Rata-rata Skor" value={avgSkor > 0 ? `${avgSkor}%` : "-"} icon={BarChart3} color="#005231" />
      </div>

      <h2 className="font-heading font-bold text-lg text-on-surface mb-4">Siswa Terdaftar</h2>
      {siswa.length === 0 ? (
        <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
          <Users className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant">Belum ada siswa terdaftar</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-precision overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-precision bg-surface/50">
                  <th className="text-left px-4 py-3 font-medium text-on-surface-variant">No</th>
                  <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Nama</th>
                  <th className="text-right px-4 py-3 font-medium text-on-surface-variant">Skor</th>
                </tr>
              </thead>
              <tbody>
                {siswa.map((s, i) => (
                  <tr key={s.siswaId} className="border-b border-border-precision/50 last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">{s.nama}</td>
                    <td className="px-4 py-3 text-right">
                      {s.skorRataRata === 0 && siswa.length === 1 ? (
                        <span className="text-on-surface-variant/40">-</span>
                      ) : (
                        <span className={s.skorRataRata < 70 ? "text-red-600 font-medium" : "text-emerald-600 font-medium"}>
                          {s.skorRataRata}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
