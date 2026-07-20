"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface UseQuizLockOptions {
  enabled: boolean;
  mode: "BELAJAR" | "ULANGAN" | "CBT" | "PRACTICE";
  maxViolations?: number;
  onViolation?: (count: number, total: number) => void;
  onMaxViolations?: () => void;
}

export function useQuizLock({
  enabled,
  mode,
  maxViolations = 3,
  onViolation,
  onMaxViolations,
}: UseQuizLockOptions) {
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const violationsRef = useRef(0);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

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

  const recordViolation = useCallback(() => {
    if (!enabledRef.current) return;
    violationsRef.current += 1;
    setViolations(violationsRef.current);
    onViolation?.(violationsRef.current, maxViolations);

    if (mode === "CBT" || mode === "ULANGAN") {
      if (violationsRef.current >= maxViolations) {
        onMaxViolations?.();
      } else {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    } else {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  }, [mode, maxViolations, onViolation, onMaxViolations]);

  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs && enabledRef.current) {
        recordViolation();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && enabledRef.current) {
        recordViolation();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    enterFullscreen();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      exitFullscreen();
    };
  }, [enabled, enterFullscreen, exitFullscreen, recordViolation]);

  return {
    violations,
    isFullscreen,
    showWarning,
    enterFullscreen,
    exitFullscreen,
  };
}