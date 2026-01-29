import * as React from 'react'
import { Autocomplete } from '@/components/ui/Autocomplete'
import { Label } from '@/components/ui/Label'
import { SearchIcon } from '@/components/icons'
import { searchSchools } from '@/lib/supabase/schools'

interface SchoolNameSectionProps {
  /** Current school name */
  schoolName: string
  /** Callback when school name changes */
  onSchoolNameChange: (value: string) => void
  /** Callback when save is clicked */
  onSave: () => void
  /** Whether the form is currently saving */
  isSaving: boolean
}

export function SchoolNameSection({
  schoolName,
  onSchoolNameChange,
  onSave,
  isSaving,
}: SchoolNameSectionProps) {
  return (
    <div className="flex flex-col w-full" data-testid="school-name-section">
      <Label htmlFor="school-name-edit" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
        Název školy <span className="text-red-500">*</span>
      </Label>
      <Autocomplete
        id="school-name-edit"
        placeholder="Začněte psát název školy..."
        value={schoolName}
        onChange={onSchoolNameChange}
        onSearch={searchSchools}
        required
        disabled={isSaving}
        minChars={2}
        debounceMs={300}
        emptyMessage="Žádné školy nenalezeny"
        loadingMessage="Hledám školy..."
        rightIcon={<SearchIcon />}
        data-testid="school-name-input"
      />
    </div>
  )
}

