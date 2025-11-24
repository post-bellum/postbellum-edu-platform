"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { Autocomplete } from "@/components/ui/Autocomplete"
import { SearchIcon } from "@/components/ui/Icons"
import { Dialog, DialogContent } from "@/components/ui/Dialog"
import { 
  getUserProfile, 
  updateProfile 
} from "@/lib/supabase/user-profile"
import { searchSchools } from "@/lib/supabase/schools"
import { deleteUserAccount } from "@/lib/supabase/account-deletion"
import { useAuth } from "@/lib/supabase/hooks/useAuth"
import { useRouter } from "next/navigation"
import { getGravatarUrl } from "@/lib/gravatar"
import { AUTH_CONSTANTS } from "@/lib/constants"
import { logger } from "@/lib/logger"

export default function ProfilePage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()
  
  // State for profile fields
  const [displayName, setDisplayName] = React.useState("")
  const [userType, setUserType] = React.useState<"teacher" | "not-teacher">("not-teacher")
  const [schoolName, setSchoolName] = React.useState("")
  const [email, setEmail] = React.useState("")
  
  // UI state
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/")
    }
  }, [authLoading, isLoggedIn, router])

  // Load profile data on mount
  React.useEffect(() => {
    async function loadProfile() {
      if (!isLoggedIn) return
      
      setIsLoading(true)
      try {
        const profile = await getUserProfile()
        if (profile) {
          setDisplayName(profile.displayName || "")
          setUserType(profile.userType)
          setSchoolName(profile.schoolName || "")
          setEmail(profile.email || "")
        }
      } catch (err) {
        logger.error("Error loading profile", err)
        setError("Nepodařilo se načíst profil")
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [isLoggedIn])

  // Save display name
  const handleSaveDisplayName = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      await updateProfile({
        displayName: displayName.trim()
      })
      setSuccess("Zobrazované jméno bylo úspěšně uloženo")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      logger.error("Error saving display name", err)
      setError("Nepodařilo se uložit zobrazované jméno")
    } finally {
      setIsSaving(false)
    }
  }

  // Save school name (for teachers)
  const handleSaveSchoolName = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      await updateProfile({
        schoolName: schoolName.trim()
      })
      setSuccess("Název školy byl úspěšně uložen")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      logger.error("Error saving school name", err)
      setError("Nepodařilo se uložit název školy")
    } finally {
      setIsSaving(false)
    }
  }

  // Gravatar URL is now handled by the imported utility function

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION) {
      setError(`Pro potvrzení zadejte prosím '${AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION}'`)
      return
    }

    setIsDeleting(true)
    setError(null)
    
    try {
      // Delete account and sign out
      await deleteUserAccount()
      
      // Redirect to home (after sign out)
      router.push("/")
    } catch (err) {
      logger.error("Error deleting account", err)
      setError("Nepodařilo se odstranit účet. Zkuste to prosím znovu nebo kontaktujte podporu.")
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeleteConfirmation("")
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Načítání profilu...</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Profil</h1>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* User Type Display (Read-only) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Typ účtu</h2>
        <RadioGroup value={userType} disabled>
          <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4 bg-gray-50">
            <RadioGroupItem value="teacher" id="teacher-display" disabled />
            <Label htmlFor="teacher-display" className="flex-1 font-normal opacity-60">
              Jsem učitel
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4 bg-gray-50">
            <RadioGroupItem value="not-teacher" id="not-teacher-display" disabled />
            <Label htmlFor="not-teacher-display" className="flex-1 font-normal opacity-60">
              Nejsem učitel
            </Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-gray-500">
          Typ účtu nelze změnit. Pokud potřebujete změnit typ účtu, kontaktujte podporu.
        </p>
      </div>

      {/* School Name (for teachers) */}
      {userType === "teacher" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            Název školy <span className="text-red-500">*</span>
          </h2>
          <div className="space-y-2">
            <Autocomplete
              id="school-name-edit"
              placeholder="Začněte psát název školy..."
              value={schoolName}
              onChange={setSchoolName}
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
            onClick={handleSaveSchoolName} 
            disabled={isSaving || !schoolName.trim()}
            className="bg-primary text-white hover:bg-primary-hover"
          >
            {isSaving ? "Ukládám..." : "Uložit"}
          </Button>
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Avatar</h2>
        <p className="text-sm text-gray-600">
          Avatar je vaše profilová fotka - každý, kdo navštíví váš profil, uvidí tuto fotku.
        </p>
        <div className="flex items-center space-x-4">
          <img
            src={getGravatarUrl(email)}
            alt="Profile avatar"
            className="w-20 h-20 rounded-full"
          />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Vaše profilová fotka je načtena z Gravatar.com
            </p>
            <a
              href="https://gravatar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Změnit na Gravatar.com →
            </a>
          </div>
        </div>
      </div>

      {/* Display Name Section */}
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
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH}
            disabled={isSaving}
          />
          <p className="text-xs text-gray-500">
            Maximální povolená délka je {AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH} znaků.
            {displayName.length > 0 && ` (${displayName.length}/${AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH})`}
          </p>
        </div>
        <Button 
          onClick={handleSaveDisplayName} 
          disabled={isSaving}
          className="bg-primary text-white hover:bg-primary-hover"
        >
          {isSaving ? "Ukládám..." : "Uložit"}
        </Button>
      </div>

      {/* Delete Account Section */}
      <div className="bg-red-50 border border-red-300 rounded-lg p-6 space-y-4">
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
        >
          Odstranit účet
        </Button>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">
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
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setDeleteConfirmation("")
                  setError(null)
                }}
                disabled={isDeleting}
              >
                Zrušit
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION}
              >
                {isDeleting ? "Odstraňuji..." : "Odstranit účet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


