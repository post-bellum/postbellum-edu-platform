import { createClient } from './client'
import type { AutocompleteOption } from '@/components/ui/Autocomplete'
import { logger } from '@/lib/logger'

export interface School {
  schoolId: number
  'Plný název': string | null
  'Zkrácený název': string | null
  'Místo': string | null
  'Kraj': string | null
}

/**
 * Search schools by full name (Plný název)
 * @param query Search query string
 * @param limit Maximum number of results (default: 10)
 * @returns Array of autocomplete options
 */
export async function searchSchools(
  query: string,
  limit: number = 10
): Promise<AutocompleteOption[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('schools')
    .select(`schoolId, "Plný název", "Zkrácený název", "Místo", "Kraj"`)
    .ilike('Plný název', `%${query}%`)
    .order('Plný název', { ascending: true })
    .limit(limit)

  if (error) {
    logger.error('Error searching schools', error)
    throw error
  }

  if (!data) {
    return []
  }

  return data.map((school) => ({
    value: school.schoolId.toString(),
    label: school['Plný název'] || '',
    subtitle: [school['Místo'], school['Kraj']].filter(Boolean).join(', '),
  }))
}

/**
 * Get school by ID
 * @param schoolId School ID
 * @returns School data or null
 */
export async function getSchoolById(schoolId: number): Promise<School | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('schools')
    .select(`schoolId, "Plný název", "Zkrácený název", "Místo", "Kraj"`)
    .eq('schoolId', schoolId)
    .single()

  if (error) {
    logger.error('Error getting school', error)
    return null
  }

  return data
}

