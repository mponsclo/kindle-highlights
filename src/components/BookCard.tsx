import Link from 'next/link'
import { Book } from '@/lib/types'
import { Quote, Calendar } from 'lucide-react'

interface BookCardProps {
  book: Book & { _count?: { highlights: number } }
  href: string
}

export default function BookCard({ book, href }: BookCardProps) {
  const highlightCount = book._count?.highlights || 0
  
  // Generate a consistent color based on the book title
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

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  return (
    <Link
      href={href}
      className="group block cursor-pointer transform transition-all duration-300 hover:scale-105"
    >
      {/* Book Cover */}
      <div className="relative">
        <div className={`
          w-full h-72 rounded-xl bg-gradient-to-br ${getBookColor(book.title)}
          shadow-lg group-hover:shadow-2xl group-hover:shadow-black/25 
          transition-all duration-300
          border-2 border-white dark:border-gray-200
          relative overflow-hidden
        `}>
          {/* Book Spine Effect */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-black bg-opacity-20" />
          
          {/* Book Content */}
          <div className="p-6 h-full flex flex-col text-white">
            <div className="flex-1">
              <h3 className="font-bold text-base leading-tight mb-3 line-clamp-4 min-h-[4rem]">
                {book.title}
              </h3>
              <p className="text-white/80 text-sm font-medium line-clamp-2">
                {book.author}
              </p>
            </div>
            
            {/* Bottom Info */}
            <div className="mt-auto">
              <div className="flex items-center text-white/70 text-xs">
                <Quote className="w-3 h-3 mr-1" />
                <span>{highlightCount} highlights</span>
              </div>
            </div>
          </div>

          {/* Shine Effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/0 via-white/10 to-white/0 pointer-events-none" />
          
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Book Shadow */}
        <div className="absolute -bottom-2 left-2 right-0 h-2 bg-black/20 rounded-xl blur-sm transform perspective-100 rotateX-45" />
      </div>

      {/* Book Info Below */}
      <div className="mt-6 px-2">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {book.title}
        </h4>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-1">
          by {book.author}
        </p>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Added {formatDate(book.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}