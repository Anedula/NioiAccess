
"use client";

import React, { useState } from 'react';
import { useCajaChica } from '@/contexts/CajaChicaContext';
import type { CajaChica } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Printer } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ComprobanteCajaDialog from './ComprobanteCajaDialog';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function ListadoCajasArchivadas() {
  const { cajasChicasArchivadas, isLoading } = useCajaChica();
  const [selectedCaja, setSelectedCaja] = useState<CajaChica | null>(null);
  const [isComprobanteOpen, setIsComprobanteOpen] = useState(false);

  const handleViewComprobante = (caja: CajaChica) => {
    setSelectedCaja(caja);
    setIsComprobanteOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="mt-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Historial de Cajas Chicas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando historial...</p>
        </CardContent>
      </Card>
    );
  }

  if (cajasChicasArchivadas.length === 0) {
    return (
      <Card className="mt-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-headline">Historial de Cajas Chicas</CardTitle>
          <CardDescription>No hay cajas chicas cerradas y archivadas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-headline text-primary">Historial de Cajas Chicas Cerradas</CardTitle>
          <CardDescription>Consulte el detalle de las cajas chicas que han sido cerradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full">
            <Table>
              <TableCaption>Cajas chicas cerradas y archivadas.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Caja</TableHead>
                  <TableHead>Fecha Apertura</TableHead>
                  <TableHead>Monto Inicial</TableHead>
                  <TableHead>Fecha Cierre</TableHead>
                  <TableHead>Total Egresos</TableHead>
                  <TableHead>Saldo Final</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cajasChicasArchivadas.map((caja) => (
                  <TableRow key={caja.id}>
                    <TableCell className="font-mono text-xs">{caja.id.substring(caja.id.length - 6)}</TableCell>
                    <TableCell>{format(parseISO(caja.fechaApertura), "dd/MM/yy", { locale: es })}</TableCell>
                    <TableCell>${caja.montoInicial.toLocaleString('es-AR')}</TableCell>
                    <TableCell>{caja.fechaCierre ? format(parseISO(caja.fechaCierre), "dd/MM/yy", { locale: es }) : '-'}</TableCell>
                    <TableCell className="text-destructive">-${(caja.totalEgresos ?? 0).toLocaleString('es-AR')}</TableCell>
                    <TableCell className="font-semibold">${(caja.saldoFinal ?? 0).toLocaleString('es-AR')}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewComprobante(caja)}>
                        <Eye className="mr-1 h-3 w-3" /> Ver/Imprimir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      {selectedCaja && (
        <ComprobanteCajaDialog
            isOpen={isComprobanteOpen}
            onOpenChange={setIsComprobanteOpen}
            caja={selectedCaja}
        />
      )}
    </>
  );
}
