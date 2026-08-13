import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="stat-card-container bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-2xl p-5 sm:p-6 shadow-glass">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: color
              ? `color-mix(in oklch, ${color} 8%, transparent)`
              : undefined,
          }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: color || "var(--color-primary)" }}
            aria-hidden="true"
          />
        </div>
        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
          {label}
        </p>
      </div>
      <p className="stat-card-value font-heading text-3xl font-bold text-on-surface">{value}</p>
      {trend && (
        <p className="text-xs text-on-surface-variant mt-1">{trend}</p>
      )}
    </div>
  );
}
