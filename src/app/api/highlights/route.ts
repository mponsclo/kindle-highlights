import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Validator } from '@/lib/validation'
import { AppError, handleApiError } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const bookId = searchParams.get('bookId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Prisma.HighlightWhereInput = {}

    if (bookId) {
      where.bookId = bookId
      if (search) {
        where.content = { contains: search, mode: 'insensitive' }
      }
    } else if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { book: { title: { contains: search, mode: 'insensitive' } } },
        { book: { author: { contains: search, mode: 'insensitive' } } },
      ]
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
      success: true,
      highlights,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Highlights API error:', error)

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code, success: false },
        { status: error.statusCode }
      )
    }

    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { error: message, code, success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    Validator.validateId(id, 'Highlight ID')

    await prisma.highlight.delete({
      where: { id: id! },
    })

    return NextResponse.json({ success: true, message: 'Highlight deleted successfully' })
  } catch (error) {
    console.error('Highlights DELETE error:', error)

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code, success: false },
        { status: error.statusCode }
      )
    }

    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { error: message, code, success: false },
      { status: 500 }
    )
  }
}
