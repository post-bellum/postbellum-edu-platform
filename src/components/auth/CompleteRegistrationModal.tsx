"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { Checkbox } from "@/components/ui/Checkbox"
import { SearchIcon } from "@/components/ui/Icons"

interface CompleteRegistrationModalProps {
  onSuccess: () => void
}

export function CompleteRegistrationModal({ onSuccess }: CompleteRegistrationModalProps) {
  const [userType, setUserType] = React.useState<"teacher" | "not-teacher">("not-teacher")
  const [schoolName, setSchoolName] = React.useState("")
  const [emailConsent, setEmailConsent] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // TODO: Implement complete registration logic
      console.log("Complete registration:", { userType, schoolName, emailConsent })
      // After successful completion:
      onSuccess()
    } catch (error) {
      console.error("Complete registration error:", error)
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
        <div className="space-y-4">
          <RadioGroup value={userType} onValueChange={(value) => setUserType(value as "teacher" | "not-teacher")}>
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
          <Label htmlFor="school-name">
            Název školy <span className="text-red-500">*</span>
          </Label>
          <Input
            id="school-name"
            type="text"
            placeholder="Hledat školu"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
            disabled={isLoading}
            rightIcon={<SearchIcon />}
          />
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

        <Button 
          type="submit" 
          className="w-full h-12 bg-primary text-white hover:bg-primary-hover transition-all hover:shadow-md"
          disabled={isLoading || !schoolName}
        >
          {isLoading ? "Dokončování..." : "Dokončit"}
        </Button>
      </form>
    </div>
  )
}
