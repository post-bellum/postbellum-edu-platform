'use client'

import * as React from 'react'
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Download,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ProfileQuestionEditor } from '@/components/admin/ProfileQuestionEditor'
import {
  createProfileQuestion,
  deleteProfileQuestion,
  exportProfileSurveyCSV,
  getAdminProfileQuestions,
  getAdminProfileSurveySettings,
  getProfileSurveyResponses,
  getProfileSurveySummary,
  moveProfileQuestion,
  setProfileQuestionActive,
  updateProfileQuestion,
  updateProfileSurveySettings,
  type ProfileQuestionInput,
  type ProfileSurveyOptionSummary,
  type ProfileSurveyStats,
} from '@/app/actions/admin-profile-survey'
import { PROFILE_SURVEY_CONSTANTS } from '@/lib/constants'
import type {
  ProfileQuestion,
  ProfileSurveyRespondent,
  ProfileSurveySettings,
} from '@/types/profile-survey.types'

const ANSWER_TYPE_LABELS: Record<string, string> = {
  select: 'Výběr',
  emoji_scale: 'Emoji škála',
  text: 'Krátký text',
  textarea: 'Delší text',
}

export function ProfileSurveySection() {
  const [questions, setQuestions] = React.useState<ProfileQuestion[]>([])
  const [respondents, setRespondents] = React.useState<ProfileSurveyRespondent[]>([])
  const [stats, setStats] = React.useState<ProfileSurveyStats | null>(null)
  const [summaries, setSummaries] = React.useState<ProfileSurveyOptionSummary[]>([])
  const [settings, setSettings] = React.useState<ProfileSurveySettings>({
    isActive: false,
    launcherLabel: 'Jak se vám tu líbí?',
  })
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // null = no editor open, 'new' = creating, otherwise the edited question id
  const [editing, setEditing] = React.useState<string | null>(null)
  const [questionToDelete, setQuestionToDelete] = React.useState<ProfileQuestion | null>(null)

  const load = React.useCallback(async () => {
    const [questionsResult, responsesResult, summaryResult, settingsResult] = await Promise.all([
      getAdminProfileQuestions(),
      getProfileSurveyResponses(),
      getProfileSurveySummary(),
      getAdminProfileSurveySettings(),
    ])

    if (questionsResult.success && questionsResult.data) {
      setQuestions(questionsResult.data)
      setError(null)
    } else {
      setError(questionsResult.error || 'Chyba při načítání')
    }

    if (responsesResult.success && responsesResult.data) {
      setRespondents(responsesResult.data)
      setStats(responsesResult.stats || null)
    }

    if (summaryResult.success && summaryResult.data) {
      setSummaries(summaryResult.data)
    }

    if (settingsResult.success && settingsResult.data) {
      setSettings(settingsResult.data)
    }

    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const runAction = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    setSaving(true)
    try {
      const result = await action()
      if (!result.success) {
        setError(result.error || 'Akci se nepodařilo provést')
        return false
      }
      setError(null)
      await load()
      return true
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async (next: ProfileSurveySettings) => {
    setSettings(next)
    await runAction(() => updateProfileSurveySettings(next))
  }

  const handleCreate = async (input: ProfileQuestionInput) => {
    const ok = await runAction(() => createProfileQuestion(input))
    if (ok) setEditing(null)
  }

  const handleUpdate = async (questionId: string, input: ProfileQuestionInput) => {
    const ok = await runAction(() => updateProfileQuestion(questionId, input))
    if (ok) setEditing(null)
  }

  const handleDelete = async () => {
    if (!questionToDelete) return
    const ok = await runAction(() => deleteProfileQuestion(questionToDelete.id))
    if (ok) setQuestionToDelete(null)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await exportProfileSurveyCSV()
      if (result.success && result.csv) {
        // UTF-8 BOM for Excel compatibility
        const blob = new Blob(['\ufeff' + result.csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `dotaznik-profil-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        setError(result.error || 'Chyba při exportu')
      }
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-grey-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-grey-100 rounded w-48" />
          <div className="h-20 bg-grey-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Questionnaire settings */}
      <div className="bg-white rounded-[28px] border border-grey-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-grey-100 flex items-center gap-3">
          <Settings2 className="w-6 h-6 text-emerald-600" />
          <h2 className="font-display text-xl font-semibold">Nastavení dotazníku</h2>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="flex items-start gap-3">
            <Switch
              id="survey-active"
              checked={settings.isActive}
              onCheckedChange={(checked) => handleSaveSettings({ ...settings, isActive: checked })}
              disabled={saving}
              data-testid="survey-active-switch"
            />
            <div>
              <Label htmlFor="survey-active" className="text-md text-text-strong font-medium">
                Dotazník je aktivní
              </Label>
              <p className="text-sm text-text-subtle">
                Když je zapnutý, přihlášeným uživatelům se nabídne plovoucí dotazník.
                Vyplnění je dobrovolné a odpovědi si mohou kdykoli změnit.
              </p>
            </div>
          </div>

          <div className="flex flex-col max-w-[420px]">
            <Label htmlFor="launcher-label" className="px-2.5 py-1 text-sm text-text-subtle">
              Popisek plovoucího tlačítka
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="launcher-label"
                value={settings.launcherLabel}
                onChange={(e) => setSettings((prev) => ({ ...prev, launcherLabel: e.target.value }))}
                maxLength={PROFILE_SURVEY_CONSTANTS.LAUNCHER_LABEL_MAX_LENGTH}
                placeholder="Jak se vám tu líbí?"
                disabled={saving}
                data-testid="launcher-label-input"
              />
              <Button
                variant="primary"
                size="small"
                onClick={() => handleSaveSettings(settings)}
                disabled={saving}
                data-testid="launcher-label-save"
              >
                Uložit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Question management */}
      <div className="bg-white rounded-[28px] border border-grey-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-grey-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-emerald-600" />
              <div>
                <h2 className="font-display text-xl font-semibold">Otázky v profilu</h2>
                <p className="text-sm text-text-subtle">
                  Otázky jsou pro uživatele nepovinné. Tady je můžete upravovat, přidávat i skrývat.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setEditing('new')}
              disabled={saving || editing === 'new'}
              variant="primary"
              size="small"
              data-testid="add-question-button"
            >
              <Plus className="w-4 h-4" />
              Přidat otázku
            </Button>
          </div>
        </div>

        <div className="divide-y divide-grey-100">
          {questions.length === 0 && editing !== 'new' && (
            <div className="px-6 py-12 text-center text-text-subtle">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Zatím nejsou nastavené žádné otázky</p>
            </div>
          )}

          {questions.map((question, index) => (
            <div key={question.id} className="px-6 py-4">
              {editing === question.id ? (
                <ProfileQuestionEditor
                  question={question}
                  onSubmit={(input) => handleUpdate(question.id, input)}
                  onCancel={() => setEditing(null)}
                  isSaving={saving}
                />
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text-strong break-words">
                        {question.questionText}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-grey-100 text-text-subtle">
                        {ANSWER_TYPE_LABELS[question.answerType]}
                      </span>
                      {!question.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Skrytá
                        </span>
                      )}
                      <span className="text-xs text-text-subtle">
                        {stats?.answersPerQuestion[question.id] || 0}× zodpovězeno
                      </span>
                    </div>
                    {question.helpText && (
                      <p className="text-sm text-text-subtle mt-1 break-words">{question.helpText}</p>
                    )}
                    {question.answerType === 'select' && (
                      <p className="text-sm text-text-subtle mt-1 break-words">
                        {question.options.map((option) => option.label).join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => runAction(() => moveProfileQuestion(question.id, 'up'))}
                      disabled={index === 0 || saving}
                      className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors"
                      title="Posunout nahoru"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction(() => moveProfileQuestion(question.id, 'down'))}
                      disabled={index === questions.length - 1 || saving}
                      className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors"
                      title="Posunout dolů"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction(() => setProfileQuestionActive(question.id, !question.isActive))}
                      disabled={saving}
                      className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors"
                      title={question.isActive ? 'Skrýt v profilu' : 'Zobrazit v profilu'}
                      data-testid={`question-toggle-${question.id}`}
                    >
                      {question.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(question.id)}
                      disabled={saving}
                      className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors"
                      title="Upravit otázku"
                      data-testid={`question-edit-${question.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionToDelete(question)}
                      disabled={saving}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-30 transition-colors"
                      title="Smazat otázku"
                      data-testid={`question-delete-${question.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {editing === 'new' && (
            <div className="px-6 py-4">
              <ProfileQuestionEditor
                onSubmit={handleCreate}
                onCancel={() => setEditing(null)}
                isSaving={saving}
              />
            </div>
          )}
        </div>
      </div>

      {/* Collected answers */}
      <div className="bg-white rounded-[28px] border border-grey-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-grey-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-emerald-600" />
              <h2 className="font-display text-xl font-semibold">Odpovědi uživatelů</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-subtle">
                Odpovědělo {stats?.respondents || 0} uživatelů
              </span>
              <Button
                onClick={handleExport}
                disabled={exporting || respondents.length === 0}
                variant="secondary"
                size="small"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exportuji...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-h-[500px] overflow-auto">
          {respondents.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-subtle">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Zatím nikdo neodpověděl</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-grey-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider">
                    Uživatel
                  </th>
                  {questions.map((question) => (
                    <th
                      key={question.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider"
                    >
                      {question.questionText}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {respondents.map((respondent) => (
                  <tr key={respondent.userId} className="hover:bg-grey-50 align-top">
                    <td className="px-6 py-4">
                      <span className="block text-sm text-text-strong break-words">
                        {respondent.email || '-'}
                      </span>
                      {respondent.displayName && (
                        <span className="block text-xs text-text-subtle break-words">
                          {respondent.displayName}
                        </span>
                      )}
                    </td>
                    {questions.map((question) => (
                      <td key={question.id} className="px-6 py-4">
                        <span className="text-sm text-text-subtle break-words">
                          {respondent.answers[question.id] || '-'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Per-question summary */}
      {summaries.some((summary) => summary.rows.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {summaries
            .filter((summary) => summary.rows.length > 0)
            .map((summary) => (
              <SummaryCard key={summary.questionId} summary={summary} />
            ))}
        </div>
      )}

      <ConfirmDialog
        open={questionToDelete !== null}
        onOpenChange={(open) => !open && setQuestionToDelete(null)}
        title="Smazat otázku"
        description={
          questionToDelete
            ? `Opravdu chcete smazat otázku „${questionToDelete.questionText}"? Smažou se i všechny uložené odpovědi na ni. Pokud chcete odpovědi zachovat, otázku raději skryjte.`
            : ''
        }
        confirmText="Smazat"
        variant="destructive"
        isLoading={saving}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function SummaryCard({ summary }: { summary: ProfileSurveyOptionSummary }) {
  const total = summary.rows.reduce((sum, row) => sum + row.count, 0)

  return (
    <div className="bg-white rounded-[28px] border border-grey-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-grey-100">
        <h3 className="font-display text-lg font-semibold break-words">{summary.questionText}</h3>
        {summary.answerType === 'text' && (
          <p className="text-xs text-text-subtle">Nejčastější odpovědi</p>
        )}
      </div>
      <ul className="divide-y divide-grey-100">
        {summary.rows.map((row) => (
          <li key={row.label} className="px-6 py-3 flex items-center justify-between gap-4">
            <span className="text-sm text-text-subtle break-words">{row.label}</span>
            <span className="text-sm font-semibold text-text-strong whitespace-nowrap">
              {row.count}
              {total > 0 && (
                <span className="ml-1 font-normal text-text-subtle">
                  ({Math.round((row.count / total) * 100)} %)
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
