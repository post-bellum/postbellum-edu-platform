import sanitizeHtml from 'sanitize-html'

/**
 * Basic input sanitization to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return input
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  
  // Remove script-like patterns (improved)
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
  
  // Remove HTML entity encodings that could be used for XSS
  sanitized = sanitized
    .replace(/&#x[\da-f]+;/gi, '')
    .replace(/&#\d+;/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Sanitize HTML content to prevent XSS attacks while preserving safe formatting
 * Allows safe HTML tags for rich text content (paragraphs, headings, lists, formatting, links, images, tables)
 * Preserves inline styles for formatting from Word/Google Docs paste
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (!html) return html

  return sanitizeHtml(html, {
    allowedTags: [
      // Text structure
      'p', 'br', 'div', 'span',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Text formatting
      'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup', 'mark',
      // Lists
      'ul', 'ol', 'li',
      // Links and media
      'a', 'img',
      // Tables
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
      // Other
      'blockquote', 'code', 'pre', 'hr',
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'rel', 'title', 'class', 'style'],
      'img': ['src', 'alt', 'title', 'class', 'style', 'width', 'height'],
      'table': ['class', 'style', 'border', 'cellpadding', 'cellspacing', 'width'],
      'th': ['class', 'style', 'colspan', 'rowspan', 'scope', 'width', 'align', 'valign'],
      'td': ['class', 'style', 'colspan', 'rowspan', 'width', 'align', 'valign'],
      'tr': ['class', 'style'],
      'col': ['style', 'width', 'span'],
      'colgroup': ['style', 'span'],
      // Allow style and class on all other elements for formatting preservation
      '*': ['class', 'style'],
    },
    // Allowed CSS properties in style attributes (security filter)
    allowedStyles: {
      '*': {
        // Colors
        'color': [/.*/],
        'background-color': [/.*/],
        'background': [/^(?!.*url\().*$/], // Allow background but not url()
        // Text formatting
        'font-size': [/.*/],
        'font-weight': [/.*/],
        'font-style': [/.*/],
        'font-family': [/.*/],
        'text-decoration': [/.*/],
        'text-align': [/.*/],
        'text-indent': [/.*/],
        'line-height': [/.*/],
        'letter-spacing': [/.*/],
        'vertical-align': [/.*/],
        // Box model
        'margin': [/.*/],
        'margin-top': [/.*/],
        'margin-right': [/.*/],
        'margin-bottom': [/.*/],
        'margin-left': [/.*/],
        'padding': [/.*/],
        'padding-top': [/.*/],
        'padding-right': [/.*/],
        'padding-bottom': [/.*/],
        'padding-left': [/.*/],
        // Borders
        'border': [/.*/],
        'border-top': [/.*/],
        'border-right': [/.*/],
        'border-bottom': [/.*/],
        'border-left': [/.*/],
        'border-width': [/.*/],
        'border-style': [/.*/],
        'border-color': [/.*/],
        'border-collapse': [/.*/],
        'border-spacing': [/.*/],
        'border-radius': [/.*/],
        // Dimensions
        'width': [/.*/],
        'height': [/.*/],
        'max-width': [/.*/],
        'min-width': [/.*/],
        // Display and layout
        'display': [/^(block|inline|inline-block|table|table-row|table-cell|flex|none)$/],
        'float': [/^(left|right|none)$/],
        'clear': [/^(left|right|both|none)$/],
        // Lists
        'list-style': [/.*/],
        'list-style-type': [/.*/],
        // Table
        'table-layout': [/.*/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    // Transform tags to add security attributes
    transformTags: {
      'a': (tagName, attribs) => {
        return {
          tagName,
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }
      },
    },
    disallowedTagsMode: 'discard',
  })
}

/**
 * Sanitize multiple inputs
 * @param inputs - Object with string values to sanitize
 * @returns Object with sanitized values
 */
export function sanitizeInputs<T extends Record<string, string | undefined | null>>(
  inputs: T
): T {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value as T[keyof T]
    }
  }
  
  return sanitized
}
