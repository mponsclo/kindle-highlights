import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const bookId = searchParams.get('bookId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { book: { title: { contains: search, mode: 'insensitive' } } },
        { book: { author: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (bookId) {
      where.bookId = bookId
    }

    const [highlights, total] = await Promise.all([
      prisma.highlight.findMany({
        where,
        include: {
          book: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.highlight.count({ where }),
    ])

    return NextResponse.json({
      highlights,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Error fetching highlights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Highlight ID is required' }, { status: 400 })
    }

    await prisma.highlight.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Highlight deleted successfully' })
  } catch (error) {
    console.error('Error deleting highlight:', error)
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    )
  }
}