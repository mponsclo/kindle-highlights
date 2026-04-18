import { Prisma } from '@prisma/client'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import BookCard from '@/components/BookCard'
import ThemeToggle from '@/components/ThemeToggle'
import DashboardSearch from './DashboardSearch'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

const DEEP_READ_THRESHOLD = 5

export default async function Dashboard({ searchParams }: PageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const where: Prisma.BookWhereInput = query
    ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          {
            highlights: {
              some: { content: { contains: query, mode: 'insensitive' } },
            },
          },
        ],
      }
    : {}

  const books = await prisma.book.findMany({
    where,
    include: { _count: { select: { highlights: true } } },
    orderBy: [{ highlights: { _count: 'desc' } }, { createdAt: 'desc' }],
  })

  const deepReads = books.filter((b) => b._count.highlights > DEEP_READ_THRESHOLD)
  const lightReads = books.filter((b) => b._count.highlights <= DEEP_READ_THRESHOLD)
  const totalHighlights = books.reduce((sum, b) => sum + b._count.highlights, 0)
  const hasResults = books.length > 0

  return (
    <div className="min-h-screen">
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
              href="/"
              className="text-xs font-mono uppercase tracking-widest text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
            >
              ← Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Masthead */}
        <section className="grid md:grid-cols-12 gap-6 md:gap-10 items-end mb-14">
          <div className="md:col-span-7">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
              Your library
            </p>
            <h1 className="mt-3 text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-[color:var(--fg)]">
              Everything you&apos;ve{' '}
              <span className="highlighter">marked</span>.
            </h1>
          </div>

          <dl className="md:col-span-5 grid grid-cols-3 border-t border-[color:var(--fg)] nums-tabular">
            <Stat label="Books" value={books.length} />
            <Stat label="Highlights" value={totalHighlights} divider />
            <Stat label="Deep reads" value={deepReads.length} divider />
          </dl>
        </section>

        <div className="mb-14 max-w-md">
          <DashboardSearch />
          {query && (
            <p className="mt-3 text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
              {books.length} {books.length === 1 ? 'result' : 'results'} for “{query}”
            </p>
          )}
        </div>

        {!hasResults ? (
          <div className="border-t border-[color:var(--border)] py-20 text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
              Nothing here
            </p>
            <p className="mt-3 text-lg text-[color:var(--fg)]">
              {query ? 'No books match your search.' : 'Your library is empty.'}
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              {query ? 'Try a shorter query.' : 'Head home and upload your clippings file.'}
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            {deepReads.length > 0 && (
              <Section
                eyebrow={`Deep reads · ${deepReads.length}`}
                subtitle={`Books with more than ${DEEP_READ_THRESHOLD} highlights`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
                  {deepReads.map((book) => (
                    <BookCard key={book.id} book={book} href={`/book/${book.id}`} />
                  ))}
                </div>
              </Section>
            )}

            {lightReads.length > 0 && (
              <Section
                eyebrow={`Light reading · ${lightReads.length}`}
                subtitle={`Books with ${DEEP_READ_THRESHOLD} or fewer highlights`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
                  {lightReads.map((book) => (
                    <BookCard key={book.id} book={book} href={`/book/${book.id}`} />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
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
      className={`px-4 py-4 ${divider ? 'border-l border-[color:var(--border)]' : ''}`}
    >
      <dt className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold text-[color:var(--fg)]">
        {value.toLocaleString()}
      </dd>
    </div>
  )
}

function Section({
  eyebrow,
  subtitle,
  children,
}: {
  eyebrow: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section>
      <header className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--muted)] nums-tabular">
          {eyebrow}
        </p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{subtitle}</p>
      </header>
      {children}
    </section>
  )
}
