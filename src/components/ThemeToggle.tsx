'use client'

import { useTheme } from '@/lib/theme-context'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/60">
        <Sun className="w-4 h-4 text-gray-700" />
      </div>
    )
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  const currentTheme = themes.find(t => t.value === theme) || themes[2]
  const Icon = currentTheme.icon

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative p-2 rounded-xl transition-all duration-200 ease-out
          bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
          border border-gray-200/60 dark:border-gray-700/60
          hover:bg-white dark:hover:bg-gray-800
          hover:border-gray-300 dark:hover:border-gray-600
          hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40
          hover:scale-105 active:scale-95
          group
        "
        aria-label="Toggle theme"
      >
        <Icon className="w-4 h-4 text-gray-700 dark:text-gray-300 transition-transform duration-200 group-hover:rotate-12" />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="
            absolute right-0 top-12 z-50 min-w-[160px]
            bg-white/95 dark:bg-gray-800/95 backdrop-blur-md
            border border-gray-200/60 dark:border-gray-700/60
            rounded-xl shadow-2xl shadow-gray-200/40 dark:shadow-gray-900/60
            p-1 space-y-1
            animate-in slide-in-from-top-2 fade-in duration-200
          ">
            {themes.map((themeOption) => {
              const ThemeIcon = themeOption.icon
              const isSelected = theme === themeOption.value
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                    hover:scale-[1.02] active:scale-[0.98]
                  `}
                >
                  <ThemeIcon className={`w-4 h-4 ${isSelected ? 'scale-110' : ''} transition-transform duration-200`} />
                  <span>{themeOption.label}</span>
                  
                  {isSelected && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}