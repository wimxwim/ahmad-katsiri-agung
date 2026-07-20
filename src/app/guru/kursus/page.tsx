"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, BookOpen, Globe, Lock, Loader2, Share2, Copy, Check, Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { csrfHeaders } from "@/lib/csrf";

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-amber-50 text-amber-700" },
  PUBLIK: { label: "Publik", color: "bg-emerald-50 text-emerald-700" },
  ARSIP: { label: "Arsip", color: "bg-surface text-on-surface-variant" },
};

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  statusPublikasi: string;
  isPublic: boolean;
  createdAt: string;
}

export default function KursusListPage() {
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);
  const [inviting, setInviting] = useState<string | null>(null);
  const [inviteLinks, setInviteLinks] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editJudul, setEditJudul] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");

  async function handleInvite(id: string) {
    setInviting(id);
    setError("");
    try {
      const res = await fetch(`/api/v1/kursus/${id}/invite`, {
        method: "POST",
        headers: { ...csrfHeaders() },
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Gagal membuat link undangan");
      }
      const { data } = await res.json();
      setInviteLinks((prev) => ({ ...prev, [id]: data.inviteLink }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat link undangan");
    } finally {
      setInviting(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    setError("");
    try {
      const res = await fetch(`/api/v1/kursus/${id}`, {
        method: "DELETE",
        headers: { ...csrfHeaders() },
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Gagal menghapus kursus");
      }
      setKursus((prev) => prev.filter((k) => k.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kursus");
    } finally {
      setDeleting(null);
    }
  }

  async function handleEdit(id: string) {
    setEditing((prev) => (prev === id ? null : id));
    const k = kursus.find((c) => c.id === id);
    if (k) {
      setEditJudul(k.judul === "[object Object]" ? "" : String(k.judul ?? ""));
      setEditDeskripsi(k.deskripsi || "");
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editJudul.trim()) return;
    setError("");
    try {
      const res = await fetch(`/api/v1/kursus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ judul: editJudul.trim(), deskripsi: editDeskripsi.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Gagal mengedit kursus");
      }
      const { data } = await res.json();
      setKursus((prev) => prev.map((k) => (k.id === id ? { ...k, judul: data.judul, deskripsi: data.deskripsi } : k)));
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengedit kursus");
    }
  }

  async function copyInviteLink(kursusId: string, link: string) {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.createElement("textarea");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(kursusId);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handlePublish(id: string, newStatus: "PUBLIK" | "DRAFT" | "ARSIP") {
    setPublishing(id);
    setError("");
    try {
      const res = await fetch(`/api/v1/kursus/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Gagal mengubah status");
      }
      const { data } = await res.json();
      setKursus((prev) => prev.map((k) => (k.id === id ? { ...k, statusPublikasi: data.statusPublikasi, isPublic: data.isPublic } : k)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setPublishing(null);
    }
  }

  async function fetchData() {
    try {
      const res = await fetch("/api/v1/kursus", { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat kursus");
      const { data } = await res.json();
      setKursus(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat kursus");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = kursus.filter(
    (k) =>
      k.judul.toLowerCase().includes(search.toLowerCase()) ||
      (k.deskripsi || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <SkeletonList />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={() => { setError(""); setLoading(true); fetchData(); }}
          className="text-sm text-primary hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Kursus Saya</h1>
        <Link
          href="/guru/buat"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" />
          Kursus Baru
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kursus..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        kursus.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada kursus"
            description="Buat kursus pertama untuk mulai mengatur kelas dan materi."
            action={{ label: "Buat Kursus", href: "/guru/buat" }}
          />
        ) : (
          <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
            <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-on-surface-variant mb-4">Tidak ada kursus yang cocok</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((k) => (
            <div
              key={k.id}
              className="bg-glass border border-border-precision rounded-2xl sm:rounded-2xl p-6 shadow-glass"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-full h-1 bg-primary rounded-full flex-1 mr-3" />
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold tracking-wider ${STATUS_BADGE[k.statusPublikasi]?.color || STATUS_BADGE.DRAFT.color}`}>
                  {STATUS_BADGE[k.statusPublikasi]?.label || "Draft"}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-on-surface mb-1.5">{typeof k.judul === 'string' && k.judul !== '[object Object]' ? k.judul : 'Kursus'}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
                {k.deskripsi || "Tanpa deskripsi"}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/guru/kursus/${k.id}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Detail
                </Link>
                <span className="text-on-surface-variant/20">|</span>
                <Link
                  href={`/guru/kursus/${k.id}/nilai`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Nilai
                </Link>
                <span className="text-on-surface-variant/20">|</span>
                {k.statusPublikasi === "DRAFT" || k.statusPublikasi === "ARSIP" ? (
                  <button
                    onClick={() => handlePublish(k.id, "PUBLIK")}
                    disabled={publishing === k.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline disabled:opacity-50"
                  >
                    {publishing === k.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                    Publikasikan
                  </button>
                ) : (
                  <button
                    onClick={() => handlePublish(k.id, "DRAFT")}
                    disabled={publishing === k.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline disabled:opacity-50"
                  >
                    {publishing === k.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                    Privatkan
                  </button>
                )}
                <span className="text-on-surface-variant/20">|</span>
                <button
                  onClick={() => handleInvite(k.id)}
                  disabled={inviting === k.id}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {inviting === k.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Share2 className="w-3 h-3" />}
                  Undang
                </button>
                <span className="text-on-surface-variant/20">|</span>
                <button
                  onClick={() => handleEdit(k.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <span className="text-on-surface-variant/20">|</span>
                <button
                  onClick={() => setConfirmDelete(k.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus
                </button>
              </div>
              {editing === k.id && (
                <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
                  <input
                    value={editJudul}
                    onChange={(e) => setEditJudul(e.target.value)}
                    placeholder="Judul kursus"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-border-precision text-sm focus:outline-hidden focus:border-primary/40"
                  />
                  <textarea
                    value={editDeskripsi}
                    onChange={(e) => setEditDeskripsi(e.target.value)}
                    placeholder="Deskripsi"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-border-precision text-sm focus:outline-hidden focus:border-primary/40 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(k.id)}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:brightness-110"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-3 py-1.5 bg-white border border-border-precision text-xs font-semibold rounded-lg hover:bg-surface"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
              {inviteLinks[k.id] && (
                <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold text-primary mb-1">Link Undangan</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-primary border border-primary/10 truncate max-w-[200px]">
                      {inviteLinks[k.id]}
                    </code>
                    <button
                      onClick={() => copyInviteLink(k.id, inviteLinks[k.id])}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
                    >
                      {copied === k.id ? (
                        <><Check className="w-3 h-3" /> Tersalin</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Salin</>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant/60 mt-2">
                    Bagikan link ini ke siswa via WhatsApp. Siswa yang klik akan langsung terdaftar di kursus ini.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-heading font-semibold text-lg text-on-surface mb-2">Hapus Kursus?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Kursus yang dihapus tidak bisa dikembalikan. Semua materi, kuis, dan data siswa di kursus ini akan tetap ada namun kursus tidak bisa diakses.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting === confirmDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {deleting === confirmDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
