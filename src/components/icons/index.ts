/**
 * Centralized Icon Exports
 * 
 * This module provides a single import point for all icons used in the application.
 * 
 * Usage:
 *   import { FileText, ArrowLeft, GoogleIcon } from '@/components/icons'
 * 
 * Icons are organized into two categories:
 * 1. Lucide Icons - Standard icon library (lucide-react)
 * 2. Brand/Custom Icons - Custom SVG components for logos and special icons
 */

// ============================================================================
// LUCIDE ICONS
// Standard icons from lucide-react library
// ============================================================================

// Document & File Icons
export { FileText } from 'lucide-react'
export { FilePenLine } from 'lucide-react'
export { FileEdit } from 'lucide-react'
export { ClipboardList } from 'lucide-react'

// Navigation Icons
export { ArrowLeft } from 'lucide-react'
export { ChevronRight } from 'lucide-react'
export { ChevronDown } from 'lucide-react'
export { MoreVertical } from 'lucide-react'
export { Menu } from 'lucide-react'

// Action Icons
export { Check } from 'lucide-react'
export { Plus } from 'lucide-react'
export { Edit } from 'lucide-react'
export { Pencil } from 'lucide-react'
export { Trash2 } from 'lucide-react'
export { Copy } from 'lucide-react'
export { Download } from 'lucide-react'
export { Eye } from 'lucide-react'
export { X } from 'lucide-react'

// Status & Feedback Icons
export { Loader2 } from 'lucide-react'
export { Lightbulb } from 'lucide-react'

// Device Icons
export { Monitor } from 'lucide-react'

// Favorites & Bookmarks Icons
export { Heart } from 'lucide-react'
export { Bookmark } from 'lucide-react'

// Access & Security Icons
export { Lock } from 'lucide-react'

// Media Icons (from Figma design)
export { Video } from 'lucide-react'

// Learning & Progress Icons (from Figma design)
export { Rocket } from 'lucide-react'
export { Brain } from 'lucide-react'

// ============================================================================
// BRAND & CUSTOM ICONS
// Custom SVG components for logos and special icons
// ============================================================================

export {
  GoogleIcon,
  MicrosoftIcon,
  SearchIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  BookmarkIcon as BookmarkIconCustom,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  MenuTwoLinesIcon,
} from './BrandIcons'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { LucideProps, LucideIcon } from 'lucide-react'
