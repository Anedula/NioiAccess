
"use client";

import React from 'react';
import { useCajaChica } from '@/contexts/CajaChicaContext';
import FormularioAperturaCaja from './FormularioAperturaCaja';
import VistaCajaActiva from './VistaCajaActiva';
import ListadoCajasArchivadas from './ListadoCajasArchivadas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function CajaChicaTab() {
  const { cajaChicaActiva, isLoading } = useCajaChica();

  if (isLoading) {
    return <p>Cargando datos de Caja Chica...</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">Gestión de Caja Chica</CardTitle>
          <CardDescription>Administre la apertura, egresos y cierre de la caja chica.</CardDescription>
        </CardHeader>
        <CardContent>
          {cajaChicaActiva ? (
            <VistaCajaActiva />
          ) : (
            <FormularioAperturaCaja />
          )}
        </CardContent>
      </Card>

      {cajaChicaActiva && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Caja Chica Activa</AlertTitle>
          <AlertDescription>
            Ya existe una caja chica activa. Para abrir una nueva, primero debe cerrarse la actual.
          </AlertDescription>
        </Alert>
      )}
      
      <ListadoCajasArchivadas />
    </div>
  );
}
