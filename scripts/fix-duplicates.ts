import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface BookGroup {
  normalizedKey: string
  books: Array<{
    id: string
    title: string
    author: string
    highlightCount: number
  }>
}

function normalizeTitle(title: string): string {
  // Convert both underscores and colons to a consistent format for comparison
  // Also remove parentheses content for matching (like Spanish Edition, etc.)
  return title
    .replace(/[_:]/g, ':')
    .replace(/\s*\([^)]*\)\s*/g, '') // Remove parentheses content
    .toLowerCase()
    .trim()
}

function createBookKey(title: string, author: string): string {
  return `${normalizeTitle(title)}|${author.toLowerCase().trim()}`
}

async function findDuplicateBooks(): Promise<BookGroup[]> {
  const books = await prisma.book.findMany({
    include: {
      _count: {
        select: { highlights: true }
      }
    }
  })

  // Group books by normalized title+author key
  const bookGroups = new Map<string, BookGroup>()
  
  for (const book of books) {
    const normalizedKey = createBookKey(book.title, book.author)
    
    if (!bookGroups.has(normalizedKey)) {
      bookGroups.set(normalizedKey, {
        normalizedKey,
        books: []
      })
    }
    
    bookGroups.get(normalizedKey)!.books.push({
      id: book.id,
      title: book.title,
      author: book.author,
      highlightCount: book._count.highlights
    })
  }
  
  // Return only groups with duplicates
  return Array.from(bookGroups.values()).filter(group => group.books.length > 1)
}

async function mergeDuplicateBooks(duplicateGroups: BookGroup[]): Promise<void> {
  console.log(`Found ${duplicateGroups.length} groups of duplicate books`)
  
  for (const group of duplicateGroups) {
    console.log(`\nProcessing group: ${group.normalizedKey}`)
    console.log(`Books in group:`, group.books.map(b => `"${b.title}" (${b.highlightCount} highlights)`))
    
    // Sort books by highlight count (descending) and prefer cleaned titles (without parentheses)
    const sortedBooks = [...group.books].sort((a, b) => {
      // First, sort by highlight count (descending)
      if (b.highlightCount !== a.highlightCount) {
        return b.highlightCount - a.highlightCount
      }
      
      // If highlight counts are equal, prefer the cleaner title (without parentheses)
      const aHasParens = a.title.includes('(')
      const bHasParens = b.title.includes('(')
      
      if (aHasParens && !bHasParens) return 1  // Prefer b (no parens)
      if (!aHasParens && bHasParens) return -1 // Prefer a (no parens)
      
      return 0 // Keep original order if both have or don't have parens
    })
    
    const keepBook = sortedBooks[0]
    const booksToMerge = sortedBooks.slice(1)
    
    console.log(`Keeping: "${keepBook.title}" with ${keepBook.highlightCount} highlights`)
    console.log(`Merging: ${booksToMerge.map(b => `"${b.title}"`).join(', ')}`)
    
    // Clean up the title: replace underscores with colons and remove parentheses
    let updatedTitle = keepBook.title.replace(/_/g, ':')
    updatedTitle = updatedTitle.replace(/\s*\([^)]*\)\s*/g, '').trim()
    
    await prisma.$transaction(async (tx) => {
      // Update the title of the book we're keeping
      if (updatedTitle !== keepBook.title) {
        await tx.book.update({
          where: { id: keepBook.id },
          data: { title: updatedTitle }
        })
        console.log(`Updated title: "${keepBook.title}" -> "${updatedTitle}"`)
      }
      
      // Move all highlights from books to merge into the kept book
      for (const bookToMerge of booksToMerge) {
        await tx.highlight.updateMany({
          where: { bookId: bookToMerge.id },
          data: { bookId: keepBook.id }
        })
        
        // Delete the duplicate book
        await tx.book.delete({
          where: { id: bookToMerge.id }
        })
        
        console.log(`Merged "${bookToMerge.title}" into "${updatedTitle}"`)
      }
    })
  }
}

async function main() {
  try {
    console.log('🔍 Searching for duplicate books...')
    const duplicateGroups = await findDuplicateBooks()
    
    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicate books found!')
      return
    }
    
    console.log(`📚 Found ${duplicateGroups.length} groups of duplicate books`)
    
    // Show preview of what will be merged
    console.log('\n📋 Preview of changes:')
    for (const group of duplicateGroups) {
      const sortedBooks = [...group.books].sort((a, b) => b.highlightCount - a.highlightCount)
      const keepBook = sortedBooks[0]
      const mergeBooks = sortedBooks.slice(1)
      
      console.log(`\n  Group: ${group.normalizedKey}`)
      console.log(`    Keep: "${keepBook.title}" (${keepBook.highlightCount} highlights)`)
      console.log(`    Merge: ${mergeBooks.map(b => `"${b.title}" (${b.highlightCount} highlights)`).join(', ')}`)
    }
    
    console.log('\n🔧 Starting merge process...')
    await mergeDuplicateBooks(duplicateGroups)
    
    console.log('\n✅ Duplicate book merge completed successfully!')
    
    // Verify results
    const remainingDuplicates = await findDuplicateBooks()
    if (remainingDuplicates.length === 0) {
      console.log('✅ Verification: No duplicates remain')
    } else {
      console.log(`⚠️  Warning: ${remainingDuplicates.length} duplicate groups still exist`)
    }
    
  } catch (error) {
    console.error('❌ Error during duplicate book cleanup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { findDuplicateBooks, mergeDuplicateBooks, normalizeTitle, createBookKey }