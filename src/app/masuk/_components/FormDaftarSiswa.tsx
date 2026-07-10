"use client";

import { PasswordInput } from "./PasswordInput";
import { ErrorAlert } from "./ErrorAlert";

type Props = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
  error: string;
  loading: boolean;
};

export function FormDaftarSiswa({ onSubmit, onBack, error, loading }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Nama lengkap</label>
        <input
          name="nama"
          required
          placeholder="Nama kamu"
          className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="kamu@email.com"
          className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
          Kata Sandi <span className="font-normal text-on-surface-variant">(min. 8 karakter)</span>
        </label>
        <PasswordInput minLength={8} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
            Kelas <span className="font-normal text-on-surface-variant">(opsional)</span>
          </label>
          <input
            name="kelas"
            placeholder="mis. 8A"
            className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
            No. Absen <span className="font-normal text-on-surface-variant">(opsional)</span>
          </label>
          <input
            name="noAbsen"
            inputMode="numeric"
            placeholder="mis. 14"
            className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/50 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>
      <ErrorAlert message={error} />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-[15px] bg-primary text-on-primary rounded-[13px] font-semibold text-[16px] cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : "Daftar →"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-[13px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        ← Kembali ke pemilihan portal
      </button>
    </form>
  );
}
