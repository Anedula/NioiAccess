
"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import FormularioEgresoCaja, { type EgresoFormValues } from './FormularioEgresoCaja';
import { useCajaChica } from '@/contexts/CajaChicaContext';
import type { EgresoCajaChica } from '@/lib/types';
import { format, parseISO } from 'date-fns';


interface EgresoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  egresoToEdit?: EgresoCajaChica | null;
}

export default function EgresoDialog({ isOpen, onOpenChange, egresoToEdit }: EgresoDialogProps) {
  const { agregarEgreso, editarEgreso } = useCajaChica();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create a memoized version of defaultValues to prevent unnecessary re-renders of FormularioEgresoCaja
  const dialogDefaultValues = React.useMemo(() => {
    if (egresoToEdit) {
      return {
        ...egresoToEdit,
        fecha: parseISO(egresoToEdit.fecha), // Convert ISO string to Date object
      };
    }
    return undefined;
  }, [egresoToEdit]);


  const handleFormSubmit = (data: EgresoFormValues) => {
    setIsSubmitting(true);
    const formattedData = {
        ...data,
        fecha: format(data.fecha, 'yyyy-MM-dd'), // Format Date object to ISO string
    };

    let success = false;
    if (egresoToEdit) {
      success = editarEgreso(egresoToEdit.id, formattedData);
    } else {
      success = agregarEgreso(formattedData);
    }
    
    if (success) {
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">{egresoToEdit ? 'Editar Egreso' : 'Registrar Nuevo Egreso'}</DialogTitle>
          <DialogDescription>
            {egresoToEdit ? 'Modifique los detalles del egreso.' : 'Complete los datos para un nuevo egreso de la caja chica.'}
          </DialogDescription>
        </DialogHeader>
        
        <FormularioEgresoCaja
            onSubmitEgreso={handleFormSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            defaultValues={dialogDefaultValues}
        />

      </DialogContent>
    </Dialog>
  );
}
