'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Heading from '@tiptap/extension-heading'
import { ImageExtension } from './ImageExtension'
import { ParagraphMovement } from './ParagraphMovement'
import { BlockControls } from './BlockControls'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import { Button } from '@/components/ui/Button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Underline as UnderlineIcon,
  Palette,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Začněte psát...',
  className,
}: RichTextEditorProps) {
  const editorRef = React.useRef<ReturnType<typeof useEditor> | null>(null)
  const isMountedRef = React.useRef(true)
  // State to trigger re-render when selection changes
  const [, setUpdateCounter] = React.useState(0)

  // Cleanup on unmount to prevent async operations on unmounted component
  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable some features we don't need
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        // Disable default heading - we'll add custom one below
        heading: false,
      }),
      // Custom Heading extension with enhanced parsing for Google Docs/Word
      Heading.extend({
        addAttributes() {
          return {
            level: {
              default: 1,
              parseHTML: element => {
                // Check for data-level attribute (from our own editor)
                const dataLevel = element.getAttribute('data-level')
                if (dataLevel) {
                  return parseInt(dataLevel, 10)
                }
                
                // Check for standard heading tags
                const tagMatch = element.tagName.match(/^H([1-6])$/)
                if (tagMatch) {
                  return parseInt(tagMatch[1], 10)
                }
                
                return 1
              },
              renderHTML: attributes => {
                return {
                  'data-level': attributes.level,
                }
              },
            },
          }
        },
        
        parseHTML() {
          // Helper to get font size from element or inner span
          const getFontSize = (node: HTMLElement): number => {
            // Check inner span first (Google Docs puts styles there)
            const span = node.querySelector('span')
            if (span) {
              const style = span.getAttribute('style') || ''
              const match = style.match(/font-size:\s*(\d+(?:\.\d+)?)(pt|px)/i)
              if (match) {
                let size = parseFloat(match[1])
                if (match[2].toLowerCase() === 'px') size = size / 1.333
                return size
              }
            }
            // Fallback to element style
            if (node.style && node.style.fontSize) {
              return parseFloat(node.style.fontSize)
            }
            return 0
          }
          
          // Parse standard heading tags
          const standardRules = [
            { tag: 'h1', attrs: { level: 1 } },
            { tag: 'h2', attrs: { level: 2 } },
            { tag: 'h3', attrs: { level: 3 } },
            { tag: 'h4', attrs: { level: 4 } },
            { tag: 'h5', attrs: { level: 5 } },
            { tag: 'h6', attrs: { level: 6 } },
          ]
          
          // Rules for Google Docs/Word styled paragraphs
          const styledRules = [
            {
              tag: 'p',
              getAttrs: (node: string | HTMLElement) => {
                if (typeof node === 'string') return false
                
                // Check for data-level attribute (from our editor)
                const dataLevel = node.getAttribute('data-level')
                if (dataLevel) {
                  return { level: parseInt(dataLevel) }
                }
                
                // Check for heading classes
                const className = (node.className || '').toLowerCase()
                if (className.includes('title') || className.includes('heading-1') || className.includes('heading1')) {
                  return { level: 1 }
                }
                if (className.includes('subtitle') || className.includes('heading-2') || className.includes('heading2')) {
                  return { level: 2 }
                }
                if (className.includes('heading-3') || className.includes('heading3')) {
                  return { level: 3 }
                }
                if (className.includes('heading-4') || className.includes('heading4')) {
                  return { level: 4 }
                }
                
                // Check for role=heading
                const role = node.getAttribute('role')
                if (role === 'heading') {
                  const ariaLevel = node.getAttribute('aria-level')
                  if (ariaLevel) return { level: parseInt(ariaLevel, 10) }
                }
                
                // Detect by font size (Google Docs Title/Subtitle and headings)
                const fontSize = getFontSize(node)
                if (fontSize >= 24) return { level: 1 }  // Title or large heading
                if (fontSize >= 18) return { level: 2 }  // Subtitle or medium heading
                if (fontSize >= 14) return { level: 3 }  // Smaller heading
                
                return false
              },
            },
          ]
          
          return [...standardRules, ...styledRules]
        },
      }).configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: 'heading',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextStyle,
      Color,
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
        inline: false,
        allowBase64: false, // We'll use Supabase storage instead
      }),
      ParagraphMovement,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      // Trigger re-render to update toolbar state
      setUpdateCounter(c => c + 1)
    },
    onSelectionUpdate: () => {
      // Trigger re-render when cursor position changes
      setUpdateCounter(c => c + 1)
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-full',
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData
        
        if (!clipboardData) {
          return false
        }

        // Check clipboard items for direct image files
        if (clipboardData.items && clipboardData.items.length > 0) {
          const items = Array.from(clipboardData.items)
          
          // Look for image items (check all image types)
          const imageItem = items.find((item: DataTransferItem) => {
            return item.type.startsWith('image/')
          })
          
          if (imageItem) {
            const file = imageItem.getAsFile()
            if (file && editorRef.current) {
              event.preventDefault()
              
              // Upload image directly to Supabase Storage (client-side, bypasses Server Action limit)
              uploadImageToStorage(file, 'lesson-materials', 'images')
                .then((url) => {
                  // Check if component is still mounted before updating
                  if (url && editorRef.current && isMountedRef.current) {
                    // Insert image using Tiptap editor with the Supabase URL
                    editorRef.current.chain().focus().setImage({ src: url }).run()
                  }
                })
                .catch((error) => {
                  if (isMountedRef.current) {
                    logger.error('Error uploading image', error)
                  }
                })
              
              return true
            }
          }
        }

        // Check HTML content for base64 images (Google Docs sometimes embeds images this way)
        const htmlData = clipboardData.getData('text/html')
        if (htmlData && htmlData.includes('<img') && editorRef.current) {
          // Extract base64 images from HTML
          const imgRegex = /<img[^>]+src="(data:image\/[^;]+;base64,[^"]+)"[^>]*>/gi
          const matches = [...htmlData.matchAll(imgRegex)]
          
          if (matches.length > 0) {
            event.preventDefault()
            
            // Process all images found
            const imagePromises = matches.map((match) => {
              const base64Data = match[1]
              const fullImgTag = match[0]
              
              // Extract alignment/style attributes from the img tag
              const alignMatch = fullImgTag.match(/align="([^"]+)"/i) || 
                                fullImgTag.match(/text-align:\s*([^;"]+)/i)
              const floatMatch = fullImgTag.match(/float:\s*([^;"]+)/i)
              const widthMatch = fullImgTag.match(/width:\s*(\d+)px/i) || 
                                fullImgTag.match(/width="(\d+)"/i)
              
              const attributes = {
                align: alignMatch ? alignMatch[1] : 'left',
                float: floatMatch ? floatMatch[1] : null,
                width: widthMatch ? parseInt(widthMatch[1]) : null,
              }
              
              // Convert base64 to blob
              return fetch(base64Data)
                .then(res => res.blob())
                .then(blob => {
                  // Determine file extension from blob type
                  const type = blob.type || 'image/png'
                  const ext = type.split('/')[1] || 'png'
                  const file = new File([blob], `pasted-image.${ext}`, { type })
                  
                  // Upload directly to Supabase Storage (client-side)
                  return uploadImageToStorage(file, 'lesson-materials', 'images')
                })
                .then((url) => {
                  if (url) {
                    return { original: base64Data, replacement: url, attributes }
                  }
                  return null
                })
                .catch((error) => {
                  if (isMountedRef.current) {
                    logger.error('Error processing image from HTML', error)
                  }
                  return null
                })
            })
            
            // Wait for all images to upload, then insert content with formatting preserved
            Promise.all(imagePromises).then((replacements) => {
              // Check if component is still mounted before updating
              if (!editorRef.current || !isMountedRef.current) return
              
              let updatedHtml = htmlData
              
              // Replace base64 images with Supabase URLs using simple string replace
              // (avoiding regex due to base64 data being too large for regex patterns)
              replacements.forEach((replacement) => {
                if (replacement) {
                  // Find the img tag with the base64 src using indexOf
                  // We'll do a simple string search and replace
                  const searchStr = `src="${replacement.original}"`
                  const index = updatedHtml.indexOf(searchStr)
                  
                  if (index !== -1) {
                    // Build new img tag with preserved attributes
                    let newImgTag = `<img src="${replacement.replacement}"`
                    if (replacement.attributes.width) {
                      newImgTag += ` width="${replacement.attributes.width}"`
                    }
                    if (replacement.attributes.align) {
                      newImgTag += ` data-align="${replacement.attributes.align}"`
                    }
                    if (replacement.attributes.float) {
                      newImgTag += ` data-float="${replacement.attributes.float}"`
                    }
                    newImgTag += ' />'
                    
                    // Find the start and end of the img tag
                    let tagStart = index
                    while (tagStart > 0 && updatedHtml[tagStart - 1] !== '<') {
                      tagStart--
                    }
                    tagStart-- // Include the '<'
                    
                    let tagEnd = index + searchStr.length
                    while (tagEnd < updatedHtml.length && updatedHtml[tagEnd] !== '>') {
                      tagEnd++
                    }
                    tagEnd++ // Include the '>'
                    
                    // Replace the old img tag with the new one
                    updatedHtml = updatedHtml.substring(0, tagStart) + newImgTag + updatedHtml.substring(tagEnd)
                  }
                }
              })
              
              // Insert the updated HTML with Supabase URLs and preserved formatting
              editorRef.current.chain().focus().insertContent(updatedHtml).run()
            })
            
            return true
          }
        }
        
        // Let Tiptap handle other paste operations (text, Word, Google Docs text formatting, etc.)
        // This will preserve bold, italic, headings, lists, etc.
        return false
      },
    },
  })

  if (!editor) {
    return null
  }

  // Get current text style for the select dropdown
  const getCurrentTextStyle = () => {
    if (editor.isActive('heading', { level: 1 })) return 'heading1'
    if (editor.isActive('heading', { level: 2 })) return 'heading2'
    if (editor.isActive('heading', { level: 3 })) return 'heading3'
    if (editor.isActive('heading', { level: 4 })) return 'heading4'
    if (editor.isActive('heading', { level: 5 })) return 'heading5'
    if (editor.isActive('heading', { level: 6 })) return 'heading6'
    return 'paragraph'
  }

  // Get label for current text style
  const getCurrentStyleLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Nadpis 1'
    if (editor.isActive('heading', { level: 2 })) return 'Nadpis 2'
    if (editor.isActive('heading', { level: 3 })) return 'Nadpis 3'
    if (editor.isActive('heading', { level: 4 })) return 'Nadpis 4'
    if (editor.isActive('heading', { level: 5 })) return 'Nadpis 5'
    if (editor.isActive('heading', { level: 6 })) return 'Nadpis 6'
    return 'Normální text'
  }

  // Handle text style change from select
  const handleTextStyleChange = (value: string) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else if (value.startsWith('heading')) {
      const level = parseInt(value.replace('heading', '')) as 1 | 2 | 3 | 4 | 5 | 6
      editor.chain().focus().setHeading({ level }).run()
    }
  }

  return (
    <div className={cn('border border-gray-300 rounded-lg bg-white shadow-sm', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2.5 border-b border-gray-200 flex-wrap bg-gray-50/50 rounded-t-lg backdrop-blur-sm">
        {/* Text Style Dropdown */}
        <Select value={getCurrentTextStyle()} onValueChange={handleTextStyleChange}>
          <SelectTrigger className="w-[140px] h-9 text-sm border-gray-300 hover:bg-gray-50 focus:ring-1 focus:ring-sky-500">
            <SelectValue>
              {getCurrentStyleLabel()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="min-w-[200px]">
            <SelectItem value="paragraph" className="cursor-pointer h-10">
              <span className="text-sm">Normální text</span>
            </SelectItem>
            <SelectItem value="heading1" className="cursor-pointer h-10">
              <span className="text-2xl font-bold text-gray-900">Nadpis 1</span>
            </SelectItem>
            <SelectItem value="heading2" className="cursor-pointer h-10">
              <span className="text-xl font-bold text-gray-800">Nadpis 2</span>
            </SelectItem>
            <SelectItem value="heading3" className="cursor-pointer h-10">
              <span className="text-lg font-semibold text-gray-700">Nadpis 3</span>
            </SelectItem>
            <SelectItem value="heading4" className="cursor-pointer h-10">
              <span className="text-base font-semibold text-gray-600">Nadpis 4</span>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Text Formatting */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          aria-label="Tučné písmo"
          title="Tučné písmo"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          aria-label="Kurzíva"
          title="Kurzíva"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('underline') ? 'default' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          aria-label="Podtržené"
          title="Podtržené"
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>

        {/* Color Picker */}
        <div className="relative group/color">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Barva textu"
            title="Barva textu"
            className="relative"
          >
            <Palette className="w-4 h-4" />
            <span 
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
              style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
            />
          </Button>
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover/color:opacity-100 group-hover/color:visible transition-all z-50 min-w-[160px]">
            <div className="grid grid-cols-6 gap-1 mb-2">
              {[
                '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc',
                '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff',
                '#4a86e8', '#0000ff', '#9900ff', '#ff00ff', '#e6b8af', '#f4cccc',
                '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3',
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                  title={color}
                />
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 w-full px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
              onClick={() => editor.chain().focus().unsetColor().run()}
            >
              <X className="w-3 h-3" />
              Odstranit barvu
            </button>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Odrážkový seznam"
          title="Odrážkový seznam"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Číslovaný seznam"
          title="Číslovaný seznam"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        {/* Image Alignment (only show when image is selected) */}
        {editor.isActive('image') && (
          <>
            <Button
              type="button"
              variant={editor.getAttributes('image').align === 'left' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                editor.chain().focus().updateAttributes('image', { align: 'left', float: null }).run()
              }}
              aria-label="Zarovnat vlevo"
              title="Zarovnat vlevo"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={editor.getAttributes('image').align === 'center' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                editor.chain().focus().updateAttributes('image', { align: 'center', float: null }).run()
              }}
              aria-label="Zarovnat na střed"
              title="Zarovnat na střed"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={editor.getAttributes('image').align === 'right' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                editor.chain().focus().updateAttributes('image', { align: 'right', float: null }).run()
              }}
              aria-label="Zarovnat vpravo"
              title="Zarovnat vpravo"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={editor.getAttributes('image').float === 'left' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                const attrs = editor.getAttributes('image')
                const newFloat = attrs.float === 'left' ? null : 'left'
                editor.chain().focus().updateAttributes('image', { float: newFloat, align: null }).run()
              }}
              aria-label="Plovoucí vlevo"
              title="Plovoucí vlevo"
            >
              <ImageIcon className="w-4 h-4 rotate-90" />
            </Button>
            <Button
              type="button"
              variant={editor.getAttributes('image').float === 'right' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                const attrs = editor.getAttributes('image')
                const newFloat = attrs.float === 'right' ? null : 'right'
                editor.chain().focus().updateAttributes('image', { float: newFloat, align: null }).run()
              }}
              aria-label="Plovoucí vpravo"
              title="Plovoucí vpravo"
            >
              <ImageIcon className="w-4 h-4 -rotate-90" />
            </Button>
          </>
        )}
      </div>

      {/* Editor Content - A4 Paper Simulation */}
      <div className="overflow-y-auto p-6 bg-gray-50 group/editor min-h-[500px]">
        <div className="a4-paper shadow-md">
          <div className="a4-content relative bg-white">
            <BlockControls editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  )
}
