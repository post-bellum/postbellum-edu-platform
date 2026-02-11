/**
 * Base Editor Kit (static / headless plugins)
 *
 * This configuration maps headless (non-React) Plate plugins to their
 * static rendering components. Used by `serializeHtml` for HTML export
 * and by the PDF pipeline that renders via `EditorStatic`.
 *
 * Each plugin here mirrors its React counterpart in `plate-plugins.ts`
 * but uses `Base*Plugin` + `*Static` component pairs.
 */

import { BaseParagraphPlugin } from 'platejs'
import {
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseStrikethroughPlugin,
  BaseCodePlugin,
  BaseBlockquotePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseHorizontalRulePlugin,
} from '@platejs/basic-nodes'
import { BaseLinkPlugin } from '@platejs/link'
import { BaseImagePlugin } from '@platejs/media'
import { BaseListPlugin } from '@platejs/list'
import {
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseTableCellHeaderPlugin,
} from '@platejs/table'

import { ParagraphElementStatic } from '@/components/ui/plate/paragraph-node-static'
import {
  H1ElementStatic,
  H2ElementStatic,
  H3ElementStatic,
  H4ElementStatic,
} from '@/components/ui/plate/heading-node-static'
import { BlockquoteElementStatic } from '@/components/ui/plate/blockquote-node-static'
import { HrElementStatic } from '@/components/ui/plate/hr-node-static'
import { CodeLeafStatic } from '@/components/ui/plate/code-node-static'

export const BaseEditorKit = [
  // Block elements
  BaseParagraphPlugin.withComponent(ParagraphElementStatic),
  BaseH1Plugin.withComponent(H1ElementStatic),
  BaseH2Plugin.withComponent(H2ElementStatic),
  BaseH3Plugin.withComponent(H3ElementStatic),
  BaseH4Plugin.withComponent(H4ElementStatic),
  BaseBlockquotePlugin.withComponent(BlockquoteElementStatic),
  BaseHorizontalRulePlugin.withComponent(HrElementStatic),

  // Lists (no static component needed – renders via default elements)
  BaseListPlugin,

  // Table
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseTableCellHeaderPlugin,

  // Inline elements
  BaseLinkPlugin,
  BaseImagePlugin,

  // Marks (text formatting)
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseStrikethroughPlugin,
  BaseCodePlugin.withComponent(CodeLeafStatic),
]
