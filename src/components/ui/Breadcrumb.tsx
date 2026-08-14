import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm text-on-surface-variant flex-wrap">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-primary transition-colors min-h-11 inline-flex items-center px-1">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-on-surface font-medium min-h-11 inline-flex items-center px-1">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
