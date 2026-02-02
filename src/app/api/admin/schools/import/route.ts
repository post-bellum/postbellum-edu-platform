import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/admin-helpers'
import { logger } from '@/lib/logger'

/**
 * Get schools registry URL from environment variable
 * Throws error if not configured
 */
function getSchoolsRegistryUrl(): string {
  const url = process.env.SCHOOLS_REGISTRY_URL
  if (!url) {
    throw new Error('SCHOOLS_REGISTRY_URL environment variable is required')
  }
  return url
}

interface SchoolAddress {
  ulice?: string
  cisloDomovni?: number
  typCislaDomovniho?: string
  cisloOrientacni?: number
  dodatekOrientacnihoCisla?: string | null
  obec?: string
  castObce?: string
  cisloObvoduPrahy?: string
  psc?: string
  kodRUIAN?: number
  okres?: string
  uzemiDleORP?: string
}

interface SchoolData {
  redIzo: string
  uplnyNazev: string
  adresa: SchoolAddress
}

interface SchoolsResponse {
  list: SchoolData[]
}

/**
 * POST /api/admin/schools/import
 * Import schools data from Czech Ministry of Education registry
 * Requires admin authentication
 */
export async function POST() {
  try {
    // Check admin access
    await requireAdmin()

    const supabase = createAdminClient()

    // Fetch schools data from registry
    const schoolsRegistryUrl: string = getSchoolsRegistryUrl()
    logger.info('Fetching schools data from registry...')
    const response = await fetch(schoolsRegistryUrl, {
      headers: {
        'Accept': 'application/ld+json, application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch schools data: ${response.status} ${response.statusText}`)
    }

    // Verify content type is JSON or JSON-LD
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json') && !contentType?.includes('application/ld+json')) {
      throw new Error(`Unexpected content type: ${contentType || 'unknown'}`)
    }

    const data: SchoolsResponse = await response.json()

    if (!data.list || !Array.isArray(data.list)) {
      throw new Error('Invalid data format: expected list array')
    }

    logger.info(`Processing ${data.list.length} schools...`)

    // Transform and prepare schools data
    const schoolsToInsert = data.list
      .filter((school) => school.redIzo && school.uplnyNazev && school.adresa)
      .map((school) => ({
        red_izo: school.redIzo,
        fullname: school.uplnyNazev,
        // Map address object to separate columns
        ulice: school.adresa.ulice || null,
        cislo_domovni: school.adresa.cisloDomovni || null,
        typ_cisla_domovniho: school.adresa.typCislaDomovniho || null,
        cislo_orientacni: school.adresa.cisloOrientacni || null,
        obec: school.adresa.obec || null,
        cast_obce: school.adresa.castObce || null,
        psc: school.adresa.psc || null,
        kod_ruian: school.adresa.kodRUIAN || null,
        okres: school.adresa.okres || null,
        uzemi_dle_orp: school.adresa.uzemiDleORP || null,
      }))

    if (schoolsToInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid schools found in data' },
        { status: 400 }
      )
    }

    // Process schools in batches to avoid timeout and memory issues
    const BATCH_SIZE = 500
    let totalImported = 0
    let totalProcessed = 0

    for (let i = 0; i < schoolsToInsert.length; i += BATCH_SIZE) {
      const batch = schoolsToInsert.slice(i, i + BATCH_SIZE)
      totalProcessed += batch.length

      logger.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} schools (${totalProcessed}/${schoolsToInsert.length})...`)

      // Use upsert to handle duplicates (based on red_izo)
      const { data: insertedData, error } = await supabase
        .from('schools')
        .upsert(batch, {
          onConflict: 'red_izo',
          ignoreDuplicates: false,
        })
        .select()

      if (error) {
        logger.error(`Error importing batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error)
        throw error
      }

      totalImported += insertedData?.length || 0
      logger.info(`Batch ${Math.floor(i / BATCH_SIZE) + 1} completed: ${insertedData?.length || 0} schools imported`)
    }

    logger.info(`Successfully imported ${totalImported} schools out of ${schoolsToInsert.length} total`)

    return NextResponse.json({
      success: true,
      imported: totalImported,
      total: schoolsToInsert.length,
      message: `Successfully imported ${totalImported} schools`,
    })
  } catch (error) {
    logger.error('Error in schools import:', error)

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to import schools',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
