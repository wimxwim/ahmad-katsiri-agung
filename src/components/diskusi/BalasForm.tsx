"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export function BalasForm({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = e.currentTarget;
    const data = {
      nama: (form.nama as unknown as HTMLInputElement).value || "Anonim",
      isi: (form.isi as unknown as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch(`/api/diskusi/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { setState("error"); return; }
      setState("success");
      form.reset();
      setTimeout(() => setState("idle"), 2000);
    } catch { setState("error"); }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-5 space-y-4">
      <h4 className="font-heading font-semibold text-on-surface">Tulis Balasan</h4>

      <div>
        <label htmlFor="bal-nama" className="block text-sm font-medium text-on-surface mb-1">Nama (opsional)</label>
        <input id="bal-nama" name="nama" maxLength={60} placeholder="Nama panggilan..."
          className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      <div>
        <label htmlFor="bal-isi" className="block text-sm font-medium text-on-surface mb-1">Balasan</label>
        <textarea id="bal-isi" name="isi" required rows={3} maxLength={1000} placeholder="Tulis balasanmu..."
          className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
        />
      </div>

      {state === "success" && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          Balasan terkirim!
        </div>
      )}

      {state === "error" && (
        <p className="text-red-600 text-sm">Gagal mengirim balasan</p>
      )}

      <button type="submit" disabled={state === "loading"}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {state === "loading" ? "Mengirim..." : <><Send className="w-4 h-4" aria-hidden="true" /> Kirim Balasan</>}
      </button>
    </form>
  );
}
