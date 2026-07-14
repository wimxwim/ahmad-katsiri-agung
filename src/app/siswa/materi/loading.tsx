export default function MateriLoading() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-border-precision" />
        <div className="space-y-1.5">
          <div className="h-4 w-28 bg-border-precision rounded" />
          <div className="h-3 w-40 bg-border-precision rounded" />
        </div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 bg-glass rounded-2xl border border-border-precision p-3.5">
          <div className="w-10 h-10 rounded-xl bg-border-precision shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-3/4 bg-border-precision rounded" />
            <div className="h-3 w-1/2 bg-border-precision rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}