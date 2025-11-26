import { z } from "zod"
import { sanitizeInput } from "@/lib/sanitize"

/**
 * UUID validation helper for Zod
 */
const uuidSchema = z.string().uuid("Neplatné UUID")

/**
 * Helper to sanitize string inputs
 */
const sanitizeString = (val: string) => sanitizeInput(val.trim())

/**
 * Vimeo URL validation
 */
const vimeoUrlSchema = z
  .string()
  .url("Neplatná URL adresa")
  .refine(
    (url) => /^https?:\/\/(www\.)?(vimeo\.com|player\.vimeo\.com)/.test(url),
    { message: "Musí být platná Vimeo URL adresa" }
  )
  .optional()

/**
 * Image URL validation
 */
const imageUrlSchema = z
  .string()
  .url("Neplatná URL adresa obrázku")
  .optional()

/**
 * Lesson specification enum
 */
export const lessonSpecificationSchema = z.enum([
  "1st_grade_elementary",
  "2nd_grade_elementary",
  "high_school",
])

/**
 * Lesson duration enum
 */
export const lessonDurationSchema = z.enum(["30", "45", "90"]).transform(Number)

/**
 * Create lesson schema
 * Note: This schema expects pre-processed data (arrays, booleans already converted)
 * Use parseFormDataForLesson() helper to convert FormData before validation
 */
export const createLessonSchema = z.object({
  title: z
    .string()
    .min(1, "Název lekce je povinný")
    .max(500, "Název lekce může mít maximálně 500 znaků")
    .transform(sanitizeString),
  vimeo_video_url: vimeoUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
  description: z
    .string()
    .max(5000, "Popis může mít maximálně 5000 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  duration: z
    .string()
    .max(50, "Délka lekce může mít maximálně 50 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  period: z
    .string()
    .max(200, "Období může mít maximálně 200 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  target_group: z
    .string()
    .max(200, "Cílová skupina může mít maximálně 200 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  lesson_type: z
    .string()
    .max(200, "Typ lekce může mít maximálně 200 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  publication_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Neplatný formát data (YYYY-MM-DD)")
    .optional(),
  published: z.boolean().default(false),
  rvp_connection: z
    .array(z.string().max(200, "RVP připojení může mít maximálně 200 znaků").transform(sanitizeString))
    .optional()
    .default([]),
  tag_ids: z
    .array(uuidSchema)
    .optional()
    .default([]),
})

/**
 * Update lesson schema (all fields optional except validation)
 * Note: This schema expects pre-processed data (arrays, booleans already converted)
 * Use parseFormDataForLesson() helper to convert FormData before validation
 */
export const updateLessonSchema = z.object({
  title: z
    .string()
    .min(1, "Název lekce je povinný")
    .max(500, "Název lekce může mít maximálně 500 znaků")
    .transform(sanitizeString)
    .optional(),
  vimeo_video_url: vimeoUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
  description: z
    .string()
    .max(5000, "Popis může mít maximálně 5000 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  duration: z
    .string()
    .max(50, "Délka lekce může mít maximálně 50 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  period: z
    .string()
    .max(200, "Období může mít maximálně 200 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  target_group: z
    .string()
    .max(200, "Cílová skupina může mít maximálně 200 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  lesson_type: z
    .string()
    .max(200, "Typ lekce může mít maximálně 200 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  publication_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Neplatný formát data (YYYY-MM-DD)")
    .optional(),
  published: z.boolean().optional(),
  rvp_connection: z
    .array(z.string().max(200, "RVP připojení může mít maximálně 200 znaků").transform(sanitizeString))
    .optional(),
  tag_ids: z
    .array(uuidSchema)
    .optional(),
})

/**
 * Helper to parse FormData into object for lesson schemas
 * Converts empty strings to null/undefined for proper Zod validation
 */
export function parseFormDataForLesson(formData: FormData, isUpdate = false) {
  const publishedValue = formData.get('published')
  const published = publishedValue === 'true' || publishedValue === 'on'
  
  const rvpConnection = formData.get('rvp_connection') as string | null
  const tagIds = formData.get('tag_ids') as string | null
  
  // Helper to convert empty strings to null for optional fields
  const getValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value && value.trim() ? value : null
  }
  
  return {
    title: getValue('title'),
    vimeo_video_url: getValue('vimeo_video_url'),
    description: getValue('description'),
    duration: getValue('duration'),
    period: getValue('period'),
    target_group: getValue('target_group'),
    lesson_type: getValue('lesson_type'),
    publication_date: getValue('publication_date'),
    published: isUpdate && publishedValue === null ? undefined : published,
    rvp_connection: rvpConnection && rvpConnection.trim()
      ? rvpConnection.split(',').map(s => s.trim()).filter(Boolean)
      : undefined,
    tag_ids: tagIds && tagIds.trim()
      ? tagIds.split(',').map(s => s.trim()).filter(Boolean)
      : undefined,
  }
}

/**
 * Create lesson material schema
 */
export const createLessonMaterialSchema = z.object({
  lesson_id: uuidSchema,
  title: z
    .string()
    .min(1, "Název materiálu je povinný")
    .max(500, "Název materiálu může mít maximálně 500 znaků")
    .transform(sanitizeString),
  description: z
    .string()
    .max(5000, "Popis může mít maximálně 5000 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  content: z
    .string()
    .max(10000, "Obsah může mít maximálně 10000 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  specification: lessonSpecificationSchema.optional(),
  duration: z
    .union([z.literal(30), z.literal(45), z.literal(90)])
    .optional(),
})

/**
 * Update lesson material schema
 */
export const updateLessonMaterialSchema = z.object({
  title: z
    .string()
    .min(1, "Název materiálu je povinný")
    .max(500, "Název materiálu může mít maximálně 500 znaků")
    .transform(sanitizeString)
    .optional(),
  description: z
    .string()
    .max(5000, "Popis může mít maximálně 5000 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  content: z
    .string()
    .max(10000, "Obsah může mít maximálně 10000 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  specification: lessonSpecificationSchema.optional(),
  duration: z
    .union([z.literal(30), z.literal(45), z.literal(90)])
    .optional(),
})

/**
 * Create additional activity schema
 */
export const createAdditionalActivitySchema = z.object({
  lesson_id: uuidSchema,
  title: z
    .string()
    .min(1, "Název aktivity je povinný")
    .max(500, "Název aktivity může mít maximálně 500 znaků")
    .transform(sanitizeString),
  description: z
    .string()
    .max(5000, "Popis může mít maximálně 5000 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  image_url: imageUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
})

/**
 * Update additional activity schema
 */
export const updateAdditionalActivitySchema = z.object({
  title: z
    .string()
    .min(1, "Název aktivity je povinný")
    .max(500, "Název aktivity může mít maximálně 500 znaků")
    .transform(sanitizeString)
    .optional(),
  description: z
    .string()
    .max(5000, "Popis může mít maximálně 5000 znaků")
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  image_url: imageUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
})

/**
 * Helper to parse FormData into object for lesson material schemas
 * Converts empty strings to null/undefined for proper Zod validation
 */
export function parseFormDataForLessonMaterial(formData: FormData) {
  const duration = formData.get('duration') as string | null
  
  // Helper to convert empty strings to null for optional fields
  const getValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value && value.trim() ? value : null
  }
  
  return {
    lesson_id: getValue('lesson_id'),
    title: getValue('title'),
    description: getValue('description'),
    content: getValue('content'),
    specification: getValue('specification'),
    duration: duration && duration.trim() ? parseInt(duration) : undefined,
  }
}

/**
 * Helper to parse FormData into object for additional activity schemas
 * Converts empty strings to null/undefined for proper Zod validation
 */
export function parseFormDataForAdditionalActivity(formData: FormData) {
  // Helper to convert empty strings to null for optional fields
  const getValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value && value.trim() ? value : null
  }
  
  return {
    lesson_id: getValue('lesson_id'),
    title: getValue('title'),
    description: getValue('description'),
    image_url: getValue('image_url'),
  }
}

// Export types
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
export type CreateLessonMaterialInput = z.infer<typeof createLessonMaterialSchema>
export type UpdateLessonMaterialInput = z.infer<typeof updateLessonMaterialSchema>
export type CreateAdditionalActivityInput = z.infer<typeof createAdditionalActivitySchema>
export type UpdateAdditionalActivityInput = z.infer<typeof updateAdditionalActivitySchema>

