import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ObrasProvider } from '@/contexts/ObrasContext';

export const metadata: Metadata = {
  title: 'GRUPO NIOI',
  description: 'Gestión Interna Grupo Nioi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ObrasProvider>
            {children}
            <Toaster />
          </ObrasProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
