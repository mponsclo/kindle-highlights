export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="h-3 w-24 bg-[color:var(--border)] animate-pulse mb-6" />
        <div className="h-12 w-72 bg-[color:var(--border)] animate-pulse mb-4" />
        <div className="flex gap-4 mb-10">
          <div className="h-3 w-20 bg-[color:var(--border)] animate-pulse" />
          <div className="h-3 w-24 bg-[color:var(--border)] animate-pulse" />
          <div className="h-3 w-16 bg-[color:var(--border)] animate-pulse" />
        </div>
        <div className="h-10 w-full max-w-md bg-[color:var(--border)] animate-pulse mb-12" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border-t border-[color:var(--border)] py-6 space-y-3">
              <div className="h-3 w-20 bg-[color:var(--border)] animate-pulse" />
              <div className="h-6 w-full bg-[color:var(--border)] animate-pulse" />
              <div className="h-6 w-3/4 bg-[color:var(--border)] animate-pulse" />
              <div className="h-4 w-1/2 bg-[color:var(--border)] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
