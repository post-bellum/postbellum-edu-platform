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
  const [error, setError] = React.useState<string | null>(null)
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
    setError(null)
    
    try {
      const result = await createTagAction(newTagTitle.trim())
      if (result.success && result.data) {
        // Check if tag already exists in localTags (in case of duplicate)
        const existingTag = localTags.find(t => t.id === result.data.id)
        if (!existingTag) {
          setLocalTags([...localTags, result.data])
        }
        
        // Select the tag if not already selected
        if (!selectedTagIds.includes(result.data.id)) {
          onSelectionChange([...selectedTagIds, result.data.id])
        }
        setNewTagTitle('')
      } else if (!result.success && result.error) {
        setError(result.error)
      }
    } catch (error) {
      logger.error('Error creating tag:', error)
      setError('Nepodařilo se vytvořit tag')
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
                className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary text-white rounded-full text-sm"
              >
                {tag.title}
                <button
                  type="button"
                  onClick={() => handleToggleTag(tagId)}
                  className="hover:bg-brand-primary-hover rounded-full p-0.5"
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
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newTagTitle}
            onChange={(e) => {
              setNewTagTitle(e.target.value)
              if (error) setError(null)
            }}
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
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}
