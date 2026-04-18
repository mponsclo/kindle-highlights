import Link from 'next/link'
import { Book } from '@/lib/types'

interface BookCardProps {
  book: Book & { _count?: { highlights: number } }
  href: string
}

export default function BookCard({ book, href }: BookCardProps) {
  const highlightCount = book._count?.highlights ?? 0
  const addedYear = new Date(book.createdAt).getFullYear()

  return (
    <Link
      href={href}
      className="group block border-t border-[color:var(--border)] hover:border-[color:var(--fg)] py-6 transition-colors"
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
        {String(highlightCount).padStart(3, '0')} · {addedYear}
      </p>
      <h3 className="mt-2 text-xl font-semibold leading-snug text-[color:var(--fg)] group-hover:underline underline-offset-4 decoration-[color:var(--accent-strong)] decoration-2 line-clamp-3">
        {book.title}
      </h3>
      <p className="mt-1 text-sm text-[color:var(--muted)] line-clamp-1">
        {book.author}
      </p>
    </Link>
  )
}
