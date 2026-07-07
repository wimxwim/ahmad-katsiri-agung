export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-primary/5 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-glass rounded-2xl sm:rounded-[32px] p-5 h-24 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-2xl sm:rounded-[32px] p-6 h-40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
