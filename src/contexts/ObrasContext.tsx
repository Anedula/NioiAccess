"use client";

import type { Obra, Role } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ObrasContextType {
  obras: Obra[];
  addObra: (obraData: Omit<Obra, 'id' | 'createdAt' | 'createdBy'>, creatorRole: Role) => void;
  getObraById: (id: string) => Obra | undefined;
  isLoading: boolean;
}

const ObrasContext = createContext<ObrasContextType | undefined>(undefined);

const OBRAS_STORAGE_KEY = 'grupoNioiObras';

export const ObrasProvider = ({ children }: { children: ReactNode }) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedObras = localStorage.getItem(OBRAS_STORAGE_KEY);
      if (storedObras) {
        setObras(JSON.parse(storedObras));
      }
    } catch (error) {
      console.error("Failed to access localStorage for obras:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las obras guardadas.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  const saveObras = (updatedObras: Obra[]) => {
    try {
      localStorage.setItem(OBRAS_STORAGE_KEY, JSON.stringify(updatedObras));
      setObras(updatedObras);
    } catch (error) {
      console.error("Failed to save obras to localStorage:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la obra.",
        variant: "destructive",
      });
    }
  };

  const addObra = (obraData: Omit<Obra, 'id' | 'createdAt' | 'createdBy'>, creatorRole: Role) => {
    const newObra: Obra = {
      ...obraData,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString(),
      createdBy: creatorRole,
    };
    const updatedObras = [...obras, newObra];
    saveObras(updatedObras);
    toast({
      title: "Éxito",
      description: "Nueva obra cargada correctamente.",
    });
  };

  const getObraById = (id: string): Obra | undefined => {
    return obras.find(obra => obra.id === id);
  };
  

  return (
    <ObrasContext.Provider value={{ obras, addObra, getObraById, isLoading }}>
      {children}
    </ObrasContext.Provider>
  );
};

export const useObras = (): ObrasContextType => {
  const context = useContext(ObrasContext);
  if (context === undefined) {
    throw new Error('useObras must be used within an ObrasProvider');
  }
  return context;
};
