'use client'

import * as React from 'react'
import {
  getActiveProfileQuestions,
  getMyProfileAnswers,
  getProfileSurveySettings,
  saveMyProfileAnswer,
  skipMyProfileQuestion,
} from '@/lib/supabase/profile-survey'
import { logger } from '@/lib/logger'
import type {
  ProfileAnswerMap,
  ProfileQuestion,
  ProfileSurveySettings,
} from '@/types/profile-survey.types'

/**
 * Loads the questionnaire (settings, questions and the user's own answers)
 * and saves answers one question at a time.
 */
export function useProfileSurvey(isLoggedIn: boolean) {
  const [settings, setSettings] = React.useState<ProfileSurveySettings | null>(null)
  const [questions, setQuestions] = React.useState<ProfileQuestion[]>([])
  const [answers, setAnswers] = React.useState<ProfileAnswerMap>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  // Whether every question was already answered when the page loaded. Derived
  // once, not from the live answers, so picking the last answer does not count
  // as finished before the user submits it.
  const [wasCompleteOnLoad, setWasCompleteOnLoad] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      if (!isLoggedIn) {
        setIsLoading(false)
        return
      }

      try {
        const loadedSettings = await getProfileSurveySettings()
        if (cancelled) return

        setSettings(loadedSettings)

        // Nothing else is needed while the questionnaire is switched off
        if (!loadedSettings?.isActive) return

        const [loadedQuestions, loadedAnswers] = await Promise.all([
          getActiveProfileQuestions(),
          getMyProfileAnswers(),
        ])
        if (cancelled) return

        const handled = new Set(loadedAnswers.handledQuestionIds)

        setQuestions(loadedQuestions)
        setAnswers(loadedAnswers.values)
        // A skipped question counts as dealt with, otherwise a user who does
        // not want to answer would keep being offered the questionnaire
        setWasCompleteOnLoad(
          loadedQuestions.length > 0
          && loadedQuestions.every((question) => handled.has(question.id))
        )
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  /** Remember an answer locally, without touching the database yet */
  const setAnswer = React.useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }, [])

  /** Move past a question without answering it */
  const skipQuestion = React.useCallback(async (question: ProfileQuestion) => {
    setIsSaving(true)
    try {
      await skipMyProfileQuestion(question)
      return true
    } catch (err) {
      logger.error('Error skipping profile survey question', err)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  /** Persist the answer to a single question */
  const saveAnswer = React.useCallback(async (question: ProfileQuestion, value: string) => {
    setIsSaving(true)
    try {
      await saveMyProfileAnswer(question, value)
      return true
    } catch (err) {
      logger.error('Error saving profile survey answer', err)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  return {
    settings,
    questions,
    answers,
    isLoading,
    isSaving,
    wasCompleteOnLoad,
    setAnswer,
    saveAnswer,
    skipQuestion,
  }
}
