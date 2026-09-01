'use client'

import * as React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ProfileSurveyQuestion } from '@/components/survey/ProfileSurveyQuestion'
import type { ProfileQuestion } from '@/types/profile-survey.types'

interface ProfileSurveyPopupProps {
  questions: ProfileQuestion[]
  /** Index of the question being answered */
  stepIndex: number
  /** Answer to the current question */
  value: string
  onChange: (value: string) => void
  onContinue: () => void
  onClose: () => void
  /** Thank-you state shown after the last question */
  isFinished: boolean
  isSaving: boolean
}

/** The questionnaire card itself - presentational, driven by ProfileSurveyWidget */
export function ProfileSurveyPopup({
  questions,
  stepIndex,
  value,
  onChange,
  onContinue,
  onClose,
  isFinished,
  isSaving,
}: ProfileSurveyPopupProps) {
  const question = questions[stepIndex]
  const isLastStep = stepIndex === questions.length - 1

  return (
    <div
      role="dialog"
      aria-label="Dotazník"
      className="w-[calc(100vw-3rem)] max-w-[383px] rounded-[28px] border border-grey-100 bg-white p-[15px] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]"
      data-testid="profile-survey-widget"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-3">
        <Image
          src="/logo-storyon.svg"
          alt="storyON"
          width={111}
          height={20}
          className="h-5 w-auto"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít dotazník"
          className="cursor-pointer text-grey-400 transition-colors hover:text-text-strong"
          data-testid="survey-close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {isFinished || !question ? (
        <div className="py-6 text-center">
          <p className="text-lg font-semibold leading-display text-text-strong">
            Děkujeme za odpovědi
          </p>
          <p className="mt-1.5 text-md leading-body text-text-subtle">
            Pomohou nám storyON zlepšovat.
          </p>
        </div>
      ) : (
        <>
          {/* Progress - one segment per question */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {questions.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'h-[3px] flex-1 rounded-[100px]',
                  index <= stepIndex ? 'bg-[#00d48d]' : 'bg-grey-200'
                )}
              />
            ))}
          </div>

          <h2 className="pt-6 pb-4 text-lg font-semibold leading-display text-text-strong">
            {question.questionText}
          </h2>

          <ProfileSurveyQuestion
            question={question}
            value={value}
            onChange={onChange}
            disabled={isSaving}
          />

          <Button
            variant="primary"
            size="medium"
            className="mt-4 w-full"
            onClick={onContinue}
            disabled={!value.trim() || isSaving}
            data-testid="survey-continue"
          >
            {isSaving ? 'Ukládám...' : isLastStep ? 'Odeslat' : 'Pokračovat'}
          </Button>
        </>
      )}
    </div>
  )
}
