import { ParsedBook, ParsedHighlight } from './types'

function normalizeForMatching(title: string): string {
  // Normalize title for matching purposes - treat underscores and colons as equivalent
  // Also remove parentheses content for matching (like Spanish Edition, etc.)
  return title
    .replace(/[_:]/g, ':')
    .replace(/\s*\([^)]*\)\s*/g, '') // Remove parentheses content
    .toLowerCase()
    .trim()
}

function createNormalizedBookKey(title: string, author: string): string {
  return `${normalizeForMatching(title)}|${author.toLowerCase().trim()}`
}

export function parseKindleClippings(content: string): ParsedBook[] {
  const sections = content.split('==========').filter(section => section.trim())
  const bookMap = new Map<string, ParsedBook>()

  for (const section of sections) {
    const lines = section.trim().split('\n').filter(line => line.trim())
    
    if (lines.length < 3) continue

    const titleLine = lines[0].trim()
    if (!titleLine || titleLine.startsWith('Your Highlight')) continue

    const bookInfo = extractBookInfo(titleLine)
    if (!bookInfo) continue

    const metadataLine = lines[1]
    const contentLine = lines[2]

    const highlight = parseHighlightFromMetadata(metadataLine, contentLine)
    if (!highlight) continue

    // Use normalized key for matching to avoid duplicates
    const normalizedKey = createNormalizedBookKey(bookInfo.title, bookInfo.author)
    
    if (!bookMap.has(normalizedKey)) {
      bookMap.set(normalizedKey, {
        title: bookInfo.title, // Use the cleaned title with colons
        author: bookInfo.author,
        highlights: []
      })
    }

    bookMap.get(normalizedKey)!.highlights.push(highlight)
  }

  return Array.from(bookMap.values())
}

function extractBookInfo(titleLine: string): { title: string; author: string } | null {
  // Strip leading BOM/ZWNBSP (\uFEFF) that Kindle sometimes prepends to sections
  // and trim trailing whitespace (some exports pad titles with spaces).
  const cleaned = titleLine.replace(/^\uFEFF+/, '').trim()
  if (!cleaned) return null

  const match = cleaned.match(/^(.+?)\s*\(([^)]+)\)\s*$/)

  if (match) {
    const rawTitle = match[1].trim()
    const rawAuthor = match[2].trim()

    let title = rawTitle
    title = title.replace(/\s*\([^)]*\)\s*/g, '').trim()
    title = title.replace(/_/g, ':')

    // Handle cases where author info is duplicated in title
    // Example: "Outlive - Peter Attia, MD" should become just "Outlive"
    const dashMatch = title.match(/^(.+?)\s*[-–—]\s*(.+)$/)
    if (dashMatch) {
      const potentialTitle = dashMatch[1].trim()
      const potentialAuthor = dashMatch[2].trim()
      if (potentialAuthor.toLowerCase().includes(rawAuthor.toLowerCase().split(',')[0]) ||
          rawAuthor.toLowerCase().includes(potentialAuthor.toLowerCase().split(',')[0])) {
        title = potentialTitle
      }
    }

    let author = rawAuthor
    author = author.replace(/\s*\([^)]*\)\s*$/, '').trim()

    return {
      title: title || rawTitle,
      author: author || rawAuthor,
    }
  }

  // No "(Author)" suffix — common for Kindle store exports where the author
  // wasn't embedded in the title line. Keep the book rather than dropping all
  // its highlights.
  return { title: cleaned.replace(/_/g, ':'), author: 'Unknown' }
}

function parseHighlightFromMetadata(metadataLine: string, contentLine: string): ParsedHighlight | null {
  if (!contentLine || !metadataLine.includes('Your Highlight')) return null

  const content = contentLine.trim()
  if (!content) return null

  const highlight: ParsedHighlight = { content }

  const pageMatch = metadataLine.match(/page\s+(\d+)/)
  if (pageMatch) {
    highlight.page = parseInt(pageMatch[1], 10)
  }

  const locationMatch = metadataLine.match(/location\s+([\d-]+)/)
  if (locationMatch) {
    highlight.location = locationMatch[1]
  }

  const dateMatch = metadataLine.match(/Added on (.+?)(?:\s+\d{2}:\d{2}:\d{2})?$/)
  if (dateMatch) {
    const dateStr = dateMatch[1].trim()
    const parsedDate = parseDateString(dateStr)
    if (parsedDate) {
      highlight.dateAdded = parsedDate
    }
  }

  return highlight
}

function parseDateString(dateStr: string): Date | null {
  const formats = [
    /^(\w+),\s+(\d{1,2})\s+(\w+)\s+(\d{4})$/,
    /^(\d{1,2})\s+(\w+)\s+(\d{4})$/,
    /^(\w+)\s+(\d{1,2}),\s+(\d{4})$/
  ]

  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]

  for (const format of formats) {
    const match = dateStr.toLowerCase().match(format)
    if (match) {
      try {
        if (match.length === 5) {
          const day = parseInt(match[2], 10)
          const monthName = match[3].toLowerCase()
          const year = parseInt(match[4], 10)
          const month = monthNames.indexOf(monthName)
          
          if (month !== -1) {
            return new Date(year, month, day)
          }
        } else if (match.length === 4) {
          const day = parseInt(match[1], 10)
          const monthName = match[2].toLowerCase()
          const year = parseInt(match[3], 10)
          const month = monthNames.indexOf(monthName)
          
          if (month !== -1) {
            return new Date(year, month, day)
          }
        }
      } catch (error) {
        continue
      }
    }
  }

  const fallbackDate = new Date(dateStr)
  return isNaN(fallbackDate.getTime()) ? null : fallbackDate
}