import { unstable_cache } from 'next/cache'
import { createPublicClient } from './public'
import { logger } from '@/lib/logger'
import { PAGE_DEFAULTS } from '@/lib/page-content/defaults'
import type {
  PageSlug,
  HomepageContent,
  AboutContent,
  TermsContent,
} from '@/types/page-content.types'

/**
 * Deep merge database content with defaults.
 * Database values take priority; defaults fill in any gaps.
 * Arrays are NOT deep-merged — the DB array replaces the default.
 */
export function deepMergeWithDefaults(
  defaults: Record<string, unknown>,
  overrides: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...defaults }

  for (const key of Object.keys(overrides)) {
    const override = overrides[key]
    const defaultVal = defaults[key]

    if (
      override !== null &&
      override !== undefined &&
      typeof override === 'object' &&
      !Array.isArray(override) &&
      typeof defaultVal === 'object' &&
      !Array.isArray(defaultVal) &&
      defaultVal !== null
    ) {
      result[key] = deepMergeWithDefaults(
        defaultVal as Record<string, unknown>,
        override as Record<string, unknown>
      )
    } else if (override !== undefined) {
      result[key] = override
    }
  }

  return result
}

/**
 * Internal fetch function (not cached).
 */
async function fetchPageContent<T extends HomepageContent | AboutContent | TermsContent>(
  pageSlug: PageSlug
): Promise<T> {
  try {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('page_content')
      .select('content')
      .eq('page_slug', pageSlug)
      .maybeSingle()

    if (error) {
      logger.error(`Error fetching page content for ${pageSlug}`, error)
      return PAGE_DEFAULTS[pageSlug] as T
    }

    if (!data?.content) {
      return PAGE_DEFAULTS[pageSlug] as T
    }

    return deepMergeWithDefaults(
      PAGE_DEFAULTS[pageSlug] as unknown as Record<string, unknown>,
      data.content as Record<string, unknown>
    ) as T
  } catch (error) {
    logger.error(`Error fetching page content for ${pageSlug}`, error)
    return PAGE_DEFAULTS[pageSlug] as T
  }
}

/**
 * Fetch page content with caching.
 * Cached indefinitely until revalidated by admin save via revalidateTag.
 * Users never wait for a DB query — content is served from cache.
 */
export async function getPageContent<T extends HomepageContent | AboutContent | TermsContent>(
  pageSlug: PageSlug
): Promise<T> {
  const getCached = unstable_cache(
    () => fetchPageContent<T>(pageSlug),
    [`page-content-${pageSlug}`],
    { tags: [`page-content-${pageSlug}`] }
  )

  return getCached()
}
