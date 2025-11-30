"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { deleteLessonAction } from "@/app/actions/lessons"
import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { Trash2 } from "lucide-react"

interface DeleteLessonButtonProps {
  lessonId: string
  lessonTitle: string
}

export function DeleteLessonButton({ lessonId, lessonTitle }: DeleteLessonButtonProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteLessonAction(lessonId)
      setOpen(false)
      React.startTransition(() => {
        router.push("/lessons")
      })
    } catch (error) {
      console.error("Error deleting lesson:", error)
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 />
          Smazat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Smazat lekci</DialogTitle>
          <DialogDescription>
            Opravdu chcete smazat lekci &quot;{lessonTitle}&quot;? Tato akce je nevratná a smaže také všechny související materiály a aktivity.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Zrušit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Mazání..." : "Smazat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

