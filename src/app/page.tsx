"use client"

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AuthModal } from "@/components/auth";
import { useAuth } from "@/lib/supabase/hooks/useAuth";
import { logout } from "@/lib/oauth-helpers";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, loading, isLoggedIn } = useAuth();

  const handleAuthAction = async () => {
    if (isLoggedIn) {
      await logout();
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-8">
          <Image
            src="/logo.svg"
            alt="Post Bellum logo"
            width={400}
            height={200}
            priority
            style={{ width: 'auto', height: 'auto', maxWidth: '400px' }}
          />
          
          {loading ? (
            <Button size="lg" disabled variant="default">
              Načítání...
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                onClick={handleAuthAction}
                variant={isLoggedIn ? "outline" : "default"}
              >
                {isLoggedIn 
                  ? `Odhlásit se (${user?.email})`
                  : "Přihlásit se / Registrovat"
                }
              </Button>
              
              {isLoggedIn && (
                <p className="text-sm text-gray-600">
                  Přihlášen jako: {user?.email}
                </p>
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
    </>
  );
}
