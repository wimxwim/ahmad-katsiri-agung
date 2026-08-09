"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GradebookTable } from "@/components/dashboard/GradebookTable";

export default function KursusNilaiPage() {
  const params = useParams();
  const [siswaData, setSiswaData] = useState<{ siswaId: string; nama: string; skorRataRata: number; pelanggaran: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kursusNama, setKursusNama] = useState("");

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [kursusRes, nilaiRes] = await Promise.all([
        fetch(`/api/v1/kursus/${params.id}`, { credentials: "include" }),
        fetch(`/api/v1/kursus/${params.id}/nilai`, { credentials: "include" }),
      ]);
      if (kursusRes.status === 404) {
        setKursusNama("");
        return;
      }
      const kd = await kursusRes.json();
      setKursusNama(kd.data?.judul || "");

      const nd = await nilaiRes.json().catch(() => ({ data: [] }));
      const logEntries = (nd.data || []) as { siswaId: string; nama: string; nilai: number | null; pelanggaran?: number }[];
      const aggregated = new Map<string, { nama: string; totalNilai: number; count: number; pelanggaran: number }>();
      for (const entry of logEntries) {
        const key = entry.siswaId;
        const existing = aggregated.get(key) || { nama: entry.nama, totalNilai: 0, count: 0, pelanggaran: 0 };
        if (entry.nilai !== null && entry.nilai !== undefined) {
          existing.totalNilai += entry.nilai;
          existing.count++;
        }
        existing.pelanggaran += entry.pelanggaran || 0;
        aggregated.set(key, existing);
      }
      const list: { siswaId: string; nama: string; skorRataRata: number; pelanggaran: number }[] = [];
      for (const [siswaId, v] of aggregated) {
        const avg = v.count > 0 ? Math.round(v.totalNilai / v.count) : 0;
        list.push({ siswaId, nama: v.nama, skorRataRata: avg, pelanggaran: v.pelanggaran });
      }
      list.sort((a, b) => a.nama.localeCompare(b.nama));
      setSiswaData(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat nilai");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-4 h-12 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={() => { setError(""); setLoading(true); fetchData(); }} className="text-sm text-primary hover:underline">Coba lagi</button>
      </div>
    );
  }

  if (!kursusNama) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Kursus tidak ditemukan</p>
        <Link href="/guru/kursus" className="text-primary text-sm mt-2 inline-block hover:underline">
          Kembali ke daftar kursus
        </Link>
      </div>
    );
  }

  const gradebookSiswa = siswaData.map((s) => ({
    nama: s.nama,
    kelas: "-",
    nis: null,
    skorRataRata: s.skorRataRata,
  }));

  const siswaQuizMap = new Map<string, Map<string, number>>();
  for (const s of siswaData) {
    siswaQuizMap.set(s.nama, new Map([["Kuis", s.skorRataRata]]));
  }

  const pelanggaranSiswa = siswaData.filter((s) => s.pelanggaran > 0);

  return (
    <div>
      <Link
        href={`/guru/kursus/${params.id}`}
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">Nilai — {kursusNama}</h1>
      <p className="text-on-surface-variant text-sm mb-8">{siswaData.length} siswa tercatat</p>

      {pelanggaranSiswa.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="font-heading font-bold text-sm text-amber-800 mb-2">⚠️ Pelanggaran ujian terdeteksi</p>
          <ul className="space-y-1.5">
            {pelanggaranSiswa.map((s) => (
              <li key={s.siswaId} className="text-xs text-amber-800 flex items-center gap-2">
                <span className="font-semibold">{s.nama}</span>
                <span className="text-amber-600">· {s.pelanggaran}x keluar halaman</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-amber-700/70 mt-2">Pelanggaran tercatat otomatis saat siswa berpindah tab/keluar fullscreen.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border-precision overflow-hidden">
        <GradebookTable siswa={gradebookSiswa} quizzes={["Kuis"]} siswaQuizMap={siswaQuizMap} />
      </div>
    </div>
  );
}
