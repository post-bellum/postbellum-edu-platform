/**
 * Basic input sanitization to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return input
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  
  // Remove script-like patterns (improved)
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
  
  // Remove HTML entity encodings that could be used for XSS
  sanitized = sanitized
    .replace(/&#x[\da-f]+;/gi, '')
    .replace(/&#\d+;/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
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

