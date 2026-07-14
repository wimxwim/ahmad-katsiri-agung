"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

function renderMath(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      trust: false,
      strict: "warn",
    });
  } catch {
    return latex;
  }
}

interface MathRendererProps {
  text: string;
  className?: string;
}

export function MathRenderer({ text, className }: MathRendererProps) {
  if (!text || !text.includes("$")) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const latex = part.slice(2, -2).trim();
          if (!latex) return null;
          return (
            <span
              key={i}
              className="block my-2 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderMath(latex, true) }}
            />
          );
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          const latex = part.slice(1, -1).trim();
          if (!latex) return null;
          return (
            <span
              key={i}
              className="inline"
              dangerouslySetInnerHTML={{ __html: renderMath(latex, false) }}
            />
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export function MathBlock({ latex, className }: { latex: string; className?: string }) {
  return (
    <div
      className={cn("my-2 overflow-x-auto", className)}
      dangerouslySetInnerHTML={{ __html: renderMath(latex, true) }}
    />
  );
}

export function MathInline({ latex, className }: { latex: string; className?: string }) {
  return (
    <span
      className={cn("inline", className)}
      dangerouslySetInnerHTML={{ __html: renderMath(latex, false) }}
    />
  );
}