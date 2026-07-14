export default function Loading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="h-14 bg-glass border-b border-border-precision" />
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-8 space-y-8">
        <div className="space-y-4 max-w-2xl">
          <div className="h-12 w-3/4 bg-on-surface/5 rounded-2xl animate-pulse" />
          <div className="h-5 w-full bg-on-surface/5 rounded animate-pulse" />
          <div className="h-5 w-2/3 bg-on-surface/5 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-glass border border-border-precision rounded-2xl p-6 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}