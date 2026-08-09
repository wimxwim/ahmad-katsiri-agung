"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface UseQuizLockOptions {
  enabled: boolean;
  mode: "BELAJAR" | "ULANGAN" | "CBT" | "PRACTICE";
  maxViolations?: number;
  graceMs?: number;
  onViolation?: (count: number, total: number, jenis: string) => void;
  onMaxViolations?: () => void;
}

const GRACE_DEFAULT_MS = 2000;

export function useQuizLock({
  enabled,
  mode,
  maxViolations = 3,
  graceMs = GRACE_DEFAULT_MS,
  onViolation,
  onMaxViolations,
}: UseQuizLockOptions) {
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const violationsRef = useRef(0);
  const enabledRef = useRef(enabled);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastViolationAtRef = useRef(0);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const clearTimers = useCallback(() => {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const flashWarning = useCallback(() => {
    setShowWarning(true);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => setShowWarning(false), 3000);
  }, []);

  const recordViolation = useCallback(
    (jenis: string) => {
      if (!enabledRef.current) return;
      const now = Date.now();
      if (now - lastViolationAtRef.current < 5000) return;
      lastViolationAtRef.current = now;
      violationsRef.current += 1;
      setViolations(violationsRef.current);
      onViolation?.(violationsRef.current, maxViolations, jenis);

      if (mode === "CBT" || mode === "ULANGAN") {
        if (violationsRef.current >= maxViolations) {
          onMaxViolations?.();
        } else {
          flashWarning();
        }
      } else {
        flashWarning();
      }
    },
    [mode, maxViolations, onViolation, onMaxViolations, flashWarning],
  );

  const enterFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) return;
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      // Fullscreen not supported or denied
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs && enabledRef.current) {
        recordViolation("fullscreen_exit");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (graceTimerRef.current) return;
        graceTimerRef.current = setTimeout(() => {
          graceTimerRef.current = null;
          if (document.hidden && enabledRef.current) {
            recordViolation("tab_hidden");
          }
        }, graceMs);
      } else {
        if (graceTimerRef.current) {
          clearTimeout(graceTimerRef.current);
          graceTimerRef.current = null;
        }
      }
    };

    const handlePageHide = () => {
      if (enabledRef.current) {
        recordViolation("pagehide");
      }
    };

    const handleBlur = () => {
      if (enabledRef.current) {
        flashWarning();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("blur", handleBlur);

    enterFullscreen();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("blur", handleBlur);
      clearTimers();
      exitFullscreen();
    };
  }, [enabled, enterFullscreen, exitFullscreen, recordViolation, flashWarning, clearTimers, graceMs]);

  return {
    violations,
    isFullscreen,
    showWarning,
    enterFullscreen,
    exitFullscreen,
  };
}
