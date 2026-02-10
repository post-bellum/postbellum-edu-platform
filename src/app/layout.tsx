import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StoryOn - Již brzy',
  description: 'Připravujeme pro vás něco speciálního. Brzy zde najdete platformu pro vzdělávání a sdílení příběhů.',
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
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
