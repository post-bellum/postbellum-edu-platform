"use client"

import { createClient } from "./client"
import { logger } from "@/lib/logger"
import type { AdditionalActivity } from "@/types/lesson.types"

/**
 * Get all additional activities for a lesson (client-side)
 */
export async function getAdditionalActivities(lessonId: string): Promise<AdditionalActivity[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('additional_activities')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error("Error fetching additional activities:", error)
      return []
    }

    return (data || []) as AdditionalActivity[]
  } catch (error) {
    logger.error("Error fetching additional activities:", error)
    return []
  }
}

