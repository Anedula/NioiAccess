
"use client";

import type { CajaChica, EgresoCajaChica, Role, TipoGastoCajaChica } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface CajaChicaContextType {
  cajaChicaActiva: CajaChica | null;
  cajasChicasArchivadas: CajaChica[];
  abrirCaja: (fechaApertura: Date, montoInicial: number, createdBy: Role) => boolean;
  agregarEgreso: (egresoData: Omit<EgresoCajaChica, 'id'>) => boolean;
  editarEgreso: (idEgreso: string, egresoData: Omit<EgresoCajaChica, 'id'>) => boolean;
  eliminarEgreso: (idEgreso: string) => boolean;
  cerrarCaja: (closedBy: Role) => boolean;
  isLoading: boolean;
}

const CajaChicaContext = createContext<CajaChicaContextType | undefined>(undefined);

const CAJA_CHICA_ACTIVA_STORAGE_KEY = 'grupoNioiCajaChicaActiva';
const CAJAS_CHICAS_ARCHIVADAS_STORAGE_KEY = 'grupoNioiCajasChicasArchivadas';

export const CajaChicaProvider = ({ children }: { children: ReactNode }) => {
  const [cajaChicaActiva, setCajaChicaActiva] = useState<CajaChica | null>(null);
  const [cajasChicasArchivadas, setCajasChicasArchivadas] = useState<CajaChica[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedActiva = localStorage.getItem(CAJA_CHICA_ACTIVA_STORAGE_KEY);
      if (storedActiva) {
        setCajaChicaActiva(JSON.parse(storedActiva));
      }
      const storedArchivadas = localStorage.getItem(CAJAS_CHICAS_ARCHIVADAS_STORAGE_KEY);
      if (storedArchivadas) {
        setCajasChicasArchivadas(JSON.parse(storedArchivadas));
      }
    } catch (error) {
      console.error("Failed to access localStorage for Caja Chica:", error);
      toast({
        title: "Error de Carga",
        description: "No se pudieron cargar los datos de la caja chica.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  const saveCajaChicaActiva = useCallback((caja: CajaChica | null) => {
    try {
      if (caja) {
        localStorage.setItem(CAJA_CHICA_ACTIVA_STORAGE_KEY, JSON.stringify(caja));
      } else {
        localStorage.removeItem(CAJA_CHICA_ACTIVA_STORAGE_KEY);
      }
      setCajaChicaActiva(caja);
    } catch (error) {
      console.error("Failed to save active Caja Chica:", error);
      toast({ title: "Error al Guardar", description: "No se pudo guardar la caja chica activa.", variant: "destructive" });
    }
  }, [toast]);

  const saveCajasChicasArchivadas = useCallback((cajas: CajaChica[]) => {
    try {
      localStorage.setItem(CAJAS_CHICAS_ARCHIVADAS_STORAGE_KEY, JSON.stringify(cajas));
      setCajasChicasArchivadas(cajas);
    } catch (error) {
      console.error("Failed to save archived Caja Chica:", error);
      toast({ title: "Error al Archivar", description: "No se pudieron archivar las cajas chicas.", variant: "destructive" });
    }
  }, [toast]);

  const abrirCaja = (fechaApertura: Date, montoInicial: number, createdBy: Role): boolean => {
    if (cajaChicaActiva) {
      toast({ title: "Error", description: "Ya existe una caja chica activa. Ciérrela para abrir una nueva.", variant: "destructive" });
      return false;
    }
    const nuevaCaja: CajaChica = {
      id: `caja-${Date.now().toString()}`,
      fechaApertura: format(fechaApertura, 'yyyy-MM-dd'),
      montoInicial,
      egresos: [],
      createdBy,
      createdAt: new Date().toISOString(),
    };
    saveCajaChicaActiva(nuevaCaja);
    toast({ title: "Caja Chica Abierta", description: `Caja abierta con un monto inicial de $${montoInicial.toLocaleString('es-AR')}.` });
    return true;
  };

  const agregarEgreso = (egresoData: Omit<EgresoCajaChica, 'id'>): boolean => {
    if (!cajaChicaActiva) {
      toast({ title: "Error", description: "No hay una caja chica activa para registrar egresos.", variant: "destructive" });
      return false;
    }
    const nuevoEgreso: EgresoCajaChica = {
      ...egresoData,
      id: `egreso-${Date.now().toString()}`,
    };
    const cajaActualizada = { ...cajaChicaActiva, egresos: [...cajaChicaActiva.egresos, nuevoEgreso] };
    saveCajaChicaActiva(cajaActualizada);
    toast({ title: "Egreso Registrado", description: `Egreso de $${nuevoEgreso.monto.toLocaleString('es-AR')} registrado.` });
    return true;
  };
  
  const editarEgreso = (idEgreso: string, egresoData: Omit<EgresoCajaChica, 'id'>): boolean => {
    if (!cajaChicaActiva) {
        toast({ title: "Error", description: "No hay una caja chica activa.", variant: "destructive" });
        return false;
    }
    const egresoIndex = cajaChicaActiva.egresos.findIndex(e => e.id === idEgreso);
    if (egresoIndex === -1) {
        toast({ title: "Error", description: "Egreso no encontrado para editar.", variant: "destructive" });
        return false;
    }
    const egresosActualizados = [...cajaChicaActiva.egresos];
    egresosActualizados[egresoIndex] = { ...egresosActualizados[egresoIndex], ...egresoData };
    
    const cajaActualizada = { ...cajaChicaActiva, egresos: egresosActualizados };
    saveCajaChicaActiva(cajaActualizada);
    toast({ title: "Egreso Actualizado", description: `El egreso ha sido modificado.` });
    return true;
  };

  const eliminarEgreso = (idEgreso: string): boolean => {
    if (!cajaChicaActiva) {
        toast({ title: "Error", description: "No hay una caja chica activa.", variant: "destructive" });
        return false;
    }
    const egresosFiltrados = cajaChicaActiva.egresos.filter(e => e.id !== idEgreso);
    if (egresosFiltrados.length === cajaChicaActiva.egresos.length) {
        toast({ title: "Error", description: "Egreso no encontrado para eliminar.", variant: "destructive" });
        return false;
    }
    const cajaActualizada = { ...cajaChicaActiva, egresos: egresosFiltrados };
    saveCajaChicaActiva(cajaActualizada);
    toast({ title: "Egreso Eliminado", description: `El egreso ha sido eliminado.` });
    return true;
  };

  const cerrarCaja = (closedBy: Role): boolean => {
    if (!cajaChicaActiva) {
      toast({ title: "Error", description: "No hay una caja chica activa para cerrar.", variant: "destructive" });
      return false;
    }
    const totalEgresos = cajaChicaActiva.egresos.reduce((sum, egreso) => sum + egreso.monto, 0);
    const saldoFinal = cajaChicaActiva.montoInicial - totalEgresos;
    const cajaCerrada: CajaChica = {
      ...cajaChicaActiva,
      fechaCierre: format(new Date(), 'yyyy-MM-dd'),
      totalEgresos,
      saldoFinal,
      closedBy,
      closedAt: new Date().toISOString(),
    };
    saveCajasChicasArchivadas([...cajasChicasArchivadas, cajaCerrada].sort((a, b) => parseISO(b.fechaApertura).getTime() - parseISO(a.fechaApertura).getTime()));
    saveCajaChicaActiva(null);
    toast({ title: "Caja Chica Cerrada", description: `Caja cerrada con un saldo final de $${saldoFinal.toLocaleString('es-AR')}.` });
    return true;
  };

  return (
    <CajaChicaContext.Provider value={{ cajaChicaActiva, cajasChicasArchivadas, abrirCaja, agregarEgreso, editarEgreso, eliminarEgreso, cerrarCaja, isLoading }}>
      {children}
    </CajaChicaContext.Provider>
  );
};

export const useCajaChica = (): CajaChicaContextType => {
  const context = useContext(CajaChicaContext);
  if (context === undefined) {
    throw new Error('useCajaChica must be used within a CajaChicaProvider');
  }
  return context;
};
