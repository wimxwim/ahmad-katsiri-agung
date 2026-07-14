export default function BerandaLoading() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 w-32 bg-border-precision rounded mb-4" />
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-2xl border border-border-precision p-4">
            <div className="h-3 w-12 bg-border-precision rounded mb-2" />
            <div className="h-6 w-8 bg-border-precision rounded" />
          </div>
        ))}
      </div>
      <div className="h-20 bg-glass rounded-2xl border border-border-precision" />
      {[1, 2, 3, 4].map((i) => (
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