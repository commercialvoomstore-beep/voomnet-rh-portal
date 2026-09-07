import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'VOOMNET TECH RH — Logiciel RH 2026',
  description: 'Gestion des Ressources Humaines de VOOMNET TECHNOLOGY - Next.js Front-end',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
