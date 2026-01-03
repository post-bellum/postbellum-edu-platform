'use client'

import * as React from 'react'
import { Editor } from '@tiptap/react'
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlockControlsProps {
  editor: Editor
}

interface BlockInfo {
  top: number
  left: number
  height: number
  width: number
  element: HTMLElement
  blockStart: number
}

/**
 * Floating block controls that appear next to the currently focused block
 * Provides move up/down buttons, visual highlighting, and drag-to-reorder
 */
export function BlockControls({ editor }: BlockControlsProps) {
  const [blockInfo, setBlockInfo] = React.useState<BlockInfo | null>(null)
  const [canMoveUp, setCanMoveUp] = React.useState(false)
  const [canMoveDown, setCanMoveDown] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const dragStartYRef = React.useRef(0)

  // Find the current block element and its position
  const updateBlockPosition = React.useCallback(() => {
    if (!editor || !editor.view) {
      setBlockInfo(null)
      return
    }

    const { state, view } = editor
    const { selection } = state
    const { $from } = selection

    // Find the top-level block depth (direct child of doc)
    let blockDepth = $from.depth
    while (blockDepth > 1 && $from.node(blockDepth - 1).type.name !== 'doc') {
      blockDepth--
    }

    if (blockDepth < 1) {
      setBlockInfo(null)
      return
    }

    try {
      // Get the position of the block start
      const blockStart = $from.before(blockDepth)
      
      // Use nodeDOM to get the exact DOM element for this ProseMirror node
      const blockElement = view.nodeDOM(blockStart) as HTMLElement | null

      if (!blockElement || blockElement === view.dom) {
        setBlockInfo(null)
        return
      }

      // Verify it's a valid block element (not the editor itself)
      if (blockElement.classList.contains('ProseMirror')) {
        setBlockInfo(null)
        return
      }

      // Get the editor container for relative positioning
      const editorElement = view.dom.closest('.a4-content') || view.dom
      const editorRect = editorElement.getBoundingClientRect()
      const blockRect = blockElement.getBoundingClientRect()

      setBlockInfo({
        top: blockRect.top - editorRect.top,
        left: -40,
        height: blockRect.height,
        width: blockRect.width,
        element: blockElement,
        blockStart,
      })

      // Check if we can move up/down
      try {
        setCanMoveUp(editor.can().moveParagraphUp())
        setCanMoveDown(editor.can().moveParagraphDown())
      } catch {
        setCanMoveUp(false)
        setCanMoveDown(false)
      }
    } catch {
      setBlockInfo(null)
    }
  }, [editor])

  // Update position on selection changes
  React.useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      requestAnimationFrame(updateBlockPosition)
    }

    editor.on('selectionUpdate', handleUpdate)
    editor.on('update', handleUpdate)
    editor.on('focus', handleUpdate)

    handleUpdate()

    return () => {
      editor.off('selectionUpdate', handleUpdate)
      editor.off('update', handleUpdate)
      editor.off('focus', handleUpdate)
    }
  }, [editor, updateBlockPosition])


  // Hide controls when editor loses focus
  React.useEffect(() => {
    if (!editor) return

    const handleBlur = () => {
      setTimeout(() => {
        if (!editor.isFocused && !isDragging) {
          setBlockInfo(null)
        }
      }, 150)
    }

    editor.on('blur', handleBlur)
    return () => {
      editor.off('blur', handleBlur)
    }
  }, [editor, isDragging])

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragStartYRef.current = clientY
    setIsDragging(true)
  }

  React.useEffect(() => {
    if (!isDragging || !blockInfo) return
    
    // Track if we already triggered a move to prevent multiple triggers
    let moveInProgress = false

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (moveInProgress) return
      
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const offset = clientY - dragStartYRef.current

      // Determine if we should move up or down based on drag distance
      const threshold = 40 // Fixed threshold in pixels

      if (offset < -threshold && canMoveUp) {
        moveInProgress = true
        editor.chain().focus().moveParagraphUp().run()
        dragStartYRef.current = clientY
        // Update position after a short delay
        setTimeout(() => {
          updateBlockPosition()
          moveInProgress = false
        }, 50)
      } else if (offset > threshold && canMoveDown) {
        moveInProgress = true
        editor.chain().focus().moveParagraphDown().run()
        dragStartYRef.current = clientY
        // Update position after a short delay
        setTimeout(() => {
          updateBlockPosition()
          moveInProgress = false
        }, 50)
      }
    }

    const handleEnd = () => {
      setIsDragging(false)
      editor.commands.focus()
      requestAnimationFrame(updateBlockPosition)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, blockInfo, canMoveUp, canMoveDown, editor, updateBlockPosition])

  if (!blockInfo) {
    return null
  }

  const handleMoveUp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    editor.chain().focus().moveParagraphUp().run()
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    editor.chain().focus().moveParagraphDown().run()
  }

  return (
    <>
      {/* Highlight overlay */}
      <div
        className={cn(
          'absolute pointer-events-none rounded',
          isDragging ? 'z-50' : 'z-0'
        )}
        style={{
          top: blockInfo.top - 4,
          left: 0,
          width: blockInfo.width + 8,
          height: blockInfo.height + 8,
          marginLeft: -4,
          backgroundColor: isDragging ? 'rgba(7, 89, 133, 0.12)' : 'rgba(7, 89, 133, 0.06)',
          border: `2px solid ${isDragging ? 'rgba(7, 89, 133, 0.6)' : 'rgba(7, 89, 133, 0.35)'}`,
          boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
        }}
      />

      {/* Controls */}
      <div
        className={cn(
          'absolute flex flex-col items-center gap-0.5 z-10',
          'transition-opacity duration-150',
          isDragging ? 'opacity-100' : 'opacity-60 hover:opacity-100'
        )}
        style={{
          top: blockInfo.top,
          left: blockInfo.left,
          minHeight: blockInfo.height,
        }}
        contentEditable={false}
      >
        {/* Grip handle for drag */}
        <div
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded cursor-grab',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-200',
            isDragging && 'cursor-grabbing bg-gray-200 text-gray-600'
          )}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          title="Přetáhněte pro přesunutí"
          aria-label="Přetáhněte pro přesunutí sekce"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        {/* Move up button */}
        <button
          type="button"
          onClick={handleMoveUp}
          disabled={!canMoveUp}
          className={cn(
            'w-6 h-6 flex items-center justify-center rounded',
            'text-gray-500 hover:text-gray-700 hover:bg-gray-200',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'transition-colors duration-100'
          )}
          aria-label="Přesunout nahoru"
          title="Přesunout nahoru"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Move down button */}
        <button
          type="button"
          onClick={handleMoveDown}
          disabled={!canMoveDown}
          className={cn(
            'w-6 h-6 flex items-center justify-center rounded',
            'text-gray-500 hover:text-gray-700 hover:bg-gray-200',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'transition-colors duration-100'
          )}
          aria-label="Přesunout dolů"
          title="Přesunout dolů"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </>
  )
}
