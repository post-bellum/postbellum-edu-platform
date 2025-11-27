import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphMovement: {
      moveParagraphUp: () => ReturnType
      moveParagraphDown: () => ReturnType
    }
  }
}

/**
 * Custom Tiptap extension for moving paragraphs/sections up and down
 * Provides commands: moveParagraphUp and moveParagraphDown
 */
export const ParagraphMovement = Extension.create({
  name: 'paragraphMovement',

  addCommands() {
    return {
      moveParagraphUp: () => ({ state, dispatch }) => {
        const { selection } = state
        const { $from } = selection

        // Find the paragraph or heading node containing the selection
        let depth = $from.depth
        let node = null
        let pos = -1

        // Walk up the node tree to find a paragraph or heading
        while (depth > 0) {
          const nodeAtDepth = $from.node(depth)
          if (nodeAtDepth.type.name === 'paragraph' || nodeAtDepth.type.name.startsWith('heading')) {
            node = nodeAtDepth
            pos = $from.start(depth)
            break
          }
          depth--
        }

        if (!node || pos < 0) {
          return false
        }

        // Get the document
        const doc = state.doc
        let currentIndex = -1

        // Find current node index in document
        doc.forEach((child, offset, index) => {
          if (offset <= pos && offset + child.nodeSize > pos) {
            currentIndex = index
          }
        })

        if (currentIndex <= 0) {
          return false
        }

        const tr = state.tr
        const currentNode = doc.child(currentIndex)
        const prevNode = doc.child(currentIndex - 1)

        // Calculate positions using the document structure
        let prevStart = 1
        for (let i = 0; i < currentIndex - 1; i++) {
          prevStart += doc.child(i).nodeSize + 1
        }
        const prevEnd = prevStart + prevNode.nodeSize
        
        const currentStart = prevEnd + 1
        const currentEnd = currentStart + currentNode.nodeSize

        // Validate positions are within bounds
        const docSize = doc.content.size
        if (prevStart < 1 || prevEnd > docSize || currentStart < 1 || currentEnd > docSize) {
          return false
        }

        try {
          // Copy nodes
          const currentNodeCopy = currentNode.copy()
          const prevNodeCopy = prevNode.copy()

          // Delete current node first (from end)
          tr.delete(currentStart, currentEnd)
          
          // Then delete previous node
          tr.delete(prevStart, prevEnd)

          // Insert in swapped order
          tr.insert(prevStart, currentNodeCopy)
          tr.insert(currentStart - currentNode.nodeSize, prevNodeCopy)

          // Update selection safely
          const newPos = Math.min(prevStart + currentNodeCopy.nodeSize, tr.doc.content.size - 1)
          if (newPos >= 1) {
            tr.setSelection(TextSelection.near(tr.doc.resolve(newPos)))
          }
        } catch {
          // If anything fails, don't dispatch
          return false
        }

        if (dispatch) {
          dispatch(tr)
        }

        return true
      },

      moveParagraphDown: () => ({ state, dispatch }) => {
        const { selection } = state
        const { $from } = selection

        // Find the paragraph or heading node containing the selection
        let depth = $from.depth
        let node = null
        let pos = -1

        // Walk up the node tree to find a paragraph or heading
        while (depth > 0) {
          const nodeAtDepth = $from.node(depth)
          if (nodeAtDepth.type.name === 'paragraph' || nodeAtDepth.type.name.startsWith('heading')) {
            node = nodeAtDepth
            pos = $from.start(depth)
            break
          }
          depth--
        }

        if (!node || pos < 0) {
          return false
        }

        // Get the document
        const doc = state.doc
        let currentIndex = -1

        // Find current node index in document
        doc.forEach((child, offset, index) => {
          if (offset <= pos && offset + child.nodeSize > pos) {
            currentIndex = index
          }
        })

        if (currentIndex >= doc.childCount - 1) {
          return false
        }

        const tr = state.tr
        const currentNode = doc.child(currentIndex)
        const nextNode = doc.child(currentIndex + 1)

        // Calculate positions using the document structure
        let currentStart = 1
        for (let i = 0; i < currentIndex; i++) {
          currentStart += doc.child(i).nodeSize + 1
        }
        const currentEnd = currentStart + currentNode.nodeSize
        const nextStart = currentEnd + 1
        const nextEnd = nextStart + nextNode.nodeSize

        // Validate positions are within bounds
        const docSize = doc.content.size
        if (currentStart < 1 || currentEnd > docSize || nextStart < 1 || nextEnd > docSize) {
          return false
        }

        try {
          // Copy nodes
          const currentNodeCopy = currentNode.copy()
          const nextNodeCopy = nextNode.copy()

          // Delete next node first (from end)
          tr.delete(nextStart, nextEnd)
          
          // Then delete current node
          tr.delete(currentStart, currentEnd)

          // Insert in swapped order
          tr.insert(currentStart, nextNodeCopy)
          tr.insert(nextStart - nextNode.nodeSize, currentNodeCopy)

          // Update selection safely
          const newPos = Math.min(currentStart + nextNodeCopy.nodeSize + currentNodeCopy.nodeSize, tr.doc.content.size - 1)
          if (newPos >= 1) {
            tr.setSelection(TextSelection.near(tr.doc.resolve(newPos)))
          }
        } catch {
          // If anything fails, don't dispatch
          return false
        }

        if (dispatch) {
          dispatch(tr)
        }

        return true
      },
    }
  },
})
