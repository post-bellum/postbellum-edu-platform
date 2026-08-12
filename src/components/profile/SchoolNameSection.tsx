import * as React from 'react'
import { Autocomplete } from '@/components/ui/Autocomplete'
import { Button } from '@/components/ui/Button'
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
    <div className="bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden w-full" data-testid="school-name-section">
      <div className="px-5 py-7 space-y-7">
        <div className="px-3">
          <h2 className="text-lg font-semibold text-black leading-display mb-1.5">Škola</h2>
          <p className="text-base text-text-subtle leading-[1.5]">
            Vyberte školu, na které působíte:
          </p>
        </div>
        <div className="flex flex-col max-w-[480px]">
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
      </div>
      <div className="border-t border-grey-200 px-5 pt-4 pb-7">
        <div className="flex items-center justify-between gap-10 px-2">
          <p className="text-xs text-text-subtle leading-[1.5] flex-1">
            Tato škola se zobrazí ve vašem profilu. Můžete ji kdykoli změnit v nastavení.
          </p>
          <Button
            variant="primary"
            size="small"
            onClick={onSave}
            disabled={isSaving}
            data-testid="school-name-save-button"
          >
            {isSaving ? 'Ukládám...' : 'Uložit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
