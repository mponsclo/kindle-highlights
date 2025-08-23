export interface Book {
  id: string
  title: string
  author: string
  createdAt: Date
  highlights?: Highlight[]
}

export interface Highlight {
  id: string
  content: string
  page?: number | null
  location?: string | null
  dateAdded?: Date | null
  bookId: string
  createdAt: Date
  book?: Book
  tags?: HighlightTag[]
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
  highlights?: HighlightTag[]
}

export interface HighlightTag {
  highlightId: string
  tagId: string
  highlight?: Highlight
  tag?: Tag
}

export interface ParsedHighlight {
  content: string
  page?: number
  location?: string
  dateAdded?: Date
}

export interface ParsedBook {
  title: string
  author: string
  highlights: ParsedHighlight[]
}

export interface BookWithHighlights extends Book {
  highlights: Highlight[]
  _count?: {
    highlights: number
  }
}