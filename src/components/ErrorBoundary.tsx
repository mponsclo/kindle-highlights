'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-[color:var(--border)] bg-[color:var(--surface)] p-8">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
              Error
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight">
              Something went wrong.
            </h2>
            <p className="mt-3 text-sm text-[color:var(--muted)] leading-relaxed">
              Your data is safe. Try again, or head back to the start.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-5 border border-[color:var(--border)] bg-[color:var(--bg)] p-3 text-xs">
                <summary className="cursor-pointer font-mono uppercase tracking-widest text-[color:var(--muted)]">
                  Dev details
                </summary>
                <pre className="mt-2 overflow-auto text-[color:var(--fg)] font-mono">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 bg-[color:var(--fg)] text-[color:var(--bg)] px-4 py-2 text-sm hover:bg-[color:var(--accent-strong)] hover:text-[color:var(--fg)] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                Try again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="inline-flex items-center gap-2 border border-[color:var(--border)] text-[color:var(--fg)] px-4 py-2 text-sm hover:bg-[color:var(--bg)] transition-colors"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
