/**
 * Plate.js Plugin Configuration
 *
 * Configures all editor plugins for the teacher-focused block editor.
 * Intentionally limited to prevent teachers from breaking documents.
 */

import { NodeIdPlugin, getPluginTypes, KEYS } from 'platejs'
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  HighlightPlugin,
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  HorizontalRulePlugin,
  CodePlugin,
} from '@platejs/basic-nodes/react'
import { LinkPlugin } from '@platejs/link/react'
import { CaptionPlugin } from '@platejs/caption/react'
import { ImagePlugin } from '@platejs/media/react'
import {
  ListPlugin,
  ListItemPlugin,
  ListItemContentPlugin,
  BulletedListPlugin,
  NumberedListPlugin,
} from '@platejs/list-classic/react'
import { TablePlugin, TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin } from '@platejs/table/react'
import { ColumnPlugin, ColumnItemPlugin } from '@platejs/layout/react'
import { FontColorPlugin, FontBackgroundColorPlugin } from '@platejs/basic-styles/react'
import { DndPlugin } from '@platejs/dnd'
import { BlockSelectionPlugin } from '@platejs/selection/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ParagraphPlugin, createPlatePlugin } from 'platejs/react'

// Custom Title plugin (renders as a large h1, bigger than Nadpis 1)
const TitlePlugin = createPlatePlugin({
  key: 'title',
  node: { isElement: true, type: 'title' },
})

/**
 * Ensures the editor always contains at least one paragraph.
 * Without this, CMD+A → Delete removes all blocks and the editor collapses.
 * Uses Slate's normalizeNode — the standard way to enforce document constraints.
 */
const ForceNonEmptyPlugin = createPlatePlugin({
  key: 'forceNonEmpty',
  extendEditor: ({ editor }) => {
    const normalizeNode = editor.normalizeNode as (entry: [unknown, number[]]) => void
    editor.normalizeNode = ((entry: [unknown, number[]]) => {
      const [node] = entry
      if (
        node === editor &&
        editor.children.length === 0
      ) {
        editor.tf.insertNodes(
          { type: 'p', children: [{ text: '' }] } as never,
          { at: [0] }
        )
        return
      }
      normalizeNode(entry)
    }) as typeof editor.normalizeNode
    return editor
  },
})

import {
  TitleElement,
  ParagraphElement,
  H1Element,
  H2Element,
  H3Element,
  H4Element,
  BlockquoteElement,
  HrElement,
  LinkElement,
} from './plate-ui/nodes'
import { ImageElement } from '@/components/ui/plate/media-image-node'
import {
  TableElement,
  TableRowElement,
  TableCellElement,
  TableCellHeaderElement,
} from '@/components/ui/plate/table-node'
import {
  BulletedListElement,
  NumberedListElement,
  ListItemElement,
} from '@/components/ui/plate/list-classic-node'
import { ColumnGroupElement, ColumnElement } from '@/components/ui/column-node'
import { CodeLeaf } from '@/components/ui/plate/code-node'
import { HighlightLeaf } from '@/components/ui/plate/highlight-node'
import { BlockSelection } from '@/components/ui/plate/block-selection'
import { BlockDraggable } from './plate-ui/block-draggable'

// ============================================================================
// Plugin Configuration with Components
// ============================================================================

/**
 * All plugins for the teacher editor, with components attached.
 * Order matters: plugins are processed in order.
 */
export const editorPlugins = [
  // Ensure editor always has at least one paragraph (must be first)
  ForceNonEmptyPlugin,

  // Block elements
  TitlePlugin.withComponent(TitleElement),
  ParagraphPlugin.withComponent(ParagraphElement),
  H1Plugin.withComponent(H1Element),
  H2Plugin.withComponent(H2Element),
  H3Plugin.withComponent(H3Element),
  H4Plugin.withComponent(H4Element),
  BlockquotePlugin.withComponent(BlockquoteElement),
  HorizontalRulePlugin.withComponent(HrElement),

  // Lists (classic ul/ol/li structure)
  ListPlugin,
  ListItemPlugin.withComponent(ListItemElement),
  ListItemContentPlugin,
  BulletedListPlugin.withComponent(BulletedListElement),
  NumberedListPlugin.withComponent(NumberedListElement),

  // Columns (multi-column layout for side-by-side content)
  ColumnPlugin.withComponent(ColumnGroupElement),
  ColumnItemPlugin.withComponent(ColumnElement),

  // Table
  TablePlugin.withComponent(TableElement),
  TableRowPlugin.withComponent(TableRowElement),
  TableCellPlugin.withComponent(TableCellElement),
  TableCellHeaderPlugin.withComponent(TableCellHeaderElement),

  // Inline elements
  LinkPlugin.withComponent(LinkElement),
  ImagePlugin.extend({
    node: {
      props: () => ({
        align: 'center', // Default alignment for all image nodes
      }),
    },
    options: {
      uploadImage: async (dataUrl: ArrayBuffer | string): Promise<string> => {
        // Convert data URL to Blob for size check and upload
        const dataUrlStr = typeof dataUrl === 'string' ? dataUrl : ''
        if (!dataUrlStr.startsWith('data:')) return dataUrlStr

        const res = await fetch(dataUrlStr)
        const blob = await res.blob()
        const ext = blob.type.split('/')[1]?.replace('svg+xml', 'svg') || 'png'
        const file = new File([blob], `pasted-image.${ext}`, { type: blob.type })

        const { STORAGE_LIMITS, uploadImageToStorage } = await import('@/lib/supabase/storage')

        // Hard reject images > 2MB
        if (file.size > STORAGE_LIMITS.MAX_EDITOR_IMAGE_SIZE) {
          const sizeMB = (file.size / 1024 / 1024).toFixed(1)
          // Dispatch a custom event so PlateEditor can show the modal
          window.dispatchEvent(new CustomEvent('plate-image-too-large', {
            detail: { sizeMB, maxMB: STORAGE_LIMITS.MAX_EDITOR_IMAGE_SIZE_DISPLAY },
          }))
          throw new Error('IMAGE_TOO_LARGE')
        }

        const url = await uploadImageToStorage(file, 'lesson-materials', 'images')
        return url
      },
    },
  }).withComponent(ImageElement),
  CaptionPlugin.configure({
    options: { query: { allow: ['img'] } },
  }),

  // Marks (text formatting)
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin.withComponent(CodeLeaf),
  HighlightPlugin.withComponent(HighlightLeaf),

  // Font styling (renders color/backgroundColor marks as inline styles)
  FontColorPlugin,
  FontBackgroundColorPlugin,

  // Node IDs (required for DnD and block selection)
  NodeIdPlugin,

  // Block selection (highlights blocks, multi-select support)
  BlockSelectionPlugin.configure(({ editor }) => ({
    options: {
      enableContextMenu: true,
      isSelectable: (element) =>
        !getPluginTypes(editor, [KEYS.column, KEYS.tr, KEYS.td]).includes(
          element.type,
        ),
    },
    render: {
      belowRootNodes: (props) => {
        if (!props.attributes.className?.includes('slate-selectable'))
          return null

        return <BlockSelection {...(props as unknown as import('platejs/react').PlateElementProps)} />
      },
    },
  })),

  // Drag and drop (official Plate setup with DndProvider in aboveSlate)
  DndPlugin.configure({
    options: {
      enableScroller: true,
    },
    render: {
      aboveNodes: BlockDraggable,
      aboveSlate: ({ children }) => (
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      ),
    },
  }),
]
