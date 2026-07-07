"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, X, Send, CheckCircle } from "lucide-react";
import { EASE_CURVE } from "@/lib/constants";

const KATEGORI = [
  { value: "tanya-jawab", label: "❓ Tanya Jawab" },
  { value: "berbagi-pengalaman", label: "📖 Berbagi Pengalaman" },
  { value: "studi-kasus", label: "🔍 Studi Kasus" },
] as const;

export function DiskusiForm() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = e.currentTarget;
    const data = {
      nama: (form.nama as unknown as HTMLInputElement).value || "Anonim",
      kategori: (form.kategori as unknown as HTMLSelectElement).value,
      judul: (form.judul as unknown as HTMLInputElement).value,
      isi: (form.isi as unknown as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch("/api/diskusi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { setState("error"); return; }
      setState("success");
      form.reset();
      setTimeout(() => { setState("idle"); setOpen(false); }, 1500);
    } catch { setState("error"); }
  }

  return (
    <div>
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_CURVE }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Diskusi Baru
        </motion.button>
      )}

      {open && (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_CURVE }}
          className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-semibold text-on-surface">Diskusi Baru</h4>
            <button type="button" onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-primary/5">
              <X className="w-5 h-5 text-on-surface-variant" aria-hidden="true" />
            </button>
          </div>

          <div>
            <label htmlFor="dis-nama" className="block text-sm font-medium text-on-surface mb-1">Nama (opsional)</label>
            <input id="dis-nama" name="nama" maxLength={60} placeholder="Nama panggilan..."
              className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="dis-kategori" className="block text-sm font-medium text-on-surface mb-1">Kategori</label>
            <select id="dis-kategori" name="kategori" required
              className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {KATEGORI.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dis-judul" className="block text-sm font-medium text-on-surface mb-1">Judul</label>
            <input id="dis-judul" name="judul" required maxLength={150} placeholder="Judul diskusi..."
              className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="dis-isi" className="block text-sm font-medium text-on-surface mb-1">Isi Diskusi</label>
            <textarea id="dis-isi" name="isi" required rows={4} maxLength={1000} placeholder="Tulis pertanyaan atau pengalamanmu..."
              className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>

          {state === "success" && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              Diskusi berhasil dikirim!
            </div>
          )}

          {state === "error" && (
            <p className="text-red-600 text-sm">Gagal mengirim diskusi</p>
          )}

          <p className="text-xs text-on-surface-variant/60 leading-relaxed">
            Diskusi ditampilkan publik. Jangan bagikan data pribadi.{" "}
            <a href="/kebijakan-privasi" target="_blank" className="text-primary hover:underline">Kebijakan Privasi</a>
          </p>

          <button type="submit" disabled={state === "loading"}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {state === "loading" ? "Mengirim..." : <><Send className="w-4 h-4" aria-hidden="true" /> Kirim Diskusi</>}
          </button>
        </motion.form>
      )}
    </div>
  );
}
