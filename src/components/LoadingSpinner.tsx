'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}

const sizeVariants = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

export default function LoadingSpinner({ 
  size = 'md', 
  className,
  label = 'Loading...'
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2" role="status" aria-label={label}>
      <div 
        className={cn(
          'animate-spin border-2 border-blue-500 border-t-transparent rounded-full',
          sizeVariants[size],
          className
        )}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {label}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
      <LoadingSpinner size="xl" label={message} />
    </div>
  )
}

export function LoadingCard({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 flex items-center justify-center">
      <LoadingSpinner size="lg" label={message} />
    </div>
  )
}