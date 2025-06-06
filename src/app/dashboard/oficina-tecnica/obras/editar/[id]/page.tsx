
"use client";

import ProtectedPage from '@/components/auth/ProtectedPage';
import NuevaObraForm from '@/components/obras/NuevaObraForm';
import { useObras } from '@/contexts/ObrasContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Obra } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Import Button

export default function EditarObraPage() {
  const params = useParams();
  const router = useRouter();
  const { getObraById } = useObras();
  const [obra, setObra] = useState<Obra | null | undefined>(undefined); 

  const id = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (id) {
      const obraData = getObraById(id);
      setObra(obraData); 
      if (obraData === undefined && id) { 
          // Could handle retry or more sophisticated loading state
      } else if (obraData === null) { 
          // router.replace('/dashboard/oficina-tecnica/obras?error=notfound'); // Optional
      }
    }
  }, [id, getObraById, router]);


  if (obra === undefined) { 
    return (
      <ProtectedPage allowedRoles={['Oficina Técnica']}>
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

  if (!obra) { 
    return (
      <ProtectedPage allowedRoles={['Oficina Técnica']}>
        <Card className="w-full max-w-md mx-auto shadow-xl text-center">
            <CardHeader>
                <CardTitle className="text-destructive">Obra no encontrada</CardTitle>
            </CardHeader>
            <CardContent>
                <p>La obra que intenta editar no existe o no tiene permiso para verla.</p>
                <Button onClick={() => router.push('/dashboard/oficina-tecnica/obras')} className="mt-4">
                    Volver al Listado
                </Button>
            </CardContent>
        </Card>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage allowedRoles={['Oficina Técnica']}>
      <NuevaObraForm obraToEdit={obra} />
    </ProtectedPage>
  );
}
