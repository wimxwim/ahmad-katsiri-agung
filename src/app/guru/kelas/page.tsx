"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Users, Loader2, Edit3, GraduationCap, X, Check, Share2, Copy, Link } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-helpers";

interface KelasItem {
  id: string;
  nama: string;
  tingkat: number;
  createdAt: string;
}

export default function GuruKelasPage() {
  const [items, setItems] = useState<KelasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [nama, setNama] = useState("");
  const [tingkat, setTingkat] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<KelasItem | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editTingkat, setEditTingkat] = useState(7);
  const [inviteKode, setInviteKode] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  async function generateInvite(kelasId: string) {
    const result = await apiFetch<{ kode: string }>(`/api/v1/guru/kelas/${kelasId}/invite`, {
      method: "POST",
    });
    if (result.ok && result.data) {
      setInviteKode((prev) => ({ ...prev, [kelasId]: (result.data as { kode: string }).kode }));
    } else {
      setError(result.error || "Gagal membuat kode undangan");
    }
  }

  async function copyInvite(kelasId: string, kode: string) {
    const link = `${window.location.origin}/masuk?portal=siswa&kode=${kode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(kelasId);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API not available — silently ignore
    }
  }

  async function load() {
    setLoading(true);
    setError("");
    const result = await apiFetch<KelasItem[]>("/api/v1/guru/kelas");
    if (!result.ok) {
      setError(result.error);
    } else {
      setItems(result.data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await apiFetch<KelasItem>("/api/v1/guru/kelas", {
      method: "POST",
      body: JSON.stringify({ nama, tingkat }),
    });
    if (!result.ok) {
      setError(result.error);
    } else {
      setNama("");
      setTingkat(7);
      setShowForm(false);
      await load();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kelas ini? Siswa di dalamnya tidak akan terhapus, hanya relasi yang diputus.")) return;
    setError("");
    const result = await apiFetch(`/api/v1/guru/kelas/${id}`, { method: "DELETE" });
    if (!result.ok) {
      setError(result.error);
    } else {
      await load();
    }
  }

  async function handleUpdate(id: string) {
    setError("");
    const result = await apiFetch<KelasItem>(`/api/v1/guru/kelas/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ nama: editNama, tingkat: editTingkat }),
    });
    if (!result.ok) {
      setError(result.error);
    } else {
      setEditing(null);
      await load();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">Kelas</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola kelas yang Anda ajar. Satu kelas bisa berisi banyak siswa.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Tutup" : "Kelas Baru"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 mb-2">{error}</p>
          <button
            onClick={load}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 rounded-2xl border border-border-precision bg-glass shadow-glass"
        >
          <h2 className="font-heading font-semibold text-on-surface mb-4">Kelas Baru</h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Nama kelas
              </label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="mis. VII-A atau 9B"
                required
                minLength={1}
                maxLength={50}
                className="w-full px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Tingkat
              </label>
              <input
                type="number"
                value={tingkat}
                onChange={(e) => setTingkat(Number(e.target.value))}
                min={1}
                max={20}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-border-precision hover:bg-surface transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-glass rounded-2xl p-5 h-20 animate-pulse" />
          ))}
        </div>
      ) : error ? null : items.length === 0 ? (
        <div className="text-center py-12">
          <EmptyState
            icon={GraduationCap}
            title="Belum ada kelas"
            description="Buat kelas pertama untuk mengelola siswa dan materi"
          />
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat Kelas Pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((k) => (
            <div
              key={k.id}
              className="bg-glass border border-border-precision rounded-2xl p-5 shadow-glass"
            >
              {editing?.id === k.id ? (
                <div>
                  <input
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full mb-2 px-3 py-2 rounded-lg border border-border-precision text-sm"
                  />
                  <input
                    type="number"
                    value={editTingkat}
                    onChange={(e) => setEditTingkat(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full mb-3 px-3 py-2 rounded-lg border border-border-precision text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(k.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      <Check className="w-3 h-3" /> Simpan
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="text-xs text-on-surface-variant hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="font-heading font-semibold text-on-surface">{k.nama}</p>
                      <p className="text-xs text-on-surface-variant">Tingkat {k.tingkat}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => {
                        setEditing(k);
                        setEditNama(k.nama);
                        setEditTingkat(k.tingkat);
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <span className="text-on-surface-variant/20">|</span>
                    <button
                      onClick={() => generateInvite(k.id)}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      <Share2 className="w-3 h-3" /> Undang
                    </button>
                    <span className="text-on-surface-variant/20">|</span>
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="inline-flex items-center gap-1 font-semibold text-red-600 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                  {inviteKode[k.id] && (
                    <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-xs font-semibold text-primary mb-1">Kode Undangan</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-white px-2.5 py-1 rounded-lg text-sm font-bold tracking-wider text-primary border border-primary/10">
                          {inviteKode[k.id]}
                        </code>
                        <button
                          onClick={() => copyInvite(k.id, inviteKode[k.id])}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          {copied === k.id ? (
                            <><Check className="w-3 h-3" /> Tersalin</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Salin Link</>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-on-surface-variant/60 mt-2">
                        Siswa bisa masuk dengan kode ini di halaman <Link href="/masuk?portal=siswa" className="text-primary hover:underline">Masuk Siswa</Link>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}