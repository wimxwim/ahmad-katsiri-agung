"use client";

import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SkillItem {
  label: string;
  pL: number; // 0-1 (BKT mastery probability)
  totalAttempt: number;
}

interface MasteryChartProps {
  skills: SkillItem[];
  className?: string;
}

function masteryLabel(pL: number): { label: string; color: string } {
  if (pL >= 0.8) return { label: "Dikuasai", color: "bg-emerald-500" };
  if (pL >= 0.6) return { label: "Dalam Proses", color: "bg-amber-400" };
  return { label: "Perlu Remedial", color: "bg-red-400" };
}

export function MasteryChart({ skills, className }: MasteryChartProps) {
  if (skills.length === 0) {
    return (
      <div className={cn("bg-glass rounded-2xl border border-border-precision p-6 text-center", className)}>
        <p className="text-sm text-on-surface-variant">Belum ada data penguasaan.</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-glass rounded-2xl border border-border-precision p-5 space-y-4", className)}>
      <h3 className="font-heading text-sm font-semibold text-on-surface">Penguasaan per Topik</h3>
      {skills.map((skill, i) => {
        const m = masteryLabel(skill.pL);
        return (
          <motion.div
            key={skill.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, ease: EASE_CURVE }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-on-surface">{skill.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant">{skill.totalAttempt} attempt</span>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", m.color.replace("bg-", "bg-").concat("/10"), m.color.replace("bg-", "text-"))}>
                  {m.label}
                </span>
              </div>
            </div>
            <div className="w-full bg-black/5 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.pL * 100}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: EASE_CURVE }}
                className={cn("h-full rounded-full", m.color)}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}