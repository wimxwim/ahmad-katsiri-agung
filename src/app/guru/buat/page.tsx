"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BuatKursusPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const judul = (form.get("judul") as string).trim();
    const body = {
      judul,
      slug: slugify(judul),
      deskripsi: (form.get("deskripsi") as string) || "",
      kelas: form.get("kelas") as string,
      coverColor: "#005231",
    };

    try {
      const res = await fetch("/api/v1/kursus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || data.message || "Gagal membuat kursus";
        throw new Error(msg);
      }
      router.push("/guru/kursus");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat kursus");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/guru/kursus"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      <div className="max-w-xl">
        <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">
          Buat Kursus Baru
        </h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Buat kursus untuk mengorganisir materi, kuis, dan siswa.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Judul Kursus
            </label>
            <input
              name="judul"
              required
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40 text-sm"
              placeholder="Contoh: Akidah Akhlak Kelas 7"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40 text-sm resize-none"
              placeholder="Deskripsi singkat kursus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">
              Kelas
            </label>
            <select
              name="kelas"
              defaultValue="7"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface focus:outline-hidden focus:border-primary/40 text-sm appearance-none"
            >
              <option value="7">Kelas 7</option>
              <option value="8">Kelas 8</option>
              <option value="9">Kelas 9</option>
            </select>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3.5 py-2.5 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-heading inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {loading ? "Membuat..." : "Buat Kursus"}
          </button>
        </form>
      </div>
    </div>
  );
}
