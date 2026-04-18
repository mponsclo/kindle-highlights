import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

type MockTx = {
  book: {
    findFirst: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  highlight: {
    createMany: ReturnType<typeof vi.fn>
  }
}

const mockTx: MockTx = {
  book: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  highlight: {
    createMany: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(async (fn: (tx: MockTx) => unknown) => fn(mockTx)),
  },
}))

// Imported AFTER vi.mock so the route picks up the mocked prisma client.
const { POST } = await import('./route')

function makeRequest(body: FormData): NextRequest {
  return new Request('http://localhost/api/upload', {
    method: 'POST',
    body,
  }) as unknown as NextRequest
}

function makeUploadRequest(content: string, filename = 'clippings.txt'): NextRequest {
  const fd = new FormData()
  fd.append('file', new File([content], filename, { type: 'text/plain' }))
  return makeRequest(fd)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/upload', () => {
  it('rejects requests with no file', async () => {
    const res = await POST(makeRequest(new FormData()))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('NO_FILE')
    expect(json.success).toBe(false)
  })

  it('rejects empty files', async () => {
    // An empty .txt file trips file validation ("File is required" for 0 bytes)
    // or EMPTY_FILE after body read — either way it's a 400 with success:false.
    const res = await POST(makeUploadRequest(''))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('rejects files with no recognizable highlights', async () => {
    const res = await POST(makeUploadRequest('garbage without any kindle structure'))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('NO_HIGHLIGHTS_FOUND')
  })

  it('creates a new book and inserts its highlights', async () => {
    const clippings = [
      'Atomic Habits (James Clear)',
      '- Your Highlight on page 12 | location 100-105 | Added on Monday, 1 January 2024 10:00:00',
      '',
      'The best way to improve habits',
      '==========',
      '',
    ].join('\n')

    mockTx.book.findFirst.mockResolvedValue(null)
    mockTx.book.findMany.mockResolvedValue([])
    mockTx.book.create.mockResolvedValue({
      id: 'book-1',
      title: 'Atomic Habits',
      author: 'James Clear',
      createdAt: new Date(),
    })
    mockTx.highlight.createMany.mockResolvedValue({ count: 1 })

    const res = await POST(makeUploadRequest(clippings))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.stats).toMatchObject({
      newBooks: 1,
      existingBooks: 0,
      totalHighlights: 1,
      skippedHighlights: 0,
      totalBooks: 1,
    })

    expect(mockTx.book.create).toHaveBeenCalledWith({
      data: { title: 'Atomic Habits', author: 'James Clear' },
    })
    expect(mockTx.highlight.createMany).toHaveBeenCalledTimes(1)
    const call = mockTx.highlight.createMany.mock.calls[0][0]
    expect(call.skipDuplicates).toBe(true)
    expect(call.data).toHaveLength(1)
    expect(call.data[0]).toMatchObject({
      content: 'The best way to improve habits',
      page: 12,
      location: '100-105',
      bookId: 'book-1',
    })
  })

  it('dedupes identical highlights within a single upload before insert', async () => {
    const section = (body: string) =>
      [
        'Book Title (Some Author)',
        '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
        '',
        body,
        '==========',
        '',
      ].join('\n')

    // Three sections, two of them identical.
    const clippings = section('same text') + section('same text') + section('different text')

    mockTx.book.findFirst.mockResolvedValue(null)
    mockTx.book.findMany.mockResolvedValue([])
    mockTx.book.create.mockResolvedValue({
      id: 'book-1',
      title: 'Book Title',
      author: 'Some Author',
      createdAt: new Date(),
    })
    mockTx.highlight.createMany.mockResolvedValue({ count: 2 })

    const res = await POST(makeUploadRequest(clippings))
    expect(res.status).toBe(200)

    // The intra-batch dedupe dropped one duplicate BEFORE reaching the DB,
    // so createMany sees 2 rows, not 3.
    const call = mockTx.highlight.createMany.mock.calls[0][0]
    expect(call.data).toHaveLength(2)
    expect(call.data.map((r: { content: string }) => r.content).sort()).toEqual([
      'different text',
      'same text',
    ])
  })

  it('reuses an existing book (found via exact title match) instead of creating one', async () => {
    const clippings = [
      'Atomic Habits (James Clear)',
      '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
      '',
      'content',
      '==========',
      '',
    ].join('\n')

    mockTx.book.findFirst.mockResolvedValue({
      id: 'existing-book',
      title: 'Atomic Habits',
      author: 'James Clear',
      createdAt: new Date(),
    })
    mockTx.highlight.createMany.mockResolvedValue({ count: 1 })

    const res = await POST(makeUploadRequest(clippings))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.stats.newBooks).toBe(0)
    expect(json.stats.existingBooks).toBe(1)
    expect(mockTx.book.create).not.toHaveBeenCalled()
    expect(mockTx.highlight.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ bookId: 'existing-book' })],
        skipDuplicates: true,
      }),
    )
  })

  it('reports DB-level skips (existing (bookId, content) rows) in stats', async () => {
    const clippings = [
      'Book (Author)',
      '- Your Highlight on page 1 | location 10-12 | Added on Monday, 1 January 2024 10:00:00',
      '',
      'unique',
      '==========',
      'Book (Author)',
      '- Your Highlight on page 2 | location 20-22 | Added on Monday, 1 January 2024 10:00:00',
      '',
      'already in db',
      '==========',
      '',
    ].join('\n')

    mockTx.book.findFirst.mockResolvedValue(null)
    mockTx.book.findMany.mockResolvedValue([])
    mockTx.book.create.mockResolvedValue({
      id: 'book-1',
      title: 'Book',
      author: 'Author',
      createdAt: new Date(),
    })
    // 2 rows submitted, DB inserts 1 — the other hit @@unique and was skipped.
    mockTx.highlight.createMany.mockResolvedValue({ count: 1 })

    const res = await POST(makeUploadRequest(clippings))
    const json = await res.json()
    expect(json.stats.totalHighlights).toBe(1)
    expect(json.stats.skippedHighlights).toBe(1)
  })
})
