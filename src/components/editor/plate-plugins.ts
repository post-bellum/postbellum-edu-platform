/**
 * Plate.js Plugin Configuration
 *
 * Configures all editor plugins for the teacher-focused block editor.
 * Intentionally limited to prevent teachers from breaking documents.
 */

import { NodeIdPlugin } from 'platejs'
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  HorizontalRulePlugin,
  CodePlugin,
} from '@platejs/basic-nodes/react'
import { LinkPlugin } from '@platejs/link/react'
import { ImagePlugin } from '@platejs/media/react'
import { ListPlugin } from '@platejs/list/react'
import { TablePlugin, TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin } from '@platejs/table/react'
import { DndPlugin } from '@platejs/dnd'
import { ParagraphPlugin } from 'platejs/react'

import {
  ParagraphElement,
  H1Element,
  H2Element,
  H3Element,
  H4Element,
  BlockquoteElement,
  HrElement,
  LinkElement,
  ImageElement,
  TableElement,
  TableRowElement,
  TableCellElement,
  TableCellHeaderElement,
} from './plate-ui/nodes'
import { CodeLeaf } from '@/components/ui/plate/code-node'
import { useDraggableAboveNodes } from './plate-ui/block-draggable'

// ============================================================================
// Plugin Configuration with Components
// ============================================================================

/** Element types that should get a drag handle. */
export const DRAGGABLE_TYPES = new Set([
  'p', 'h1', 'h2', 'h3', 'h4',
  'blockquote', 'hr', 'img', 'table', 'ul', 'ol',
])

/**
 * All plugins for the teacher editor, with components attached.
 * Order matters: plugins are processed in order.
 */
export const editorPlugins = [
  // Block elements
  ParagraphPlugin.withComponent(ParagraphElement),
  H1Plugin.withComponent(H1Element),
  H2Plugin.withComponent(H2Element),
  H3Plugin.withComponent(H3Element),
  H4Plugin.withComponent(H4Element),
  BlockquotePlugin.withComponent(BlockquoteElement),
  HorizontalRulePlugin.withComponent(HrElement),

  // Lists
  ListPlugin,

  // Table
  TablePlugin.withComponent(TableElement),
  TableRowPlugin.withComponent(TableRowElement),
  TableCellPlugin.withComponent(TableCellElement),
  TableCellHeaderPlugin.withComponent(TableCellHeaderElement),

  // Inline elements
  LinkPlugin.withComponent(LinkElement),
  ImagePlugin.withComponent(ImageElement),

  // Marks (text formatting)
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin.withComponent(CodeLeaf),

  // Node IDs (required for DnD)
  NodeIdPlugin,

  // Drag and drop
  DndPlugin.configure({
    options: {
      enableScroller: true,
    },
    render: {
      aboveNodes: useDraggableAboveNodes as never,
    },
  }),
]
