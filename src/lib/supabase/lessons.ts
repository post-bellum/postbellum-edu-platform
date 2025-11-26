"use server"

import { createClient } from "./server"
import { createPublicClient } from "./public"
import { requireAdmin } from "./admin-helpers"
import { logger } from "@/lib/logger"
import type { Database } from "@/types/database.types"
import type { 
  Lesson, 
  LessonWithRelations,
  CreateLessonInput, 
  UpdateLessonInput,
  Tag
} from "@/types/lesson.types"

type LessonRow = Database['public']['Tables']['lessons']['Row']

/**
 * Get all lessons with optional filters
 * RLS policies automatically handle:
 * - Public users: only see published lessons
 * - Authenticated users: see all lessons (RLS allows authenticated to see all)
 * 
 * Note: For admin-only views, use published_only: false explicitly
 */
export async function getLessons(filters?: {
  period?: string
  target_group?: string
  tag_id?: string
  published_only?: boolean
  usePublicClient?: boolean // Use public client (no cookies) for static pages
}): Promise<Lesson[]> {
  try {
    // Use public client for static pages (no cookies needed)
    // RLS policies still work - public users only see published content
    const supabase = filters?.usePublicClient 
      ? createPublicClient()
      : await createClient()
    
    // If filtering by tag_id, we need to use a different query structure
    if (filters?.tag_id) {
      let query = supabase
        .from('lesson_tags')
        .select('lesson_id, lessons(*)')
        .eq('tag_id', filters.tag_id)
      
      // If explicitly requesting only published, add filter
      // Otherwise, RLS will handle it automatically
      if (filters?.published_only === true) {
        query = query.eq('lessons.published', true)
      }
      
      const { data, error } = await query
      
      if (error) {
        logger.error("Error fetching lessons by tag:", error)
        throw error
      }
      
      // Extract lessons from the joined data
      type LessonTagJoin = {
        lesson_id: string
        lessons: LessonRow | null
      }
      
      const lessons = (data || [])
        .map((item: LessonTagJoin) => {
          const lesson = item.lessons
          if (!lesson) return null
          return {
            ...lesson,
            rvp_connection: lesson.rvp_connection || [],
            published: lesson.published ?? false,
          } as Lesson
        })
        .filter((lesson): lesson is Lesson => lesson !== null)
      
      // Apply additional filters if needed
      let filteredLessons = lessons
      if (filters?.period) {
        filteredLessons = filteredLessons.filter(l => l.period === filters.period)
      }
      if (filters?.target_group) {
        filteredLessons = filteredLessons.filter(l => l.target_group === filters.target_group)
      }
      
      // Sort by publication_date and created_at
      return filteredLessons.sort((a, b) => {
        const dateA = a.publication_date || a.created_at
        const dateB = b.publication_date || b.created_at
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
    }
    
    // Standard query without tag filter
    let query = supabase
      .from('lessons')
      .select('*')
      .order('publication_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    // If explicitly requesting only published, add filter
    // Otherwise, RLS will handle it automatically based on user role
    if (filters?.published_only === true) {
      query = query.eq('published', true)
    }

    if (filters?.period) {
      query = query.eq('period', filters.period)
    }
    if (filters?.target_group) {
      query = query.eq('target_group', filters.target_group)
    }

    const { data, error } = await query

    if (error) {
      logger.error("Error fetching lessons:", error)
      throw error
    }

    // Convert to Lesson type with published field
    // RLS policies have already filtered the results appropriately
    return (data || []).map((lesson: LessonRow) => ({
      ...lesson,
      published: lesson.published ?? false,
      rvp_connection: lesson.rvp_connection || [],
    })) as Lesson[]
  } catch (error) {
    logger.error("Error fetching lessons:", error)
    throw error
  }
}

/**
 * Get multiple lessons by their IDs
 * RLS policies automatically handle access control
 */
export async function getLessonsByIds(ids: string[]): Promise<Lesson[]> {
  try {
    if (ids.length === 0) return []
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .in('id', ids)
      .order('publication_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      logger.error("Error fetching lessons by IDs:", error)
      throw error
    }

    return (data || []).map((lesson: LessonRow) => ({
      ...lesson,
      published: lesson.published ?? false,
      rvp_connection: lesson.rvp_connection || [],
    })) as Lesson[]
  } catch (error) {
    logger.error("Error fetching lessons by IDs:", error)
    throw error
  }
}

/**
 * Get a single lesson by ID with all relations
 * RLS policies automatically handle:
 * - Public users: can only access published lessons (will return null if unpublished)
 * - Authenticated users: can access all lessons
 */
export async function getLessonById(
  id: string, 
  usePublicClient?: boolean
): Promise<LessonWithRelations | null> {
  try {
    // Use public client for static generation (no cookies)
    // RLS policies still work - public users only see published lessons
    const supabase = usePublicClient 
      ? createPublicClient()
      : await createClient()
    
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single()

    if (lessonError) {
      logger.error("Error fetching lesson:", lessonError)
      return null
    }

    if (!lesson) return null

    // Fetch related data
    // RLS policies on related tables will automatically filter based on lesson published status
    const [tagsResult, materialsResult, activitiesResult] = await Promise.all([
      supabase
        .from('lesson_tags')
        .select('tags(*)')
        .eq('lesson_id', id),
      supabase
        .from('lesson_materials')
        .select('*')
        .eq('lesson_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('additional_activities')
        .select('*')
        .eq('lesson_id', id)
        .order('created_at', { ascending: true })
    ])

    const tags = (tagsResult.data || [])
      .map((lt) => {
        const tag = lt.tags
        if (!tag) return null
        // Convert database type to our Tag type
        return {
          ...tag,
          created_at: tag.created_at || new Date().toISOString(),
        } as Tag
      })
      .filter((tag): tag is Tag => tag !== null)
    const materials = materialsResult.data || []
    const activities = activitiesResult.data || []

    return {
      ...lesson,
      published: lesson.published ?? false,
      rvp_connection: lesson.rvp_connection || [],
      tags,
      materials,
      additional_activities: activities
    } as LessonWithRelations
  } catch (error) {
    logger.error("Error fetching lesson:", error)
    return null
  }
}

/**
 * Create a new lesson (admin only)
 */
export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User must be authenticated")
    }

    const { tag_ids, ...lessonData } = input

    // Create lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        ...lessonData,
        created_by: user.id,
        rvp_connection: input.rvp_connection || []
      })
      .select()
      .single()

    if (lessonError) {
      logger.error("Error creating lesson:", lessonError)
      throw lessonError
    }

    // Add tags if provided
    if (tag_ids && tag_ids.length > 0) {
      const lessonTags = tag_ids.map(tag_id => ({
        lesson_id: lesson.id,
        tag_id
      }))

      const { error: tagsError } = await supabase
        .from('lesson_tags')
        .insert(lessonTags)

      if (tagsError) {
        logger.error("Error adding tags to lesson:", tagsError)
        // Don't throw - lesson was created successfully
      }
    }

    return lesson as Lesson
  } catch (error) {
    logger.error("Error creating lesson:", error)
    throw error
  }
}

/**
 * Update a lesson (admin only)
 */
export async function updateLesson(id: string, input: UpdateLessonInput): Promise<Lesson> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { tag_ids, ...lessonData } = input

    // Update lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .update({
        ...lessonData,
        rvp_connection: input.rvp_connection
      })
      .eq('id', id)
      .select()
      .single()

    if (lessonError) {
      logger.error("Error updating lesson:", lessonError)
      throw lessonError
    }

    // Update tags if provided
    if (tag_ids !== undefined) {
      // Delete existing tags
      const { error: deleteError } = await supabase
        .from('lesson_tags')
        .delete()
        .eq('lesson_id', id)

      if (deleteError) {
        logger.error("Error deleting lesson tags:", deleteError)
      }

      // Insert new tags
      if (tag_ids.length > 0) {
        const lessonTags = tag_ids.map(tag_id => ({
          lesson_id: id,
          tag_id
        }))

        const { error: insertError } = await supabase
          .from('lesson_tags')
          .insert(lessonTags)

        if (insertError) {
          logger.error("Error adding tags to lesson:", insertError)
        }
      }
    }

    return lesson as Lesson
  } catch (error) {
    logger.error("Error updating lesson:", error)
    throw error
  }
}

/**
 * Delete a lesson (admin only)
 */
export async function deleteLesson(id: string): Promise<void> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error("Error deleting lesson:", error)
      throw error
    }
  } catch (error) {
    logger.error("Error deleting lesson:", error)
    throw error
  }
}

