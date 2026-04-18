import { Prisma } from '@prisma/client'
import { BookOpen, Library, Quote } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import BookCard from '@/components/BookCard'
import ThemeToggle from '@/components/ThemeToggle'
import DashboardSearch from './DashboardSearch'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

const DEEP_READ_THRESHOLD = 5

export default async function Dashboard({ searchParams }: PageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const where: Prisma.BookWhereInput = query
    ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          {
            highlights: {
              some: { content: { contains: query, mode: 'insensitive' } },
            },
          },
        ],
      }
    : {}

  const books = await prisma.book.findMany({
    where,
    include: { _count: { select: { highlights: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const deepReads = books.filter((b) => b._count.highlights > DEEP_READ_THRESHOLD)
  const lightReads = books.filter((b) => b._count.highlights <= DEEP_READ_THRESHOLD)
  const totalHighlights = books.reduce((sum, b) => sum + b._count.highlights, 0)
  const hasResults = books.length > 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10">
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
                  <span className="text-lg font-medium">{books.length} books</span>
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
                  <span className="text-lg font-medium">{deepReads.length} deep reads</span>
                </div>
              </div>
            </div>
          </div>

          <DashboardSearch />
        </div>

        {!hasResults ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {query ? 'No matches found' : 'No books yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {query
                ? 'Try adjusting your search terms'
                : 'Upload your Kindle clippings to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {deepReads.length > 0 && (
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
                      Books with more than {DEEP_READ_THRESHOLD} highlights
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {deepReads.map((book) => (
                    <BookCard key={book.id} book={book} href={`/book/${book.id}`} />
                  ))}
                </div>
              </div>
            )}

            {lightReads.length > 0 && (
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
                      Books with {DEEP_READ_THRESHOLD} or fewer highlights
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {lightReads.map((book) => (
                    <div key={book.id} className="transform scale-90">
                      <BookCard book={book} href={`/book/${book.id}`} />
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
