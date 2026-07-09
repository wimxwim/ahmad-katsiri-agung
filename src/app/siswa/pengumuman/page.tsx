"use client";

import { useEffect, useState } from "react";

import { Megaphone, AlertCircle, Pin } from "lucide-react";

interface PengumumanItem {
  id: string;
  judul: string;
  konten: string;
  target: string;
  guruNama: string | null;
  isPinned: boolean;
  publishedAt: string;
}

export default function SiswaPengumumanPage() {
  const [data, setData] = useState<PengumumanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/siswa/pengumuman", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setData(j.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-5 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Pengumuman</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Pemberitahuan dari guru dan sekolah yang relevan untukmu.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="bg-glass border border-border-precision rounded-[32px] p-6 sm:p-10 shadow-glass text-center">
          <span className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 grid place-items-center mx-auto mb-4">
            <Megaphone className="w-7 h-7" />
          </span>
          <h3 className="font-heading text-xl font-bold text-on-surface mb-2">
            Belum ada pengumuman
          </h3>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Guru dan sekolah akan mengirim pengumuman ke kamu lewat halaman ini. Cek
            kembali secara berkala.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((p) => (
            <div
              key={p.id}
              className={`bg-glass border rounded-2xl p-5 shadow-glass ${
                p.isPinned ? "border-amber-300" : "border-border-precision"
              }`}
            >
              <div className="flex items-start gap-3">
                {p.isPinned && (
                  <span className="text-[10px] font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    PINNED
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface">{p.judul}</p>
                  <p className="text-sm text-on-surface-variant mt-2 whitespace-pre-wrap leading-relaxed">
                    {p.konten}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/70 mt-3">
                    {p.guruNama || "Guru"} · {new Date(p.publishedAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
