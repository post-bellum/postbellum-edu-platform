/**
 * Pagination Constants
 *
 * A4 page dimensions and layout constants for the paginated editor.
 * Based on the richtexteditor library constants, adjusted for the
 * current editor padding (60px top, 80px bottom, 60px sides).
 *
 * 1 CSS inch = 96px (standard)
 */

export interface PageDimensions {
  /** Width in CSS pixels at 96 DPI */
  width: number
  /** Height in CSS pixels at 96 DPI */
  height: number
  /** Margins / padding in CSS pixels */
  margin: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

/**
 * A4 page dimensions matching the editor surface layout.
 *
 * A4 physical: 210mm x 297mm => 794px x 1123px at 96 DPI
 * Editor padding: 60px top, 80px bottom, 60px left, 60px right
 * Usable content height per page: 1123 - 60 - 80 = 983px
 */
export const PAGE_DIMS: PageDimensions = {
  width: 794,
  height: 1123,
  margin: {
    top: 60,
    bottom: 80,
    left: 60,
    right: 60,
  },
}

/** Usable content height per page (page height minus top and bottom margins) */
export const USABLE_PAGE_HEIGHT =
  PAGE_DIMS.height - PAGE_DIMS.margin.top - PAGE_DIMS.margin.bottom // 983px

/** Usable content width (page width minus left and right margins) */
export const USABLE_PAGE_WIDTH =
  PAGE_DIMS.width - PAGE_DIMS.margin.left - PAGE_DIMS.margin.right // 674px

/** Visual gap between pages in the editor (px) */
export const PAGE_GAP = 40
