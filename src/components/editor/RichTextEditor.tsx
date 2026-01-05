'use client'

import * as React from 'react'
import { Editor } from '@tinymce/tinymce-react'
import type { Editor as TinyMCEEditor } from 'tinymce'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  /** Increment this to force the editor to reset with new content (e.g., form reset) */
  resetKey?: number
}

// Debounce delay for autosave
const AUTOSAVE_DEBOUNCE_MS = 1000

// Memoized component that only re-renders when resetKey, placeholder, or className changes
// NOT when content changes (since we use initialValue, content updates don't need re-renders)
export const RichTextEditor = React.memo(function RichTextEditor({
  content,
  onChange,
  placeholder = 'Začněte psát...',
  className,
  resetKey = 0,
}: RichTextEditorProps) {
  const editorRef = React.useRef<TinyMCEEditor | null>(null)
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncedContent = React.useRef<string>(content)
  
  // Store onChange in a ref so we can access it in callbacks without causing re-renders
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange
  
  // Sync content to parent (called on blur and debounced during editing)
  const syncToParent = React.useCallback(() => {
    if (!editorRef.current) return
    const currentContent = editorRef.current.getContent()
    // Only call onChange if content actually changed
    if (currentContent !== lastSyncedContent.current) {
      lastSyncedContent.current = currentContent
      onChangeRef.current(currentContent)
    }
  }, [])
  
  // Cleanup debounce timer on unmount and sync final content
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      // Sync on unmount
      syncToParent()
    }
  }, [syncToParent])

  // Handle image uploads (paste, drag & drop, or file picker)
  const handleImageUpload = React.useCallback(async (
    blobInfo: { blob: () => Blob; filename: () => string },
    progress: (percent: number) => void
  ): Promise<string> => {
    try {
      progress(10)
      const blob = blobInfo.blob()
      const filename = blobInfo.filename() || 'pasted-image.png'
      const file = new File([blob], filename, { type: blob.type || 'image/png' })
      
      progress(30)
      const url = await uploadImageToStorage(file, 'lesson-materials', 'images')
      progress(100)
      
      if (!url) {
        throw new Error('Failed to upload image')
      }
      
      return url
    } catch (error) {
      logger.error('Error uploading image', error)
      throw error
    }
  }, [])

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
        key={resetKey}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        onInit={(_evt, editor) => {
          editorRef.current = editor
        }}
        initialValue={content}
        onEditorChange={() => {
          // Debounce content sync to avoid cursor issues
          // The parent state update was causing TinyMCE to lose cursor position
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
          }
          debounceTimer.current = setTimeout(() => {
            syncToParent()
          }, AUTOSAVE_DEBOUNCE_MS)
        }}
        init={{
          height: 1200,
          menubar: true,
          language: 'cs',
          language_url: '/tinymce/langs/cs.js',
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'help',
            'wordcount',
            'quickbars',
            'pagebreak',
          ],
          toolbar:
            'undo redo | blocks fontsize | ' +
            'bold italic underline forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'image link table | pagebreak | removeformat | fullscreen',
          // Quickbars configuration
          toolbar_mode: 'sliding',
          quickbars_selection_toolbar: 'bold italic underline | blocks | forecolor',
          quickbars_insert_toolbar: false,
          // Content styling
          content_style: `
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              font-size: 16px;
              line-height: 1.75;
              color: #18181B;
              padding: 32px 40px;
              max-width: 100%;
              margin: 0;
              background-color: #fff;
            }
            p { margin: 1em 0; }
            h1 { font-size: 28px; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.75em; line-height: 1.2; }
            h2 { font-size: 24px; font-weight: 600; margin-top: 1.25em; margin-bottom: 0.5em; line-height: 1.3; }
            h3 { font-size: 20px; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; line-height: 1.4; }
            h4 { font-size: 18px; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; }
            h5, h6 { font-size: 16px; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; }
            ul, ol { padding-left: 1.5em; margin: 1em 0; }
            ul { list-style-type: disc; }
            ol { list-style-type: decimal; }
            li { margin: 0.5em 0; }
            img { max-width: 100%; height: auto; border-radius: 6px; margin: 1em 0; }
            a { color: #075985; text-decoration: underline; }
            table { border-collapse: collapse; width: 100%; margin: 1em 0; }
            th, td { border: 1px solid #d1d5db; padding: 0.75em; }
            th { background-color: #f3f4f6; font-weight: 600; }
            blockquote { border-left: 4px solid #d1d5db; margin: 1em 0; padding-left: 1em; color: #6b7280; }
            code { background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
            pre { background-color: #f3f4f6; padding: 1em; border-radius: 6px; overflow-x: auto; }
            
            /* Page break styling - visible indicator in editor */
            .mce-pagebreak {
              display: block;
              width: 100%;
              height: 4px;
              margin: 24px 0;
              border: none;
              background: repeating-linear-gradient(
                90deg,
                #94a3b8 0px,
                #94a3b8 8px,
                transparent 8px,
                transparent 16px
              );
              position: relative;
              cursor: default;
              page-break-after: always;
            }
            
            .mce-pagebreak::before {
              content: 'Konec stránky – klikni na Tisk pro náhled';
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              background: #f1f5f9;
              padding: 4px 16px;
              font-size: 12px;
              font-weight: 500;
              color: #64748b;
              border-radius: 4px;
              border: 1px solid #cbd5e1;
              white-space: nowrap;
            }
          `,
          // Skin
          skin: 'oxide',
          content_css: false,
          // Font size options
          font_size_formats: '12px 14px 16px 18px 20px 24px 28px 32px 36px',
          // Image handling
          images_upload_handler: handleImageUpload,
          automatic_uploads: true,
          file_picker_types: 'image',
          paste_data_images: true,
          // Image editing
          image_caption: true,
          image_advtab: true,
          image_title: true,
          // Block formats for the dropdown
          block_formats: 'Odstavec=p; Nadpis 1=h1; Nadpis 2=h2; Nadpis 3=h3; Nadpis 4=h4',
          // Resize settings
          resize: false,
          min_height: 600,
          // Branding
          branding: false,
          promotion: false,
          // Paste settings - preserve formatting from Word/Google Docs
          paste_webkit_styles: 'all',
          paste_merge_formats: true,
          // Table settings
          table_default_styles: {
            'border-collapse': 'collapse',
            'width': '100%',
          },
          table_default_attributes: {
            border: '1',
          },
          // Color picker
          color_cols: 6,
          color_map: [
            '000000', 'Černá',
            '434343', 'Tmavě šedá',
            '666666', 'Šedá',
            '999999', 'Středně šedá',
            'b7b7b7', 'Světle šedá',
            'ffffff', 'Bílá',
            '980000', 'Tmavě červená',
            'ff0000', 'Červená',
            'ff9900', 'Oranžová',
            'ffff00', 'Žlutá',
            '00ff00', 'Zelená',
            '00ffff', 'Tyrkysová',
            '4a86e8', 'Světle modrá',
            '0000ff', 'Modrá',
            '9900ff', 'Fialová',
            'ff00ff', 'Růžová',
            '075985', 'Primární',
            '0c4a6e', 'Primární tmavá',
          ],
        placeholder,
          // Pagebreak settings
          pagebreak_separator: '<!-- pagebreak -->',
          pagebreak_split_block: true,
          // Setup - sync content on blur
          setup: (editor) => {
            // Sync content when editor loses focus (important for form submission)
            editor.on('blur', () => {
              // Clear any pending debounce
              if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
                debounceTimer.current = null
              }
              // Immediately sync content
              const currentContent = editor.getContent()
              if (currentContent !== lastSyncedContent.current) {
                lastSyncedContent.current = currentContent
                onChangeRef.current(currentContent)
              }
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
