"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({ name = "password", placeholder = "••••••••", minLength }: { name?: string; placeholder?: string; minLength?: number }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-11 border border-border-precision rounded-xl text-md bg-white text-on-surface placeholder:text-on-surface-variant/70 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        aria-label={show ? "Sembunyikan sandi" : "Tampilkan sandi"}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
