import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AUTH_CONSTANTS } from '@/lib/constants'

interface DisplayNameSectionProps {
  /** Current display name */
  displayName: string
  /** Callback when display name changes */
  onDisplayNameChange: (value: string) => void
  /** Callback when save is clicked */
  onSave: () => void
  /** Whether the form is currently saving */
  isSaving: boolean
}

export function DisplayNameSection({
  displayName,
  onDisplayNameChange,
  onSave,
  isSaving,
}: DisplayNameSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Zobrazované jméno</h2>
      <p className="text-sm text-gray-600">
        Zadejte své celé jméno nebo jméno, které byste chtěli používat.
      </p>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Vaše jméno"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          maxLength={AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH}
          disabled={isSaving}
        />
        <p className="text-xs text-gray-500">
          Maximální povolená délka je {AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH} znaků.
          {displayName.length > 0 && ` (${displayName.length}/${AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH})`}
        </p>
      </div>
      <Button 
        onClick={onSave} 
        disabled={isSaving}
        className="bg-primary text-white hover:bg-primary-hover"
      >
        {isSaving ? 'Ukládám...' : 'Uložit'}
      </Button>
    </div>
  )
}

