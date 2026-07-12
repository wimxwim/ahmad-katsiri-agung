import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  subtext,
  color = "bg-primary/10 text-primary",
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-glass border border-border-precision rounded-2xl p-5 shadow-glass", className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
          {icon}
        </div>
        <span className="text-xs font-medium text-on-surface-variant">{label}</span>
      </div>
      <p className="font-heading font-bold text-2xl text-on-surface">{value}</p>
      {subtext && (
        <p className="text-xs text-on-surface-variant mt-1">{subtext}</p>
      )}
    </div>
  );
}

export type { StatCardProps };