/**
 * Basic input sanitization to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return input
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-like patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Trim whitespace
    .trim()
}

/**
 * Sanitize multiple inputs
 * @param inputs - Object with string values to sanitize
 * @returns Object with sanitized values
 */
export function sanitizeInputs<T extends Record<string, string | undefined | null>>(
  inputs: T
): T {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value as T[keyof T]
    }
  }
  
  return sanitized
}

