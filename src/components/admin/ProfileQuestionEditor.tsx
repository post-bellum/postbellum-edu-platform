'use client'

import * as React from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { PROFILE_SURVEY_CONSTANTS } from '@/lib/constants'
import type { ProfileQuestionInput } from '@/app/actions/admin-profile-survey'
import type { ProfileQuestion, ProfileQuestionAnswerType } from '@/types/profile-survey.types'

interface ProfileQuestionEditorProps {
  /** Question being edited, or undefined when creating a new one */
  question?: ProfileQuestion
  onSubmit: (input: ProfileQuestionInput) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

type OptionDraft = { key: string; id?: string; label: string }

let optionKeyCounter = 0
const nextOptionKey = () => `new-option-${optionKeyCounter++}`

export function ProfileQuestionEditor({
  question,
  onSubmit,
  onCancel,
  isSaving,
}: ProfileQuestionEditorProps) {
  const [questionText, setQuestionText] = React.useState(question?.questionText ?? '')
  const [helpText, setHelpText] = React.useState(question?.helpText ?? '')
  const [answerType, setAnswerType] = React.useState<ProfileQuestionAnswerType>(
    question?.answerType ?? 'select'
  )
  const [isActive, setIsActive] = React.useState(question?.isActive ?? true)
  const [scaleMinLabel, setScaleMinLabel] = React.useState(question?.scaleMinLabel ?? 'Skvěle')
  const [scaleMaxLabel, setScaleMaxLabel] = React.useState(question?.scaleMaxLabel ?? 'Spíš špatně')
  const [options, setOptions] = React.useState<OptionDraft[]>(
    () => question?.options.map((option) => ({ key: option.id, id: option.id, label: option.label }))
      ?? [{ key: nextOptionKey(), label: '' }]
  )
  const [error, setError] = React.useState<string | null>(null)

  const updateOption = (index: number, label: string) => {
    setOptions((prev) => prev.map((option, i) => (i === index ? { ...option, label } : option)))
  }

  const addOption = () => {
    setOptions((prev) =>
      prev.length < PROFILE_SURVEY_CONSTANTS.MAX_OPTIONS_PER_QUESTION
        ? [...prev, { key: nextOptionKey(), label: '' }]
        : prev
    )
  }

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  const moveOption = (index: number, direction: -1 | 1) => {
    const target = index + direction
    setOptions((prev) => {
      if (target < 0 || target >= prev.length) return prev
      const updated = [...prev]
      ;[updated[index], updated[target]] = [updated[target], updated[index]]
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!questionText.trim()) {
      setError('Znění otázky je povinné')
      return
    }
    if (answerType === 'select' && options.every((option) => !option.label.trim())) {
      setError('Otázka s výběrem musí mít alespoň jednu možnost')
      return
    }

    await onSubmit({
      questionText: questionText.trim(),
      helpText: helpText.trim() || null,
      answerType,
      isActive,
      options: options
        .filter((option) => option.label.trim() !== '')
        .map((option) => ({ id: option.id, label: option.label.trim() })),
      scaleMinLabel: scaleMinLabel.trim() || null,
      scaleMaxLabel: scaleMaxLabel.trim() || null,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-grey-200 rounded-2xl p-5 bg-grey-50 space-y-5"
      data-testid="profile-question-editor"
    >
      <div className="flex flex-col max-w-[560px]">
        <Label htmlFor="question-text" className="px-2.5 py-1 text-sm text-text-subtle">
          Znění otázky <span className="text-red-500">*</span>
        </Label>
        <Input
          id="question-text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          maxLength={PROFILE_SURVEY_CONSTANTS.QUESTION_TEXT_MAX_LENGTH}
          placeholder="Např. Délka praxe"
          disabled={isSaving}
          data-testid="question-text-input"
        />
      </div>

      <div className="flex flex-col max-w-[560px]">
        <Label htmlFor="question-help" className="px-2.5 py-1 text-sm text-text-subtle">
          Popisek / nápověda
        </Label>
        <Input
          id="question-help"
          value={helpText}
          onChange={(e) => setHelpText(e.target.value)}
          maxLength={PROFILE_SURVEY_CONSTANTS.HELP_TEXT_MAX_LENGTH}
          placeholder="Nepovinný text - u textových otázek slouží jako placeholder"
          disabled={isSaving}
          data-testid="question-help-input"
        />
      </div>

      <div className="flex flex-col max-w-[280px]">
        <Label htmlFor="question-type" className="px-2.5 py-1 text-sm text-text-subtle">
          Typ odpovědi
        </Label>
        <Select
          value={answerType}
          onValueChange={(value) => setAnswerType(value as ProfileQuestionAnswerType)}
          disabled={isSaving}
        >
          <SelectTrigger id="question-type" data-testid="question-type-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="select">Výběr z možností</SelectItem>
            <SelectItem value="emoji_scale">Emoji škála (1–5)</SelectItem>
            <SelectItem value="text">Krátký text</SelectItem>
            <SelectItem value="textarea">Delší text</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {answerType === 'select' && (
        <div className="space-y-3 max-w-[560px]">
          <Label className="px-2.5 text-sm text-text-subtle">Možnosti</Label>
          {options.map((option, index) => (
            <div key={option.key} className="flex items-center gap-2">
              <Input
                value={option.label}
                onChange={(e) => updateOption(index, e.target.value)}
                maxLength={PROFILE_SURVEY_CONSTANTS.OPTION_LABEL_MAX_LENGTH}
                placeholder={`Možnost ${index + 1}`}
                disabled={isSaving}
                data-testid={`question-option-input-${index}`}
              />
              <button
                type="button"
                onClick={() => moveOption(index, -1)}
                disabled={index === 0 || isSaving}
                className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors"
                title="Posunout nahoru"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveOption(index, 1)}
                disabled={index === options.length - 1 || isSaving}
                className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors"
                title="Posunout dolů"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length === 1 || isSaving}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-30 transition-colors"
                title="Odebrat možnost"
                data-testid={`question-option-remove-${index}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={addOption}
            disabled={isSaving || options.length >= PROFILE_SURVEY_CONSTANTS.MAX_OPTIONS_PER_QUESTION}
            data-testid="question-option-add"
          >
            <Plus className="w-4 h-4" />
            Přidat možnost
          </Button>
          <p className="px-2.5 text-xs text-text-subtle">
            Přejmenování možnosti zachová již uložené odpovědi. Smazání možnosti smaže i odpovědi, které ji používaly.
          </p>
        </div>
      )}

      {answerType === 'emoji_scale' && (
        <div className="flex flex-col sm:flex-row gap-4 max-w-[560px]">
          <div className="flex flex-col flex-1">
            <Label htmlFor="scale-min-label" className="px-2.5 py-1 text-sm text-text-subtle">
              Popisek u prvního emoji
            </Label>
            <Input
              id="scale-min-label"
              value={scaleMinLabel}
              onChange={(e) => setScaleMinLabel(e.target.value)}
              maxLength={PROFILE_SURVEY_CONSTANTS.SCALE_LABEL_MAX_LENGTH}
              placeholder="Skvěle"
              disabled={isSaving}
              data-testid="scale-min-label-input"
            />
          </div>
          <div className="flex flex-col flex-1">
            <Label htmlFor="scale-max-label" className="px-2.5 py-1 text-sm text-text-subtle">
              Popisek u posledního emoji
            </Label>
            <Input
              id="scale-max-label"
              value={scaleMaxLabel}
              onChange={(e) => setScaleMaxLabel(e.target.value)}
              maxLength={PROFILE_SURVEY_CONSTANTS.SCALE_LABEL_MAX_LENGTH}
              placeholder="Spíš špatně"
              disabled={isSaving}
              data-testid="scale-max-label-input"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 px-2.5">
        <Switch
          id="question-active"
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={isSaving}
          data-testid="question-active-switch"
        />
        <Label htmlFor="question-active" className="text-sm text-text-subtle font-normal">
          Zobrazovat otázku v profilu
        </Label>
      </div>

      {error && <p className="text-sm text-red-600 px-2.5">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="small" disabled={isSaving} data-testid="question-save-button">
          {isSaving ? 'Ukládám...' : 'Uložit otázku'}
        </Button>
        <Button type="button" variant="secondary" size="small" onClick={onCancel} disabled={isSaving}>
          Zrušit
        </Button>
      </div>
    </form>
  )
}
