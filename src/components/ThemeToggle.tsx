'use client'

import { useTheme } from '@/lib/theme-context'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 border border-[color:var(--border)] bg-[color:var(--surface)] flex items-center justify-center">
        <Sun className="w-4 h-4 text-[color:var(--muted)]" />
      </div>
    )
  }

  const current = THEMES.find((t) => t.value === theme) ?? THEMES[2]
  const Icon = current.icon

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="h-9 w-9 border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--fg)] hover:bg-[color:var(--accent-tint)] transition-colors flex items-center justify-center"
        aria-label="Toggle theme"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Icon className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-10 z-50 min-w-[150px] border border-[color:var(--border)] bg-[color:var(--surface)] p-1 animate-in fade-in duration-200"
          >
            {THEMES.map(({ value, label, icon: ThemeIcon }) => {
              const selected = theme === value
              return (
                <button
                  key={value}
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    setTheme(value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    selected
                      ? 'bg-[color:var(--accent-tint)] text-[color:var(--fg)]'
                      : 'text-[color:var(--fg)] hover:bg-[color:var(--bg)]'
                  }`}
                >
                  <ThemeIcon className="w-4 h-4" />
                  <span>{label}</span>
                  {selected && (
                    <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
                      on
                    </span>
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
