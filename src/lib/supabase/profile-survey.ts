'use client'

import { createClient } from './client'
import { sanitizeInput } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { PROFILE_SURVEY_CONSTANTS } from '@/lib/constants'
import type {
  ProfileAnswerMap,
  ProfileQuestion,
  ProfileQuestionAnswerType,
  ProfileSurveySettings,
} from '@/types/profile-survey.types'

const QUESTION_COLUMNS =
  'id, question_text, help_text, answer_type, position, is_active, scale_min_label, scale_max_label, profile_question_options(id, label, position)'

/**
 * Settings of the floating questionnaire. Returns null when the questionnaire
 * is switched off or could not be loaded, so callers render nothing.
 */
export async function getProfileSurveySettings(): Promise<ProfileSurveySettings | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profile_survey_settings')
      .select('is_active, launcher_label')
      .maybeSingle()

    if (error || !data) {
      if (error) logger.error('Error fetching survey settings:', error)
      return null
    }

    return {
      isActive: data.is_active,
      launcherLabel: data.launcher_label,
    }
  } catch (error) {
    logger.error('Error fetching survey settings:', error)
    return null
  }
}

/**
 * Questions currently shown in the questionnaire, ordered as set in admin
 */
export async function getActiveProfileQuestions(): Promise<ProfileQuestion[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profile_questions')
      .select(QUESTION_COLUMNS)
      .eq('is_active', true)
      .order('position', { ascending: true })

    if (error) {
      logger.error('Error fetching profile questions:', error)
      return []
    }

    return (data || []).map((question) => ({
      id: question.id,
      questionText: question.question_text,
      helpText: question.help_text,
      answerType: question.answer_type as ProfileQuestionAnswerType,
      position: question.position,
      isActive: question.is_active,
      scaleMinLabel: question.scale_min_label,
      scaleMaxLabel: question.scale_max_label,
      options: (question.profile_question_options || [])
        .map((option) => ({
          id: option.id,
          label: option.label,
          position: option.position,
        }))
        .sort((a, b) => a.position - b.position),
    }))
  } catch (error) {
    logger.error('Error fetching profile questions:', error)
    return []
  }
}

/**
 * The current user's answers.
 *
 * `values` holds what they answered; `handledQuestionIds` also contains the
 * questions they skipped, so the caller can tell a skipped question from one
 * the user has not been through yet.
 */
export async function getMyProfileAnswers(): Promise<{
  values: ProfileAnswerMap
  handledQuestionIds: string[]
}> {
  const empty = { values: {}, handledQuestionIds: [] }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return empty

    const { data, error } = await supabase
      .from('profile_answers')
      .select('question_id, option_id, answer_text, scale_value, skipped')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Error fetching profile answers:', error)
      return empty
    }

    const values: ProfileAnswerMap = {}
    const handledQuestionIds: string[] = []

    for (const answer of data || []) {
      handledQuestionIds.push(answer.question_id)
      values[answer.question_id] =
        answer.option_id || answer.answer_text || answer.scale_value?.toString() || ''
    }

    return { values, handledQuestionIds }
  } catch (error) {
    logger.error('Error fetching profile answers:', error)
    return empty
  }
}

/**
 * Record that the user moved past a question without answering it
 */
export async function skipMyProfileQuestion(question: ProfileQuestion): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No user logged in')
  }

  const { error } = await supabase
    .from('profile_answers')
    .upsert({
      user_id: user.id,
      question_id: question.id,
      option_id: null,
      answer_text: null,
      scale_value: null,
      skipped: true,
    }, { onConflict: 'user_id,question_id' })

  if (error) {
    logger.error('Error skipping profile question:', error)
    throw error
  }
}

/**
 * Store one answer. Every question is optional - an empty value removes the
 * stored answer, so a user can also take an answer back.
 */
export async function saveMyProfileAnswer(
  question: ProfileQuestion,
  value: string
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No user logged in')
  }

  const row = buildAnswerRow(question, value, user.id)

  if (!row) {
    const { error } = await supabase
      .from('profile_answers')
      .delete()
      .eq('user_id', user.id)
      .eq('question_id', question.id)

    if (error) {
      logger.error('Error clearing profile answer:', error)
      throw error
    }
    return
  }

  const { error } = await supabase
    .from('profile_answers')
    .upsert(row, { onConflict: 'user_id,question_id' })

  if (error) {
    logger.error('Error saving profile answer:', error)
    throw error
  }
}

/** Row for one answer, or null when the answer is empty and should be removed */
function buildAnswerRow(question: ProfileQuestion, value: string, userId: string) {
  const base = {
    user_id: userId,
    question_id: question.id,
    option_id: null as string | null,
    answer_text: null as string | null,
    scale_value: null as number | null,
    // Answering a previously skipped question turns the skip back off
    skipped: false,
  }

  if (question.answerType === 'select') {
    // Ignore a value that is no longer offered (option removed in admin)
    const isKnownOption = question.options.some((option) => option.id === value)
    return value && isKnownOption ? { ...base, option_id: value } : null
  }

  if (question.answerType === 'emoji_scale') {
    const scaleValue = Number(value)
    return Number.isInteger(scaleValue) && scaleValue >= 1 && scaleValue <= 5
      ? { ...base, scale_value: scaleValue }
      : null
  }

  const text = sanitizeInput(value.trim())
  if (!text) return null
  if (text.length > PROFILE_SURVEY_CONSTANTS.ANSWER_TEXT_MAX_LENGTH) {
    throw new Error(`Answer must be ${PROFILE_SURVEY_CONSTANTS.ANSWER_TEXT_MAX_LENGTH} characters or less`)
  }
  return { ...base, answer_text: text }
}
