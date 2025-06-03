"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersRound } from 'lucide-react';

export default function RecursosHumanosPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <UsersRound className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">Recursos Humanos</CardTitle>
            <CardDescription>Gestión del personal y talento de Grupo Nioi.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta sección está en desarrollo.</p>
        <p className="mt-4">Próximamente podrá gestionar empleados, nóminas, evaluaciones de desempeño y más.</p>
      </CardContent>
    </Card>
  );
}
