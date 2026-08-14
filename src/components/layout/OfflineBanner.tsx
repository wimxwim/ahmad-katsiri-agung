"use client";

import { useState, useEffect } from "react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);

    // Initialize from current navigator state (SSR-safe: only in effect)
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[60] bg-amber-500 text-white text-center py-2 text-sm font-medium"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.5rem)", paddingBottom: "0.5rem" }}
    >
      Kamu offline — beberapa fitur tidak tersedia
    </div>
  );
}
