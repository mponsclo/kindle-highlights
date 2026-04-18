'use client'

import { Highlight } from '@/lib/types'

interface HighlightCardProps {
  highlight: Highlight
  showBookInfo?: boolean
}

function formatDate(date: Date | null | undefined) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export default function HighlightCard({ highlight, showBookInfo = true }: HighlightCardProps) {
  const dateLabel = formatDate(highlight.dateAdded ?? highlight.createdAt)

  return (
    <article className="relative py-6 border-t border-[color:var(--border)]">
      {showBookInfo && highlight.book && (
        <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
          {highlight.book.title}
          <span className="text-[color:var(--subtle)]"> · {highlight.book.author}</span>
        </p>
      )}

      <blockquote className="text-[color:var(--fg)] text-base leading-relaxed">
        <span className="highlighter">{highlight.content}</span>
      </blockquote>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
        {highlight.page != null && <span>p. {highlight.page}</span>}
        {highlight.location && <span>loc {highlight.location}</span>}
        {dateLabel && <span>{dateLabel}</span>}
      </div>

      {highlight.tags && highlight.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {highlight.tags.map((tagRelation) => (
            <span
              key={tagRelation.tagId}
              className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border border-[color:var(--border)] text-[color:var(--muted)]"
            >
              {tagRelation.tag?.name}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
