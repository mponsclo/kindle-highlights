import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  truncateText,
  getInitials,
  sanitizeFilename,
  debounce,
  AppError,
  handleApiError,
} from './utils'

describe('cn', () => {
  it('merges class names and dedupes conflicting Tailwind utilities', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe('text-sm font-bold')
  })
})

describe('truncateText', () => {
  it('returns input unchanged when shorter than maxLength', () => {
    expect(truncateText('short', 20)).toBe('short')
  })

  it('truncates and appends "..." at a word boundary', () => {
    expect(truncateText('one two three four', 10)).toBe('one two...')
  })
})

describe('getInitials', () => {
  it('returns up to two uppercase initials', () => {
    expect(getInitials('peter attia')).toBe('PA')
    expect(getInitials('yuval noah harari')).toBe('YN')
    expect(getInitials('plato')).toBe('P')
  })
})

describe('sanitizeFilename', () => {
  it('replaces unsafe chars with underscores', () => {
    expect(sanitizeFilename('My Clippings!.txt')).toBe('My_Clippings_.txt')
  })

  it('preserves dots (note: does not defend against path traversal on its own)', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('.._.._etc_passwd')
  })

  it('strips leading/trailing underscores', () => {
    expect(sanitizeFilename('   hello   ')).toBe('hello')
  })
})

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('fires only once after rapid calls within the wait window', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes the latest arguments through', () => {
    const fn = vi.fn<(n: number) => void>()
    const debounced = debounce(fn, 50)
    debounced(1 as never)
    debounced(2 as never)
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledWith(2)
  })
})

describe('handleApiError', () => {
  it('preserves message + code from AppError', () => {
    const err = new AppError('nope', 'NOT_FOUND', 404)
    expect(handleApiError(err)).toEqual({ message: 'nope', code: 'NOT_FOUND' })
  })

  it('maps generic Error to UNKNOWN_ERROR', () => {
    expect(handleApiError(new Error('boom'))).toEqual({
      message: 'boom',
      code: 'UNKNOWN_ERROR',
    })
  })

  it('maps non-Error throws to a safe default', () => {
    expect(handleApiError('oops')).toEqual({
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    })
  })
})
