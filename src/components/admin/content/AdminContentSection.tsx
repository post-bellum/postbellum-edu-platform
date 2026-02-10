'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageContentSubTabs } from './PageContentSubTabs'
import { HomepageContentForm } from './HomepageContentForm'
import { AboutContentForm } from './AboutContentForm'
import { TermsContentForm } from './TermsContentForm'
import { getPageContentForAdmin, savePageContent } from '@/app/actions/page-content'
import { PAGE_DEFAULTS } from '@/lib/page-content/defaults'
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
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loadedTabs, setLoadedTabs] = useState<PageSlug[]>([])

  const loadContent = async (slug: PageSlug) => {
    setLoading(true)
    setErrorMessage(null)

    const result = await getPageContentForAdmin(slug)
    if (result.success) {
      if (result.data?.content) {
        setContent((prev) => ({
          ...prev,
          [slug]: result.data!.content as PageContent,
        }))
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
          setContent((prev) => ({
            ...prev,
            homepage: result.data!.content as PageContent,
          }))
        }
        setLoadedTabs(['homepage'])
      } else {
        setErrorMessage(result.error || 'Chyba při načítání obsahu')
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    setSaveStatus('saving')
    setErrorMessage(null)

    const result = await savePageContent(activeTab, content[activeTab])

    if (result.success) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('error')
      setErrorMessage(result.error || 'Chyba při ukládání')
    }
  }

  const handleTabChange = (tab: PageSlug) => {
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
    // Reset saved status when content changes
    if (saveStatus === 'saved') {
      setSaveStatus('idle')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold">Obsah stránek</h2>
        <Button
          variant="primary"
          size="medium"
          onClick={handleSave}
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
    </div>
  )
}
