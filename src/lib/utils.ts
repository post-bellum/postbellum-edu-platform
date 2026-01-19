import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString // Return original if invalid
    }
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function formatDateLong(dateString: string) {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString // Return original if invalid
    }
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

/**
 * Format date as short relative time (e.g., "2h", "3d")
 * Falls back to absolute date for dates older than 7 days
 */
export function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString // Return original if invalid
    }

    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    // Show short relative time for recent dates
    if (diffInMinutes < 1) {
      return 'teď'
    } else if (diffInMinutes < 60) {
      return `před ${diffInMinutes}m`
    } else if (diffInHours < 24) {
      return `před ${diffInHours}h`
    } else if (diffInDays < 7) {
      return `před ${diffInDays}d`
    }

    // Show absolute date for older dates
    return formatDate(dateString)
  } catch {
    return dateString
  }
}


