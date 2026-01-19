import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { AUTH_CONSTANTS } from '@/lib/constants'
import { deleteUserAccount } from '@/lib/supabase/account-deletion'
import { logger } from '@/lib/logger'

export function DeleteAccountSection() {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = React.useState('')
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION) {
      setError(`Pro potvrzení zadejte prosím '${AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION}'`)
      return
    }

    setIsDeleting(true)
    setError(null)
    
    try {
      await deleteUserAccount()
      // Force a full page reload to clear all auth state and context
      window.location.href = '/'
    } catch (err) {
      logger.error('Error deleting account', err)
      setError('Nepodařilo se odstranit účet. Zkuste to prosím znovu nebo kontaktujte podporu.')
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeleteConfirmation('')
    }
  }

  const handleCancel = () => {
    setShowDeleteDialog(false)
    setDeleteConfirmation('')
    setError(null)
  }

  return (
    <>
      <div className="bg-red-50 border border-red-300 rounded-lg p-6 space-y-4" data-testid="delete-account-section">
        <h2 className="text-xl font-semibold text-red-900">Odstranit účet</h2>
        <p className="text-sm text-red-800">
          Toto odstraní váš osobní účet permanentně. Vezměte prosím na vědomí, že tato akce je nevratná, takže postupujte opatrně.
        </p>
        <p className="text-sm font-medium text-red-600">
          Tato akce je nevratná!
        </p>
        <Button 
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={() => setShowDeleteDialog(true)}
          data-testid="delete-account-open-button"
        >
          Odstranit účet
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]" data-testid="delete-account-modal">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-2" data-testid="delete-account-modal-title">
                Opravdu chcete odstranit účet?
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                Tato akce je <strong>nevratná</strong>. Všechny vaše data budou trvale smazána:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
                <li>Profilové údaje</li>
                <li>Nastavení účtu</li>
                <li>Historie aktivit</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                Pro potvrzení napište: <span className="font-mono font-bold">{AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION}</span>
              </Label>
              <Input
                id="delete-confirmation"
                type="text"
                placeholder={`Napište ${AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION}`}
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                disabled={isDeleting}
                className="font-mono"
                data-testid="delete-account-confirmation-input"
              />
            </div>

            {error && (
              <div 
                className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm"
                data-testid="delete-account-error"
              >
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={isDeleting}
                data-testid="delete-account-cancel-button"
              >
                Zrušit
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION}
                data-testid="delete-account-confirm-button"
              >
                {isDeleting ? 'Odstraňuji...' : 'Odstranit účet'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

