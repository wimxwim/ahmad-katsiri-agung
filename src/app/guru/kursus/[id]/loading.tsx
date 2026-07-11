import { SkeletonCard } from "@/components/ui/SkeletonBlocks";

export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="h-8 w-48 bg-primary/5 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="p-5 h-32" />
        ))}
      </div>
    </div>
  );
}