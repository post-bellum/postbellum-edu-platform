import { z } from 'zod'
import { sanitizeInput, sanitizeHTML } from '@/lib/sanitize'

/**
 * UUID validation helper for Zod
 */
const uuidSchema = z.string().uuid('Neplatné UUID')

/**
 * Helper to sanitize string inputs
 */
const sanitizeString = (val: string) => sanitizeInput(val.trim())

/**
 * Vimeo URL validation
 */
const vimeoUrlSchema = z
  .string()
  .url('Neplatná URL adresa')
  .refine(
    (url) => /^https?:\/\/(www\.)?(vimeo\.com|player\.vimeo\.com)/.test(url),
    { message: 'Musí být platná Vimeo URL adresa' }
  )
  .optional()

/**
 * Image URL validation
 */
const imageUrlSchema = z
  .string()
  .url('Neplatná URL adresa obrázku')
  .optional()

/**
 * Lesson specification enum
 */
export const lessonSpecificationSchema = z.enum([
  '2nd_grade_elementary',
  'high_school',
])

/**
 * Lesson duration enum
 */
export const lessonDurationSchema = z.enum(['30', '45', '90']).transform(Number)

/**
 * Create lesson schema
 * Note: This schema expects pre-processed data (arrays, booleans already converted)
 * Use parseFormDataForLesson() helper to convert FormData before validation
 */
export const createLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Název lekce je povinný')
    .max(500, 'Název lekce může mít maximálně 500 znaků')
    .transform(sanitizeString),
  vimeo_video_url: vimeoUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
  thumbnail_url: imageUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
  description: z
    .string()
    .max(5000, 'Popis může mít maximálně 5000 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  duration: z
    .string()
    .max(50, 'Délka lekce může mít maximálně 50 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  period: z
    .string()
    .max(200, 'Období může mít maximálně 200 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  target_group: z
    .string()
    .max(200, 'Cílová skupina může mít maximálně 200 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  lesson_type: z
    .string()
    .max(200, 'Typ lekce může mít maximálně 200 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  publication_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Neplatný formát data (YYYY-MM-DD)')
    .optional(),
  published: z.boolean().default(false),
  rvp_connection: z
    .array(z.string().max(200, 'RVP připojení může mít maximálně 200 znaků').transform(sanitizeString))
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
// Nullable string schema helper for update operations
const nullableStringSchema = (maxLength: number, errorMessage: string) =>
  z.union([
    z.null(),
    z.string().max(maxLength, errorMessage).transform(sanitizeString),
  ]).optional()

// Nullable Vimeo URL schema for updates
const nullableVimeoUrlSchema = z.union([
  z.null(),
  z
    .string()
    .url('Neplatná URL adresa')
    .refine(
      (url) => /^https?:\/\/(www\.)?(vimeo\.com|player\.vimeo\.com)/.test(url),
      { message: 'Musí být platná Vimeo URL adresa' }
    )
    .transform(sanitizeString),
]).optional()

// Nullable image URL schema for updates
const nullableImageUrlSchema = z.union([
  z.null(),
  z.string().url('Neplatná URL adresa obrázku').transform(sanitizeString),
]).optional()

// Nullable date schema for updates
const nullableDateSchema = z.union([
  z.null(),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Neplatný formát data (YYYY-MM-DD)'),
]).optional()

export const updateLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Název lekce je povinný')
    .max(500, 'Název lekce může mít maximálně 500 znaků')
    .transform(sanitizeString)
    .optional(),
  vimeo_video_url: nullableVimeoUrlSchema,
  thumbnail_url: nullableImageUrlSchema,
  description: nullableStringSchema(5000, 'Popis může mít maximálně 5000 znaků'),
  duration: nullableStringSchema(50, 'Délka lekce může mít maximálně 50 znaků'),
  period: nullableStringSchema(200, 'Období může mít maximálně 200 znaků'),
  target_group: nullableStringSchema(200, 'Cílová skupina může mít maximálně 200 znaků'),
  lesson_type: nullableStringSchema(200, 'Typ lekce může mít maximálně 200 znaků'),
  publication_date: nullableDateSchema,
  published: z.boolean().optional(),
  rvp_connection: z
    .array(z.string().max(200, 'RVP připojení může mít maximálně 200 znaků').transform(sanitizeString))
    .optional(),
  tag_ids: z
    .array(uuidSchema)
    .optional(),
})

/**
 * Helper to parse FormData into object for lesson schemas
 * Converts empty strings to undefined for optional fields, empty string for required fields
 * For updates: uses null to explicitly clear a field value in the database
 */
export function parseFormDataForLesson(formData: FormData, isUpdate = false) {
  const publishedValue = formData.get('published')
  const published = publishedValue === 'true' || publishedValue === 'on'
  
  const rvpConnection = formData.get('rvp_connection') as string | null
  const tagIds = formData.get('tag_ids') as string | null
  
  // Helper to convert empty strings:
  // - For create: undefined (field is optional)
  // - For update: null (explicitly clear the field in database)
  const getOptionalValue = (key: string) => {
    const value = formData.get(key) as string | null
    if (value && value.trim()) {
      return value
    }
    // For updates, return null to clear the field; for creates, return undefined
    return isUpdate ? null : undefined
  }
  
  const getRequiredValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value ?? ''
  }
  
  return {
    title: getRequiredValue('title'),
    vimeo_video_url: getOptionalValue('vimeo_video_url'),
    thumbnail_url: getOptionalValue('thumbnail_url'),
    description: getOptionalValue('description'),
    duration: getOptionalValue('duration'),
    period: getOptionalValue('period'),
    target_group: getOptionalValue('target_group'),
    lesson_type: getOptionalValue('lesson_type'),
    publication_date: getOptionalValue('publication_date'),
    published: isUpdate && publishedValue === null ? undefined : published,
    rvp_connection: rvpConnection && rvpConnection.trim()
      ? rvpConnection.split(',').map(s => s.trim()).filter(Boolean)
      : isUpdate ? [] : undefined,
    tag_ids: tagIds && tagIds.trim()
      ? tagIds.split(',').map(s => s.trim()).filter(Boolean)
      : isUpdate ? [] : undefined,
  }
}

/**
 * Required specification schema with Czech error message
 */
const requiredSpecificationSchema = z
  .string()
  .min(1, 'Vyberte cílovou skupinu')
  .refine(
    (val): val is '2nd_grade_elementary' | 'high_school' =>
      val === '2nd_grade_elementary' || val === 'high_school',
    { message: 'Vyberte cílovou skupinu' }
  )

/**
 * Required duration schema with Czech error message
 */
const requiredDurationSchema = z
  .number()
  .refine(
    (val): val is 30 | 45 | 90 => val === 30 || val === 45 || val === 90,
    { message: 'Vyberte délku materiálu' }
  )

/**
 * Create lesson material schema
 * Note: specification and duration are required for new materials
 */
export const createLessonMaterialSchema = z.object({
  lesson_id: uuidSchema,
  title: z
    .string()
    .min(1, 'Název materiálu je povinný')
    .max(500, 'Název materiálu může mít maximálně 500 znaků')
    .transform(sanitizeString),
  description: z
    .string()
    .max(5000, 'Popis může mít maximálně 5000 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  content: z
    .string()
    .max(50000, 'Obsah může mít maximálně 50000 znaků')
    .optional()
    .transform((val) => val && val.trim() ? sanitizeHTML(val.trim()) : undefined),
  specification: requiredSpecificationSchema,
  duration: requiredDurationSchema,
})

/**
 * Update lesson material schema
 * Note: specification and duration are optional for updates (only update if provided)
 */
export const updateLessonMaterialSchema = z.object({
  title: z
    .string()
    .min(1, 'Název materiálu je povinný')
    .max(500, 'Název materiálu může mít maximálně 500 znaků')
    .transform(sanitizeString)
    .optional(),
  description: z
    .string()
    .max(5000, 'Popis může mít maximálně 5000 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  content: z
    .string()
    .max(50000, 'Obsah může mít maximálně 50000 znaků')
    .optional()
    .transform((val) => val && val.trim() ? sanitizeHTML(val.trim()) : undefined),
  specification: lessonSpecificationSchema.optional(),
  duration: z.union([z.literal(30), z.literal(45), z.literal(90)]).optional(),
})

/**
 * Create additional activity schema
 */
export const createAdditionalActivitySchema = z.object({
  lesson_id: uuidSchema,
  title: z
    .string()
    .min(1, 'Název aktivity je povinný')
    .max(500, 'Název aktivity může mít maximálně 500 znaků')
    .transform(sanitizeString),
  description: z
    .string()
    .max(5000, 'Popis může mít maximálně 5000 znaků')
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
    .min(1, 'Název aktivity je povinný')
    .max(500, 'Název aktivity může mít maximálně 500 znaků')
    .transform(sanitizeString)
    .optional(),
  description: z
    .string()
    .max(5000, 'Popis může mít maximálně 5000 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  image_url: imageUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
})

/**
 * Helper to parse FormData into object for lesson material schemas
 * Converts empty strings to undefined for proper Zod validation
 */
export function parseFormDataForLessonMaterial(formData: FormData) {
  const duration = formData.get('duration') as string | null
  
  // Helper to convert empty strings to undefined for optional fields
  // Zod's .optional() expects undefined, not null
  const getOptionalValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value && value.trim() ? value : undefined
  }
  
  const getRequiredValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value ?? ''
  }
  
  return {
    lesson_id: getRequiredValue('lesson_id'),
    title: getRequiredValue('title'),
    description: getOptionalValue('description'),
    content: getOptionalValue('content'),
    specification: getOptionalValue('specification'),
    duration: duration && duration.trim() ? parseInt(duration) : undefined,
  }
}

/**
 * Helper to parse FormData into object for additional activity schemas
 * Converts empty strings to undefined for proper Zod validation
 */
export function parseFormDataForAdditionalActivity(formData: FormData) {
  // Helper to convert empty strings to undefined for optional fields
  // Zod's .optional() expects undefined, not null
  const getOptionalValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value && value.trim() ? value : undefined
  }
  
  const getRequiredValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value ?? ''
  }
  
  return {
    lesson_id: getRequiredValue('lesson_id'),
    title: getRequiredValue('title'),
    description: getOptionalValue('description'),
    image_url: getOptionalValue('image_url'),
  }
}

/**
 * Create user lesson material schema (for user copies of lesson materials)
 */
export const createUserLessonMaterialSchema = z.object({
  source_material_id: uuidSchema,
  lesson_id: uuidSchema,
  title: z
    .string()
    .min(1, 'Název materiálu je povinný')
    .max(500, 'Název materiálu může mít maximálně 500 znaků')
    .transform(sanitizeString),
  content: z
    .string()
    .max(50000, 'Obsah může mít maximálně 50000 znaků')
    .optional()
    .transform((val) => val && val.trim() ? sanitizeHTML(val.trim()) : undefined),
})

/**
 * Update user lesson material schema
 */
export const updateUserLessonMaterialSchema = z.object({
  title: z
    .string()
    .min(1, 'Název materiálu je povinný')
    .max(500, 'Název materiálu může mít maximálně 500 znaků')
    .transform(sanitizeString)
    .optional(),
  content: z
    .string()
    .max(50000, 'Obsah může mít maximálně 50000 znaků')
    .optional()
    .transform((val) => val && val.trim() ? sanitizeHTML(val.trim()) : undefined),
})

/**
 * Helper to parse FormData into object for user lesson material schemas
 */
export function parseFormDataForUserLessonMaterial(formData: FormData) {
  const getOptionalValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value && value.trim() ? value : undefined
  }
  
  const getRequiredValue = (key: string) => {
    const value = formData.get(key) as string | null
    return value ?? ''
  }
  
  return {
    source_material_id: getRequiredValue('source_material_id'),
    lesson_id: getRequiredValue('lesson_id'),
    title: getRequiredValue('title'),
    content: getOptionalValue('content'),
  }
}

// Export types
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
export type CreateLessonMaterialInput = z.infer<typeof createLessonMaterialSchema>
export type UpdateLessonMaterialInput = z.infer<typeof updateLessonMaterialSchema>
export type CreateAdditionalActivityInput = z.infer<typeof createAdditionalActivitySchema>
export type UpdateAdditionalActivityInput = z.infer<typeof updateAdditionalActivitySchema>
export type CreateUserLessonMaterialInput = z.infer<typeof createUserLessonMaterialSchema>
export type UpdateUserLessonMaterialInput = z.infer<typeof updateUserLessonMaterialSchema>

