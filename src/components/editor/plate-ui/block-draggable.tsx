'use client'

import * as React from 'react'

import { DndPlugin, useDraggable, useDropLine } from '@platejs/dnd'
import { expandListItemsWithChildren } from '@platejs/list'
import { BlockSelectionPlugin } from '@platejs/selection/react'
import {
  GripVertical,
  Plus,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Quote,
  List,
  ListOrdered,
  Minus,
  Image as ImageIcon,
  Table,
} from 'lucide-react'
import { type TElement, getPluginByType, isType, KEYS } from 'platejs'
import {
  type PlateEditor,
  type PlateElementProps,
  type RenderNodeWrapper,
  MemoizedChildren,
  useEditorRef,
  useElement,
  usePluginOption,
} from 'platejs/react'
import { useSelected } from 'platejs/react'

import { Button } from '@/components/ui/Button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'

const UNDRAGGABLE_KEYS = [KEYS.column, KEYS.tr, KEYS.td]

export const BlockDraggable: RenderNodeWrapper = (props) => {
  const { editor, element, path } = props

  const enabled = React.useMemo(() => {
    if (editor.dom.readOnly) return false

    // Top-level blocks (path.length === 1)
    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      return true
    }
    // Blocks inside columns (path.length === 3)
    if (path.length === 3 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: { type: editor.getType(KEYS.column) },
      })
      if (block) return true
    }
    // Blocks inside table cells (path.length === 4)
    if (path.length === 4 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: { type: editor.getType(KEYS.table) },
      })
      if (block) return true
    }

    return false
  }, [editor, element, path])

  if (!enabled) return

  return function DraggableWrapper(props: PlateElementProps) {
    return <Draggable {...props} />
  }
}

function Draggable(props: PlateElementProps) {
  const { children, editor, element, path } = props
  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection

  const { isAboutToDrag, isDragging, nodeRef, previewRef, handleRef } =
    useDraggable({
      element,
      onDropHandler: (_, { dragItem }) => {
        const id = (dragItem as { id: string[] | string }).id

        if (blockSelectionApi) {
          blockSelectionApi.add(id)
        }
        resetPreview()
      },
    })

  const isInColumn = path.length === 3
  const isInTable = path.length === 4

  const [previewTop, setPreviewTop] = React.useState(0)

  const resetPreview = () => {
    if (previewRef.current) {
      previewRef.current.replaceChildren()
      previewRef.current?.classList.add('hidden')
    }
  }

  // Clear virtual multiple preview when drag ends
  React.useEffect(() => {
    if (!isDragging) {
      resetPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  React.useEffect(() => {
    if (isAboutToDrag) {
      previewRef.current?.classList.remove('opacity-0')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAboutToDrag])

  const [dragButtonTop, setDragButtonTop] = React.useState(0)

  return (
    <div
      className={cn(
        'relative',
        isDragging && 'opacity-50',
        getPluginByType(editor, element.type)?.node.isContainer
          ? 'group/container'
          : 'group',
      )}
      onMouseEnter={() => {
        if (isDragging) return
        setDragButtonTop(calcDragButtonTop(editor, element))
      }}
    >
      {!isInTable && (
        <Gutter>
          <div
            className={cn(
              'slate-blockToolbarWrapper',
              'flex h-[1.5em]',
              isInColumn && 'h-4',
            )}
          >
            {/* Insert block button */}
            <div
              className={cn(
                'pointer-events-auto mr-0.5 flex items-center',
              )}
            >
              <InsertButton
                style={{ top: `${dragButtonTop - 6}px` }}
              />
            </div>

            {/* Drag handle */}
            <div
              className={cn(
                'slate-blockToolbar relative w-4.5',
                'pointer-events-auto mr-1 flex items-center',
                isInColumn && 'mr-1.5',
              )}
            >
              <Button
                ref={handleRef}
                variant="ghost"
                className="left-0 absolute h-6 w-full p-0"
                style={{ top: `${dragButtonTop + 3}px` }}
                data-plate-prevent-deselect
              >
                <DragHandle
                  isDragging={isDragging}
                  previewRef={previewRef}
                  resetPreview={resetPreview}
                  setPreviewTop={setPreviewTop}
                />
              </Button>
            </div>
          </div>
        </Gutter>
      )}

      <div
        ref={previewRef}
        className={cn('left-0 absolute hidden w-full')}
        style={{ top: `${-previewTop}px` }}
        contentEditable={false}
      />

      <div
        ref={nodeRef}
        className="slate-blockWrapper flow-root"
        onContextMenu={(event) =>
          editor
            .getApi(BlockSelectionPlugin)
            .blockSelection.addOnContextMenu({ element, event })
        }
      >
        <MemoizedChildren>{children}</MemoizedChildren>
        <DropLine />
      </div>
    </div>
  )
}

function Gutter({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const editor = useEditorRef()
  const element = useElement()
  const isSelectionAreaVisible = usePluginOption(
    BlockSelectionPlugin,
    'isSelectionAreaVisible',
  )
  const selected = useSelected()

  return (
    <div
      {...props}
      className={cn(
        'slate-gutterLeft',
        '-translate-x-full absolute top-0 z-50 flex h-full cursor-text hover:opacity-100 sm:opacity-0',
        getPluginByType(editor, element.type)?.node.isContainer
          ? 'group-hover/container:opacity-100'
          : 'group-hover:opacity-100',
        isSelectionAreaVisible && 'hidden',
        !selected && 'opacity-0',
        className,
      )}
      contentEditable={false}
    >
      {children}
    </div>
  )
}

const DragHandle = React.memo(function DragHandle({
  isDragging,
  previewRef,
  resetPreview,
  setPreviewTop,
}: {
  isDragging: boolean
  previewRef: React.RefObject<HTMLDivElement | null>
  resetPreview: () => void
  setPreviewTop: (top: number) => void
}) {
  const editor = useEditorRef()
  const element = useElement()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex size-full items-center justify-center cursor-grab active:cursor-grabbing"
          onClick={(e) => {
            e.preventDefault()
            editor.getApi(BlockSelectionPlugin).blockSelection.focus()
          }}
          onMouseDown={(e) => {
            resetPreview()

            if ((e.button !== 0 && e.button !== 2) || e.shiftKey) return

            const blockSelection = editor
              .getApi(BlockSelectionPlugin)
              .blockSelection.getNodes({ sort: true })

            let selectionNodes =
              blockSelection.length > 0
                ? blockSelection
                : editor.api.blocks({ mode: 'highest' })

            // If current block is not in selection, use it as the starting point
            if (!selectionNodes.some(([node]) => node.id === element.id)) {
              selectionNodes = [[element, editor.api.findPath(element)!]]
            }

            // Process selection nodes to include list children
            const blocks = expandListItemsWithChildren(
              editor,
              selectionNodes,
            ).map(([node]) => node)

            if (blockSelection.length === 0) {
              editor.tf.blur()
              editor.tf.collapse()
            }

            const elements = createDragPreviewElements(editor, blocks)
            previewRef.current?.append(...elements)
            previewRef.current?.classList.remove('hidden')
            previewRef.current?.classList.add('opacity-0')
            editor.setOption(DndPlugin, 'multiplePreviewRef', previewRef)

            editor
              .getApi(BlockSelectionPlugin)
              .blockSelection.set(blocks.map((block) => block.id as string))
          }}
          onMouseEnter={() => {
            if (isDragging) return

            const blockSelection = editor
              .getApi(BlockSelectionPlugin)
              .blockSelection.getNodes({ sort: true })

            let selectedBlocks =
              blockSelection.length > 0
                ? blockSelection
                : editor.api.blocks({ mode: 'highest' })

            // If current block is not in selection, use it as the starting point
            if (!selectedBlocks.some(([node]) => node.id === element.id)) {
              selectedBlocks = [[element, editor.api.findPath(element)!]]
            }

            // Process selection to include list children
            const processedBlocks = expandListItemsWithChildren(
              editor,
              selectedBlocks,
            )

            const ids = processedBlocks.map((block) => block[0].id as string)

            if (ids.length > 1 && ids.includes(element.id as string)) {
              const previewTop = calculatePreviewTop(editor, {
                blocks: processedBlocks.map((block) => block[0]),
                element,
              })
              setPreviewTop(previewTop)
            } else {
              setPreviewTop(0)
            }
          }}
          onMouseUp={() => {
            resetPreview()
          }}
          data-plate-prevent-deselect
          role="button"
        >
          <GripVertical className="size-3 text-gray-300" />
        </div>
      </TooltipTrigger>
      <TooltipContent>Přetáhněte pro přesun</TooltipContent>
    </Tooltip>
  )
})

const DropLine = React.memo(function DropLine({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { dropLine } = useDropLine()

  if (!dropLine) return null

  return (
    <div
      {...props}
      className={cn(
        'slate-dropLine',
        'absolute inset-x-0 h-0.5 opacity-100 transition-opacity',
        'bg-brand-primary/50',
        dropLine === 'top' && '-top-px',
        dropLine === 'bottom' && '-bottom-px',
        className,
      )}
    />
  )
})

// ============================================================================
// Insert Block Button (+)
// ============================================================================

const INSERT_ITEMS = [
  { type: 'p', label: 'Odstavec', icon: Pilcrow },
  { type: 'title', label: 'Název', icon: Type },
  { type: 'h1', label: 'Nadpis 1', icon: Heading1 },
  { type: 'h2', label: 'Nadpis 2', icon: Heading2 },
  { type: 'h3', label: 'Nadpis 3', icon: Heading3 },
  { type: 'blockquote', label: 'Citace', icon: Quote },
  { type: 'ul', label: 'Odrážkový seznam', icon: List },
  { type: 'ol', label: 'Číslovaný seznam', icon: ListOrdered },
  { type: 'hr', label: 'Oddělovač', icon: Minus },
  { type: 'table', label: 'Tabulka', icon: Table },
  { type: 'img', label: 'Obrázek', icon: ImageIcon },
] as const

function InsertButton({ style }: { style?: React.CSSProperties }) {
  const editor = useEditorRef()
  const element = useElement()
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [imageTooLargeInfo, setImageTooLargeInfo] = React.useState<{ sizeMB: string; maxMB: string } | null>(null)

  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const insertBlock = (type: string) => {
    const path = editor.api.findPath(element)
    if (!path) return

    const nextPath = [path[0] + 1]

    if (type === 'ul' || type === 'ol') {
      editor.tf.insertNodes(
        {
          type,
          children: [{
            type: 'li',
            children: [{ type: 'lic', children: [{ text: '' }] }],
          }],
        } as never,
        { at: nextPath },
      )
    } else if (type === 'table') {
      editor.tf.insertNodes(
        {
          type: 'table',
          children: Array.from({ length: 2 }, () => ({
            type: 'tr',
            children: Array.from({ length: 2 }, () => ({
              type: 'td',
              children: [{ type: 'p', children: [{ text: '' }] }],
            })),
          })),
        } as never,
        { at: nextPath },
      )
    } else if (type === 'img') {
      // Trigger file picker for image
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        // Hard reject images > 2MB
        const { STORAGE_LIMITS } = await import('@/lib/supabase/storage')
        if (file.size > STORAGE_LIMITS.MAX_EDITOR_IMAGE_SIZE) {
          setImageTooLargeInfo({
            sizeMB: (file.size / 1024 / 1024).toFixed(1),
            maxMB: STORAGE_LIMITS.MAX_EDITOR_IMAGE_SIZE_DISPLAY,
          })
          return
        }

        await doImageUpload(file, nextPath)
      }
      input.click()
    } else {
      editor.tf.insertNodes(
        { type, children: [{ text: '' }] } as never,
        { at: nextPath },
      )
    }

    setOpen(false)
    // Focus the newly inserted block
    setTimeout(() => {
      editor.tf.select(nextPath)
      editor.tf.focus()
    }, 0)
  }

  const doImageUpload = async (file: File, targetPath: number[]) => {
    try {
      const { uploadImageToStorage } = await import('@/lib/supabase/storage')
      const url = await uploadImageToStorage(file, 'lesson-materials', 'images')
      if (url) {
        editor.tf.insertNodes(
          { type: 'img', url, children: [{ text: '' }] } as never,
          { at: targetPath },
        )
      }
    } catch {
      // Fallback: insert image with placeholder
      const url = URL.createObjectURL(file)
      editor.tf.insertNodes(
        { type: 'img', url, children: [{ text: '' }] } as never,
        { at: targetPath },
      )
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'absolute flex h-5 w-5 items-center justify-center rounded cursor-pointer',
              'text-gray-300 transition-colors',
              'hover:bg-gray-100 hover:text-gray-500',
              'right-0.5',
            )}
            style={style}
            onClick={() => setOpen(!open)}
            data-plate-prevent-deselect
          >
            <Plus className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Přidat blok</TooltipContent>
      </Tooltip>

      {open && (
        <div
          className={cn(
            'absolute left-0 top-full z-100 mt-1',
            'w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg',
          )}
          contentEditable={false}
        >
          {INSERT_ITEMS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm',
                'text-gray-700 hover:bg-gray-50 transition-colors',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertBlock(type)}
            >
              <Icon className="size-4 text-gray-400" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Image too large info dialog */}
      <Dialog open={!!imageTooLargeInfo} onOpenChange={() => setImageTooLargeInfo(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Obrázek je příliš velký</DialogTitle>
            <DialogDescription>
              Vybraný obrázek má {imageTooLargeInfo?.sizeMB ?? '?'}MB. Maximální povolená velikost obrázku je {imageTooLargeInfo?.maxMB ?? '2MB'}. Prosím zmenšete obrázek a zkuste to znovu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setImageTooLargeInfo(null)}>
              Rozumím
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================================
// Drag Preview Helpers
// ============================================================================

const createDragPreviewElements = (
  editor: PlateEditor,
  blocks: TElement[],
): HTMLElement[] => {
  const elements: HTMLElement[] = []
  const ids: string[] = []

  const removeDataAttributes = (element: HTMLElement) => {
    Array.from(element.attributes).forEach((attr) => {
      if (
        attr.name.startsWith('data-slate') ||
        attr.name.startsWith('data-block-id')
      ) {
        element.removeAttribute(attr.name)
      }
    })

    Array.from(element.children).forEach((child) => {
      removeDataAttributes(child as HTMLElement)
    })
  }

  const resolveElement = (node: TElement, index: number) => {
    const domNode = editor.api.toDOMNode(node)!
    const newDomNode = domNode.cloneNode(true) as HTMLElement

    // Apply visual compensation for horizontal scroll
    const applyScrollCompensation = (
      original: Element,
      cloned: HTMLElement,
    ) => {
      const scrollLeft = original.scrollLeft

      if (scrollLeft > 0) {
        const scrollWrapper = document.createElement('div')
        scrollWrapper.style.overflow = 'hidden'
        scrollWrapper.style.width = `${original.clientWidth}px`

        const innerContainer = document.createElement('div')
        innerContainer.style.transform = `translateX(-${scrollLeft}px)`
        innerContainer.style.width = `${original.scrollWidth}px`

        while (cloned.firstChild) {
          innerContainer.append(cloned.firstChild)
        }

        const originalStyles = window.getComputedStyle(original)
        cloned.style.padding = '0'
        innerContainer.style.padding = originalStyles.padding

        scrollWrapper.append(innerContainer)
        cloned.append(scrollWrapper)
      }
    }

    applyScrollCompensation(domNode, newDomNode)

    ids.push(node.id as string)
    const wrapper = document.createElement('div')
    wrapper.append(newDomNode)
    wrapper.style.display = 'flow-root'

    const lastDomNode = blocks[index - 1]

    if (lastDomNode) {
      const lastDomNodeRect = editor.api
        .toDOMNode(lastDomNode)!
        .parentElement!.getBoundingClientRect()

      const domNodeRect = domNode.parentElement!.getBoundingClientRect()

      const distance = domNodeRect.top - lastDomNodeRect.bottom

      if (distance > 15) {
        wrapper.style.marginTop = `${distance}px`
      }
    }

    removeDataAttributes(newDomNode)
    elements.push(wrapper)
  }

  blocks.forEach((node, index) => {
    resolveElement(node, index)
  })

  editor.setOption(DndPlugin, 'draggingId', ids)

  return elements
}

const calculatePreviewTop = (
  editor: PlateEditor,
  {
    blocks,
    element,
  }: {
    blocks: TElement[]
    element: TElement
  },
): number => {
  const child = editor.api.toDOMNode(element)!
  const editable = editor.api.toDOMNode(editor)!
  const firstSelectedChild = blocks[0]

  const firstDomNode = editor.api.toDOMNode(firstSelectedChild)!
  const editorPaddingTop = Number(
    window.getComputedStyle(editable).paddingTop.replace('px', ''),
  )

  const firstNodeToEditorDistance =
    firstDomNode.getBoundingClientRect().top -
    editable.getBoundingClientRect().top -
    editorPaddingTop

  const firstMarginTopString = window.getComputedStyle(firstDomNode).marginTop
  const marginTop = Number(firstMarginTopString.replace('px', ''))

  const currentToEditorDistance =
    child.getBoundingClientRect().top -
    editable.getBoundingClientRect().top -
    editorPaddingTop

  const currentMarginTopString = window.getComputedStyle(child).marginTop
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''))

  const previewElementsTopDistance =
    currentToEditorDistance -
    firstNodeToEditorDistance +
    marginTop -
    currentMarginTop

  return previewElementsTopDistance
}

const calcDragButtonTop = (editor: PlateEditor, element: TElement): number => {
  const child = editor.api.toDOMNode(element)!

  const currentMarginTopString = window.getComputedStyle(child).marginTop
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''))

  return currentMarginTop
}
