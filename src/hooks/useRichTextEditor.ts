/**
 * useRichTextEditor Hook
 * 
 * Encapsulates all the stateful logic for the RichTextEditor component,
 * including refs, callbacks, and cleanup.
 */

import * as React from 'react'
import type { Editor as TinyMCEEditor } from 'tinymce'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import { logger } from '@/lib/logger'

// Debounce delay for autosave
const AUTOSAVE_DEBOUNCE_MS = 1000

interface UseRichTextEditorOptions {
  content: string
  onChange: (html: string) => void
}

interface UseRichTextEditorReturn {
  /** Ref to the TinyMCE editor instance */
  editorRef: React.MutableRefObject<TinyMCEEditor | null>
  /** Ref to the debounce timer */
  debounceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  /** Ref to track last synced content */
  lastSyncedContentRef: React.MutableRefObject<string>
  /** Ref to onChange callback (avoids stale closures) */
  onChangeRef: React.MutableRefObject<(html: string) => void>
  /** Sync current editor content to parent */
  syncToParent: () => void
  /** Handle image uploads (paste, drag & drop, or file picker) */
  handleImageUpload: (
    blobInfo: { blob: () => Blob; filename: () => string },
    progress: (percent: number) => void
  ) => Promise<string>
  /** Debounced editor change handler */
  handleEditorChange: () => void
}

/**
 * Hook that manages RichTextEditor state and callbacks
 */
export function useRichTextEditor({
  content,
  onChange,
}: UseRichTextEditorOptions): UseRichTextEditorReturn {
  const editorRef = React.useRef<TinyMCEEditor | null>(null)
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncedContentRef = React.useRef<string>(content)
  
  // Store onChange in a ref so we can access it in callbacks without causing re-renders
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange
  
  // Sync content to parent (called on blur and debounced during editing)
  const syncToParent = React.useCallback(() => {
    if (!editorRef.current) return
    const currentContent = editorRef.current.getContent()
    // Only call onChange if content actually changed
    if (currentContent !== lastSyncedContentRef.current) {
      lastSyncedContentRef.current = currentContent
      onChangeRef.current(currentContent)
    }
  }, [])
  
  // Cleanup debounce timer on unmount and sync final content
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
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

  // Debounced editor change handler
  const handleEditorChange = React.useCallback(() => {
    // Debounce content sync to avoid cursor issues
    // The parent state update was causing TinyMCE to lose cursor position
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      syncToParent()
    }, AUTOSAVE_DEBOUNCE_MS)
  }, [syncToParent])

  return {
    editorRef,
    debounceTimerRef,
    lastSyncedContentRef,
    onChangeRef,
    syncToParent,
    handleImageUpload,
    handleEditorChange,
  }
}

