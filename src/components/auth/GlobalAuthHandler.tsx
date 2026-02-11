'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { CompleteRegistrationModal } from './CompleteRegistrationModal';
import { OAuthErrorDisplay } from './OAuthErrorDisplay';
import { useAuth } from '@/lib/supabase/hooks/useAuth';
import { hasCompletedRegistration } from '@/lib/supabase/user-profile';
import { logger } from '@/lib/logger';

/**
 * Global auth handler that manages:
 * - OAuth error display (after redirects)
 * - Complete registration modal (for OAuth users who haven't finished profile)
 * 
 * Should be placed in the root layout to work across all pages.
 */
export function GlobalAuthHandler() {
  const [showCompleteRegistration, setShowCompleteRegistration] = useState(false);
  const pathname = usePathname();
  const { loading, isLoggedIn } = useAuth();

  // Don't show registration modal on /terms - user may have opened it in a new tab to read
  const isOnTermsPage = pathname === '/terms';

  // Check if user needs to complete registration (OAuth users)
  useEffect(() => {
    const abortController = new AbortController();
    
    async function checkRegistration() {
      if (isLoggedIn && !loading) {
        try {
          const completed = await hasCompletedRegistration();
          
          if (abortController.signal.aborted) return;
          
          if (!completed) {
            setShowCompleteRegistration(true);
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            logger.error('Error checking registration', error);
          }
        }
      }
    }
    
    checkRegistration();
    
    return () => {
      abortController.abort();
    };
  }, [isLoggedIn, loading]);

  return (
    <>
      {/* OAuth error display */}
      <Suspense fallback={null}>
        <OAuthErrorDisplay />
      </Suspense>

      {/* Complete registration modal for OAuth users (hidden on /terms so user can read terms) */}
      <Dialog 
        open={showCompleteRegistration && !isOnTermsPage} 
        onOpenChange={(open) => {
          if (!open) return;
          setShowCompleteRegistration(open);
        }}
      >
        <DialogContent 
          className="sm:max-w-[500px]" 
          hideCloseButton
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <CompleteRegistrationModal 
            onSuccess={() => {
              setShowCompleteRegistration(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
