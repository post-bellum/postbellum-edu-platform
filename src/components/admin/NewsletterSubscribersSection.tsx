'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Download, Mail, MailX, RefreshCw, RotateCw, UserMinus, Users } from 'lucide-react'
import {
  getNewsletterSubscribers,
  exportNewsletterSubscribersCSV,
  syncNewsletterToSmartEmailing,
  type NewsletterSubscriber,
  type NewsletterStats
} from '@/app/actions/admin-newsletter'

const BADGE = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

/**
 * What SmartEmailing reports about the address itself: an undeliverable one
 * (permanent bounce) or a blacklisted contact never receives a newsletter,
 * whatever its subscription status here says.
 */
function ContactStateBadges({ subscriber }: { subscriber: NewsletterSubscriber }) {
  const badges: React.ReactNode[] = []

  if (subscriber.se_hardbounced) {
    badges.push(
      <span
        key="bounce"
        title="SmartEmailing dostal trvalou chybu doručení - adresa pravděpodobně neexistuje"
        className={`${BADGE} bg-red-100 text-red-800`}
      >
        Neexistující adresa
      </span>
    )
  }

  if (subscriber.se_blacklisted) {
    badges.push(
      <span
        key="blacklist"
        title="Kontakt je ve SmartEmailing na blacklistu - nedostane žádný marketingový e-mail z účtu"
        className={`${BADGE} bg-grey-200 text-text-strong`}
      >
        Blacklist
      </span>
    )
  }

  if (badges.length === 0 && subscriber.se_list_status === 'unsubscribed') {
    badges.push(
      <span key="unsub" className={`${BADGE} bg-grey-100 text-text-subtle`}>
        Odhlášen v SE
      </span>
    )
  }

  if (badges.length === 0) return <span className="text-sm text-text-subtle">-</span>

  return <div className="flex flex-wrap justify-center gap-1">{badges}</div>
}

/**
 * State of the row in the SmartEmailing contact list: synced, waiting for the
 * retry job, or failing with an error (shown in the title attribute).
 */
function SyncBadge({ subscriber }: { subscriber: NewsletterSubscriber }) {
  if (!subscriber.se_pending) {
    return (
      <span
        title={
          subscriber.se_synced_at
            ? `Synchronizováno ${new Date(subscriber.se_synced_at).toLocaleString('cs-CZ')}`
            : undefined
        }
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
      >
        Synchronizováno
      </span>
    )
  }

  if (subscriber.se_sync_error) {
    return (
      <span
        title={subscriber.se_sync_error}
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
      >
        Chyba
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
      Čeká
    </span>
  )
}

export function NewsletterSubscribersSection() {
  const [subscribers, setSubscribers] = React.useState<NewsletterSubscriber[]>([])
  const [stats, setStats] = React.useState<NewsletterStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [exporting, setExporting] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const [syncMessage, setSyncMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const loadSubscribers = React.useCallback(async () => {
    const result = await getNewsletterSubscribers()
    if (result.success && result.data) {
      setSubscribers(result.data)
      setStats(result.stats || null)
    } else {
      setError(result.error || 'Chyba při načítání')
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadSubscribers()
  }, [loadSubscribers])

  const handleSync = async (full = false) => {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const result = await syncNewsletterToSmartEmailing({ full })
      const summary = result.summary
        ? `Odesláno: ${result.summary.pushed}, chyb: ${result.summary.failed}, odhlášení ze SmartEmailing: ${result.summary.reconciled}, chybějících vráceno do fronty: ${result.summary.requeued}.`
        : ''
      setSyncMessage(
        result.success
          ? `Synchronizace dokončena. ${summary}`.trim()
          : `${result.error ?? 'Synchronizace selhala'} ${summary}`.trim()
      )
      // Refresh so the sync badges and the pending count reflect the run
      await loadSubscribers()
    } finally {
      setSyncing(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await exportNewsletterSubscribersCSV()
      if (result.success && result.csv) {
        // Create and download file with UTF-8 BOM for Excel compatibility
        const blob = new Blob(['\ufeff' + result.csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        setError(result.error || 'Chyba při exportu')
      }
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-grey-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-grey-100 rounded w-48" />
          <div className="h-20 bg-grey-100 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-[28px] border border-grey-200 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[28px] border border-grey-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-grey-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-emerald-600" />
            <h2 className="font-display text-xl font-semibold">Newsletter odběratelé</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSync(false)}
              disabled={syncing}
              variant="secondary"
              size="small"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Synchronizuji...' : 'Synchronizovat se SmartEmailing'}
            </Button>
            <Button
              onClick={() => handleSync(true)}
              disabled={syncing}
              variant="secondary"
              size="small"
              title="Odešle všechny odběratele znovu - použijte, když se kontakty měnily nebo mazaly přímo ve SmartEmailing"
            >
              <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              Úplná synchronizace
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting || !stats?.active}
              variant="secondary"
              size="small"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exportuji...' : 'Export CSV'}
            </Button>
          </div>
        </div>
        {syncMessage && (
          <p className="mt-3 text-sm text-text-subtle">{syncMessage}</p>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-grey-100 border-b border-grey-100">
          <div className="px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-text-subtle mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Celkem</span>
            </div>
            <p className="text-2xl font-semibold text-text-strong">{stats.total}</p>
          </div>
          <div className="px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-700 mb-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm">Aktivní</span>
            </div>
            <p className="text-2xl font-semibold text-emerald-700">{stats.active}</p>
          </div>
          <div className="px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-text-subtle mb-1">
              <UserMinus className="w-4 h-4" />
              <span className="text-sm">Odhlášení</span>
            </div>
            <p className="text-2xl font-semibold text-text-subtle">{stats.unsubscribed}</p>
          </div>
          <div className="px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-text-subtle mb-1">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Nesynchronizováno</span>
            </div>
            <p
              className={`text-2xl font-semibold ${
                stats.pendingSync > 0 ? 'text-amber-600' : 'text-text-subtle'
              }`}
            >
              {stats.pendingSync}
            </p>
          </div>
          <div className="px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-text-subtle mb-1">
              <MailX className="w-4 h-4" />
              <span className="text-sm">Nedoručitelné</span>
            </div>
            <p
              className={`text-2xl font-semibold ${
                stats.undeliverable > 0 ? 'text-red-600' : 'text-text-subtle'
              }`}
            >
              {stats.undeliverable}
            </p>
          </div>
        </div>
      )}

      {/* Subscribers List */}
      <div className="max-h-[400px] overflow-y-auto">
        {subscribers.length === 0 ? (
          <div className="px-6 py-12 text-center text-text-subtle">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Zatím žádní odběratelé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-grey-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider hidden sm:table-cell">
                  Přihlášen
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-text-subtle uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-text-subtle uppercase tracking-wider">
                  Synchronizace
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-text-subtle uppercase tracking-wider">
                  Stav v SmartEmailing
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-grey-50">
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-strong">{subscriber.email}</span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-text-subtle">
                      {subscriber.subscribed_at 
                        ? new Date(subscriber.subscribed_at).toLocaleDateString('cs-CZ')
                        : '-'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {subscriber.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Aktivní
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-grey-100 text-text-subtle">
                        Odhlášen
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <SyncBadge subscriber={subscriber} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ContactStateBadges subscriber={subscriber} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
