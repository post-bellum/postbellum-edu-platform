/**
 * TinyMCE Custom Commands and UI Components
 * 
 * This file contains all custom commands, buttons, and menu items
 * registered with the TinyMCE editor for image manipulation and block movement.
 */

import type { Editor as TinyMCEEditor } from 'tinymce'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the current block-level element containing the cursor
 */
const getBlockElement = (editor: TinyMCEEditor): HTMLElement | null => {
  const node = editor.selection.getNode()
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

/**
 * Get the currently selected image element
 */
const getSelectedImage = (editor: TinyMCEEditor): HTMLImageElement | null => {
  const node = editor.selection.getNode()
  if (node.nodeName === 'IMG') {
    return node as HTMLImageElement
  }
  // Check if we're in a figure with an image
  const img = node.querySelector?.('img')
  return img as HTMLImageElement | null
}

/**
 * Remove all float-related classes from an image
 */
const removeFloatClasses = (img: HTMLImageElement): void => {
  img.classList.remove('img-align-left', 'img-align-right', 'img-align-center', 'img-full-width')
  img.style.float = ''
  img.style.margin = ''
  img.style.maxWidth = ''
}

// ============================================================================
// IMAGE COMMANDS
// ============================================================================

/**
 * Register image manipulation commands (rotate, flip)
 */
const registerImageCommands = (editor: TinyMCEEditor): void => {
  // Rotate image 90 degrees clockwise
  editor.addCommand('rotateImage', () => {
    const img = getSelectedImage(editor)
    if (!img) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      canvas.width = image.height
      canvas.height = image.width
      
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(Math.PI / 2)
      ctx.drawImage(image, -image.width / 2, -image.height / 2)
      
      img.src = canvas.toDataURL('image/png')
      const oldWidth = img.width
      img.width = img.height
      img.height = oldWidth
    }
    image.src = img.src
  })

  // Flip image horizontally
  editor.addCommand('flipImageH', () => {
    const img = getSelectedImage(editor)
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

  // Flip image vertically
  editor.addCommand('flipImageV', () => {
    const img = getSelectedImage(editor)
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

  // Float image left
  editor.addCommand('floatImageLeft', () => {
    const img = getSelectedImage(editor)
    if (!img) return
    removeFloatClasses(img)
    img.classList.add('img-align-left')
  })

  // Float image right
  editor.addCommand('floatImageRight', () => {
    const img = getSelectedImage(editor)
    if (!img) return
    removeFloatClasses(img)
    img.classList.add('img-align-right')
  })

  // Remove float (inline)
  editor.addCommand('floatImageNone', () => {
    const img = getSelectedImage(editor)
    if (!img) return
    removeFloatClasses(img)
  })
}

// ============================================================================
// BLOCK COMMANDS
// ============================================================================

/**
 * Register block movement commands (move up/down)
 */
const registerBlockCommands = (editor: TinyMCEEditor): void => {
  // Move block up
  editor.addCommand('moveBlockUp', () => {
    const block = getBlockElement(editor)
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

  // Move block down
  editor.addCommand('moveBlockDown', () => {
    const block = getBlockElement(editor)
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
}

// ============================================================================
// UI BUTTONS
// ============================================================================

/**
 * Register image-related toolbar buttons
 */
const registerImageButtons = (editor: TinyMCEEditor): void => {
  // Float left toggle button
  editor.ui.registry.addToggleButton('floatleft', {
    icon: 'align-left',
    tooltip: 'Obtékání textu zleva',
    onAction: () => editor.execCommand('floatImageLeft'),
    onSetup: (buttonApi) => {
      const updateState = () => {
        const img = getSelectedImage(editor)
        buttonApi.setEnabled(!!img)
        buttonApi.setActive(!!img?.classList.contains('img-align-left'))
      }
      editor.on('NodeChange', updateState)
      updateState()
      return () => editor.off('NodeChange', updateState)
    }
  })

  // Float right toggle button
  editor.ui.registry.addToggleButton('floatright', {
    icon: 'align-right',
    tooltip: 'Obtékání textu zprava',
    onAction: () => editor.execCommand('floatImageRight'),
    onSetup: (buttonApi) => {
      const updateState = () => {
        const img = getSelectedImage(editor)
        buttonApi.setEnabled(!!img)
        buttonApi.setActive(!!img?.classList.contains('img-align-right'))
      }
      editor.on('NodeChange', updateState)
      updateState()
      return () => editor.off('NodeChange', updateState)
    }
  })

  // Float none toggle button
  editor.ui.registry.addToggleButton('floatnone', {
    icon: 'align-center',
    tooltip: 'Bez obtékání',
    onAction: () => editor.execCommand('floatImageNone'),
    onSetup: (buttonApi) => {
      const updateState = () => {
        const img = getSelectedImage(editor)
        buttonApi.setEnabled(!!img)
        const hasNoFloat = img && !img.classList.contains('img-align-left') && !img.classList.contains('img-align-right')
        buttonApi.setActive(!!hasNoFloat)
      }
      editor.on('NodeChange', updateState)
      updateState()
      return () => editor.off('NodeChange', updateState)
    }
  })

  // Rotate button
  editor.ui.registry.addButton('rotateimage', {
    icon: 'rotate-right',
    tooltip: 'Otočit obrázek o 90°',
    onAction: () => editor.execCommand('rotateImage'),
    onSetup: (buttonApi) => {
      const updateState = () => {
        buttonApi.setEnabled(!!getSelectedImage(editor))
      }
      editor.on('NodeChange', updateState)
      updateState()
      return () => editor.off('NodeChange', updateState)
    }
  })

  // Flip horizontal button
  editor.ui.registry.addButton('flipimageh', {
    icon: 'flip-horizontally',
    tooltip: 'Převrátit vodorovně',
    onAction: () => editor.execCommand('flipImageH'),
    onSetup: (buttonApi) => {
      const updateState = () => {
        buttonApi.setEnabled(!!getSelectedImage(editor))
      }
      editor.on('NodeChange', updateState)
      updateState()
      return () => editor.off('NodeChange', updateState)
    }
  })

  // Flip vertical button
  editor.ui.registry.addButton('flipimagev', {
    icon: 'flip-vertically',
    tooltip: 'Převrátit svisle',
    onAction: () => editor.execCommand('flipImageV'),
    onSetup: (buttonApi) => {
      const updateState = () => {
        buttonApi.setEnabled(!!getSelectedImage(editor))
      }
      editor.on('NodeChange', updateState)
      updateState()
      return () => editor.off('NodeChange', updateState)
    }
  })

  // Image tools menu button
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
        buttonApi.setEnabled(!!getSelectedImage(editor))
      }
      editor.on('NodeChange', updateState)
      updateState()
      return () => editor.off('NodeChange', updateState)
    }
  })
}

/**
 * Register block movement toolbar buttons
 */
const registerBlockButtons = (editor: TinyMCEEditor): void => {
  // Move block up button
  editor.ui.registry.addButton('moveblockup', {
    icon: 'chevron-up',
    tooltip: 'Přesunout blok nahoru',
    onAction: () => editor.execCommand('moveBlockUp'),
    onSetup: (buttonApi) => {
      const updateState = () => {
        const block = getBlockElement(editor)
        buttonApi.setEnabled(!!block?.previousElementSibling)
      }
      editor.on('NodeChange', updateState)
      updateState()
      return () => editor.off('NodeChange', updateState)
    }
  })

  // Move block down button
  editor.ui.registry.addButton('moveblockdown', {
    icon: 'chevron-down',
    tooltip: 'Přesunout blok dolů',
    onAction: () => editor.execCommand('moveBlockDown'),
    onSetup: (buttonApi) => {
      const updateState = () => {
        const block = getBlockElement(editor)
        buttonApi.setEnabled(!!block?.nextElementSibling)
      }
      editor.on('NodeChange', updateState)
      updateState()
      return () => editor.off('NodeChange', updateState)
    }
  })
}

// ============================================================================
// MAIN SETUP FUNCTION
// ============================================================================

export interface SetupEditorOptions {
  /** Callback to sync content on blur */
  onBlur: () => void
  /** Debounce timer ref for cleanup */
  debounceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  /** Last synced content ref */
  lastSyncedContentRef: React.MutableRefObject<string>
  /** onChange callback ref */
  onChangeRef: React.MutableRefObject<(html: string) => void>
}

/**
 * Main setup function that registers all custom commands, buttons, and event handlers
 */
export const setupEditor = (
  editor: TinyMCEEditor,
  options: SetupEditorOptions
): void => {
  const { onBlur, debounceTimerRef, lastSyncedContentRef, onChangeRef } = options

  // Register all commands
  registerImageCommands(editor)
  registerBlockCommands(editor)

  // Register all UI buttons
  registerImageButtons(editor)
  registerBlockButtons(editor)

  // Sync content when editor loses focus
  editor.on('blur', () => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    // Immediately sync content
    const currentContent = editor.getContent()
    if (currentContent !== lastSyncedContentRef.current) {
      lastSyncedContentRef.current = currentContent
      onChangeRef.current(currentContent)
    }
  })
}

