"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { Role } from '@/lib/types';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface ProtectedPageProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // If roles are specified and user's role is not in the list, redirect to dashboard or an unauthorized page
        router.replace('/dashboard?error=unauthorized'); 
      }
    }
  }, [isAuthenticated, userRole, isLoading, router, allowedRoles]);

  if (isLoading || !isAuthenticated) {
    // Show a loading state or a blank page while checking auth
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    );
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
     // User is authenticated but not authorized for this specific page
     return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tiene permiso para ver esta página.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 p-2 bg-primary text-primary-foreground rounded">
          Volver al Dashboard
        </button>
      </div>
     );
  }

  return <>{children}</>;
};

export default ProtectedPage;
