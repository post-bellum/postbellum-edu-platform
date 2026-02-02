import { createClient } from './client'
import type { AutocompleteOption } from '@/components/ui/Autocomplete'
import { logger } from '@/lib/logger'

export interface School {
  id: string
  red_izo: string
  fullname: string
  ulice: string | null
  obec: string | null
  psc: string | null
}

/**
 * Search schools by full name, address, or city
 * @param query Search query string
 * @param limit Maximum number of results (default: 10)
 * @returns Array of autocomplete options
 */
export async function searchSchools(
  query: string,
  limit: number = 10
): Promise<AutocompleteOption[]> {
  const supabase = createClient()

  // Modern search: split into words and match each word (AND logic)
  // This allows "gymn karv" to find "Gymnázium Karviná"
  // Normalize: replace commas with spaces and normalize whitespace
  const normalizedQuery = query.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()
  
  // Split into individual words (filter out very short words)
  const searchWords = normalizedQuery.split(' ').filter(word => word.length > 1)
  
  let supabaseQuery = supabase
    .from('schools')
    .select('id, red_izo, fullname, ulice, obec, psc')

  if (searchWords.length === 0) {
    // Fallback: use the normalized search as-is
    const searchPattern = `%${normalizedQuery}%`
    supabaseQuery = supabaseQuery.ilike('fullname', searchPattern)
  } else if (searchWords.length === 1) {
    // Single word: search in all fields with OR
    const wordPattern = `%${searchWords[0]}%`
    supabaseQuery = supabaseQuery.or(
      `fullname.ilike.${wordPattern},ulice.ilike.${wordPattern},obec.ilike.${wordPattern},cast_obce.ilike.${wordPattern}`
    )
  } else {
    // Multiple words: use AND logic - each word must appear in fullname
    // Chain multiple ilike filters - Supabase combines them with AND
    searchWords.forEach((word) => {
      const wordPattern = `%${word}%`
      supabaseQuery = supabaseQuery.ilike('fullname', wordPattern)
    })
  }

  const { data, error } = await supabaseQuery
    .order('fullname', { ascending: true })
    .limit(limit)

  if (error) {
    logger.error('Error searching schools', error)
    throw error
  }

  if (!data) {
    return []
  }

  return data.map((school) => ({
    value: school.fullname,
    label: school.fullname,
    subtitle: [school.ulice, school.obec, school.psc].filter(Boolean).join(', '),
  }))
}

/**
 * Get school by ID
 * @param schoolId School ID (UUID)
 * @returns School data or null
 */
export async function getSchoolById(schoolId: string): Promise<School | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('schools')
    .select('id, red_izo, fullname, ulice, obec, psc')
    .eq('id', schoolId)
    .single()

  if (error) {
    logger.error('Error getting school', error)
    return null
  }

  return data
}

