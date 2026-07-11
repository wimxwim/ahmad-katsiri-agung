import { SkeletonCard } from "@/components/ui/SkeletonBlocks";

export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="h-8 w-40 bg-primary/5 rounded-lg animate-pulse" />
      <SkeletonCard className="p-5 h-96" />
    </div>
  );
}