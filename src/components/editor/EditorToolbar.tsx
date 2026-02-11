'use client'

import * as React from 'react'
import { useEditorRef, useEditorSelector } from 'platejs/react'
import { KEYS } from 'platejs'
import {
  useListToolbarButton,
  useListToolbarButtonState,
} from '@platejs/list-classic/react'
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Table,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Pilcrow,
  Type,
  Link,
} from 'lucide-react'

import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarDropdown,
  ToolbarDropdownItem,
} from './plate-ui/toolbar'

// ============================================================================
// Color palette for text color
// ============================================================================

const COLORS = [
  { value: '#18181B', label: 'Černá' },
  { value: '#434343', label: 'Tmavě šedá' },
  { value: '#6b7280', label: 'Šedá' },
  { value: '#dc2626', label: 'Červená' },
  { value: '#ea580c', label: 'Oranžová' },
  { value: '#16a34a', label: 'Zelená' },
  { value: '#2563eb', label: 'Modrá' },
  { value: '#7c3aed', label: 'Fialová' },
  { value: '#075985', label: 'Primární' },
]

// ============================================================================
// Toolbar Component
// ============================================================================

interface EditorToolbarProps {
  onInsertImage?: () => void
}

export function EditorToolbar({ onInsertImage }: EditorToolbarProps) {
  const editor = useEditorRef()

  // Track active marks using editor.api.marks()
  const isBold = useEditorSelector(
    (editor) => !!(editor.api.marks() as Record<string, unknown> | null)?.bold,
    []
  )
  const isItalic = useEditorSelector(
    (editor) => !!(editor.api.marks() as Record<string, unknown> | null)?.italic,
    []
  )
  const isUnderline = useEditorSelector(
    (editor) => !!(editor.api.marks() as Record<string, unknown> | null)?.underline,
    []
  )
  const isHighlight = useEditorSelector(
    (editor) => !!(editor.api.marks() as Record<string, unknown> | null)?.highlight,
    []
  )

  // Track active block type
  const activeBlockType = useEditorSelector((editor) => {
    const entry = editor.api.block()
    return entry ? (entry[0] as Record<string, unknown>).type as string || 'p' : 'p'
  }, [])

  // Block type labels (Czech)
  const blockTypeLabels: Record<string, string> = {
    p: 'Odstavec',
    title: 'Název',
    h1: 'Nadpis 1',
    h2: 'Nadpis 2',
    h3: 'Nadpis 3',
    h4: 'Nadpis 4',
    blockquote: 'Citace',
  }

  const blockTypeIcons: Record<string, React.ReactNode> = {
    p: <Pilcrow className="h-4 w-4" />,
    title: <Type className="h-4 w-4" />,
    h1: <Heading1 className="h-4 w-4" />,
    h2: <Heading2 className="h-4 w-4" />,
    h3: <Heading3 className="h-4 w-4" />,
    h4: <Heading4 className="h-4 w-4" />,
    blockquote: <Quote className="h-4 w-4" />,
  }

  const toggleBlock = (type: string) => {
    // Use setNodes to change block type, or convert back to paragraph
    const currentType = activeBlockType
    if (currentType === type) {
      // Toggle off - convert back to paragraph
      editor.tf.setNodes({ type: 'p' } as never)
    } else {
      editor.tf.setNodes({ type } as never)
    }
    editor.tf.focus()
  }

  const toggleMark = (key: string) => {
    editor.tf.toggleMark(key)
    editor.tf.focus()
  }

  const setAlignment = (align: string) => {
    editor.tf.setNodes({ align } as never)
    editor.tf.focus()
  }

  const setColor = (color: string) => {
    editor.tf.addMark('color', color)
    editor.tf.focus()
  }

  const insertTable = (rows: number, cols: number) => {
    const tableNode = {
      type: 'table',
      children: Array.from({ length: rows }, () => ({
        type: 'tr',
        children: Array.from({ length: cols }, () => ({
          type: 'td',
          children: [{ type: 'p', children: [{ text: '' }] }],
        })),
      })),
    }
    editor.tf.insertNodes(tableNode as never)
    editor.tf.focus()
  }

  const insertLink = () => {
    const url = window.prompt('Zadejte URL adresu:')
    if (!url) return
    const text = window.prompt('Text odkazu:', url) || url

    editor.tf.insertNodes({
      type: 'a',
      url,
      children: [{ text }],
    } as never)
    editor.tf.focus()
  }

  return (
    <Toolbar className="flex-wrap rounded-t-xl border-gray-200">
      {/* Undo / Redo */}
      <ToolbarButton
        tooltip="Zpět (Ctrl+Z)"
        onClick={() => editor.tf.undo()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Vpřed (Ctrl+Y)"
        onClick={() => editor.tf.redo()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Block type dropdown */}
      <ToolbarDropdown
        label={blockTypeLabels[activeBlockType] || 'Odstavec'}
        tooltip="Typ bloku"
      >
        {Object.entries(blockTypeLabels).map(([type, label]) => (
          <ToolbarDropdownItem
            key={type}
            isActive={activeBlockType === type}
            onClick={() => toggleBlock(type)}
          >
            {blockTypeIcons[type]}
            {label}
          </ToolbarDropdownItem>
        ))}
      </ToolbarDropdown>

      <ToolbarSeparator />

      {/* Text formatting marks */}
      <ToolbarButton
        tooltip="Tučné (Ctrl+B)"
        isActive={isBold}
        onClick={() => toggleMark('bold')}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Kurzíva (Ctrl+I)"
        isActive={isItalic}
        onClick={() => toggleMark('italic')}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Podtržení (Ctrl+U)"
        isActive={isUnderline}
        onClick={() => toggleMark('underline')}
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Zvýraznění"
        isActive={isHighlight}
        onClick={() => toggleMark('highlight')}
      >
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>

      {/* Text color */}
      <ToolbarDropdown label="" tooltip="Barva textu">
        <div className="grid grid-cols-3 gap-1 p-2">
          {COLORS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              title={label}
              className="h-6 w-6 rounded-sm border border-gray-200 transition-transform hover:scale-110"
              style={{ backgroundColor: value }}
              onClick={() => setColor(value)}
            />
          ))}
        </div>
      </ToolbarDropdown>

      <ToolbarSeparator />

      {/* Text alignment */}
      <ToolbarButton tooltip="Zarovnat vlevo" onClick={() => setAlignment('left')}>
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton tooltip="Na střed" onClick={() => setAlignment('center')}>
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton tooltip="Zarovnat vpravo" onClick={() => setAlignment('right')}>
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton tooltip="Do bloku" onClick={() => setAlignment('justify')}>
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Lists */}
      <BulletedListToolbarButton />
      <NumberedListToolbarButton />

      <ToolbarSeparator />

      {/* Insert actions */}
      <ToolbarButton
        tooltip="Vložit obrázek"
        onClick={onInsertImage}
      >
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Vložit odkaz"
        onClick={insertLink}
      >
        <Link className="h-4 w-4" />
      </ToolbarButton>
      <TableGridPicker onInsert={insertTable} />

    </Toolbar>
  )
}

// ============================================================================
// List Toolbar Buttons (using official Plate hooks)
// ============================================================================

function BulletedListToolbarButton() {
  const state = useListToolbarButtonState({ nodeType: KEYS.ulClassic })
  const { props } = useListToolbarButton(state)

  return (
    <ToolbarButton {...props} tooltip="Odrážkový seznam">
      <List className="h-4 w-4" />
    </ToolbarButton>
  )
}

function NumberedListToolbarButton() {
  const state = useListToolbarButtonState({ nodeType: KEYS.olClassic })
  const { props } = useListToolbarButton(state)

  return (
    <ToolbarButton {...props} tooltip="Číslovaný seznam">
      <ListOrdered className="h-4 w-4" />
    </ToolbarButton>
  )
}

// ============================================================================
// Table Grid Picker
// ============================================================================

const MAX_GRID = 8

function TableGridPicker({ onInsert }: { onInsert: (rows: number, cols: number) => void }) {
  const [open, setOpen] = React.useState(false)
  const [hoverRow, setHoverRow] = React.useState(0)
  const [hoverCol, setHoverCol] = React.useState(0)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={dropdownRef} className="relative">
      <ToolbarButton
        tooltip="Vložit tabulku"
        onClick={() => setOpen(!open)}
      >
        <Table className="h-4 w-4" />
      </ToolbarButton>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
          <div className="mb-1.5 text-center text-xs text-gray-500">
            {hoverRow > 0 && hoverCol > 0
              ? `${hoverRow} × ${hoverCol}`
              : 'Vyberte velikost'}
          </div>
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${MAX_GRID}, 1fr)` }}
            onMouseLeave={() => { setHoverRow(0); setHoverCol(0) }}
          >
            {Array.from({ length: MAX_GRID * MAX_GRID }, (_, i) => {
              const row = Math.floor(i / MAX_GRID) + 1
              const col = (i % MAX_GRID) + 1
              const isHighlighted = row <= hoverRow && col <= hoverCol

              return (
                <button
                  key={i}
                  type="button"
                  className={`h-4 w-4 rounded-[2px] border transition-colors ${
                    isHighlighted
                      ? 'border-brand-primary bg-brand-primary/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onMouseEnter={() => { setHoverRow(row); setHoverCol(col) }}
                  onClick={() => {
                    onInsert(row, col)
                    setOpen(false)
                    setHoverRow(0)
                    setHoverCol(0)
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
