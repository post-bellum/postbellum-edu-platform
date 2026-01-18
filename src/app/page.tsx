'use client'

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AuthModal, CompleteRegistrationModal, OAuthErrorDisplay } from '@/components/auth';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { useAuth } from '@/lib/supabase/hooks/useAuth';
import { logout } from '@/lib/oauth-helpers';
import { hasCompletedRegistration, getUserProfile } from '@/lib/supabase/user-profile';
import { CATEGORY_LABELS } from '@/lib/constants';
import { logger } from '@/lib/logger';

export default function Home() {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showCompleteRegistration, setShowCompleteRegistration] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    userType?: string;
    schoolName?: string | null;
    category?: string | null;
  } | null>(null);
  const { user, loading, isLoggedIn } = useAuth();

  // Check if user needs to complete registration and fetch profile
  useEffect(() => {
    const abortController = new AbortController();
    
    async function checkRegistration() {
      if (isLoggedIn && !loading) {
        try {
          const completed = await hasCompletedRegistration();
          
          if (abortController.signal.aborted) return;
          
          if (!completed) {
            setShowCompleteRegistration(true);
          } else {
            // Fetch user profile data
            const profile = await getUserProfile();
            
            if (abortController.signal.aborted) return;
            
            setUserProfile(profile);
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

  const handleAuthAction = async () => {
    if (isLoggedIn) {
      await logout();
      setUserProfile(null); // Clear profile on logout
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <main className="min-h-screen p-8">
        <div className="max-w-[896px] mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-8">
          <Image
            src="/logo.svg"
            alt="Post Bellum logo"
            width={400}
            height={200}
            priority
            style={{ width: 'auto', height: 'auto', maxWidth: '400px' }}
          />
          
          <Suspense fallback={null}>
            <OAuthErrorDisplay />
          </Suspense>

          {loading ? (
            <Button size="lg" disabled variant="default">
              Načítání...
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                onClick={handleAuthAction}
                variant={isLoggedIn ? 'outline' : 'default'}
                data-testid={isLoggedIn ? 'logout-button' : 'login-register-button'}
              >
                {isLoggedIn 
                  ? `Odhlásit se (${user?.email})`
                  : 'Přihlásit se / Registrovat'
                }
              </Button>
              
              {isLoggedIn && (
                <div className="text-center space-y-4 max-w-md">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      Přihlášen jako
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {user?.email}
                    </p>
                    {userProfile?.userType && (
                      <div className="pt-2 border-t border-gray-200">
                        {userProfile.userType === 'teacher' ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-primary">
                              Učitel
                            </p>
                            {userProfile.schoolName && (
                              <p className="text-sm text-gray-600">
                                {userProfile.schoolName}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {userProfile.category ? CATEGORY_LABELS[userProfile.category] || userProfile.category : 'Nejsem učitel'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/profile')}
                    className="w-full"
                    data-testid="edit-profile-button"
                  >
                    Upravit profil
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultStep="login"
      />

      <Dialog 
        open={showCompleteRegistration} 
        onOpenChange={(open) => {
          // Prevent closing the dialog - user must complete registration
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
            onSuccess={async () => {
              setShowCompleteRegistration(false);
              // Refresh user profile after completion
              const profile = await getUserProfile();
              setUserProfile(profile);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
