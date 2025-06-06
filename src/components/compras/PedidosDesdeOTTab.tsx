
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePedidosPrecios } from '@/contexts/PedidosPreciosContext';
import PedidosPreciosTable from '@/components/oficina-tecnica/pedidos-precios/PedidosPreciosTable'; // Re-using this table
import PedidoPrecioDialog from '@/components/oficina-tecnica/pedidos-precios/PedidoPrecioDialog'; // Re-using this dialog
import type { PedidoPrecioItem } from '@/lib/types';

export default function PedidosDesdeOTTab() {
  const { pedidosPrecios, isLoading } = usePedidosPrecios();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PedidoPrecioItem | null>(null);

  const handleEdit = (item: PedidoPrecioItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const overallStatus = useMemo(() => {
    if (isLoading || pedidosPrecios.length === 0) return "Pendiente";
    
    const allPriced = pedidosPrecios.every(item => 
      item.precioUnitarioARS !== undefined && item.precioUnitarioARS > 0 &&
      item.precioUnitarioUSD !== undefined && item.precioUnitarioUSD > 0
    );
    return allPriced ? "Actualizada" : "Pendiente";
  }, [pedidosPrecios, isLoading]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline text-primary">Área de Compras</CardTitle>
            <CardDescription>
              Pedidos de Precios desde Oficina Técnica. Revise, complete precios y adjunte presupuestos.
            </CardDescription>
          </div>
          <Badge variant={overallStatus === "Actualizada" ? "default" : "destructive"} className={overallStatus === "Actualizada" ? "bg-green-500 hover:bg-green-600 text-white" : "text-white"}>
            {overallStatus}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <PedidosPreciosTable onEdit={handleEdit} />
        </CardContent>
      </Card>

      <PedidoPrecioDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        itemToEdit={editingItem}
      />
    </div>
  );
}

