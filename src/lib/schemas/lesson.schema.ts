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
 * Material rich-text content (nullable so clearing the editor removes the text,
 * leaving a PDF-only material).
 */
const materialContentSchema = z
  .string()
  .max(150000, 'Obsah může mít maximálně 150000 znaků')
  .nullable()
  .optional()
  .transform((val) => {
    if (val === undefined) return undefined
    return val && val.trim() ? sanitizeHTML(val.trim()) : null
  })

/**
 * Uploaded material PDF (nullable so the admin can clear it).
 * `undefined` = field not submitted (leave unchanged), `null` = remove the PDF.
 */
const materialPdfUrlSchema = z
  .string()
  .max(2000, 'URL PDF může mít maximálně 2000 znaků')
  .url('Neplatná URL adresa PDF')
  .nullable()
  .optional()

const materialPdfFileNameSchema = z
  .string()
  .max(255, 'Název souboru může mít maximálně 255 znaků')
  .transform(sanitizeString)
  .nullable()
  .optional()

/**
 * External link URL validation (http/https only)
 * Used for the optional clickable link on additional activities.
 */
const externalLinkUrlSchema = z
  .string()
  .transform((val) => val.replace(/\0/g, '').trim())
  .pipe(
    z
      .string()
      .max(2000, 'Odkaz může mít maximálně 2000 znaků')
      .url('Neplatná URL adresa odkazu')
      .refine((url) => /^https?:\/\//i.test(url), {
        message: 'Odkaz musí začínat http:// nebo https://',
      })
      // Reject characters that could break out of an href attribute.
      // The URL is intentionally NOT passed through sanitizeInput(), which
      // would mangle legitimate query strings (it strips `on<word>=` patterns).
      .refine((url) => !/["'<>`\s]/.test(url), {
        message: 'Odkaz obsahuje nepovolené znaky',
      })
  )
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
  author_team: z
    .string()
    .max(500, 'Autorský tým může mít maximálně 500 znaků')
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
  author_team: nullableStringSchema(500, 'Autorský tým může mít maximálně 500 znaků'),
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
    author_team: getOptionalValue('author_team'),
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
  content: materialContentSchema,
  pdf_url: materialPdfUrlSchema,
  pdf_file_name: materialPdfFileNameSchema,
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
  content: materialContentSchema,
  pdf_url: materialPdfUrlSchema,
  pdf_file_name: materialPdfFileNameSchema,
  specification: lessonSpecificationSchema.optional(),
  duration: z.union([z.literal(30), z.literal(45), z.literal(90)]).optional(),
})

/**
 * Attachment type for additional activities (image or pdf)
 */
export const attachmentTypeSchema = z.enum(['image', 'pdf'])

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
  attachment_type: attachmentTypeSchema.optional(),
  link_url: externalLinkUrlSchema,
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
  attachment_type: attachmentTypeSchema.optional(),
  // null clears an existing link; undefined leaves it untouched
  link_url: externalLinkUrlSchema.nullable(),
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
  
  // Nullable fields distinguish "not submitted" (undefined -> leave unchanged)
  // from "submitted empty" (null -> clear the value in the database).
  const getNullableValue = (key: string) => {
    const value = formData.get(key) as string | null
    if (value === null) return undefined
    return value.trim() ? value.trim() : null
  }

  return {
    lesson_id: getRequiredValue('lesson_id'),
    title: getRequiredValue('title'),
    description: getOptionalValue('description'),
    content: getNullableValue('content'),
    pdf_url: getNullableValue('pdf_url'),
    pdf_file_name: getNullableValue('pdf_file_name'),
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
    attachment_type: getOptionalValue('attachment_type') as 'image' | 'pdf' | undefined,
    link_url: getOptionalValue('link_url'),
  }
}

/**
 * Memory of Nations profile URL (pametnaroda.cz / memoryofnations.eu)
 */
const memoryOfNationsUrlSchema = z
  .string()
  .url('Neplatná URL adresa')
  .refine(
    (val) => /^https:\/\/(www\.)?(pametnaroda\.cz|memoryofnations\.eu)\//.test(val),
    { message: 'Musí být odkaz na profil na pametnaroda.cz' }
  )
  .optional()

const witnessBirthYearSchema = z
  .number()
  .int('Rok narození musí být celé číslo')
  .min(1850, 'Rok narození musí být alespoň 1850')
  .max(2100, 'Rok narození může být maximálně 2100')
  .optional()

const witnessSortOrderSchema = z
  .number()
  .int('Pořadí musí být celé číslo')
  .min(0, 'Pořadí nemůže být negativní')
  .max(9999, 'Pořadí může být maximálně 9999')
  .optional()

/**
 * Create lesson witness schema
 */
export const createLessonWitnessSchema = z.object({
  lesson_id: uuidSchema,
  name: z
    .string()
    .min(1, 'Jméno pamětníka je povinné')
    .max(200, 'Jméno pamětníka může mít maximálně 200 znaků')
    .transform(sanitizeString),
  role_short: z
    .string()
    .max(200, 'Krátká role může mít maximálně 200 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  role_full: z
    .string()
    .max(500, 'Dlouhá role může mít maximálně 500 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  birth_year: witnessBirthYearSchema,
  bio: z
    .string()
    .max(1800, 'Životopis může mít maximálně 1800 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  portrait_url: imageUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
  memory_of_nations_url: memoryOfNationsUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
  sort_order: witnessSortOrderSchema,
})

/**
 * Update lesson witness schema
 */
export const updateLessonWitnessSchema = z.object({
  name: z
    .string()
    .min(1, 'Jméno pamětníka je povinné')
    .max(200, 'Jméno pamětníka může mít maximálně 200 znaků')
    .transform(sanitizeString)
    .optional(),
  role_short: z
    .string()
    .max(200, 'Krátká role může mít maximálně 200 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  role_full: z
    .string()
    .max(500, 'Dlouhá role může mít maximálně 500 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  birth_year: witnessBirthYearSchema,
  bio: z
    .string()
    .max(1800, 'Životopis může mít maximálně 1800 znaků')
    .optional()
    .transform((val) => val ? sanitizeString(val) : undefined),
  portrait_url: imageUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
  memory_of_nations_url: memoryOfNationsUrlSchema.transform((val) => val ? sanitizeString(val) : undefined),
  sort_order: witnessSortOrderSchema,
})

/**
 * Helper to parse FormData into object for lesson witness schemas
 * Converts empty strings to undefined for proper Zod validation
 */
export function parseFormDataForLessonWitness(formData: FormData) {
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

  // Numeric fields arrive as strings from FormData; NaN is rejected by Zod
  const getNumericValue = (key: string) => {
    const value = getOptionalValue(key)
    return value !== undefined ? Number(value) : undefined
  }

  return {
    lesson_id: getRequiredValue('lesson_id'),
    name: getRequiredValue('name'),
    role_short: getOptionalValue('role_short'),
    role_full: getOptionalValue('role_full'),
    birth_year: getNumericValue('birth_year'),
    bio: getOptionalValue('bio'),
    portrait_url: getOptionalValue('portrait_url'),
    memory_of_nations_url: getOptionalValue('memory_of_nations_url'),
    sort_order: getNumericValue('sort_order'),
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
    .max(150000, 'Obsah může mít maximálně 150000 znaků')
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
    .max(150000, 'Obsah může mít maximálně 150000 znaků')
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
export type CreateLessonWitnessInput = z.infer<typeof createLessonWitnessSchema>
export type UpdateLessonWitnessInput = z.infer<typeof updateLessonWitnessSchema>
export type CreateUserLessonMaterialInput = z.infer<typeof createUserLessonMaterialSchema>
export type UpdateUserLessonMaterialInput = z.infer<typeof updateUserLessonMaterialSchema>

