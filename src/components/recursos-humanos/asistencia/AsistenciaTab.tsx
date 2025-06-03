
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AsistenciaTab() {
  return (
    <div className="space-y-6">
        <CardHeader className="px-0">
          <CardTitle className="text-xl font-headline text-primary">Calendario de Asistencia</CardTitle>
          <CardDescription>Registro y visualización de la asistencia diaria del personal de oficina.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
            <p className="text-muted-foreground">Esta sección está en desarrollo.</p>
            <p className="mt-2">Aquí podrá seleccionar una fecha y registrar la asistencia del personal de oficina.</p>
        </CardContent>
    </div>
  );
}
