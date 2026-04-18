'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/lib/hooks'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  className?: string
  debounceMs?: number
  defaultValue?: string
}

export default function SearchBar({
  placeholder = 'Search highlights, books, or authors...',
  onSearch,
  className = '',
  debounceMs = 300,
  defaultValue = ''
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const debouncedQuery = useDebounce(query, debounceMs)

  // Call onSearch when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  const handleClear = useCallback(() => {
    setQuery('')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }, [handleClear])

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          className="
            w-full pl-12 pr-12 py-3.5 
            bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
            border border-gray-200/60 dark:border-gray-700/60
            rounded-2xl shadow-sm
            text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/60 dark:focus:border-blue-400/60
            focus:bg-white dark:focus:bg-slate-800
            hover:border-gray-300 dark:hover:border-gray-600
            transition-all duration-200 outline-none
          "
        />
        {query && (
          <button
            onClick={handleClear}
            className="
              absolute right-4 top-1/2 transform -translate-y-1/2 
              text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300
              w-5 h-5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50
              transition-all duration-200 flex items-center justify-center
            "
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Focus glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl" />
      </div>
    </div>
  )
}