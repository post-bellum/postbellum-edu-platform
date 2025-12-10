'use server'

import { createClient } from './server'
import { logger } from '@/lib/logger'
import type { UserLessonMaterial } from '@/types/lesson.types'
import type {
  CreateUserLessonMaterialInput,
  UpdateUserLessonMaterialInput,
} from '@/lib/schemas/lesson.schema'

/**
 * Extract base name and index from a title like "Pracovní list (2)"
 * Returns { baseName: "Pracovní list", index: 2 } or { baseName: "Pracovní list", index: null }
 */
function parseTitleWithIndex(title: string): { baseName: string; index: number | null } {
  const match = title.match(/^(.*?)\s*\((\d+)\)$/);
  if (match) {
    return {
      baseName: match[1].trim(),
      index: parseInt(match[2], 10)
    };
  }
  return { baseName: title, index: null };
}

/**
 * Generate a unique title by appending (1), (2), etc. if duplicates exist
 * 
 * Examples:
 * - If "Pracovní list" exists and user creates "Pracovní list" → returns "Pracovní list (1)"
 * - If "Pracovní list" and "Pracovní list (1)" exist → returns "Pracovní list (2)"
 * - If only "Pracovní list (1)" exists and user creates "Pracovní list" → returns "Pracovní list"
 * - If "Pracovní list" exists and user creates "Pracovní list (5)" → returns "Pracovní list (5)"
 * 
 * Algorithm:
 * 1. Extract base name from title (e.g., "Pracovní list" from "Pracovní list (2)")
 * 2. Find all existing materials with the same base name
 * 3. If the exact requested title doesn't exist, use it as-is
 * 4. If it exists, find the highest index number and increment by 1
 * 
 * @param supabase - Supabase client instance
 * @param userId - Current user's ID
 * @param lessonId - Lesson ID to check within
 * @param requestedTitle - The title user wants to use
 * @returns Unique title, potentially with (N) appended
 */
async function generateUniqueMaterialTitle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  lessonId: string,
  requestedTitle: string
): Promise<string> {
  // Parse the requested title to get base name
  const { baseName } = parseTitleWithIndex(requestedTitle);

  // Fetch all materials for this user and lesson that start with the base name
  const { data: existingMaterials, error } = await supabase
    .from('user_lesson_materials')
    .select('title')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId);

  if (error) {
    logger.error('Error fetching existing materials for title uniqueness check:', error);
    // If we can't check, just return the original title
    return requestedTitle;
  }

  if (!existingMaterials || existingMaterials.length === 0) {
    return requestedTitle;
  }

  // Find all materials that match the base name
  const matchingTitles = existingMaterials
    .map(m => m.title)
    .filter(title => {
      const parsed = parseTitleWithIndex(title);
      return parsed.baseName === baseName;
    });

  // If no matches, the title is unique
  if (matchingTitles.length === 0) {
    return requestedTitle;
  }

  // Check if the exact title already exists
  const exactMatch = matchingTitles.find(title => title === requestedTitle);
  if (!exactMatch) {
    return requestedTitle;
  }

  // Find the highest index used
  let maxIndex = 0;
  for (const title of matchingTitles) {
    const { index } = parseTitleWithIndex(title);
    if (index !== null && index > maxIndex) {
      maxIndex = index;
    }
  }

  // If we have a base name without index and it exists, start from (1)
  // Otherwise increment the max index
  const nextIndex = maxIndex + 1;
  return `${baseName} (${nextIndex})`;
}

/**
 * Get all user lesson materials for a specific lesson
 */
export async function getUserLessonMaterials(lessonId: string): Promise<UserLessonMaterial[]> {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      // Not logged in - return empty array
      return []
    }

    const { data, error } = await supabase
      .from('user_lesson_materials')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching user lesson materials:', error)
      throw error
    }

    return (data || []) as UserLessonMaterial[]
  } catch (error) {
    logger.error('Error fetching user lesson materials:', error)
    throw error
  }
}

/**
 * Get a single user lesson material by ID
 */
export async function getUserLessonMaterialById(id: string): Promise<UserLessonMaterial | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_lesson_materials')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Error fetching user lesson material:', error)
      return null
    }

    return data as UserLessonMaterial
  } catch (error) {
    logger.error('Error fetching user lesson material:', error)
    return null
  }
}

/**
 * Create a user lesson material (copy from original material)
 */
export async function createUserLessonMaterial(
  input: CreateUserLessonMaterialInput
): Promise<UserLessonMaterial> {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Musíte být přihlášeni pro vytvoření materiálu')
    }

    // Generate a unique title if duplicates exist
    const uniqueTitle = await generateUniqueMaterialTitle(
      supabase,
      user.id,
      input.lesson_id,
      input.title
    );

    const { data, error } = await supabase
      .from('user_lesson_materials')
      .insert({
        ...input,
        title: uniqueTitle,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating user lesson material:', error)
      throw error
    }

    return data as UserLessonMaterial
  } catch (error) {
    logger.error('Error creating user lesson material:', error)
    throw error
  }
}

/**
 * Update a user lesson material
 */
export async function updateUserLessonMaterial(
  id: string,
  input: UpdateUserLessonMaterialInput
): Promise<UserLessonMaterial> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_lesson_materials')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating user lesson material:', error)
      throw error
    }

    return data as UserLessonMaterial
  } catch (error) {
    logger.error('Error updating user lesson material:', error)
    throw error
  }
}

/**
 * Delete a user lesson material
 */
export async function deleteUserLessonMaterial(id: string): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('user_lesson_materials')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Error deleting user lesson material:', error)
      throw error
    }
  } catch (error) {
    logger.error('Error deleting user lesson material:', error)
    throw error
  }
}
