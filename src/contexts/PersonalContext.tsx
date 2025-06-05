
"use client";

import type { Personal, Role } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PersonalContextType {
  personalList: Personal[];
  addPersonal: (personalData: Omit<Personal, 'id' | 'createdAt' | 'createdBy'>, creatorRole: Role) => void;
  updatePersonal: (id: string, personalData: Omit<Personal, 'id' | 'createdAt' | 'createdBy'>) => void;
  deletePersonal: (id: string) => void;
  getPersonalById: (id: string) => Personal | undefined;
  isLoading: boolean;
}

const PersonalContext = createContext<PersonalContextType | undefined>(undefined);

const PERSONAL_STORAGE_KEY = 'grupoNioiPersonal';

export const PersonalProvider = ({ children }: { children: ReactNode }) => {
  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedPersonal = localStorage.getItem(PERSONAL_STORAGE_KEY);
      if (storedPersonal) {
        // Ensure all fields, including new ones, have default values if missing from localStorage
        const parsedList = JSON.parse(storedPersonal) as Personal[];
        const migratedList = parsedList.map(p => ({
          ...p,
          estadoPersonal: p.estadoPersonal || 'Alta', // Default to 'Alta' if missing
          estadoCivil: p.estadoCivil || 'Soltero/a', // Default if missing
          ubicacionLaboral: p.ubicacionLaboral || (p as any).ubicacion || 'Oficina', // Handle potential old 'ubicacion' field
        }));
        setPersonalList(migratedList);
      }
    } catch (error) {
      console.error("Failed to access localStorage for personal list:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la nómina guardada.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  const savePersonalList = useCallback((updatedList: Personal[]) => {
    try {
      localStorage.setItem(PERSONAL_STORAGE_KEY, JSON.stringify(updatedList));
      setPersonalList(updatedList);
    } catch (error) {
      console.error("Failed to save personal list to localStorage:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el registro del personal.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addPersonal = (personalData: Omit<Personal, 'id' | 'createdAt' | 'createdBy'>, creatorRole: Role) => {
    const newPersonal: Personal = {
      ...personalData,
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      createdBy: creatorRole,
    };
    const updatedList = [...personalList, newPersonal];
    savePersonalList(updatedList);
  };

  const updatePersonal = (id: string, personalData: Omit<Personal, 'id' | 'createdAt' | 'createdBy'>) => {
    const personalIndex = personalList.findIndex(p => p.id === id);
    if (personalIndex === -1) {
      toast({ title: "Error", description: "Personal no encontrado para actualizar.", variant: "destructive" });
      return;
    }
    const existingPersonal = personalList[personalIndex];
    const updatedPersonal: Personal = {
      ...existingPersonal,
      ...personalData,
      // Ensure fechaBaja is explicitly set to undefined if estado is Alta and fechaBaja was provided
      fechaBaja: personalData.estadoPersonal === 'Alta' ? undefined : personalData.fechaBaja,
    };
    const updatedList = [...personalList];
    updatedList[personalIndex] = updatedPersonal;
    savePersonalList(updatedList);
  };

  const deletePersonal = (id: string) => {
    const updatedList = personalList.filter(p => p.id !== id);
    if (updatedList.length === personalList.length) {
        toast({ title: "Error", description: "No se encontró el personal a eliminar.", variant: "destructive" });
        return;
    }
    savePersonalList(updatedList);
    toast({ title: "Personal Eliminado", description: "El registro ha sido eliminado de la nómina."});
  };

  const getPersonalById = (id: string): Personal | undefined => {
    return personalList.find(p => p.id === id);
  };

  return (
    <PersonalContext.Provider value={{ personalList, addPersonal, updatePersonal, deletePersonal, getPersonalById, isLoading }}>
      {children}
    </PersonalContext.Provider>
  );
};

export const usePersonal = (): PersonalContextType => {
  const context = useContext(PersonalContext);
  if (context === undefined) {
    throw new Error('usePersonal must be used within a PersonalProvider');
  }
  return context;
};
