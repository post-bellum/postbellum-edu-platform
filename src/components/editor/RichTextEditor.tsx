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
}

// Helper to clean content before saving (remove editor-only classes)
function cleanContent(html: string): string {
  // Remove mce-block-selected class from all elements
  return html.replace(/\s*class="mce-block-selected"/g, '')
    .replace(/\s*class="([^"]*)\s*mce-block-selected\s*([^"]*)"/g, (_, before, after) => {
      const remaining = `${before} ${after}`.trim()
      return remaining ? ` class="${remaining}"` : ''
    })
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Začněte psát...',
  className,
}: RichTextEditorProps) {
  const editorRef = React.useRef<TinyMCEEditor | null>(null)

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
    <div className={cn(
      'border border-gray-200 rounded-xl bg-white overflow-hidden',
      'shadow-lg shadow-gray-200/50',
      'ring-1 ring-gray-100',
      className
    )}>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        onInit={(_evt, editor) => {
          editorRef.current = editor
        }}
        value={content}
        onEditorChange={(newContent) => {
          // Clean the content before passing to parent
          onChange(cleanContent(newContent))
        }}
        init={{
          height: 800,
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
            'image link table | pagebreak | removeformat | print | fullscreen',
          // Quickbars configuration
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
            
            /* Block highlight styles - visual only, not saved */
            .mce-block-selected {
              outline: 2px solid rgba(7, 89, 133, 0.5);
              outline-offset: 2px;
              background-color: rgba(7, 89, 133, 0.08);
              border-radius: 4px;
            }
            
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
            
            /* Print styles - page breaks work here */
            @media print {
              .mce-pagebreak {
                height: 0 !important;
                margin: 0 !important;
                background: none !important;
                page-break-after: always !important;
              }
              
              .mce-pagebreak::before {
                display: none !important;
              }
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
          resize: true,
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
          // Setup custom block movement
          setup: (editor) => {
            // Register custom print button (print plugin removed in TinyMCE 6+)
            editor.ui.registry.addButton('print', {
              icon: 'print',
              tooltip: 'Tisknout (Ctrl+P)',
              onAction: () => {
                editor.getWin()?.print()
              },
            })

            // Add print keyboard shortcut
            editor.addShortcut('ctrl+p', 'Print', () => {
              editor.getWin()?.print()
            })

            // Helper: Get the top-level block element containing the cursor
            const getTopLevelBlock = (): HTMLElement | null => {
              const node = editor.selection.getNode()
              if (!node) return null
              
              const body = editor.getBody()
              let current: HTMLElement | null = node as HTMLElement
              
              // Walk up to find the direct child of body
              while (current && current.parentElement !== body) {
                current = current.parentElement
              }
              
              return current
            }

            // Track the currently highlighted block
            let highlightedBlock: HTMLElement | null = null

            const highlightBlock = (block: HTMLElement | null) => {
              // Remove highlight from previous block
              if (highlightedBlock && highlightedBlock !== block) {
                highlightedBlock.classList.remove('mce-block-selected')
              }
              
              // Add highlight to new block
              if (block) {
                block.classList.add('mce-block-selected')
              }
              
              highlightedBlock = block
            }

            const clearHighlight = () => {
              if (highlightedBlock) {
                highlightedBlock.classList.remove('mce-block-selected')
                highlightedBlock = null
              }
            }

            // Update highlight on cursor movement (only when focused)
            editor.on('NodeChange', () => {
              if (editor.hasFocus()) {
                const block = getTopLevelBlock()
                highlightBlock(block)
              } else {
                clearHighlight()
              }
            })

            // Clean up on blur - ensure highlight is removed when editor loses focus
            editor.on('blur', () => {
              clearHighlight()
            })
            
            // Re-highlight on focus
            editor.on('focus', () => {
              const block = getTopLevelBlock()
              if (block) {
                highlightBlock(block)
              }
            })

            // Move block up
            const moveBlockUp = () => {
              const block = getTopLevelBlock()
              if (!block) return
              
              const prevSibling = block.previousElementSibling as HTMLElement | null
              if (!prevSibling) return
              
              // Remove highlight before move
              clearHighlight()
              
              // Move the block
              block.parentElement?.insertBefore(block, prevSibling)
              
              // Re-focus and select
              editor.focus()
              editor.selection.setCursorLocation(block, 0)
              
              // Re-highlight after move
              highlightBlock(block)
              
              // Trigger content update
              editor.fire('change')
            }

            // Move block down
            const moveBlockDown = () => {
              const block = getTopLevelBlock()
              if (!block) return
              
              const nextSibling = block.nextElementSibling as HTMLElement | null
              if (!nextSibling) return
              
              // Remove highlight before move
              clearHighlight()
              
              // Move the block (insert next sibling before current)
              nextSibling.parentElement?.insertBefore(nextSibling, block)
              
              // Re-focus and select
              editor.focus()
              editor.selection.setCursorLocation(block, 0)
              
              // Re-highlight after move
              highlightBlock(block)
              
              // Trigger content update
              editor.fire('change')
            }

            // Delete block
            const deleteBlock = () => {
              const block = getTopLevelBlock()
              if (!block) return
              
              // Clear highlight
              clearHighlight()
              
              // Get next or previous sibling to move cursor to
              const nextBlock = block.nextElementSibling || block.previousElementSibling
              
              // Remove the block
              block.remove()
              
              // Move cursor to adjacent block if exists
              if (nextBlock) {
                editor.selection.setCursorLocation(nextBlock as HTMLElement, 0)
                highlightBlock(nextBlock as HTMLElement)
              }
              
              // Trigger content update
              editor.fire('change')
            }

            // Register move up button
            editor.ui.registry.addButton('moveup', {
              icon: 'chevron-up',
              tooltip: 'Přesunout nahoru (Alt+↑)',
              onAction: moveBlockUp,
            })

            // Register move down button
            editor.ui.registry.addButton('movedown', {
              icon: 'chevron-down',
              tooltip: 'Přesunout dolů (Alt+↓)',
              onAction: moveBlockDown,
            })

            // Register delete block button
            editor.ui.registry.addButton('deleteblock', {
              icon: 'remove',
              tooltip: 'Smazat blok (Alt+Delete)',
              onAction: deleteBlock,
            })

            // Register contextual toolbar for blocks (positioned on the right via JS)
            editor.ui.registry.addContextToolbar('blockmove', {
              predicate: (node) => {
                // Only show when editor has focus
                if (!editor.hasFocus()) return false
                
                // Show for block elements (direct children of body)
                const body = editor.getBody()
                if (!node || node === body) return false
                
                let current: Node | null = node
                while (current && current.parentNode !== body) {
                  current = current.parentNode
                }
                
                // Only show for block-level elements
                if (current && current !== body && current.nodeType === 1) {
                  const tagName = (current as HTMLElement).tagName.toLowerCase()
                  return ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'table', 'blockquote', 'pre', 'div'].includes(tagName)
                }
                return false
              },
              items: 'moveup movedown | deleteblock',
              position: 'node',
              scope: 'node',
            })
            
            // Reposition the context toolbar to the right side of the editor
            const repositionToolbar = () => {
              const container = editor.getContainer()
              if (!container) return
              
              const containerRect = container.getBoundingClientRect()
              const pop = document.querySelector('.tox-pop') as HTMLElement
              
              if (pop) {
                // Position on the right side of the editor
                pop.style.left = `${containerRect.right - pop.offsetWidth - 12}px`
                // Hide the arrow
                pop.style.setProperty('--tox-pop-arrow-display', 'none')
                const arrows = pop.querySelectorAll('.tox-pop__dialog::before, .tox-pop__dialog::after')
                arrows.forEach((arrow) => {
                  (arrow as HTMLElement).style.display = 'none'
                })
              }
            }
            
            // Watch for context toolbar appearing and reposition it
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                  mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement && node.classList.contains('tox-pop')) {
                      // Small delay to let TinyMCE finish positioning
                      requestAnimationFrame(repositionToolbar)
                    }
                  })
                }
              })
            })
            
            // Start observing the document body for context toolbar
            observer.observe(document.body, { childList: true, subtree: true })
            
            // Also reposition on node change (when moving between blocks)
            editor.on('NodeChange', () => {
              requestAnimationFrame(repositionToolbar)
            })
            
            // Clean up observer when editor is removed
            editor.on('remove', () => {
              observer.disconnect()
            })
            
            // Add CSS to ensure horizontal layout and hide arrows
            const style = document.createElement('style')
            style.textContent = `
              .tox-pop::before,
              .tox-pop::after {
                display: none !important;
              }
              .tox-pop .tox-pop__dialog {
                flex-direction: row !important;
              }
              .tox-pop .tox-toolbar {
                flex-direction: row !important;
                flex-wrap: nowrap !important;
              }
              .tox-pop .tox-toolbar__group {
                flex-direction: row !important;
                flex-wrap: nowrap !important;
              }
            `
            document.head.appendChild(style)

            // Add keyboard shortcuts
            editor.addShortcut('alt+up', 'Move block up', moveBlockUp)
            editor.addShortcut('alt+down', 'Move block down', moveBlockDown)
            editor.addShortcut('alt+delete', 'Delete block', deleteBlock)
          },
        }}
      />
    </div>
  )
}
