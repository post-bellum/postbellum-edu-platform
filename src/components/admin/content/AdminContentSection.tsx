'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageContentSubTabs } from './PageContentSubTabs'
import { HomepageContentForm } from './HomepageContentForm'
import { AboutContentForm } from './AboutContentForm'
import { TermsContentForm } from './TermsContentForm'
import { SaveChangesDialog } from './SaveChangesDialog'
import { getPageContentForAdmin, savePageContent } from '@/app/actions/page-content'
import { PAGE_DEFAULTS } from '@/lib/page-content/defaults'
import { changeCountLabel, diffPageContent, getPageLabel } from '@/lib/page-content/diff'
import { deepMergeWithDefaults } from '@/lib/supabase/page-content'
import type {
  PageSlug,
  PageContent,
  HomepageContent,
  AboutContent,
  TermsContent,
} from '@/types/page-content.types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function AdminContentSection() {
  const [activeTab, setActiveTab] = useState<PageSlug>('homepage')
  const [content, setContent] = useState<Record<PageSlug, PageContent>>({
    homepage: PAGE_DEFAULTS.homepage,
    about: PAGE_DEFAULTS.about,
    terms: PAGE_DEFAULTS.terms,
  })
  /** Last persisted state per tab — the baseline the save dialog diffs against */
  const [baseline, setBaseline] = useState<Record<PageSlug, PageContent>>({
    homepage: PAGE_DEFAULTS.homepage,
    about: PAGE_DEFAULTS.about,
    terms: PAGE_DEFAULTS.terms,
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loadedTabs, setLoadedTabs] = useState<PageSlug[]>([])
  const [dirtyTabs, setDirtyTabs] = useState<Set<PageSlug>>(new Set())
  const dirtyTabsRef = useRef(dirtyTabs)

  const mergeWithDefaults = (slug: PageSlug, dbContent: PageContent): PageContent => {
    return deepMergeWithDefaults(
      PAGE_DEFAULTS[slug] as unknown as Record<string, unknown>,
      dbContent as unknown as Record<string, unknown>
    ) as unknown as PageContent
  }

  const loadContent = async (slug: PageSlug) => {
    setLoading(true)
    setErrorMessage(null)

    const result = await getPageContentForAdmin(slug)
    if (result.success) {
      if (result.data?.content) {
        const merged = mergeWithDefaults(slug, result.data.content as PageContent)
        setContent((prev) => ({ ...prev, [slug]: merged }))
        setBaseline((prev) => ({ ...prev, [slug]: merged }))
      }
      setLoadedTabs((prev) => (prev.includes(slug) ? prev : [...prev, slug]))
    } else {
      setErrorMessage(result.error || 'Chyba při načítání obsahu')
    }
    setLoading(false)
  }

  // Initial load — no synchronous setState; loading already starts as true
  useEffect(() => {
    let cancelled = false

    getPageContentForAdmin('homepage').then((result) => {
      if (cancelled) return
      if (result.success) {
        if (result.data?.content) {
          const merged = mergeWithDefaults('homepage', result.data.content as PageContent)
          setContent((prev) => ({ ...prev, homepage: merged }))
          setBaseline((prev) => ({ ...prev, homepage: merged }))
        }
        setLoadedTabs(['homepage'])
      } else {
        setErrorMessage(result.error || 'Chyba při načítání obsahu')
      }
      setLoading(false)
    })

    return () => { cancelled = true }
   
  }, [])

  // Keep ref in sync for beforeunload handler
  useEffect(() => {
    dirtyTabsRef.current = dirtyTabs
  }, [dirtyTabs])

  // Warn on browser close/refresh if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyTabsRef.current.size > 0) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const markDirty = useCallback((tab: PageSlug) => {
    setDirtyTabs((prev) => {
      if (prev.has(tab)) return prev
      const next = new Set(prev)
      next.add(tab)
      return next
    })
  }, [])

  const markClean = useCallback((tab: PageSlug) => {
    setDirtyTabs((prev) => {
      if (!prev.has(tab)) return prev
      const next = new Set(prev)
      next.delete(tab)
      return next
    })
  }, [])

  const pendingChanges = useMemo(
    () => diffPageContent(baseline[activeTab], content[activeTab]),
    [baseline, content, activeTab]
  )

  const handleSaveClick = () => {
    setErrorMessage(null)
    setConfirmOpen(true)
  }

  const handleConfirmSave = async () => {
    setSaveStatus('saving')
    setErrorMessage(null)

    const saved = content[activeTab]
    const result = await savePageContent(activeTab, saved)

    if (result.success) {
      setSaveStatus('saved')
      setBaseline((prev) => ({ ...prev, [activeTab]: saved }))
      markClean(activeTab)
      setConfirmOpen(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('error')
      setErrorMessage(result.error || 'Chyba při ukládání')
      setConfirmOpen(false)
    }
  }

  const handleTabChange = (tab: PageSlug) => {
    if (dirtyTabs.has(activeTab)) {
      const confirmed = window.confirm(
        'Máte neuložené změny. Opravdu chcete přepnout záložku? Neuložené změny zůstanou zachovány.'
      )
      if (!confirmed) return
    }

    setActiveTab(tab)
    setSaveStatus('idle')
    setErrorMessage(null)
    if (!loadedTabs.includes(tab)) {
      loadContent(tab)
    }
  }

  const handleContentChange = (pageContent: PageContent) => {
    setContent((prev) => ({
      ...prev,
      [activeTab]: pageContent,
    }))
    markDirty(activeTab)
    // Reset saved status when content changes
    if (saveStatus === 'saved') {
      setSaveStatus('idle')
    }
  }

  return (
    <div>
      {/*
        Sticks below the sticky NavigationBar (top-0, 80px tall), under its z-50.
        The bottom spacing is padding, not margin, so the white background keeps
        covering content that scrolls underneath instead of letting it show through.
      */}
      <div className="sticky top-20 z-30 bg-white mb-6">
        <div className="flex items-center justify-between gap-4 pb-6">
          <div className="flex gap-3 min-w-0 items-center">
            <h2 className="text-2xl font-display font-semibold">Obsah stránek</h2>
            {pendingChanges.length > 0 && (
              <span className="text-sm text-grey-500 truncate mt-1">
                {pendingChanges.length} {changeCountLabel(pendingChanges.length)}
              </span>
            )}
          </div>
          <Button
            variant="primary"
            size="medium"
            onClick={handleSaveClick}
            disabled={saveStatus === 'saving' || loading}
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ukládám...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Uloženo
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Uložit
              </>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <PageContentSubTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-grey-400" />
        </div>
      ) : (
        <>
          {activeTab === 'homepage' && (
            <HomepageContentForm
              content={content.homepage as HomepageContent}
              onChange={handleContentChange}
            />
          )}
          {activeTab === 'about' && (
            <AboutContentForm
              content={content.about as AboutContent}
              onChange={handleContentChange}
            />
          )}
          {activeTab === 'terms' && (
            <TermsContentForm
              content={content.terms as TermsContent}
              onChange={handleContentChange}
            />
          )}
        </>
      )}

      <SaveChangesDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (saveStatus === 'saving') return
          setConfirmOpen(open)
        }}
        pageLabel={getPageLabel(activeTab)}
        changes={pendingChanges}
        isSaving={saveStatus === 'saving'}
        onConfirm={handleConfirmSave}
      />
    </div>
  )
}
