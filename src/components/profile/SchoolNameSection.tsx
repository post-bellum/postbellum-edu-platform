import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Autocomplete } from "@/components/ui/Autocomplete"
import { SearchIcon } from "@/components/ui/Icons"
import { searchSchools } from "@/lib/supabase/schools"

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
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        Název školy <span className="text-red-500">*</span>
      </h2>
      <div className="space-y-2">
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
        />
      </div>
      <Button 
        onClick={onSave} 
        disabled={isSaving || !schoolName.trim()}
        className="bg-primary text-white hover:bg-primary-hover"
      >
        {isSaving ? "Ukládám..." : "Uložit"}
      </Button>
    </div>
  )
}

