export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`min-h-[60vh] flex items-center justify-center px-3 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-on-surface/40">Memuat...</p>
      </div>
    </div>
  );
}
