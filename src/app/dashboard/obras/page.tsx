"use client";

import { Button } from '@/components/ui/button';
import ObrasTable from '@/components/obras/ObrasTable';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import { PlusCircle, ListChecks } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ObrasPage() {
  const { userRole } = useAuth();
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Gestión de Obras</CardTitle>
          <CardDescription>Visualice el listado de obras o cargue una nueva si tiene los permisos necesarios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setShowTable(true)} variant={showTable ? "default" : "outline"} size="lg">
              <ListChecks className="mr-2 h-5 w-5" /> Ver Listado de Obras
            </Button>
            {userRole === 'Oficina Técnica' && (
              <Link href="/dashboard/obras/nueva" passHref>
                <Button size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" /> Cargar Nueva Obra
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
      
      {showTable && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">Listado de Obras</CardTitle>
          </CardHeader>
          <CardContent>
            <ObrasTable />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
