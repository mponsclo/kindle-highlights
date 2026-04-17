import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Validator } from '@/lib/validation'
import { AppError, handleApiError } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const bookId = searchParams.get('bookId')
    const includeAllHighlights = searchParams.get('includeAll') === 'true'

    // Validate pagination parameters
    const { page, limit } = Validator.validatePagination(
      searchParams.get('page'),
      searchParams.get('limit')
    )

    const where: Prisma.BookWhereInput = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        {
          highlights: {
            some: {
              content: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ]
    }

    if (bookId) {
      // Validate book ID
      Validator.validateId(bookId, 'Book ID')
      where.id = bookId
    }

    // Get total count for pagination (only if not fetching specific book)
    const totalBooks = bookId ? 1 : await prisma.book.count({ where })
    const totalPages = Math.ceil(totalBooks / limit)
    const offset = bookId ? 0 : (page - 1) * limit

    const books = await prisma.book.findMany({
      where,
      include: {
        _count: {
          select: { highlights: true },
        },
        highlights: includeAllHighlights ? {
          orderBy: { createdAt: 'desc' },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
          ...(search && {
            where: {
              content: { contains: search, mode: 'insensitive' }
            }
          })
        } : {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: bookId ? 0 : offset,
      take: bookId ? undefined : limit,
    })

    if (bookId && books.length === 0) {
      throw new AppError('Book not found', 'BOOK_NOT_FOUND', 404)
    }

    return NextResponse.json({ 
      success: true,
      books,
      pagination: bookId ? undefined : {
        page,
        limit,
        total: totalBooks,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Books API error:', error)
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          success: false 
        },
        { status: error.statusCode }
      )
    }

    const { message, code } = handleApiError(error)
    return NextResponse.json(
      { 
        error: message, 
        code,
        success: false 
      },
      { status: 500 }
    )
  }
}