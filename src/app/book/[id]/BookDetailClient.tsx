'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BookWithHighlights, Highlight } from '@/lib/types'
import HighlightCard from '@/components/HighlightCard'
import SearchBar from '@/components/SearchBar'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowLeft, BookOpen, Quote, User, Calendar, Search } from 'lucide-react'

interface BookDetailClientProps {
  bookId: string
}

export default function BookDetailClient({ bookId }: BookDetailClientProps) {
  const router = useRouter()
  const [book, setBook] = useState<BookWithHighlights | null>(null)
  const [filteredHighlights, setFilteredHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchBookDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/books?bookId=${bookId}&includeAll=true`)
      const data = await response.json()

      if (data.books && data.books.length > 0) {
        setBook(data.books[0])
        setFilteredHighlights(data.books[0].highlights)
      }
    } catch (error) {
      console.error('Error fetching book details:', error)
    } finally {
      setLoading(false)
    }
  }, [bookId])

  useEffect(() => {
    fetchBookDetails()
  }, [fetchBookDetails])

  useEffect(() => {
    if (book) {
      if (searchQuery.trim()) {
        const filtered = book.highlights.filter(highlight =>
          highlight.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredHighlights(filtered)
      } else {
        setFilteredHighlights(book.highlights)
      }
    }
  }, [book, searchQuery])

  const getBookColor = (title: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-yellow-500 to-yellow-600',
      'from-teal-500 to-teal-600'
    ]
    let hash = 0
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Book not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </button>

          {/* Book Header */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
            <div className="flex items-start space-x-6">
              {/* Book Cover */}
              <div className={`
                w-32 h-48 rounded-lg bg-gradient-to-br ${getBookColor(book.title)}
                shadow-lg flex-shrink-0 border-2 border-white dark:border-gray-200 relative overflow-hidden
              `}>
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-black bg-opacity-20" />
                <div className="p-4 h-full flex flex-col text-white">
                  <h3 className="font-bold text-sm leading-tight line-clamp-4">
                    {book.title}
                  </h3>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/0 via-white/5 to-white/0" />
              </div>

              {/* Book Info */}
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
                    <span>{book._count?.highlights || 0} highlights</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Added {new Date(book.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="max-w-md">
                  <SearchBar
                    onSearch={setSearchQuery}
                    placeholder="Search within this book..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-4">
          {searchQuery && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {filteredHighlights.length === book.highlights.length 
                ? `Showing all ${filteredHighlights.length} highlights`
                : `Found ${filteredHighlights.length} of ${book.highlights.length} highlights`
              }
            </div>
          )}

          {filteredHighlights.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No matching highlights' : 'No highlights found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'This book doesn\'t have any highlights yet'
                }
              </p>
            </div>
          ) : (
            filteredHighlights.map((highlight) => (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                showBookInfo={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}