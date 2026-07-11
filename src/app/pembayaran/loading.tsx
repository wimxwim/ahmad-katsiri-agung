import { SkeletonCard } from "@/components/ui/SkeletonBlocks";

export default function Loading() {
  return (
    <div className="min-h-dvh bg-surface p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-primary/5 rounded-lg animate-pulse" />
        <SkeletonCard className="p-5 h-96" />
      </div>
    </div>
  );
}