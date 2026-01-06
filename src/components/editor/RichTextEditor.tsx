'use client'

import * as React from 'react'
import { Editor } from '@tinymce/tinymce-react'
import type { Editor as TinyMCEEditor } from 'tinymce'
import { cn } from '@/lib/utils'
import { useRichTextEditor } from '@/hooks/useRichTextEditor'
import {
  EDITOR_PLUGINS,
  EDITOR_TOOLBAR,
  EDITOR_MENU,
  EDITOR_MENUBAR,
  QUICKBARS_SELECTION_TOOLBAR,
  QUICKBARS_IMAGE_TOOLBAR,
  IMAGE_TOOLBAR,
  FONT_SIZE_FORMATS,
  BLOCK_FORMATS,
  COLOR_MAP,
  COLOR_COLS,
  IMAGE_CLASS_LIST,
  TABLE_DEFAULT_STYLES,
  TABLE_DEFAULT_ATTRIBUTES,
  CONTENT_STYLE,
  setupEditor,
} from '@/lib/editor'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  /** Increment this to force the editor to reset with new content (e.g., form reset) */
  resetKey?: number
}

/**
 * Rich text editor component using TinyMCE.
 * 
 * Features:
 * - Self-hosted TinyMCE (no API key required)
 * - Image upload with paste/drag-drop support
 * - Custom image manipulation (rotate, flip, float)
 * - Block movement (move paragraphs up/down)
 * - Debounced autosave to prevent cursor jumping
 * - Czech localization
 * 
 * @example
 * ```tsx
 * <RichTextEditor
 *   content={html}
 *   onChange={setHtml}
 *   placeholder="Start typing..."
 * />
 * ```
 */
export const RichTextEditor = React.memo(function RichTextEditor({
  content,
  onChange,
  placeholder = 'Začněte psát...',
  className,
  resetKey = 0,
}: RichTextEditorProps) {
  // Stable ID for hydration
  const editorId = React.useId()
  
  // All editor logic is encapsulated in the hook
  const {
    editorRef,
    debounceTimerRef,
    lastSyncedContentRef,
    onChangeRef,
    handleImageUpload,
    handleEditorChange,
  } = useRichTextEditor({ content, onChange })

  return (
    <div 
      className={cn(
      'border border-gray-200 rounded-xl bg-white overflow-hidden',
      'shadow-lg shadow-gray-200/50',
      'ring-1 ring-gray-100',
      className
      )}
    >
      <Editor
        id={editorId}
        key={resetKey}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        onInit={(_evt, editor) => {
          editorRef.current = editor
        }}
        initialValue={content}
        onEditorChange={handleEditorChange}
        init={{
          // Dimensions
          height: 1200,
          min_height: 600,
          resize: false,
          
          // Language
          language: 'cs',
          language_url: '/tinymce/langs/cs.js',
          
          // Menu & Toolbar
          menubar: EDITOR_MENUBAR,
          menu: EDITOR_MENU,
          plugins: [...EDITOR_PLUGINS],
          toolbar: EDITOR_TOOLBAR,
          toolbar_mode: 'sliding',
          
          // Quickbars
          quickbars_selection_toolbar: QUICKBARS_SELECTION_TOOLBAR,
          quickbars_insert_toolbar: false,
          quickbars_image_toolbar: QUICKBARS_IMAGE_TOOLBAR,
          image_toolbar: IMAGE_TOOLBAR,
          
          // Formatting
          font_size_formats: FONT_SIZE_FORMATS,
          block_formats: BLOCK_FORMATS,
          color_cols: COLOR_COLS,
          color_map: COLOR_MAP,
          
          // Styling
          skin: 'oxide',
          content_css: false,
          content_style: CONTENT_STYLE,
          
          // Image handling
          images_upload_handler: handleImageUpload,
          automatic_uploads: true,
          file_picker_types: 'image',
          paste_data_images: true,
          image_caption: true,
          image_advtab: true,
          image_title: true,
          image_dimensions: true,
          image_description: true,
          object_resizing: 'img',
          resize_img_proportional: true,
          image_class_list: IMAGE_CLASS_LIST,
          
          // Table settings
          table_default_styles: TABLE_DEFAULT_STYLES,
          table_default_attributes: TABLE_DEFAULT_ATTRIBUTES,
          
          // Paste settings
          paste_webkit_styles: 'all',
          paste_merge_formats: true,
          
          // Pagebreak
          pagebreak_separator: '<!-- pagebreak -->',
          pagebreak_split_block: true,
          
          // Branding
          branding: false,
          promotion: false,
          
          // Placeholder
          placeholder,
          
          // Setup custom commands and event handlers
          setup: (editor) => {
            setupEditor(editor, {
              onBlur: () => {},
              debounceTimerRef,
              lastSyncedContentRef,
              onChangeRef,
            })
          },
        }}
      />
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these props change
  // Ignore 'content' changes since we use initialValue (only matters on mount)
  // Ignore 'onChange' since we use a ref for it
  return (
    prevProps.resetKey === nextProps.resetKey &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.className === nextProps.className
  )
})
