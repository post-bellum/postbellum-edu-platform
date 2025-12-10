'use client'

import * as React from 'react'
import { Tag } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, X } from 'lucide-react'
import { createTagAction } from '@/app/actions/tags'
import { logger } from '@/lib/logger'

interface TagsSelectorProps {
  tags: Tag[]
  selectedTagIds: string[]
  onSelectionChange: (tagIds: string[]) => void
}

export function TagsSelector({ tags, selectedTagIds, onSelectionChange }: TagsSelectorProps) {
  const [newTagTitle, setNewTagTitle] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)
  const [localTags, setLocalTags] = React.useState<Tag[]>(tags)

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onSelectionChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onSelectionChange([...selectedTagIds, tagId])
    }
  }

  React.useEffect(() => {
    setLocalTags(tags)
  }, [tags])

  const handleCreateTag = async () => {
    if (!newTagTitle.trim()) return

    setIsCreating(true)
    try {
      const result = await createTagAction(newTagTitle.trim())
      if (result.success && result.data) {
        setLocalTags([...localTags, result.data])
        onSelectionChange([...selectedTagIds, result.data.id])
        setNewTagTitle('')
      }
    } catch (error) {
      logger.error('Error creating tag:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selectedTagIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagIds.map((tagId) => {
            const tag = localTags.find(t => t.id === tagId)
            if (!tag) return null
            return (
              <span
                key={tagId}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-sm"
              >
                {tag.title}
                <button
                  type="button"
                  onClick={() => handleToggleTag(tagId)}
                  className="hover:bg-primary-hover rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Available Tags */}
      <div className="flex flex-wrap gap-2">
        {localTags
          .filter(tag => !selectedTagIds.includes(tag.id))
          .map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleToggleTag(tag.id)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {tag.title}
            </button>
          ))}
      </div>

      {/* Create New Tag */}
      <div className="flex gap-2">
        <Input
          value={newTagTitle}
          onChange={(e) => setNewTagTitle(e.target.value)}
          placeholder="Nový tag..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleCreateTag()
            }
          }}
        />
        <Button
          type="button"
          onClick={handleCreateTag}
          disabled={!newTagTitle.trim() || isCreating}
          size="sm"
        >
          <Plus />
          Přidat
        </Button>
      </div>
    </div>
  )
}
