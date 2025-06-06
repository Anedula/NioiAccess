
"use client";

import React from 'react';
import type { EgresoCajaChica } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCajaChica } from '@/contexts/CajaChicaContext';
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
import { ScrollArea } from '@/components/ui/scroll-area';


interface TablaEgresosCajaProps {
  egresos: EgresoCajaChica[];
  onEditEgreso: (egreso: EgresoCajaChica) => void;
}

export default function TablaEgresosCaja({ egresos, onEditEgreso }: TablaEgresosCajaProps) {
  const { eliminarEgreso } = useCajaChica();
  const [egresoToDeleteId, setEgresoToDeleteId] = React.useState<string | null>(null);


  const handleDeleteEgreso = (id: string) => {
    setEgresoToDeleteId(id);
  };
  
  const confirmDelete = () => {
    if (egresoToDeleteId) {
        eliminarEgreso(egresoToDeleteId);
    }
    setEgresoToDeleteId(null); // This will also trigger onOpenChange from AlertDialog root
  };


  if (egresos.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No hay egresos registrados para esta caja chica.</p>;
  }
  
  const sortedEgresos = [...egresos].sort((a,b) => parseISO(b.fecha).getTime() - parseISO(a.fecha).getTime());

  return (
    <AlertDialog open={!!egresoToDeleteId} onOpenChange={(open) => { if (!open) setEgresoToDeleteId(null); }}>
      <ScrollArea className="h-[300px] w-full border rounded-md">
        <Table>
          <TableCaption>Listado de egresos de la caja chica activa.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Fecha</TableHead>
              <TableHead>Tipo de Gasto</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead className="text-right w-[100px]">Monto (ARS)</TableHead>
              <TableHead className="text-center w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEgresos.map((egreso) => (
              <TableRow key={egreso.id}>
                <TableCell>{format(parseISO(egreso.fecha), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell>{egreso.tipoGasto}</TableCell>
                <TableCell className="truncate max-w-xs">{egreso.detalleGasto || '-'}</TableCell>
                <TableCell className="text-right">${egreso.monto.toLocaleString('es-AR')}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" onClick={() => onEditEgreso(egreso)} title="Editar Egreso">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEgreso(egreso.id)} title="Eliminar Egreso">
                          <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                  </AlertDialogTrigger>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro de eliminar este egreso?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El egreso se eliminará permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setEgresoToDeleteId(null)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
            Eliminar Egreso
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
