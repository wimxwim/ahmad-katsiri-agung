"use client";

import { PasswordInput } from "./PasswordInput";
import { ErrorAlert } from "./ErrorAlert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Nama lengkap</label>
        <Input name="nama" required placeholder="Nama kamu" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
        <Input name="email" type="email" required placeholder="kamu@email.com" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">
          Kata Sandi <span className="font-normal text-on-surface-variant">(min. 8 karakter)</span>
        </label>
        <PasswordInput minLength={8} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Kelas <span className="font-normal text-on-surface-variant">(opsional)</span>
          </label>
<Input
              name="kelas"
              placeholder="mis. 8A"
            />
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            No. Absen <span className="font-normal text-on-surface-variant">(opsional)</span>
          </label>
<Input
              name="noAbsen"
              inputMode="numeric"
              placeholder="mis. 14"
            />
        </div>
      </div>
      <ErrorAlert message={error} />
      <Button type="submit" disabled={loading}>
        {loading ? "Memproses..." : "Daftar →"}
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        ← Kembali ke pemilihan portal
      </button>
    </form>
  );
}
