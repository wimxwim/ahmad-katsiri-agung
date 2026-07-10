"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Mode } from "./shared";

export function FormMasukPortalPicker({ onSelect }: { onSelect: (mode: Mode) => void }) {
  return (
    <div>
      <h2 className="font-heading text-xl md:text-2xl text-on-surface mb-1">Pilih ruang masuk kamu</h2>
      <p className="text-[13px] md:text-sm text-on-surface-variant mb-6 md:mb-8">
        Kami pisahkan alur guru dan siswa supaya tidak tertukar lagi.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => onSelect("murid")}
          className="group flex items-center gap-4 w-full text-left border border-border-precision bg-white rounded-[18px] p-[18px] transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-glass cursor-pointer"
        >
          <span className="w-[50px] h-[50px] rounded-[14px] bg-surface grid place-items-center text-[26px] shrink-0">🧑🎓</span>
          <span className="flex-1">
            <b className="block text-[16px] text-on-surface">Ruang Siswa</b>
            <span className="text-[13px] text-on-surface-variant">Belajar materi, kerjakan kuis, dan pantau progres.</span>
          </span>
          <span className="text-primary/40 text-xl group-hover:text-primary transition-colors">›</span>
        </button>
        <button
          onClick={() => onSelect("guru")}
          className="group flex items-center gap-4 w-full text-left border border-border-precision bg-white rounded-[18px] p-[18px] transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-glass cursor-pointer"
        >
          <span className="w-[50px] h-[50px] rounded-[14px] bg-surface grid place-items-center text-[26px] shrink-0">🧑🏫</span>
          <span className="flex-1">
            <b className="block text-[16px] text-on-surface">Ruang Guru</b>
            <span className="text-[13px] text-on-surface-variant">Kelola materi, kuis, siswa, dan analitik pembelajaran.</span>
          </span>
          <span className="text-primary/40 text-xl group-hover:text-primary transition-colors">›</span>
        </button>
        <Link
          href="/daftar"
          className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-primary/15 bg-primary/5 p-[18px] text-center text-[15px] font-semibold text-primary transition-all duration-200 hover:border-primary/40 hover:bg-primary/10"
        >
          Buat akun baru
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
