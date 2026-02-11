'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { School, Upload, RefreshCw, Database, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { logger } from '@/lib/logger'

interface SchoolData {
  id: string
  red_izo: string
  fullname: string
  obec: string | null
  ulice: string | null
  psc: string | null
  created_at: string | null
}

interface SchoolsResponse {
  success: boolean
  data?: SchoolData[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

interface ImportResponse {
  success: boolean
  imported?: number
  total?: number
  message?: string
  error?: string
}

export function AdminSchoolsSection() {
  const [schools, setSchools] = React.useState<SchoolData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [importing, setImporting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [pagination, setPagination] = React.useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('')
  const itemsPerPage = 20

  // Debounce search query to avoid API calls on every keystroke
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearchQuery) {
        setCurrentPage(1)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery, debouncedSearchQuery])

  const loadSchools = React.useCallback(async (page: number, search: string = '') => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL('/api/admin/schools', window.location.origin)
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', itemsPerPage.toString())
      if (search) {
        url.searchParams.set('search', search)
      }

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: SchoolsResponse = await response.json()

      if (data.success && data.data) {
        setSchools(data.data)
        if (data.pagination) {
          setPagination(data.pagination)
          setCurrentPage(data.pagination.page)
        }
      } else {
        setError(data.error || 'Chyba při načítání škol')
      }
    } catch (err) {
      logger.error('Error loading schools:', err)
      setError('Chyba při načítání škol')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    // Only load schools when debounced search query or page changes
    loadSchools(currentPage, debouncedSearchQuery)
  }, [currentPage, debouncedSearchQuery, loadSchools])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value) // This updates immediately without triggering API call
    // The debounced effect will handle the API call after 500ms
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setCurrentPage(newPage)
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleImport = async () => {
    setImporting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/schools/import', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ImportResponse = await response.json()

      if (data.success) {
        setSuccess(
          `Úspěšně importováno ${data.imported || 0} škol z ${data.total || 0} celkem`
        )
        // Reload schools after import (go to first page, clear search)
        setCurrentPage(1)
        setSearchQuery('')
        setDebouncedSearchQuery('')
        await loadSchools(1, '')
      } else {
        setError(data.error || 'Chyba při importu škol')
      }
    } catch (err) {
      logger.error('Error importing schools:', err)
      setError('Chyba při importu škol')
    } finally {
      setImporting(false)
    }
  }

  if (loading && schools.length === 0) {
    return (
      <div className="bg-white rounded-[28px] border border-grey-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-grey-100 rounded w-48" />
          <div className="h-20 bg-grey-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[28px] border border-grey-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-grey-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <School className="w-6 h-6 text-emerald-600" />
            <h2 className="font-display text-xl font-semibold">Správa škol</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleImport}
              disabled={importing}
              variant="primary"
              size="small"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importuji...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importovat školy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100">
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      {/* Search */}
      <div className="px-6 py-4 border-b border-grey-100">
        <div className="flex flex-col gap-2">
          <Label htmlFor="school-search" className="text-sm text-text-subtle">
            Vyhledat školu
          </Label>
          <Input
            id="school-search"
            type="text"
            placeholder="Začněte psát název školy, adresu nebo město..."
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={false}
            rightIcon={<Search className="w-5 h-5" />}
            className="w-full"
          />
          {searchQuery && searchQuery !== debouncedSearchQuery && (
            <p className="text-xs text-text-subtle mt-1">
              Hledám...
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      {pagination && (
        <div className="px-6 py-4 border-b border-grey-100 bg-grey-50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-text-subtle">
              <Database className="w-4 h-4" />
              <span className="text-sm">
                {debouncedSearchQuery ? (
                  <>
                    Nalezeno škol: <strong className="text-text-strong">{pagination.total}</strong>
                  </>
                ) : (
                  <>
                    Celkem škol v databázi: <strong className="text-text-strong">{pagination.total}</strong>
                  </>
                )}
              </span>
            </div>
            {pagination.totalPages > 1 && (
              <span className="text-sm text-text-subtle">
                Stránka {pagination.page} z {pagination.totalPages}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Schools List */}
      <div className="max-h-[400px] overflow-y-auto">
        {schools.length === 0 ? (
          <div className="px-6 py-12 text-center text-text-subtle">
            <School className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="mb-2">Zatím žádné školy v databázi</p>
            <p className="text-sm">
              Klikněte na &quot;Importovat školy&quot; pro načtení dat z registru MŠMT
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-grey-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider">
                  Název školy
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider hidden sm:table-cell">
                  Adresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider hidden md:table-cell">
                  RED IZO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-grey-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-text-strong">
                      {school.fullname}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-text-subtle">
                      {[school.ulice, school.obec, school.psc]
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-text-subtle font-mono">
                      {school.red_izo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-grey-100 bg-grey-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                variant="secondary"
                size="small"
              >
                <ChevronLeft className="w-4 h-4" />
                Předchozí
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`
                      h-10 w-10 rounded-full text-sm font-semibold transition-colors
                      ${currentPage === pageNum
                        ? 'bg-brand-primary text-white'
                        : 'bg-white text-text-strong border border-grey-300 hover:bg-grey-50'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages || loading}
                variant="secondary"
                size="small"
              >
                Další
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
