"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { Send, Heart } from "lucide-react";

interface DoaItem {
  id: string;
  nama: string;
  isi: string;
  waktu: string;
}

export function RuangDoa() {
  const [doaList, setDoaList] = useState<DoaItem[]>([]);
  const [nama, setNama] = useState("");
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/doa")
      .then((r) => r.json())
      .then((data) => setDoaList(data.doa || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isi.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/doa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama.trim(), isi: isi.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengirim");
      }
      setSent(true);
      setIsi("");
      setNama("");
      const refresh = await fetch("/api/doa");
      const data = await refresh.json();
      setDoaList(data.doa || []);
      setTimeout(() => setSent(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirim");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 py-12 sm:py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl tracking-tighter text-on-surface mb-3">
            Ruang Doa & Ucapan
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-md mx-auto">
            Kirim doa dan ucapan untuk kesuksesan pembelajaran kita semua.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-glass mb-10"
        >
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama kamu (boleh dikosongkan)"
            maxLength={60}
            className="w-full bg-white/50 border border-primary/10 rounded-2xl px-5 py-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4 transition-all"
          />
          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Tulis doa atau ucapanmu... 🤲"
            maxLength={400}
            rows={4}
            className="w-full bg-white/50 border border-primary/10 rounded-2xl px-5 py-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-3 transition-all"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">{isi.length}/400</span>
            <button
              type="submit"
              disabled={loading || !isi.trim()}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-40"
            >
              {loading ? "Mengirim..." : sent ? "Terkirim! 🤲" : "Kirim Doa"}
              {!sent && <Send className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </form>

        <div className="space-y-4">
          {doaList.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, ease: [0.16, 1, 0.3, 1] as const }}
              className="bg-glass/70 backdrop-blur-xl border border-border-precision rounded-2xl p-5 shadow-glass"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-primary">
                  {item.nama || "Anonim"}
                </span>
                <span className="text-[10px] text-on-surface-variant">{item.waktu}</span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">{item.isi}</p>
            </motion.div>
          ))}

          {doaList.length === 0 && (
            <p className="text-center text-sm text-on-surface-variant py-10">
              Belum ada doa. Jadilah yang pertama! 🤲
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
