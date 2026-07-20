"use client";

import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface QuizLockOverlayProps {
  show: boolean;
  violations: number;
  maxViolations: number;
  mode: string;
}

export function QuizLockOverlay({ show, violations, maxViolations, mode }: QuizLockOverlayProps) {
  const isStrict = mode === "CBT" || mode === "ULANGAN";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
        >
          <div className="bg-red-50 border border-red-300 rounded-2xl px-5 py-3 shadow-glass-lg max-w-sm w-full flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                ⚠️ Jangan tinggalkan halaman!
              </p>
              <p className="text-xs text-red-600">
                {isStrict
                  ? `Pelanggaran ${violations}/${maxViolations}. Setelah ${maxViolations}x, kuis akan otomatis dikumpulkan.`
                  : `Pelanggaran ke-${violations}. Tetap fokus ya!`}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}