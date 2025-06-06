
"use client";

import { Button } from '@/components/ui/button';
import ObrasTable from '@/components/obras/ObrasTable';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ListadoObrasTab() {
  const { userRole } = useAuth();

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Listado de Obras</CardTitle>
          <CardDescription>
            Visualice, filtre y gestione las obras. Los usuarios con rol 'Oficina Técnica' pueden cargar y editar proyectos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userRole === 'Oficina Técnica' && (
            <Link href="/dashboard/oficina-tecnica/obras/nueva" passHref>
              <Button size="lg" className="mb-4">
                <PlusCircle className="mr-2 h-5 w-5" /> Cargar Nueva Obra
              </Button>
            </Link>
          )}
           {userRole !== 'Oficina Técnica' && (
              <p className="text-muted-foreground mb-4">El listado de obras se muestra a continuación. Para cargar o editar obras, necesita permisos de "Oficina Técnica".</p>
          )}
          <ObrasTable />
        </CardContent>
      </Card>
    </div>
  );
}
