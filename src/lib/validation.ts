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
    errors.push("Heslo musí mít alespoň 8 znaků")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Heslo musí obsahovat alespoň jedno velké písmeno")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Heslo musí obsahovat alespoň jedno malé písmeno")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Heslo musí obsahovat alespoň jedno číslo")
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


