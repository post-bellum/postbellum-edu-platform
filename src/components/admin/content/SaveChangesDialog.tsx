'use client'

import { Loader2, Plus, Minus, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { changeCountLabel } from '@/lib/page-content/diff'
import type { ContentChange, ContentChangeKind } from '@/lib/page-content/diff'

interface SaveChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageLabel: string
  changes: ContentChange[]
  isSaving: boolean
  onConfirm: () => void | Promise<void>
}

const KIND_META: Record<ContentChangeKind, { label: string; icon: typeof Plus; className: string }> = {
  added: { label: 'Přidáno', icon: Plus, className: 'bg-turquoise-100 text-turquoise-800' },
  removed: { label: 'Odebráno', icon: Minus, className: 'bg-red-100 text-red-700' },
  modified: { label: 'Změněno', icon: Pencil, className: 'bg-grey-200 text-grey-700' },
}

function ChangeValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-grey-400 pt-1.5 sm:w-[72px] sm:pt-[3px]">
        {label}
      </dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}

function ChangeRow({ change }: { change: ContentChange }) {
  const meta = KIND_META[change.kind]
  const Icon = meta.icon

  return (
    <li className="border border-grey-200 rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-grey-50 border-b border-grey-200 px-5 py-3">
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold mr-2 ${meta.className}`}
        >
          <Icon className="w-3 h-3" />
          {meta.label}
        </span>
        <span className="font-display font-semibold text-md leading-6 text-text-strong break-words">
          {change.label}
        </span>
      </div>

      <dl className="flex flex-col gap-3 px-5 py-4 text-sm leading-body">
        {change.before && (
          <ChangeValue label="Původně">
            {/* No strikethrough — over a long paragraph it hurts readability; the label carries the meaning */}
            <span className="text-grey-500">{change.before}</span>
          </ChangeValue>
        )}
        {change.after && (
          <ChangeValue label="Nově">
            <span className="text-text-strong">{change.after}</span>
          </ChangeValue>
        )}
      </dl>
    </li>
  )
}

export function SaveChangesDialog({
  open,
  onOpenChange,
  pageLabel,
  changes,
  isSaving,
  onConfirm,
}: SaveChangesDialogProps) {
  const hasChanges = changes.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[680px] gap-7 px-7 pb-8 pt-7 sm:px-9 sm:pb-9 sm:pt-8">
        <DialogHeader className="space-y-2 pr-8 mt-8">
          <DialogTitle className="font-display text-2xl leading-8">
            Uložit změny — {pageLabel}
          </DialogTitle>
          <DialogDescription className="text-base">
            {hasChanges
              ? `Zkontrolujte ${changes.length} ${changeCountLabel(changes.length, 'accusative')} a potvrďte uložení.`
              : 'Od posledního uložení jste neprovedli žádné změny.'}
          </DialogDescription>
        </DialogHeader>

        {hasChanges && (
          <ul className="-mr-3 flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-3">
            {changes.map((change, index) => (
              <ChangeRow key={`${change.label}-${index}`} change={change} />
            ))}
          </ul>
        )}

        <DialogFooter className="gap-3 sm:gap-3 sm:space-x-0">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Zrušit
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ukládám...
              </>
            ) : (
              'Uložit změny'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
