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
  placeholder = 'Search highlights, books, or authors',
  onSearch,
  className = '',
  debounceMs = 300,
  defaultValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const debouncedQuery = useDebounce(query, debounceMs)

  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  const handleClear = useCallback(() => setQuery(''), [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') handleClear()
    },
    [handleClear],
  )

  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-10 pl-10 pr-9 bg-[color:var(--surface)] border border-[color:var(--border)] text-sm text-[color:var(--fg)] placeholder:text-[color:var(--subtle)] focus:border-[color:var(--accent-strong)] focus:outline-none transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 text-[color:var(--muted)] hover:text-[color:var(--fg)] flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
