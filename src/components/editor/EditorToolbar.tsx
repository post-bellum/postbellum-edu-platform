'use client'

import * as React from 'react'
import { useEditorRef, useEditorSelector } from 'platejs/react'
import {
  Bold,
  Italic,
  Underline,
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

  // Track active block type
  const activeBlockType = useEditorSelector((editor) => {
    const entry = editor.api.block()
    return entry ? (entry[0] as Record<string, unknown>).type as string || 'p' : 'p'
  }, [])

  // Block type labels (Czech)
  const blockTypeLabels: Record<string, string> = {
    p: 'Odstavec',
    h1: 'Nadpis 1',
    h2: 'Nadpis 2',
    h3: 'Nadpis 3',
    h4: 'Nadpis 4',
    blockquote: 'Citace',
  }

  const blockTypeIcons: Record<string, React.ReactNode> = {
    p: <Pilcrow className="h-4 w-4" />,
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

  const insertTable = () => {
    const tableNode = {
      type: 'table',
      children: Array.from({ length: 3 }, () => ({
        type: 'tr',
        children: Array.from({ length: 3 }, () => ({
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

  const toggleList = (listType: 'ul' | 'ol') => {
    // Check if currently in a list
    if (activeBlockType === listType) {
      // Unwrap the list
      editor.tf.setNodes({ type: 'p' } as never)
    } else {
      // Wrap in list
      editor.tf.setNodes({ type: listType } as never)
    }
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
      <ToolbarButton
        tooltip="Odrážkový seznam"
        onClick={() => toggleList('ul')}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Číslovaný seznam"
        onClick={() => toggleList('ol')}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

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
      <ToolbarButton
        tooltip="Vložit tabulku"
        onClick={insertTable}
      >
        <Table className="h-4 w-4" />
      </ToolbarButton>

    </Toolbar>
  )
}
