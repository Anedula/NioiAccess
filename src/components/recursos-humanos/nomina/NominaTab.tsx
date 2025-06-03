
"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NominaTable from './NominaTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function NominaTab() {
  const { userRole } = useAuth();

  return (
    <div className="space-y-6">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-headline text-primary">Nómina del Personal</CardTitle>
          <CardDescription>Listado completo del personal de la empresa. Edite o cargue nuevos registros si tiene permisos.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          {userRole === 'Recursos Humanos' && (
            <Link href="/dashboard/recursos-humanos/nomina/nueva" passHref>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Cargar Nuevo Personal
              </Button>
            </Link>
          )}
          <NominaTable />
        </CardContent>
    </div>
  );
}
