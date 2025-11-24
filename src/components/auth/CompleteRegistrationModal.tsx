"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { Checkbox } from "@/components/ui/Checkbox"
import { SearchIcon } from "@/components/ui/Icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { Autocomplete } from "@/components/ui/Autocomplete"
import { completeRegistration } from "@/lib/supabase/user-profile"
import { searchSchools } from "@/lib/supabase/schools"
import { getDisplayNameFromAuth } from "@/lib/supabase/user-helpers"
import { AUTH_CONSTANTS } from "@/lib/constants"

interface CompleteRegistrationModalProps {
  onSuccess: () => void
}

const NON_TEACHER_OPTIONS = [
  { value: "student", label: "student/ka" },
  { value: "parent", label: "rodič" },
  { value: "educational_professional", label: "odborná veřejnost ve vzdělávání (metodik/metodička, konzultant/ka, ...)" },
  { value: "ngo_worker", label: "pracovník/pracovnice v neziskovém a nevládním sektoru" },
  { value: "public_sector_worker", label: "pracovník/pracovnice ve státním sektoru" },
  { value: "other", label: "ostatní" },
] as const

export function CompleteRegistrationModal({ onSuccess }: CompleteRegistrationModalProps) {
  const [userType, setUserType] = React.useState<"teacher" | "not-teacher">("not-teacher")
  const [displayName, setDisplayName] = React.useState("")
  const [schoolName, setSchoolName] = React.useState("")
  const [category, setCategory] = React.useState<string>("")
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
    setUserType(value as "teacher" | "not-teacher")
    setSchoolName("") // Reset school name
    setCategory("") // Reset category
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate based on user type
      if (userType === "teacher" && !schoolName.trim()) {
        throw new Error("Název školy je povinný")
      }
      if (userType === "not-teacher" && !category) {
        throw new Error("Kategorie je povinná")
      }

      await completeRegistration({
        displayName: displayName.trim() || undefined,
        userType,
        schoolName: userType === "teacher" ? schoolName.trim() : undefined,
        category: userType === "not-teacher" ? category as "student" | "parent" | "educational_professional" | "ngo_worker" | "public_sector_worker" | "other" : undefined,
        emailConsent,
      })
      
      // After successful completion:
      onSuccess()
    } catch (error) {
      console.error("Complete registration error:", error)
      const errorMessage = error instanceof Error ? error.message : "Neznámá chyba"
      setError(`Chyba: ${errorMessage}. Zkuste to prosím znovu nebo kontaktujte podporu.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-3xl font-bold text-center mb-2 text-text">Dokončení registrace</h2>
      <p className="text-sm text-center text-text-secondary mb-8">
        Pomozte nám lépe přizpůsobit platformu vaší výuce. Vyberte roli a zadejte název školy.
      </p>

      <form onSubmit={handleComplete} className="space-y-6">
        {/* Display Name Field */}
        <div className="space-y-2">
          <Label htmlFor="display-name">
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
          />
          <p className="text-xs text-gray-500">
            Toto jméno se zobrazí v profilu. Můžete jej změnit kdykoli v nastavení. Maximum {AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH} znaků.
          </p>
        </div>

        <div className="space-y-4">
          <RadioGroup value={userType} onValueChange={handleUserTypeChange}>
            <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all">
              <RadioGroupItem value="teacher" id="teacher" />
              <Label htmlFor="teacher" className="flex-1 cursor-pointer font-normal select-none">
                Jsem učitel
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all">
              <RadioGroupItem value="not-teacher" id="not-teacher" />
              <Label htmlFor="not-teacher" className="flex-1 cursor-pointer font-normal select-none">
                Nejsem učitel
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          {userType === "teacher" ? (
            <>
              <Label htmlFor="school-name">
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
              />
            </>
          ) : (
            <>
              <Label htmlFor="organization-type">
                Kategorie <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isLoading}
              >
                <SelectTrigger id="organization-type">
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

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="email-consent"
            checked={emailConsent}
            onCheckedChange={(checked) => setEmailConsent(checked as boolean)}
            disabled={isLoading}
            className="mt-0.5"
          />
          <label
            htmlFor="email-consent"
            className="text-sm leading-relaxed cursor-pointer select-none hover:text-text transition-colors peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Souhlasím se zasíláním informačních e-mailů.
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 bg-primary text-white hover:bg-primary-hover transition-all hover:shadow-md"
          disabled={isLoading || (userType === "teacher" ? !schoolName.trim() : !category)}
        >
          {isLoading ? "Dokončování..." : "Dokončit"}
        </Button>
      </form>
    </div>
  )
}
