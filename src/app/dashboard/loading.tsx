export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10">
          <div className="h-10 w-48 rounded-md bg-gray-200 dark:bg-slate-700 animate-pulse mb-4" />
          <div className="flex gap-6 mb-6">
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-6 w-36 rounded bg-gray-200 dark:bg-slate-700 animate-pulse" />
          </div>
          <div className="h-10 max-w-md rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
        </div>

        <div className="h-8 w-40 rounded bg-gray-200 dark:bg-slate-700 animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-slate-700 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
