'use client'

import * as React from 'react'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { useProfileSurvey } from '@/lib/supabase/hooks/useProfileSurvey'
import { ProfileSurveyLauncher } from '@/components/survey/ProfileSurveyLauncher'
import { ProfileSurveyPopup } from '@/components/survey/ProfileSurveyPopup'

/** Remembers a dismissal per browser so the popup does not reopen on its own */
const DISMISSED_STORAGE_KEY = 'storyon-survey-dismissed'
/** Delay before the questionnaire opens itself for the first time */
const AUTO_OPEN_DELAY_MS = 3000

function wasDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_STORAGE_KEY) === 'true'
  } catch {
    // Private mode or blocked storage - just treat it as not dismissed
    return false
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, 'true')
  } catch {
    // Nothing to do - the popup may simply open again next time
  }
}

/**
 * Floating questionnaire shown to signed-in users when an admin switched it on.
 * One question per step; each answer is saved on continue, so a half finished
 * questionnaire is never lost and the user can pick it up later.
 *
 * Once all questions are answered the widget stops showing for that user - it
 * only comes back when an admin adds a question they have not answered yet.
 */
export function ProfileSurveyWidget() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const {
    settings,
    questions,
    answers,
    isLoading,
    isSaving,
    wasCompleteOnLoad,
    setAnswer,
    saveAnswer,
  } = useProfileSurvey(isLoggedIn)

  const [isOpen, setIsOpen] = React.useState(false)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [isFinished, setIsFinished] = React.useState(false)
  // Set when the user completes the questionnaire in this session, so the
  // widget disappears on close instead of waiting for the next page load
  const [completedNow, setCompletedNow] = React.useState(false)

  const isAvailable =
    isLoggedIn && !authLoading && !isLoading && Boolean(settings?.isActive) && questions.length > 0

  // Open on its own once, unless the user dismissed it or already answered
  React.useEffect(() => {
    if (!isAvailable || wasCompleteOnLoad || wasDismissed()) return

    const timer = setTimeout(() => setIsOpen(true), AUTO_OPEN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isAvailable, wasCompleteOnLoad])

  // Once every question is answered the questionnaire is done with - it stops
  // showing altogether. It comes back only when an admin adds a new question.
  const isDone = wasCompleteOnLoad || completedNow

  if (!isAvailable || !settings || (isDone && !isOpen)) {
    return null
  }

  const question = questions[stepIndex]
  const value = question ? answers[question.id] ?? '' : ''

  const handleOpen = () => {
    // Start at the first unanswered question, or at the beginning when done
    const firstUnanswered = questions.findIndex((item) => !answers[item.id])
    setStepIndex(firstUnanswered === -1 ? 0 : firstUnanswered)
    setIsFinished(false)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsFinished(false)
    rememberDismissal()
  }

  const handleContinue = async () => {
    if (!question) return

    const saved = await saveAnswer(question, value)
    if (!saved) return

    if (stepIndex === questions.length - 1) {
      setIsFinished(true)
      setCompletedNow(true)
      rememberDismissal()
      return
    }
    setStepIndex((prev) => prev + 1)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 print:hidden">
      {isOpen ? (
        <ProfileSurveyPopup
          questions={questions}
          stepIndex={stepIndex}
          value={value}
          onChange={(next) => question && setAnswer(question.id, next)}
          onContinue={handleContinue}
          onClose={handleClose}
          isFinished={isFinished}
          isSaving={isSaving}
        />
      ) : (
        <ProfileSurveyLauncher label={settings.launcherLabel} onClick={handleOpen} />
      )}
    </div>
  )
}
