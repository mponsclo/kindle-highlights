'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Highlight } from '@/lib/types'
import { useDebounce } from '@/lib/hooks'
import HighlightCard from '@/components/HighlightCard'
import SearchBar from '@/components/SearchBar'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowLeft } from 'lucide-react'

function dedupeById(rows: Highlight[]): Highlight[] {
  const seen = new Set<string>()
  const out: Highlight[] = []
  for (const r of rows) {
    if (seen.has(r.id)) continue
    seen.add(r.id)
    out.push(r)
  }
  return out
}

const PAGE_SIZE = 50

interface BookMeta {
  id: string
  title: string
  author: string
  createdAt: string
  highlightCount: number
}

interface BookDetailClientProps {
  book: BookMeta
}

export default function BookDetailClient({ book }: BookDetailClientProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [total, setTotal] = useState(book.highlightCount)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const searchQuery = useDebounce(searchInput, 300)

  // Tracks the most-recently-issued request so stale responses (e.g. a
  // Load-more whose reply lands after a search reset) are dropped instead
  // of being merged into state.
  const requestSeqRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const fetchPage = useCallback(
    async (nextOffset: number, q: string, append: boolean) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const seq = ++requestSeqRef.current
      if (append) setLoadingMore(true)
      else setLoading(true)
      try {
        const params = new URLSearchParams({
          bookId: book.id,
          limit: String(PAGE_SIZE),
          offset: String(nextOffset),
        })
        if (q) params.set('search', q)
        const res = await fetch(`/api/highlights?${params}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        if (seq !== requestSeqRef.current) return
        if (!data.success) throw new Error(data.error ?? 'Failed to load highlights')

        setTotal(data.total)
        setHasMore(data.hasMore)
        setOffset(nextOffset + data.highlights.length)
        setHighlights((prev) =>
          dedupeById(append ? [...prev, ...data.highlights] : data.highlights),
        )
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        if (seq !== requestSeqRef.current) return
        console.error('Error fetching highlights:', error)
        if (!append) setHighlights([])
      } finally {
        if (seq === requestSeqRef.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [book.id],
  )

  useEffect(() => {
    fetchPage(0, searchQuery.trim(), false)
  }, [searchQuery, fetchPage])

  const loadMore = () => {
    if (loadingMore || loading || !hasMore) return
    fetchPage(offset, searchQuery.trim(), true)
  }

  const year = new Date(book.createdAt).getFullYear()

  return (
    <div className="min-h-screen">
      <header className="border-b border-[color:var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-widest text-[color:var(--fg)]"
          >
            Kindle Highlights
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
            >
              <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
              Library
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Book header */}
        <header className="mb-12">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
            {String(book.highlightCount).padStart(3, '0')} highlights · added {year}
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-[color:var(--fg)]">
            {book.title}
          </h1>
          <p className="mt-3 text-lg text-[color:var(--muted)]">by {book.author}</p>

          <div className="mt-8">
            <SearchBar
              onSearch={setSearchInput}
              placeholder="Search within this book"
            />
            {searchQuery.trim() && !loading && (
              <p className="mt-3 text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
                {total} of {book.highlightCount} match “{searchQuery.trim()}”
              </p>
            )}
          </div>
        </header>

        {/* Highlights list */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-6 h-6 border border-[color:var(--border-strong)] border-t-[color:var(--accent-strong)] rounded-full animate-spin" />
          </div>
        ) : highlights.length === 0 ? (
          <div className="border-t border-[color:var(--border)] py-20 text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
              Nothing to show
            </p>
            <p className="mt-3 text-lg text-[color:var(--fg)]">
              {searchQuery ? 'No highlights match.' : 'This book has no highlights yet.'}
            </p>
          </div>
        ) : (
          <>
            <div>
              {highlights.map((highlight) => (
                <HighlightCard
                  key={highlight.id}
                  highlight={highlight}
                  showBookInfo={false}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 border-t border-[color:var(--border)] pt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-3 border border-[color:var(--border-strong)] px-5 py-3 text-sm text-[color:var(--fg)] hover:bg-[color:var(--surface)] hover:border-[color:var(--fg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? (
                    'Loading…'
                  ) : (
                    <>
                      Load more
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
                        {total - highlights.length} left
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
