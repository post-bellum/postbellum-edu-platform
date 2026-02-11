'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { unsubscribeFromNewsletter } from '@/app/actions/newsletter'

type UnsubscribeState = 'loading' | 'success' | 'error' | 'no-token'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [state, setState] = React.useState<UnsubscribeState>('loading')
  const [email, setEmail] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) {
      setState('no-token')
      return
    }

    async function handleUnsubscribe() {
      const result = await unsubscribeFromNewsletter(token!)
      
      if (result.success) {
        setState('success')
        setEmail(result.email || null)
      } else {
        setState('error')
        setError(result.error || 'Něco se pokazilo')
      }
    }

    handleUnsubscribe()
  }, [token])

  return (
    <div className="min-h-screen bg-grey-50 flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-lg p-8 text-center">
        <Link href="/" className="inline-block mb-8">
          <Image
            src="/logo-postbellum.svg"
            alt="Post Bellum"
            width={154}
            height={16}
            className="h-4 w-auto"
          />
        </Link>

        {state === 'loading' && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-mint border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-text-subtle font-body">Zpracovávám odhlášení...</p>
          </div>
        )}

        {state === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-grey-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold text-text-strong">
              Odhlášení proběhlo úspěšně
            </h1>
            <p className="text-text-subtle font-body">
              {email ? (
                <>E-mail <strong>{email}</strong> byl odhlášen z odběru novinek.</>
              ) : (
                <>Byli jste odhlášeni z odběru novinek.</>
              )}
            </p>
            <p className="text-text-subtle font-body text-sm">
              Pokud si to rozmyslíte, můžete se znovu přihlásit na našich stránkách.
            </p>
            <Button asChild variant="mint" className="mt-4">
              <Link href="/">Zpět na hlavní stránku</Link>
            </Button>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold text-text-strong">
              Odhlášení se nezdařilo
            </h1>
            <p className="text-text-subtle font-body">
              {error}
            </p>
            <Button asChild variant="mint" className="mt-4">
              <Link href="/">Zpět na hlavní stránku</Link>
            </Button>
          </div>
        )}

        {state === 'no-token' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold text-text-strong">
              Neplatný odkaz
            </h1>
            <p className="text-text-subtle font-body">
              Odkaz pro odhlášení je neplatný nebo chybí. Zkontrolujte prosím, že jste použili správný odkaz z e-mailu.
            </p>
            <Button asChild variant="mint" className="mt-4">
              <Link href="/">Zpět na hlavní stránku</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function UnsubscribeLoading() {
  return (
    <div className="min-h-screen bg-grey-50 flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-lg p-8 text-center">
        <Link href="/" className="inline-block mb-8">
          <Image
            src="/logo-postbellum.svg"
            alt="Post Bellum"
            width={154}
            height={16}
            className="h-4 w-auto"
          />
        </Link>
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-mint border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-subtle font-body">Zpracovávám odhlášení...</p>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeLoading />}>
      <UnsubscribeContent />
    </Suspense>
  )
}
