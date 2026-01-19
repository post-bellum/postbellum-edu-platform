import type { Metadata } from 'next';
import './globals.css';
import { NavigationBarServer } from '@/components/NavigationBarServer';
import { Footer } from '@/components/Footer';

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
      <body className="font-body antialiased min-h-screen flex flex-col">
        <NavigationBarServer />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
