import { SkeletonCard } from "@/components/ui/SkeletonBlocks";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-8 space-y-6">
      <div className="h-8 w-48 bg-primary/5 rounded-lg animate-pulse" />
      <SkeletonCard className="p-5 h-64" />
    </div>
  );
}