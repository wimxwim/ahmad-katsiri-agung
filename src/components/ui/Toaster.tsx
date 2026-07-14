"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid rgba(27,107,69,0.15)",
          borderRadius: "16px",
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: "14px",
        },
      }}
    />
  );
}