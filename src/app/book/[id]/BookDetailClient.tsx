'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Highlight } from '@/lib/types'
import { useDebounce } from '@/lib/hooks'
import HighlightCard from '@/components/HighlightCard'
import SearchBar from '@/components/SearchBar'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowLeft, Quote, User, Calendar, Search } from 'lucide-react'

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

const COVER_COLORS = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-red-500 to-red-600',
  'from-indigo-500 to-indigo-600',
  'from-pink-500 to-pink-600',
  'from-yellow-500 to-yellow-600',
  'from-teal-500 to-teal-600',
]

function getBookColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length]
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

  const fetchPage = useCallback(
    async (nextOffset: number, q: string, append: boolean) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      try {
        const params = new URLSearchParams({
          bookId: book.id,
          limit: String(PAGE_SIZE),
          offset: String(nextOffset),
        })
        if (q) params.set('search', q)
        const res = await fetch(`/api/highlights?${params}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.error ?? 'Failed to load highlights')

        setTotal(data.total)
        setHasMore(data.hasMore)
        setOffset(nextOffset + data.highlights.length)
        setHighlights((prev) => (append ? [...prev, ...data.highlights] : data.highlights))
      } catch (error) {
        console.error('Error fetching highlights:', error)
        if (!append) setHighlights([])
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [book.id],
  )

  // Refetch from offset 0 whenever the debounced search query changes.
  useEffect(() => {
    fetchPage(0, searchQuery.trim(), false)
  }, [searchQuery, fetchPage])

  const loadMore = () => {
    if (loadingMore || !hasMore) return
    fetchPage(offset, searchQuery.trim(), true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </Link>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
            <div className="flex items-start space-x-6">
              <div
                className={`w-32 h-48 rounded-lg bg-gradient-to-br ${getBookColor(book.title)} shadow-lg flex-shrink-0 border-2 border-white dark:border-gray-200 relative overflow-hidden`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-black bg-opacity-20" />
                <div className="p-4 h-full flex flex-col text-white">
                  <h3 className="font-bold text-sm leading-tight line-clamp-4">
                    {book.title}
                  </h3>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/0 via-white/5 to-white/0" />
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {book.title}
                </h1>
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-lg">by {book.author}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Quote className="w-4 h-4 mr-1" />
                    <span>{book.highlightCount} highlights</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Added {new Date(book.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="max-w-md">
                  <SearchBar
                    onSearch={setSearchInput}
                    placeholder="Search within this book..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {searchQuery.trim() && !loading && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Found {total} of {book.highlightCount} highlights
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : highlights.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No matching highlights' : 'No highlights found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : "This book doesn't have any highlights yet"}
              </p>
            </div>
          ) : (
            <>
              {highlights.map((highlight) => (
                <HighlightCard
                  key={highlight.id}
                  highlight={highlight}
                  showBookInfo={false}
                />
              ))}

              {hasMore && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium shadow-sm transition-colors"
                  >
                    {loadingMore ? 'Loading…' : `Load more (${total - highlights.length} remaining)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
