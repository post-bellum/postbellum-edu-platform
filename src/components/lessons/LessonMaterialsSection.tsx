'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LessonMaterial, LessonSpecification, LessonDuration, UserLessonMaterial } from '@/types/lesson.types'
import { LessonMaterialViewModal } from './LessonMaterialViewModal'
import { MaterialsList } from './MaterialsList'
import { AuthModal } from '@/components/auth'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { copyLessonMaterialAction } from '@/app/actions/user-lesson-materials'
import { ErrorDialog } from '@/components/ui/ErrorDialog'
import { exportToPDF } from '@/lib/utils/pdf-export'
import { generateLessonUrl } from '@/lib/utils'

interface LessonMaterialsSectionProps {
  materials: LessonMaterial[]
  lessonId: string
  lessonTitle: string
  lessonShortId?: string | null
  onMaterialCreated?: (material: UserLessonMaterial) => void
}

const specificationLabels: Record<LessonSpecification, string> = {
  '2nd_grade_elementary': '2. stupeň ZŠ',
  'high_school': 'Střední školy',
}

const durationLabels: Record<LessonDuration, string> = {
  30: '30 min',
  45: '45 min',
  90: '90 min',
}

export function LessonMaterialsSection({ materials, lessonId, lessonTitle, lessonShortId, onMaterialCreated }: LessonMaterialsSectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()
  
  const [selectedSpecification, setSelectedSpecification] = React.useState<LessonSpecification>('2nd_grade_elementary')
  const [selectedDuration, setSelectedDuration] = React.useState<LessonDuration>(30)
  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [selectedMaterial, setSelectedMaterial] = React.useState<LessonMaterial | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)
  const [isCopying, setIsCopying] = React.useState<string | null>(null)
  const [isExportingPDF, setIsExportingPDF] = React.useState<string | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Generate base lesson URL using short_id if available
  const idToUse = lessonShortId || lessonId
  const baseLessonUrl = generateLessonUrl(idToUse, lessonTitle)

  const handleAuthModalClose = (open: boolean) => {
    setIsAuthModalOpen(open)
    if (!open) {
      router.refresh()
    }
  }

  const requireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action()
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleCopyMaterial = async (materialId: string) => {
    setIsCopying(materialId)
    const result = await copyLessonMaterialAction(materialId, lessonId)
    
    if (result.success && result.data) {
      // Notify parent component about the new material
      onMaterialCreated?.(result.data)
      // Navigate to the edit page using short_id URL
      router.push(`${baseLessonUrl}/materials/${result.data.id}`)
    } else if (!result.success) {
      setErrorMessage(result.error || 'Chyba při vytváření kopie materiálu')
      setErrorDialogOpen(true)
      setIsCopying(null)
    }
  }

  const handleExportPDF = async (material: LessonMaterial) => {
    if (!material.content) return

    setIsExportingPDF(material.id)
    setErrorMessage(null)

    try {
      await exportToPDF(material.title, material.content)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Chyba při exportu do PDF'
      setErrorMessage(errorMsg)
      setErrorDialogOpen(true)
    } finally {
      setIsExportingPDF(null)
    }
  }

  // Filter materials based on selected specification and duration
  const filteredMaterials = React.useMemo(() => {
    return materials.filter((material) => {
      if (material.specification !== selectedSpecification) {
        return false
      }
      if (material.duration !== selectedDuration) {
        return false
      }
      return true
    })
  }, [materials, selectedSpecification, selectedDuration])

  // Group materials by title (e.g., "Pracovní list", "Metodický list")
  const groupedMaterials = React.useMemo(() => {
    const groups: Record<string, LessonMaterial[]> = {}
    filteredMaterials.forEach((material) => {
      const key = material.title
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(material)
    })
    return groups
  }, [filteredMaterials])

  return (
    <div className="flex flex-col gap-7">
      {/* Section Header */}
      <h2 className="font-display text-3xl font-semibold leading-display text-grey-950 pl-7">Materiály k lekci</h2>

      {/* Segment Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Specification Tabs */}
        <div className="inline-flex bg-grey-100 rounded-full p-1">
          {Object.entries(specificationLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSelectedSpecification(value as LessonSpecification)}
              className={`px-8 h-9 leading-9 rounded-full text-md transition-all cursor-pointer ${
                selectedSpecification === value
                  ? 'bg-brand-primary text-white shadow-sm font-semibold'
                  : 'text-grey-600 hover:text-grey-950'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Duration Tabs */}
        <div className="inline-flex bg-grey-100 rounded-full p-1">
          {Object.entries(durationLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSelectedDuration(parseInt(value) as LessonDuration)}
              className={`px-4 h-9 leading-9 rounded-full text-md transition-all cursor-pointer ${
                selectedDuration === parseInt(value) as LessonDuration
                  ? 'bg-brand-primary text-white shadow-sm font-semibold'
                  : 'text-grey-600 hover:text-grey-950'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      <MaterialsList
        groupedMaterials={groupedMaterials}
        isExportingPDF={isExportingPDF}
        isCopying={isCopying}
        onView={(material) => requireAuth(() => {
          setSelectedMaterial(material)
          setViewModalOpen(true)
        })}
        onExportPDF={(material) => requireAuth(() => handleExportPDF(material))}
        onCopy={(materialId) => requireAuth(() => handleCopyMaterial(materialId))}
      />

      {/* View Modal */}
      {selectedMaterial && (
        <LessonMaterialViewModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          title={selectedMaterial.title}
          content={selectedMaterial.content}
        />
      )}

      {/* Auth Modal for non-logged users */}
      <AuthModal 
        open={isAuthModalOpen} 
        onOpenChange={handleAuthModalClose}
        defaultStep="login"
        returnTo={pathname}
      />

      <ErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  )
}

