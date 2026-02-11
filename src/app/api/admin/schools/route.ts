import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/admin-helpers'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateSchoolSchema = z.object({
  id: z.string().uuid(),
  fullname: z.string().min(1).optional(),
  ulice: z.string().nullable().optional(),
  cislo_domovni: z.number().nullable().optional(),
  typ_cisla_domovniho: z.string().nullable().optional(),
  cislo_orientacni: z.number().nullable().optional(),
  obec: z.string().nullable().optional(),
  cast_obce: z.string().nullable().optional(),
  psc: z.string().nullable().optional(),
  kod_ruian: z.number().nullable().optional(),
  okres: z.string().nullable().optional(),
  uzemi_dle_orp: z.string().nullable().optional(),
})

const createSchoolSchema = z.object({
  red_izo: z.string().min(1),
  fullname: z.string().min(1),
  ulice: z.string().nullable().optional(),
  cislo_domovni: z.number().nullable().optional(),
  typ_cisla_domovniho: z.string().nullable().optional(),
  cislo_orientacni: z.number().nullable().optional(),
  obec: z.string().nullable().optional(),
  cast_obce: z.string().nullable().optional(),
  psc: z.string().nullable().optional(),
  kod_ruian: z.number().nullable().optional(),
  okres: z.string().nullable().optional(),
  uzemi_dle_orp: z.string().nullable().optional(),
})

/**
 * GET /api/admin/schools
 * Get all schools (paginated)
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = (page - 1) * limit
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('schools')
      .select('*', { count: 'exact' })
      .order('fullname', { ascending: true })
      .range(offset, offset + limit - 1)

    // Add search filter if provided
    if (search) {
      // Modern search: split into words and match each word (AND logic)
      // This allows "gymn karv" to find "Gymnázium Karviná"
      // Normalize: replace commas with spaces and normalize whitespace
      const normalizedSearch = search.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()
      
      // Split into individual words (filter out very short words)
      const searchWords = normalizedSearch.split(' ').filter(word => word.length > 1)
      
      if (searchWords.length === 0) {
        // Fallback: use the normalized search as-is
        const searchPattern = `%${normalizedSearch}%`
        query = query.ilike('fullname', searchPattern)
      } else if (searchWords.length === 1) {
        // Single word: search in all fields with OR
        const wordPattern = `%${searchWords[0]}%`
        query = query.or(
          `fullname.ilike.${wordPattern},ulice.ilike.${wordPattern},obec.ilike.${wordPattern},cast_obce.ilike.${wordPattern}`
        )
      } else {
        // Multiple words: use AND logic - each word must appear in fullname
        // Chain multiple ilike filters on fullname - Supabase combines them with AND
        // This allows "gymn karv" to match "Gymnázium Karviná"
        searchWords.forEach((word) => {
          const wordPattern = `%${word}%`
          query = query.ilike('fullname', wordPattern)
        })
      }
    }

    const { data, error, count } = await query

    if (error) {
      logger.error('Error fetching schools:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    logger.error('Error in GET schools:', error)

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch schools',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/schools
 * Create a new school
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validatedData = createSchoolSchema.parse(body)

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('schools')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      logger.error('Error creating school:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'School created successfully',
    })
  } catch (error) {
    logger.error('Error in POST schools:', error)

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create school',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/schools
 * Update an existing school
 * Requires admin authentication
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validatedData = updateSchoolSchema.parse(body)

    const { id, ...updateData } = validatedData

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('schools')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating school:', error)
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'School updated successfully',
    })
  } catch (error) {
    logger.error('Error in PATCH schools:', error)

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to update school',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/schools
 * Delete a school
 * Requires admin authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid school ID format' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Error deleting school:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'School deleted successfully',
    })
  } catch (error) {
    logger.error('Error in DELETE schools:', error)

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to delete school',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
