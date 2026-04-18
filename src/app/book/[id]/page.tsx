import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BookDetailClient from './BookDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const book = await prisma.book.findUnique({
    where: { id },
    select: { title: true, author: true },
  })

  if (!book) {
    return { title: 'Book not found' }
  }

  const title = `${book.title} — ${book.author}`
  const description = `Highlights from ${book.title} by ${book.author}`
  return {
    title,
    description,
    openGraph: { title, description, type: 'book' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function BookDetailsPage({ params }: PageProps) {
  const { id } = await params
  const book = await prisma.book.findUnique({
    where: { id },
    include: { _count: { select: { highlights: true } } },
  })

  if (!book) notFound()

  return (
    <BookDetailClient
      book={{
        id: book.id,
        title: book.title,
        author: book.author,
        createdAt: book.createdAt.toISOString(),
        highlightCount: book._count.highlights,
      }}
    />
  )
}
