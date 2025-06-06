
"use client";

import React from 'react';
import type { PedidoPrecioItem, Role } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Download, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useObras } from '@/contexts/ObrasContext';
import { usePedidosPrecios } from '@/contexts/PedidosPreciosContext';
import { useToast } from '@/hooks/use-toast';

interface PedidosPreciosTableProps {
  onEdit: (item: PedidoPrecioItem) => void;
}

export default function PedidosPreciosTable({ onEdit }: PedidosPreciosTableProps) {
  const { userRole } = useAuth();
  const { obras } = useObras(); // To get obra names
  const { pedidosPrecios, isLoading, deletePedidoPrecioItem } = usePedidosPrecios();
  const { toast } = useToast();


  const getObraName = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    return obra ? obra.nombre_obra : 'N/A';
  };
  
  const handleDownloadPdf = (fileName?: string) => {
    if (fileName) {
      // In a real app, this would trigger a download. For now, an alert.
      alert(`Simulando descarga de: ${fileName}`);
    } else {
      toast({ title: "Información", description: "No hay archivo PDF para este ítem.", variant: "default"});
    }
  };

  const handleDelete = (itemId: string) => {
     if (userRole === "Oficina Técnica" || userRole === "Compras") { // Or specific admin role
        deletePedidoPrecioItem(itemId);
     } else {
        toast({title: "Permiso Denegado", description: "No tiene permisos para eliminar esta solicitud.", variant: "destructive"});
     }
  };


  if (isLoading) {
    return <p>Cargando pedidos de precios...</p>;
  }

  const canEditAnyField = userRole === 'Oficina Técnica' || userRole === 'Compras';

  return (
    <div className="border rounded-lg shadow-sm">
      <Table>
        <TableCaption>
          {pedidosPrecios.length === 0 ? 'No hay pedidos de precios cargados.' : `Total de pedidos: ${pedidosPrecios.length}`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Descripción</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Cant.</TableHead>
            <TableHead>Obra Destino</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Precio ARS</TableHead>
            <TableHead className="text-right">Precio USD</TableHead>
            <TableHead className="text-center">Presup. PDF</TableHead>
            {canEditAnyField && <TableHead className="text-center">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pedidosPrecios.length > 0 ? (
            pedidosPrecios.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.descripcion}</TableCell>
                <TableCell>{item.unidad === 'otro' ? item.unidadPersonalizada : item.unidad}</TableCell>
                <TableCell>{item.cantidad}</TableCell>
                <TableCell>{getObraName(item.obraDestinoId)}</TableCell>
                <TableCell><Badge variant="outline">{item.tipo}</Badge></TableCell>
                <TableCell className="text-right">
                  {userRole === 'Oficina Técnica' ? 'N/V' : (item.precioUnitarioARS ? `$${item.precioUnitarioARS.toLocaleString('es-AR')}` : '-')}
                </TableCell>
                <TableCell className="text-right">
                  {userRole === 'Oficina Técnica' ? 'N/V' : (item.precioUnitarioUSD ? `US$${item.precioUnitarioUSD.toLocaleString('en-US')}` : '-')}
                </TableCell>
                <TableCell className="text-center">
                  {userRole === 'Oficina Técnica' ? 'N/V' : (
                    item.presupuestoPdf ? (
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(item.presupuestoPdf)} title={item.presupuestoPdf}>
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : '-'
                  )}
                </TableCell>
                {canEditAnyField && (
                  <TableCell className="text-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)} title="Editar Solicitud">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {(userRole === 'Oficina Técnica' || userRole === 'Compras') && ( // Example: OT can delete their items, Compras can delete any before prices? Or specific logic
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Eliminar Solicitud">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={canEditAnyField ? 9 : 8} className="text-center h-24">
                No hay solicitudes de precio.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
