'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  UserEditedMaterialsList,
} from '@/components/profile'
import { ProfileTabs, type TabId } from '@/components/profile/ProfileTabs'
import { getAllUserMaterialsAction } from '@/app/actions/user-materials'
import { deleteUserLessonMaterialAction, duplicateUserLessonMaterialAction } from '@/app/actions/user-lesson-materials'
import { generateLessonUrl } from '@/lib/utils'
import type { UserLessonMaterial } from '@/types/lesson.types'

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Načítání profilu...</p>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}

function ProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  // Tab state - initialize from URL query param
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = React.useState<TabId>(
    tabParam === 'materials' ? 'materials' : 'settings'
  )

  // Sync tab state when URL param changes
  React.useEffect(() => {
    const newTab: TabId = tabParam === 'materials' ? 'materials' : 'settings'
    setActiveTab(newTab)
  }, [tabParam])

  // Materials state
  const [materials, setMaterials] = React.useState<Array<UserLessonMaterial & { lesson_title: string; lesson_short_id: string | null }>>([])
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

  const handleSaveDisplayName = async () => {
    const success = await updateDisplayName(displayName)
    if (success) {
      setFeedbackModal({
        open: true,
        type: 'success',
        title: 'Jméno uloženo',
        message: 'Vaše zobrazované jméno bylo úspěšně změněno.'
      })
    }
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
        // Find the original material to get lesson info
        const originalMaterial = materials.find(m => m.id === materialId)
        const lessonTitle = originalMaterial?.lesson_title || 'Unknown Lesson'
        const lessonShortId = originalMaterial?.lesson_short_id
        
        // Generate URL and redirect to the new material
        const idToUse = lessonShortId || lessonId
        const baseLessonUrl = generateLessonUrl(idToUse, lessonTitle)
        router.push(`${baseLessonUrl}/materials/${result.data.id}?from=profile`)
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
      <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
        {/* Header */}
        <div className="mb-10 md:mb-12 pt-10">
          <h1 className="text-4xl md:text-[44px] font-display font-semibold leading-display">Profil</h1>
        </div>

        {/* Two Column Layout with responsive tabs */}
        <div className={`md:flex ${activeTab === 'materials' ? 'gap-11 lg:gap-20' : 'gap-11 md:gap-[60px]'}`}>
          <aside className="shrink-0">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 min-w-0 mb-44">
            {activeTab === 'settings' && (
              <div className="w-full max-w-[880px] mx-auto space-y-8">
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
              <div className="w-full">
                {loadingMaterials ? (
                  <div className="text-center py-12">
                    <p>Načítání materiálů...</p>
                  </div>
                ) : (
                  <UserEditedMaterialsList
                    materials={materials}
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

