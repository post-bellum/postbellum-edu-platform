import type { PageContent, PageSlug } from '@/types/page-content.types'

export type ContentChangeKind = 'modified' | 'added' | 'removed'

export interface ContentChange {
  /** Human readable path, e.g. "Hero sekce › Titulek" */
  label: string
  kind: ContentChangeKind
  /** Formatted previous value (empty string for `added`) */
  before: string
  /** Formatted new value (empty string for `removed`) */
  after: string
}

/** Czech labels for content keys across all page schemas */
const FIELD_LABELS: Record<string, string> = {
  // homepage
  hero: 'Hero sekce',
  features: 'Co platforma nabízí',
  lessons: 'Vybrané lekce',
  testimonials: 'Reference učitelů',
  ticker: 'Ticker (běžící text)',
  buttonText: 'Text tlačítka',
  buttonHref: 'Odkaz tlačítka',
  sectionTitle: 'Titulek sekce',
  sectionDescription: 'Popis sekce',
  icon: 'Ikonka',
  quote: 'Citát',
  text: 'Text',
  // about
  intro: 'Úvod',
  pageTitle: 'Titulek stránky',
  paragraphs: 'Odstavce',
  principles: 'Principy',
  schoolNetwork: 'Síť škol',
  bannerTitle: 'Titulek banneru',
  bannerButtonText: 'Text tlačítka banneru',
  bannerButtonHref: 'Odkaz tlačítka banneru',
  projectTeam: 'Projektový tým',
  members: 'Členové',
  additionalTeam: 'Další spolupracovníci',
  expertCouncil: 'Odborná rada',
  advisoryBoard: 'Poradní sbor',
  partners: 'Partneři',
  mainSponsor: 'Hlavní partner',
  logoSrc: 'Logo',
  logoWidth: 'Šířka loga',
  logoHeight: 'Výška loga',
  // terms
  metaDescription: 'Meta popis',
  sections: 'Sekce',
  // shared
  title: 'Titulek',
  name: 'Jméno',
  role: 'Role',
  description: 'Popis',
  content: 'Obsah',
  email: 'E-mail',
  imageUrl: 'Obrázek',
  items: 'Položky',
}

const PAGE_LABELS: Record<PageSlug, string> = {
  homepage: 'Domovská stránka',
  about: 'O projektu',
  terms: 'Podmínky',
}

export function getPageLabel(slug: PageSlug): string {
  return PAGE_LABELS[slug]
}

/**
 * Czech plural of "změna". `nominative` for a standalone count ("3 změny"),
 * `accusative` after a verb ("zkontrolujte 3 změny").
 */
export function changeCountLabel(
  count: number,
  grammaticalCase: 'nominative' | 'accusative' = 'nominative'
): string {
  if (count === 1) return grammaticalCase === 'accusative' ? 'změnu' : 'změna'
  if (count < 5) return 'změny'
  return 'změn'
}

const labelFor = (key: string): string => FIELD_LABELS[key] ?? key

const MAX_VALUE_LENGTH = 160

/** Turn any leaf value into a short, readable, HTML-free preview */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'ano' : 'ne'
  if (typeof value === 'number') return String(value)

  let text =
    typeof value === 'string'
      ? value
      : Array.isArray(value)
        ? value.map(formatValue).join(' • ')
        : Object.entries(value as Record<string, unknown>)
            .map(([key, nested]) => `${labelFor(key)}: ${formatValue(nested)}`)
            .join(' • ')

  // Rich text fields store HTML — strip tags so the diff stays readable
  text = stripHtml(text)

  if (!text) return '(prázdné)'
  return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

/** Context kept on each side of the differing region when windowing long strings */
const DIFF_CONTEXT = 60

/**
 * For long strings, truncating from the start hides the actual edit. Window both
 * values around the first/last differing character instead so the change is visible.
 */
function focusStringDiff(before: string, after: string): [string, string] {
  const a = stripHtml(before)
  const b = stripHtml(after)
  if (a.length <= MAX_VALUE_LENGTH && b.length <= MAX_VALUE_LENGTH) {
    return [a, b]
  }

  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++

  let suffix = 0
  while (
    suffix < a.length - prefix &&
    suffix < b.length - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix++
  }

  const window = (text: string): string => {
    const start = Math.max(0, prefix - DIFF_CONTEXT)
    const end = Math.min(text.length, text.length - suffix + DIFF_CONTEXT)
    const slice = text.slice(start, end)
    return `${start > 0 ? '…' : ''}${slice}${end < text.length ? '…' : ''}`
  }

  return [window(a), window(b)]
}

function walk(before: unknown, after: unknown, path: string[], changes: ContentChange[]): void {
  const label = path.map(labelFor).join(' › ')

  if (Array.isArray(before) && Array.isArray(after)) {
    const max = Math.max(before.length, after.length)
    for (let i = 0; i < max; i++) {
      const itemPath = [...path, `${i + 1}. položka`]
      if (i >= before.length) {
        changes.push({
          label: itemPath.map(labelFor).join(' › '),
          kind: 'added',
          before: '',
          after: formatValue(after[i]),
        })
      } else if (i >= after.length) {
        changes.push({
          label: itemPath.map(labelFor).join(' › '),
          kind: 'removed',
          before: formatValue(before[i]),
          after: '',
        })
      } else {
        walk(before[i], after[i], itemPath, changes)
      }
    }
    return
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])
    for (const key of keys) {
      walk(before[key], after[key], [...path, key], changes)
    }
    return
  }

  const beforeEmpty = before === null || before === undefined || before === ''
  const afterEmpty = after === null || after === undefined || after === ''
  if (beforeEmpty && afterEmpty) return
  if (JSON.stringify(before) === JSON.stringify(after)) return

  if (!beforeEmpty && !afterEmpty && typeof before === 'string' && typeof after === 'string') {
    const [beforeText, afterText] = focusStringDiff(before, after)
    changes.push({ label, kind: 'modified', before: beforeText, after: afterText })
    return
  }

  changes.push({
    label,
    kind: beforeEmpty ? 'added' : afterEmpty ? 'removed' : 'modified',
    before: beforeEmpty ? '' : formatValue(before),
    after: afterEmpty ? '' : formatValue(after),
  })
}

/** Compare two versions of a page's content and list every field-level change */
export function diffPageContent(before: PageContent, after: PageContent): ContentChange[] {
  const changes: ContentChange[] = []
  walk(before, after, [], changes)
  return changes
}
