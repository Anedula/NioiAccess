
"use client";

import type { RegistroAsistencia, Role, EstadoAsistencia } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AsistenciaContextType {
  asistencias: RegistroAsistencia[];
  addOrUpdateAsistencia: (
    personalId: string,
    fecha: string, // YYYY-MM-DD
    estado: EstadoAsistencia,
    registradoPor: Role
  ) => void;
  getAsistenciaPorFechaYPersonal: (personalId: string, fecha: string) => RegistroAsistencia | undefined;
  getAsistenciasPorFecha: (fecha: string) => RegistroAsistencia[];
  isLoading: boolean;
}

const AsistenciaContext = createContext<AsistenciaContextType | undefined>(undefined);

const ASISTENCIA_STORAGE_KEY = 'grupoNioiAsistencias';

export const AsistenciaProvider = ({ children }: { children: ReactNode }) => {
  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedAsistencias = localStorage.getItem(ASISTENCIA_STORAGE_KEY);
      if (storedAsistencias) {
        setAsistencias(JSON.parse(storedAsistencias));
      }
    } catch (error) {
      console.error("Failed to access localStorage for asistencias:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de asistencia.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  const saveAsistencias = (updatedAsistencias: RegistroAsistencia[]) => {
    try {
      localStorage.setItem(ASISTENCIA_STORAGE_KEY, JSON.stringify(updatedAsistencias));
      setAsistencias(updatedAsistencias);
    } catch (error) {
      console.error("Failed to save asistencias to localStorage:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el registro de asistencia.",
        variant: "destructive",
      });
    }
  };

  const addOrUpdateAsistencia = (
    personalId: string,
    fecha: string,
    estado: EstadoAsistencia,
    registradoPor: Role
  ) => {
    const existingIndex = asistencias.findIndex(a => a.personalId === personalId && a.fecha === fecha);
    let updatedAsistencias = [...asistencias];

    if (existingIndex > -1) {
      // Update existing record
      const updatedRecord = {
        ...updatedAsistencias[existingIndex],
        estado,
        registradoPor,
        registradoAt: new Date().toISOString(),
      };
      updatedAsistencias[existingIndex] = updatedRecord;
    } else {
      // Add new record
      const newRecord: RegistroAsistencia = {
        id: Date.now().toString(), // Simple ID
        personalId,
        fecha,
        estado,
        registradoPor,
        registradoAt: new Date().toISOString(),
      };
      updatedAsistencias.push(newRecord);
    }
    saveAsistencias(updatedAsistencias);
  };

  const getAsistenciaPorFechaYPersonal = (personalId: string, fecha: string): RegistroAsistencia | undefined => {
    return asistencias.find(a => a.personalId === personalId && a.fecha === fecha);
  };

  const getAsistenciasPorFecha = (fecha: string): RegistroAsistencia[] => {
    return asistencias.filter(a => a.fecha === fecha);
  };


  return (
    <AsistenciaContext.Provider value={{ asistencias, addOrUpdateAsistencia, getAsistenciaPorFechaYPersonal, getAsistenciasPorFecha, isLoading }}>
      {children}
    </AsistenciaContext.Provider>
  );
};

export const useAsistencia = (): AsistenciaContextType => {
  const context = useContext(AsistenciaContext);
  if (context === undefined) {
    throw new Error('useAsistencia must be used within an AsistenciaProvider');
  }
  return context;
};
