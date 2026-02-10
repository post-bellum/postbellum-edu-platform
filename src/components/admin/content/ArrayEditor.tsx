'use client'

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ArrayEditorProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  renderItem: (item: T, index: number, onChange: (item: T) => void) => React.ReactNode
  createEmpty: () => T
  maxItems?: number
  minItems?: number
  addLabel?: string
}

export function ArrayEditor<T>({
  items,
  onChange,
  renderItem,
  createEmpty,
  maxItems = 20,
  minItems = 1,
  addLabel = 'Přidat',
}: ArrayEditorProps<T>) {
  const handleAdd = () => {
    if (items.length < maxItems) {
      onChange([...items, createEmpty()])
    }
  }

  const handleRemove = (index: number) => {
    if (items.length > minItems) {
      onChange(items.filter((_, i) => i !== index))
    }
  }

  const handleChange = (index: number, item: T) => {
    const updated = [...items]
    updated[index] = item
    onChange(updated)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...items]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onChange(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return
    const updated = [...items]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onChange(updated)
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={index} className="border border-grey-200 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-grey-500">#{index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1.5 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors"
                title="Posunout nahoru"
              >
                <ArrowUp className="w-4 h-4 text-grey-600" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                className="p-1.5 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors"
                title="Posunout dolu"
              >
                <ArrowDown className="w-4 h-4 text-grey-600" />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={items.length <= minItems}
                className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-30 transition-colors"
                title="Odstranit"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
          {renderItem(item, index, (updated) => handleChange(index, updated))}
        </div>
      ))}

      {items.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          size="medium"
          onClick={handleAdd}
          className="w-fit"
        >
          <Plus className="w-4 h-4 mr-2" />
          {addLabel}
        </Button>
      )}
    </div>
  )
}
