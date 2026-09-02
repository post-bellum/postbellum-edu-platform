/**
 * Lesson-related TypeScript types
 * Note: After running migrations, regenerate database types with:
 * npm run supabase:types
 */

export type LessonSpecification = '2nd_grade_elementary' | 'high_school'
export type LessonDuration = 30 | 45 | 90

export interface Lesson {
  id: string
  short_id: string | null // 10-char short ID for SEO-friendly URLs (like Medium)
  vimeo_video_url: string | null
  thumbnail_url: string | null
  title: string
  description: string | null
  duration: string | null
  rvp_connection: string[]
  period: string | null
  target_group: string | null
  lesson_type: string | null
  author_team: string | null
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
  /** Admin-uploaded PDF served by the download button; NULL falls back to generating from content */
  pdf_url: string | null
  /** Original file name of the uploaded PDF, used as the download file name */
  pdf_file_name: string | null
  specification: LessonSpecification | null
  duration: LessonDuration | null
  created_at: string
  updated_at: string
}

export type AdditionalActivityAttachmentType = 'image' | 'pdf'

export interface AdditionalActivity {
  id: string
  lesson_id: string
  title: string
  description: string | null
  image_url: string | null
  attachment_type: AdditionalActivityAttachmentType | null
  link_url: string | null
  created_at: string
  updated_at: string
}

export interface LessonWitness {
  id: string
  lesson_id: string
  name: string
  role_short: string | null // Short role shown on the card, e.g. "Poslankyně"
  role_full: string | null // Full role shown in the detail modal
  birth_year: number | null // Rendered as "*1953"
  bio: string | null // Short biography (~900 chars) shown in the detail modal
  portrait_url: string | null
  memory_of_nations_url: string | null // Profile on pametnaroda.cz
  sort_order: number
  created_at: string
  updated_at: string
}

export interface LessonWithRelations extends Lesson {
  tags?: Tag[]
  materials?: LessonMaterial[]
  additional_activities?: AdditionalActivity[]
  witnesses?: LessonWitness[]
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
  CreateLessonWitnessInput,
  UpdateLessonWitnessInput,
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

