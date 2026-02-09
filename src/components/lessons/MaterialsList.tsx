'use client'

import * as React from 'react'
import { LessonMaterial } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { MobileEditWarningDialog } from '@/components/ui/MobileEditWarningDialog'
import { Eye, Edit, Download, Loader2, Clipboard } from '@/components/icons'
import { useIsMobile } from '@/hooks/useIsMobile'

interface MaterialsListProps {
  groupedMaterials: Record<string, LessonMaterial[]>
  isExportingPDF: string | null
  isCopying: string | null
  onView: (material: LessonMaterial) => void
  onExportPDF: (material: LessonMaterial) => void
  onCopy: (materialId: string) => void
}

export function MaterialsList({
  groupedMaterials,
  isExportingPDF,
  isCopying,
  onView,
  onExportPDF,
  onCopy,
}: MaterialsListProps) {
  const [mobileEditWarningOpen, setMobileEditWarningOpen] = React.useState(false)
  const isMobile = useIsMobile()

  const handleEditClick = (materialId: string) => {
    if (isMobile) {
      setMobileEditWarningOpen(true)
    } else {
      onCopy(materialId)
    }
  }

  if (Object.keys(groupedMaterials).length === 0) {
    return (
      <div className="bg-grey-50 border border-black/5 rounded-[28px] p-10 text-center">
        <p className="text-text-subtle">Žádné materiály pro vybrané filtry</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(groupedMaterials).map(([title, materialsList]) => (
        <div 
          key={title} 
          className="bg-grey-50 border border-black/5 rounded-[28px] pl-7 pr-10 py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7"
        >
          {/* Content */}
          <div className="flex-1 flex flex-col gap-10">
            {/* Title with icon */}
            <div className="flex items-center gap-6 ml-4">
              <Clipboard className="w-7 h-7 text-brand-primary" strokeWidth={2} />
              <h3 className="text-lg font-semibold leading-display text-text-strong">
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
          <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:w-[180px] lg:max-w-[200px] shrink-0">
            <Button 
              variant="secondary" 
              size="medium"
              className="justify-center [&_svg]:text-grey-500 lg:w-full"
              onClick={() => onView(materialsList[0])}
            >
              <Eye className="w-5 h-5" />
              Zobrazit
            </Button>
            <Button 
              variant="secondary" 
              size="medium"
              className="justify-center [&_svg]:text-grey-500 lg:w-full"
              disabled={!materialsList[0].content || isExportingPDF === materialsList[0].id}
              onClick={() => onExportPDF(materialsList[0])}
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
              className="justify-center [&_svg]:text-grey-500 lg:w-full"
              disabled={isCopying === materialsList[0].id}
              onClick={() => handleEditClick(materialsList[0].id)}
            >
              <Edit className="w-5 h-5" />
              {isCopying === materialsList[0].id ? 'Vytvářím...' : 'Upravit'}
            </Button>
          </div>
        </div>
      ))}

      <MobileEditWarningDialog 
        open={mobileEditWarningOpen} 
        onOpenChange={setMobileEditWarningOpen} 
      />
    </div>
  )
}
