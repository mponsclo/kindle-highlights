'use client'

import { useRouter } from 'next/navigation'
import FileUploader from '@/components/FileUploader'
import ThemeToggle from '@/components/ThemeToggle'
import { BookOpen, Upload, Search, Tag, Sparkles } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const handleUploadSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <BookOpen className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Kindle Highlights
                </h1>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-1">
                  Manager
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your Kindle clippings into a beautiful, organized library. 
            Upload your clippings.txt file and discover your reading insights with our modern, intuitive interface.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Get Started
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your Kindle clippings file and watch the magic happen
            </p>
          </div>
          <FileUploader onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="group text-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-blue-400 w-20 h-20 rounded-2xl mx-auto opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Upload</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Simply drag and drop your Kindle clippings.txt file and let our intelligent parser do the work
            </p>
          </div>
          
          <div className="group text-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-110">
                <Search className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-emerald-400 w-20 h-20 rounded-2xl mx-auto opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Organize</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Powerful search and filtering across all your highlights, books, and authors
            </p>
          </div>
          
          <div className="group text-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
                <Tag className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-purple-400 w-20 h-20 rounded-2xl mx-auto opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Discover</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Browse your library in beautiful book cards and rediscover forgotten insights
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
            <span>View Library</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
          </button>
        </div>

        {/* Instructions Section */}
        <div className="mt-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            How to find your Kindle clippings file
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 text-lg font-bold w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Connect your Kindle to your computer via USB cable
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-800 dark:text-emerald-300 text-lg font-bold w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Navigate to the Kindle drive and open the "documents" folder
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-800 dark:text-purple-300 text-lg font-bold w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Find "My Clippings.txt" and upload it using the form above
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
