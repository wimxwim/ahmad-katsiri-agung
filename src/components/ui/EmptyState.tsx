import { cn } from "@/lib/utils";
import { FileText, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-glass border border-border-precision rounded-[32px] p-6 sm:p-10 shadow-glass text-center",
        className
      )}
    >
      <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </span>
      <h3 className="font-heading text-xl font-bold text-on-surface mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-5">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
