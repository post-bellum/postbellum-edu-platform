"use client"

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AuthModal } from "@/components/auth";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
          />
          <Button 
            size="lg" 
            onClick={() => setAuthModalOpen(true)}
            variant={"default"}
          >
            Přihlásit se / Registrovat
          </Button>
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
