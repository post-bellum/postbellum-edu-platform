'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { ImageExtension } from './ImageExtension'
import { ParagraphMovement } from './ParagraphMovement'
import { BlockControls } from './BlockControls'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import { Button } from '@/components/ui/Button'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
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
        // Link is included in StarterKit, so we configure it here instead of adding separately
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline hover:text-primary-hover',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
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

        // Check clipboard items for images
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

        // Also check HTML content for base64 images (Google Docs sometimes embeds images this way)
        const htmlData = clipboardData.getData('text/html')
        if (htmlData && htmlData.includes('<img') && editorRef.current) {
          // Extract base64 images from HTML
          const imgRegex = /<img[^>]+src="(data:image\/[^;]+;base64,[^"]+)"/gi
          const matches = [...htmlData.matchAll(imgRegex)]
          
          if (matches.length > 0) {
            event.preventDefault()
            
            // Process all images found
            const imagePromises = matches.map((match) => {
              const base64Data = match[1]
              
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
                    return { original: base64Data, replacement: url }
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
            
            // Wait for all images to upload, then replace in HTML
            Promise.all(imagePromises).then((replacements) => {
              // Check if component is still mounted before updating
              if (!editorRef.current || !isMountedRef.current) return
              
              let updatedHtml = htmlData
              replacements.forEach((replacement) => {
                if (replacement) {
                  updatedHtml = updatedHtml.replace(replacement.original, replacement.replacement)
                }
              })
              
              // Insert the updated HTML with Supabase URLs
              editorRef.current.chain().focus().insertContent(updatedHtml).run()
            })
            
            return true
          }
        }
        
        // Let Tiptap handle other paste operations (text, Word, etc.)
        return false
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={cn('border border-gray-300 rounded-md bg-gray-50', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 flex-wrap bg-white rounded-t-md">
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

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Nadpis 1"
          title="Nadpis 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Nadpis 2"
          title="Nadpis 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Nadpis 3"
          title="Nadpis 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

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
      <div className="overflow-y-auto p-4 group/editor">
        <div className="a4-paper">
          <div className="a4-content relative">
            <BlockControls editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  )
}
