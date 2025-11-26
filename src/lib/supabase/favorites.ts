"use server"

import { createClient } from "./server"
import { logger } from "@/lib/logger"

/**
 * Check if a lesson is favorited by the current user
 */
export async function isLessonFavorited(lessonId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data, error } = await supabase
      .from('user_favorites')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      logger.error("Error checking favorite:", error)
      return false
    }

    return !!data
  } catch (error) {
    logger.error("Error checking favorite:", error)
    return false
  }
}

/**
 * Get all favorite lesson IDs for the current user
 */
export async function getUserFavoriteLessonIds(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    const { data, error } = await supabase
      .from('user_favorites')
      .select('lesson_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error("Error fetching favorites:", error)
      return []
    }

    return (data || []).map((fav: { lesson_id: string }) => fav.lesson_id)
  } catch (error) {
    logger.error("Error fetching favorites:", error)
    return []
  }
}

/**
 * Get the count of favorite lessons for the current user
 */
export async function getFavoriteCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return 0

    const { count, error } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (error) {
      logger.error("Error fetching favorite count:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    logger.error("Error fetching favorite count:", error)
    return 0
  }
}

/**
 * Add a lesson to user's favorites
 */
export async function addFavorite(lessonId: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User must be authenticated")
    }

    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
      })

    if (error) {
      logger.error("Error adding favorite:", error)
      throw error
    }
  } catch (error) {
    logger.error("Error adding favorite:", error)
    throw error
  }
}

/**
 * Remove a lesson from user's favorites
 */
export async function removeFavorite(lessonId: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User must be authenticated")
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)

    if (error) {
      logger.error("Error removing favorite:", error)
      throw error
    }
  } catch (error) {
    logger.error("Error removing favorite:", error)
    throw error
  }
}

/**
 * Toggle favorite status for a lesson
 */
export async function toggleFavorite(lessonId: string): Promise<boolean> {
  try {
    const isFavorited = await isLessonFavorited(lessonId)
    
    if (isFavorited) {
      await removeFavorite(lessonId)
      return false
    } else {
      await addFavorite(lessonId)
      return true
    }
  } catch (error) {
    logger.error("Error toggling favorite:", error)
    throw error
  }
}
