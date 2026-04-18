'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUploader from '@/components/FileUploader'
import ThemeToggle from '@/components/ThemeToggle'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const handleUploadSuccess = () => router.push('/dashboard')

  return (
    <div className="min-h-screen">
      {/* Masthead */}
      <header className="border-b border-[color:var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-widest text-[color:var(--fg)]"
          >
            Kindle Highlights
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-mono uppercase tracking-widest text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
            >
              Library →
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        {/* Hero */}
        <section className="grid md:grid-cols-12 gap-10 md:gap-12 items-start">
          <div className="md:col-span-7">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
              001 · A reader&apos;s library
            </p>
            <h1 className="mt-5 text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-[color:var(--fg)]">
              Every sentence you{' '}
              <span className="highlighter">marked</span>,
              <br className="hidden md:block" /> in one place.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[color:var(--muted)] max-w-xl">
              Upload your Kindle <span className="font-mono text-[color:var(--fg)]">clippings.txt</span> and
              the app sorts your highlights by book, keeps a running count, and
              lets you search every passage you&apos;ve ever saved.
            </p>
            <div className="mt-10 flex items-center gap-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[color:var(--fg)] text-[color:var(--bg)] px-5 py-3 text-sm font-medium hover:bg-[color:var(--accent-strong)] hover:text-[color:var(--fg)] transition-colors"
              >
                Open library
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <a
                href="#upload"
                className="text-sm text-[color:var(--fg)] underline underline-offset-4 decoration-[color:var(--accent-strong)] decoration-2 hover:text-[color:var(--accent-strong)] transition-colors"
              >
                Upload a file
              </a>
            </div>
          </div>

          <aside
            id="upload"
            className="md:col-span-5 md:sticky md:top-10 border border-[color:var(--border)] bg-[color:var(--surface)] p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
                Upload
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--subtle)]">
                .txt · 10 MB
              </p>
            </div>
            <FileUploader onUploadSuccess={handleUploadSuccess} />
          </aside>
        </section>

        {/* Features — three text rows on a shared baseline */}
        <section className="mt-32 md:mt-40 grid md:grid-cols-3 gap-10 md:gap-12">
          {[
            {
              num: '01',
              title: 'Parses quietly',
              body: 'Drop the file from your Kindle and the app reads Highlights, Bookmarks, and Notes. Duplicates are ignored at the database level.',
            },
            {
              num: '02',
              title: 'Groups by book',
              body: 'Deep reads (six highlights or more) sit above lighter picks. A running total tells you how much you\u2019ve marked.',
            },
            {
              num: '03',
              title: 'Searches everything',
              body: 'Look inside one book or across the whole library. Results stream from the server as you type.',
            },
          ].map((f) => (
            <div key={f.num} className="border-t border-[color:var(--fg)] pt-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
                {f.num}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-[color:var(--fg)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)] leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </section>

        {/* How-to — editorial two-column */}
        <section className="mt-32 md:mt-40 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
              Setup
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--fg)] leading-snug">
              Finding <span className="font-mono">My&nbsp;Clippings.txt</span> on
              your Kindle.
            </h2>
          </div>
          <ol className="md:col-span-8 space-y-6">
            {[
              {
                step: '01',
                body: 'Connect your Kindle to your computer with a USB cable.',
              },
              {
                step: '02',
                body: 'Open the Kindle drive and navigate into the documents folder.',
              },
              {
                step: '03',
                body: 'Find the file named My Clippings.txt and drop it above.',
              },
            ].map((s) => (
              <li
                key={s.step}
                className="grid grid-cols-[auto_1fr] gap-6 items-baseline border-t border-[color:var(--border)] pt-5"
              >
                <span className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
                  {s.step}
                </span>
                <p className="text-[color:var(--fg)] leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="border-t border-[color:var(--border)] mt-32">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
          <span>Kindle Highlights Manager</span>
          <span>Local first · Yours</span>
        </div>
      </footer>
    </div>
  )
}
