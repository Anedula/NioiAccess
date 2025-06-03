
"use client";

import ProtectedPage from '@/components/auth/ProtectedPage';
import NuevoPersonalForm from '@/components/recursos-humanos/nomina/NuevoPersonalForm';
import { usePersonal } from '@/contexts/PersonalContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Personal } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EditarPersonalPage() {
  const params = useParams();
  const router = useRouter();
  const { getPersonalById, isLoading: isPersonalLoading } = usePersonal();
  const [personal, setPersonal] = useState<Personal | null | undefined>(undefined); 

  const id = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (id && !isPersonalLoading) { // Solo buscar si hay ID y los datos de personal han cargado
      const personalData = getPersonalById(id);
      setPersonal(personalData || null); // Si no se encuentra, establece null explícitamente
    }
  }, [id, getPersonalById, isPersonalLoading]);


  if (isPersonalLoading || personal === undefined) { 
    return (
      <ProtectedPage allowedRoles={['Recursos Humanos']}>
        <Card className="w-full max-w-4xl mx-auto shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </ProtectedPage>
    );
  }

  if (!personal) { 
    return (
      <ProtectedPage allowedRoles={['Recursos Humanos']}>
        <Card className="w-full max-w-md mx-auto shadow-xl text-center">
            <CardHeader>
                <CardTitle className="text-destructive">Registro de Personal no encontrado</CardTitle>
            </CardHeader>
            <CardContent>
                <p>El registro de personal que intenta editar no existe o no tiene permiso para verlo.</p>
                <Button onClick={() => router.push('/dashboard/recursos-humanos')} className="mt-4">
                    Volver a Recursos Humanos
                </Button>
            </CardContent>
        </Card>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage allowedRoles={['Recursos Humanos']}>
      <NuevoPersonalForm personalToEdit={personal} />
    </ProtectedPage>
  );
}
