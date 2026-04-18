export default function BookDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-5 w-32 rounded bg-gray-200 dark:bg-slate-700 animate-pulse mb-6" />

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-32 h-48 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-9 w-3/4 rounded bg-gray-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-10 max-w-md rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
