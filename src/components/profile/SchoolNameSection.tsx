import * as React from 'react'
import { Autocomplete } from '@/components/ui/Autocomplete'
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
    <div className="w-full" data-testid="school-name-section">
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

