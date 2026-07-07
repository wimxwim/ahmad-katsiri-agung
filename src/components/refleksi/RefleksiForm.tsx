"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Send, CheckCircle } from "lucide-react";
import { EASE_CURVE } from "@/lib/constants";

type FormState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

export function RefleksiForm() {
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });
  const [nama, setNama] = useState("");
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "loading", message: "" });

    const form = e.currentTarget;
    const data = {
      nama: (form.nama as unknown as HTMLInputElement).value || "Anonim",
      pelajaran: (form.pelajaran as unknown as HTMLTextAreaElement).value,
      akhlakBaik: (form.akhlakBaik as unknown as HTMLTextAreaElement).value,
      perluDiperbaiki: (form.perluDiperbaiki as unknown as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/refleksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setState({ status: "error", message: json.error || "Gagal mengirim" });
        return;
      }

      setState({ status: "success", message: "Refleksi berhasil dikirim!" });
      form.reset();
      setConsent(false);
      setTimeout(() => setState({ status: "idle", message: "" }), 3000);
    } catch {
      setState({ status: "error", message: "Gagal terhubung ke server" });
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_CURVE }}
      className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-glass"
    >
      <h3 className="font-heading text-lg sm:text-xl font-semibold text-on-surface mb-6">
        Isi Refleksi Hari Ini
      </h3>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="ref-nama"
            className="block text-sm font-medium text-on-surface mb-1.5"
          >
            Nama (opsional)
          </label>
          <input
            id="ref-nama"
            name="nama"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama panggilan..."
            maxLength={60}
            className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="ref-pelajaran"
            className="block text-sm font-medium text-on-surface mb-1.5"
          >
            Apa yang telah kamu pelajari hari ini?
          </label>
          <textarea
            id="ref-pelajaran"
            name="pelajaran"
            required
            rows={3}
            placeholder="Misal: Belajar tentang tabayyun dalam Q.S. Al-Hujurat..."
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          />
        </div>

        <div>
          <label
            htmlFor="ref-akhlak"
            className="block text-sm font-medium text-on-surface mb-1.5"
          >
            Akhlak baik apa yang sudah kamu lakukan?
          </label>
          <textarea
            id="ref-akhlak"
            name="akhlakBaik"
            required
            rows={3}
            placeholder="Misal: Membantu teman yang kesulitan memahami materi..."
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          />
        </div>

        <div>
          <label
            htmlFor="ref-perbaiki"
            className="block text-sm font-medium text-on-surface mb-1.5"
          >
            Apa yang perlu kamu perbaiki?
          </label>
          <textarea
            id="ref-perbaiki"
            name="perluDiperbaiki"
            required
            rows={3}
            placeholder="Misal: Lebih fokus saat belajar dan tidak bermain HP..."
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white/50 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          />
        </div>

        {state.status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
          >
            <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            {state.message}
          </motion.div>
        )}

        {state.status === "error" && (
          <p className="text-red-600 text-sm">{state.message}</p>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-border-precision text-primary focus:ring-primary/30"
          />
          <span className="text-xs text-on-surface-variant leading-relaxed">
            Saya setuju refleksi ini dibagikan kepada guru untuk keperluan pembelajaran.{" "}
            <a href="/kebijakan-privasi" target="_blank" className="text-primary hover:underline">
              Kebijakan Privasi
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={state.status === "loading" || !consent}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.status === "loading" ? (
            "Mengirim..."
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" />
              Kirim Refleksi
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
