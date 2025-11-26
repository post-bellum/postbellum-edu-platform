"use server"

import { createClient } from "./server"
import { requireAdmin } from "./admin-helpers"
import { logger } from "@/lib/logger"
import type { Tag } from "@/types/lesson.types"

/**
 * Get all tags
 */
export async function getTags(): Promise<Tag[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('title', { ascending: true })

    if (error) {
      logger.error("Error fetching tags:", error)
      throw error
    }

    return (data || []) as Tag[]
  } catch (error) {
    logger.error("Error fetching tags:", error)
    throw error
  }
}

/**
 * Get a single tag by ID
 */
export async function getTagById(id: string): Promise<Tag | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error("Error fetching tag:", error)
      return null
    }

    return data as Tag
  } catch (error) {
    logger.error("Error fetching tag:", error)
    return null
  }
}

/**
 * Create a new tag (admin only)
 */
export async function createTag(title: string): Promise<Tag> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tags')
      .insert({ title: title.trim() })
      .select()
      .single()

    if (error) {
      logger.error("Error creating tag:", error)
      throw error
    }

    return data as Tag
  } catch (error) {
    logger.error("Error creating tag:", error)
    throw error
  }
}

/**
 * Update a tag (admin only)
 */
export async function updateTag(id: string, title: string): Promise<Tag> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tags')
      .update({ title: title.trim() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error("Error updating tag:", error)
      throw error
    }

    return data as Tag
  } catch (error) {
    logger.error("Error updating tag:", error)
    throw error
  }
}

/**
 * Delete a tag (admin only)
 */
export async function deleteTag(id: string): Promise<void> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error("Error deleting tag:", error)
      throw error
    }
  } catch (error) {
    logger.error("Error deleting tag:", error)
    throw error
  }
}

/**
 * Search tags by title
 */
export async function searchTags(query: string): Promise<Tag[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('title', { ascending: true })
      .limit(20)

    if (error) {
      logger.error("Error searching tags:", error)
      throw error
    }

    return (data || []) as Tag[]
  } catch (error) {
    logger.error("Error searching tags:", error)
    throw error
  }
}

