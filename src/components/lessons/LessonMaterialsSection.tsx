'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LessonMaterial, LessonSpecification, LessonDuration } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Eye, Download, Edit } from 'lucide-react'
import { LessonMaterialViewModal } from './LessonMaterialViewModal'
import { AuthModal } from '@/components/auth'
import { useAuth } from '@/lib/supabase/hooks/useAuth'

interface LessonMaterialsSectionProps {
  materials: LessonMaterial[]
}

const specificationLabels: Record<LessonSpecification, string> = {
  '1st_grade_elementary': '1. stupeň ZŠ',
  '2nd_grade_elementary': '2. stupeň ZŠ',
  'high_school': 'Střední školy',
}

const durationLabels: Record<LessonDuration, string> = {
  30: '30 min',
  45: '45 min',
  90: '90 min',
}

export function LessonMaterialsSection({ materials }: LessonMaterialsSectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()
  
  const [selectedSpecification, setSelectedSpecification] = React.useState<LessonSpecification>('1st_grade_elementary')
  const [selectedDuration, setSelectedDuration] = React.useState<LessonDuration>(30)
  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [selectedMaterial, setSelectedMaterial] = React.useState<LessonMaterial | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)

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
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Materiály k lekci</h2>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex gap-2">
          {Object.entries(specificationLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSelectedSpecification(value as LessonSpecification)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedSpecification === value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {Object.entries(durationLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSelectedDuration(parseInt(value) as LessonDuration)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedDuration === parseInt(value)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      {Object.keys(groupedMaterials).length === 0 ? (
        <p className="text-gray-500">Žádné materiály pro vybrané filtry</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMaterials).map(([title, materials]) => (
            <div key={title} className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>{title}</span>
                {materials[0].specification && (
                  <span className="text-sm font-normal text-gray-500">
                    ({specificationLabels[materials[0].specification]})
                  </span>
                )}
                {materials[0].duration && (
                  <span className="text-sm font-normal text-gray-500">
                    • {durationLabels[materials[0].duration]}
                  </span>
                )}
              </h3>

              {materials[0].description && materials[0].description.trim() && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Obsahuje:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    {materials[0].description.split('\n').filter(Boolean).map((item, idx) => (
                      <li key={idx}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => requireAuth(() => {
                    setSelectedMaterial(materials[0])
                    setViewModalOpen(true)
                  })}
                >
                  <Eye />
                  Zobrazit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  title="Připravujeme"
                >
                  <Download />
                  Stáhnout PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  title="Připravujeme"
                >
                  <Edit />
                  Upravit
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
    </div>
  )
}

