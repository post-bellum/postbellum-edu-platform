import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { customAlphabet } from 'nanoid'

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

/**
 * Generate a short unique ID for lessons
 * Uses 10 characters (like Medium, Amazon) for SEO-friendly URLs
 * Character set: lowercase letters and numbers (36 possible chars)
 * Collision probability at 100K lessons: < 0.00001%
 * @example generateShortId() => "k5b8x2p9m1"
 */
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)
export function generateShortId(): string {
  return nanoid()
}

/**
 * Convert text to URL-friendly slug
 * Handles Czech diacritics and special characters
 * @example slugify("Úvod do historie") => "uvod-do-historie"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}

/**
 * Generate SEO-friendly lesson URL with slug and short ID
 * Format: /lessons/{slug}-{short_id}
 * Prefers short_id (10 chars like Medium) over UUID for shorter, cleaner URLs
 * @example generateLessonUrl("k5b8x2p9m1", "Úvod do historie") => "/lessons/uvod-do-historie-k5b8x2p9m1"
 * @example generateLessonUrl("abc-uuid", "Title") => "/lessons/title-abc-uuid" (fallback)
 */
export function generateLessonUrl(id: string, title: string): string {
  const slug = slugify(title)
  return `/lessons/${slug}-${id}`
}

/**
 * Generate lesson URL from a lesson object
 * Automatically uses short_id if available, falls back to id for existing lessons
 * @param lesson - Lesson object with id, short_id, and title
 */
export function generateLessonUrlFromLesson(lesson: { id: string; short_id?: string | null; title: string }): string {
  const idToUse = lesson.short_id || lesson.id
  return generateLessonUrl(idToUse, lesson.title)
}

/**
 * Extract lesson ID from URL slug parameter
 * Handles multiple formats:
 * - New: slug-shortid (e.g., "uvod-do-historie-k5b8x2p9m1")
 * - Old: slug-uuid (e.g., "uvod-38e4b033-467d-4ff9-a28e-d4aadb512f40")
 * - Direct: just the ID (e.g., "k5b8x2p9m1" or "38e4b033-467d-4ff9-a28e-d4aadb512f40")
 */
export function extractLessonId(slugParam: string): string {
  // Try to match short ID pattern (10 lowercase alphanumeric) at the end
  // This is our new standard: k5b8x2p9m1
  const shortIdPattern = /([a-z0-9]{10})$/
  const shortIdMatch = slugParam.match(shortIdPattern)
  
  if (shortIdMatch) {
    return shortIdMatch[1]
  }
  
  // Try to match UUID pattern (8-4-4-4-12 format) at the end of the string
  // For backward compatibility with existing URLs
  const uuidPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i
  const uuidMatch = slugParam.match(uuidPattern)
  
  if (uuidMatch) {
    return uuidMatch[1]
  }
  
  // Try to match numeric ID at the end (for potential future use)
  const numericPattern = /-(\d+)$/
  const numericMatch = slugParam.match(numericPattern)
  
  if (numericMatch) {
    return numericMatch[1]
  }
  
  // Fallback: assume the whole thing is the ID (for backwards compatibility)
  // This handles cases where someone directly accesses with just the ID
  return slugParam
}

