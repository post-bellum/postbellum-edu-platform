"use client"

import * as React from "react"
import { getUserProfile, updateProfile } from "@/lib/supabase/user-profile"
import { logger } from "@/lib/logger"

interface ProfileData {
  displayName: string
  userType: "teacher" | "not-teacher"
  schoolName: string
  email: string
}

export function useProfile(isLoggedIn: boolean) {
  const [profile, setProfile] = React.useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  // Load profile data
  React.useEffect(() => {
    async function loadProfile() {
      if (!isLoggedIn) return
      
      setIsLoading(true)
      try {
        const profileData = await getUserProfile()
        if (profileData) {
          setProfile({
            displayName: profileData.displayName || "",
            userType: profileData.userType as "teacher" | "not-teacher",
            schoolName: profileData.schoolName || "",
            email: profileData.email || "",
          })
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

  // Update display name
  const updateDisplayName = React.useCallback(async (displayName: string) => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      await updateProfile({ displayName: displayName.trim() })
      setProfile((prev) => prev ? { ...prev, displayName: displayName.trim() } : null)
      setSuccess("Zobrazované jméno bylo úspěšně uloženo")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      logger.error("Error saving display name", err)
      setError("Nepodařilo se uložit zobrazované jméno")
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Update school name
  const updateSchoolName = React.useCallback(async (schoolName: string) => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      await updateProfile({ schoolName: schoolName.trim() })
      setProfile((prev) => prev ? { ...prev, schoolName: schoolName.trim() } : null)
      setSuccess("Název školy byl úspěšně uložen")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      logger.error("Error saving school name", err)
      setError("Nepodařilo se uložit název školy")
    } finally {
      setIsSaving(false)
    }
  }, [])

  const clearMessages = React.useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  return {
    profile,
    isLoading,
    isSaving,
    error,
    success,
    updateDisplayName,
    updateSchoolName,
    clearMessages,
  }
}

