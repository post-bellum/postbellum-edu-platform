/**
 * Lesson-related TypeScript types
 * Note: After running migrations, regenerate database types with:
 * npm run supabase:types
 */

export type LessonSpecification = '2nd_grade_elementary' | 'high_school'
export type LessonDuration = 30 | 45 | 90

export interface Lesson {
  id: string
  vimeo_video_url: string | null
  title: string
  description: string | null
  duration: string | null
  rvp_connection: string[]
  period: string | null
  target_group: string | null
  lesson_type: string | null
  publication_date: string | null // ISO date string
  published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  title: string
  created_at: string
}

export interface LessonMaterial {
  id: string
  lesson_id: string
  title: string
  description: string | null
  content: string | null
  specification: LessonSpecification | null
  duration: LessonDuration | null
  created_at: string
  updated_at: string
}

export interface AdditionalActivity {
  id: string
  lesson_id: string
  title: string
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface LessonWithRelations extends Lesson {
  tags?: Tag[]
  materials?: LessonMaterial[]
  additional_activities?: AdditionalActivity[]
}

// Input types are now defined in @/lib/schemas/lesson.schema.ts using Zod
// Re-exported here for backward compatibility
export type {
  CreateLessonInput,
  UpdateLessonInput,
  CreateLessonMaterialInput,
  UpdateLessonMaterialInput,
  CreateAdditionalActivityInput,
  UpdateAdditionalActivityInput,
  CreateUserLessonMaterialInput,
  UpdateUserLessonMaterialInput,
} from '@/lib/schemas/lesson.schema'

export interface UserFavorite {
  user_id: string
  lesson_id: string
  created_at: string
}

export interface UserLessonMaterial {
  id: string
  user_id: string
  source_material_id: string
  lesson_id: string
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

