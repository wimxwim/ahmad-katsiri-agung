"use client";

import { useEffect } from "react";

export function useTabFocus(onFocus: () => void) {
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) onFocus();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [onFocus]);
}
