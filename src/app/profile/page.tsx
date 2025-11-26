"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/supabase/hooks/useAuth"
import { useProfile } from "@/lib/supabase/hooks/useProfile"
import {
  AlertMessage,
  UserTypeSection,
  SchoolNameSection,
  AvatarSection,
  DisplayNameSection,
  DeleteAccountSection,
} from "@/components/profile"

export default function ProfilePage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const {
    profile,
    isLoading,
    isSaving,
    error,
    success,
    updateDisplayName,
    updateSchoolName,
  } = useProfile(isLoggedIn)

  // Local state for form inputs
  const [displayName, setDisplayName] = React.useState("")
  const [schoolName, setSchoolName] = React.useState("")

  // Sync local state with profile data
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName)
      setSchoolName(profile.schoolName)
    }
  }, [profile])

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/")
    }
  }, [authLoading, isLoggedIn, router])

  const handleSaveDisplayName = () => {
    updateDisplayName(displayName)
  }

  const handleSaveSchoolName = () => {
    updateSchoolName(schoolName)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Načítání profilu...</p>
      </div>
    )
  }

  if (!isLoggedIn || !profile) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Profil</h1>
      </div>

      {/* Success/Error Messages */}
      <AlertMessage success={success} error={error} />

      {/* User Type Display (Read-only) */}
      <UserTypeSection userType={profile.userType} />

      {/* School Name (for teachers) */}
      {profile.userType === "teacher" && (
        <SchoolNameSection
          schoolName={schoolName}
          onSchoolNameChange={setSchoolName}
          onSave={handleSaveSchoolName}
          isSaving={isSaving}
        />
      )}

      {/* Avatar Section */}
      <AvatarSection email={profile.email} />

      {/* Display Name Section */}
      <DisplayNameSection
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        onSave={handleSaveDisplayName}
        isSaving={isSaving}
      />

      {/* Delete Account Section */}
      <DeleteAccountSection />
    </div>
  )
}


