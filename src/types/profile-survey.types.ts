/** Profile survey - optional questions in the user profile, managed in the administration */

export type ProfileQuestionAnswerType = 'text' | 'textarea' | 'select' | 'emoji_scale'

/** Emoji scale rendered for 'emoji_scale' questions, best to worst */
export const EMOJI_SCALE = ['😍', '🙂', '😐', '🙁', '😣'] as const

export interface ProfileQuestionOption {
  id: string
  label: string
  position: number
}

export interface ProfileQuestion {
  id: string
  questionText: string
  helpText: string | null
  answerType: ProfileQuestionAnswerType
  position: number
  isActive: boolean
  /** Empty for every type but 'select' */
  options: ProfileQuestionOption[]
  /** Label under the leftmost emoji, 'emoji_scale' only */
  scaleMinLabel: string | null
  /** Label under the rightmost emoji, 'emoji_scale' only */
  scaleMaxLabel: string | null
}

/** Settings of the floating questionnaire, managed in the administration */
export interface ProfileSurveySettings {
  isActive: boolean
  launcherLabel: string
}

/**
 * Answers keyed by question id. The value is an option id for 'select', the
 * text itself for 'text'/'textarea' and '1'-'5' for 'emoji_scale'.
 * An empty string means unanswered.
 */
export type ProfileAnswerMap = Record<string, string>

/** One user's answers as shown in the administration */
export interface ProfileSurveyRespondent {
  userId: string
  email: string | null
  displayName: string | null
  userType: string
  schoolName: string | null
  updatedAt: string | null
  /** Answer text (option label or free text) keyed by question id */
  answers: Record<string, string>
}
