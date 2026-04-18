'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'

interface FileUploaderProps {
  onUploadSuccess?: () => void
}

interface UploadStats {
  totalHighlights: number
  newBooks: number
  existingBooks: number
  skippedHighlights: number
  totalBooks: number
}

interface UploadSuccess {
  success: true
  message: string
  stats: UploadStats
}

interface UploadFailure {
  success?: false
  error: string
  code?: string
}

type UploadResult = UploadSuccess | UploadFailure

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setResult({ error: 'Please upload a .txt file' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setResult({ error: 'File size must be less than 10 MB' })
      return
    }
    if (file.size === 0) {
      setResult({ error: 'File appears to be empty' })
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await response.json()

      if (response.ok && data.success) {
        setResult(data)
        onUploadSuccess?.()
      } else {
        setResult({ error: data.error || 'Upload failed', code: data.code })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setResult({
        error: 'Network error. Check your connection and try again.',
        code: 'NETWORK_ERROR',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={`relative block cursor-pointer border border-dashed transition-colors ${
          dragOver
            ? 'border-[color:var(--accent-strong)] bg-[color:var(--accent-tint)]'
            : 'border-[color:var(--border-strong)] hover:bg-[color:var(--surface)]'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          type="file"
          accept=".txt"
          onChange={handleFileSelect}
          className="sr-only"
          id="file-upload"
          disabled={uploading}
        />

        <div className="px-8 py-12 flex flex-col items-center text-center gap-3">
          {uploading ? (
            <>
              <div className="w-8 h-8 border border-[color:var(--border-strong)] border-t-[color:var(--accent-strong)] rounded-full animate-spin" />
              <p className="text-sm text-[color:var(--muted)] font-mono uppercase tracking-widest">
                Parsing…
              </p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-[color:var(--fg)]" strokeWidth={1.5} />
              <div className="text-sm">
                <span className="text-[color:var(--fg)] underline underline-offset-4 decoration-[color:var(--accent-strong)] decoration-2">
                  Choose a file
                </span>
                <span className="text-[color:var(--muted)]"> or drop it here</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[color:var(--subtle)]">
                <FileText className="w-3 h-3" strokeWidth={1.5} />
                <span>.txt · max 10 MB</span>
              </div>
            </>
          )}
        </div>
      </label>

      {result && (
        <div className="mt-4 animate-in">
          {'error' in result ? (
            <div className="flex items-start gap-3 border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
              <AlertCircle
                className="w-4 h-4 mt-0.5 flex-shrink-0 text-[color:var(--fg)]"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-medium text-[color:var(--fg)]">Upload failed</p>
                <p className="text-[color:var(--muted)]">{result.error}</p>
              </div>
            </div>
          ) : (
            <div className="border border-[color:var(--border)] bg-[color:var(--surface)]">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--border)]">
                <CheckCircle2 className="w-4 h-4 text-[color:var(--accent-strong)]" strokeWidth={1.5} />
                <p className="text-sm font-medium text-[color:var(--fg)]">{result.message}</p>
              </div>
              <dl className="grid grid-cols-3 nums-tabular">
                <Stat label="Highlights" value={result.stats.totalHighlights} />
                <Stat label="New books" value={result.stats.newBooks} divider />
                <Stat label="Total books" value={result.stats.totalBooks} divider />
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  divider = false,
}: {
  label: string
  value: number
  divider?: boolean
}) {
  return (
    <div
      className={`px-4 py-3 ${
        divider ? 'border-l border-[color:var(--border)]' : ''
      }`}
    >
      <dt className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
        {label}
      </dt>
      <dd className="text-xl text-[color:var(--fg)] mt-0.5">{value.toLocaleString()}</dd>
    </div>
  )
}
