import type { Metadata } from 'next';
import './globals.css';
import { NavigationBarServer } from '@/components/NavigationBarServer';

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
      <body className="font-body antialiased">
        <NavigationBarServer />
        {children}
      </body>
    </html>
  );
}
