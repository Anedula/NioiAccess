"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain } from 'lucide-react';

export default function CalizaPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Mountain className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">Caliza</CardTitle>
            <CardDescription>Información y gestión relacionada con la producción y distribución de caliza.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta sección está en desarrollo.</p>
        <p className="mt-4">Aquí encontrará datos sobre stock, logística de caliza, pedidos y análisis de calidad.</p>
      </CardContent>
    </Card>
  );
}
