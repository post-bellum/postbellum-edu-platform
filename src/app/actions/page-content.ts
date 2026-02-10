'use server'

import { updateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/admin-helpers'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { pageContentSchemas } from '@/lib/schemas/page-content.schema'
import type { PageSlug, PageContent, PageContentRow } from '@/types/page-content.types'
import type { Json } from '@/types/database.types'

/**
 * Get page content for admin editing (returns raw DB content, no merging with defaults)
 */
export async function getPageContentForAdmin(pageSlug: PageSlug): Promise<{
  success: boolean
  data?: PageContentRow | null
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .eq('page_slug', pageSlug)
      .maybeSingle()

    if (error) {
      logger.error(`Error fetching page content for admin: ${pageSlug}`, error)
      return { success: false, error: 'Chyba při načítání obsahu stránky' }
    }

    return { success: true, data: data as PageContentRow | null }
  } catch (error) {
    logger.error('Error in getPageContentForAdmin', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při načítání',
    }
  }
}

/**
 * Save page content (upsert — insert if missing, update if exists)
 */
export async function savePageContent(
  pageSlug: PageSlug,
  content: PageContent
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await requireAdmin()

    // Validate content with the appropriate schema
    const schema = pageContentSchemas[pageSlug]
    const result = schema.safeParse(content)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data',
      }
    }

    // Get current user ID for audit
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()

    // Use admin client for the write (bypasses RLS for upsert)
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('page_content')
      .upsert(
        {
          page_slug: pageSlug,
          content: result.data as unknown as Json,
          updated_by: user?.id || null,
        },
        { onConflict: 'page_slug' }
      )

    if (error) {
      logger.error(`Error saving page content for ${pageSlug}`, error)
      return { success: false, error: 'Chyba při ukládání obsahu' }
    }

    // Revalidate the cached content for this page
    updateTag(`page-content-${pageSlug}`)

    return { success: true }
  } catch (error) {
    logger.error('Error in savePageContent', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při ukládání',
    }
  }
}
