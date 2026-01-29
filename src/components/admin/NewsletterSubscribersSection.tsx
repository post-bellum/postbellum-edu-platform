'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Download, Mail, UserMinus, Users } from 'lucide-react'
import { 
  getNewsletterSubscribers, 
  exportNewsletterSubscribersCSV,
  type NewsletterSubscriber,
  type NewsletterStats 
} from '@/app/actions/admin-newsletter'

export function NewsletterSubscribersSection() {
  const [subscribers, setSubscribers] = React.useState<NewsletterSubscriber[]>([])
  const [stats, setStats] = React.useState<NewsletterStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [exporting, setExporting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadSubscribers() {
      const result = await getNewsletterSubscribers()
      if (result.success && result.data) {
        setSubscribers(result.data)
        setStats(result.stats || null)
      } else {
        setError(result.error || 'Chyba při načítání')
      }
      setLoading(false)
    }
    loadSubscribers()
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await exportNewsletterSubscribersCSV()
      if (result.success && result.csv) {
        // Create and download file
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
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

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 divide-x divide-grey-100 border-b border-grey-100">
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
