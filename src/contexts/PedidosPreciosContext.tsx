
"use client";

import type { PedidoPrecioItem, Role } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PedidosPreciosContextType {
  pedidosPrecios: PedidoPrecioItem[];
  addPedidoPrecioItem: (itemData: Omit<PedidoPrecioItem, 'id' | 'createdAt' | 'createdByOT' | 'lastUpdatedByCompras' | 'lastUpdatedAt'>, creatorRole: Role) => void;
  updatePedidoPrecioItemOT: (id: string, itemData: Partial<Pick<PedidoPrecioItem, 'descripcion' | 'unidad' | 'unidadPersonalizada' | 'cantidad' | 'obraDestinoId' | 'tipo'>>) => void;
  updatePedidoPrecioItemCompras: (id: string, itemData: Partial<Pick<PedidoPrecioItem, 'precioUnitarioARS' | 'precioUnitarioUSD' | 'presupuestoPdf'>>, updaterRole: Role) => void;
  deletePedidoPrecioItem: (id: string) => void; // Added for completeness, though not explicitly requested for UI yet
  getPedidoPrecioItemById: (id: string) => PedidoPrecioItem | undefined;
  isLoading: boolean;
}

const PedidosPreciosContext = createContext<PedidosPreciosContextType | undefined>(undefined);

const PEDIDOS_PRECIOS_STORAGE_KEY = 'grupoNioiPedidosPrecios';

export const PedidosPreciosProvider = ({ children }: { children: ReactNode }) => {
  const [pedidosPrecios, setPedidosPrecios] = useState<PedidoPrecioItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedPedidos = localStorage.getItem(PEDIDOS_PRECIOS_STORAGE_KEY);
      if (storedPedidos) {
        setPedidosPrecios(JSON.parse(storedPedidos));
      }
    } catch (error) {
      console.error("Failed to access localStorage for pedidosPrecios:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos de precios guardados.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  const savePedidosPrecios = useCallback((updatedPedidos: PedidoPrecioItem[]) => {
    try {
      localStorage.setItem(PEDIDOS_PRECIOS_STORAGE_KEY, JSON.stringify(updatedPedidos));
      setPedidosPrecios(updatedPedidos);
    } catch (error) {
      console.error("Failed to save pedidosPrecios to localStorage:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el pedido de precios.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addPedidoPrecioItem = (itemData: Omit<PedidoPrecioItem, 'id' | 'createdAt' | 'createdByOT' | 'lastUpdatedByCompras' | 'lastUpdatedAt'>, creatorRole: Role) => {
    if (creatorRole !== "Oficina Técnica") {
        toast({ title: "Error de Permiso", description: "Solo Oficina Técnica puede crear pedidos de precios.", variant: "destructive" });
        return;
    }
    const newItem: PedidoPrecioItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdByOT: creatorRole, // Should always be "Oficina Técnica"
    };
    const updatedPedidos = [...pedidosPrecios, newItem];
    savePedidosPrecios(updatedPedidos);
    toast({ title: "Solicitud Añadida", description: `El ítem "${itemData.descripcion}" ha sido añadido.` });
  };

  const updatePedidoPrecioItemOT = (id: string, itemData: Partial<Pick<PedidoPrecioItem, 'descripcion' | 'unidad' | 'unidadPersonalizada' | 'cantidad' | 'obraDestinoId' | 'tipo'>>) => {
    const itemIndex = pedidosPrecios.findIndex(p => p.id === id);
    if (itemIndex === -1) {
      toast({ title: "Error", description: "Ítem no encontrado para actualizar.", variant: "destructive" });
      return;
    }
    const updatedPedidos = [...pedidosPrecios];
    updatedPedidos[itemIndex] = { ...updatedPedidos[itemIndex], ...itemData };
    // Ensure unidadPersonalizada is cleared if unidad is not 'otro'
    if (itemData.unidad && itemData.unidad !== 'otro') {
      updatedPedidos[itemIndex].unidadPersonalizada = undefined;
    }
    savePedidosPrecios(updatedPedidos);
    toast({ title: "Solicitud Actualizada", description: "Los detalles de la solicitud han sido actualizados por Oficina Técnica." });
  };
  
  const updatePedidoPrecioItemCompras = (id: string, itemData: Partial<Pick<PedidoPrecioItem, 'precioUnitarioARS' | 'precioUnitarioUSD' | 'presupuestoPdf'>>, updaterRole: Role) => {
    if (updaterRole !== "Compras") {
        toast({ title: "Error de Permiso", description: "Solo Compras puede actualizar precios y presupuestos.", variant: "destructive" });
        return;
    }
    const itemIndex = pedidosPrecios.findIndex(p => p.id === id);
    if (itemIndex === -1) {
      toast({ title: "Error", description: "Ítem no encontrado para actualizar.", variant: "destructive" });
      return;
    }
    const updatedPedidos = [...pedidosPrecios];
    updatedPedidos[itemIndex] = { 
        ...updatedPedidos[itemIndex], 
        ...itemData,
        lastUpdatedByCompras: updaterRole,
        lastUpdatedAt: new Date().toISOString()
    };
    savePedidosPrecios(updatedPedidos);
    toast({ title: "Precios Actualizados", description: "Los precios y/o presupuesto han sido actualizados por Compras." });
  };

  const deletePedidoPrecioItem = (id: string) => {
    const updatedPedidos = pedidosPrecios.filter(p => p.id !== id);
    savePedidosPrecios(updatedPedidos);
    toast({ title: "Solicitud Eliminada", description: "La solicitud de precio ha sido eliminada." });
  };

  const getPedidoPrecioItemById = (id: string): PedidoPrecioItem | undefined => {
    return pedidosPrecios.find(p => p.id === id);
  };

  return (
    <PedidosPreciosContext.Provider value={{ pedidosPrecios, addPedidoPrecioItem, updatePedidoPrecioItemOT, updatePedidoPrecioItemCompras, deletePedidoPrecioItem, getPedidoPrecioItemById, isLoading }}>
      {children}
    </PedidosPreciosContext.Provider>
  );
};

export const usePedidosPrecios = (): PedidosPreciosContextType => {
  const context = useContext(PedidosPreciosContext);
  if (context === undefined) {
    throw new Error('usePedidosPrecios must be used within a PedidosPreciosProvider');
  }
  return context;
};

