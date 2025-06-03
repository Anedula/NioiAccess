"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

export default function EventosPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Megaphone className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">Eventos</CardTitle>
            <CardDescription>Calendario y gestión de eventos corporativos y relevantes para Grupo Nioi.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta sección está en desarrollo.</p>
        <p className="mt-4">Consulte los próximos eventos, registre asistencia y organice nuevas actividades.</p>
      </CardContent>
    </Card>
  );
}
