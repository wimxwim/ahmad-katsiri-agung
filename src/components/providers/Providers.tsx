"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const lenis = new Lenis({ autoRaf: true, duration: 0.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    return () => lenis.destroy();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
