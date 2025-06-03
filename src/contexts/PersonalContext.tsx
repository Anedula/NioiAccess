
"use client";

import type { Personal, Role } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PersonalContextType {
  personalList: Personal[];
  addPersonal: (personalData: Omit<Personal, 'id' | 'createdAt' | 'createdBy'>, creatorRole: Role) => void;
  updatePersonal: (id: string, personalData: Omit<Personal, 'id' | 'createdAt' | 'createdBy'>) => void;
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
        setPersonalList(JSON.parse(storedPersonal));
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

  const savePersonalList = (updatedList: Personal[]) => {
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
  };

  const addPersonal = (personalData: Omit<Personal, 'id' | 'createdAt' | 'createdBy'>, creatorRole: Role) => {
    const newPersonal: Personal = {
      ...personalData,
      id: Date.now().toString(), // Simple ID generation
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
    };
    const updatedList = [...personalList];
    updatedList[personalIndex] = updatedPersonal;
    savePersonalList(updatedList);
  };

  const getPersonalById = (id: string): Personal | undefined => {
    return personalList.find(p => p.id === id);
  };

  return (
    <PersonalContext.Provider value={{ personalList, addPersonal, updatePersonal, getPersonalById, isLoading }}>
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
