'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookWithHighlights } from '@/lib/types'
import BookCard from '@/components/BookCard'
import SearchBar from '@/components/SearchBar'
import { BookOpen, Library, Quote } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function Dashboard() {
  const router = useRouter()
  const [books, setBooks] = useState<BookWithHighlights[]>([])
  const [filteredBooks, setFilteredBooks] = useState<BookWithHighlights[]>([])
  const [lightReadingBooks, setLightReadingBooks] = useState<BookWithHighlights[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (!books || !Array.isArray(books)) {
      setFilteredBooks([])
      setLightReadingBooks([])
      return
    }

    // Separate books by highlight count
    const mainBooks = books.filter(book => (book._count?.highlights || 0) > 5)
    const lightBooks = books.filter(book => (book._count?.highlights || 0) <= 5)

    if (searchQuery.trim()) {
      // Filter both categories by search query
      const filteredMain = mainBooks.filter(book =>
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.highlights && book.highlights.some(h => 
          h.content?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
      const filteredLight = lightBooks.filter(book =>
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.highlights && book.highlights.some(h => 
          h.content?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
      setFilteredBooks(filteredMain)
      setLightReadingBooks(filteredLight)
    } else {
      setFilteredBooks(mainBooks)
      setLightReadingBooks(lightBooks)
    }
  }, [books, searchQuery])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      const data = await response.json()
      
      if (data.success && Array.isArray(data.books)) {
        setBooks(data.books)
        setFilteredBooks(data.books)
      } else {
        console.error('Invalid response format:', data)
        setBooks([])
        setFilteredBooks([])
      }
    } catch (error) {
      console.error('Error fetching books:', error)
      setBooks([])
      setFilteredBooks([])
    } finally {
      setLoading(false)
    }
  }

  const handleBookClick = (bookId: string) => {
    router.push(`/book/${bookId}`)
  }

  const totalHighlights = books?.reduce((sum, book) => sum + (book._count?.highlights || 0), 0) || 0

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-3">
                My Library
              </h1>
              
              <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Library className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-medium">{books?.length || 0} books</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-medium">{totalHighlights} highlights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-medium">{filteredBooks?.length || 0} deep reads</span>
                </div>
              </div>
            </div>

          </div>

          {/* Search Bar */}
          <div className="max-w-md">
            <SearchBar
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
        </div>

        {/* Check if we have any books at all */}
        {(!filteredBooks || filteredBooks.length === 0) && (!lightReadingBooks || lightReadingBooks.length === 0) ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No matches found' : 'No books yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Upload your Kindle clippings to get started'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Deep Reads Section */}
            {filteredBooks && filteredBooks.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Library className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Deep Reads
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Books with more than 5 highlights
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onClick={() => handleBookClick(book.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Light Reading Section */}
            {lightReadingBooks && lightReadingBooks.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Light Reading
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Books with 5 or fewer highlights
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {lightReadingBooks.map((book) => (
                    <div key={book.id} className="transform scale-90">
                      <BookCard
                        book={book}
                        onClick={() => handleBookClick(book.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}