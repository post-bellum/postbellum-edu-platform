"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { deleteLessonMaterialAction } from "@/app/actions/lesson-materials"
import type { LessonMaterial, LessonSpecification, LessonDuration } from "@/types/lesson.types"
import { Button } from "@/components/ui/Button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { LessonMaterialForm } from "./LessonMaterialForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"

interface LessonMaterialsManagerProps {
  lessonId: string
  initialMaterials?: LessonMaterial[]
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

export function LessonMaterialsManager({
  lessonId,
  initialMaterials = [],
}: LessonMaterialsManagerProps) {
  const [materials, setMaterials] = React.useState<LessonMaterial[]>(initialMaterials)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingMaterial, setEditingMaterial] = React.useState<LessonMaterial | undefined>()
  const [formKey, setFormKey] = React.useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [materialToDelete, setMaterialToDelete] = React.useState<LessonMaterial | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const loadMaterials = React.useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('lesson_materials')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error("Error loading materials:", error)
        return
      }

      setMaterials((data || []) as LessonMaterial[])
    } catch (error) {
      console.error("Error loading materials:", error)
    }
  }, [lessonId])

  // Load materials on mount and when lessonId changes
  React.useEffect(() => {
    loadMaterials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  const handleAdd = () => {
    setEditingMaterial(undefined)
    setFormKey(k => k + 1)
    setIsFormOpen(true)
  }

  const handleEdit = (material: LessonMaterial) => {
    setEditingMaterial(material)
    setFormKey(k => k + 1)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (material: LessonMaterial) => {
    setMaterialToDelete(material)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return

    setIsDeleting(true)
    try {
      await deleteLessonMaterialAction(materialToDelete.id, lessonId)
      setDeleteDialogOpen(false)
      setMaterialToDelete(null)
      loadMaterials()
    } catch (error) {
      console.error("Error deleting material:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = React.useCallback(() => {
    loadMaterials()
  }, [loadMaterials])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Materiály k lekci</h2>
        <Button onClick={handleAdd}>
          <Plus />
          Přidat materiál
        </Button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">Zatím nejsou žádné materiály</p>
          <Button onClick={handleAdd} variant="outline">
            Přidat první materiál
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {materials.map((material) => (
            <div
              key={material.id}
              className="border border-gray-200 rounded-lg p-4 flex items-start justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{material.title}</h3>
                <div className="flex gap-2 text-sm text-gray-500 mb-2">
                  {material.specification && (
                    <span>{specificationLabels[material.specification]}</span>
                  )}
                  {material.duration && (
                    <span>• {durationLabels[material.duration]}</span>
                  )}
                </div>
                {material.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {material.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(material)}
                >
                  <Edit />
                  Upravit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(material)}
                >
                  <Trash2 />
                  Smazat
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LessonMaterialForm
        key={formKey}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        lessonId={lessonId}
        material={editingMaterial}
        onSuccess={handleFormSuccess}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smazat materiál</DialogTitle>
            <DialogDescription>
              Opravdu chcete smazat materiál &quot;{materialToDelete?.title}&quot;? Tato akce je nevratná.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Zrušit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Mazání..." : "Smazat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

