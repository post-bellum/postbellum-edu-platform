import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
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
    <div className="bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden w-full" data-testid="display-name-section">
      <div className="px-5 py-7 space-y-7">
        <div className="px-3">
          <h2 className="text-lg font-semibold text-black leading-display mb-1.5">Zobrazované jméno</h2>
          <p className="text-base text-text-subtle leading-[1.5]">
            Zadejte své celé jméno nebo zobrazované jméno, které chcete použít:
          </p>
        </div>
        <div className="flex flex-col max-w-[480px]">
          <Label htmlFor="display-name-input" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
            Zobrazované jméno
          </Label>
          <Input
            id="display-name-input"
            type="text"
            placeholder="Vaše jméno"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSaving) {
                e.preventDefault()
                onSave()
              }
            }}
            maxLength={AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH}
            disabled={isSaving}
            data-testid="display-name-input"
          />
        </div>
      </div>
      <div className="border-t border-grey-200 px-5 pt-4 pb-7">
        <div className="flex items-center justify-between gap-10 px-2">
          <p className="text-xs text-text-subtle leading-[1.5] flex-1">
            Toto jméno se zobrazí v profilu. Můžete jej změnit kdykoli v nastavení. Maximum 32 znaků.
          </p>
          <Button 
            variant="primary" 
            size="small"
            onClick={onSave} 
            disabled={isSaving}
            data-testid="display-name-save-button"
          >
            {isSaving ? 'Ukládám...' : 'Uložit'}
          </Button>
        </div>
      </div>
    </div>
  )
}

