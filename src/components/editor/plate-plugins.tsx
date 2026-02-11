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

  // Table
  TablePlugin.withComponent(TableElement),
  TableRowPlugin.withComponent(TableRowElement),
  TableCellPlugin.withComponent(TableCellElement),
  TableCellHeaderPlugin.withComponent(TableCellHeaderElement),

  // Inline elements
  LinkPlugin.withComponent(LinkElement),
  ImagePlugin.withComponent(ImageElement),
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
