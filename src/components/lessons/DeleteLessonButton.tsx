'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { deleteLessonAction } from '@/app/actions/lessons'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { Trash2 } from 'lucide-react'
import { logger } from '@/lib/logger'

interface DeleteLessonButtonProps {
  lessonId: string
  lessonTitle: string
  variant?: 'default' | 'compact' | 'compact-lg'
}

export function DeleteLessonButton({ lessonId, lessonTitle, variant = 'default' }: DeleteLessonButtonProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteLessonAction(lessonId)
      if (result.success) {
        setOpen(false)
        // Redirect to lessons list with query param to show success modal there
        router.push(`/lessons?deleted=${encodeURIComponent(lessonTitle)}`)
      } else {
        logger.error('Error deleting lesson:', result.error)
        setIsDeleting(false)
      }
    } catch (error) {
      logger.error('Error deleting lesson:', error)
      setIsDeleting(false)
    }
  }

  const compactStyles = {
    compact: 'h-8 px-3 text-sm gap-1.5',
    'compact-lg': 'h-10 px-4 text-base gap-2'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'compact' || variant === 'compact-lg' ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${compactStyles[variant]} rounded-full text-grey-600 hover:text-red-600 hover:bg-red-50`}
          >
            <Trash2 className={variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            Smazat
          </Button>
        ) : (
          <Button variant="destructive" size="sm">
            <Trash2 />
            Smazat
          </Button>
        )}
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
            {isDeleting ? 'Mazání...' : 'Smazat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
