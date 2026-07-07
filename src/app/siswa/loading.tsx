export default function DashboardSiswaLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-5 h-20 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-4 h-20 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
