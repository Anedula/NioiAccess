
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePedidosPrecios } from '@/contexts/PedidosPreciosContext';
import PedidosPreciosTable from './PedidosPreciosTable';
import PedidoPrecioDialog from './PedidoPrecioDialog';
import type { PedidoPrecioItem } from '@/lib/types';

export default function PedidosPreciosTab() {
  const { userRole } = useAuth();
  const { pedidosPrecios, isLoading } = usePedidosPrecios();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PedidoPrecioItem | null>(null);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

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
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-headline text-primary">Pedido de Precios a Compras</CardTitle>
            <CardDescription>
              Solicite precios para ítems de obras. Gestione el flujo con el departamento de Compras.
            </CardDescription>
          </div>
          <Badge variant={overallStatus === "Actualizada" ? "default" : "destructive"} className={overallStatus === "Actualizada" ? "bg-green-500 hover:bg-green-600" : ""}>
            {overallStatus}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {userRole === 'Oficina Técnica' && (
            <Button onClick={handleAddNew} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Nueva Solicitud de Precio
            </Button>
          )}
          {userRole !== 'Oficina Técnica' && userRole !== 'Compras' && (
            <p className="text-muted-foreground">
              Visualizando pedidos de precios. Para crear o editar, contacte a Oficina Técnica o Compras.
            </p>
          )}
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

