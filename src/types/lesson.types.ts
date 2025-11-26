/**
 * Lesson-related TypeScript types
 * Note: After running migrations, regenerate database types with:
 * npm run supabase:types
 */

export type LessonSpecification = '1st_grade_elementary' | '2nd_grade_elementary' | 'high_school'
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

export interface CreateLessonInput {
  vimeo_video_url?: string
  title: string
  description?: string
  duration?: string
  rvp_connection?: string[]
  period?: string
  target_group?: string
  lesson_type?: string
  publication_date?: string
  tag_ids?: string[]
}

export interface UpdateLessonInput {
  vimeo_video_url?: string
  title?: string
  description?: string
  duration?: string
  rvp_connection?: string[]
  period?: string
  target_group?: string
  lesson_type?: string
  publication_date?: string
  tag_ids?: string[]
}

export interface CreateLessonMaterialInput {
  lesson_id: string
  title: string
  description?: string
  content?: string
  specification?: LessonSpecification
  duration?: LessonDuration
}

export interface UpdateLessonMaterialInput {
  title?: string
  description?: string
  content?: string
  specification?: LessonSpecification
  duration?: LessonDuration
}

export interface CreateAdditionalActivityInput {
  lesson_id: string
  title: string
  description?: string
  image_url?: string
}

export interface UpdateAdditionalActivityInput {
  title?: string
  description?: string
  image_url?: string
}

