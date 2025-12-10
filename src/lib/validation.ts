export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate password against requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Heslo musí mít alespoň 8 znaků')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jedno velké písmeno')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jedno malé písmeno')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Heslo musí obsahovat alespoň jedno číslo')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Check if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Simple validation helpers for quick checks
 * For form validation with detailed error messages, use Zod schemas from @/lib/schemas
 * 
 * These helpers are useful for:
 * - Quick boolean checks in conditional logic
 * - Pre-validation before Zod parsing
 * - Simple utility functions
 */

/**
 * Validate UUID format
 * For form validation, use z.string().uuid() from Zod instead
 */
export function isValidUUID(str: string): boolean {
  if (!str || typeof str !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str.trim())
}

/**
 * Validate URL format
 * For form validation, use z.string().url() from Zod instead
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    const urlObj = new URL(url.trim())
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validate Vimeo URL format
 * For form validation, use the vimeoUrlSchema from @/lib/schemas/lesson.schema instead
 */
export function isValidVimeoUrl(url: string): boolean {
  if (!isValidUrl(url)) return false
  const vimeoRegex = /^https?:\/\/(www\.)?(vimeo\.com|player\.vimeo\.com)/
  return vimeoRegex.test(url.trim())
}


