export default function BookDetailLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="h-3 w-24 bg-[color:var(--border)] animate-pulse mb-8" />

        <div className="h-3 w-20 bg-[color:var(--border)] animate-pulse mb-4" />
        <div className="h-10 w-4/5 bg-[color:var(--border)] animate-pulse mb-3" />
        <div className="h-5 w-2/5 bg-[color:var(--border)] animate-pulse mb-6" />
        <div className="flex gap-4 mb-10">
          <div className="h-3 w-24 bg-[color:var(--border)] animate-pulse" />
          <div className="h-3 w-28 bg-[color:var(--border)] animate-pulse" />
        </div>
        <div className="h-10 w-full bg-[color:var(--border)] animate-pulse mb-12" />

        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-t border-[color:var(--border)] py-6 space-y-3">
            <div className="h-3 w-40 bg-[color:var(--border)] animate-pulse" />
            <div className="h-5 w-full bg-[color:var(--border)] animate-pulse" />
            <div className="h-5 w-11/12 bg-[color:var(--border)] animate-pulse" />
            <div className="h-5 w-3/4 bg-[color:var(--border)] animate-pulse" />
            <div className="h-3 w-28 bg-[color:var(--border)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
