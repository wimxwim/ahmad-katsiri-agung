"use client";

import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CheckCircle, Lock, Play } from "lucide-react";

interface Step {
  label: string;
  status: "done" | "current" | "locked";
}

interface LearningProgressProps {
  steps: Step[];
  progress: number;
  className?: string;
}

function StepIcon({ status }: { status: Step["status"] }) {
  switch (status) {
    case "done":
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "current":
      return <Play className="w-5 h-5 text-primary" />;
    case "locked":
      return <Lock className="w-4 h-4 text-on-surface-variant/30" />;
  }
}

export function LearningProgress({ steps, progress, className }: LearningProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-on-surface">Progress Belajar</p>
        <span className="text-sm font-bold text-primary font-heading">{progress}%</span>
      </div>

      <div className="w-full h-2.5 rounded-full bg-surface overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.8, ease: EASE_CURVE }}
        />
      </div>

      <div className="space-y-2 mt-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06, ease: EASE_CURVE }}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors",
              step.status === "current" && "bg-primary/5 border border-primary/20",
              step.status === "done" && "bg-emerald-50/50",
              step.status === "locked" && "opacity-40",
            )}
          >
            <StepIcon status={step.status} />
            <span
              className={cn(
                "text-sm",
                step.status === "current" && "font-medium text-primary",
                step.status === "done" && "text-emerald-700",
                step.status === "locked" && "text-on-surface-variant",
              )}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
