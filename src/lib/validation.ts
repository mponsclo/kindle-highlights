import { AppError } from './utils'

export interface ValidationRule<T = any> {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: T) => boolean | string
}

export interface FileValidationOptions {
  maxSizeInMB: number
  allowedTypes: string[]
  allowedExtensions: string[]
}

export class Validator {
  static validateString(
    value: any, 
    fieldName: string, 
    rules: ValidationRule<string> = {}
  ): string {
    if (rules.required && (!value || typeof value !== 'string' || value.trim() === '')) {
      throw new AppError(`${fieldName} is required`, 'VALIDATION_ERROR', 400)
    }
    
    if (!value) return ''
    
    if (typeof value !== 'string') {
      throw new AppError(`${fieldName} must be a string`, 'VALIDATION_ERROR', 400)
    }
    
    const trimmed = value.trim()
    
    if (rules.minLength && trimmed.length < rules.minLength) {
      throw new AppError(
        `${fieldName} must be at least ${rules.minLength} characters`,
        'VALIDATION_ERROR',
        400
      )
    }
    
    if (rules.maxLength && trimmed.length > rules.maxLength) {
      throw new AppError(
        `${fieldName} must be at most ${rules.maxLength} characters`,
        'VALIDATION_ERROR',
        400
      )
    }
    
    if (rules.pattern && !rules.pattern.test(trimmed)) {
      throw new AppError(
        `${fieldName} has invalid format`,
        'VALIDATION_ERROR',
        400
      )
    }
    
    if (rules.custom) {
      const result = rules.custom(trimmed)
      if (typeof result === 'string') {
        throw new AppError(result, 'VALIDATION_ERROR', 400)
      }
      if (!result) {
        throw new AppError(`${fieldName} is invalid`, 'VALIDATION_ERROR', 400)
      }
    }
    
    return trimmed
  }
  
  static validateFile(file: File, options: FileValidationOptions): void {
    if (!file) {
      throw new AppError('File is required', 'VALIDATION_ERROR', 400)
    }
    
    // Check file size
    const maxSizeInBytes = options.maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      throw new AppError(
        `File size must be less than ${options.maxSizeInMB}MB`,
        'FILE_TOO_LARGE',
        400
      )
    }
    
    // Check file type
    const isValidType = options.allowedTypes.some(type => file.type === type)
    const isValidExtension = options.allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext.toLowerCase())
    )
    
    if (!isValidType && !isValidExtension) {
      throw new AppError(
        `File type not allowed. Allowed types: ${options.allowedExtensions.join(', ')}`,
        'INVALID_FILE_TYPE',
        400
      )
    }
  }
  
  static sanitizeHtml(input: string): string {
    // Basic HTML sanitization - in production, consider using a library like DOMPurify
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }
  
  static validateId(id: any, fieldName: string = 'ID'): string {
    if (!id || typeof id !== 'string') {
      throw new AppError(`${fieldName} is required and must be a string`, 'VALIDATION_ERROR', 400)
    }
    
    // Basic ID validation - adjust pattern based on your ID format
    const idPattern = /^[a-zA-Z0-9_-]+$/
    if (!idPattern.test(id)) {
      throw new AppError(`${fieldName} has invalid format`, 'VALIDATION_ERROR', 400)
    }
    
    return id
  }
  
  static validatePagination(
    page?: string | number | null, 
    limit?: string | number | null
  ): { page: number; limit: number } {
    let pageNum = 1
    let limitNum = 20
    
    if (page !== undefined && page !== null) {
      pageNum = typeof page === 'string' ? parseInt(page, 10) : page
      if (isNaN(pageNum) || pageNum < 1) {
        throw new AppError('Page must be a positive integer', 'VALIDATION_ERROR', 400)
      }
    }
    
    if (limit !== undefined && limit !== null) {
      limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new AppError('Limit must be between 1 and 100', 'VALIDATION_ERROR', 400)
      }
    }
    
    return { page: pageNum, limit: limitNum }
  }
}

// Specific validation schemas
export const BookValidation = {
  title: { required: true, minLength: 1, maxLength: 500 },
  author: { required: true, minLength: 1, maxLength: 200 }
}

export const HighlightValidation = {
  content: { required: true, minLength: 1, maxLength: 5000 },
  page: { custom: (value: number) => !isNaN(value) && value > 0 },
  location: { maxLength: 100 }
}

export const TagValidation = {
  name: { 
    required: true, 
    minLength: 1, 
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s-_]+$/
  },
  color: {
    required: true,
    pattern: /^#[0-9A-Fa-f]{6}$/
  }
}

export const FileValidationOptions = {
  kindleClippings: {
    maxSizeInMB: 10,
    allowedTypes: ['text/plain'],
    allowedExtensions: ['.txt']
  }
}