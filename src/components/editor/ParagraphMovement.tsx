import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { Fragment } from '@tiptap/pm/model'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphMovement: {
      moveParagraphUp: () => ReturnType
      moveParagraphDown: () => ReturnType
    }
  }
}

/**
 * Custom Tiptap extension for moving block-level nodes (paragraphs, headings, images, lists) up and down
 * Provides commands: moveParagraphUp and moveParagraphDown
 */
export const ParagraphMovement = Extension.create({
  name: 'paragraphMovement',

  addCommands() {
    return {
      moveParagraphUp: () => ({ state, dispatch }) => {
        const { selection } = state
        const { $from } = selection
        const doc = state.doc

        // Find the top-level block node containing the selection
        // We need to find the depth where the parent is the document (depth 0)
        let blockDepth = $from.depth
        while (blockDepth > 1 && $from.node(blockDepth - 1).type.name !== 'doc') {
          blockDepth--
        }

        if (blockDepth < 1) {
          return false
        }

        // Get position before the current block (start of block in document)
        const blockStart = $from.before(blockDepth)
        // Get position after the current block (end of block in document)
        const blockEnd = $from.after(blockDepth)
        
        // Calculate relative offset from block start
        const relativeOffset = selection.from - blockStart

        // Find the index of current block in document
        let currentIndex = -1
        let pos = 0
        for (let i = 0; i < doc.childCount; i++) {
          const child = doc.child(i)
          if (pos === blockStart) {
            currentIndex = i
            break
          }
          pos += child.nodeSize
        }

        // Can't move up if already first
        if (currentIndex <= 0) {
          return false
        }

        if (!dispatch) {
          return true
        }

        // Get the current and previous blocks
        const currentBlock = doc.child(currentIndex)
        const prevBlock = doc.child(currentIndex - 1)

        // Calculate the start position of the previous block
        let prevBlockStart = 0
        for (let i = 0; i < currentIndex - 1; i++) {
          prevBlockStart += doc.child(i).nodeSize
        }
        const prevBlockEnd = prevBlockStart + prevBlock.nodeSize

        // Create a transaction that replaces both blocks with swapped order
        const tr = state.tr

        // Replace the range from prevBlockStart to blockEnd with [currentBlock, prevBlock]
        const newContent = Fragment.from([currentBlock, prevBlock])
        tr.replaceWith(prevBlockStart, blockEnd, newContent)

        // Set selection to the moved block (now at prevBlockStart) preserving relative position
        const newSelectionPos = Math.min(
          prevBlockStart + relativeOffset,
          prevBlockStart + currentBlock.nodeSize - 1
        )
        
        if (newSelectionPos < tr.doc.content.size && newSelectionPos >= 0) {
          try {
            tr.setSelection(TextSelection.near(tr.doc.resolve(newSelectionPos)))
          } catch {
            // Fallback to start of block
            tr.setSelection(TextSelection.near(tr.doc.resolve(prevBlockStart + 1)))
          }
        }

        dispatch(tr)
        return true
      },

      moveParagraphDown: () => ({ state, dispatch }) => {
        const { selection } = state
        const { $from } = selection
        const doc = state.doc

        // Find the top-level block node containing the selection
        let blockDepth = $from.depth
        while (blockDepth > 1 && $from.node(blockDepth - 1).type.name !== 'doc') {
          blockDepth--
        }

        if (blockDepth < 1) {
          return false
        }

        // Get position before and after the current block
        const blockStart = $from.before(blockDepth)
        const blockEnd = $from.after(blockDepth)
        
        // Calculate relative offset from block start
        const relativeOffset = selection.from - blockStart

        // Find the index of current block in document
        let currentIndex = -1
        let pos = 0
        for (let i = 0; i < doc.childCount; i++) {
          const child = doc.child(i)
          if (pos === blockStart) {
            currentIndex = i
            break
          }
          pos += child.nodeSize
        }

        // Can't move down if already last
        if (currentIndex < 0 || currentIndex >= doc.childCount - 1) {
          return false
        }

        if (!dispatch) {
          return true
        }

        // Get the current and next blocks
        const currentBlock = doc.child(currentIndex)
        const nextBlock = doc.child(currentIndex + 1)

        // Calculate the end position of the next block
        const nextBlockEnd = blockEnd + nextBlock.nodeSize

        // Create a transaction that replaces both blocks with swapped order
        const tr = state.tr

        // Replace the range from blockStart to nextBlockEnd with [nextBlock, currentBlock]
        const newContent = Fragment.from([nextBlock, currentBlock])
        tr.replaceWith(blockStart, nextBlockEnd, newContent)

        // Set selection to the moved block (now after nextBlock) preserving relative position
        const newBlockStart = blockStart + nextBlock.nodeSize
        const newSelectionPos = Math.min(
          newBlockStart + relativeOffset,
          newBlockStart + currentBlock.nodeSize - 1
        )
        
        if (newSelectionPos < tr.doc.content.size && newSelectionPos >= 0) {
          try {
            tr.setSelection(TextSelection.near(tr.doc.resolve(newSelectionPos)))
          } catch {
            // Fallback to start of block
            tr.setSelection(TextSelection.near(tr.doc.resolve(newBlockStart + 1)))
          }
        }

        dispatch(tr)
        return true
      },
    }
  },
})
