'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploaderProps {
  onUploadSuccess?: () => void
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileUpload = async (file: File) => {
    // Client-side validation
    if (!file.name.endsWith('.txt')) {
      setResult({ error: 'Please upload a .txt file' })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setResult({ error: 'File size must be less than 10MB' })
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

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult(data)
        onUploadSuccess?.()
      } else {
        setResult({ 
          error: data.error || 'Upload failed',
          code: data.code 
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setResult({ 
        error: 'Network error occurred. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
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
    <div className="w-full max-w-md mx-auto">
      <div
        className={`group relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragOver
            ? 'border-blue-400 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-500 scale-105 shadow-lg shadow-blue-500/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50/50 dark:hover:bg-slate-700/30'
        } ${uploading ? 'pointer-events-none' : 'cursor-pointer'}`}
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
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-4"
        >
          {uploading ? (
            <>
              <div className="relative">
                <div className="animate-spin w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-3 border-blue-200 dark:border-blue-800 rounded-full" />
              </div>
              <p className="text-blue-600 dark:text-blue-400 font-medium">Processing your file...</p>
            </>
          ) : (
            <>
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  dragOver 
                    ? 'bg-blue-500 shadow-lg shadow-blue-500/30' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:scale-110'
                }`}>
                  <Upload className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-blue-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-all duration-300 blur-xl" />
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-lg">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    Choose your Kindle clippings file
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">or drag and drop it here</p>
                
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500 pt-2">
                  <FileText className="w-4 h-4" />
                  <span>Only .txt files • Max 10MB</span>
                </div>
              </div>
            </>
          )}
        </label>
      </div>

      {result && (
        <div className="mt-6 animate-in fade-in duration-300">
          {result.error ? (
            <div className="flex items-start space-x-3 text-red-700 dark:text-red-400 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200 dark:border-red-800/50 p-4 rounded-2xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Upload failed</p>
                <p className="text-sm opacity-90">{result.error}</p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800/50 p-6 rounded-2xl">
              <div className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-400 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{result.message}</p>
                  <p className="text-sm opacity-80">Your highlights are now ready to explore!</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/60 dark:bg-slate-800/40 rounded-xl p-3">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {result.stats.totalHighlights}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Highlights
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/40 rounded-xl p-3">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {result.stats.newBooks}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    New Books
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/40 rounded-xl p-3">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {result.stats.totalBooks}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Total Books
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}