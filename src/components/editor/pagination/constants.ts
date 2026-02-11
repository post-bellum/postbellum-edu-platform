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
 * A4 physical: 210mm x 297mm
 * Display width: 850px (scaled up from 794px for better screen readability)
 * Display height: 1202px (maintains A4 aspect ratio 1:1.414)
 * Editor padding: 60px top, 80px bottom, 60px left, 60px right
 * Usable content height per page: 1202 - 60 - 80 = 1062px
 */
export const PAGE_DIMS: PageDimensions = {
  width: 850,
  height: 1202,
  margin: {
    top: 60,
    bottom: 80,
    left: 60,
    right: 60,
  },
}

/** Usable content height per page (page height minus top and bottom margins) */
export const USABLE_PAGE_HEIGHT =
  PAGE_DIMS.height - PAGE_DIMS.margin.top - PAGE_DIMS.margin.bottom // 1062px

/** Usable content width (page width minus left and right margins) */
export const USABLE_PAGE_WIDTH =
  PAGE_DIMS.width - PAGE_DIMS.margin.left - PAGE_DIMS.margin.right // 730px

/** Visual gap between pages in the editor (px) */
export const PAGE_GAP = 40
