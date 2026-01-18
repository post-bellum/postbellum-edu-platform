'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { SearchIcon } from '@/components/ui/Icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Autocomplete } from '@/components/ui/Autocomplete'
import { completeRegistration } from '@/lib/supabase/user-profile'
import { searchSchools } from '@/lib/supabase/schools'
import { getDisplayNameFromAuth } from '@/lib/supabase/user-helpers'
import { AUTH_CONSTANTS } from '@/lib/constants'
import { logger } from '@/lib/logger'

interface CompleteRegistrationModalProps {
  onSuccess: () => void
}

const NON_TEACHER_OPTIONS = [
  { value: 'student', label: 'student/ka' },
  { value: 'parent', label: 'rodič' },
  { value: 'educational_professional', label: 'odborná veřejnost ve vzdělávání (metodik/metodička, konzultant/ka, ...)' },
  { value: 'ngo_worker', label: 'pracovník/pracovnice v neziskovém a nevládním sektoru' },
  { value: 'public_sector_worker', label: 'pracovník/pracovnice ve státním sektoru' },
  { value: 'other', label: 'ostatní' },
] as const

export function CompleteRegistrationModal({ onSuccess }: CompleteRegistrationModalProps) {
  const [userType, setUserType] = React.useState<'teacher' | 'not-teacher'>('not-teacher')
  const [displayName, setDisplayName] = React.useState('')
  const [schoolName, setSchoolName] = React.useState('')
  const [category, setCategory] = React.useState<string>('')
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const [emailConsent, setEmailConsent] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Pre-fill display name from OAuth if available
  React.useEffect(() => {
    const loadDisplayName = async () => {
      const name = await getDisplayNameFromAuth()
      if (name) {
        setDisplayName(name)
      }
    }
    loadDisplayName()
  }, [])

  // Clear fields when switching between teacher and not-teacher
  const handleUserTypeChange = (value: string) => {
    setUserType(value as 'teacher' | 'not-teacher')
    setSchoolName('') // Reset school name
    setCategory('') // Reset category
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate based on user type
      if (userType === 'teacher' && !schoolName.trim()) {
        throw new Error('Název školy je povinný')
      }
      if (userType === 'not-teacher' && !category) {
        throw new Error('Kategorie je povinná')
      }

      if (!termsAccepted) {
        throw new Error('Musíte souhlasit s podmínkami používání')
      }

      await completeRegistration({
        displayName: displayName.trim() || undefined,
        userType,
        schoolName: userType === 'teacher' ? schoolName.trim() : undefined,
        category: userType === 'not-teacher' ? category as 'student' | 'parent' | 'educational_professional' | 'ngo_worker' | 'public_sector_worker' | 'other' : undefined,
        termsAccepted,
        emailConsent,
      })
      
      // After successful completion:
      onSuccess()
    } catch (error) {
      logger.error('Complete registration error', error)
      const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba'
      setError(`Chyba: ${errorMessage}. Zkuste to prosím znovu nebo kontaktujte podporu.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Title & Description */}
      <div className="text-center">
        <h2 className="font-display text-[32px] sm:text-[32px] font-semibold leading-[1.2] text-grey-950 mb-2.5">
          Dokončení registrace
        </h2>
        <p className="text-base leading-[1.5] text-text-subtle">
          Pomozte nám lépe přizpůsobit platformu vaší výuce. Vyberte roli a zadejte název školy.
        </p>
      </div>

      {/* Content Stack */}
      <form onSubmit={handleComplete} className="flex flex-col gap-5">
        {/* Display Name Field */}
        <div className="flex flex-col">
          <Label htmlFor="display-name" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
            Zobrazované jméno
          </Label>
          <Input
            id="display-name"
            type="text"
            placeholder="Vaše jméno (volitelné)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH}
            disabled={isLoading}
            data-testid="complete-registration-display-name-input"
          />
          <p className="text-xs text-text-subtle px-2.5 py-1.5">
            Toto jméno se zobrazí v profilu. Můžete jej změnit kdykoli v nastavení. Maximum {AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH} znaků.
          </p>
        </div>

        {/* User Type Radio */}
        <div className="flex gap-1.5 w-full">
          <button
            type="button"
            className={`flex-1 flex items-center gap-2 rounded-2xl px-5 py-3 cursor-pointer transition-all ${
              userType === 'teacher' ? 'bg-grey-200' : 'bg-grey-100 hover:bg-grey-200'
            }`}
            onClick={() => handleUserTypeChange('teacher')}
            data-testid="teacher-radio-option"
          >
            <span 
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                userType === 'teacher' 
                  ? 'bg-brand-primary border-brand-primary' 
                  : 'bg-transparent border-grey-400'
              }`}
              data-testid="teacher-radio"
            >
              {userType === 'teacher' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0px_2px_3px_0px_rgba(0,0,0,0.1)]" />
              )}
            </span>
            <span className="flex-1 font-normal select-none text-base leading-[1.5] text-text-subtle text-left">
              Jsem učitel
            </span>
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center gap-2 rounded-2xl px-5 py-3 cursor-pointer transition-all ${
              userType === 'not-teacher' ? 'bg-grey-200' : 'bg-grey-100 hover:bg-grey-200'
            }`}
            onClick={() => handleUserTypeChange('not-teacher')}
            data-testid="not-teacher-radio-option"
          >
            <span 
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                userType === 'not-teacher' 
                  ? 'bg-brand-primary border-brand-primary' 
                  : 'bg-transparent border-grey-400'
              }`}
              data-testid="not-teacher-radio"
            >
              {userType === 'not-teacher' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0px_2px_3px_0px_rgba(0,0,0,0.1)]" />
              )}
            </span>
            <span className="flex-1 font-normal select-none text-base leading-[1.5] text-text-subtle text-left">
              Nejsem učitel
            </span>
          </button>
        </div>

        {/* School Name or Category */}
        <div className="flex flex-col">
          {userType === 'teacher' ? (
            <>
              <Label htmlFor="school-name" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
                Název školy <span className="text-red-500">*</span>
              </Label>
              <Autocomplete
                id="school-name"
                placeholder="Začněte psát název školy..."
                value={schoolName}
                onChange={setSchoolName}
                onSearch={searchSchools}
                required
                disabled={isLoading}
                minChars={2}
                debounceMs={300}
                emptyMessage="Žádné školy nenalezeny"
                loadingMessage="Hledám školy..."
                rightIcon={<SearchIcon />}
                data-testid="complete-registration-school-name-input"
              />
            </>
          ) : (
            <>
              <Label htmlFor="organization-type" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
                Kategorie <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isLoading}
              >
                <SelectTrigger id="organization-type" data-testid="complete-registration-category-select">
                  <SelectValue placeholder="Vyberte kategorii" />
                </SelectTrigger>
                <SelectContent>
                  {NON_TEACHER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-[15px]">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              disabled={isLoading}
              data-testid="terms-checkbox"
            />
            <label
              htmlFor="terms"
              className="text-sm leading-[1.4] text-text-subtle cursor-pointer select-none hover:text-grey-950 transition-colors peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Souhlasím s podmínkami používání <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="flex items-center gap-2.5">
            <Checkbox
              id="email-consent"
              checked={emailConsent}
              onCheckedChange={(checked) => setEmailConsent(checked as boolean)}
              disabled={isLoading}
              data-testid="email-consent-checkbox"
            />
            <label
              htmlFor="email-consent"
              className="text-sm leading-[1.4] text-text-subtle cursor-pointer select-none hover:text-grey-950 transition-colors peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Souhlasím se zasíláním informačních e-mailů.
            </label>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          size="large"
          className="w-full"
          disabled={isLoading || !termsAccepted || (userType === 'teacher' ? !schoolName.trim() : !category)}
          data-testid="complete-registration-submit-button"
        >
          {isLoading ? 'Dokončování...' : 'Dokončit registraci'}
        </Button>
      </form>
    </div>
  )
}
