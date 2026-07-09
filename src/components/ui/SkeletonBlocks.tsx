import { cn } from "@/lib/utils";

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-glass rounded-2xl sm:rounded-[32px] animate-pulse",
        className
      )}
    />
  );
}

function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} className="p-5 h-24" />
      ))}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} className="p-5 h-24" />
      ))}
    </div>
  );
}

function SkeletonDashboardGuru() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-primary/5 rounded-lg animate-pulse" />
      <SkeletonStatCards />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="p-6 h-40" />
        ))}
      </div>
    </div>
  );
}

function SkeletonDashboardSiswa() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="p-5 h-20" />
        ))}
      </div>
      <SkeletonCard className="p-5 sm:p-6 h-28" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="p-4 sm:p-5 h-24" />
        ))}
      </div>
    </div>
  );
}

export {
  SkeletonCard,
  SkeletonStatCards,
  SkeletonList,
  SkeletonDashboardGuru,
  SkeletonDashboardSiswa,
};
