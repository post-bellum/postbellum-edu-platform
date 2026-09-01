'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/admin-helpers'
import { sanitizeInput } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { PROFILE_SURVEY_CONSTANTS } from '@/lib/constants'
import { EMOJI_SCALE } from '@/types/profile-survey.types'
import type {
  ProfileQuestion,
  ProfileQuestionAnswerType,
  ProfileSurveyRespondent,
  ProfileSurveySettings,
} from '@/types/profile-survey.types'

/** Question payload coming from the admin form */
export interface ProfileQuestionInput {
  questionText: string
  helpText: string | null
  answerType: ProfileQuestionAnswerType
  isActive: boolean
  /** Ordered options; existing ones keep their id so answers stay attached */
  options: Array<{ id?: string; label: string }>
  /** End labels of the emoji scale, 'emoji_scale' only */
  scaleMinLabel: string | null
  scaleMaxLabel: string | null
}

export interface ProfileSurveyStats {
  /** Users that answered at least one question */
  respondents: number
  /** Answer counts keyed by question id */
  answersPerQuestion: Record<string, number>
}

export interface ProfileSurveyOptionSummary {
  questionId: string
  questionText: string
  answerType: ProfileQuestionAnswerType
  rows: Array<{ label: string; count: number }>
}

const QUESTION_COLUMNS =
  'id, question_text, help_text, answer_type, position, is_active, scale_min_label, scale_max_label, profile_question_options(id, label, position)'

const ANSWER_TYPES: ProfileQuestionAnswerType[] = ['text', 'textarea', 'select', 'emoji_scale']

type ActionResult<T = undefined> = {
  success: boolean
  data?: T
  error?: string
}

/** Validate and clean a question payload; returns an error message when invalid */
function validateQuestionInput(input: ProfileQuestionInput): string | null {
  const questionText = sanitizeInput(input.questionText.trim())
  if (!questionText) {
    return 'Znění otázky je povinné'
  }
  if (questionText.length > PROFILE_SURVEY_CONSTANTS.QUESTION_TEXT_MAX_LENGTH) {
    return `Znění otázky může mít nejvýše ${PROFILE_SURVEY_CONSTANTS.QUESTION_TEXT_MAX_LENGTH} znaků`
  }

  const helpText = input.helpText ? sanitizeInput(input.helpText.trim()) : ''
  if (helpText.length > PROFILE_SURVEY_CONSTANTS.HELP_TEXT_MAX_LENGTH) {
    return `Popisek může mít nejvýše ${PROFILE_SURVEY_CONSTANTS.HELP_TEXT_MAX_LENGTH} znaků`
  }

  if (!ANSWER_TYPES.includes(input.answerType)) {
    return 'Neplatný typ odpovědi'
  }

  const scaleLabels = [input.scaleMinLabel, input.scaleMaxLabel]
  if (scaleLabels.some((label) => label && sanitizeInput(label.trim()).length > 60)) {
    return 'Popisek škály může mít nejvýše 60 znaků'
  }

  if (input.answerType === 'select') {
    const labels = input.options
      .map((option) => sanitizeInput(option.label.trim()))
      .filter(Boolean)

    if (labels.length === 0) {
      return 'Otázka s výběrem musí mít alespoň jednu možnost'
    }
    if (labels.length > PROFILE_SURVEY_CONSTANTS.MAX_OPTIONS_PER_QUESTION) {
      return `Otázka může mít nejvýše ${PROFILE_SURVEY_CONSTANTS.MAX_OPTIONS_PER_QUESTION} možností`
    }
    if (labels.some((label) => label.length > PROFILE_SURVEY_CONSTANTS.OPTION_LABEL_MAX_LENGTH)) {
      return `Možnost může mít nejvýše ${PROFILE_SURVEY_CONSTANTS.OPTION_LABEL_MAX_LENGTH} znaků`
    }
    if (new Set(labels).size !== labels.length) {
      return 'Možnosti se nesmí opakovat'
    }
  }

  return null
}

/** Scale end labels, kept only for emoji_scale questions */
function cleanScaleLabels(input: ProfileQuestionInput) {
  if (input.answerType !== 'emoji_scale') {
    return { scale_min_label: null, scale_max_label: null }
  }
  return {
    scale_min_label: input.scaleMinLabel ? sanitizeInput(input.scaleMinLabel.trim()) || null : null,
    scale_max_label: input.scaleMaxLabel ? sanitizeInput(input.scaleMaxLabel.trim()) || null : null,
  }
}

/** Options with empty labels dropped and text sanitized, keeping their order */
function cleanOptions(input: ProfileQuestionInput) {
  if (input.answerType !== 'select') return []
  return input.options
    .map((option) => ({ id: option.id, label: sanitizeInput(option.label.trim()) }))
    .filter((option) => option.label !== '')
}

/**
 * All questions including hidden ones, for the administration
 */
export async function getAdminProfileQuestions(): Promise<ActionResult<ProfileQuestion[]>> {
  try {
    await requireAdmin()

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('profile_questions')
      .select(QUESTION_COLUMNS)
      .order('position', { ascending: true })

    if (error) {
      logger.error('Error fetching profile questions', error)
      return { success: false, error: 'Nepodařilo se načíst otázky' }
    }

    const questions: ProfileQuestion[] = (data || []).map((question) => ({
      id: question.id,
      questionText: question.question_text,
      helpText: question.help_text,
      answerType: question.answer_type as ProfileQuestionAnswerType,
      position: question.position,
      isActive: question.is_active,
      scaleMinLabel: question.scale_min_label,
      scaleMaxLabel: question.scale_max_label,
      options: (question.profile_question_options || [])
        .map((option) => ({ id: option.id, label: option.label, position: option.position }))
        .sort((a, b) => a.position - b.position),
    }))

    return { success: true, data: questions }
  } catch (error) {
    logger.error('Error fetching profile questions', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při načítání otázek',
    }
  }
}

/**
 * Create a new question (appended at the end)
 */
export async function createProfileQuestion(input: ProfileQuestionInput): Promise<ActionResult<string>> {
  try {
    await requireAdmin()

    const validationError = validateQuestionInput(input)
    if (validationError) {
      return { success: false, error: validationError }
    }

    const supabase = createAdminClient()

    const { data: last } = await supabase
      .from('profile_questions')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: question, error } = await supabase
      .from('profile_questions')
      .insert({
        question_text: sanitizeInput(input.questionText.trim()),
        help_text: input.helpText ? sanitizeInput(input.helpText.trim()) || null : null,
        answer_type: input.answerType,
        is_active: input.isActive,
        position: (last?.position ?? -1) + 1,
        ...cleanScaleLabels(input),
      })
      .select('id')
      .single()

    if (error || !question) {
      logger.error('Error creating profile question', error)
      return { success: false, error: 'Nepodařilo se vytvořit otázku' }
    }

    const options = cleanOptions(input)
    if (options.length > 0) {
      const { error: optionsError } = await supabase
        .from('profile_question_options')
        .insert(options.map((option, index) => ({
          question_id: question.id,
          label: option.label,
          position: index,
        })))

      if (optionsError) {
        logger.error('Error creating profile question options', optionsError)
        return { success: false, error: 'Otázka byla vytvořena, ale možnosti se nepodařilo uložit' }
      }
    }

    return { success: true, data: question.id }
  } catch (error) {
    logger.error('Error creating profile question', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při vytváření otázky',
    }
  }
}

/**
 * Update a question and synchronise its options.
 * Options kept in the form retain their id, so already given answers stay valid.
 */
export async function updateProfileQuestion(
  questionId: string,
  input: ProfileQuestionInput
): Promise<ActionResult> {
  try {
    await requireAdmin()

    const validationError = validateQuestionInput(input)
    if (validationError) {
      return { success: false, error: validationError }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('profile_questions')
      .update({
        question_text: sanitizeInput(input.questionText.trim()),
        help_text: input.helpText ? sanitizeInput(input.helpText.trim()) || null : null,
        answer_type: input.answerType,
        is_active: input.isActive,
        ...cleanScaleLabels(input),
      })
      .eq('id', questionId)

    if (error) {
      logger.error('Error updating profile question', error)
      return { success: false, error: 'Nepodařilo se uložit otázku' }
    }

    const options = cleanOptions(input)
    const keptIds = options.map((option) => option.id).filter((id): id is string => Boolean(id))

    // Remove options the admin deleted. Answers pointing at a removed option
    // are deleted with it (ON DELETE CASCADE) - renaming an option instead
    // keeps them.
    let deleteQuery = supabase
      .from('profile_question_options')
      .delete()
      .eq('question_id', questionId)

    if (keptIds.length > 0) {
      deleteQuery = deleteQuery.not('id', 'in', `(${keptIds.join(',')})`)
    }

    const { error: deleteError } = await deleteQuery
    if (deleteError) {
      logger.error('Error removing profile question options', deleteError)
      return { success: false, error: 'Nepodařilo se odstranit smazané možnosti' }
    }

    for (const [index, option] of options.entries()) {
      if (option.id) {
        const { error: updateError } = await supabase
          .from('profile_question_options')
          .update({ label: option.label, position: index })
          .eq('id', option.id)

        if (updateError) {
          logger.error('Error updating profile question option', updateError)
          return { success: false, error: 'Nepodařilo se uložit možnosti' }
        }
      } else {
        const { error: insertError } = await supabase
          .from('profile_question_options')
          .insert({ question_id: questionId, label: option.label, position: index })

        if (insertError) {
          logger.error('Error inserting profile question option', insertError)
          return { success: false, error: 'Nepodařilo se uložit možnosti' }
        }
      }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error updating profile question', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při ukládání otázky',
    }
  }
}

/**
 * Show or hide a question in the profile without touching the collected answers
 */
export async function setProfileQuestionActive(
  questionId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin()

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('profile_questions')
      .update({ is_active: isActive })
      .eq('id', questionId)

    if (error) {
      logger.error('Error toggling profile question', error)
      return { success: false, error: 'Nepodařilo se změnit viditelnost otázky' }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error toggling profile question', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při změně viditelnosti',
    }
  }
}

/**
 * Delete a question together with all answers to it
 */
export async function deleteProfileQuestion(questionId: string): Promise<ActionResult> {
  try {
    await requireAdmin()

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('profile_questions')
      .delete()
      .eq('id', questionId)

    if (error) {
      logger.error('Error deleting profile question', error)
      return { success: false, error: 'Nepodařilo se smazat otázku' }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error deleting profile question', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při mazání otázky',
    }
  }
}

/**
 * Move a question one place up or down in the profile
 */
export async function moveProfileQuestion(
  questionId: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  try {
    await requireAdmin()

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('profile_questions')
      .select('id, position')
      .order('position', { ascending: true })

    if (error || !data) {
      logger.error('Error loading question order', error)
      return { success: false, error: 'Nepodařilo se načíst pořadí otázek' }
    }

    const index = data.findIndex((question) => question.id === questionId)
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (index === -1 || targetIndex < 0 || targetIndex >= data.length) {
      return { success: true }
    }

    const reordered = [...data]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    // Rewrite positions so they stay a dense 0..n-1 sequence
    for (const [position, question] of reordered.entries()) {
      const { error: updateError } = await supabase
        .from('profile_questions')
        .update({ position })
        .eq('id', question.id)

      if (updateError) {
        logger.error('Error reordering profile questions', updateError)
        return { success: false, error: 'Nepodařilo se změnit pořadí otázek' }
      }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error reordering profile questions', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při změně pořadí',
    }
  }
}

/** Load answers joined with the answering user */
async function loadRespondents(): Promise<ProfileSurveyRespondent[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profile_answers')
    .select('question_id, answer_text, scale_value, updated_at, profile_question_options(label), profiles(id, email, display_name, user_type, school_name)')
    .order('updated_at', { ascending: false })

  if (error) {
    logger.error('Error fetching profile answers', error)
    throw new Error('Nepodařilo se načíst odpovědi')
  }

  const respondents = new Map<string, ProfileSurveyRespondent>()

  for (const answer of data || []) {
    const profile = answer.profiles
    if (!profile) continue

    let respondent = respondents.get(profile.id)
    if (!respondent) {
      respondent = {
        userId: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        userType: profile.user_type,
        schoolName: profile.school_name,
        updatedAt: answer.updated_at,
        answers: {},
      }
      respondents.set(profile.id, respondent)
    }

    respondent.answers[answer.question_id] =
      answer.profile_question_options?.label
      || answer.answer_text
      || answer.scale_value?.toString()
      || ''
  }

  return Array.from(respondents.values())
}

/**
 * Answers of all users that filled in at least one question
 */
export async function getProfileSurveyResponses(): Promise<
  ActionResult<ProfileSurveyRespondent[]> & { stats?: ProfileSurveyStats }
> {
  try {
    await requireAdmin()

    const respondents = await loadRespondents()

    const answersPerQuestion: Record<string, number> = {}
    for (const respondent of respondents) {
      for (const [questionId, answer] of Object.entries(respondent.answers)) {
        if (answer) {
          answersPerQuestion[questionId] = (answersPerQuestion[questionId] || 0) + 1
        }
      }
    }

    return {
      success: true,
      data: respondents,
      stats: {
        respondents: respondents.length,
        answersPerQuestion,
      },
    }
  } catch (error) {
    logger.error('Error fetching profile survey responses', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při načítání odpovědí',
    }
  }
}

/**
 * Per-option answer counts, for the summary shown under the table
 */
export async function getProfileSurveySummary(): Promise<ActionResult<ProfileSurveyOptionSummary[]>> {
  try {
    await requireAdmin()

    const questionsResult = await getAdminProfileQuestions()
    if (!questionsResult.success || !questionsResult.data) {
      return { success: false, error: questionsResult.error }
    }

    const respondents = await loadRespondents()

    const summaries: ProfileSurveyOptionSummary[] = questionsResult.data.map((question) => {
      const answers = respondents
        .map((respondent) => respondent.answers[question.id])
        .filter((answer): answer is string => Boolean(answer))

      if (question.answerType === 'emoji_scale') {
        return {
          questionId: question.id,
          questionText: question.questionText,
          answerType: question.answerType,
          rows: EMOJI_SCALE.map((emoji, index) => ({
            label: `${emoji} ${index + 1}`,
            count: answers.filter((answer) => answer === String(index + 1)).length,
          })),
        }
      }

      if (question.answerType === 'select') {
        return {
          questionId: question.id,
          questionText: question.questionText,
          answerType: question.answerType,
          rows: question.options.map((option) => ({
            label: option.label,
            count: answers.filter((answer) => answer === option.label).length,
          })),
        }
      }

      // Free text: show the most frequent answers
      const counts = new Map<string, number>()
      for (const answer of answers) {
        const key = answer.trim().toLowerCase()
        counts.set(key, (counts.get(key) || 0) + 1)
      }

      return {
        questionId: question.id,
        questionText: question.questionText,
        answerType: question.answerType,
        rows: Array.from(counts.entries())
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      }
    })

    return { success: true, data: summaries }
  } catch (error) {
    logger.error('Error building profile survey summary', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při načítání souhrnu',
    }
  }
}

/**
 * Export the answers as CSV - one column per question
 */
export async function exportProfileSurveyCSV(): Promise<ActionResult<never> & { csv?: string }> {
  try {
    await requireAdmin()

    const questionsResult = await getAdminProfileQuestions()
    if (!questionsResult.success || !questionsResult.data) {
      return { success: false, error: questionsResult.error }
    }

    const questions = questionsResult.data
    const respondents = await loadRespondents()

    const headers = [
      'email',
      'jmeno',
      'typ_uzivatele',
      'skola',
      ...questions.map((question) => question.questionText),
      'aktualizovano',
    ]

    const rows = respondents.map((respondent) => [
      respondent.email || '',
      respondent.displayName || '',
      respondent.userType === 'teacher' ? 'učitel' : 'neučitel',
      respondent.schoolName || '',
      ...questions.map((question) => respondent.answers[question.id] || ''),
      respondent.updatedAt || '',
    ])

    const csv = [
      headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    return { success: true, csv }
  } catch (error) {
    logger.error('Error exporting profile survey responses', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při exportu',
    }
  }
}

/**
 * Settings of the floating questionnaire
 */
export async function getAdminProfileSurveySettings(): Promise<ActionResult<ProfileSurveySettings>> {
  try {
    await requireAdmin()

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('profile_survey_settings')
      .select('is_active, launcher_label')
      .maybeSingle()

    if (error) {
      logger.error('Error fetching survey settings', error)
      return { success: false, error: 'Nepodařilo se načíst nastavení dotazníku' }
    }

    return {
      success: true,
      data: {
        isActive: data?.is_active ?? false,
        launcherLabel: data?.launcher_label ?? 'Jak se vám tu líbí?',
      },
    }
  } catch (error) {
    logger.error('Error fetching survey settings', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při načítání nastavení',
    }
  }
}

/**
 * Switch the questionnaire on or off and rename the launcher button
 */
export async function updateProfileSurveySettings(
  settings: ProfileSurveySettings
): Promise<ActionResult> {
  try {
    await requireAdmin()

    const launcherLabel = sanitizeInput(settings.launcherLabel.trim())
    if (!launcherLabel) {
      return { success: false, error: 'Popisek tlačítka je povinný' }
    }
    if (launcherLabel.length > PROFILE_SURVEY_CONSTANTS.LAUNCHER_LABEL_MAX_LENGTH) {
      return {
        success: false,
        error: `Popisek tlačítka může mít nejvýše ${PROFILE_SURVEY_CONSTANTS.LAUNCHER_LABEL_MAX_LENGTH} znaků`,
      }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('profile_survey_settings')
      .upsert({ id: true, is_active: settings.isActive, launcher_label: launcherLabel })

    if (error) {
      logger.error('Error saving survey settings', error)
      return { success: false, error: 'Nepodařilo se uložit nastavení dotazníku' }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error saving survey settings', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při ukládání nastavení',
    }
  }
}
