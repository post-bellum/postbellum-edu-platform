import type { Metadata } from 'next';
import './globals.css';
import { NavigationBarServer } from '@/components/NavigationBarServer';
import { Footer } from '@/components/Footer';
import { GlobalAuthHandler } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Post Bellum Educational Platform',
  description: 'Vzdělávací platforma pro učitele k objevování a používání historických učebních materiálů',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/anz3jmg.css" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-white">
        <NavigationBarServer />
        <main className="flex-1 max-w-[1920px] mx-auto w-full bg-white">
          {children}
        </main>
        <Footer />
        <GlobalAuthHandler />
      </body>
    </html>
  );
}
