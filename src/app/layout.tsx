import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavigationBarServer } from '@/components/NavigationBarServer';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <NavigationBarServer />
        {children}
      </body>
    </html>
  );
}
