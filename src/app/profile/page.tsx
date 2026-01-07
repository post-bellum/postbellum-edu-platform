'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { useProfile } from '@/lib/supabase/hooks/useProfile'
import { FeedbackModal } from '@/components/ui/FeedbackModal'
import {
  AlertMessage,
  UserTypeSection,
  SchoolNameSection,
  AvatarSection,
  DisplayNameSection,
  DeleteAccountSection,
  UserEditedMaterialsSection,
} from '@/components/profile'
import { ProfileTabs, type TabId } from '@/components/profile/ProfileTabs'
import { getAllUserMaterialsAction } from '@/app/actions/user-materials'
import { deleteUserLessonMaterialAction, duplicateUserLessonMaterialAction } from '@/app/actions/user-lesson-materials'
import type { UserLessonMaterial } from '@/types/lesson.types'

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

  // Tab state
  const [activeTab, setActiveTab] = React.useState<TabId>('settings')

  // Materials state
  const [materials, setMaterials] = React.useState<Array<UserLessonMaterial & { lesson_title: string }>>([])
  const [loadingMaterials, setLoadingMaterials] = React.useState(false)
  
  // Feedback modal state
  const [feedbackModal, setFeedbackModal] = React.useState<{ 
    open: boolean
    type: 'success' | 'error'
    title: string
    message?: string 
  }>({
    open: false,
    type: 'success',
    title: '',
    message: undefined
  })

  // Local state for form inputs
  const [displayName, setDisplayName] = React.useState('')
  const [schoolName, setSchoolName] = React.useState('')

  // Sync local state with profile data
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName)
      setSchoolName(profile.schoolName)
    }
  }, [profile])

  // Load materials when switching to materials tab
  React.useEffect(() => {
    async function loadMaterials() {
      if (activeTab === 'materials' && isLoggedIn && materials.length === 0) {
        setLoadingMaterials(true)
        try {
          const result = await getAllUserMaterialsAction()
          if (result.success && result.data) {
            setMaterials(result.data)
          }
        } catch {
          // Error is already logged in the action
          setLoadingMaterials(false)
        } finally {
          setLoadingMaterials(false)
        }
      }
    }
    loadMaterials()
  }, [activeTab, isLoggedIn, materials.length])

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/')
    }
  }, [authLoading, isLoggedIn, router])

  const handleSaveDisplayName = () => {
    updateDisplayName(displayName)
  }

  const handleSaveSchoolName = () => {
    updateSchoolName(schoolName)
  }

  const handleDeleteMaterial = async (materialId: string, lessonId: string) => {
    try {
      const result = await deleteUserLessonMaterialAction(materialId, lessonId)
      
      if (result.success) {
        // Remove from local state
        setMaterials(prev => prev.filter(m => m.id !== materialId))
        setFeedbackModal({
          open: true,
          type: 'success',
          title: 'Materiál smazán',
          message: 'Materiál byl úspěšně smazán.'
        })
      } else {
        setFeedbackModal({
          open: true,
          type: 'error',
          title: 'Chyba',
          message: result.error || 'Nepodařilo se smazat materiál'
        })
      }
    } catch {
      // Error is already logged in the action
      setFeedbackModal({
        open: true,
        type: 'error',
        title: 'Chyba',
        message: 'Nepodařilo se smazat materiál'
      })
    }
  }

  const handleDuplicateMaterial = async (materialId: string, lessonId: string) => {
    try {
      const result = await duplicateUserLessonMaterialAction(materialId, lessonId)
      
      if (result.success && result.data) {
        // Add the new material to local state
        const newMaterial = {
          ...result.data,
          lesson_title: materials.find(m => m.lesson_id === lessonId)?.lesson_title || 'Unknown Lesson'
        }
        setMaterials(prev => [newMaterial, ...prev])
        setFeedbackModal({
          open: true,
          type: 'success',
          title: 'Materiál duplikován',
          message: 'Materiál byl úspěšně duplikován.'
        })
      } else {
        setFeedbackModal({
          open: true,
          type: 'error',
          title: 'Chyba',
          message: result.error || 'Nepodařilo se duplikovat materiál'
        })
      }
    } catch {
      // Error is already logged in the action
      setFeedbackModal({
        open: true,
        type: 'error',
        title: 'Chyba',
        message: 'Nepodařilo se duplikovat materiál'
      })
    }
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
    <>
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profil</h1>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 shrink-0">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'settings' && (
            <div className="space-y-8">
              {/* Success/Error Messages */}
              <AlertMessage success={success} error={error} />

              {/* User Type Display (Read-only) */}
              <UserTypeSection userType={profile.userType} />

              {/* School Name (for teachers) */}
              {profile.userType === 'teacher' && (
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
          )}

          {activeTab === 'materials' && (
            <div>
              {loadingMaterials ? (
                <div className="text-center py-12">
                  <p>Načítání materiálů...</p>
                </div>
              ) : (
            <UserEditedMaterialsSection 
              initialMaterials={materials}
              onDelete={handleDeleteMaterial}
              onDuplicate={handleDuplicateMaterial}
            />
              )}
            </div>
          )}
        </main>
      </div>
    </div>

    {/* Feedback Modal */}
    <FeedbackModal
      open={feedbackModal.open}
      onOpenChange={(open) => setFeedbackModal(prev => ({ ...prev, open }))}
      type={feedbackModal.type}
      title={feedbackModal.title}
      message={feedbackModal.message}
    />
    </>
  )
}


