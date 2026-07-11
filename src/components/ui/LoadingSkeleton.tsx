import { cn } from "@/lib/utils";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-on-surface/5", className)} />
  );
}

function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={cn("min-h-[60vh] px-3 py-8", className)}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonPulse className="h-8 w-48" />
          <SkeletonPulse className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-glass border border-border-precision rounded-xl p-6 space-y-3">
              <SkeletonPulse className="h-4 w-3/4" />
              <SkeletonPulse className="h-3 w-full" />
              <SkeletonPulse className="h-3 w-5/6" />
              <div className="flex gap-2 pt-2">
                <SkeletonPulse className="h-6 w-16 rounded-full" />
                <SkeletonPulse className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { LoadingSkeleton, SkeletonPulse };
