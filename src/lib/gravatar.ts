import md5 from 'md5'

/**
 * Generate a Gravatar URL from an email address
 * @param email - User's email address
 * @param size - Avatar size in pixels (default: 80)
 * @param defaultImage - Default image type if no Gravatar exists
 * @returns Gravatar URL
 */
export function getGravatarUrl(
  email: string,
  size: number = 80,
  defaultImage: 'identicon' | 'mp' | 'retro' | 'robohash' | 'wavatar' = 'identicon'
): string {
  // Normalize email: trim whitespace and convert to lowercase
  const normalizedEmail = email.trim().toLowerCase()
  
  // Generate MD5 hash
  const hash = md5(normalizedEmail)
  
  // Build Gravatar URL with parameters
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`
}

/**
 * Check if user has a Gravatar account
 * @param email - User's email address
 * @returns Promise<boolean> - True if Gravatar exists, false otherwise
 */
export async function hasGravatar(email: string): Promise<boolean> {
  try {
    const url = getGravatarUrl(email, 80, 'mp')
    const response = await fetch(url + '&d=404')
    return response.status === 200
  } catch {
    return false
  }
}

