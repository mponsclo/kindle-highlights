'use client'

import { Highlight } from '@/lib/types'
import { BookOpen, MapPin, Calendar, Quote } from 'lucide-react'

interface HighlightCardProps {
  highlight: Highlight
  showBookInfo?: boolean
}

export default function HighlightCard({ highlight, showBookInfo = true }: HighlightCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return null
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {showBookInfo && highlight.book && (
        <div className="mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-start space-x-2">
            <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">
                {highlight.book.title}
              </h3>
              <p className="text-xs text-gray-500">by {highlight.book.author}</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Quote className="w-4 h-4 text-gray-300 absolute -top-1 -left-1" />
        <p className="text-gray-800 leading-relaxed pl-3">
          {highlight.content}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {highlight.page && (
          <div className="flex items-center space-x-1">
            <span>Page {highlight.page}</span>
          </div>
        )}
        
        {highlight.location && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>Loc {highlight.location}</span>
          </div>
        )}

        {highlight.dateAdded && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(highlight.dateAdded)}</span>
          </div>
        )}
      </div>

      {highlight.tags && highlight.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {highlight.tags.map((tagRelation) => (
            <span
              key={tagRelation.tagId}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${tagRelation.tag?.color}20`,
                color: tagRelation.tag?.color,
              }}
            >
              {tagRelation.tag?.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}