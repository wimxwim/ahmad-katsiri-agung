export default function Loading() {
  return (
    <div className="min-h-dvh bg-surface px-3 py-10 sm:px-5 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 rounded-2xl border border-border-precision bg-white p-6 shadow-glass-lg md:grid-cols-2 md:p-10">
          <div className="md:pr-6 space-y-4">
            <div className="h-8 w-32 bg-on-surface/5 rounded-full animate-pulse" />
            <div className="h-10 w-3/4 bg-on-surface/5 rounded-lg animate-pulse" />
            <div className="h-4 w-full bg-on-surface/5 rounded animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-on-surface/10 mt-2 shrink-0" />
                  <div className="h-4 w-2/3 bg-on-surface/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div className="h-8 w-48 bg-on-surface/5 rounded-lg animate-pulse mx-auto" />
            <div className="h-12 w-full bg-on-surface/5 rounded-xl animate-pulse" />
            <div className="h-12 w-full bg-on-surface/5 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}