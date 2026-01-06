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
          menubar: 'file edit view insert format table help',
          menu: {
            file: { title: 'Soubor', items: 'preview | print' },
            edit: { title: 'Úpravy', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
            view: { title: 'Zobrazit', items: 'visualblocks | fullscreen' },
            insert: { title: 'Vložit', items: 'image link | charmap insertdatetime | pagebreak' },
            format: { title: 'Formát', items: 'bold italic underline strikethrough superscript subscript | styles blocks fontsize align lineheight | forecolor backcolor | removeformat' },
            table: { title: 'Tabulka', items: 'inserttable | cell row column | tableprops deletetable' },
            help: { title: 'Nápověda', items: 'help' },
          },
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
            'image link table | pagebreak | moveblockup moveblockdown | removeformat | fullscreen',
          // Contextual toolbar for images (shown when clicking on an image)
          image_toolbar: 'floatleft floatnone floatright | rotateimage flipimageh flipimagev | image',
          // Quickbars configuration
          toolbar_mode: 'sliding',
          quickbars_selection_toolbar: 'bold italic underline | blocks | forecolor | moveblockup moveblockdown',
          quickbars_insert_toolbar: false,
          quickbars_image_toolbar: 'floatleft floatnone floatright | rotateimage flipimageh flipimagev | image',
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
            img { 
              max-width: 100%; 
              height: auto; 
              border-radius: 6px; 
              transition: all 0.2s ease;
              /* Allow inline images by default */
              display: inline-block;
              vertical-align: top;
              margin: 0.5em 0.5em 0.5em 0;
            }
            img:hover { outline: 2px solid #075985; outline-offset: 2px; cursor: pointer; }
            
            /* Images that are the only child of a paragraph - display as block */
            p > img:only-child { display: block; margin: 1em auto; }
            
            /* Image alignment classes */
            img.img-align-left { float: left; margin: 0.5em 1.5em 1em 0; max-width: 50%; }
            img.img-align-right { float: right; margin: 0.5em 0 1em 1.5em; max-width: 50%; }
            img.img-align-center { display: block; margin-left: auto; margin-right: auto; float: none; }
            img.img-full-width { width: 100%; max-width: 100%; float: none; display: block; }
            
            /* Image style classes */
            img.img-rounded { border-radius: 16px; }
            img.img-bordered { border: 3px solid #e5e7eb; border-radius: 8px; }
            img.img-shadow { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
            
            /* Combined classes work together */
            img.img-rounded.img-shadow { border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15); }
            img.img-bordered.img-shadow { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15); }
            
            /* Figure/caption styling for images with captions */
            figure.image { display: table; margin: 1.5em auto; max-width: 100%; }
            figure.image img { display: block; margin: 0 auto; }
            figure.image figcaption { display: table-caption; caption-side: bottom; text-align: center; font-size: 14px; color: #6b7280; padding: 8px 0; font-style: italic; }
            
            /* Clearfix - only applied to specific elements, not paragraphs (to allow text wrap around floated images) */
            .clearfix::after { content: ""; display: table; clear: both; }
            
            /* Clear float after headings to prevent text from wrapping into next section */
            h1, h2, h3, h4, h5, h6 { clear: both; }
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
          // Image editing and manipulation
          image_caption: true,
          image_advtab: true,
          image_title: true,
          image_dimensions: true,
          image_description: true,
          // Allow users to resize images by dragging
          object_resizing: 'img',
          resize_img_proportional: true,
          // Image class presets for easy styling
          image_class_list: [
            { title: 'Bez stylu', value: '' },
            { title: 'Zarovnat vlevo', value: 'img-align-left' },
            { title: 'Zarovnat vpravo', value: 'img-align-right' },
            { title: 'Na střed', value: 'img-align-center' },
            { title: 'Na celou šířku', value: 'img-full-width' },
            { title: 'Zaoblené rohy', value: 'img-rounded' },
            { title: 'S rámečkem', value: 'img-bordered' },
            { title: 'Stín', value: 'img-shadow' },
          ],
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
          // Setup - sync content on blur and register custom commands
          setup: (editor) => {
            // Helper function to get the current block element
            const getBlockElement = (): HTMLElement | null => {
              const node = editor.selection.getNode()
              // Get the closest block-level element
              const blockElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'TABLE', 'FIGURE']
              let current: HTMLElement | null = node as HTMLElement
              while (current && current !== editor.getBody()) {
                if (blockElements.includes(current.nodeName)) {
                  return current
                }
                current = current.parentElement
              }
              return null
            }

            // Helper function to get selected image
            const getSelectedImage = (): HTMLImageElement | null => {
              const node = editor.selection.getNode()
              if (node.nodeName === 'IMG') {
                return node as HTMLImageElement
              }
              // Check if we're in a figure with an image
              const img = node.querySelector?.('img')
              return img as HTMLImageElement | null
            }

            // Register rotate image command using canvas
            editor.addCommand('rotateImage', () => {
              const img = getSelectedImage()
              if (!img) return

              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              if (!ctx) return

              const image = new Image()
              image.crossOrigin = 'anonymous'
              image.onload = () => {
                // Swap dimensions for 90-degree rotation
                canvas.width = image.height
                canvas.height = image.width
                
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.rotate(Math.PI / 2)
                ctx.drawImage(image, -image.width / 2, -image.height / 2)
                
                img.src = canvas.toDataURL('image/png')
                // Swap width/height attributes
                const oldWidth = img.width
                img.width = img.height
                img.height = oldWidth
              }
              image.src = img.src
            })

            // Register flip horizontal command
            editor.addCommand('flipImageH', () => {
              const img = getSelectedImage()
              if (!img) return

              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              if (!ctx) return

              const image = new Image()
              image.crossOrigin = 'anonymous'
              image.onload = () => {
                canvas.width = image.width
                canvas.height = image.height
                
                ctx.translate(canvas.width, 0)
                ctx.scale(-1, 1)
                ctx.drawImage(image, 0, 0)
                
                img.src = canvas.toDataURL('image/png')
              }
              image.src = img.src
            })

            // Register flip vertical command
            editor.addCommand('flipImageV', () => {
              const img = getSelectedImage()
              if (!img) return

              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              if (!ctx) return

              const image = new Image()
              image.crossOrigin = 'anonymous'
              image.onload = () => {
                canvas.width = image.width
                canvas.height = image.height
                
                ctx.translate(0, canvas.height)
                ctx.scale(1, -1)
                ctx.drawImage(image, 0, 0)
                
                img.src = canvas.toDataURL('image/png')
              }
              image.src = img.src
            })

            // Helper to remove all float-related classes from image
            const removeFloatClasses = (img: HTMLImageElement) => {
              img.classList.remove('img-align-left', 'img-align-right', 'img-align-center', 'img-full-width')
              img.style.float = ''
              img.style.margin = ''
              img.style.maxWidth = ''
            }

            // Register float left command
            editor.addCommand('floatImageLeft', () => {
              const img = getSelectedImage()
              if (!img) return
              removeFloatClasses(img)
              img.classList.add('img-align-left')
            })

            // Register float right command
            editor.addCommand('floatImageRight', () => {
              const img = getSelectedImage()
              if (!img) return
              removeFloatClasses(img)
              img.classList.add('img-align-right')
            })

            // Register float none (inline) command
            editor.addCommand('floatImageNone', () => {
              const img = getSelectedImage()
              if (!img) return
              removeFloatClasses(img)
            })

            // Register float left toggle button
            editor.ui.registry.addToggleButton('floatleft', {
              icon: 'align-left',
              tooltip: 'Obtékání textu zleva',
              onAction: () => editor.execCommand('floatImageLeft'),
              onSetup: (buttonApi) => {
                const updateState = () => {
                  const img = getSelectedImage()
                  buttonApi.setEnabled(!!img)
                  buttonApi.setActive(!!img?.classList.contains('img-align-left'))
                }
                editor.on('NodeChange', updateState)
                updateState()
                return () => editor.off('NodeChange', updateState)
              }
            })

            // Register float right toggle button
            editor.ui.registry.addToggleButton('floatright', {
              icon: 'align-right',
              tooltip: 'Obtékání textu zprava',
              onAction: () => editor.execCommand('floatImageRight'),
              onSetup: (buttonApi) => {
                const updateState = () => {
                  const img = getSelectedImage()
                  buttonApi.setEnabled(!!img)
                  buttonApi.setActive(!!img?.classList.contains('img-align-right'))
                }
                editor.on('NodeChange', updateState)
                updateState()
                return () => editor.off('NodeChange', updateState)
              }
            })

            // Register float none toggle button
            editor.ui.registry.addToggleButton('floatnone', {
              icon: 'align-center',
              tooltip: 'Bez obtékání',
              onAction: () => editor.execCommand('floatImageNone'),
              onSetup: (buttonApi) => {
                const updateState = () => {
                  const img = getSelectedImage()
                  buttonApi.setEnabled(!!img)
                  const hasNoFloat = img && !img.classList.contains('img-align-left') && !img.classList.contains('img-align-right')
                  buttonApi.setActive(!!hasNoFloat)
                }
                editor.on('NodeChange', updateState)
                updateState()
                return () => editor.off('NodeChange', updateState)
              }
            })

            // Register rotate button
            editor.ui.registry.addButton('rotateimage', {
              icon: 'rotate-right',
              tooltip: 'Otočit obrázek o 90°',
              onAction: () => editor.execCommand('rotateImage'),
              onSetup: (buttonApi) => {
                const updateState = () => {
                  buttonApi.setEnabled(!!getSelectedImage())
                }
                editor.on('NodeChange', updateState)
                updateState()
                return () => editor.off('NodeChange', updateState)
              }
            })

            // Register flip horizontal button
            editor.ui.registry.addButton('flipimageh', {
              icon: 'flip-horizontally',
              tooltip: 'Převrátit vodorovně',
              onAction: () => editor.execCommand('flipImageH'),
              onSetup: (buttonApi) => {
                const updateState = () => {
                  buttonApi.setEnabled(!!getSelectedImage())
                }
                editor.on('NodeChange', updateState)
                updateState()
                return () => editor.off('NodeChange', updateState)
              }
            })

            // Register flip vertical button
            editor.ui.registry.addButton('flipimagev', {
              icon: 'flip-vertically',
              tooltip: 'Převrátit svisle',
              onAction: () => editor.execCommand('flipImageV'),
              onSetup: (buttonApi) => {
                const updateState = () => {
                  buttonApi.setEnabled(!!getSelectedImage())
                }
                editor.on('NodeChange', updateState)
                updateState()
                return () => editor.off('NodeChange', updateState)
              }
            })

            // Image manipulation menu button (combines all image tools)
            editor.ui.registry.addMenuButton('imagetools', {
              icon: 'image',
              tooltip: 'Nástroje obrázku',
              fetch: (callback) => {
                callback([
                  {
                    type: 'menuitem',
                    text: 'Otočit o 90°',
                    icon: 'rotate-right',
                    onAction: () => editor.execCommand('rotateImage')
                  },
                  {
                    type: 'menuitem',
                    text: 'Převrátit vodorovně',
                    icon: 'flip-horizontally',
                    onAction: () => editor.execCommand('flipImageH')
                  },
                  {
                    type: 'menuitem',
                    text: 'Převrátit svisle',
                    icon: 'flip-vertically',
                    onAction: () => editor.execCommand('flipImageV')
                  },
                  {
                    type: 'separator'
                  },
                  {
                    type: 'menuitem',
                    text: 'Vlastnosti obrázku...',
                    icon: 'image',
                    onAction: () => editor.execCommand('mceImage')
                  }
                ])
              },
              onSetup: (buttonApi) => {
                const updateState = () => {
                  buttonApi.setEnabled(!!getSelectedImage())
                }
                editor.on('NodeChange', updateState)
                updateState()
                return () => editor.off('NodeChange', updateState)
              }
            })

            // Register move block up command
            editor.addCommand('moveBlockUp', () => {
              const block = getBlockElement()
              if (!block) return
              
              const parent = block.parentElement
              const prevSibling = block.previousElementSibling as HTMLElement | null
              
              if (parent && prevSibling) {
                parent.insertBefore(block, prevSibling)
                editor.selection.select(block)
                editor.selection.collapse(true)
                editor.focus()
              }
            })

            // Register move block down command
            editor.addCommand('moveBlockDown', () => {
              const block = getBlockElement()
              if (!block) return
              
              const parent = block.parentElement
              const nextSibling = block.nextElementSibling as HTMLElement | null
              
              if (parent && nextSibling) {
                parent.insertBefore(nextSibling, block)
                editor.selection.select(block)
                editor.selection.collapse(true)
                editor.focus()
              }
            })

            // Register move block up button
            editor.ui.registry.addButton('moveblockup', {
              icon: 'chevron-up',
              tooltip: 'Přesunout blok nahoru',
              onAction: () => editor.execCommand('moveBlockUp'),
              onSetup: (buttonApi) => {
                const updateState = () => {
                  const block = getBlockElement()
                  buttonApi.setEnabled(!!block?.previousElementSibling)
                }
                editor.on('NodeChange', updateState)
                updateState()
                return () => editor.off('NodeChange', updateState)
              }
            })

            // Register move block down button
            editor.ui.registry.addButton('moveblockdown', {
              icon: 'chevron-down',
              tooltip: 'Přesunout blok dolů',
              onAction: () => editor.execCommand('moveBlockDown'),
              onSetup: (buttonApi) => {
                const updateState = () => {
                  const block = getBlockElement()
                  buttonApi.setEnabled(!!block?.nextElementSibling)
                }
                editor.on('NodeChange', updateState)
                updateState()
                return () => editor.off('NodeChange', updateState)
              }
            })

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
