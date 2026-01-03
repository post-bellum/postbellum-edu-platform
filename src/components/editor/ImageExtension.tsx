import Image from '@tiptap/extension-image'

/**
 * Custom Image extension with resizing, alignment, and floating support
 */
export const ImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width') || element.style.width
          return width ? width.replace('px', '') : null
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px; max-width: 100%;`,
          }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height') || element.style.height
          return height ? height.replace('px', '') : null
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
            style: `height: ${attributes.height}px;`,
          }
        },
      },
      align: {
        default: 'left',
        parseHTML: (element) => {
          const align = element.style.textAlign || element.getAttribute('align') || element.parentElement?.style.textAlign
          return align || 'left'
        },
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === 'left') {
            return {}
          }
          return {
            style: `text-align: ${attributes.align};`,
          }
        },
      },
      float: {
        default: null,
        parseHTML: (element) => {
          return element.style.float || null
        },
        renderHTML: (attributes) => {
          if (!attributes.float) {
            return {}
          }
          return {
            style: `float: ${attributes.float};`,
          }
        },
      },
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      // Use object to hold mutable state to avoid closure issues
      const state = {
        node,
        isSelected: false,
        isResizing: false,
        startX: 0,
        startWidth: 0,
        cleanupFns: [] as (() => void)[],
      }

      const wrapper = document.createElement('div')
      wrapper.className = 'image-wrapper'

      const img = document.createElement('img')
      img.src = state.node.attrs.src
      img.alt = state.node.attrs.alt || ''
      img.style.cssText = `
        width: ${state.node.attrs.width ? `${state.node.attrs.width}px` : 'auto'};
        height: ${state.node.attrs.height ? `${state.node.attrs.height}px` : 'auto'};
        max-width: 100%;
        display: block;
        border-radius: 0.375rem;
      `
      
      // Check if node is selected
      const checkSelection = () => {
        if (typeof getPos !== 'function') return false
        const { selection } = editor.state
        const pos = getPos()
        if (pos === null || pos === undefined) return false
        return selection.from <= pos && selection.to >= pos + state.node.nodeSize
      }

      // Update wrapper styles based on current state
      const updateWrapperStyles = () => {
        wrapper.style.cssText = `
          display: inline-block;
          position: relative;
          max-width: 100%;
          margin: 0.5em 0;
          ${state.node.attrs.float ? `float: ${state.node.attrs.float};` : ''}
          ${state.node.attrs.align === 'center' ? 'display: block; margin-left: auto; margin-right: auto;' : ''}
          ${state.node.attrs.align === 'right' ? 'float: right;' : ''}
          ${state.isSelected ? 'outline: 2px solid #075985; outline-offset: 2px;' : ''}
        `
      }

      // Create resize handle with mouse and touch support
      const createResizeHandle = () => {
        const resizeHandle = document.createElement('div')
        resizeHandle.className = 'resize-handle'
        resizeHandle.style.cssText = `
          position: absolute;
          right: 0;
          bottom: 0;
          width: 16px;
          height: 16px;
          background-color: #075985;
          cursor: nwse-resize;
          border: 2px solid white;
          border-radius: 2px;
          z-index: 10;
          touch-action: none;
        `

        const startResize = (clientX: number) => {
          state.isResizing = true
          state.startX = clientX
          state.startWidth = parseInt(String(state.node.attrs.width)) || img.offsetWidth
        }

        const handleResize = (clientX: number) => {
          if (!state.isResizing) return
          const diff = clientX - state.startX
          const newWidth = Math.max(50, Math.min(800, state.startWidth + diff))
          img.style.width = `${newWidth}px`
        }

        const endResize = () => {
          if (!state.isResizing) return
          state.isResizing = false
          const finalWidth = parseInt(img.style.width) || state.startWidth
          
          if (typeof getPos === 'function') {
            const pos = getPos()
            if (pos !== null && pos !== undefined) {
              editor.view.dispatch(
                editor.view.state.tr.setNodeMarkup(pos, undefined, {
                  ...state.node.attrs,
                  width: finalWidth,
                })
              )
            }
          }
        }

        // Mouse events
        const handleMouseMove = (e: MouseEvent) => handleResize(e.clientX)
        const handleMouseUp = () => {
          endResize()
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }

        resizeHandle.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
          startResize(e.clientX)
          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        })

        // Touch events
        const handleTouchMove = (e: TouchEvent) => {
          if (e.touches.length === 1) {
            handleResize(e.touches[0].clientX)
          }
        }
        const handleTouchEnd = () => {
          endResize()
          document.removeEventListener('touchmove', handleTouchMove)
          document.removeEventListener('touchend', handleTouchEnd)
        }

        resizeHandle.addEventListener('touchstart', (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (e.touches.length === 1) {
            startResize(e.touches[0].clientX)
            document.addEventListener('touchmove', handleTouchMove, { passive: false })
            document.addEventListener('touchend', handleTouchEnd)
          }
        }, { passive: false })

        return resizeHandle
      }

      // Add or remove resize handle based on selection
      const updateResizeHandle = () => {
        const existingHandle = wrapper.querySelector('.resize-handle')
        if (state.isSelected && !existingHandle) {
          wrapper.appendChild(createResizeHandle())
        } else if (!state.isSelected && existingHandle) {
          existingHandle.remove()
        }
      }

      // Update selection state on editor updates
      const updateSelection = () => {
        const newSelected = checkSelection()
        if (newSelected !== state.isSelected) {
          state.isSelected = newSelected
          updateWrapperStyles()
          updateResizeHandle()
        }
      }

      // Initial setup
      state.isSelected = checkSelection()
      updateWrapperStyles()
      wrapper.appendChild(img)
      if (state.isSelected) {
        wrapper.appendChild(createResizeHandle())
      }
      
      // Listen to selection changes
      editor.on('selectionUpdate', updateSelection)
      editor.on('update', updateSelection)
      state.cleanupFns.push(() => {
        editor.off('selectionUpdate', updateSelection)
        editor.off('update', updateSelection)
      })
      
      return {
        dom: wrapper,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false
          
          // Update state reference
          state.node = updatedNode
          
          // Update image src if changed
          img.src = updatedNode.attrs.src
          img.alt = updatedNode.attrs.alt || ''
          img.style.width = updatedNode.attrs.width ? `${updatedNode.attrs.width}px` : 'auto'
          img.style.height = updatedNode.attrs.height ? `${updatedNode.attrs.height}px` : 'auto'
          
          // Update wrapper styles for alignment/float changes
          updateWrapperStyles()
          
          return true
        },
        destroy: () => {
          state.cleanupFns.forEach(fn => fn())
        },
      }
    }
  },
})
