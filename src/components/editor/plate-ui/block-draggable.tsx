'use client'

import * as React from 'react'
import type { RenderElementProps } from 'platejs'
import { useDndNode, useDropLine } from '@platejs/dnd'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'
import { DRAGGABLE_TYPES } from '../plate-plugins'

/**
 * DnD aboveNodes render function.
 *
 * Plate's `render.aboveNodes` expects a two-level function:
 *   1. Outer function — receives element props, **may** run React hooks.
 *   2. Inner (wrapper) function — receives `{ children }`, must NOT run hooks.
 *
 * We run `useDndNode` and `useDropLine` in the outer function, then close
 * over the results in the wrapper.
 *
 * Only top-level block elements get a drag handle. Table sub-elements,
 * list items, and inline elements are skipped to prevent buggy behaviour.
 */
export function useDraggableAboveNodes(
  props: RenderElementProps & { key: string },
) {
  const { element } = props
  const type = (element as Record<string, unknown>).type as string | undefined

  // Only attach drag behaviour to top-level draggable block types
  const isDraggable = type ? DRAGGABLE_TYPES.has(type) : false

  const nodeRef = React.useRef<HTMLDivElement>(null)

  const { isDragging, dragRef } = useDndNode({
    element,
    type: 'block',
    nodeRef,
  })

  const dropLine = useDropLine({ id: element.id as string })

  // Skip wrapping for non-draggable elements
  if (!isDraggable) return undefined

  // Return the wrapper function (must not use hooks)
  return function DraggableWrapper(wrapperProps: { children: React.ReactNode }) {
    return (
      <div
        ref={nodeRef}
        className={cn(
          'group/block relative',
          isDragging && 'opacity-50',
        )}
      >
        {/* Drag handle */}
        <div
          ref={dragRef as unknown as React.Ref<HTMLDivElement>}
          className={cn(
            'absolute -left-7 top-0.5 flex h-7 w-5 cursor-grab items-center justify-center rounded',
            'opacity-0 transition-opacity group-hover/block:opacity-100',
            'hover:bg-gray-100 active:cursor-grabbing',
          )}
          contentEditable={false}
          onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-gray-400" />
        </div>

        {/* Drop line indicator */}
        {dropLine.dropLine && (
          <div
            className={cn(
              'absolute left-0 right-0 h-0.5 bg-brand-primary',
              dropLine.dropLine === 'top' && '-top-px',
              dropLine.dropLine === 'bottom' && '-bottom-px',
            )}
            contentEditable={false}
          />
        )}

        {wrapperProps.children}
      </div>
    )
  }
}
