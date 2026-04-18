import { describe, it, expect } from 'vitest'
import { parseKindleClippings } from './parser'

const SEP = '=========='

function section(title: string, metadata: string, body: string): string {
  return `${title}\n${metadata}\n\n${body}\n${SEP}\n`
}

describe('parseKindleClippings', () => {
  it('returns [] for empty input', () => {
    expect(parseKindleClippings('')).toEqual([])
  })

  it('returns [] when no sections contain "Your Highlight"', () => {
    const input = section(
      'Book (Author)',
      '- Your Bookmark on page 10 | Added on Monday, 1 January 2024 10:00:00',
      'some note',
    )
    expect(parseKindleClippings(input)).toEqual([])
  })

  it('parses a single highlight with page, location, and date', () => {
    const input = section(
      'Outlive (Peter Attia, MD)',
      '- Your Highlight on page 42 | location 1234-1236 | Added on Monday, 15 January 2024 10:00:00',
      'This is the highlight content',
    )

    const result = parseKindleClippings(input)
    expect(result).toHaveLength(1)

    const [book] = result
    expect(book.title).toBe('Outlive')
    expect(book.author).toBe('Peter Attia, MD')
    expect(book.highlights).toHaveLength(1)

    const [hl] = book.highlights
    expect(hl.content).toBe('This is the highlight content')
    expect(hl.page).toBe(42)
    expect(hl.location).toBe('1234-1236')
    expect(hl.dateAdded).toBeInstanceOf(Date)
    expect(hl.dateAdded?.getFullYear()).toBe(2024)
    expect(hl.dateAdded?.getMonth()).toBe(0)
    expect(hl.dateAdded?.getDate()).toBe(15)
  })

  it('merges multiple highlights for the same book', () => {
    const input =
      section(
        'Atomic Habits (James Clear)',
        '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
        'First highlight',
      ) +
      section(
        'Atomic Habits (James Clear)',
        '- Your Highlight on page 2 | location 20-22 | Added on Monday, 1 January 2024 11:00:00',
        'Second highlight',
      )

    const result = parseKindleClippings(input)
    expect(result).toHaveLength(1)
    expect(result[0].highlights).toHaveLength(2)
    expect(result[0].highlights.map((h) => h.content)).toEqual([
      'First highlight',
      'Second highlight',
    ])
  })

  it('groups books with underscore vs colon under one entry', () => {
    const input =
      section(
        'Sapiens_ A Brief History (Yuval Noah Harari)',
        '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
        'A',
      ) +
      section(
        'Sapiens: A Brief History (Yuval Noah Harari)',
        '- Your Highlight on page 2 | location 20-22 | Added on Monday, 1 January 2024 11:00:00',
        'B',
      )

    const result = parseKindleClippings(input)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Sapiens: A Brief History')
    expect(result[0].highlights.map((h) => h.content)).toEqual(['A', 'B'])
  })

  it('strips parenthetical suffixes from titles (e.g., "Spanish Edition")', () => {
    const input = section(
      'Meditations (Spanish Edition) (Marcus Aurelius)',
      '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
      'memento mori',
    )
    const result = parseKindleClippings(input)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Meditations')
    expect(result[0].author).toBe('Marcus Aurelius')
  })

  it('strips author duplicated after dash in title', () => {
    const input = section(
      'Outlive - Peter Attia (Peter Attia, MD)',
      '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
      'live longer',
    )
    const result = parseKindleClippings(input)
    expect(result[0].title).toBe('Outlive')
    expect(result[0].author).toBe('Peter Attia, MD')
  })

  it('skips sections with fewer than 3 lines', () => {
    const input = `Book (Author)\n- Your Highlight on page 1\n${SEP}\n`
    expect(parseKindleClippings(input)).toEqual([])
  })

  it('skips sections whose title line starts with "Your Highlight"', () => {
    const input = section(
      'Your Highlight appears here',
      '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
      'body',
    )
    expect(parseKindleClippings(input)).toEqual([])
  })

  it('keeps books without a trailing "(Author)" and tags them Unknown', () => {
    const input = section(
      'The 4-Hour Body  ',
      '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
      'body',
    )
    const result = parseKindleClippings(input)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('The 4-Hour Body')
    expect(result[0].author).toBe('Unknown')
  })

  it('strips a leading BOM (U+FEFF) from title lines', () => {
    const input = section(
      '\uFEFFThe 4-Hour Body',
      '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
      'body',
    )
    const result = parseKindleClippings(input)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('The 4-Hour Body')
  })

  it('leaves page and location undefined when metadata lacks them', () => {
    const input = section(
      'A Book (An Author)',
      '- Your Highlight | Added on Monday, 1 January 2024 10:00:00',
      'content',
    )
    const result = parseKindleClippings(input)
    const [hl] = result[0].highlights
    expect(hl.page).toBeUndefined()
    expect(hl.location).toBeUndefined()
  })

  it('parses the "Month Day, Year" date format', () => {
    const input = section(
      'A Book (An Author)',
      '- Your Highlight on page 5 | location 50-55 | Added on January 15, 2024',
      'content',
    )
    const [hl] = parseKindleClippings(input)[0].highlights
    expect(hl.dateAdded?.getFullYear()).toBe(2024)
    expect(hl.dateAdded?.getMonth()).toBe(0)
    expect(hl.dateAdded?.getDate()).toBe(15)
  })

  it('keeps duplicate highlights in the parser output (dedupe is the DB layer\'s job)', () => {
    const input =
      section(
        'A Book (An Author)',
        '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
        'same text',
      ) +
      section(
        'A Book (An Author)',
        '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
        'same text',
      )

    const [book] = parseKindleClippings(input)
    expect(book.highlights).toHaveLength(2)
  })
})
