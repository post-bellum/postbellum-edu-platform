'use client'

import * as React from 'react'
import { CheckCircle2, Download, GraduationCap, MailQuestion, Search, UserCog, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/lib/constants'
import {
  getRegisteredUsers,
  type RegisteredUser,
  type RegisteredUsersStats,
  type RegistrationStatus,
} from '@/app/actions/admin-users'

const BADGE = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap'

const STATUS_META: Record<RegistrationStatus, { label: string; title: string; className: string }> = {
  completed: {
    label: 'Dokončeno',
    title: 'Uživatel vyplnil profil (typ uživatele, škola/kategorie, souhlas s podmínkami)',
    className: 'bg-emerald-100 text-emerald-800',
  },
  incomplete: {
    label: 'Nedokončená registrace',
    title: 'Účet existuje a je ověřený, ale uživatel nevyplnil doplňující údaje',
    className: 'bg-amber-100 text-amber-800',
  },
  unconfirmed: {
    label: 'Nepotvrzený e-mail',
    title: 'Uživatel se registroval e-mailem a heslem, ale neklikl na potvrzovací odkaz',
    className: 'bg-grey-100 text-text-subtle',
  },
}

const PROVIDER_LABELS: Record<string, string> = {
  email: 'E-mail',
  google: 'Google',
  azure: 'Microsoft',
}

/** Short labels for the table; the full ones from CATEGORY_LABELS go to the tooltip. */
const CATEGORY_SHORT_LABELS: Record<string, string> = {
  student: 'Student/ka',
  parent: 'Rodič',
  educational_professional: 'Odborná veřejnost',
  ngo_worker: 'Neziskový sektor',
  public_sector_worker: 'Státní sektor',
  other: 'Ostatní',
}

type StatusFilter = RegistrationStatus | 'all'

function formatDate(value: string | null, withTime = false): string {
  if (!value) return '-'
  const date = new Date(value)
  return withTime ? date.toLocaleString('cs-CZ') : date.toLocaleDateString('cs-CZ')
}

function formatProviders(providers: string[]): string {
  if (providers.length === 0) return '-'
  return providers.map(p => PROVIDER_LABELS[p] ?? p).join(', ')
}

function UserTypeCell({ user }: { user: RegisteredUser }) {
  if (user.userType === 'teacher') {
    return (
      <div className="text-sm">
        <span className="text-text-strong">Učitel/ka</span>
        {user.schoolName && (
          <p className="text-text-subtle text-xs truncate max-w-[260px]" title={user.schoolName}>
            {user.schoolName}
          </p>
        )}
      </div>
    )
  }

  if (user.userType === 'not-teacher') {
    return (
      <span
        className="text-sm text-text-strong"
        title={user.category ? CATEGORY_LABELS[user.category] : undefined}
      >
        {user.category ? CATEGORY_SHORT_LABELS[user.category] ?? user.category : 'Neučitel'}
      </span>
    )
  }

  return <span className="text-sm text-text-subtle">-</span>
}

function toCSV(users: RegisteredUser[]): string {
  const headers = [
    'email',
    'jmeno',
    'stav_registrace',
    'typ_uzivatele',
    'skola',
    'kategorie',
    'souhlas_s_emaily',
    'prihlaseni',
    'registrovan',
    'email_potvrzen',
    'posledni_prihlaseni',
  ]
  const rows = users.map(u => [
    u.email ?? '',
    u.displayName ?? '',
    STATUS_META[u.status].label,
    u.userType === 'teacher' ? 'učitel' : u.userType === 'not-teacher' ? 'neučitel' : '',
    u.schoolName ?? '',
    u.category ? CATEGORY_LABELS[u.category] ?? u.category : '',
    u.emailConsent == null ? '' : u.emailConsent ? 'ano' : 'ne',
    formatProviders(u.providers),
    u.createdAt,
    u.emailConfirmedAt ?? '',
    u.lastSignInAt ?? '',
  ])
  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

function downloadCSV(csv: string, filename: string) {
  // UTF-8 BOM so Excel reads the Czech characters correctly
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface StatTileProps {
  label: string
  value: number
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
  valueClassName?: string
}

function StatTile({ label, value, icon, active, onClick, valueClassName }: StatTileProps) {
  const content = (
    <>
      <div className="flex items-center justify-center gap-2 text-text-subtle mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className={cn('text-2xl font-semibold text-text-strong', valueClassName)}>{value}</p>
    </>
  )

  if (!onClick) return <div className="px-6 py-4 text-center">{content}</div>

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'px-6 py-4 text-center cursor-pointer transition-colors',
        active ? 'bg-turquoise-50' : 'hover:bg-grey-50'
      )}
    >
      {content}
    </button>
  )
}

export function RegisteredUsersSection() {
  const [users, setUsers] = React.useState<RegisteredUser[]>([])
  const [stats, setStats] = React.useState<RegisteredUsersStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    getRegisteredUsers().then(result => {
      if (result.success && result.data) {
        setUsers(result.data)
        setStats(result.stats ?? null)
      } else {
        setError(result.error || 'Chyba při načítání')
      }
      setLoading(false)
    })
  }, [])

  const filteredUsers = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    return users.filter(u => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (!query) return true
      return [u.email, u.displayName, u.schoolName].some(v => v?.toLowerCase().includes(query))
    })
  }, [users, statusFilter, search])

  const toggleFilter = (filter: RegistrationStatus) =>
    setStatusFilter(current => (current === filter ? 'all' : filter))

  const handleExport = () => {
    downloadCSV(toCSV(filteredUsers), `uzivatele-${new Date().toISOString().split('T')[0]}.csv`)
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
    <div className="bg-white rounded-[28px] border border-grey-200 overflow-hidden" data-testid="admin-users-section">
      {/* Header */}
      <div className="px-6 py-5 border-b border-grey-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-600" />
            <h2 className="font-display text-xl font-semibold">Registrovaní uživatelé</h2>
          </div>
          <Button
            onClick={handleExport}
            disabled={filteredUsers.length === 0}
            variant="secondary"
            size="small"
            title="Exportuje uživatele podle aktuálního filtru a vyhledávání"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats - status tiles double as a filter */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-grey-100 border-b border-grey-100">
          <StatTile
            label="Celkem"
            value={stats.total}
            icon={<Users className="w-4 h-4" />}
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <StatTile
            label="Dokončeno"
            value={stats.completed}
            icon={<CheckCircle2 className="w-4 h-4" />}
            active={statusFilter === 'completed'}
            onClick={() => toggleFilter('completed')}
            valueClassName="text-emerald-700"
          />
          <StatTile
            label="Nedokončeno"
            value={stats.incomplete}
            icon={<UserCog className="w-4 h-4" />}
            active={statusFilter === 'incomplete'}
            onClick={() => toggleFilter('incomplete')}
            valueClassName={stats.incomplete > 0 ? 'text-amber-600' : 'text-text-subtle'}
          />
          <StatTile
            label="Nepotvrzený e-mail"
            value={stats.unconfirmed}
            icon={<MailQuestion className="w-4 h-4" />}
            active={statusFilter === 'unconfirmed'}
            onClick={() => toggleFilter('unconfirmed')}
            valueClassName="text-text-subtle"
          />
          <StatTile
            label="Učitelé"
            value={stats.teachers}
            icon={<GraduationCap className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Search */}
      <div className="px-6 py-4 border-b border-grey-100">
        <Input
          id="user-search"
          type="text"
          placeholder="Hledat podle e-mailu, jména nebo školy..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          rightIcon={<Search className="w-5 h-5" />}
          className="w-full"
          aria-label="Hledat uživatele"
        />
      </div>

      {/* Users list */}
      <div className="max-h-[600px] overflow-auto">
        {filteredUsers.length === 0 ? (
          <div className="px-6 py-12 text-center text-text-subtle">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{users.length === 0 ? 'Zatím žádní registrovaní uživatelé' : 'Žádný uživatel neodpovídá filtru'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-grey-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider">
                  Uživatel
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider hidden md:table-cell">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider hidden lg:table-cell">
                  Přihlášení
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider hidden sm:table-cell">
                  Registrován
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider hidden xl:table-cell">
                  Naposledy
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-text-subtle uppercase tracking-wider">
                  Stav registrace
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {filteredUsers.map(user => {
                const status = STATUS_META[user.status]
                return (
                  <tr key={user.id} className="hover:bg-grey-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-strong break-all">{user.email ?? '-'}</span>
                        {user.isAdmin && (
                          <span className={`${BADGE} bg-turquoise-50 text-brand-primary`}>Admin</span>
                        )}
                      </div>
                      {user.displayName && (
                        <p className="text-xs text-text-subtle">{user.displayName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <UserTypeCell user={user} />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-text-subtle">{formatProviders(user.providers)}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-text-subtle" title={formatDate(user.createdAt, true)}>
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <span className="text-sm text-text-subtle" title={formatDate(user.lastSignInAt, true)}>
                        {formatDate(user.lastSignInAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span title={status.title} className={`${BADGE} ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {filteredUsers.length !== users.length && (
        <div className="px-6 py-3 border-t border-grey-100 text-sm text-text-subtle">
          Zobrazeno {filteredUsers.length} z {users.length}
        </div>
      )}
    </div>
  )
}
