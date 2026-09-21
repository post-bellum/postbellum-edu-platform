'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { PROFILE_SURVEY_CONSTANTS } from '@/lib/constants'
import { EMOJI_SCALE, type ProfileQuestion } from '@/types/profile-survey.types'

interface ProfileSurveyQuestionProps {
  question: ProfileQuestion
  /** Option id, free text or '1'-'5' depending on the answer type */
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

/** Answer control for one step of the questionnaire */
export function ProfileSurveyQuestion({
  question,
  value,
  onChange,
  disabled,
}: ProfileSurveyQuestionProps) {
  if (question.answerType === 'emoji_scale') {
    return (
      <div className="flex flex-col gap-[7px]">
        <div className="flex gap-1 h-[68px]">
          {EMOJI_SCALE.map((emoji, index) => {
            const scaleValue = String(index + 1)
            const isSelected = value === scaleValue

            return (
              <button
                key={emoji}
                type="button"
                onClick={() => onChange(scaleValue)}
                disabled={disabled}
                aria-pressed={isSelected}
                aria-label={`${index + 1} z ${EMOJI_SCALE.length}`}
                className={cn(
                  'flex-1 flex items-center justify-center rounded-[20px] border text-[26px] leading-[1.4] transition-colors disabled:cursor-not-allowed',
                  isSelected
                    ? 'border-brand-primary bg-turquoise-50'
                    : 'border-grey-200 hover:bg-grey-50'
                )}
                data-testid={`survey-emoji-${scaleValue}`}
              >
                {emoji}
              </button>
            )
          })}
        </div>
        {(question.scaleMinLabel || question.scaleMaxLabel) && (
          <div className="flex items-center justify-between px-1.5 text-xs leading-body text-grey-400">
            <span>{question.scaleMinLabel}</span>
            <span className="text-right">{question.scaleMaxLabel}</span>
          </div>
        )}
      </div>
    )
  }

  if (question.answerType === 'select') {
    return (
      <div className="flex flex-col gap-1">
        {question.options.map((option) => {
          const isSelected = value === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={cn(
                'w-full rounded-[20px] border px-5 py-4 text-left text-md leading-headline transition-colors disabled:cursor-not-allowed',
                isSelected
                  ? 'border-brand-primary bg-turquoise-50 text-text-strong'
                  : 'border-grey-200 text-text-subtle hover:bg-grey-50'
              )}
              data-testid={`survey-option-${option.id}`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    )
  }

  if (question.answerType === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={6}
        maxLength={PROFILE_SURVEY_CONSTANTS.ANSWER_TEXT_MAX_LENGTH}
        placeholder={question.helpText || 'Napiš odpověď…'}
        className="w-full resize-none rounded-[20px] border border-grey-200 p-5 text-md leading-headline text-text-strong placeholder:text-grey-400 transition-colors hover:border-grey-300 focus:border-grey-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-grey-50"
        data-testid="survey-textarea"
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      maxLength={PROFILE_SURVEY_CONSTANTS.ANSWER_TEXT_MAX_LENGTH}
      placeholder={question.helpText || 'Napiš odpověď…'}
      className="w-full rounded-[20px] border border-grey-200 px-5 py-4 text-md leading-headline text-text-strong placeholder:text-grey-400 transition-colors hover:border-grey-300 focus:border-grey-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-grey-50"
      data-testid="survey-input"
    />
  )
}
