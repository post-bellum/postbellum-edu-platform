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
      const wrapper = document.createElement('div')
      wrapper.className = 'image-wrapper'
      
      // Check if node is selected
      const checkSelection = () => {
        if (typeof getPos !== 'function') return false
        const { selection } = editor.state
        const pos = getPos()
        if (pos === null || pos === undefined) return false
        return selection.from <= pos && selection.to >= pos + node.nodeSize
      }
      
      let isSelected = checkSelection()
      
      wrapper.style.cssText = `
        display: inline-block;
        position: relative;
        max-width: 100%;
        margin: 0.5em 0;
        ${node.attrs.float ? `float: ${node.attrs.float};` : ''}
        ${node.attrs.align === 'center' ? 'display: block; margin-left: auto; margin-right: auto;' : ''}
        ${node.attrs.align === 'right' ? 'float: right;' : ''}
        ${isSelected ? 'outline: 2px solid #075985; outline-offset: 2px;' : ''}
      `

      const img = document.createElement('img')
      img.src = node.attrs.src
      img.alt = node.attrs.alt || ''
      img.style.cssText = `
        width: ${node.attrs.width ? `${node.attrs.width}px` : 'auto'};
        height: ${node.attrs.height ? `${node.attrs.height}px` : 'auto'};
        max-width: 100%;
        display: block;
        border-radius: 0.375rem;
      `

      // Add resize handle when selected
      if (isSelected) {
        const resizeHandle = document.createElement('div')
        resizeHandle.className = 'resize-handle'
        resizeHandle.style.cssText = `
          position: absolute;
          right: 0;
          bottom: 0;
          width: 12px;
          height: 12px;
          background-color: #075985;
          cursor: nwse-resize;
          border: 2px solid white;
          border-radius: 2px;
          z-index: 10;
        `

        let isResizing = false
        let startX = 0
        let startWidth = parseInt(node.attrs.width) || img.offsetWidth

        resizeHandle.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
          isResizing = true
          startX = e.clientX
          startWidth = parseInt(node.attrs.width) || img.offsetWidth

          const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return
            const diff = e.clientX - startX
            const newWidth = Math.max(50, Math.min(800, startWidth + diff))
            img.style.width = `${newWidth}px`
          }

          const handleMouseUp = () => {
            if (!isResizing) return
            isResizing = false
            const finalWidth = parseInt(img.style.width) || startWidth
            
            if (typeof getPos === 'function') {
              const pos = getPos()
              if (pos !== null && pos !== undefined) {
                editor.view.dispatch(
                  editor.view.state.tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    width: finalWidth,
                  })
                )
              }
            }

            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
          }

          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        })

        wrapper.appendChild(resizeHandle)
      }

      wrapper.appendChild(img)
      
      // Update selection state on editor updates
      const updateSelection = () => {
        const newSelected = checkSelection()
        if (newSelected !== isSelected) {
          isSelected = newSelected
          wrapper.style.outline = isSelected ? '2px solid #075985' : 'none'
          wrapper.style.outlineOffset = isSelected ? '2px' : '0'
          
          // Add/remove resize handle
          const existingHandle = wrapper.querySelector('.resize-handle')
          if (isSelected && !existingHandle) {
            // Re-add resize handle logic here if needed
            // For now, resize handle is added on initial render
          } else if (!isSelected && existingHandle) {
            existingHandle.remove()
          }
        }
      }
      
      // Listen to selection changes
      editor.on('selectionUpdate', updateSelection)
      editor.on('update', updateSelection)
      
      return {
        dom: wrapper,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false
          // Update image src if changed
          if (updatedNode.attrs.src !== node.attrs.src) {
            img.src = updatedNode.attrs.src
          }
          // Update image alt if changed
          if (updatedNode.attrs.alt !== node.attrs.alt) {
            img.alt = updatedNode.attrs.alt || ''
          }
          // Update width if changed
          if (updatedNode.attrs.width !== node.attrs.width) {
            img.style.width = updatedNode.attrs.width ? `${updatedNode.attrs.width}px` : 'auto'
          }
          // Update height if changed
          if (updatedNode.attrs.height !== node.attrs.height) {
            img.style.height = updatedNode.attrs.height ? `${updatedNode.attrs.height}px` : 'auto'
          }
          node = updatedNode
          return true
        },
        destroy: () => {
          editor.off('selectionUpdate', updateSelection)
          editor.off('update', updateSelection)
        },
      }
    }
  },
})
