
"use client";

import React, { useState } from 'react';
import { useCajaChica } from '@/contexts/CajaChicaContext';
import { useAuth } from '@/contexts/AuthContext';
import TablaEgresosCaja from './TablaEgresosCaja';
import EgresoDialog from './EgresoDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusCircle, Lock, AlertTriangle } from 'lucide-react';
import type { Role, EgresoCajaChica } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function VistaCajaActiva() {
  const { cajaChicaActiva, cerrarCaja } = useCajaChica();
  const { userRole } = useAuth();
  const [isEgresoDialogOpen, setIsEgresoDialogOpen] = useState(false);
  const [editingEgreso, setEditingEgreso] = useState<EgresoCajaChica | null>(null);

  if (!cajaChicaActiva) {
    return null;
  }

  const handleOpenNewEgresoDialog = () => {
    setEditingEgreso(null);
    setIsEgresoDialogOpen(true);
  };

  const handleOpenEditEgresoDialog = (egreso: EgresoCajaChica) => {
    setEditingEgreso(egreso);
    setIsEgresoDialogOpen(true);
  };

  const handleCloseCaja = () => {
    if (userRole) {
      cerrarCaja(userRole as Role);
    }
  };

  const totalEgresos = cajaChicaActiva.egresos.reduce((sum, egreso) => sum + egreso.monto, 0);
  const saldoActual = cajaChicaActiva.montoInicial - totalEgresos;

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-headline text-primary">Caja Chica Activa</CardTitle>
              <CardDescription>
                Abierta el: {format(parseISO(cajaChicaActiva.fechaApertura), "PPP", { locale: es })} por {cajaChicaActiva.createdBy || 'N/A'}
              </CardDescription>
            </div>
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Monto Inicial</p>
                <p className="text-lg font-semibold text-primary">
                    ${cajaChicaActiva.montoInicial.toLocaleString('es-AR')}
                </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
            <div>
                <p className="text-sm text-muted-foreground">Total Egresos</p>
                <p className="text-md font-semibold text-destructive">
                    -${totalEgresos.toLocaleString('es-AR')}
                </p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Saldo Actual</p>
                <p className="text-md font-semibold text-green-600">
                    ${saldoActual.toLocaleString('es-AR')}
                </p>
            </div>
          </div>
          
          <Button onClick={handleOpenNewEgresoDialog} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Nuevo Egreso
          </Button>
          <TablaEgresosCaja egresos={cajaChicaActiva.egresos} onEditEgreso={handleOpenEditEgresoDialog} />
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Lock className="mr-2 h-4 w-4" /> Cerrar Caja Chica
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro de cerrar la caja chica?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción calculará el saldo final y archivará la caja. No podrá registrar más egresos en esta caja.
                  <br /> <br />
                  Monto Inicial: ${cajaChicaActiva.montoInicial.toLocaleString('es-AR')} <br />
                  Total Egresos: ${totalEgresos.toLocaleString('es-AR')} <br />
                  <strong>Saldo Final Estimado: ${saldoActual.toLocaleString('es-AR')}</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCloseCaja} className="bg-destructive hover:bg-destructive/90">
                  Confirmar Cierre
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      <EgresoDialog
        isOpen={isEgresoDialogOpen}
        onOpenChange={setIsEgresoDialogOpen}
        egresoToEdit={editingEgreso}
      />
    </div>
  );
}
