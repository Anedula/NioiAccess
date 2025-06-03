
"use client";

import ProtectedPage from '@/components/auth/ProtectedPage';
import NuevaObraForm from '@/components/obras/NuevaObraForm';
import { useObras } from '@/contexts/ObrasContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Obra } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EditarObraPage() {
  const params = useParams();
  const router = useRouter();
  const { getObraById } = useObras();
  const [obra, setObra] = useState<Obra | null | undefined>(undefined); // undefined para estado inicial de carga

  const id = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (id) {
      const obraData = getObraById(id);
      setObra(obraData); // Será undefined si no se encuentra, null si se busca y no existe
      if (obraData === undefined && id) { // Si es undefined tras buscar, puede que aún no cargaron las obras
          // Se podría manejar un reintento o un estado de carga más sofisticado
      } else if (obraData === null) { // Si getObraById devuelve null explícitamente (o no encuentra)
          // router.replace('/dashboard/obras?error=notfound'); // Opcional: redirigir si no se encuentra
      }
    }
  }, [id, getObraById, router]);


  if (obra === undefined) { // Cargando obra
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

  if (!obra) { // Obra no encontrada después de cargar
    return (
      <ProtectedPage allowedRoles={['Oficina Técnica']}>
        <Card className="w-full max-w-md mx-auto shadow-xl text-center">
            <CardHeader>
                <CardTitle className="text-destructive">Obra no encontrada</CardTitle>
            </CardHeader>
            <CardContent>
                <p>La obra que intenta editar no existe o no tiene permiso para verla.</p>
                <Button onClick={() => router.push('/dashboard/obras')} className="mt-4">
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
