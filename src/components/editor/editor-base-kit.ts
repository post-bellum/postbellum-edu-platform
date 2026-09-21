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

import { BaseParagraphPlugin, createSlatePlugin } from 'platejs'
import {
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseStrikethroughPlugin,
  BaseHighlightPlugin,
  BaseCodePlugin,
  BaseBlockquotePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseHorizontalRulePlugin,
} from '@platejs/basic-nodes'
import { BaseCaptionPlugin } from '@platejs/caption'
import { BaseLinkPlugin } from '@platejs/link'
import { BaseImagePlugin } from '@platejs/media'
import {
  BaseListPlugin,
  BaseBulletedListPlugin,
  BaseNumberedListPlugin,
  BaseListItemPlugin,
  BaseListItemContentPlugin,
} from '@platejs/list-classic'
import {
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
  BaseTableCellHeaderPlugin,
} from '@platejs/table'

import { ParagraphElementStatic } from '@/components/ui/plate/paragraph-node-static'
import {
  TitleElementStatic,
  H1ElementStatic,
  H2ElementStatic,
  H3ElementStatic,
  H4ElementStatic,
} from '@/components/ui/plate/heading-node-static'

// Custom Title plugin (static version for HTML/PDF export)
const BaseTitlePlugin = createSlatePlugin({
  key: 'title',
  node: { isElement: true, type: 'title' },
})
import { BlockquoteElementStatic } from '@/components/ui/plate/blockquote-node-static'
import { HrElementStatic } from '@/components/ui/plate/hr-node-static'
import { CodeLeafStatic } from '@/components/ui/plate/code-node-static'
import { HighlightLeafStatic } from '@/components/ui/plate/highlight-node-static'
import { ImageElementStatic } from '@/components/ui/plate/media-image-node-static'
import {
  TableElementStatic,
  TableRowElementStatic,
  TableCellElementStatic,
  TableCellHeaderElementStatic,
} from '@/components/ui/plate/table-node-static'

export const BaseEditorKit = [
  // Block elements
  BaseTitlePlugin.withComponent(TitleElementStatic),
  BaseParagraphPlugin.withComponent(ParagraphElementStatic),
  BaseH1Plugin.withComponent(H1ElementStatic),
  BaseH2Plugin.withComponent(H2ElementStatic),
  BaseH3Plugin.withComponent(H3ElementStatic),
  BaseH4Plugin.withComponent(H4ElementStatic),
  BaseBlockquotePlugin.withComponent(BlockquoteElementStatic),
  BaseHorizontalRulePlugin.withComponent(HrElementStatic),

  // Lists (classic ul/ol/li structure)
  BaseListPlugin,
  BaseBulletedListPlugin,
  BaseNumberedListPlugin,
  BaseListItemPlugin,
  BaseListItemContentPlugin,

  // Table
  BaseTablePlugin.withComponent(TableElementStatic),
  BaseTableRowPlugin.withComponent(TableRowElementStatic),
  BaseTableCellPlugin.withComponent(TableCellElementStatic),
  BaseTableCellHeaderPlugin.withComponent(TableCellHeaderElementStatic),

  // Inline elements
  BaseLinkPlugin,
  BaseImagePlugin.withComponent(ImageElementStatic),
  BaseCaptionPlugin,

  // Marks (text formatting)
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseStrikethroughPlugin,
  BaseCodePlugin.withComponent(CodeLeafStatic),
  BaseHighlightPlugin.withComponent(HighlightLeafStatic),
]
