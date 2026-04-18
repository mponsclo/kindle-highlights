'use client'

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 bg-[color:var(--accent)] text-[color:var(--fg)] px-3 py-2 text-xs font-mono uppercase tracking-widest"
    >
      Skip to content
    </a>
  )
}
