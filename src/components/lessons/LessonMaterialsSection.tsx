'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LessonMaterial, LessonSpecification, LessonDuration, UserLessonMaterial } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Eye, Edit, Download, Loader2, ClipboardList } from '@/components/icons'
import { LessonMaterialViewModal } from './LessonMaterialViewModal'
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
      {Object.keys(groupedMaterials).length === 0 ? (
        <div className="bg-grey-50 border border-black/5 rounded-[28px] p-10 text-center">
          <p className="text-text-subtle">Žádné materiály pro vybrané filtry</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(groupedMaterials).map(([title, materialsList]) => (
            <div 
              key={title} 
              className="bg-grey-50 border border-black/5 rounded-[28px] pl-7 pr-10 py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7"
            >
              {/* Content */}
              <div className="flex-1 flex flex-col gap-10">
                {/* Title with icon */}
                <div className="flex items-center gap-4 px-3">
                  <div className="w-7 h-7 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-brand-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold leading-[1.2] text-text-strong">
                    {title}
                  </h3>
                </div>

                {/* Description list */}
                {materialsList[0].description && materialsList[0].description.trim() && (
                  <ul className="text-text-subtle text-lg leading-[1.4] list-disc ml-7 space-y-0">
                    {materialsList[0].description.split('\n').filter(Boolean).map((item, idx) => (
                      <li key={idx}>
                        {item.trim()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 lg:w-[180px] lg:max-w-[200px] shrink-0">
                <Button 
                  variant="secondary" 
                  size="medium"
                  className="w-full justify-center [&_svg]:text-grey-500"
                  onClick={() => requireAuth(() => {
                    setSelectedMaterial(materialsList[0])
                    setViewModalOpen(true)
                  })}
                >
                  <Eye className="w-5 h-5" />
                  Zobrazit
                </Button>
                <Button 
                  variant="secondary" 
                  size="medium"
                  className="w-full justify-center [&_svg]:text-grey-500"
                  disabled={!materialsList[0].content || isExportingPDF === materialsList[0].id}
                  onClick={() => requireAuth(() => handleExportPDF(materialsList[0]))}
                >
                  {isExportingPDF === materialsList[0].id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Exportuji...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Stáhnout
                    </>
                  )}
                </Button>
                <Button 
                  variant="secondary" 
                  size="medium"
                  className="w-full justify-center [&_svg]:text-grey-500"
                  disabled={isCopying === materialsList[0].id}
                  onClick={() => requireAuth(() => handleCopyMaterial(materialsList[0].id))}
                >
                  <Edit className="w-5 h-5" />
                  {isCopying === materialsList[0].id ? 'Vytvářím...' : 'Upravit'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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

