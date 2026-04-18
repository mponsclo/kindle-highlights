'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import SearchBar from '@/components/SearchBar'

export default function DashboardSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get('q') ?? ''

  const handleSearch = useCallback(
    (query: string) => {
      if (query === currentQuery) return
      const params = new URLSearchParams(searchParams)
      const trimmed = query.trim()
      if (trimmed) {
        params.set('q', trimmed)
      } else {
        params.delete('q')
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams, currentQuery],
  )

  return (
    <div className="max-w-md">
      <SearchBar
        onSearch={handleSearch}
        className="w-full"
        defaultValue={currentQuery}
      />
    </div>
  )
}
