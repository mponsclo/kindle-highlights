import { describe, it, expect } from 'vitest'
import { Validator, FileValidationOptions } from './validation'
import { AppError } from './utils'

describe('Validator.validateString', () => {
  it('throws when required field is empty', () => {
    expect(() => Validator.validateString('', 'Title', { required: true })).toThrow(AppError)
    expect(() => Validator.validateString('   ', 'Title', { required: true })).toThrow(AppError)
    expect(() => Validator.validateString(null, 'Title', { required: true })).toThrow(AppError)
  })

  it('returns empty string when not required and value missing', () => {
    expect(Validator.validateString(undefined, 'Title')).toBe('')
  })

  it('throws on non-string input', () => {
    expect(() => Validator.validateString(42, 'Title')).toThrow(AppError)
  })

  it('trims the returned value', () => {
    expect(Validator.validateString('  hello  ', 'Title')).toBe('hello')
  })

  it('enforces maxLength against the trimmed value', () => {
    expect(() =>
      Validator.validateString('x'.repeat(11), 'Title', { maxLength: 10 }),
    ).toThrow(/at most 10/)
  })

  it('enforces minLength against the trimmed value', () => {
    expect(() =>
      Validator.validateString('ab', 'Title', { minLength: 3 }),
    ).toThrow(/at least 3/)
  })

  it('enforces pattern', () => {
    expect(() =>
      Validator.validateString('nope!', 'Slug', { pattern: /^[a-z-]+$/ }),
    ).toThrow(/invalid format/)
    expect(Validator.validateString('ok-slug', 'Slug', { pattern: /^[a-z-]+$/ })).toBe('ok-slug')
  })
})

describe('Validator.validateId', () => {
  it('accepts cuid-like and alphanumeric ids', () => {
    expect(Validator.validateId('clxyz_123-abc')).toBe('clxyz_123-abc')
  })

  it('rejects missing or non-string ids', () => {
    expect(() => Validator.validateId(undefined)).toThrow(AppError)
    expect(() => Validator.validateId(123)).toThrow(AppError)
  })

  it('rejects ids with invalid characters', () => {
    expect(() => Validator.validateId("bobby'; DROP TABLE--")).toThrow(/invalid format/)
  })
})

describe('Validator.validatePagination', () => {
  it('defaults to page=1, limit=20', () => {
    expect(Validator.validatePagination()).toEqual({ page: 1, limit: 20 })
  })

  it('parses string inputs', () => {
    expect(Validator.validatePagination('3', '50')).toEqual({ page: 3, limit: 50 })
  })

  it('rejects non-positive pages', () => {
    expect(() => Validator.validatePagination('0')).toThrow(AppError)
    expect(() => Validator.validatePagination('-5')).toThrow(AppError)
  })

  it('clamps limit to [1, 100]', () => {
    expect(() => Validator.validatePagination('1', '101')).toThrow(AppError)
    expect(() => Validator.validatePagination('1', '0')).toThrow(AppError)
  })

  it('rejects non-numeric page/limit', () => {
    expect(() => Validator.validatePagination('abc')).toThrow(AppError)
  })
})

function mockFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type })
}

describe('Validator.validateFile', () => {
  const opts = FileValidationOptions.kindleClippings

  it('accepts a valid .txt file under the size limit', () => {
    expect(() =>
      Validator.validateFile(mockFile('My Clippings.txt', 'text/plain', 1024), opts),
    ).not.toThrow()
  })

  it('rejects files larger than maxSizeInMB', () => {
    expect(() =>
      Validator.validateFile(
        mockFile('big.txt', 'text/plain', (opts.maxSizeInMB + 1) * 1024 * 1024),
        opts,
      ),
    ).toThrow(/File size must be less than/)
  })

  it('rejects files with a disallowed extension and mimetype', () => {
    expect(() =>
      Validator.validateFile(mockFile('evil.exe', 'application/octet-stream', 100), opts),
    ).toThrow(/File type not allowed/)
  })

  it('accepts by extension when mimetype is empty (browser quirk)', () => {
    expect(() =>
      Validator.validateFile(mockFile('clippings.txt', '', 100), opts),
    ).not.toThrow()
  })
})
