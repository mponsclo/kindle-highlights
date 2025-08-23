import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseKindleClippings } from '@/lib/parser'
import { Validator, FileValidationOptions } from '@/lib/validation'
import { AppError, handleApiError } from '@/lib/utils'

function normalizeForMatching(title: string): string {
  // Normalize title for matching purposes - treat underscores and colons as equivalent
  // Also remove parentheses content for matching (like Spanish Edition, etc.)
  return title
    .replace(/[_:]/g, ':')
    .replace(/\s*\([^)]*\)\s*/g, '') // Remove parentheses content
    .toLowerCase()
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    // Extract and validate file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new AppError('No file provided', 'NO_FILE', 400)
    }

    // Validate file type and size
    Validator.validateFile(file, FileValidationOptions.kindleClippings)

    // Parse file content
    const content = await file.text()
    
    if (!content.trim()) {
      throw new AppError('File is empty', 'EMPTY_FILE', 400)
    }

    const parsedBooks = parseKindleClippings(content)

    if (parsedBooks.length === 0) {
      throw new AppError(
        'No valid highlights found in the file. Please check the file format.',
        'NO_HIGHLIGHTS_FOUND',
        400
      )
    }

    // Process books and highlights with transaction
    const result = await prisma.$transaction(async (tx) => {
      let totalHighlights = 0
      let newBooks = 0
      let existingBooks = 0
      let skippedHighlights = 0

      for (const parsedBook of parsedBooks) {
        // Validate book data
        const title = Validator.validateString(parsedBook.title, 'Book title', { 
          required: true, 
          maxLength: 500 
        })
        const author = Validator.validateString(parsedBook.author, 'Book author', { 
          required: true, 
          maxLength: 200 
        })

        // Find or create book using normalized matching
        // First, try to find with exact title match
        let book = await tx.book.findFirst({
          where: {
            title,
            author,
          },
        })

        // If not found, try to find with normalized title matching (underscore/colon equivalence)
        if (!book) {
          const allBooks = await tx.book.findMany({
            where: { author }
          })
          
          const normalizedNewTitle = normalizeForMatching(title)
          book = allBooks.find(b => normalizeForMatching(b.title) === normalizedNewTitle) || null
          
          // If we found a match with different formatting, update it to the new format
          if (book && book.title !== title) {
            book = await tx.book.update({
              where: { id: book.id },
              data: { title } // Update to the new colon format
            })
          }
        }

        if (!book) {
          book = await tx.book.create({
            data: { title, author },
          })
          newBooks++
        } else {
          existingBooks++
        }

        // Process highlights
        for (const highlight of parsedBook.highlights) {
          // Validate highlight content
          const content = Validator.validateString(highlight.content, 'Highlight content', {
            required: true,
            maxLength: 5000
          })

          // Check if highlight already exists
          const existingHighlight = await tx.highlight.findFirst({
            where: {
              bookId: book.id,
              content,
            },
          })

          if (!existingHighlight) {
            await tx.highlight.create({
              data: {
                content,
                page: highlight.page || null,
                location: highlight.location || null,
                dateAdded: highlight.dateAdded || null,
                bookId: book.id,
              },
            })
            totalHighlights++
          } else {
            skippedHighlights++
          }
        }
      }

      return {
        totalHighlights,
        newBooks,
        existingBooks,
        skippedHighlights,
        totalBooks: parsedBooks.length,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Upload completed successfully',
      stats: result,
    })

  } catch (error) {
    console.error('Upload error:', error)
    
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